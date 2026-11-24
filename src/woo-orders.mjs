// WooCommerce one-click order tracking (docs/order-tracking.md). A store that
// approved our read-only key (netlify/functions/woo-connect.mjs) has its
// recent orders read once a day; only orders Heart of Columbus sent are kept:
//   - attributed: WooCommerce's own order attribution says utm_source is
//     heartofcolumbus (when the store's REST API exposes that meta), or
//   - matched: the order holds exactly the products of a cart we handed to
//     that store in the 48 hours before it (our cart log keeps product ids,
//     never anything about the shopper).
// Kept per order: number, total, currency, item count, status, whether it
// is fulfilled (completed), and the cart it matched. No customer details.
import { open } from './vault.mjs';

const DAY = 864e5;

export function matchCart(order, carts) {
  const t = Date.parse(order.date_created_gmt ? order.date_created_gmt + 'Z' : order.date_created || '');
  const ids = new Set((order.line_items || []).flatMap((l) => [String(l.variation_id || ''), String(l.product_id || '')]).filter((x) => x && x !== '0'));
  let best = null;
  for (const c of carts || []) {
    if (!c.ids || !c.ids.length) continue;
    const at = Date.parse(c.at);
    if (!(t >= at && t - at <= 2 * DAY)) continue;
    if (c.ids.every((id) => ids.has(String(id))) && (!best || at > Date.parse(best.at))) best = c;
  }
  return best;
}

export const attributed = (order) => (order.meta_data || []).some((m) => m && m.key === '_wc_order_attribution_utm_source' && String(m.value).toLowerCase() === 'heartofcolumbus');

// One store: read orders from the last `days`, keep ours, update statuses.
export async function syncStore({ blobs, slug, origin, creds, get, now = new Date(), days = 30 }) {
  const { key, secret } = creds;
  const auth = 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64');
  const after = new Date(now.getTime() - days * DAY).toISOString();
  const months = [...new Set([0, 1].map((i) => new Date(now.getFullYear(), now.getMonth() - i, 15).toISOString().slice(0, 7)))];
  const carts = (await Promise.all(months.map((m) => blobs.getJSON(`h/${m}/${slug}`)))).flatMap((h) => (h && h.carts) || []);
  let kept = 0, read = 0;
  for (let page = 1; page <= 10; page++) {
    const orders = await get(`${origin.replace(/\/+$/, '')}/wp-json/wc/v3/orders?after=${encodeURIComponent(after)}&per_page=100&page=${page}&orderby=date&order=asc`, auth);
    if (!Array.isArray(orders)) return { ok: false, read, kept, error: 'Their store did not answer with orders.' };
    read += orders.length;
    for (const o of orders) {
      const cart = matchCart(o, carts);
      if (!cart && !attributed(o)) continue;
      const m = String(o.date_created_gmt || o.date_created || now.toISOString()).slice(0, 7);
      const k = `c/${m}/${slug}`;
      const rec = (await blobs.getJSON(k)) || { slug, month: m, orders: [] };
      const row = { order: String(o.number || o.id), total: Number(o.total) || 0, currency: String(o.currency || 'USD').slice(0, 3), items: (o.line_items || []).reduce((n, l) => n + (Number(l.quantity) || 0), 0), status: String(o.status || ''), fulfilled: o.status === 'completed', click: cart ? cart.click : '', via: 'woo-connect', at: String(o.date_created_gmt || o.date_created || '') };
      const i = rec.orders.findIndex((x) => x.order === row.order);
      if (i === -1) rec.orders.push(row); else rec.orders[i] = { ...rec.orders[i], ...row, click: rec.orders[i].click || row.click };
      await blobs.setJSON(k, rec);
      const index = (await blobs.getJSON(`c/${m}/index`)) || [];
      if (!index.includes(slug)) { index.push(slug); await blobs.setJSON(`c/${m}/index`, index); }
      kept++;
    }
    if (orders.length < 100) break;
  }
  return { ok: true, read, kept };
}

// Every connected store. `get(url, auth)` returns parsed JSON or null.
export async function syncAll({ blobs, get, now = new Date(), secret }) {
  const index = (await blobs.getJSON('woo/index')) || [];
  const out = {};
  for (const slug of index) {
    const rec = await blobs.getJSON(`woo/${slug}`);
    if (!rec) continue;
    try {
      const creds = { key: open(rec.key, secret), secret: open(rec.secret, secret) };
      out[slug] = await syncStore({ blobs, slug, origin: rec.origin, creds, get, now });
      rec.lastSync = now.toISOString();
      rec.lastResult = out[slug];
      await blobs.setJSON(`woo/${slug}`, rec);
    } catch (e) {
      out[slug] = { ok: false, error: 'Could not read their orders.' };
    }
  }
  return out;
}

// /api/handoff: step 1 of order tracking (docs/order-tracking.md).
//
// POST (a beacon from the site, text/plain JSON) counts one handoff: someone
// left Heart of Columbus for a business's own checkout, ordering, booking or
// shop page. Kept: the business slug, the kind, and for a cart the number of
// items and the cart total. Nothing about the person: no IP address, no
// browser, no cookie. Counts live in Netlify Blobs, one record per business
// per month (h/<YYYY-MM>/<slug>) and a list of who had any that month.
//
// GET, with the admin key in the x-hoc-key header, returns a month's report:
// every business's handoffs, the confirmed orders its owner's snippet sent
// to /api/conversion (step 2), and its tracking key to hand to the owner.
import { getStore } from '@netlify/blobs';
import { blobStore } from '../../src/blobs.mjs';
import { pixelKey, sameKey } from '../../src/pixel-key.mjs';
import { COMMERCE } from '../../src/data/commerce.mjs';
const SITE = (process.env.HOC_ORIGIN || 'https://heartofcolumbus.netlify.app').replace(/\/+$/, '');
const connectLink = (slug) => (COMMERCE[slug] && COMMERCE[slug].platform === 'woocommerce' ? `${SITE}/api/woo-connect?b=${slug}` : '');

export const config = { path: '/api/handoff' };
const KINDS = new Set(['cart', 'product', 'order', 'book', 'shop', 'website', 'gift']);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const month = (d = new Date()) => d.toISOString().slice(0, 7);
const num = (v, max) => Math.max(0, Math.min(max, Number(v) || 0));

export async function count(store, b, now = new Date()) {
  const slug = String(b.slug || '');
  const kind = String(b.kind || '');
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug) || !KINDS.has(kind)) return false;
  const m = month(now);
  const key = `h/${m}/${slug}`;
  const rec = (await store.getJSON(key)) || { slug, month: m };
  rec[kind] = (rec[kind] || 0) + 1;
  if (kind === 'cart') {
    rec.cartItems = (rec.cartItems || 0) + num(b.items, 200);
    rec.cartValue = Math.round(((rec.cartValue || 0) + num(b.total, 20000)) * 100) / 100;
    // The cart's visit id, so a confirmed order can be matched to the exact
    // cart we sent (reconciliation). The last 300 carts a month are kept.
    const click = String(b.click || '').replace(/[^a-z0-9]/gi, '').slice(0, 24);
    const ids = (Array.isArray(b.ids) ? b.ids : []).map((x) => String(x).replace(/\D/g, '')).filter(Boolean).slice(0, 30);
    if (click) rec.carts = [...(rec.carts || []), { click, ids, items: num(b.items, 200), total: Math.round(num(b.total, 20000) * 100) / 100, at: now.toISOString() }].slice(-300);
  }
  rec.last = now.toISOString();
  await store.setJSON(key, rec);
  const index = (await store.getJSON(`h/${m}/index`)) || [];
  if (!index.includes(slug)) { index.push(slug); await store.setJSON(`h/${m}/index`, index); }
  return true;
}

async function shopifyOrders(month) {
  const store = getStore('shopify-orders');
  const latest = new Map();
  for await (const { blobs } of store.list({ prefix: `${month}/`, paginate: true })) {
    for (let i = 0; i < blobs.length; i += 20) {
      const rows = await Promise.all(blobs.slice(i, i + 20).map(({ key }) => store.get(key, { type: 'json' })));
      for (const row of rows) {
        if (!row) continue;
        const previous = latest.get(row.order);
        if (!previous || row.updated > previous.updated ||
            (row.updated === previous.updated && row.triggered > previous.triggered)) {
          latest.set(row.order, row);
        }
      }
    }
  }
  return [...latest.values()];
}

export async function report(store, m, shopify = []) {
  const slugs = new Set([...((await store.getJSON(`h/${m}/index`)) || []), ...((await store.getJSON(`c/${m}/index`)) || []), ...shopify.map((order) => order.slug)]);
  const rows = await Promise.all([...slugs].map(async (slug) => {
    const h = (await store.getJSON(`h/${m}/${slug}`)) || {};
    const c = (await store.getJSON(`c/${m}/${slug}`)) || { orders: [] };
    const synced = shopify.filter((order) => order.slug === slug);
    // The existing pixel endpoint strips slashes from Shopify GraphQL IDs.
    const syncedIds = new Set(synced.flatMap(({ order }) => [order.split('/').at(-1), order.replaceAll('/', '')]));
    const orders = [...(c.orders || []).filter((order) => order.via !== 'shopify' || !syncedIds.has(order.order)), ...synced]
      .sort((a, b) => String(a.at || '').localeCompare(String(b.at || '')));
    const sent = new Set((h.carts || []).map((x) => x.click));
    const matched = orders.filter((o) => o.click && sent.has(o.click)).length;
    return { slug, handoffs: { ...h, carts: undefined }, matched, fulfilled: orders.filter((o) => o.fulfilled).length, orders: orders.length, orderValue: Math.round(orders.reduce((a, o) => a + (Number(o.total) || 0), 0) * 100) / 100, recent: orders.slice(-5) };
  }));
  return rows.sort((a, b) => (b.orderValue - a.orderValue) || ((b.handoffs.cartValue || 0) - (a.handoffs.cartValue || 0)));
}

export default async (req) => {
  const store = blobStore('tracking');
  if (!store) return json({ ok: false, error: 'Tracking storage is offline.' }, 503);
  try {
    if (req.method === 'GET') {
      if (!sameKey(process.env.HOC_ADMIN_KEY || '', req.headers.get('x-hoc-key') || '')) return json({ ok: false, error: 'Wrong report link.' }, 403);
      const u = new URL(req.url);
      const m = /^\d{4}-\d\d$/.test(u.searchParams.get('month') || '') ? u.searchParams.get('month') : month();
      const rows = await report(store, m, process.env.HOC_SHOPIFY_SHOP ? await shopifyOrders(m) : []);
      const keyFor = u.searchParams.get('key');
      const woo = await Promise.all(((await store.getJSON('woo/index')) || []).map(async (slug) => { const r = (await store.getJSON(`woo/${slug}`)) || {}; return { slug, connected: r.connected || '', lastSync: r.lastSync || '', lastResult: r.lastResult || null }; }));
      return json({ ok: true, month: m, woo, rows: rows.map((r) => ({ ...r, key: pixelKey(r.slug), connect: connectLink(r.slug) })), ...(keyFor && /^[a-z0-9-]{2,80}$/.test(keyFor) ? { lookup: { slug: keyFor, key: pixelKey(keyFor), connect: connectLink(keyFor) } } : {}) });
    }
    if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
    let b = {};
    try { b = JSON.parse(await req.text()); } catch { /* empty */ }
    const ok = await count(store, b);
    return json({ ok }, ok ? 200 : 400);
  } catch {
    return json({ ok: false, error: 'Tracking storage is offline.' }, 503);
  }
};

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
import { blobStore } from '../../src/blobs.mjs';
import { pixelKey, sameKey } from '../../src/pixel-key.mjs';

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
    if (click) rec.carts = [...(rec.carts || []), { click, items: num(b.items, 200), total: Math.round(num(b.total, 20000) * 100) / 100, at: now.toISOString() }].slice(-300);
  }
  rec.last = now.toISOString();
  await store.setJSON(key, rec);
  const index = (await store.getJSON(`h/${m}/index`)) || [];
  if (!index.includes(slug)) { index.push(slug); await store.setJSON(`h/${m}/index`, index); }
  return true;
}

export async function report(store, m) {
  const slugs = new Set([...((await store.getJSON(`h/${m}/index`)) || []), ...((await store.getJSON(`c/${m}/index`)) || [])]);
  const rows = await Promise.all([...slugs].map(async (slug) => {
    const h = (await store.getJSON(`h/${m}/${slug}`)) || {};
    const c = (await store.getJSON(`c/${m}/${slug}`)) || { orders: [] };
    const orders = c.orders || [];
    const sent = new Set((h.carts || []).map((x) => x.click));
    const matched = orders.filter((o) => o.click && sent.has(o.click)).length;
    return { slug, handoffs: { ...h, carts: undefined }, matched, orders: orders.length, orderValue: Math.round(orders.reduce((a, o) => a + (Number(o.total) || 0), 0) * 100) / 100, recent: orders.slice(-5) };
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
      const rows = await report(store, m);
      const keyFor = u.searchParams.get('key');
      return json({ ok: true, month: m, rows: rows.map((r) => ({ ...r, key: pixelKey(r.slug) })), ...(keyFor && /^[a-z0-9-]{2,80}$/.test(keyFor) ? { lookup: { slug: keyFor, key: pixelKey(keyFor) } } : {}) });
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

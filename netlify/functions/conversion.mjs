// /api/conversion: step 2 of order tracking (docs/order-tracking.md). The
// snippet a business owner adds to their own store (a Shopify custom pixel
// or a WooCommerce snippet, from /owners/tracking/) posts here when an order
// we sent them is placed: the order number, total, currency, item count and
// our visit id. Never the customer's name, email, address or what they
// bought. Signed with that business's key (src/pixel-key.mjs); an order
// number counts once. Cross-origin by design: it is called from their store.
import { blobStore } from '../../src/blobs.mjs';
import { pixelKey, sameKey } from '../../src/pixel-key.mjs';

export const config = { path: '/api/conversion' };
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'POST, OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS } });
const clean = (s, max) => String(s ?? '').replace(/[^\w .:#-]/g, '').slice(0, max);

export async function record(store, b, now = new Date(), keyOf = pixelKey) {
  const slug = String(b.shop || '');
  if (!/^[a-z0-9][a-z0-9-]{1,80}$/.test(slug) || !keyOf(slug) || !sameKey(keyOf(slug), b.key)) return { ok: false, status: 403, error: 'Unknown shop or key.' };
  const order = clean(b.order, 60);
  if (!order) return { ok: false, status: 400, error: 'Missing order number.' };
  const m = now.toISOString().slice(0, 7);
  const key = `c/${m}/${slug}`;
  const rec = (await store.getJSON(key)) || { slug, month: m, orders: [] };
  if (rec.orders.some((o) => o.order === order)) return { ok: true, duplicate: true };
  rec.orders.push({ order, total: Math.max(0, Math.min(100000, Number(b.total) || 0)), currency: clean(b.currency, 3) || 'USD', items: Math.max(0, Math.min(500, Number(b.items) || 0)), click: clean(b.click, 24), via: clean(b.via, 12), at: now.toISOString() });
  await store.setJSON(key, rec);
  const index = (await store.getJSON(`c/${m}/index`)) || [];
  if (!index.includes(slug)) { index.push(slug); await store.setJSON(`c/${m}/index`, index); }
  return { ok: true };
}

export default async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'method' }, 405);
  const store = blobStore('tracking');
  if (!store) return json({ ok: false, error: 'offline' }, 503);
  let b = {};
  try { b = JSON.parse(await req.text()); } catch { /* empty */ }
  try {
    const r = await record(store, b);
    return json(r, r.status || 200);
  } catch {
    return json({ ok: false, error: 'offline' }, 503);
  }
};

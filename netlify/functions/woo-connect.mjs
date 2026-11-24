// /api/woo-connect: WooCommerce one-click order tracking (docs/order-tracking.md).
//
// GET ?b=<slug>  The link we give an owner. Sends them to their own store's
//   approval screen (WooCommerce's built-in /wc-auth/v1/authorize) asking for
//   a read-only key for "Heart of Columbus". Only stores on file in
//   src/data/commerce.mjs as WooCommerce, at the address on file.
// POST           WooCommerce calls this when the owner approves, with the
//   new key. user_id carries "<slug>.<signature>", so a key is only accepted
//   for the business the link was made for. The key is encrypted
//   (src/vault.mjs) and stored in Netlify Blobs as woo/<slug>.
// GET ?sync=1    With the admin key in x-hoc-key: read every connected
//   store's orders now (the daily job, netlify/functions/woo-sync.mjs, does
//   the same each morning).
import { createHmac } from 'node:crypto';
import { blobStore } from '../../src/blobs.mjs';
import { COMMERCE } from '../../src/data/commerce.mjs';
import { seal } from '../../src/vault.mjs';
import { sameKey } from '../../src/pixel-key.mjs';
import { syncAll } from '../../src/woo-orders.mjs';

export const config = { path: '/api/woo-connect' };
const SITE = (process.env.HOC_ORIGIN || 'https://heartofcolumbus.netlify.app').replace(/\/+$/, '');
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
export const signSlug = (slug, secret = process.env.HOC_ADMIN_KEY || '') => createHmac('sha256', secret).update('woo:' + slug).digest('hex').slice(0, 16);
export const userIdFor = (slug, secret) => `${slug}.${signSlug(slug, secret)}`;
export function slugFrom(userId, secret) {
  const [slug, sig] = String(userId || '').split('.');
  return slug && sig && sameKey(signSlug(slug, secret), sig) ? slug : '';
}

export function authorizeUrl(slug, secret = process.env.HOC_ADMIN_KEY || '') {
  const c = COMMERCE[slug];
  if (!c || c.platform !== 'woocommerce' || !c.origin || !secret) return '';
  const q = new URLSearchParams({
    app_name: 'Heart of Columbus', scope: 'read', user_id: userIdFor(slug, secret),
    return_url: `${SITE}/owners/connected/?b=${encodeURIComponent(slug)}`,
    callback_url: `${SITE}/api/woo-connect`,
  });
  return `${c.origin.replace(/\/+$/, '')}/wc-auth/v1/authorize?${q}`;
}

export async function saveKey(blobs, body, secret = process.env.HOC_ADMIN_KEY || '') {
  const slug = slugFrom(body.user_id, secret);
  const c = COMMERCE[slug];
  if (!slug || !c || c.platform !== 'woocommerce') return false;
  if (!/^ck_[0-9a-f]{20,}$/i.test(String(body.consumer_key || '')) || !/^cs_[0-9a-f]{20,}$/i.test(String(body.consumer_secret || ''))) return false;
  await blobs.setJSON(`woo/${slug}`, { slug, origin: c.origin, key: seal(body.consumer_key, secret), secret: seal(body.consumer_secret, secret), permissions: String(body.key_permissions || ''), connected: new Date().toISOString() });
  const index = (await blobs.getJSON('woo/index')) || [];
  if (!index.includes(slug)) { index.push(slug); await blobs.setJSON('woo/index', index); }
  return true;
}

async function getJson(url, auth) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 15000);
  try {
    const r = await fetch(url, { headers: { Authorization: auth, Accept: 'application/json', 'User-Agent': 'HeartOfColumbus/1.0 (+https://heartofcolumbus.netlify.app)' }, signal: ctl.signal });
    return r.ok ? await r.json() : null;
  } catch { return null; } finally { clearTimeout(t); }
}
export const wooGet = getJson;

export default async (req) => {
  const u = new URL(req.url);
  const blobs = blobStore('tracking');
  if (req.method === 'GET' && u.searchParams.get('sync')) {
    if (!sameKey(process.env.HOC_ADMIN_KEY || '', req.headers.get('x-hoc-key') || '')) return json({ ok: false, error: 'Wrong key.' }, 403);
    if (!blobs) return json({ ok: false, error: 'Storage is offline.' }, 503);
    return json({ ok: true, stores: await syncAll({ blobs, get: getJson }) });
  }
  if (req.method === 'GET') {
    const to = authorizeUrl(String(u.searchParams.get('b') || ''));
    if (!to) return new Response('This link is not for a WooCommerce store we have on file. Ask Heart of Columbus for a new one.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    return new Response(null, { status: 302, headers: { location: to, 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
  }
  if (req.method !== 'POST') return json({ ok: false }, 405);
  if (!blobs) return json({ ok: false }, 503);
  let b = {};
  try { b = JSON.parse(await req.text()); } catch { /* empty */ }
  const ok = await saveKey(blobs, b).catch(() => false);
  return json({ ok }, ok ? 200 : 400);
};

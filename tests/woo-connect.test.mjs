// WooCommerce one-click order tracking: the approval link, the key we store,
// and the daily read that keeps only the orders we sent.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { seal, open } from '../src/vault.mjs';
import { authorizeUrl, saveKey, slugFrom, userIdFor } from '../netlify/functions/woo-connect.mjs';
import { syncStore, matchCart } from '../src/woo-orders.mjs';
import { report } from '../netlify/functions/handoff.mjs';
import { COMMERCE } from '../src/data/commerce.mjs';

const S = 'test-secret';
const woo = Object.keys(COMMERCE).find((s) => COMMERCE[s].platform === 'woocommerce' && COMMERCE[s].feed);
const shopify = Object.keys(COMMERCE).find((s) => COMMERCE[s].platform === 'shopify');
const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };

test('stored keys are encrypted and only open with the site secret', () => {
  const sealed = seal('cs_abc123', S);
  assert.ok(!sealed.includes('cs_abc123'));
  assert.equal(open(sealed, S), 'cs_abc123');
  assert.throws(() => open(sealed, 'other'));
});

test('the link goes to that store’s own approval screen, read-only, and only for WooCommerce stores on file', () => {
  const u = new URL(authorizeUrl(woo, S));
  assert.equal(u.origin, new URL(COMMERCE[woo].origin).origin);
  assert.equal(u.pathname, '/wc-auth/v1/authorize');
  assert.equal(u.searchParams.get('scope'), 'read');
  assert.equal(slugFrom(u.searchParams.get('user_id'), S), woo);
  assert.match(u.searchParams.get('callback_url'), /^https:\/\/.+\/api\/woo-connect$/);
  assert.equal(authorizeUrl(shopify, S), '');
  assert.equal(authorizeUrl('no-such-shop', S), '');
});

test('a key is kept only for the business its link was signed for', async () => {
  const blobs = memStore();
  const key = { consumer_key: 'ck_' + 'a'.repeat(40), consumer_secret: 'cs_' + 'b'.repeat(40), key_permissions: 'read' };
  assert.equal(await saveKey(blobs, { ...key, user_id: `${woo}.forged` }, S), false);
  assert.equal(await saveKey(blobs, { ...key, user_id: userIdFor(shopify, S) }, S), false);
  assert.equal(await saveKey(blobs, { ...key, consumer_key: 'nope', user_id: userIdFor(woo, S) }, S), false);
  assert.equal(await saveKey(blobs, { ...key, user_id: userIdFor(woo, S) }, S), true);
  const rec = await blobs.getJSON(`woo/${woo}`);
  assert.ok(!JSON.stringify(rec).includes('ck_aaaa'), 'never stored in the clear');
  assert.equal(open(rec.key, S), key.consumer_key);
  assert.deepEqual(await blobs.getJSON('woo/index'), [woo]);
});

test('the daily read keeps only our orders: matched to our cart, or attributed to us', async () => {
  const blobs = memStore();
  const now = new Date('2026-11-24T15:00:00Z');
  await blobs.setJSON(`h/2026-11/${woo}`, { carts: [{ click: 'c1', ids: ['501', '777'], at: '2026-11-23T12:00:00Z' }, { click: 'c2', ids: ['900'], at: '2026-11-01T12:00:00Z' }] });
  const orders = [
    { id: 1, number: '1001', status: 'completed', total: '30.00', currency: 'USD', date_created_gmt: '2026-11-23T13:00:00', line_items: [{ product_id: 501, quantity: 1 }, { product_id: 70, variation_id: 777, quantity: 2 }], billing: { email: 'x@y.z' } },
    { id: 2, number: '1002', status: 'processing', total: '12.00', currency: 'USD', date_created_gmt: '2026-11-23T14:00:00', line_items: [{ product_id: 9, quantity: 1 }], meta_data: [{ key: '_wc_order_attribution_utm_source', value: 'heartofcolumbus' }] },
    { id: 3, number: '1003', status: 'completed', total: '99.00', currency: 'USD', date_created_gmt: '2026-11-23T15:00:00', line_items: [{ product_id: 5, quantity: 1 }] },
    { id: 4, number: '1004', status: 'completed', total: '8.00', currency: 'USD', date_created_gmt: '2026-11-20T15:00:00', line_items: [{ product_id: 900, quantity: 1 }] },
  ];
  let asked = '';
  const get = async (url, auth) => { asked = auth; return url.includes('page=1') ? orders : []; };
  const r = await syncStore({ blobs, slug: woo, origin: 'https://shop.example', creds: { key: 'ck_x', secret: 'cs_y' }, get, now });
  assert.deepEqual([r.ok, r.read, r.kept], [true, 4, 2]);
  assert.match(asked, /^Basic /);
  const rec = await blobs.getJSON(`c/2026-11/${woo}`);
  assert.deepEqual(rec.orders.map((o) => [o.order, o.click, o.fulfilled]), [['1001', 'c1', true], ['1002', '', false]]);
  assert.ok(!JSON.stringify(rec).includes('x@y.z'), 'no customer details');
  // A later read updates the status in place.
  orders[1].status = 'completed';
  await syncStore({ blobs, slug: woo, origin: 'https://shop.example', creds: { key: 'ck_x', secret: 'cs_y' }, get, now });
  const again = await blobs.getJSON(`c/2026-11/${woo}`);
  assert.equal(again.orders.length, 2);
  assert.equal(again.orders[1].fulfilled, true);
  const rows = await report(blobs, '2026-11');
  assert.deepEqual([rows[0].orders, rows[0].matched, rows[0].fulfilled], [2, 1, 2]);
});

test('a cart only matches an order with all its products, placed within two days after', () => {
  const carts = [{ click: 'a', ids: ['1', '2'], at: '2026-11-20T10:00:00Z' }];
  assert.equal(matchCart({ date_created_gmt: '2026-11-20T11:00:00', line_items: [{ product_id: 1 }, { product_id: 2 }] }, carts).click, 'a');
  assert.equal(matchCart({ date_created_gmt: '2026-11-20T11:00:00', line_items: [{ product_id: 1 }] }, carts), null);
  assert.equal(matchCart({ date_created_gmt: '2026-11-23T11:00:00', line_items: [{ product_id: 1 }, { product_id: 2 }] }, carts), null);
  assert.equal(matchCart({ date_created_gmt: '2026-11-19T11:00:00', line_items: [{ product_id: 1 }, { product_id: 2 }] }, carts), null);
});

test('owners land on a private "connected" page; the setup page leads with one click', () => {
  const c = readFileSync(new URL('../dist/owners/connected/index.html', import.meta.url), 'utf8');
  assert.match(c, /noindex/);
  const setup = readFileSync(new URL('../dist/owners/tracking/index.html', import.meta.url), 'utf8');
  assert.match(setup, /One click/);
});

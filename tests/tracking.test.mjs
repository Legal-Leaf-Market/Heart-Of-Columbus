// Order tracking: our tag on outbound links (src/ref.mjs), the handoff count
// (/api/handoff) and owner-confirmed orders (/api/conversion).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { tagUrl } from '../src/ref.mjs';
import { count, report } from '../netlify/functions/handoff.mjs';
import { record } from '../netlify/functions/conversion.mjs';
import { pixelKey } from '../src/pixel-key.mjs';
import { directory } from '../src/data/directory.mjs';

const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };

test('outbound links carry our UTM tag, once, and social and map links stay clean', () => {
  const u = new URL(tagUrl('https://order.toasttab.com/online/x?y=1', 'order'));
  assert.equal(u.searchParams.get('utm_source'), 'heartofcolumbus');
  assert.equal(u.searchParams.get('utm_campaign'), 'order');
  assert.equal(u.searchParams.get('y'), '1');
  assert.equal(tagUrl('https://shop.example/?utm_source=x', 'order'), 'https://shop.example/?utm_source=x');
  assert.equal(tagUrl('https://www.facebook.com/somebiz', 'listing'), 'https://www.facebook.com/somebiz');
  assert.equal(tagUrl('https://www.google.com/maps/dir/?api=1', 'x'), 'https://www.google.com/maps/dir/?api=1');
  assert.equal(tagUrl('tel:+18125550100', 'x'), 'tel:+18125550100');
});

test('business pages tag and count their order and booking buttons', () => {
  const b = directory.find((x) => x.order.length && !x.demo);
  const html = readFileSync(new URL(`../dist/b/${b.slug}/index.html`, import.meta.url), 'utf8');
  assert.match(html, new RegExp(`data-hoc="${b.slug}\\|order"`));
  assert.match(html, /utm_source=heartofcolumbus/);
});

test('handoffs are counted per business per month, with cart items and value', async () => {
  const s = memStore();
  const now = new Date('2026-11-24T12:00:00Z');
  assert.equal(await count(s, { slug: 'footworks', kind: 'cart', items: 2, total: 59.5 }, now), true);
  assert.equal(await count(s, { slug: 'footworks', kind: 'cart', items: 1, total: 10 }, now), true);
  assert.equal(await count(s, { slug: 'footworks', kind: 'order' }, now), true);
  assert.equal(await count(s, { slug: 'footworks', kind: 'hack' }, now), false);
  assert.equal(await count(s, { slug: '../etc', kind: 'cart' }, now), false);
  const rec = await s.getJSON('h/2026-11/footworks');
  assert.deepEqual([rec.cart, rec.cartItems, rec.cartValue, rec.order], [2, 3, 69.5, 1]);
  assert.ok(!JSON.stringify(rec).match(/ip|agent|email/i), 'nothing about the person');
});

test('owner-confirmed orders need the right key and count once', async () => {
  const s = memStore();
  const now = new Date('2026-11-24T12:00:00Z');
  const keyOf = (slug) => pixelKey(slug, 'test-secret');
  const good = { shop: 'footworks', key: keyOf('footworks'), order: '1001', total: '42.10', currency: 'USD', items: 2, click: 'abc123', via: 'shopify', email: 'x@y.z' };
  assert.equal((await record(s, { ...good, key: 'wrong' }, now, keyOf)).ok, false);
  assert.equal((await record(s, { ...good, key: keyOf('someone-else') }, now, keyOf)).ok, false);
  assert.equal((await record(s, good, now, keyOf)).ok, true);
  assert.equal((await record(s, good, now, keyOf)).duplicate, true);
  const rec = await s.getJSON('c/2026-11/footworks');
  assert.equal(rec.orders.length, 1);
  assert.equal(rec.orders[0].total, 42.1);
  assert.ok(!('email' in rec.orders[0]), 'customer details are never kept');
  await count(s, { slug: 'footworks', kind: 'cart', items: 2, total: 42.1, click: 'abc123' }, now);
  await count(s, { slug: 'footworks', kind: 'cart', items: 1, total: 5, click: 'zzz999' }, now);
  const rows = await report(s, '2026-11');
  assert.deepEqual([rows[0].slug, rows[0].orders, rows[0].matched, rows[0].orderValue, rows[0].handoffs.cart], ['footworks', 1, 1, 42.1, 2]);
});

test('the setup page has the Shopify and WooCommerce snippets; the report is private', () => {
  const setup = readFileSync(new URL('../dist/owners/tracking/index.html', import.meta.url), 'utf8');
  assert.match(setup, /checkout_completed/);
  assert.match(setup, /woocommerce_thankyou/);
  assert.match(setup, /\/api\/conversion/);
  const rep = readFileSync(new URL('../dist/owners/report/index.html', import.meta.url), 'utf8');
  assert.match(rep, /noindex/);
  assert.match(rep, /no-referrer/);
});

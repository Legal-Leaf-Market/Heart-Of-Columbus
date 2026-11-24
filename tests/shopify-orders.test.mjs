import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import test from 'node:test';
import { receiveOrder } from '../netlify/functions/shopify-orders.mjs';
import { report } from '../netlify/functions/handoff.mjs';

const secret = 'test-secret';
const shop = 'heart-of-columbus-app-test.myshopify.com';
const slug = 'shopify-test';
const month = '2026-11';
const payload = {
  admin_graphql_api_id: 'gid://shopify/Order/123',
  created_at: '2026-11-24T07:00:00Z',
  updated_at: '2026-11-24T07:01:00Z',
  fulfillment_status: 'fulfilled',
  currency: 'USD',
  total_price: '12.34',
  line_items: [{ quantity: 2 }],
  note_attributes: [{ name: 'hoc_click', value: 'test123' }],
  email: 'customer@example.test',
};

function request(order, overrides = {}) {
  const body = JSON.stringify(order);
  return new Request('https://example.test/api/shopify-orders', {
    method: 'POST',
    body,
    headers: {
      'x-shopify-hmac-sha256': createHmac('sha256', secret).update(body).digest('base64'),
      'x-shopify-shop-domain': shop,
      'x-shopify-topic': 'orders/fulfilled',
      'x-shopify-event-id': 'fixture-1',
      ...overrides,
    },
  });
}

test('Shopify webhooks verify the sender and store only attributed order data', async () => {
  const saved = new Map();
  const options = { secret, shop, slug, save: async (key, value) => saved.set(key, value) };
  assert.equal((await receiveOrder(request(payload, { 'x-shopify-hmac-sha256': 'invalid' }), options)).status, 401);
  assert.equal((await receiveOrder(request(payload, { 'x-shopify-shop-domain': 'other.myshopify.com' }), options)).status, 401);
  assert.equal((await receiveOrder(request({ ...payload, note_attributes: [] }), options)).status, 204);
  assert.equal(saved.size, 0);

  for (let i = 0; i < 2; i++) {
    assert.equal((await receiveOrder(request(payload), options)).status, 204);
  }
  assert.equal(saved.size, 1);
  const row = saved.get(`${month}/fixture-1`);
  assert.equal(row.fulfilled, true);
  assert.equal(row.click, 'test123');
  assert.equal(row.items, 2);
  assert.equal(row.total, 12.34);
  assert.equal('email' in row, false);

  const existing = new Map([
    [`h/${month}/index`, [slug]],
    [`h/${month}/${slug}`, { carts: [{ click: 'test123' }] }],
    [`c/${month}/${slug}`, { orders: [{ order: 'gid:shopifyOrder123', via: 'shopify' }] }],
  ]);
  const [summary] = await report({ getJSON: async (key) => existing.get(key) }, month, [row]);
  assert.equal(summary.orders, 1);
  assert.equal(summary.matched, 1);
  assert.equal(summary.fulfilled, 1);
});

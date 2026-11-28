import test from 'node:test';
import assert from 'node:assert/strict';
import { demoPickup } from '../netlify/functions/pickup-demo.mjs';

test('demo checkout is isolated by business and retries do not duplicate or lose tickets', async () => {
  const rooms = new Map();
  const handler = demoPickup(() => ({
    getWithMetadata: async (key) => structuredClone(rooms.get(key)),
    async setJSON(key, data, { onlyIfNew, onlyIfMatch }) {
      const current = rooms.get(key);
      if (onlyIfNew ? current : current?.etag !== onlyIfMatch) return { modified: false };
      rooms.set(key, { data: structuredClone(data), etag: String(Number(current?.etag || 0) + 1) });
      return { modified: true };
    },
  }));
  const send = (action, business = 'jills-diner') => handler(new Request('https://example.test/api/pickup-demo?business=' + business, {
    headers: { 'x-hoc-demo': 'a'.repeat(32) },
    ...(action ? { method: 'POST', body: JSON.stringify(action) } : {}),
  }));
  assert.equal((await send({ action: 'start' })).status, 200);
  const id = 'b'.repeat(32);
  const order = { action: 'order', id, lines: [[0, 2], [1, 1, [0, 0]], [1, 2, [1, 0, [0, 3], []]]], phone: 'ignored', pickup: [3, 780], coupon: 'HOCDEMO10' };
  const results = await Promise.all([send(order), send(order), send({ ...order, id: 'c'.repeat(32) })]);
  assert.deepEqual(results.map(r => r.status), [200, 200, 200]);
  assert.equal((await send({ ...order, lines: [[1, 1, ['text']]] })).status, 400);
  assert.equal((await send({ ...order, lines: [[1, 1, [0]], [1, 2, [0]]] })).status, 400);
  assert.equal((await send({ ...order, lines: [[1, 1, [[3, 0]]]] })).status, 400);
  assert.equal((await send({ ...order, lines: [[1, 1, [[2, 2]]]] })).status, 400);
  assert.equal((await send({ ...order, pickup: [3, 1500] })).status, 400);
  assert.equal((await send({ ...order, coupon: 'unrecognized' })).status, 400);
  assert.equal((await send(null, 'rohdes-family-diner')).status, 410);
  assert.equal((await send({ action: 'update', id, status: 'ready' })).status, 409);
  assert.equal((await send({ action: 'update', id, status: 'accepted', minutes: 15 })).status, 200);
  assert.equal((await send({ action: 'update', id, status: 'ready' })).status, 200);
  assert.equal((await send({ action: 'update', id, status: 'collected' })).status, 200);
  const { tickets } = await (await send()).json();
  assert.equal(tickets.length, 2);
  const collected = tickets.find(t => t.id === id);
  assert.equal(collected.status, 'collected');
  assert.deepEqual(collected.lines, order.lines);
  assert.deepEqual(collected.pickup, order.pickup);
  assert.equal(collected.coupon, order.coupon);
  assert.ok(tickets.every(t => !Object.hasOwn(t, 'phone')));
});

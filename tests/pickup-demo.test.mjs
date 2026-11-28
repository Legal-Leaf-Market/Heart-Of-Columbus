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
  const order = { action: 'order', id, lines: [[0, 2], [1, 1, [0, 0]], [1, 2, [1, 0, [2, 47], [12, 21, 33]]]], phone: 'ignored', pickup: [3, 780], coupon: 'HOCDEMO10' };
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

test('staff delivery preserves custody and one job per order across retries and reassignment', async () => {
  const rooms = new Map();
  const handler = demoPickup(() => ({
    getWithMetadata: async key => structuredClone(rooms.get(key)),
    async setJSON(key, data, { onlyIfNew, onlyIfMatch }) {
      const current = rooms.get(key);
      if (onlyIfNew ? current : current?.etag !== onlyIfMatch) return { modified: false };
      rooms.set(key, { data: structuredClone(data), etag: String(Number(current?.etag || 0) + 1) });
      return { modified: true };
    },
  }));
  const dispatch = 'd'.repeat(32);
  const id = 'e'.repeat(32);
  async function send(action, staff, business = 'jills-diner') {
    const response = await handler(new Request('https://example.test/api/pickup-demo?business=' + business, {
      headers: { 'x-hoc-demo': 'f'.repeat(32), ...(staff ? { 'x-hoc-demo-staff': staff } : {}) },
      ...(action ? { method: 'POST', body: JSON.stringify({ id, ...action }) } : {}),
    }));
    return [response.status, await response.json()];
  }
  const order = { action: 'order', lines: [[0, 1]], dropoff: 'east' };
  const update = (status, staff) => send({ action: 'update', status, minutes: 15 }, staff);
  const parcel = (event, staff, job, attempt, extra) => send({ action: 'parcel', event, job, attempt, ...extra }, staff);
  const assign = { driver: 'alex', window: 'soon' };

  assert.equal((await send({ action: 'start' }, dispatch))[0], 200);
  assert.equal((await send({ ...order, dropoff: 'a real street address' }))[0], 400);
  assert.equal((await send(order, null, 'rohdes-family-diner'))[0], 400);
  assert.equal((await send(order))[0], 200);
  const [, { drivers }] = await send(null, dispatch);
  assert.equal((await update('accepted'))[0], 403);
  assert.equal((await parcel('assigned', dispatch, null, null, assign))[0], 409);
  assert.equal((await update('accepted', dispatch))[0], 200);
  assert.equal((await update('ready', dispatch))[0], 200);
  assert.equal((await update('collected', dispatch))[0], 409);
  const assignments = await Promise.all([1, 2].map(() => parcel('assigned', dispatch, null, null, assign)));
  const job = assignments[0][1].ticket.delivery.job.id;
  assert.ok(assignments.every(([status, { ticket }]) => status === 200 && ticket.delivery.job.id === job));
  assert.deepEqual((await send(null, drivers.sam))[1].tickets, []);
  assert.equal((await parcel('picked_up', drivers.sam, job, 1))[0], 403);
  assert.equal((await parcel('handed_off', drivers.alex, job, 1, { handoffConfirmed: true }))[0], 409);
  assert.equal((await parcel('picked_up', drivers.alex, job, 1))[0], 200);
  assert.equal((await parcel('handed_off', drivers.alex, job, 1))[0], 409);
  assert.equal((await parcel('failed', drivers.alex, job, 1, { reason: 'recipient_unavailable' }))[0], 200);
  assert.equal((await parcel('rescheduled', dispatch, job, 1, { driver: 'sam', window: 'tomorrow' }))[0], 200);
  assert.deepEqual((await send(null, drivers.alex))[1].tickets, []);
  assert.equal((await parcel('picked_up', drivers.sam, job, 1))[0], 409);
  const [, { tickets: [run] }] = await send(null, drivers.sam);
  assert.equal(run.delivery.job.id, job);
  assert.equal(run.delivery.job.attempt, 2);
  assert.equal(run.lines, undefined);
  assert.equal((await parcel('picked_up', drivers.sam, job, 2))[0], 200);
  const [status, { ticket }] = await parcel('handed_off', drivers.sam, job, 2, { handoffConfirmed: true });
  assert.equal(status, 200);
  assert.deepEqual(ticket.delivery.job.events.map(entry => [entry.attempt, entry.outcome]), [
    [1, 'assigned'], [1, 'picked_up'], [1, 'failed'], [2, 'rescheduled'], [2, 'picked_up'], [2, 'handed_off'],
  ]);
  const [, shopper] = await send();
  assert.equal(shopper.drivers, undefined);
  assert.deepEqual(shopper.tickets[0].delivery, { dropoff: 'east', status: 'handed_off' });
});

// The pickup ticket rail: who may receive orders, demo privacy, first
// redemption wins, and failing closed when storage is missing.
import assert from 'node:assert/strict';
import { test } from 'node:test';

const mem = new Map();
const realFetch = globalThis.fetch;
function fakeBlobs() {
  process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 'site1', token: 'tok', edgeURL: 'https://edge.example' })).toString('base64');
  globalThis.fetch = async (url, opts = {}) => {
    const u = String(url);
    assert.ok(u.startsWith('https://edge.example/site1/site:pickup/'), u);
    assert.equal(opts.headers.authorization, 'Bearer tok');
    const key = u.split('/site:pickup/')[1];
    if (opts.method === 'PUT') { mem.set(key, opts.body); return new Response('', { status: 200 }); }
    return mem.has(key) ? new Response(mem.get(key)) : new Response('', { status: 404 });
  };
}
const { default: pickup } = await import('../netlify/functions/pickup.mjs');
const post = (body) => pickup(new Request('https://h/api/pickup', { method: 'POST', body: JSON.stringify(body) }));
const get = (qs) => pickup(new Request('https://h/api/pickup?' + qs));

test('fails closed without Blobs', async () => {
  delete process.env.NETLIFY_BLOBS_CONTEXT;
  const r = await post({ slug: 'tacolumbus', items: [{ name: 'Taco', qty: 1, cents: 300 }], name: 'Al' });
  assert.equal(r.status, 503);
});

test('refuses businesses that have not signed on', async () => {
  fakeBlobs();
  const r = await post({ slug: 'zaharakos', items: [{ name: 'Sundae', qty: 1, cents: 900 }], name: 'Al' });
  assert.equal(r.status, 403);
  globalThis.fetch = realFetch;
});

test('demo ticket: created without a phone, ready, redeemed once', async () => {
  fakeBlobs();
  const r = await post({ slug: 'tacolumbus', items: [{ name: 'Taco', qty: 2, cents: 300 }], name: 'Al', phone: '(812) 555-0100', when: 'Today at 6:00 PM' });
  const j = await r.json();
  assert.equal(j.ok, true);
  assert.equal(j.demo, true);
  assert.match(j.token, /^[a-f0-9]{32}$/);
  const t = (await (await get('t=' + j.token)).json()).ticket;
  assert.equal(t.phone, '');
  assert.equal(t.listCents, 600);
  assert.equal((await (await post({ action: 'ready', t: j.token })).json()).ticket.status, 'ready');
  const first = await post({ action: 'redeem', t: j.token, totalCents: 725 });
  assert.equal((await first.json()).ticket.finalCents, 725);
  assert.equal((await post({ action: 'redeem', t: j.token, totalCents: 1 })).status, 409);
  assert.equal((await get('t=nothex')).status, 404);
  globalThis.fetch = realFetch;
});

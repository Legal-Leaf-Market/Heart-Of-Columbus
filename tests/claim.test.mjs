// Owner claim leads: validation, honeypot, and a key-protected inbox.
import assert from 'node:assert/strict';
import { test } from 'node:test';

const mem = new Map();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 's', token: 't', edgeURL: 'https://edge.example' })).toString('base64');
process.env.HOC_ADMIN_KEY = 'k'.repeat(24);
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const key = String(url).split('/site:claims/')[1];
  assert.ok(key, String(url));
  if (opts.method === 'PUT') { mem.set(key, opts.body); return new Response(''); }
  return mem.has(key) ? new Response(mem.get(key)) : new Response('', { status: 404 });
};
const { default: claim } = await import('../netlify/functions/claim.mjs');
const post = (b) => claim(new Request('https://h/api/claim', { method: 'POST', body: JSON.stringify(b) }));

test('needs a name and a way to reach them', async () => {
  assert.equal((await post({ slug: 'zaharakos', name: 'Ann' })).status, 400);
  assert.equal((await post({ slug: 'zaharakos', email: 'a@b.co' })).status, 400);
});

test('honeypot is accepted silently and stored nowhere', async () => {
  const before = mem.size;
  assert.equal((await post({ business: 'X', name: 'Bot', email: 'a@b.co', website: 'spam' })).status, 200);
  assert.equal(mem.size, before);
});

test('lead is stored and only the right key can read the inbox', async () => {
  const r = await post({ business: 'Somewhere New', name: 'Ann', phone: '812-555-0100', wants: ['pickup', 'hack'] });
  assert.equal(r.status, 200);
  const bad = await claim(new Request('https://h/api/claim?k=nope'));
  assert.equal(bad.status, 403);
  const ok = await (await claim(new Request('https://h/api/claim?k=' + 'k'.repeat(24)))).json();
  assert.equal(ok.leads.length, 1);
  assert.deepEqual(ok.leads[0].wants, ['pickup']);
  globalThis.fetch = realFetch;
});

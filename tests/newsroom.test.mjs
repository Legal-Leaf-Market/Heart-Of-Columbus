// Reader questions, letters and tips: required fields, honeypot, a
// key-protected inbox, and nothing kept beyond what the form asks.
import assert from 'node:assert/strict';
import { test } from 'node:test';

const mem = new Map();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 's', token: 't', edgeURL: 'https://edge.example' })).toString('base64');
process.env.HOC_ADMIN_KEY = 'k'.repeat(24);
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const key = String(url).split('/site:newsroom/')[1];
  assert.ok(key, String(url));
  if (opts.method === 'PUT') { mem.set(key, opts.body); return new Response(''); }
  return mem.has(key) ? new Response(mem.get(key)) : new Response('', { status: 404 });
};
const { default: newsroom } = await import('../netlify/functions/newsroom.mjs');
const post = (b, headers = {}) => newsroom(new Request('https://h/api/newsroom', { method: 'POST', body: JSON.stringify(b), headers }));
const inbox = async (kind, k = 'k'.repeat(24)) => newsroom(new Request(`https://h/api/newsroom?kind=${kind}&k=${k}`));

test('each form requires what it says it requires', async () => {
  assert.equal((await post({ kind: 'ask' })).status, 400);
  assert.equal((await post({ kind: 'letter', body: 'Hi', name: 'Ann' })).status, 400, 'town');
  assert.equal((await post({ kind: 'letter', body: 'Hi', name: 'Ann', town: 'Columbus' })).status, 400, 'contact');
  assert.equal((await post({ kind: 'tip' })).status, 400);
  assert.equal((await post({ kind: 'gossip', tip: 'x' })).status, 400);
});

test('honeypot is accepted silently and stored nowhere', async () => {
  const before = mem.size;
  assert.equal((await post({ kind: 'tip', tip: 'Buy now', website: 'spam' })).status, 200);
  assert.equal(mem.size, before);
});

test('a tip keeps only the tip and contact, never request details', async () => {
  assert.equal((await post({ kind: 'tip', tip: 'The bridge is closed', ip: '1.2.3.4', extra: 'x' }, { 'x-forwarded-for': '1.2.3.4', 'user-agent': 'UA' })).status, 200);
  assert.equal((await inbox('tip', 'nope')).status, 403);
  const { items } = await (await inbox('tip')).json();
  assert.equal(items.length, 1);
  assert.deepEqual(Object.keys(items[0]).sort(), ['contact', 'createdAt', 'id', 'kind', 'status', 'tip']);
  assert.ok(![...mem.values()].some((v) => v.includes('1.2.3.4') || v.includes('UA')));
});

test('letters and questions land in their own inbox', async () => {
  assert.equal((await post({ kind: 'letter', body: 'Fix the crosswalk.', name: 'Ann', town: 'Columbus', email: 'a@b.co' })).status, 200);
  assert.equal((await post({ kind: 'ask', question: 'Why is the sky blue?' })).status, 200);
  assert.equal((await (await inbox('letter')).json()).items[0].town, 'Columbus');
  assert.equal((await (await inbox('ask')).json()).items.length, 1);
  globalThis.fetch = realFetch;
});

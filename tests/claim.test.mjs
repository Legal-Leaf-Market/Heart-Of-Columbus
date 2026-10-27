// Owner claim leads: validation, honeypot, and a key-protected inbox.
import assert from 'node:assert/strict';
import { test } from 'node:test';

const mem = new Map();
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 's', token: 't', edgeURL: 'https://edge.example' })).toString('base64');
process.env.HOC_ADMIN_KEY = 'k'.repeat(24);
const realFetch = globalThis.fetch;
const fake = async (url, opts = {}) => {
  const key = String(url).split('/site:claims/')[1];
  assert.ok(key, String(url));
  if (opts.method === 'PUT') { mem.set(key, opts.body); return new Response(''); }
  return mem.has(key) ? new Response(mem.get(key)) : new Response('', { status: 404 });
};
globalThis.fetch = fake;
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
  const bad = await claim(new Request('https://h/api/claim', { headers: { 'x-hoc-key': 'nope' } }));
  assert.equal(bad.status, 403);
  assert.equal((await claim(new Request('https://h/api/claim?k=' + 'k'.repeat(24)))).status, 403, 'a key in the query string is not accepted');
  const ok = await (await claim(new Request('https://h/api/claim', { headers: { 'x-hoc-key': 'k'.repeat(24) } }))).json();
  assert.equal(ok.leads.length, 1);
  assert.deepEqual(ok.leads[0].wants, ['pickup']);
});

test('a form sent without its script is a POST that answers with a page, not a URL full of details', async () => {
  const form = (fields) => claim(new Request('https://h/api/claim', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fields) }));
  const bad = await form({ business: 'Somewhere', name: 'Ann' });
  assert.equal(bad.status, 400);
  assert.match(bad.headers.get('content-type'), /text\/html/);
  assert.match(await bad.text(), /phone number or email/);
  const good = await form([['business', 'Somewhere'], ['name', 'Bo'], ['email', 'bo@x.co'], ['wants', 'fix'], ['wants', 'link']]);
  assert.equal(good.status, 200);
  assert.equal(good.headers.get('location'), null);
  const all = await (await claim(new Request('https://h/api/claim', { headers: { 'x-hoc-key': 'k'.repeat(24) } }))).json();
  assert.deepEqual(all.leads[0].wants, ['fix', 'link']);
  globalThis.fetch = realFetch;
});

test('the built form posts, and asks for a way to reach you', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../dist/owners/index.html', import.meta.url), 'utf8');
  assert.match(html, /<form class="ow-form" data-claim method="post" action="\/api\/claim"/);
  assert.match(html, /A phone number or an email, at least one\./);
  for (const p of ['owners/inbox/index.html', 'obituaries/review/index.html'])
    assert.match(readFileSync(new URL('../dist/' + p, import.meta.url), 'utf8'), /name="referrer" content="no-referrer"/, p);
});

test('a deal needs an end date; story and deal ride along and tick their boxes', async () => {
  globalThis.fetch = fake;
  assert.equal((await post({ business: 'Somewhere', name: 'Cy', email: 'c@x.co', deal: '10% off' })).status, 400);
  assert.equal((await post({ business: 'Somewhere', name: 'Cy', email: 'c@x.co', deal: '10% off', dealEnds: 'soon' })).status, 400);
  assert.equal((await post({ business: 'Somewhere', name: 'Cy', email: 'c@x.co', story: 'Ours since last spring.', deal: '10% off', dealEnds: '2026-12-31' })).status, 200);
  const all = await (await claim(new Request('https://h/api/claim', { headers: { 'x-hoc-key': 'k'.repeat(24) } }))).json();
  const l = all.leads[0];
  assert.equal(l.dealEnds, '2026-12-31');
  assert.equal(l.story, 'Ours since last spring.');
  assert.deepEqual(l.wants, ['story', 'deal']);
  globalThis.fetch = realFetch;
});

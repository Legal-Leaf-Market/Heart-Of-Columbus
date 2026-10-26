// Markets and Obituaries: the quote proxy, the obituary form, and the rules
// the pages must keep (attribution next to quotes, nothing published that a
// family has not confirmed, every funeral home sourced).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { COMPANIES } from '../src/data/markets.mjs';
import { FUNERAL_HOMES, PUBLISHED } from '../src/data/obituaries.mjs';

const mem = new Map();
let quoteCalls = 0, quoteReply = null;
process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(JSON.stringify({ siteID: 's', token: 't', edgeURL: 'https://edge.example' })).toString('base64');
process.env.HOC_ADMIN_KEY = 'k'.repeat(24);
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  if (u.startsWith('https://api.twelvedata.com/')) {
    quoteCalls++;
    assert.match(u, /symbol=CMI%2C/);
    return quoteReply ? new Response(JSON.stringify(quoteReply)) : new Response('', { status: 500 });
  }
  const key = u.split('/s/')[1];
  assert.ok(key, u);
  if (opts.method === 'PUT') { mem.set(key, opts.body); return new Response(''); }
  return mem.has(key) ? new Response(mem.get(key)) : new Response('', { status: 404 });
};
const { default: markets, normalize } = await import('../netlify/functions/markets.mjs');
const { default: obituary } = await import('../netlify/functions/obituary.mjs');
const get = async () => markets(new Request('https://h/api/markets'));
const page = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('the board is one free plan call: 8 symbols or fewer, each sourced', () => {
  assert.ok(COMPANIES.length <= 8);
  for (const c of COMPANIES) assert.match(c.source, /^https:\/\//, c.symbol);
  assert.equal(COMPANIES.filter((c) => c.local).map((c) => c.symbol).join(), 'CMI');
});

test('a symbol the source cannot price shows no quote, never a guess', () => {
  const raw = Object.fromEntries(COMPANIES.map((c) => [c.symbol, { close: '100.5', change: '-1.25', percent_change: '-1.2', timestamp: 1790000000 }]));
  raw.ZBH = { status: 'error', code: 404, message: 'not found' };
  const q = normalize(raw);
  assert.equal(q.find((x) => x.symbol === 'CMI').price, 100.5);
  assert.equal(q.find((x) => x.symbol === 'CMI').change, -1.25);
  assert.equal(q.find((x) => x.symbol === 'ZBH').price, null);
});

test('no key and nothing cached says unavailable, with the source named', async () => {
  delete process.env.HOC_QUOTES_KEY;
  const r = await get();
  assert.equal(r.status, 503);
  assert.equal((await r.json()).source.name, 'Twelve Data');
  assert.equal(quoteCalls, 0);
});

test('quotes are fetched once, then served from the cache', async () => {
  process.env.HOC_QUOTES_KEY = 'demo';
  quoteReply = Object.fromEntries(COMPANIES.map((c) => [c.symbol, { close: '50', change: '1', percent_change: '2', timestamp: 1790000000 }]));
  const a = await (await get()).json();
  const b = await (await get()).json();
  assert.equal(quoteCalls, 1);
  assert.equal(a.quotes.length, COMPANIES.length);
  assert.equal(b.quotes[0].price, 50);
});

test('when the source fails, the last good board is served as stale', async () => {
  const board = JSON.parse(mem.get('site:markets/board'));
  board.fetchedAt = new Date(Date.now() - 3600e3).toISOString();
  mem.set('site:markets/board', JSON.stringify(board));
  quoteReply = null;
  const j = await (await get()).json();
  assert.equal(j.ok, true);
  assert.equal(j.stale, true);
});

test('the markets page shows the attribution next to the table', () => {
  const html = page('markets/index.html');
  assert.match(html, /Data provided by <a href="https:\/\/twelvedata\.com\/"/);
  assert.match(html, /Not investment advice/);
  for (const c of COMPANIES) assert.match(html, new RegExp(`data-sym="${c.symbol}"`));
});

const obit = (b) => obituary(new Request('https://h/api/obituary', { method: 'POST', body: JSON.stringify(b) }));
const good = { name: 'Test Person', died: '2026-10-20', born: '1940-01-02', text: 'A long enough obituary text written by the family for this test.', fromName: 'Ann', email: 'a@b.co', consent: true, home: 'Myers-Reed Chapel' };

test('an obituary needs the name, the date, the text, a contact and consent', async () => {
  for (const k of ['name', 'died', 'text', 'fromName', 'consent']) assert.equal((await obit({ ...good, [k]: '' })).status, 400, k);
  assert.equal((await obit({ ...good, email: '' })).status, 400);
  assert.equal((await obit({ ...good, born: '2027-01-01' })).status, 400);
});

test('an obituary is stored as received and only the right key reads it', async () => {
  assert.equal((await obit({ ...good, text: good.text + '\r\n\r\n\r\nSecond paragraph.' })).status, 200);
  assert.equal((await obituary(new Request('https://h/api/obituary?k=nope'))).status, 403);
  const j = await (await obituary(new Request('https://h/api/obituary?k=' + 'k'.repeat(24)))).json();
  assert.equal(j.items.length, 1);
  assert.equal(j.items[0].status, 'received');
  assert.equal(j.items[0].home, 'Myers-Reed Chapel');
  assert.match(j.items[0].text, /test\.\n\nSecond/);
});

test('honeypot is accepted silently and stored nowhere', async () => {
  const before = mem.size;
  assert.equal((await obit({ ...good, website: 'spam' })).status, 200);
  assert.equal(mem.size, before);
  globalThis.fetch = realFetch;
});

test('nothing is published without the family and funeral home confirming', () => {
  for (const n of PUBLISHED) {
    assert.match(n.confirmed || '', /^\d{4}-\d{2}-\d{2}$/, n.slug);
    assert.ok(n.text && n.name && n.died, n.slug);
  }
});

test('every funeral home is sourced and links its own obituaries when it has them', () => {
  for (const h of FUNERAL_HOMES) {
    assert.match(h.source, /^https:\/\//, h.name);
    if (h.obits) assert.match(h.obits, /^https:\/\//, h.name);
  }
  const html = page('obituaries/index.html');
  assert.match(html, /never write one/);
  for (const h of FUNERAL_HOMES.filter((x) => x.obits)) assert.ok(html.includes(h.obits.replace(/&/g, '&amp;')), h.name);
});

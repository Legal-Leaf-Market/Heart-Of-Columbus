// The morning newsletter end to end: the 6:45 AM clock, one draft a day,
// a remade draft replaces the old one, the morning note, the plan checks,
// Resend segments at signup, and the overnight lead gathering.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { morningRun, makeDraft, deskEdition, notify, config } from '../netlify/functions/newsletter.mjs';
import { addContact } from '../netlify/functions/subscribe.mjs';
import { gatherInto } from '../netlify/functions/leads.mjs';
import { parseRss, parseWp, parseJevents, parseNws, parseEvents, freshOnly, gather, SOURCES } from '../src/news/gather.mjs';
import { planBlockers } from '../src/news/desk.mjs';
import { columbusMinutes, upcomingEditions } from '../src/news/editions.mjs';

const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };
const quiet = () => {};
const piece = { id: 'p-one', status: 'approved', shape: 'brief', headline: 'Council meets Monday', body: 'The council meets Monday at 6 PM.', sources: [{ url: 'https://www.columbus.in.gov/document/x/' }] };
const resend = { key: 'rk', segment: 'seg', from: 'Heart of Columbus <news@example.org>' };

function fakeResend() {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null });
    if (url.includes('/newsletter/editions/')) return new Response(JSON.stringify({ subject: 'Auto', html: '<body>auto</body>', fresh: 1 }));
    return new Response(JSON.stringify({ id: `b${calls.length}` }), { status: 200 });
  };
  return { calls, fn };
}

test('the job wakes twice in UTC and drafts once, at 6:45 AM Columbus time, all year', async () => {
  assert.equal(config.schedule, '45 10,11 * * 1-5');
  // Winter (UTC-5): 10:45 UTC is 5:45 AM, 11:45 is 6:45. Summer (UTC-4): 10:45 is 6:45.
  assert.equal(columbusMinutes(new Date('2026-12-02T10:45:00Z')), 5 * 60 + 45);
  assert.equal(columbusMinutes(new Date('2026-12-02T11:45:00Z')), 6 * 60 + 45);
  assert.equal(columbusMinutes(new Date('2026-07-01T10:45:00Z')), 6 * 60 + 45);
  const store = memStore(), deskStore = memStore();
  const { calls, fn } = fakeResend();
  const run = (iso) => morningRun({ now: new Date(iso), deskStore, store, origin: 'https://x.test', key: '', resend, fetchFn: fn, log: quiet });
  assert.equal((await run('2026-12-02T10:45:00Z')).reason, 'early', 'winter first wake is too early');
  assert.equal(calls.length, 0);
  assert.equal((await run('2026-12-02T11:45:00Z')).reason, 'drafted');
  assert.equal((await run('2026-12-02T11:46:00Z')).reason, 'ran', 'a retry does nothing');
  const bc = calls.find((c) => c.url.endsWith('/broadcasts'));
  assert.equal(bc.body.segment_id, 'seg', 'Resend broadcasts take segment_id');
  assert.equal(bc.body.send, undefined, 'never sends');
  assert.match(bc.body.html, /RESEND_UNSUBSCRIBE_URL/);
  assert.equal((await run('2026-07-01T10:45:00Z')).reason, 'drafted', 'summer first wake runs');
  assert.equal((await run('2026-07-01T11:45:00Z')).reason, 'ran', 'summer second wake does nothing');
});

test('the desk edition wins, a desk draft is left alone, and No edition makes none', async () => {
  const date = '2026-12-02';
  const now = new Date('2026-12-02T11:45:00Z');
  const store = memStore(), deskStore = memStore();
  await deskStore.setJSON(`day-${date}`, { date, plan: { subject: 'Council Monday', intro: 'Morning.', order: ['p-one'], skip: false }, pieces: [piece] });
  const { calls, fn } = fakeResend();
  assert.equal((await morningRun({ now, deskStore, store, origin: 'https://x.test', resend, fetchFn: fn, log: quiet })).reason, 'drafted');
  assert.equal(calls.find((c) => c.url.endsWith('/broadcasts')).body.subject, 'Council Monday');
  assert.equal((await store.getJSON(`run-${date}`)).from, 'desk');

  // The publisher made the draft at the desk before 6:45: the job keeps it.
  const s2 = memStore();
  await s2.setJSON(`draft-${date}`, { id: 'mine', via: 'resend', from: 'desk', at: 'x' });
  const f2 = fakeResend();
  assert.equal((await morningRun({ now, deskStore, store: s2, origin: 'https://x.test', resend, fetchFn: f2.fn, log: quiet })).reason, 'already');
  assert.equal(f2.calls.length, 0);

  await deskStore.setJSON(`day-${date}`, { date, plan: { subject: '', intro: '', order: [], skip: true }, pieces: [] });
  const f3 = fakeResend();
  assert.equal((await morningRun({ now, deskStore, store: memStore(), origin: 'https://x.test', resend, fetchFn: f3.fn, log: quiet })).reason, 'skip');
  assert.equal(f3.calls.length, 0);
});

test('approved pieces with no subject still go out under the dated subject; an unchecked open is dropped', async () => {
  const date = '2026-12-02';
  const desk = memStore();
  await desk.setJSON(`day-${date}`, { date, plan: { subject: '', intro: 'Big night [CHECK: time]', order: ['p-one'], skip: false }, pieces: [piece] });
  const ed = await deskEdition(desk, date, 'https://x.test');
  assert.equal(ed.subject, 'Heart of Columbus, Wednesday, December 2');
  assert.ok(!ed.html.includes('Big night'), 'the open with a [CHECK] is left out');
  assert.equal(ed.notes.length, 2);
});

test('remaking a draft updates the Resend draft in place instead of leaving two', async () => {
  const store = memStore();
  const { calls, fn } = fakeResend();
  const ed = { subject: 'One', html: '<body>1</body>', fresh: 1, from: 'desk' };
  const date = '2026-12-02';
  assert.equal((await makeDraft({ resend, date, store, fetchFn: fn, log: quiet, edition: ed })).reason, 'drafted');
  const first = (await store.getJSON(`draft-${date}`)).id;
  assert.equal((await makeDraft({ resend, date, store, fetchFn: fn, log: quiet, edition: { ...ed, subject: 'Two' }, force: true })).reason, 'updated');
  const patch = calls.find((c) => c.method === 'PATCH');
  assert.ok(patch.url.endsWith(`/broadcasts/${first}`) && patch.body.subject === 'Two');
  assert.equal(calls.filter((c) => c.method === 'POST').length, 1, 'only one broadcast was ever created');
  // An already sent broadcast can't be updated: a fresh draft is made.
  const sentAlready = async (url, init = {}) => (init.method === 'PATCH' ? new Response('sent', { status: 422 }) : fn(url, init));
  assert.equal((await makeDraft({ resend, date, store, fetchFn: sentAlready, log: quiet, edition: ed, force: true })).reason, 'drafted');
});

test('the morning note says whether a draft is waiting, and needs an address', async () => {
  const { calls, fn } = fakeResend();
  assert.equal(await notify({ resend, to: '', date: '2026-12-02', result: { ok: true, reason: 'drafted' }, fetchFn: fn }), false);
  assert.equal(await notify({ resend, to: 'me@example.org, bad', date: '2026-12-02', result: { ok: true, reason: 'nothing-new' }, fetchFn: fn }), true);
  assert.deepEqual(calls[0].body.to, ['me@example.org']);
  assert.match(calls[0].body.subject, /no draft/);
  assert.match(calls[0].body.text, /36 hours/);
  assert.ok(!/[—–]| - /.test(calls[0].body.text + calls[0].body.subject));
});

test('the subject and open meet the piece rules before the desk makes a draft', () => {
  assert.deepEqual(planBlockers({ subject: 'Lights up Friday', intro: 'Good morning.' }), []);
  assert.match(planBlockers({ subject: 'Lights — Friday' }).join(' '), /dash/);
  assert.match(planBlockers({ intro: 'At [CHECK: time]' }).join(' '), /\[CHECK\]/);
  const fn = readFileSync(new URL('../netlify/functions/desk.mjs', import.meta.url), 'utf8');
  assert.match(fn, /planBlockers\(day\.plan\)/, 'the desk refuses a draft with an unchecked subject or open');
});

test('the build writes two weeks of editions, so a quiet stretch never leaves a morning without one', () => {
  assert.equal(upcomingEditions(new Date('2026-12-01T12:00:00Z')).length, 14);
});

test('signup adds a confirmed reader to the segment, including one Resend already knows', async () => {
  const calls = [];
  const known = async (url, init = {}) => { calls.push({ url, method: init.method }); return new Response('{}', { status: url.endsWith('/contacts') ? 409 : 200 }); };
  assert.equal(await addContact('a@b.co', { key: 'k', audience: 'seg' }, known), true);
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url.replace('https://api.resend.com', '')}`), ['POST /contacts', 'POST /contacts/a%40b.co/segments/seg', 'PATCH /contacts/a%40b.co']);
});

const RSS = `<?xml version="1.0"?><rss><channel><title>Feed</title>
<item><title><![CDATA[Road closed &#8211; Main St]]></title><link>https://example.gov/a</link><pubDate>Wed, 25 Nov 2026 18:56:21 +0000</pubDate></item>
<item><title>Old news</title><link>https://example.gov/b</link><pubDate>Mon, 02 Nov 2026 10:00:00 +0000</pubDate></item>
<item><title>No link</title></item></channel></rss>`;
const JEV = `<rss><channel><item><title>30 Nov 2026 10:00 : Commissioners Meeting</title><link>https://example.gov/m</link><pubDate>Wed, 28 Oct 2026 10:45:02 +0000</pubDate></item>
<item><title>27 Nov 2026 08:00 : COUNTY OFFICES CLOSED - THANKSGIVING</title><link>https://example.gov/c</link></item>
<item><title>20 Jan 2027 10:00 : Far off</title><link>https://example.gov/f</link></item></channel></rss>`;

test('the gatherer keeps only a title, a link and a date, cleaned of dashes', () => {
  const rss = parseRss(RSS);
  assert.equal(rss.length, 2);
  assert.equal(rss[0].title, 'Road closed, Main St');
  assert.deepEqual(Object.keys(rss[0]).sort(), ['published', 'title', 'url']);
  const wp = parseWp([{ date_gmt: '2026-11-25T14:20:55', link: 'https://example.gov/d', title: { rendered: 'City Council Minutes &#8211; 11/04/26' } }, { link: 'javascript:alert(1)', title: { rendered: 'x' } }]);
  assert.deepEqual(wp, [{ title: 'City Council Minutes, 11/04/26', url: 'https://example.gov/d', published: '2026-11-25T14:20:55Z' }]);
  const jev = parseJevents(JEV);
  assert.equal(jev[0].on, '2026-11-30');
  assert.equal(jev[0].time, '10:00');
  assert.equal(jev[1].title, 'County Offices Closed, Thanksgiving');
  const nws = parseNws({ features: [{ properties: { id: 'u1', event: 'Winter Storm Warning', headline: 'Winter Storm Warning issued — tonight', ends: '2026-11-28T12:00:00Z' } }] }, 'https://forecast.example');
  assert.equal(nws[0].title, 'Winter Storm Warning issued, tonight');
  assert.equal(nws[0].url, 'https://forecast.example');
  assert.equal(parseEvents({ events: [{ title: 'Story time', venue: 'Library', date: '2026-11-27', url: '' }] }, 'https://x.test')[0].url, 'https://x.test/events/');
});

test('fresh means posted in the last three days, or a meeting in the next eight', () => {
  const now = new Date('2026-11-27T09:15:00Z');
  assert.deepEqual(freshOnly(parseRss(RSS), 'rss', now).map((x) => x.url), ['https://example.gov/a']);
  assert.deepEqual(freshOnly(parseJevents(JEV), 'jevents', now).map((x) => x.url), ['https://example.gov/m', 'https://example.gov/c']);
});

test('a night of gathering reports each source, keeps going past a failure, and flags new leads once', async () => {
  const fetchFn = async (url, init) => {
    assert.match(init.headers['user-agent'], /HeartOfColumbus-leads/);
    if (url.includes('wp-json/wp/v2/posts')) return new Response('nope', { status: 500 });
    if (url.includes('dlp_document')) return new Response(JSON.stringify([{ date_gmt: '2026-11-26T14:00:00', link: 'https://www.columbus.in.gov/document/agenda/', title: { rendered: 'City Council Meeting Agenda' } }]));
    if (url.includes('news-article-list')) return new Response(RSS);
    if (url.includes('jevents')) return new Response(JEV);
    if (url.includes('weather.gov')) return new Response(JSON.stringify({ features: [] }));
    if (url.includes('/api/events')) return new Response(JSON.stringify({ events: [{ title: 'Story time', venue: 'Library', date: '2026-11-27', url: 'https://bcpl.example/e' }] }));
    throw new Error(`unexpected ${url}`);
  };
  const now = new Date('2026-11-27T09:15:00Z');
  const store = memStore();
  const a = await gatherInto(store, { fetchFn, now, origin: 'https://x.test' });
  assert.equal(a.date, '2026-11-27');
  assert.deepEqual(a.sources.map((s) => s.ok), [false, true, true, true, true, true]);
  assert.match(a.sources[0].error, /500/);
  assert.ok(a.items.length >= 5 && a.items.every((x) => x.new));
  assert.ok(a.items.every((x) => x.url && x.title && x.source));
  const b = await gatherInto(store, { fetchFn, now: new Date('2026-11-28T09:15:00Z'), origin: 'https://x.test' });
  const again = b.items.find((x) => x.url === 'https://www.columbus.in.gov/document/agenda/');
  assert.equal(again.new, false, 'seen yesterday, not new today');
  assert.ok(!(await gather({ fetchFn, now, origin: 'https://x.test', sources: [] })).items.length);
});

test('every lead source names a first-hand public source and when it was checked', () => {
  for (const s of SOURCES) {
    assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/, s.id);
    assert.ok(s.url && s.home && s.name, s.id);
    assert.ok(!/therepublic|wthr|wishtv|wrtv|fox59|indystar/i.test(s.url), 'no other newsroom is scraped');
  }
});

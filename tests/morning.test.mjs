// The newsletter end to end: both clocks across daylight time, one edition
// per date and kind, scheduling in Resend scoped to each edition's topic,
// Hold, the note, the new sections, Up the road, signup choices, and the
// overnight lead gathering.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { editionRun, makeBroadcast, assemble, notify, config } from '../netlify/functions/newsletter.mjs';
import { config as eveningConfig } from '../netlify/functions/newsletter-evening.mjs';
import { handle as hold } from '../netlify/functions/hold.mjs';
import { addContact, topicsFor, cleanChoice } from '../netlify/functions/subscribe.mjs';
import { gatherInto } from '../netlify/functions/leads.mjs';
import { parseRss, parseWp, parseJevents, parseNws, parseEvents, freshOnly, gather, SOURCES } from '../src/news/gather.mjs';
import { planBlockers } from '../src/news/desk.mjs';
import { upcomingEditions, spotlightCandidates, designList } from '../src/news/editions.mjs';
import {
  EDITIONS, plan, columbusMinutes, columbusInstant, keysFor, composeEdition, roadHtml, roadBlockers, cleanRoad,
  pickSpotlight, spotlightHtml, pickDesign, designHtml, listingChanges, changesHtml, lookout, lookoutHtml, subjectFor,
} from '../src/news/paper-mail.mjs';

const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };
const quiet = () => {};
const piece = { id: 'p-one', status: 'approved', shape: 'brief', headline: 'Council meets Monday', body: 'The council meets Monday at 6 PM.', sources: [{ url: 'https://www.columbus.in.gov/document/x/' }] };
const resend = { key: 'rk', segment: 'seg', from: 'Heart of Columbus <news@example.org>', topics: { morning: 'top-m', evening: 'top-e' } };
const DASH = /[–—]| - /;

const DAILY = {
  spotlight: [
    { slug: 'plain-shop', name: 'Plain Shop', address: '1 Main St', type: 'Hardware.', kind: 'Shops', tier: 'listed', order: 0, hours: [[3, 540, 1020]] },
    { slug: 'paid-shop', name: 'Paid Shop', address: '2 Main St', type: 'Bakery.', kind: 'Sweets', tier: 'member', member: true, order: 1, hours: [] },
  ],
  design: [{ id: 'l:firstchristian', order: 0, name: 'First Christian Church', architect: 'Eliel Saarinen', year: 1942, street: '531 Fifth Street', what: 'A church.', link: 'https://x.test/l/firstchristian/', source: 'https://en.wikipedia.org/wiki/First_Christian_Church_(Columbus,_Indiana)', sourceName: 'Wikipedia', photo: { src: 'https://upload.wikimedia.org/a.jpg', credit: 'T G Hess', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:a.jpg' } }],
  snapshot: { 'plain-shop': { name: 'Plain Shop', address: '1 Main St', phone: '', hours: null, tempClosed: false, closed: false, order: [], book: [], store: '' } },
};

function fakeNet({ daily = DAILY, parts = null, events = [], scheduleOk = true, savedAudience, history = [], historyPages = {} } = {}) {
  const calls = [];
  let audience;
  const fn = async (url, init = {}) => {
    calls.push({ url, method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null });
    if (url.includes('/newsletter/daily.json')) return daily ? new Response(JSON.stringify(daily)) : new Response('', { status: 404 });
    if (url.includes('/newsletter/editions/')) return parts ? new Response(JSON.stringify(parts)) : new Response('', { status: 404 });
    if (url.includes('/api/events')) return new Response(JSON.stringify({ events }));
    if (url.includes('/broadcasts?limit=100')) {
      const cursor = new URL(url).searchParams.get('after') || '';
      const page = Object.hasOwn(historyPages, cursor) ? historyPages[cursor] : { data: history, has_more: false };
      return history === null || page === null ? new Response('', { status: 503 }) : Response.json(page);
    }
    if (url.endsWith('/send')) return new Response(scheduleOk ? '{}' : 'no', { status: scheduleOk ? 200 : 422 });
    if (url.includes('api.resend.com/broadcasts')) {
      if (!init.method) return (savedAudience === null)
        ? new Response('', { status: 503 })
        : Response.json(savedAudience ?? audience);
      const { segment_id, topic_id } = JSON.parse(init.body);
      audience = { status: 'draft', segment_id, topic_id };
    }
    return new Response(JSON.stringify({ id: `b${calls.length}` }), { status: 200 });
  };
  return { calls, fn };
}
const run = (kind, iso, { store = memStore(), deskStore = memStore(), net = fakeNet(), r = resend, notifyTo = '' } = {}) =>
  editionRun({ kind, now: new Date(iso), deskStore, store, origin: 'https://x.test', resend: r, notifyTo, fetchFn: net.fn, log: quiet });

test('two jobs, each waking at both UTC hours: morning 6:15 and evening 5:30, Columbus time', () => {
  assert.equal(config.schedule, EDITIONS.morning.wake);
  assert.equal(eveningConfig.schedule, EDITIONS.evening.wake);
  assert.equal(config.schedule, '15 10,11 * * *');
  assert.equal(eveningConfig.schedule, '30 21,22 * * *');
  assert.deepEqual([EDITIONS.morning.deadline, EDITIONS.morning.draft, EDITIONS.morning.send], [370, 375, 405]);
  assert.deepEqual([EDITIONS.evening.deadline, EDITIONS.evening.draft, EDITIONS.evening.send], [1045, 1050, 1080]);
});

test('both clocks act at the first wake after the draft time, in winter, in summer and across each change', () => {
  // [wake, kind, step]: EST is UTC-5, EDT is UTC-4. 2027-03-14 and 2026-11-01 are the change days.
  const cases = [
    ['2026-12-02T10:15:00Z', 'morning', 'early'], ['2026-12-02T11:15:00Z', 'morning', 'send'],
    ['2026-07-01T10:15:00Z', 'morning', 'send'], ['2026-07-01T11:15:00Z', 'morning', 'send'],
    ['2027-03-14T10:15:00Z', 'morning', 'send'], ['2026-11-01T10:15:00Z', 'morning', 'early'], ['2026-11-01T11:15:00Z', 'morning', 'send'],
    ['2026-12-02T21:30:00Z', 'evening', 'early'], ['2026-12-02T22:30:00Z', 'evening', 'send'],
    ['2026-07-01T21:30:00Z', 'evening', 'send'], ['2027-03-14T21:30:00Z', 'evening', 'send'], ['2026-11-01T21:30:00Z', 'evening', 'early'],
  ];
  for (const [iso, kind, step] of cases) assert.equal(plan(kind, new Date(iso)).step, step, `${kind} ${iso}`);
  // The send instant is 6:45 AM and 6:00 PM local on both sides of each change.
  assert.equal(columbusInstant('2026-12-02', 405).toISOString(), '2026-12-02T11:45:00.000Z');
  assert.equal(columbusInstant('2026-07-01', 405).toISOString(), '2026-07-01T10:45:00.000Z');
  assert.equal(columbusInstant('2027-03-14', 405).toISOString(), '2027-03-14T10:45:00.000Z');
  assert.equal(columbusInstant('2026-11-01', 1080).toISOString(), '2026-11-01T23:00:00.000Z');
  assert.equal(columbusInstant('2026-03-07', 1080).toISOString(), '2026-03-07T23:00:00.000Z');
  assert.equal(plan('morning', new Date('2026-12-02T11:15:00Z')).at, '2026-12-02T11:45:00.000Z');
  assert.equal(plan('evening', new Date('2026-07-01T21:30:00Z')).at, '2026-07-01T22:00:00.000Z');
  assert.equal(columbusMinutes(new Date('2026-12-02T11:15:00Z')), 6 * 60 + 15);
  // Long after the send time, the job makes a draft only.
  assert.equal(plan('morning', new Date('2026-12-02T15:00:00Z')).step, 'late');
});

test('the morning job schedules one broadcast for its topic, at 6:45, once a day', async () => {
  const store = memStore();
  const net = fakeNet();
  assert.equal((await run('morning', '2026-12-02T10:15:00Z', { store, net })).reason, 'early');
  assert.equal(net.calls.length, 0);
  const r = await run('morning', '2026-12-02T11:15:00Z', { store, net });
  assert.equal(r.reason, 'scheduled');
  const made = net.calls.find((c) => c.url.endsWith('/broadcasts') && c.method === 'POST');
  assert.equal(made.body.segment_id, 'seg');
  assert.equal(made.body.topic_id, 'top-m', 'scoped to the morning topic');
  assert.match(made.body.html, /RESEND_UNSUBSCRIBE_URL/);
  assert.match(made.body.html, /Choose morning, evening or both/, 'the footer links to the preferences page');
  const send = net.calls.find((c) => c.url.endsWith('/send'));
  assert.equal(send.body.scheduled_at, '2026-12-02T11:45:00.000Z');
  const read = net.calls.find((c) => c.method === 'GET' && c.url.includes('api.resend.com/broadcasts/'));
  assert.ok(read && net.calls.indexOf(read) < net.calls.indexOf(send));
  assert.equal((await run('morning', '2026-12-02T11:16:00Z', { store, net })).reason, 'ran', 'a retry does nothing');
  const rec = await store.getJSON('draft-2026-12-02');
  assert.ok(rec.scheduled && rec.holdHash && rec.holdHash.length === 64, 'the hold code is kept only as a hash');
  assert.ok(await store.getJSON('run-2026-12-02'));
});

test('the evening edition goes to its own topic and its own records', async () => {
  const store = memStore();
  const net = fakeNet();
  assert.equal((await run('evening', '2026-12-02T22:30:00Z', { store, net })).reason, 'scheduled');
  const made = net.calls.find((c) => c.url.endsWith('/broadcasts'));
  assert.equal(made.body.topic_id, 'top-e');
  assert.match(made.body.html, /The evening edition/);
  assert.equal(net.calls.find((c) => c.url.endsWith('/send')).body.scheduled_at, '2026-12-02T23:00:00.000Z');
  assert.ok(await store.getJSON('run-2026-12-02-evening'));
  assert.equal(await store.getJSON('run-2026-12-02'), null, 'the morning record is untouched');
});

test('the desk edition wins in its own edition, a desk draft is updated in place, and No edition sends nothing', async () => {
  const date = '2026-12-02';
  const store = memStore(), deskStore = memStore();
  await deskStore.setJSON(`day-${date}-evening`, { date, plan: { subject: 'Tonight', intro: 'Hi there.\nSecond line.', order: ['p-one', 'p2', 'p3'], skip: false }, pieces: [piece, { ...piece, id: 'p2', headline: 'Two' }, { ...piece, id: 'p3', headline: 'Three' }] });
  await store.setJSON(`draft-${date}-evening`, { id: 'mine', via: 'resend', at: 'x' });
  const net = fakeNet();
  assert.equal((await run('evening', '2026-12-02T22:30:00Z', { store, deskStore, net })).reason, 'scheduled');
  const patch = net.calls.find((c) => c.method === 'PATCH');
  assert.ok(patch.url.endsWith('/broadcasts/mine'), 'the desk draft is updated, not duplicated');
  assert.equal(patch.body.subject, 'Tonight');
  assert.ok(patch.body.html.includes('Two') && !patch.body.html.includes('>Three<'), 'the evening takes at most two pieces');
  assert.ok(patch.body.html.includes('Hi there.') && !patch.body.html.includes('Second line'), 'a one line open');
  assert.equal(net.calls.filter((c) => c.url.endsWith('/broadcasts') && c.method === 'POST').length, 0);
  assert.ok(net.calls.find((c) => c.url.endsWith('/broadcasts/mine/send')));
  // The morning of the same date is a separate plan.
  const m = await assemble({ kind: 'morning', date, deskStore, store: memStore(), origin: 'https://x.test', fetchFn: fakeNet().fn });
  assert.equal(m.from, 'auto');
  await deskStore.setJSON(`day-${date}`, { date, plan: { skip: true, order: [] }, pieces: [] });
  const n3 = fakeNet();
  assert.equal((await run('morning', '2026-12-02T11:15:00Z', { deskStore, net: n3 })).reason, 'skip');
  assert.equal(n3.calls.length, 0);
});

test('an edition is never scheduled twice, and a broadcast Resend will not schedule is reported, not sent', async () => {
  const store = memStore();
  await store.setJSON('draft-2026-12-02', { id: 'b9', via: 'resend', scheduled: '2026-12-02T11:45:00Z' });
  const net = fakeNet();
  const r = await makeBroadcast({ kind: 'morning', date: '2026-12-02', store, resend, subject: 's', html: 'h', fetchFn: net.fn, log: quiet });
  assert.equal(r.reason, 'already-scheduled');
  assert.equal(net.calls.length, 0);
  assert.equal((await run('morning', '2026-12-02T11:15:00Z', { net: fakeNet({ scheduleOk: false }) })).reason, 'not-scheduled');
  assert.equal((await run('morning', '2026-12-02T15:00:00Z', { net: fakeNet() })).reason, 'late', 'too late to send: a draft only');
});

test('an edition needs the weather plus one more section, or it is skipped', async () => {
  const thin = composeEdition({ kind: 'evening', date: '2026-12-02' });
  assert.equal(thin.substance, 0);
  assert.deepEqual(thin.sections, ['Weather']);
  const net = fakeNet({ daily: null });
  const r = await run('evening', '2026-12-02T22:30:00Z', { net });
  assert.equal(r.reason, 'thin');
  assert.equal(net.calls.filter((c) => c.url.includes('/broadcasts')).length, 0);
});

test('an unreadable or mismatched audience leaves the edition in draft and tells the publisher', async () => {
  for (const savedAudience of [
    null,
    { status: 'draft', segment_id: 'other-segment', topic_id: 'top-e' },
    { status: 'draft', segment_id: 'seg', topic_id: 'top-m' },
    { status: 'draft', segment_id: 'seg', topic_id: null },
    { status: 'sent', segment_id: 'seg', topic_id: 'top-e' },
  ]) {
    const store = memStore();
    const net = fakeNet({ savedAudience });
    const result = await run('evening', '2026-12-02T22:30:00Z', { store, net, notifyTo: 'publisher@example.org' });
    assert.equal(result.reason, 'audience-unverified');
    assert.equal(result.ok, false);
    assert.ok((await store.getJSON('draft-2026-12-02-evening')).id);
    assert.equal(net.calls.some((call) => call.url.endsWith('/send')), false);
    const note = net.calls.find((call) => call.url.endsWith('/emails'));
    assert.match(note.body.text, /did not confirm draft status and the expected segment and topic/);
    assert.doesNotMatch(note.body.text, /Hold it:/);
  }
  const legacy = fakeNet({ savedAudience: { status: 'draft', audience_id: 'seg', topic_id: 'top-m' } });
  assert.equal((await run('morning', '2026-12-02T11:15:00Z', { net: legacy })).reason, 'scheduled');
});

test('each Resend edition must have its own topic before making a broadcast', async () => {
  for (const [kind, time] of [['morning', '11:15'], ['evening', '22:30']]) {
    const net = fakeNet();
    const r = { ...resend, topics: { ...resend.topics, [kind]: '' } };
    const result = await run(kind, `2026-12-02T${time}:00Z`, { net, r, notifyTo: 'publisher@example.org' });
    assert.equal(result.reason, 'no-topic');
    assert.equal(net.calls.some(({ url }) => url.includes('/broadcasts')), false);
    assert.match(net.calls.find(({ url }) => url.endsWith('/emails')).body.text, new RegExp(`RESEND_TOPIC_${kind.toUpperCase()}`));
  }
});

test('the site does not reschedule an edition already sent or queued by a temporary task', async () => {
  const date = '2026-12-02';
  const iso = date + 'T11:15:00Z';
  const outside = { id: 'outside', name: `Morning edition ${date} (from heartofcolumbus.shop)`, segment_id: 'seg', status: 'sent' };
  for (const status of ['sent', 'scheduled', 'queued']) {
    const store = memStore();
    const net = fakeNet({ history: [{ ...outside, status }] });
    const r = await run('morning', iso, { store, net });
    assert.equal(r.reason, 'already-in-resend');
    assert.equal(r.id, 'outside');
    assert.equal(net.calls.some(call => call.url.includes('/broadcasts') && call.method === 'POST'), false);
    assert.equal((await store.getJSON(`run-${date}`)).reason, 'already-in-resend');
  }
  const other = fakeNet({ history: [{ ...outside, segment_id: 'another' }, { ...outside, status: 'draft' }] });
  assert.equal((await run('morning', iso, { net: other })).reason, 'scheduled');
  const unavailable = fakeNet({ history: null });
  assert.equal((await run('morning', iso, { net: unavailable })).reason, 'history-unverified');
  assert.equal(unavailable.calls.some(call => call.url.includes('/broadcasts') && call.method === 'POST'), false);
});

test('history follows the cursor and treats a partially sent canceled edition as an existing copy', async () => {
  const iso = '2026-12-02T11:15:00Z';
  const first = { data: [{ id: 'cursor', name: 'Other broadcast' }], has_more: true };
  const sent = {
    id: 'outside', name: 'Morning edition 2026-12-02', status: 'canceled',
    audience_id: 'seg', sent_at: '2026-12-02T10:00:00Z',
  };
  const net = fakeNet({ historyPages: { '': first, cursor: { data: [sent], has_more: false } } });
  assert.equal((await run('morning', iso, { net })).reason, 'already-in-resend');
  assert.equal(net.calls.some(({ url }) => url.endsWith('after=cursor')), true);
  for (const next of [null, first, { data: [{ ...sent, audience_id: null }], has_more: false }]) {
    const failed = fakeNet({ historyPages: { '': first, cursor: next } });
    assert.equal((await run('morning', iso, { net: failed })).reason, 'history-unverified');
    assert.equal(failed.calls.some(({ url, method }) => url.includes('/broadcasts') && method === 'POST'), false);
  }
});

test('Hold cancels the scheduled send and keeps the draft, with the desk key or that edition\'s code only', async () => {
  const store = memStore();
  const net = fakeNet();
  const notes = [];
  const fetchFn = async (url, init = {}) => { if (url.endsWith('/emails')) notes.push(JSON.parse(init.body)); return net.fn(url, init); };
  await editionRun({ kind: 'morning', now: new Date('2026-12-02T11:15:00Z'), deskStore: memStore(), store, origin: 'https://x.test', resend, notifyTo: 'jake@example.org', fetchFn, log: quiet });
  const link = notes[0].text.match(/Hold it: (\S+)/)[1];
  assert.match(link, /^https:\/\/x\.test\/newsroom\/hold\/#t=[0-9a-f]{48}&d=2026-12-02&e=morning$/, 'the code rides after #, never in a query string');
  const code = link.match(/#t=([0-9a-f]+)/)[1];
  const calls = [];
  const rf = async (url, init = {}) => { calls.push({ url, method: init.method }); return new Response('{}'); };
  const req = (k, body = { date: '2026-12-02', edition: 'morning' }) => new Request('https://x.test/api/hold', { method: 'POST', headers: { 'x-hoc-key': k, 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const realNow = Date.now;
  Date.now = () => Date.parse('2026-12-02T11:20:00Z');
  try {
    assert.equal((await hold(req('nope'), { store, adminKey: 'admin-key-1234', resend, fetchFn: rf })).status, 403);
    assert.equal((await hold(req(code, { date: '2026-12-02', edition: 'evening' }), { store, adminKey: 'admin-key-1234', resend, fetchFn: rf })).status, 403, 'a morning code cannot hold the evening');
    const get = await hold(new Request('https://x.test/api/hold?date=2026-12-02&edition=morning', { headers: { 'x-hoc-key': code } }), { store, adminKey: '', resend, fetchFn: rf });
    assert.equal(get.status, 200);
    assert.equal(calls.length, 0, 'opening the link (a GET) holds nothing');
    const ok = await hold(req(code), { store, adminKey: '', resend, fetchFn: rf });
    assert.equal(ok.status, 200);
    const rec = await store.getJSON('draft-2026-12-02');
    assert.ok(calls[0].url.endsWith(`/broadcasts/${rec.id}/cancel`) && calls[0].method === 'POST');
    assert.ok(rec.held && !rec.scheduled && rec.id, 'held, and the draft is kept');
    assert.equal((await (await hold(req('admin-key-1234'), { store, adminKey: 'admin-key-1234', resend, fetchFn: rf })).json()).already, true, 'the desk key works too');
  } finally { Date.now = realNow; }
});

test('the note gives the subject, a preview link and the Hold link, then the edition', async () => {
  const calls = [];
  const fn = async (url, init) => { calls.push(JSON.parse(init.body)); return new Response('{}'); };
  assert.equal(await notify({ resend, to: '', kind: 'morning', date: '2026-12-02', result: { ok: true, reason: 'scheduled' }, fetchFn: fn }), false);
  assert.equal(await notify({ resend, to: 'me@example.org, bad', kind: 'evening', date: '2026-12-02', result: { ok: true, reason: 'scheduled', subject: 'Tonight', id: 'b7', via: 'resend' }, hold: 'https://x.test/newsroom/hold/#t=abc&d=2026-12-02&e=evening', html: '<body><p>Edition body</p></body>', fetchFn: fn }), true);
  const n = calls[0];
  assert.deepEqual(n.to, ['me@example.org']);
  assert.match(n.subject, /^Evening edition Wednesday, December 2: goes out at 6:00 PM$/);
  assert.match(n.text, /Subject: Tonight/);
  assert.match(n.text, /Preview: https:\/\/resend\.com\/broadcasts\/b7/);
  assert.match(n.text, /Hold it: https:\/\/x\.test\/newsroom\/hold\//);
  assert.match(n.html, /Edition body/);
  await notify({ resend, to: 'me@example.org', kind: 'evening', date: '2026-12-02', result: { ok: true, reason: 'thin' }, fetchFn: fn });
  assert.match(calls[1].subject, /no edition/);
  for (const c of calls) assert.ok(!DASH.test(c.subject + c.text), 'no dashes');
});

test('Up the road: an IndyStar link pasted by hand, credited, with the publisher\'s note', () => {
  const r = { url: 'https://www.indystar.com/story/news/2026/11/27/x/1/', headline: 'Something up the road', comment: 'Worth a read.' };
  const html = roadHtml(r);
  assert.match(html, /<a href="https:\/\/www\.indystar\.com\/story\/news\/2026\/11\/27\/x\/1\/">Something up the road<\/a> <small>via IndyStar<\/small>/);
  assert.match(html, /The publisher’s note:<\/em> Worth a read\./);
  assert.equal(roadHtml({ ...r, comment: '' }).includes('publisher'), false, 'the comment is optional');
  assert.equal(cleanRoad({ ...r, url: 'https://www.therepublic.com/x' }).url, '', 'only indystar.com');
  assert.equal(cleanRoad({ ...r, url: 'http://www.indystar.com/x' }).url, '', 'https only');
  assert.equal(roadHtml({ ...r, url: 'javascript:alert(1)' }), '');
  assert.match(roadBlockers({ ...r, headline: 'Up — the road' }).join(' '), /dash/);
  assert.match(roadBlockers({ ...r, comment: 'Read [CHECK: date]' }).join(' '), /\[CHECK\]/);
  assert.match(roadBlockers({ url: 'https://www.indystar.com/x', headline: '' }).join(' '), /headline/);
  assert.deepEqual(roadBlockers({}), []);
  assert.equal(roadHtml({ ...r, headline: 'Up — the road' }), '', 'a dash keeps it out of the edition');
  const ed = composeEdition({ kind: 'morning', date: '2026-12-02', road: r });
  assert.ok(ed.sections.includes('Up the road'));
  // The desk's plan check covers it too.
  assert.match(planBlockers({ subject: 'Ok', road: { url: 'https://example.com/x', headline: 'h' } }).join(' '), /indystar/);
});

test('the subject and open keep the [CHECK] and dash rules; a bad subject falls back to the dated one', async () => {
  assert.deepEqual(planBlockers({ subject: 'Lights up Friday', intro: 'Good morning.' }), []);
  assert.match(planBlockers({ subject: 'Lights — Friday' }).join(' '), /dash/);
  assert.match(planBlockers({ intro: 'At [CHECK: time]' }).join(' '), /\[CHECK\]/);
  assert.equal(subjectFor('morning', '2026-12-02', 'Heart of Columbus', 'Lights – Friday'), 'Heart of Columbus, Wednesday, December 2');
  assert.equal(subjectFor('evening', '2026-12-02', 'Heart of Columbus', ''), 'Heart of Columbus tonight, Wednesday, December 2');
  const desk = memStore();
  await desk.setJSON('day-2026-12-02', { date: '2026-12-02', plan: { subject: '', intro: 'Big night [CHECK: time]', order: ['p-one'], skip: false, road: { url: 'https://www.indystar.com/x', headline: 'A — B' } }, pieces: [piece] });
  const ed = await assemble({ kind: 'morning', date: '2026-12-02', deskStore: desk, origin: 'https://x.test', fetchFn: fakeNet().fn });
  assert.equal(ed.subject, 'Heart of Columbus, Wednesday, December 2');
  assert.ok(!ed.html.includes('Big night') && !ed.html.includes('Up the road'));
  assert.equal(ed.notes.length, 2);
  const fn = readFileSync(new URL('../netlify/functions/desk.mjs', import.meta.url), 'utf8');
  assert.match(fn, /planBlockers\(day\.plan\)/, 'the desk refuses a draft with an unchecked subject, open or Up the road');
});

test('Shop Local Spotlight: members first, never the same business twice in 30 days, ties said in the box', () => {
  const c = DAILY.spotlight;
  assert.equal(pickSpotlight(c, {}, '2026-12-02').slug, 'paid-shop', 'Founding Members come first');
  assert.equal(pickSpotlight(c, { 'paid-shop': '2026-12-01' }, '2026-12-02').slug, 'plain-shop');
  assert.equal(pickSpotlight(c, { 'paid-shop': '2026-11-20', 'plain-shop': '2026-11-25' }, '2026-12-02'), null, 'nobody twice in 30 days');
  assert.equal(pickSpotlight(c, { 'paid-shop': '2026-11-02' }, '2026-12-02').slug, 'paid-shop', 'free again after 30 days');
  assert.match(spotlightHtml(c[1], 'https://x.test'), /Founding Member: this business pays Heart of Columbus/);
  assert.match(spotlightHtml({ ...c[0], family: 'Run by the publisher.', adult: true }, 'https://x.test'), /Run by the publisher\. For adults 21 and over\./);
  const real = spotlightCandidates();
  assert.ok(real.length > 100);
  assert.ok(real.every((b) => b.slug && b.name && b.address && ['member', 'claimed', 'featured', 'listed'].includes(b.tier)));
  assert.ok(real.some((b) => b.tier === 'member'), 'Founding Members are in the rotation');
  // Thirty days in a row never repeat.
  const hist = {};
  const seen = [];
  for (let i = 0; i < 30; i++) { const d = new Date(Date.UTC(2026, 11, 1 + i)).toISOString().slice(0, 10); const p = pickSpotlight(real, hist, d); hist[p.slug] = d; seen.push(p.slug); }
  assert.equal(new Set(seen).size, 30);
});

test('Columbus by Design: one building a night, Commons photos only, credited, never a business photo', () => {
  const list = designList();
  assert.ok(list.length >= 20);
  for (const d of list) {
    assert.ok(d.name && d.id && (d.year || d.what), d.id);
    if (d.photo) assert.match(d.photo.src, /^https:\/\/upload\.wikimedia\.org\//, d.id);
    assert.ok(!DASH.test(`${d.name} ${d.what} ${d.street} ${d.year}`), d.id);
  }
  assert.ok(list.some((d) => d.id.startsWith('h:')) && list.some((d) => d.id.startsWith('n:')));
  const html = designHtml(DAILY.design[0]);
  assert.match(html, /Photo: T G Hess\. License: CC BY-SA 4\.0\. <a href="https:\/\/commons\.wikimedia\.org\/wiki\/File:a\.jpg">Source<\/a> \(Wikimedia Commons\)/);
  assert.match(html, /Architect: Eliel Saarinen\. Year: 1942\. Where: 531 Fifth Street\./);
  assert.ok(!designHtml({ ...DAILY.design[0], photo: { ...DAILY.design[0].photo, src: 'https://example.com/x.jpg' } }).includes('<img'), 'a photo from anywhere else is left out');
  assert.equal(pickDesign(list, { [list[0].id]: '2026-12-01' }, '2026-12-02').id, list[1].id, 'the next one in turn');
});

test('Open, Closed, New Hours lists what changed in the listings, and says to call ahead', () => {
  const base = { name: 'A', address: '1 St', phone: '', hours: [[1, 480, 1020]], tempClosed: false, closed: false, order: [], book: [], store: '' };
  const before = { a: base, b: { ...base, name: 'B' }, c: { ...base, name: 'C' } };
  const after = { a: base, b: { ...base, name: 'B', closed: true }, c: { ...base, name: 'C', hours: [[1, 480, 1020], [2, 480, 1020]] }, d: { ...base, name: 'D' } };
  const rows = listingChanges(before, after);
  assert.deepEqual(rows.map((r) => r.what).sort(), ['Listed as closed', 'New', 'New hours']);
  assert.match(changesHtml(rows, 'https://x.test'), /call ahead/);
  assert.equal(listingChanges(null, after), null, 'the first run only stores a baseline');
  assert.equal(composeEdition({ kind: 'morning', date: '2026-12-02', changes: [] }).sections.includes('Open, Closed, New Hours'), false, 'left out when empty');
});

test('Lookout: today in the morning, tomorrow and the next few days in the evening, from events and meetings', () => {
  const events = [
    { title: 'Story time', date: '2026-12-02', start: 600, venue: 'Library', url: 'https://bcpl.example/1' },
    { title: 'Lights', date: '2026-12-03', start: 1080, venue: 'Mill Race Park', url: 'https://x/2' },
    { title: 'Far', date: '2026-12-09', venue: 'Park', url: 'https://x/3' },
  ];
  const leads = { items: [{ kind: 'meeting', on: '2026-12-04', time: '10:00', title: 'Commissioners Meeting', source: 'Bartholomew County', url: 'https://bartholomew.example/m' }] };
  assert.deepEqual(lookout('morning', '2026-12-02', { events, leads }).map((x) => x.title), ['Story time']);
  assert.deepEqual(lookout('evening', '2026-12-02', { events, leads }).map((x) => x.title), ['Lights', 'Commissioners Meeting']);
  const html = lookoutHtml(lookout('evening', '2026-12-02', { events, leads }), 'evening');
  assert.match(html, /Thu, Dec 3/);
  assert.match(html, /6 PM/);
  assert.ok(!DASH.test(html));
});

test('each edition has its own header and sections', () => {
  const common = { date: '2026-12-02', origin: 'https://x.test', road: { url: 'https://www.indystar.com/x', headline: 'H' }, lookoutItems: [{ on: '2026-12-02', start: null, title: 'Fair', venue: 'Park', url: 'https://x' }] };
  const m = composeEdition({ ...common, kind: 'morning', spotlight: DAILY.spotlight[0], design: DAILY.design[0], stories: [{ href: '/news/a/', headline: 'Story', label: 'News', byline: 'Jake' }] });
  assert.match(m.html, /The morning edition, Wednesday, December 2/);
  assert.deepEqual(m.sections, ['Weather', 'The news', 'Shop Local Spotlight', 'Lookout', 'Up the road']);
  assert.match(m.html, /Today and tonight in Columbus/);
  const e = composeEdition({ ...common, kind: 'evening', spotlight: DAILY.spotlight[0], design: DAILY.design[0], stories: [{ href: '/news/a/', headline: 'Story', label: 'News', byline: 'Jake' }] });
  assert.match(e.html, /The evening edition, Wednesday, December 2/);
  assert.deepEqual(e.sections, ['Weather', 'Columbus by Design', 'Lookout', 'Up the road']);
  assert.match(e.html, /Tonight and tomorrow in Columbus/);
  for (const x of [m, e]) assert.ok(!DASH.test(x.html.replace(/<[^>]+>/g, ' ')), 'no dashes in what a reader sees');
  assert.ok(!/api\.weather\.gov/.test(m.html + e.html), 'the weather is a link to the forecast page, never the API');
});

test('the build writes two weeks of edition parts, so a quiet stretch never leaves a day without one', () => {
  const eds = upcomingEditions(new Date('2026-12-01T12:00:00Z'));
  assert.equal(eds.length, 14);
  assert.ok(eds.every((e) => Array.isArray(e.stories) && Array.isArray(e.early) && e.html));
  assert.deepEqual(keysFor('evening', '2026-12-02'), { day: 'day-2026-12-02-evening', draft: 'draft-2026-12-02-evening', run: 'run-2026-12-02-evening', html: 'html-2026-12-02-evening' });
  assert.equal(keysFor('morning', '2026-12-02').day, 'day-2026-12-02', 'the morning keeps its old keys');
});

test('signup sets the two topics from the reader\'s choice, including for a reader Resend already knows', async () => {
  const topics = { morning: 'top-m', evening: 'top-e' };
  assert.deepEqual(topicsFor('evening', topics), [{ id: 'top-m', subscription: 'opt_out' }, { id: 'top-e', subscription: 'opt_in' }]);
  assert.deepEqual(topicsFor('both', topics).map((t) => t.subscription), ['opt_in', 'opt_in']);
  assert.equal(cleanChoice('anything'), 'both', 'Both when absent or odd');
  assert.deepEqual(topicsFor('morning', {}), [], 'no topic ids set, nothing to set');
  const created = [];
  const fresh = async (url, init = {}) => { created.push(JSON.parse(init.body)); return new Response('{}'); };
  assert.equal(await addContact('a@b.co', { key: 'k', audience: 'seg', topics }, fresh, 'morning'), true);
  assert.deepEqual(created[0].topics, [{ id: 'top-m', subscription: 'opt_in' }, { id: 'top-e', subscription: 'opt_out' }]);
  assert.deepEqual(created[0].segments, [{ id: 'seg' }]);
  const calls = [];
  const known = async (url, init = {}) => { calls.push({ url, method: init.method, body: init.body ? JSON.parse(init.body) : null }); return new Response('{}', { status: url.endsWith('/contacts') ? 409 : 200 }); };
  assert.equal(await addContact('a@b.co', { key: 'k', audience: 'seg', topics }, known, 'evening'), true);
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url.replace('https://api.resend.com', '')}`), ['POST /contacts', 'POST /contacts/a%40b.co/segments/seg', 'PATCH /contacts/a%40b.co', 'PATCH /contacts/a%40b.co/topics']);
  assert.deepEqual(calls[3].body, [{ id: 'top-m', subscription: 'opt_out' }, { id: 'top-e', subscription: 'opt_in' }]);
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
  assert.deepEqual(a.sources.slice(0, 5).map((s) => s.ok), [false, true, true, true, true]);
  assert.equal(a.sources[5].id, 'directory', 'the directory comparison reports itself too');
  assert.match(a.sources[0].error, /500/);
  assert.ok(a.items.length >= 5 && a.items.every((x) => x.new));
  assert.ok(a.items.every((x) => x.url && x.title && x.source));
  const b = await gatherInto(store, { fetchFn, now: new Date('2026-11-28T09:15:00Z'), origin: 'https://x.test' });
  const again = b.items.find((x) => x.url === 'https://www.columbus.in.gov/document/agenda/');
  assert.equal(again.new, false, 'seen yesterday, not new today');
  assert.ok(!(await gather({ fetchFn, now, origin: 'https://x.test', sources: [] })).items.length);
});

test('every lead source names a first-hand public source and when it was checked; the only other newsroom is a pasted IndyStar link', () => {
  for (const s of SOURCES) {
    assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/, s.id);
    assert.ok(s.url && s.home && s.name, s.id);
    assert.ok(!/therepublic|wthr|wishtv|wrtv|fox59|indystar/i.test(s.url), 'no other newsroom is scraped');
    assert.ok(!/api\.weather\.gov/.test(s.url), 'api.weather.gov disallows every path in robots.txt');
  }
  // IndyStar appears only as the link the publisher pastes into Up the road:
  // nothing in the jobs or the desk ever fetches it.
  for (const f of ['netlify/functions/newsletter.mjs', 'netlify/functions/desk.mjs', 'netlify/functions/leads.mjs', 'src/news/gather.mjs', 'src/news/paper-mail.mjs']) {
    const src = readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    for (const m of src.matchAll(/fetch\w*\(([^)]{0,120})/g)) assert.ok(!/indystar/i.test(m[1]), `${f} fetches IndyStar`);
  }
  const pm = readFileSync(new URL('../src/news/paper-mail.mjs', import.meta.url), 'utf8');
  assert.match(pm, /ROAD_HOSTS = \/\^\(www\\\.\)\?indystar\\\.com\$\/i/, 'Up the road takes indystar.com and nothing else');
});

test('the overnight leads list changes in our own directory, and a second gathering the same morning keeps them', async () => {
  const snap = (over = {}) => ({
    'zaharakos': { name: 'Zaharakos', address: '329 Washington St', phone: '', hours: [[1, 660, 1260]], tempClosed: false, closed: false, order: [], book: [], store: '' },
    'old-shop': { name: 'Old Shop', address: '1 Main St', phone: '', hours: null, tempClosed: false, closed: false, order: [], book: [], store: '' },
    ...over,
  });
  let current = snap();
  const fetchFn = async (url) => {
    if (url === 'https://x.test/newsletter/daily.json') return new Response(JSON.stringify({ snapshot: current }));
    return new Response('nope', { status: 404 });
  };
  const store = memStore();
  const first = await gatherInto(store, { fetchFn, now: new Date('2026-11-27T09:15:00Z'), origin: 'https://x.test' });
  assert.equal(first.items.filter((x) => x.kind === 'directory').length, 0, 'nothing to compare with the first night');
  current = snap({
    'old-shop': { ...snap()['old-shop'], closed: true },
    'new-bakery': { name: 'New Bakery', address: '5 Fifth St', phone: '', hours: null, tempClosed: false, closed: false, order: ['https://order.example/nb'], book: [], store: '' },
    'zaharakos': { ...snap().zaharakos, order: ['https://order.example/z'] },
  });
  const next = await gatherInto(store, { fetchFn, now: new Date('2026-11-28T09:15:00Z'), origin: 'https://x.test' });
  const dir = next.items.filter((x) => x.kind === 'directory');
  assert.deepEqual(dir.map((x) => x.title).sort(), ['Listed as closed: Old Shop, 1 Main St', 'New listing: New Bakery, 5 Fifth St', 'New online ordering or booking: Zaharakos, 329 Washington St'].sort());
  assert.ok(dir.every((x) => x.new && x.source === 'Our directory' && x.url.startsWith('https://x.test/b/')));
  const again = await gatherInto(store, { fetchFn, now: new Date('2026-11-28T10:00:00Z'), origin: 'https://x.test' });
  assert.equal(again.items.filter((x) => x.kind === 'directory').length, 3, 'Gather now the same morning keeps the changes');
  const bad = await gatherInto(memStore(), { fetchFn: async () => new Response('x', { status: 500 }), now: new Date('2026-11-28T09:15:00Z'), origin: 'https://x.test' });
  assert.equal(bad.sources.find((s) => s.id === 'directory').ok, false, 'a failed directory read is reported, not hidden');
});

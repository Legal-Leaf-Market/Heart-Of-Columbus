// The morning newsletter pipeline end to end: overnight leads into the idea
// bank, the 6:45 draft that never races the desk, one Resend draft per
// morning, the publisher's test and send, and signup on Resend segments.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { makeDraft, sendDraft, testSend, columbusHour, resendConfig, config as jobConfig } from '../netlify/functions/newsletter.mjs';
import { gather, config as leadsConfig } from '../netlify/functions/leads.mjs';
import { addContact } from '../netlify/functions/subscribe.mjs';
import { weatherLeads, eventLeads, inboxLeads, mergeLeads, MAX_IDEAS } from '../src/news/overnight.mjs';

const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };
const resend = { key: 'rk', segment: 'seg-1', from: 'Heart of Columbus <news@example.org>' };
const ed = { subject: 'Lights up Friday', html: '<html><body><p>Hi</p></body></html>', fresh: 1 };
const recorder = (answer = () => ({ ok: true, status: 200, json: async () => ({ id: 'b-1' }), text: async () => '' })) => {
  const calls = [];
  const fetchFn = async (url, init = {}) => { calls.push({ url, method: init.method || 'GET', body: init.body ? JSON.parse(init.body) : null }); return answer(url, init, calls.length); };
  return { calls, fetchFn };
};
const quiet = () => {};

test('the jobs run at 5 AM and 6:45 AM in Columbus, summer and winter', () => {
  assert.equal(jobConfig.schedule, '45 10,11 * * 1-5');
  assert.equal(leadsConfig.schedule, '0 9,10 * * *');
  // Winter (EST, UTC-5): 11:45 UTC is 6:45; 10:45 UTC is 5:45 and does nothing.
  assert.equal(columbusHour(new Date('2026-12-02T11:45:00Z')), 6);
  assert.equal(columbusHour(new Date('2026-12-02T10:45:00Z')), 5);
  // Summer (EDT, UTC-4): 10:45 UTC is 6:45.
  assert.equal(columbusHour(new Date('2026-07-01T10:45:00Z')), 6);
  assert.equal(columbusHour(new Date('2026-07-01T09:00:00Z')), 5);
  assert.equal(columbusHour(new Date('2026-12-02T10:00:00Z')), 5);
});

test('Resend settings take the segment id, and the old audience id still works', () => {
  const env = (v) => (k) => v[k] || '';
  assert.equal(resendConfig(env({ RESEND_AUDIENCE_ID: 'old' })).segment, 'old');
  assert.equal(resendConfig(env({ RESEND_AUDIENCE_ID: 'old', RESEND_SEGMENT_ID: 'new' })).segment, 'new');
});

test('a Resend draft goes to the segment, is never sent, and carries an unsubscribe link', async () => {
  const store = memStore();
  const { calls, fetchFn } = recorder();
  const r = await makeDraft({ resend, date: '2026-12-02', store, fetchFn, log: quiet, edition: ed });
  assert.equal(r.reason, 'drafted');
  assert.equal(calls[0].url, 'https://api.resend.com/broadcasts');
  assert.equal(calls[0].body.segment_id, 'seg-1');
  assert.equal(calls[0].body.send, undefined, 'a draft, not a send');
  assert.match(calls[0].body.html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.deepEqual(await store.getJSON('draft-2026-12-02').then((x) => [x.id, x.from, x.service]), ['b-1', 'desk', 'resend']);
});

test('the desk replaces the automatic draft instead of leaving two, and the job never replaces', async () => {
  const store = memStore();
  await store.setJSON('draft-2026-12-02', { id: 'auto-1', at: 'x', subject: 'Auto', from: 'auto', service: 'resend' });
  const { calls, fetchFn } = recorder();
  assert.equal((await makeDraft({ resend, origin: 'https://x.test', date: '2026-12-02', store, fetchFn, log: quiet })).reason, 'already', 'the job leaves an existing draft alone');
  assert.equal(calls.length, 0);
  const r = await makeDraft({ resend, date: '2026-12-02', store, fetchFn, log: quiet, edition: ed });
  assert.equal(r.reason, 'replaced');
  assert.deepEqual(calls.map((c) => `${c.method} ${c.url}`), ['DELETE https://api.resend.com/broadcasts/auto-1', 'POST https://api.resend.com/broadcasts']);
  assert.equal((await store.getJSON('draft-2026-12-02')).from, 'desk');
  // A failed delete stops before a second draft is made.
  await store.setJSON('draft-2026-12-03', { id: 'auto-2', subject: 'Auto', from: 'auto', service: 'resend' });
  const bad = recorder((url, init) => (init.method === 'DELETE' ? { ok: false, status: 422, text: async () => 'nope' } : { ok: true, json: async () => ({ id: 'x' }) }));
  const f = await makeDraft({ resend, date: '2026-12-03', store, fetchFn: bad.fetchFn, log: quiet, edition: ed });
  assert.equal(f.ok, false);
  assert.equal(bad.calls.length, 1, 'no new draft beside the old one');
});

test('sending is the publisher pressing send, once, for the draft they read', async () => {
  const store = memStore();
  const date = '2026-12-02';
  assert.match((await sendDraft({ resend, date, store, subject: 'x' })).error, /draft first/);
  await store.setJSON(`draft-${date}`, { id: 'b-1', subject: 'Lights up Friday', from: 'desk', service: 'resend' });
  const { calls, fetchFn } = recorder();
  assert.match((await sendDraft({ resend, date, store, subject: 'Old subject', fetchFn, log: quiet })).error, /subject changed/);
  assert.equal(calls.length, 0);
  assert.equal((await sendDraft({ resend, date, store, subject: 'Lights up Friday', fetchFn, log: quiet })).ok, true);
  assert.equal(calls[0].url, 'https://api.resend.com/broadcasts/b-1/send');
  assert.ok((await store.getJSON(`draft-${date}`)).sentAt);
  assert.match((await sendDraft({ resend, date, store, subject: 'Lights up Friday', fetchFn, log: quiet })).error, /Already sent/);
  assert.equal(calls.length, 1, 'never twice');
  assert.equal((await makeDraft({ resend, date, store, fetchFn, log: quiet, edition: ed })).reason, 'sent', 'no new draft after the send');
  await store.setJSON('draft-2026-12-04', { id: 'bd', subject: 's', service: 'buttondown' });
  assert.match((await sendDraft({ resend, date: '2026-12-04', store, subject: 's' })).error, /Buttondown/);
});

test('a test send goes only to the test address, marked [Test]', async () => {
  const { calls, fetchFn } = recorder();
  assert.match((await testSend({ resend, to: '', edition: ed, fetchFn })).error, /HOC_NEWSLETTER_TEST_TO/);
  const r = await testSend({ resend, to: 'me@example.org', edition: ed, fetchFn });
  assert.deepEqual(r.to, ['me@example.org']);
  assert.equal(calls[0].url, 'https://api.resend.com/emails');
  assert.equal(calls[0].body.subject, '[Test] Lights up Friday');
});

test('a returning reader is added to the segment and subscribed again', async () => {
  const cfg = { key: 'k', segment: 'seg-1' };
  const fresh = recorder();
  assert.equal(await addContact(cfg, 'a@b.co', fresh.fetchFn), true);
  assert.equal(fresh.calls.length, 1);
  const back = recorder((url, init, n) => (n === 1 ? { ok: false, status: 409 } : { ok: true, status: 200 }));
  assert.equal(await addContact(cfg, 'a@b.co', back.fetchFn), true);
  assert.deepEqual(back.calls.map((c) => `${c.method} ${c.url}`), ['POST https://api.resend.com/contacts', 'POST https://api.resend.com/contacts/a%40b.co/segments/seg-1', 'PATCH https://api.resend.com/contacts/a%40b.co']);
  const down = recorder(() => ({ ok: false, status: 500 }));
  assert.equal(await addContact(cfg, 'a@b.co', down.fetchFn), false);
});

test('overnight leads: county weather alerts, today\'s events and new reader mail', () => {
  const now = new Date('2026-12-02T10:00:00Z');
  const geo = { features: [
    { properties: { id: 'a1', '@id': 'https://api.weather.gov/alerts/a1', headline: 'Winter Storm Warning until 7 PM', areaDesc: 'Bartholomew; Jackson', severity: 'Moderate', ends: '2026-12-02T23:00:00Z' } },
    { properties: { id: 'a2', headline: 'Flood Watch', areaDesc: 'Marion', ends: '2026-12-03T00:00:00Z' } },
    { properties: { id: 'a3', headline: 'Old alert', areaDesc: 'Bartholomew', ends: '2026-12-01T00:00:00Z' } },
  ] };
  const w = weatherLeads(geo, now);
  assert.equal(w.length, 1, 'only live alerts naming the county');
  assert.match(w[0].text, /Winter Storm Warning until 7 PM \(Moderate\)/);
  assert.equal(w[0].url, 'https://api.weather.gov/alerts/a1');
  const e = eventLeads([{ slug: 's', name: 'Lights', venue: 'Mill Race Park', line: 'Lights go up.', start: '2026-12-01', end: '2026-12-05', checked: '2026-11-01', url: 'https://x.test' }, { slug: 'o', name: 'Old', start: '2026-11-01', end: '2026-11-02' }], '2026-12-02');
  assert.deepEqual(e.map((x) => x.key), ['event:s:2026-12-02']);
  const mail = inboxLeads([
    { kind: 'tip', id: 't1', createdAt: '2026-12-02T03:00:00Z', tip: 'The bridge is closed', contact: 'secret@example.org' },
    { kind: 'ask', id: 'q0', createdAt: '2026-11-30T03:00:00Z', question: 'Old question' },
  ], '2026-12-01T10:00:00Z');
  assert.equal(mail.length, 1, 'only mail since the last run');
  assert.doesNotMatch(mail[0].text, /secret@example\.org/, 'contact details stay in the inbox');
});

test('leads merge without repeats, expire, and never push out the publisher\'s ideas', () => {
  const now = new Date('2026-12-02T10:00:00Z');
  const mine = { text: 'My idea', added: '2026-10-01T00:00:00Z' };
  const old = { text: 'Old lead', lead: true, key: 'k-old', added: '2026-11-20T00:00:00Z' };
  const m = mergeLeads([mine, old], [{ key: 'k1', text: 'New', source: 'S' }, { key: 'k-del', text: 'Deleted before' }], { now, seen: ['k-del'] });
  assert.deepEqual(m.ideas.map((i) => i.text), ['New', 'My idea'], 'stale lead gone, deleted lead not back, my idea kept');
  assert.equal(m.added, 1);
  assert.equal(mergeLeads(m.ideas, [{ key: 'k1', text: 'New' }], { now, seen: m.seen }).added, 0, 'no repeats');
  const many = Array.from({ length: MAX_IDEAS }, (_, i) => ({ text: `mine ${i}`, added: now.toISOString() }));
  const full = mergeLeads(many, [{ key: 'z', text: 'lead' }], { now });
  assert.equal(full.ideas.length, MAX_IDEAS);
  assert.equal(full.ideas.filter((i) => !i.lead).length, MAX_IDEAS, 'a lead never pushes out an idea the publisher wrote');
});

test('the lead job fills the idea bank and survives a failed source', async () => {
  const desk = memStore();
  const fetchFn = async () => { throw new Error('offline'); };
  const logs = [];
  const r = await gather({ desk, newsroom: null, now: new Date('2026-12-02T10:00:00Z'), fetchFn, log: (x) => logs.push(x), events: [{ slug: 's', name: 'Lights', venue: 'Park', line: 'x', start: '2026-12-02', end: '2026-12-02', checked: '2026-11-01', url: 'https://x.test' }] });
  assert.equal(r.added, 1);
  assert.ok(logs.some((l) => /weather alerts failed/.test(l)));
  assert.equal((await desk.getJSON('ideas'))[0].lead, true);
  assert.equal((await gather({ desk, newsroom: null, now: new Date('2026-12-02T10:05:00Z'), fetchFn, log: quiet, events: [{ slug: 's', name: 'Lights', venue: 'Park', line: 'x', start: '2026-12-02', end: '2026-12-02', checked: '2026-11-01' }] })).added, 0, 'a second run adds nothing new');
});

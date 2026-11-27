// The writing desk: the publisher approves every piece, the model only works
// from the publisher's notes and sources, and the morning draft carries only
// what was approved.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { voicePrompt, piecePrompt, blockers, cleanPiece, editionHtml, approved, SHAPES, MODES } from '../src/news/desk.mjs';
import { assist } from '../netlify/functions/desk.mjs';
import { makeDraft, deskEdition } from '../netlify/functions/newsletter.mjs';

const memStore = () => { const m = new Map(); return { m, getJSON: async (k) => (m.has(k) ? JSON.parse(m.get(k)) : null), setJSON: async (k, v) => { m.set(k, JSON.stringify(v)); } }; };
const good = { id: 'p-one', status: 'drafting', shape: 'brief', headline: 'Mill Race Park lights go up Friday', body: 'The lights go up Friday at 6 PM.', sources: [{ url: 'https://columbus.in.gov/parks', note: 'Lighting Friday 6 PM' }] };

test('the voice prompt carries the publisher\'s words and the hard rules', () => {
  const p = voicePrompt({ about: 'Dry and plain.', rules: ['No exclamation points.'], samples: ['A sample I wrote.'] });
  assert.match(p, /Dry and plain\./);
  assert.match(p, /No exclamation points\./);
  assert.match(p, /<sample 1>\nA sample I wrote\./);
  assert.match(p, /Never invent a quote, a person, a number, a date or a source/);
  assert.match(p, /\[CHECK: what to confirm\]/);
  assert.match(voicePrompt({}), /Hard rules/, 'the rules hold with no profile at all');
});

test('the piece prompt gives the task, the shape, the notes and numbered sources', () => {
  const p = piecePrompt({ ...good, angle: 'I think this is overdue.' }, 'draft');
  assert.match(p, new RegExp(MODES.draft.slice(0, 30)));
  assert.match(p, new RegExp(SHAPES.brief.how.slice(0, 20)));
  assert.match(p, /NOTES[^\n]*\nI think this is overdue\./);
  assert.match(p, /\[1\] https:\/\/columbus\.in\.gov\/parks\nLighting Friday 6 PM/);
  assert.match(piecePrompt({ headline: 'x' }, 'draft'), /SOURCES: none given\. Draft only from the notes and mark every fact \[CHECK\]/);
});

test('approval is blocked by a [CHECK], a missing source, a dash or an empty piece', () => {
  assert.deepEqual(blockers(good), []);
  assert.match(blockers({ ...good, body: 'Friday at [CHECK: time].' }).join(' '), /\[CHECK\]/);
  assert.match(blockers({ ...good, sources: [] }).join(' '), /source link/);
  assert.deepEqual(blockers({ ...good, sources: [], shape: 'take' }), [], 'an opinion piece may stand on the publisher\'s view');
  assert.match(blockers({ ...good, body: 'Friday — at six.' }).join(' '), /dash/);
  assert.equal(blockers({}).length >= 2, true);
});

test('cleaning drops bad links and unknown values and stamps approval', () => {
  const now = new Date('2026-11-25T11:00:00Z');
  const c = cleanPiece({ ...good, status: 'approved', shape: 'nope', sources: [{ url: 'javascript:alert(1)', note: '' }, { url: 'https://ok.test', note: 'x' }] }, now);
  assert.equal(c.shape, 'brief');
  assert.deepEqual(c.sources.map((s) => s.url), ['https://ok.test']);
  assert.equal(c.approvedAt, now.toISOString());
  assert.equal(cleanPiece({ status: 'published' }).status, 'idea');
});

test('the edition holds only approved pieces, in the publisher\'s order, with sources', () => {
  const day = { plan: { order: ['b', 'a', 'c'] }, pieces: [{ ...good, id: 'a', status: 'approved', headline: 'First' }, { ...good, id: 'b', status: 'approved', headline: 'Second' }, { ...good, id: 'c', status: 'drafting', headline: 'Not yet' }] };
  const list = approved(day);
  assert.deepEqual(list.map((p) => p.id), ['b', 'a']);
  const html = editionHtml({ name: 'The Paper', date: '2026-11-25', intro: 'Morning, Columbus.', pieces: list, origin: 'https://x.test' });
  assert.ok(html.indexOf('Second') < html.indexOf('First'));
  assert.doesNotMatch(html, /Not yet/);
  assert.match(html, /Morning, Columbus\./);
  assert.match(html, /Sources: <a href="https:\/\/columbus\.in\.gov\/parks">columbus\.in\.gov<\/a>/);
  assert.match(html, /about\/standards\//);
});

test('writing help calls the model with the cached voice and reports the cost', async () => {
  let sent;
  const fetchFn = async (url, init) => { sent = { url, init, body: JSON.parse(init.body) }; return { ok: true, json: async () => ({ model: 'claude-opus-5-5', stop_reason: 'end_turn', content: [{ type: 'text', text: 'Drafted.' }], usage: { input_tokens: 1000, output_tokens: 200, cache_read_input_tokens: 2000 } }) }; };
  const r = await assist({ key: 'k', model: 'claude-opus-5-5', voice: { about: 'Plain.' }, piece: good, mode: 'draft', fetchFn });
  assert.equal(r.ok, true);
  assert.equal(r.text, 'Drafted.');
  assert.equal(sent.url, 'https://api.anthropic.com/v1/messages');
  assert.equal(sent.init.headers['anthropic-version'], '2026-10-21');
  assert.equal(sent.body.system[0].cache_control.type, 'ephemeral');
  assert.match(sent.body.system[0].text, /Plain\./);
  assert.ok(Math.abs(r.cost - (1000 * 4 + 2000 * 0.4 + 200 * 20) / 1e6) < 1e-9);
  assert.equal((await assist({ key: '', voice: {}, piece: good, mode: 'draft', fetchFn })).ok, false, 'off without a key');
  const refused = async () => ({ ok: true, json: async () => ({ stop_reason: 'refusal', content: [] }) });
  assert.match((await assist({ key: 'k', voice: {}, piece: good, mode: 'draft', fetchFn: refused })).error, /declined/);
});

test('the morning job drafts the approved desk edition, and skips a skipped morning', async () => {
  const desk = memStore();
  const date = '2026-11-25';
  assert.equal(await deskEdition(desk, date, 'https://x.test'), null, 'no desk day, no desk edition');
  await desk.setJSON(`day-${date}`, { date, plan: { subject: 'Lights up Friday', intro: '', order: ['p-one'], skip: false }, pieces: [{ ...good, status: 'approved' }] });
  const ed = await deskEdition(desk, date, 'https://x.test');
  assert.equal(ed.subject, 'Lights up Friday');
  assert.equal(ed.fresh, 1);
  const store = memStore();
  let posted;
  const fetchFn = async (url, init) => { posted = JSON.parse(init.body); return { ok: true, json: async () => ({ id: 'd1' }) }; };
  const r = await makeDraft({ key: 'k', origin: 'https://x.test', date, store, fetchFn, log: () => {}, edition: ed });
  assert.equal(r.reason, 'drafted');
  assert.equal(posted.subject, 'Lights up Friday');
  assert.equal(posted.status, 'draft', 'never sends');
  assert.equal((await store.getJSON(`draft-${date}`)).from, 'desk');
  assert.equal((await makeDraft({ key: 'k', origin: 'https://x.test', date, store, fetchFn, log: () => {}, edition: ed })).reason, 'already');
  assert.equal((await makeDraft({ key: 'k', origin: 'https://x.test', date, store, fetchFn, log: () => {}, edition: ed, force: true })).reason, 'replaced', 'the desk can make it again after an edit');
  await desk.setJSON(`day-${date}`, { date, plan: { subject: 'x', order: [], skip: true }, pieces: [] });
  assert.deepEqual(await deskEdition(desk, date, 'https://x.test'), { skip: true });
});

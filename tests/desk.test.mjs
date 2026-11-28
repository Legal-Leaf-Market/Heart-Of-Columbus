// The writing desk: the publisher approves every piece, the model only works
// from the publisher's notes and sources, and the morning draft carries only
// what was approved.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { voicePrompt, piecePrompt, blockers, cleanPiece, editionHtml, approved, SHAPES, MODES } from '../src/news/desk.mjs';
import { assist } from '../netlify/functions/desk.mjs';
import { makeBroadcast, assemble } from '../netlify/functions/newsletter.mjs';

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

test('the edition carries the approved desk pieces, and a skipped edition makes none', async () => {
  const desk = memStore();
  const date = '2026-11-25';
  const none = async () => new Response('', { status: 404 });
  const auto = await assemble({ kind: 'morning', date, deskStore: desk, store: memStore(), origin: 'https://x.test', fetchFn: none });
  assert.equal(auto.from, 'auto', 'no desk day, the automatic edition');
  await desk.setJSON(`day-${date}`, { date, plan: { subject: 'Lights up Friday', intro: '', order: ['p-one'], skip: false }, pieces: [{ ...good, status: 'approved' }] });
  const ed = await assemble({ kind: 'morning', date, deskStore: desk, store: memStore(), origin: 'https://x.test', fetchFn: none });
  assert.equal(ed.subject, 'Lights up Friday');
  assert.equal(ed.pieces, 1);
  assert.match(ed.html, /Mill Race Park lights go up Friday/);
  const store = memStore();
  let posted;
  const fetchFn = async (url, init) => { posted = JSON.parse(init.body); return { ok: true, json: async () => ({ id: 'd1' }) }; };
  const r = await makeBroadcast({ key: 'k', date, store, fetchFn, log: () => {}, subject: ed.subject, html: ed.html });
  assert.equal(r.reason, 'drafted');
  assert.equal(posted.subject, 'Lights up Friday');
  assert.equal(posted.status, 'draft', 'Buttondown only ever gets a draft');
  assert.equal((await makeBroadcast({ key: 'k', date, store, fetchFn, log: () => {}, subject: ed.subject, html: ed.html })).reason, 'already');
  await desk.setJSON(`day-${date}`, { date, plan: { subject: 'x', order: [], skip: true }, pieces: [] });
  assert.equal((await assemble({ kind: 'morning', date, deskStore: desk, origin: 'https://x.test', fetchFn: none })).skip, true);
});

test('the beat book: wrong spellings and banned phrases hold a piece back, and the writing help reads it', async () => {
  const { cleanBeat, parseBeatLines, beatProblems } = await import('../src/news/desk.mjs');
  const beat = cleanBeat({ entries: parseBeatLines("Zaharakos | soda fountain on Washington Street | Zaharako's, Zaharakas\nMill Race Park | | Millrace Park\nZaharakos | dupe line | zaharakos"), banned: 'game changer\nnestled' });
  assert.equal(beat.entries[2].wrong.length, 0, 'the right spelling is never listed as wrong');
  const piece = { ...good, headline: 'Lights at Millrace Park', body: 'A game changer at Zaharakas tonight.' };
  const why = blockers(piece, beat);
  assert.ok(why.some((w) => /"Millrace Park"; your beat book says "Mill Race Park"/.test(w)));
  assert.ok(why.some((w) => /"Zaharakas"/.test(w)));
  assert.ok(why.some((w) => /"game changer", which is on your banned list/.test(w)));
  assert.deepEqual(beatProblems({ body: 'Zaharakos and Mill Race Park, unnestled.' }, beat), [], 'whole words only, and the right spelling passes');
  assert.deepEqual(blockers(good, beat), [], 'a clean piece still passes');
  assert.deepEqual(blockers(piece), blockers(piece, null), 'no beat book, no beat checks');
  const p = voicePrompt({}, beat);
  assert.match(p, /Spell these exactly/);
  assert.match(p, /- Mill Race Park\. Not: Millrace Park/);
  assert.match(p, /they are not sources, so never state a fact from them/);
  assert.match(p, /- game changer/);
  assert.ok(p.indexOf('beat book') < p.indexOf('Hard rules'), 'the hard rules still come last');
  assert.equal(cleanBeat({ entries: Array.from({ length: 400 }, (_, i) => ({ term: `T${i}` })) }).entries.length, 300, 'capped');
});

test('prose numbers count sentences, the reading grade, -ly words and likely passive, skipping links', async () => {
  const { readFileSync } = await import('node:fs');
  const m = { exports: {} };
  new Function('module', 'window', readFileSync(new URL('../public/js/prose.js', import.meta.url), 'utf8'))(m, undefined);
  const { prose, summary, syllables } = m.exports;
  assert.equal(syllables('Columbus'), 3);
  assert.equal(syllables('the'), 1);
  const long = Array.from({ length: 35 }, () => 'word').join(' ');
  const p = prose(`The council met Monday. The park was approved by the council. It is truly a [big deal](https://example.com/a-very-long-link).\n\n${long}.\n\nOnly early birds get coffee.`);
  assert.equal(p.sentences, 5);
  assert.equal(p.long, 1, 'one sentence over 30 words');
  assert.equal(p.longest, 35);
  assert.deepEqual(p.adverbs, ['truly'], 'only and early are not counted');
  assert.deepEqual(p.passive, ['was approved']);
  assert.ok(!p.words || !/https|example/.test(JSON.stringify(p.adverbs)), 'links are not counted as words');
  const line = summary(p);
  assert.match(line, /5 sentences/);
  assert.match(line, /reading grade \d/);
  assert.match(line, /1 over 30 words \(longest 35\)/);
  assert.ok(!/[–—]| - /.test(line), 'no dashes in what the publisher reads');
  assert.equal(summary(prose('')), '0 words');
  const page = readFileSync(new URL('../dist/newsroom/desk/index.html', import.meta.url), 'utf8');
  assert.ok(page.indexOf('/js/prose.js') > 0 && page.indexOf('/js/prose.js') < page.indexOf('/js/desk.js'), 'prose.js loads before desk.js');
});

test('paste notes splits into ideas: blank lines, bullets, links, and no repeats', async () => {
  const { readFileSync } = await import('node:fs');
  const m = { exports: {} };
  new Function('module', 'window', readFileSync(new URL('../public/js/notes.js', import.meta.url), 'utf8'))(m, undefined);
  const { split, MAX } = m.exports;
  const notes = 'Ask the parks office about the\nnew splash pad\n\n- Zaharakos has a new owner? https://example.com/z.\n- Washington St parking meters\n* 3rd St bridge closing\n\n1. School board Tuesday\n2) Library hours over the holidays\r\n\r\nWashington St PARKING meters';
  const ideas = split(notes, [{ text: 'Library hours over the holidays' }]);
  assert.deepEqual(ideas.map((i) => i.text), [
    'Ask the parks office about the new splash pad',
    'Zaharakos has a new owner?',
    'Washington St parking meters',
    '3rd St bridge closing',
    'School board Tuesday',
  ], 'a plain paragraph stays one idea, bullet lines split, repeats and existing ideas are skipped');
  assert.equal(ideas[1].url, 'https://example.com/z', 'the link moves to the link field without its trailing period');
  assert.equal(ideas[0].url, '');
  assert.deepEqual(split('https://example.com/only'), [{ text: 'https://example.com/only', url: 'https://example.com/only' }]);
  assert.deepEqual(split('   \n\n  '), []);
  assert.equal(split(Array.from({ length: 80 }, (_, i) => `idea ${i}`).join('\n\n')).length, MAX, 'capped per paste');
  const page = readFileSync(new URL('../dist/newsroom/desk/index.html', import.meta.url), 'utf8');
  assert.ok(page.indexOf('/js/notes.js') > 0 && page.indexOf('/js/notes.js') < page.indexOf('/js/desk.js'), 'notes.js loads before desk.js');
  assert.match(page, /data-notes-split/);
});

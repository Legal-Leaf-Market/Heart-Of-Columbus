// The writing desk (/newsroom/desk/): where the publisher crafts and approves
// the morning newsletter. Pure logic here (prompts, checks, the email), the
// storage and the model call in netlify/functions/desk.mjs, the page in
// public/js/desk.js. docs/morning-paper.md explains the morning routine.
//
// The rule (docs/newsroom-policies.md, "Artificial intelligence"): the
// publisher gives every piece its angle, commentary and sources; the model
// drafts and tightens in the publisher's voice from those alone; nothing goes
// in an edition until the publisher approves it. The model never invents a
// quote, a person, a number or a source, and marks anything unsure [CHECK].
import { markdown } from './markdown.mjs';
import { roadBlockers } from './paper-mail.mjs';

export const STATUSES = ['idea', 'drafting', 'approved', 'spiked'];

// Ways to shape a piece, borrowed from how working newsletter writers
// structure a short item. The writer picks one; the model follows it.
export const SHAPES = {
  brief: { label: 'Brief', how: 'Two to four sentences. What happened, why a Columbus reader should care, where to learn more.' },
  take: { label: 'The take', how: 'Open with the fact, then the publisher\'s view in the publisher\'s words, then what to watch next. Opinion is labeled as the publisher\'s.' },
  explainer: { label: 'Explainer', how: 'A one line answer up top, then three short points that explain it, then where to go for more.' },
  list: { label: 'List', how: 'A one line setup, then three to five tight bullet points, each one fact with its source.' },
  heads_up: { label: 'Heads up', how: 'What, when, where, cost and who it is for, in that order. One line of the publisher\'s color at most.' },
};

// What the assist button can do. Each returns text the writer accepts,
// edits or throws away; nothing is saved without the writer pressing save.
export const MODES = {
  draft: 'Write a first draft of the piece in the publisher\'s voice, using only the facts in the sources and notes. Follow the chosen shape. Return Markdown only.',
  tighten: 'Edit the current draft: cut filler, shorten sentences, keep the publisher\'s voice and every fact. Do not add facts. Return the full revised draft in Markdown only.',
  // The edit pass comes back as tracked changes the publisher takes one by
  // one, so it changes sentences in place and leaves the rest word for word.
  editpass: 'Do a line edit of the current draft: fix grammar, cut filler, break up long sentences, trade weak verbs and -ly words for plain strong ones, and turn passive voice active where it reads better. Keep the publisher\'s voice, every fact and the order of the piece. Leave any sentence that is already good exactly as it is, character for character. Do not add facts. Return the full revised draft in Markdown only.',
  headlines: 'Suggest eight headlines for this piece: specific, local, no clickbait, under 70 characters. One per line, no numbering.',
  hooks: 'Suggest five different opening lines for this piece in the publisher\'s voice. One per line, no numbering.',
  subject: 'Suggest six email subject lines for this morning\'s edition, under 55 characters, plain and specific. One per line, no numbering.',
  check: 'Review the draft against the sources and notes. List every claim, number, name or date the sources do not support, every line that reads as fact but is opinion, and anything that could be unfair to a real person or business. Be brief. If it is clean, say so.',
  voice: 'Compare the draft with the publisher\'s samples. List up to five specific edits that would make it sound more like the publisher (word choice, rhythm, openings), quoting the line to change.',
  // Passage modes: the publisher selects part of the draft and only that
  // part comes back, to replace the selection.
  'tighten-part': 'Edit only the PASSAGE TO EDIT: cut filler and shorten it, keeping the publisher\'s voice and every fact. Do not add facts. Return only the revised passage, with no comment before or after it.',
  smooth: 'Edit only the PASSAGE TO EDIT so it reads smoothly: clearer transitions and better rhythm, the same facts and the publisher\'s voice. Do not add facts. Return only the revised passage, with no comment before or after it.',
  grammar: 'Fix only spelling, grammar and punctuation in the PASSAGE TO EDIT. Change nothing else, not even word choice. Return only the corrected passage, with no comment before or after it.',
};
export const PASSAGE_MODES = ['tighten-part', 'smooth', 'grammar'];

// A passage must be part of the current draft, so a suggestion can only ever
// replace the publisher's own words.
export function cleanPassage(passage, body) {
  const p = String(passage || '').slice(0, 6000);
  if (!p.trim()) return { ok: false, error: 'Select a passage in the body first.' };
  if (!String(body || '').includes(p)) return { ok: false, error: 'That passage is not in the draft any more. Select it again.' };
  return { ok: true, passage: p };
}

const clip = (s, n) => String(s ?? '').slice(0, n);

// The voice profile is the publisher's own: a description, house rules and
// samples of their writing. The samples teach rhythm and word choice only.
// The beat book: the people, places and businesses the publisher writes
// about, with the spellings that are right and the ones that are wrong, plus
// phrases the publisher never wants to see. The writing help reads it before
// every draft, and approval refuses a piece that spells a name the wrong way
// or uses a banned phrase. It is the publisher's own reference, typed by them;
// nothing here adds a fact to it.
export const BEAT_KINDS = ['person', 'place', 'business', 'group', 'thing'];
export function cleanBeat(b = {}) {
  const entries = (Array.isArray(b.entries) ? b.entries : []).map((e) => ({
    term: clip(String(e && e.term || '').trim(), 120),
    kind: BEAT_KINDS.includes(e && e.kind) ? e.kind : 'thing',
    note: clip(String(e && e.note || '').trim(), 400),
    wrong: (Array.isArray(e && e.wrong) ? e.wrong : String(e && e.wrong || '').split(','))
      .map((w) => clip(String(w).trim(), 120)).filter((w) => w && w.toLowerCase() !== String(e.term || '').trim().toLowerCase()).slice(0, 8),
  })).filter((e) => e.term).slice(0, 300);
  const banned = (Array.isArray(b.banned) ? b.banned : String(b.banned || '').split('\n'))
    .map((x) => clip(String(x).trim(), 120)).filter(Boolean).slice(0, 100);
  // Running stories: a thread the paper keeps coming back to, where it
  // stands in the publisher's words, and links to our earlier pieces.
  const stories = (Array.isArray(b.stories) ? b.stories : []).map((s) => ({
    title: clip(String(s && s.title || '').trim(), 120),
    status: clip(String(s && s.status || '').trim(), 400),
    links: (Array.isArray(s && s.links) ? s.links : String(s && s.links || '').split(/[\s,]+/))
      .map((l) => String(l).trim()).filter((l) => /^https?:\/\/\S+$/i.test(l)).map((l) => clip(l, 500)).slice(0, 5),
  })).filter((s) => s.title).slice(0, 40);
  return { entries, banned, stories };
}

// "Main Street | the downtown stretch | Main St., Mainstreet" per line.
export function parseBeatLines(text = '') {
  return String(text).split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [term = '', note = '', wrong = ''] = l.split('|').map((x) => x.trim());
    return { term, note, wrong: wrong.split(',').map((w) => w.trim()).filter(Boolean) };
  });
}

const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const findPhrase = (text, phrase) => new RegExp(`(^|[^\\p{L}\\p{N}])${escRe(phrase)}(?=$|[^\\p{L}\\p{N}])`, 'iu').test(text);

// What the beat book catches in a piece: a wrong spelling it lists, or a
// banned phrase. Case is ignored; a phrase must stand as whole words.
export function beatProblems(piece = {}, beat = null) {
  if (!beat) return [];
  const text = `${piece.headline || ''}\n${piece.dek || ''}\n${piece.body || ''}`;
  const out = [];
  for (const e of beat.entries || []) for (const w of e.wrong || []) {
    if (findPhrase(text, w)) out.push(`It spells "${w}"; your beat book says "${e.term}".`);
  }
  for (const p of beat.banned || []) if (findPhrase(text, p)) out.push(`It uses "${p}", which is on your banned list.`);
  return out;
}

export function beatPrompt(beat = null) {
  if (!beat) return '';
  const entries = (beat.entries || []).slice(0, 300);
  const banned = (beat.banned || []).slice(0, 100);
  const parts = [];
  if (entries.length) parts.push(`The publisher's beat book. Spell these exactly as written here, and never as the wrong spellings listed. The notes are background for spelling and naming only; they are not sources, so never state a fact from them:\n${entries.map((e) => `- ${e.term}${e.note ? `: ${e.note}` : ''}${e.wrong.length ? `. Not: ${e.wrong.join(', ')}` : ''}`).join('\n')}`);
  if (banned.length) parts.push(`Phrases the publisher never uses. Do not write any of these:\n${banned.map((b) => `- ${b}`).join('\n')}`);
  const stories = (beat.stories || []).slice(0, 40);
  if (stories.length) parts.push(`Running stories the paper has covered before. Use them for continuity only: if this piece continues one, you may say so in one sentence and link our earlier coverage from the links listed. Where it stands is the publisher's own shorthand, not a source, so never state a fact from it:\n${stories.map((s) => `- ${s.title}${s.status ? `: ${s.status}` : ''}${s.links.length ? `. Earlier coverage: ${s.links.join(' ')}` : ''}`).join('\n')}`);
  return parts.join('\n\n');
}

export function voicePrompt(voice = {}, beat = null) {
  const parts = ['You help the publisher of a local Columbus, Indiana newsletter write in their own voice.'];
  if (voice.about) parts.push(`How the publisher describes their voice:\n${clip(voice.about, 2000)}`);
  const rules = (voice.rules || []).filter(Boolean);
  if (rules.length) parts.push(`House rules from the publisher:\n${rules.map((r) => `- ${clip(r, 300)}`).join('\n')}`);
  const samples = (voice.samples || []).filter((s) => s && s.trim()).slice(0, 6);
  if (samples.length) parts.push(`Samples of the publisher's own writing. Match their rhythm and word choice; never reuse their facts:\n${samples.map((s, i) => `<sample ${i + 1}>\n${clip(s, 3000)}\n</sample>`).join('\n')}`);
  const book = beatPrompt(beat);
  if (book) parts.push(book);
  parts.push([
    'Hard rules, which override everything above:',
    '- Use only facts found in the SOURCES and NOTES given with the piece. Never invent a quote, a person, a number, a date or a source.',
    '- Write "[CHECK: what to confirm]" wherever a fact is unclear or missing instead of guessing.',
    '- Never copy sentences from a source. Restate facts in new words and credit the outlet by name when the fact is theirs.',
    '- The publisher\'s opinions come from their NOTES; do not add opinions of your own.',
    '- No dashes used as punctuation (no em dash, no en dash, no spaced hyphen); use commas, periods or colons.',
  ].join('\n'));
  return parts.join('\n\n');
}

export function piecePrompt(piece = {}, mode = 'draft', extra = '', passage = '') {
  const shape = SHAPES[piece.shape] || SHAPES.brief;
  const sources = (piece.sources || []).filter((s) => s && (s.url || s.note));
  const lines = [
    `TASK: ${MODES[mode] || MODES.draft}`,
    `SHAPE: ${shape.label}. ${shape.how}`,
    piece.headline ? `WORKING HEADLINE: ${clip(piece.headline, 200)}` : '',
    piece.angle ? `NOTES (the publisher's angle, commentary and direction):\n${clip(piece.angle, 4000)}` : 'NOTES: none given.',
    sources.length ? `SOURCES:\n${sources.map((s, i) => `[${i + 1}] ${clip(s.url, 500)}${s.note ? `\n${clip(s.note, 3000)}` : ''}`).join('\n')}` : 'SOURCES: none given. Draft only from the notes and mark every fact [CHECK].',
    piece.body ? `CURRENT DRAFT:\n${clip(piece.body, 12000)}` : '',
    extra ? `EDITION CONTEXT:\n${clip(extra, 4000)}` : '',
    passage ? `PASSAGE TO EDIT (only this part of the current draft):\n${clip(passage, 6000)}` : '',
  ];
  return lines.filter(Boolean).join('\n\n');
}

// What stands between a piece and approval. An approved piece never carries
// an unresolved [CHECK], and every piece names at least one source unless it
// is labeled as the publisher's own opinion. With the beat book, a wrong
// spelling it lists or a banned phrase also holds a piece back.
export function blockers(piece = {}, beat = null) {
  const out = [];
  if (!String(piece.headline || '').trim()) out.push('It needs a headline.');
  if (!String(piece.body || '').trim()) out.push('It needs a body.');
  if (/\[CHECK/i.test(`${piece.headline} ${piece.body}`)) out.push('It still has a [CHECK] to resolve.');
  if (!(piece.sources || []).some((s) => s && s.url) && piece.shape !== 'take') out.push('Add at least one source link, or mark it as The take.');
  if (/[–—]| - /.test(`${piece.headline} ${piece.dek || ''} ${piece.body}`)) out.push('It has a dash used as punctuation; the paper does not use them.');
  out.push(...beatProblems(piece, beat));
  return out;
}

// The subject line, the publisher's open and "Up the road" go out too, so
// they meet the same bar as a piece: no [CHECK] left in, no dash used as
// punctuation, and Up the road links only to indystar.com.
export function planBlockers(plan = {}) {
  const out = [];
  const text = `${plan.subject || ''} ${plan.intro || ''}`;
  if (/\[CHECK/i.test(text)) out.push('The subject or your open still has a [CHECK] to resolve.');
  if (/[–—]| - /.test(text)) out.push('The subject or your open has a dash used as punctuation; the paper does not use them.');
  if (plan.road) out.push(...roadBlockers({ ...plan.road, url: plan.road.url || plan.road.typedUrl || '' }));
  return out;
}

const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The email: the publisher's open, then the approved pieces in the order
// chosen, each with its sources. Plain, single column, readable anywhere.
export function editionHtml({ name, date, intro = '', pieces = [], origin = '' }) {
  const items = pieces.map((p) => {
    const src = (p.sources || []).filter((s) => s && s.url);
    return `<h2 style="font-size:20px;border-top:2px solid #1b1a17;padding-top:10px;margin-top:24px">${h(p.headline)}</h2>${p.dek ? `<p style="color:#555;margin-top:-6px">${h(p.dek)}</p>` : ''}
${markdown(p.body || '')}${p.shape === 'take' ? '<p><small>The publisher\'s view.</small></p>' : ''}${src.length ? `<p><small>Sources: ${src.map((s) => `<a href="${h(s.url)}">${h(s.label || hostOf(s.url))}</a>`).join(', ')}</small></p>` : ''}`;
  }).join('\n');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${h(name)}, ${h(date)}</title></head><body style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:16px;color:#1b1a17;line-height:1.5">
<h1 style="font-size:28px">${h(name)}</h1><p>The morning edition, ${h(date)}</p>
${intro ? markdown(intro) : ''}
${items}
<hr><p><small>You signed up at ${h(origin)}/newsletter/. Unsubscribe with the link below. Read our reporting standards at ${h(origin)}/about/standards/</small></p></body></html>`;
}

export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'source'; }
}

// Cleans what the page sends before it is stored.
// Voices: the main voice (blob `voice`) plus up to five named extra voices
// (blob `voices`) for different kinds of writing, a dry briefing and a warmer
// column, say. Each is the publisher's own description, rules and samples.
export const MAX_VOICES = 5;
export function cleanVoice(v = {}) {
  return {
    about: clip(String(v.about || ''), 2000),
    rules: (Array.isArray(v.rules) ? v.rules : []).map((r) => clip(String(r), 300)).filter(Boolean).slice(0, 20),
    samples: (Array.isArray(v.samples) ? v.samples : []).map((s) => clip(String(s), 3000)).filter((s) => s.trim()).slice(0, 6),
  };
}
const VOICE_ID = /^v-[a-z0-9-]{2,30}$/;
export function cleanVoices(list = []) {
  const seen = new Set();
  return (Array.isArray(list) ? list : []).map((v) => ({
    id: VOICE_ID.test(String(v && v.id)) ? v.id : '',
    name: clip(String((v && v.name) || '').trim(), 60),
    ...cleanVoice(v || {}),
  })).filter((v) => v.id && v.name && !seen.has(v.id) && seen.add(v.id)).slice(0, MAX_VOICES);
}
// Save one voice into the list: a new one gets an id, an existing id is
// replaced in place. Refused when the list is full or the name is blank.
export function upsertVoice(list, v, now = new Date()) {
  const voices = cleanVoices(list);
  const name = clip(String(v.name || '').trim(), 60);
  if (!name) return { ok: false, error: 'Give the voice a name.' };
  const i = voices.findIndex((x) => x.id === v.id);
  if (i === -1 && voices.length >= MAX_VOICES) return { ok: false, error: `You can keep ${MAX_VOICES} extra voices. Delete one first.` };
  const id = i === -1 ? `v-${now.getTime().toString(36)}` : v.id;
  const saved = { id, name, ...cleanVoice(v) };
  if (i === -1) voices.push(saved); else voices[i] = saved;
  return { ok: true, voices, id };
}
// The voice a piece is written in: its chosen voice if it still exists,
// otherwise the main voice.
export function voiceFor(piece = {}, main = {}, voices = []) {
  const v = piece.voice && cleanVoices(voices).find((x) => x.id === piece.voice);
  return v ? { about: v.about, rules: v.rules, samples: v.samples } : (main || {});
}

export function cleanPiece(p = {}, now = new Date()) {
  const sources = (Array.isArray(p.sources) ? p.sources : []).slice(0, 12).map((s) => ({
    url: /^https?:\/\//i.test(String(s && s.url)) ? clip(s.url, 500) : '',
    label: clip(s && s.label, 80), note: clip(s && s.note, 4000),
  })).filter((s) => s.url || s.note);
  return {
    id: /^[a-z0-9-]{4,40}$/.test(String(p.id)) ? p.id : `p-${now.getTime().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    status: STATUSES.includes(p.status) ? p.status : 'idea',
    shape: SHAPES[p.shape] ? p.shape : 'brief',
    headline: clip(p.headline, 200), dek: clip(p.dek, 300), angle: clip(p.angle, 6000), body: clip(p.body, 20000),
    sources, ai: !!p.ai, voice: VOICE_ID.test(String(p.voice || '')) ? p.voice : '', updated: now.toISOString(),
    approvedAt: p.status === 'approved' ? (p.approvedAt || now.toISOString()) : '',
  };
}

// The approved pieces of a morning, in the publisher's order.
export function approved(day) {
  const byId = new Map((day.pieces || []).map((p) => [p.id, p]));
  return ((day.plan && day.plan.order) || []).map((id) => byId.get(id)).filter((p) => p && p.status === 'approved');
}

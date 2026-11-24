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
  headlines: 'Suggest eight headlines for this piece: specific, local, no clickbait, under 70 characters. One per line, no numbering.',
  hooks: 'Suggest five different opening lines for this piece in the publisher\'s voice. One per line, no numbering.',
  subject: 'Suggest six email subject lines for this morning\'s edition, under 55 characters, plain and specific. One per line, no numbering.',
  check: 'Review the draft against the sources and notes. List every claim, number, name or date the sources do not support, every line that reads as fact but is opinion, and anything that could be unfair to a real person or business. Be brief. If it is clean, say so.',
  voice: 'Compare the draft with the publisher\'s samples. List up to five specific edits that would make it sound more like the publisher (word choice, rhythm, openings), quoting the line to change.',
};

const clip = (s, n) => String(s ?? '').slice(0, n);

// The voice profile is the publisher's own: a description, house rules and
// samples of their writing. The samples teach rhythm and word choice only.
export function voicePrompt(voice = {}) {
  const parts = ['You help the publisher of a local Columbus, Indiana newsletter write in their own voice.'];
  if (voice.about) parts.push(`How the publisher describes their voice:\n${clip(voice.about, 2000)}`);
  const rules = (voice.rules || []).filter(Boolean);
  if (rules.length) parts.push(`House rules from the publisher:\n${rules.map((r) => `- ${clip(r, 300)}`).join('\n')}`);
  const samples = (voice.samples || []).filter((s) => s && s.trim()).slice(0, 6);
  if (samples.length) parts.push(`Samples of the publisher's own writing. Match their rhythm and word choice; never reuse their facts:\n${samples.map((s, i) => `<sample ${i + 1}>\n${clip(s, 3000)}\n</sample>`).join('\n')}`);
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

export function piecePrompt(piece = {}, mode = 'draft', extra = '') {
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
  ];
  return lines.filter(Boolean).join('\n\n');
}

// What stands between a piece and approval. An approved piece never carries
// an unresolved [CHECK], and every piece names at least one source unless it
// is labeled as the publisher's own opinion.
export function blockers(piece = {}) {
  const out = [];
  if (!String(piece.headline || '').trim()) out.push('It needs a headline.');
  if (!String(piece.body || '').trim()) out.push('It needs a body.');
  if (/\[CHECK/i.test(`${piece.headline} ${piece.body}`)) out.push('It still has a [CHECK] to resolve.');
  if (!(piece.sources || []).some((s) => s && s.url) && piece.shape !== 'take') out.push('Add at least one source link, or mark it as The take.');
  if (/[–—]| - /.test(`${piece.headline} ${piece.dek || ''} ${piece.body}`)) out.push('It has a dash used as punctuation; the paper does not use them.');
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
    sources, ai: !!p.ai, updated: now.toISOString(),
    approvedAt: p.status === 'approved' ? (p.approvedAt || now.toISOString()) : '',
  };
}

// The approved pieces of a morning, in the publisher's order.
export function approved(day) {
  const byId = new Map((day.pieces || []).map((p) => [p.id, p]));
  return ((day.plan && day.plan.order) || []).map((id) => byId.get(id)).filter((p) => p && p.status === 'approved');
}

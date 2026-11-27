// /api/desk: the publisher's writing desk (/newsroom/desk/). Private: every
// call needs the x-hoc-key header (HOC_ADMIN_KEY), never a query string.
// Storage is Netlify Blobs (store "desk"): `voice` (the publisher's voice
// profile), `ideas` (the idea bank) and `day-<YYYY-MM-DD>` (that morning's
// pieces and edition plan). The model call is plain fetch to the Claude
// Messages API (no npm dependency, like the rest of netlify/functions):
// ANTHROPIC_API_KEY turns it on, HOC_DESK_MODEL overrides the model.
// "Make draft" hands the approved edition to the newsletter service as a
// DRAFT, the same way the morning job does. Only two actions send anything,
// and both are the publisher pressing a button: "test" mails the edition to
// HOC_NEWSLETTER_TEST_TO, and "send" sends that morning's Resend draft to the
// subscribers, once, after the page confirms the subject.
import { blobStore } from '../../src/blobs.mjs';
import { sameKey } from '../../src/pixel-key.mjs';
import { voicePrompt, piecePrompt, MODES, cleanPiece, blockers, editionHtml, approved } from '../../src/news/desk.mjs';
import { makeDraft, testSend, sendDraft, resendConfig } from './newsletter.mjs';
import { columbusDate } from '../../src/news/editions.mjs';
import { PAPER } from '../../src/data/paper.mjs';

export const config = { path: '/api/desk' };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MODEL = () => env('HOC_DESK_MODEL') || 'claude-opus-5-5';
// Prices per million tokens, for the spend line under each suggestion.
const RATES = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5] };

export async function assist({ key, model, voice, piece, mode, extra = '', fetchFn = fetch }) {
  if (!key) return { ok: false, error: 'Add ANTHROPIC_API_KEY in Netlify to turn on writing help.' };
  if (!MODES[mode]) return { ok: false, error: 'Unknown kind of help.' };
  const res = await fetchFn('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key, 'anthropic-version': '2026-10-21', 'content-type': 'application/json',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    body: JSON.stringify({
      model, max_tokens: 16000,
      output_config: { effort: mode === 'check' ? 'high' : 'medium' },
      fallbacks: 'default',
      // The voice profile is the long, stable part, so it is cached; the piece
      // changes on every press and comes after it.
      system: [{ type: 'text', text: voicePrompt(voice), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: piecePrompt(piece, mode, extra) }],
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: `The writing service said ${res.status}: ${(body.error && body.error.message) || 'no reason given'}` };
  if (body.stop_reason === 'refusal') return { ok: false, error: 'The writing service declined this one. Write it by hand.' };
  const text = (body.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  const u = body.usage || {};
  const [inR, outR] = RATES[body.model] || RATES['claude-opus-5-5'];
  const cost = ((u.input_tokens || 0) * inR + (u.cache_creation_input_tokens || 0) * inR * 1.25 + (u.cache_read_input_tokens || 0) * inR * 0.1 + (u.output_tokens || 0) * outR) / 1e6;
  console.log(`[desk] ${mode} ${body.model} in=${u.input_tokens} cache_read=${u.cache_read_input_tokens || 0} out=${u.output_tokens} $${cost.toFixed(4)}`);
  return { ok: true, text, truncated: body.stop_reason === 'max_tokens', model: body.model, cost };
}

const service = () => { const r = resendConfig(env); return r.key && r.segment && r.from ? 'resend' : env('BUTTONDOWN_API_KEY') ? 'buttondown' : ''; };
const emptyDay = (date) => ({ date, plan: { subject: '', intro: '', order: [], skip: false }, pieces: [] });

export default async (req) => {
  if (!sameKey(env('HOC_ADMIN_KEY'), req.headers.get('x-hoc-key') || '')) return json({ ok: false, error: 'Wrong desk link.' }, 403);
  const store = blobStore('desk');
  if (!store) return json({ ok: false, error: 'Storage is not set up on this deploy.' }, 503);
  const u = new URL(req.url);

  if (req.method === 'GET') {
    const date = DATE.test(u.searchParams.get('date') || '') ? u.searchParams.get('date') : columbusDate(new Date());
    const [day, voice, ideas, drafted] = await Promise.all([
      store.getJSON(`day-${date}`), store.getJSON('voice'), store.getJSON('ideas'), blobStore('newsletter')?.getJSON(`draft-${date}`),
    ]);
    return json({ ok: true, date, today: columbusDate(new Date()), day: day || emptyDay(date), voice: voice || { about: '', rules: [], samples: [] }, ideas: ideas || [], drafted: drafted || null, ai: !!env('ANTHROPIC_API_KEY'), model: MODEL(), service: service(), testTo: !!env('HOC_NEWSLETTER_TEST_TO') });
  }
  if (req.method !== 'POST') return json({ ok: false, error: 'Use GET or POST.' }, 405);
  let b;
  try { b = await req.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }

  if (b.action === 'voice') {
    const v = b.voice || {};
    const voice = { about: String(v.about || '').slice(0, 2000), rules: (v.rules || []).map((r) => String(r).slice(0, 300)).filter(Boolean).slice(0, 20), samples: (v.samples || []).map((s) => String(s).slice(0, 3000)).filter((s) => s.trim()).slice(0, 6) };
    await store.setJSON('voice', voice);
    return json({ ok: true, voice });
  }
  if (b.action === 'ideas') {
    const ideas = (Array.isArray(b.ideas) ? b.ideas : []).slice(0, 200).map((i) => ({ text: String(i.text || '').slice(0, 1000), url: /^https?:\/\//.test(i.url || '') ? String(i.url).slice(0, 500) : '', added: String(i.added || new Date().toISOString()).slice(0, 30), ...(i.lead ? { lead: true, key: String(i.key || '').slice(0, 300), source: String(i.source || '').slice(0, 80) } : {}) })).filter((i) => i.text.trim());
    await store.setJSON('ideas', ideas);
    return json({ ok: true, ideas });
  }

  const date = DATE.test(b.date || '') ? b.date : '';
  if (!date) return json({ ok: false, error: 'Which morning?' }, 400);
  const day = (await store.getJSON(`day-${date}`)) || emptyDay(date);

  if (b.action === 'save') {
    const piece = cleanPiece(b.piece);
    if (piece.status === 'approved') {
      const why = blockers(piece);
      if (why.length) return json({ ok: false, error: why.join(' '), blockers: why }, 422);
    }
    const i = day.pieces.findIndex((p) => p.id === piece.id);
    if (i === -1) day.pieces.push(piece); else day.pieces[i] = { ...piece, approvedAt: piece.status === 'approved' ? (day.pieces[i].approvedAt || piece.approvedAt) : '' };
    if (!day.plan.order.includes(piece.id)) day.plan.order.push(piece.id);
    await store.setJSON(`day-${date}`, day);
    return json({ ok: true, day });
  }
  if (b.action === 'plan') {
    const p = b.plan || {};
    const ids = new Set(day.pieces.map((x) => x.id));
    day.plan = { subject: String(p.subject || '').slice(0, 150), intro: String(p.intro || '').slice(0, 4000), order: (p.order || []).filter((id) => ids.has(id)), skip: !!p.skip };
    for (const id of ids) if (!day.plan.order.includes(id)) day.plan.order.push(id);
    await store.setJSON(`day-${date}`, day);
    return json({ ok: true, day });
  }
  if (b.action === 'remove') {
    day.pieces = day.pieces.filter((p) => p.id !== b.id);
    day.plan.order = day.plan.order.filter((id) => id !== b.id);
    await store.setJSON(`day-${date}`, day);
    return json({ ok: true, day });
  }
  if (b.action === 'assist') {
    const voice = (await store.getJSON('voice')) || {};
    const piece = cleanPiece(b.piece || {});
    const extra = b.mode === 'subject' ? approved(day).map((p) => `- ${p.headline}`).join('\n') : '';
    const r = await assist({ key: env('ANTHROPIC_API_KEY'), model: MODEL(), voice, piece, mode: b.mode, extra });
    return json(r, r.ok ? 200 : 502);
  }
  if (b.action === 'send') {
    const r = await sendDraft({ resend: resendConfig(env), date, store: blobStore('newsletter'), subject: b.subject });
    return json(r, r.ok ? 200 : 422);
  }
  if (['preview', 'draft', 'test'].includes(b.action)) {
    const pieces = approved(day);
    const html = editionHtml({ name: PAPER.name, date, intro: day.plan.intro, pieces, origin: env('URL') || 'https://heartofcolumbus.shop' });
    if (b.action === 'preview') return json({ ok: true, html, count: pieces.length });
    if (!pieces.length) return json({ ok: false, error: 'Approve at least one piece first.' }, 422);
    if (!day.plan.subject.trim()) return json({ ok: false, error: 'Write a subject line first.' }, 422);
    const edition = { subject: day.plan.subject, html, fresh: pieces.length };
    if (b.action === 'test') {
      const r = await testSend({ resend: resendConfig(env), to: env('HOC_NEWSLETTER_TEST_TO'), edition });
      return json(r, r.ok ? 200 : 422);
    }
    const r = await makeDraft({
      key: env('BUTTONDOWN_API_KEY'), resend: resendConfig(env),
      date, store: blobStore('newsletter'), edition, force: !!b.force,
    });
    return json(r, r.ok ? 200 : 502);
  }
  return json({ ok: false, error: 'Unknown action.' }, 400);
};

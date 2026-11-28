// /api/desk: the publisher's writing desk (/newsroom/desk/). Private: every
// call needs the x-hoc-key header (HOC_ADMIN_KEY), never a query string.
// Storage is Netlify Blobs (store "desk"): `voice` (the publisher's voice
// profile), `ideas` (the idea bank) and `day-<YYYY-MM-DD>` (that morning's
// pieces and edition plan). The model call is plain fetch to the Claude
// Messages API (no npm dependency, like the rest of netlify/functions):
// ANTHROPIC_API_KEY turns it on, HOC_DESK_MODEL overrides the model.
// Each date has two editions, morning (`day-<date>`) and evening
// (`day-<date>-evening`); every call names one with `edition`.
// `leads-<date>` is the overnight lead list (netlify/functions/leads.mjs);
// "gather" runs it again on demand. "draft" makes (or updates) the edition's
// broadcast in Resend as a draft; the edition's job (6:15 AM or 5:30 PM)
// rebuilds it from the desk, updates that same draft and schedules it to send
// (6:45 AM or 6:00 PM) unless the publisher presses Hold (/api/hold).
import { blobStore } from '../../src/blobs.mjs';
import { sameKey } from '../../src/pixel-key.mjs';
import { deskDeals } from '../../src/deals.mjs';
import { voicePrompt, piecePrompt, MODES, cleanPiece, blockers, planBlockers, approved, cleanBeat } from '../../src/news/desk.mjs';
import { assemble, makeBroadcast, resendEnv, usesResend } from './newsletter.mjs';
import { gatherInto } from './leads.mjs';
import { columbusDate, keysFor, kindOf, cleanRoad, EDITIONS } from '../../src/news/paper-mail.mjs';

export const config = { path: '/api/desk' };

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MODEL = () => env('HOC_DESK_MODEL') || 'claude-opus-5-5';
// Prices per million tokens, for the spend line under each suggestion.
const RATES = { 'claude-opus-5-5': [4, 20], 'claude-sonnet-5-5': [2, 10], 'claude-haiku-5-5': [0.1, 0.5] };

export async function assist({ key, model, voice, piece, mode, extra = '', beat = null, fetchFn = fetch }) {
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
      system: [{ type: 'text', text: voicePrompt(voice, beat), cache_control: { type: 'ephemeral' } }],
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

const emptyDay = (date) => ({ date, plan: { subject: '', intro: '', order: [], skip: false, road: { url: '', headline: '', comment: '' } }, pieces: [] });
const ORIGIN = () => env('URL') || 'https://heartofcolumbus.shop';

export default async (req) => {
  if (!sameKey(env('HOC_ADMIN_KEY'), req.headers.get('x-hoc-key') || '')) return json({ ok: false, error: 'Wrong desk link.' }, 403);
  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch { return json({ ok: false, error: 'Bad request.' }, 400); }
    if (!body || typeof body !== 'object') return json({ ok: false, error: 'Bad request.' }, 400);
    if (['deals', 'deal-save', 'deal-remove'].includes(body.action)) return deskDeals(body);
    return updateDesk(body);
  }

  const store = blobStore('desk');
  if (!store) return json({ ok: false, error: 'Storage is not set up on this deploy.' }, 503);
  const u = new URL(req.url);

  if (req.method === 'GET') {
    const date = DATE.test(u.searchParams.get('date') || '') ? u.searchParams.get('date') : columbusDate(new Date());
    const edition = kindOf(u.searchParams.get('edition'));
    const keys = keysFor(edition, date);
    const news = blobStore('newsletter');
    const [day, voice, ideas, drafted, run, leads, beat] = await Promise.all([
      store.getJSON(keys.day), store.getJSON('voice'), store.getJSON('ideas'), news?.getJSON(keys.draft), news?.getJSON(keys.run), store.getJSON(`leads-${date}`), store.getJSON('beat'),
    ]);
    const r = resendEnv();
    const service = usesResend(r) ? 'resend' : env('BUTTONDOWN_API_KEY') ? 'buttondown' : '';
    const d = day || emptyDay(date);
    if (!d.plan.road) d.plan.road = { url: '', headline: '', comment: '' };
    const clock = EDITIONS[edition];
    const { holdHash, ...draftView } = drafted || {};
    return json({ ok: true, date, edition, today: columbusDate(new Date()), clock: { deadline: clock.deadline, draft: clock.draft, send: clock.send }, topic: !!r.topics[edition], day: d, voice: voice || { about: '', rules: [], samples: [] }, ideas: ideas || [], beat: cleanBeat(beat || {}), drafted: drafted ? draftView : null, run: run || null, leads: leads || null, service, ai: !!env('ANTHROPIC_API_KEY'), model: MODEL() });
  }
  return json({ ok: false, error: 'Use GET or POST.' }, 405);
};

async function updateDesk(b) {
  const store = blobStore('desk');
  if (!store) return json({ ok: false, error: 'Storage is not set up on this deploy.' }, 503);

  if (b.action === 'voice') {
    const v = b.voice || {};
    const voice = { about: String(v.about || '').slice(0, 2000), rules: (v.rules || []).map((r) => String(r).slice(0, 300)).filter(Boolean).slice(0, 20), samples: (v.samples || []).map((s) => String(s).slice(0, 3000)).filter((s) => s.trim()).slice(0, 6) };
    await store.setJSON('voice', voice);
    return json({ ok: true, voice });
  }
  if (b.action === 'beat') {
    const beat = cleanBeat(b.beat || {});
    await store.setJSON('beat', beat);
    return json({ ok: true, beat });
  }
  if (b.action === 'ideas') {
    const ideas = (Array.isArray(b.ideas) ? b.ideas : []).slice(0, 200).map((i) => ({ text: String(i.text || '').slice(0, 1000), url: /^https?:\/\//.test(i.url || '') ? String(i.url).slice(0, 500) : '', added: String(i.added || new Date().toISOString()).slice(0, 30) })).filter((i) => i.text.trim());
    await store.setJSON('ideas', ideas);
    return json({ ok: true, ideas });
  }

  if (b.action === 'gather') {
    const leads = await gatherInto(store, { origin: ORIGIN() });
    return json({ ok: true, leads });
  }

  const date = DATE.test(b.date || '') ? b.date : '';
  if (!date) return json({ ok: false, error: 'Which day?' }, 400);
  const edition = kindOf(b.edition);
  const keys = keysFor(edition, date);
  const day = (await store.getJSON(keys.day)) || emptyDay(date);

  if (b.action === 'save') {
    const piece = cleanPiece(b.piece);
    if (piece.status === 'approved') {
      const why = blockers(piece, cleanBeat((await store.getJSON('beat')) || {}));
      if (why.length) return json({ ok: false, error: why.join(' '), blockers: why }, 422);
    }
    const i = day.pieces.findIndex((p) => p.id === piece.id);
    if (i === -1) day.pieces.push(piece); else day.pieces[i] = { ...piece, approvedAt: piece.status === 'approved' ? (day.pieces[i].approvedAt || piece.approvedAt) : '' };
    if (!day.plan.order.includes(piece.id)) day.plan.order.push(piece.id);
    await store.setJSON(keys.day, day);
    return json({ ok: true, day });
  }
  if (b.action === 'plan') {
    const p = b.plan || {};
    const ids = new Set(day.pieces.map((x) => x.id));
    day.plan = { subject: String(p.subject || '').slice(0, 150), intro: String(p.intro || '').slice(0, 4000), order: (p.order || []).filter((id) => ids.has(id)), skip: !!p.skip, road: cleanRoad(p.road || {}) };
    // Keep what was typed even when it is not a usable IndyStar link yet, so
    // the publisher can see and fix it; the edition leaves it out until then.
    if (p.road && String(p.road.url || '').trim() && !day.plan.road.url) day.plan.road.typedUrl = String(p.road.url).trim().slice(0, 500);
    for (const id of ids) if (!day.plan.order.includes(id)) day.plan.order.push(id);
    await store.setJSON(keys.day, day);
    return json({ ok: true, day });
  }
  if (b.action === 'remove') {
    day.pieces = day.pieces.filter((p) => p.id !== b.id);
    day.plan.order = day.plan.order.filter((id) => id !== b.id);
    await store.setJSON(keys.day, day);
    return json({ ok: true, day });
  }
  if (b.action === 'assist') {
    const voice = (await store.getJSON('voice')) || {};
    const piece = cleanPiece(b.piece || {});
    const extra = b.mode === 'subject' ? approved(day).map((p) => `- ${p.headline}`).join('\n') : '';
    const beat = cleanBeat((await store.getJSON('beat')) || {});
    const r = await assist({ key: env('ANTHROPIC_API_KEY'), model: MODEL(), voice, piece, mode: b.mode, extra, beat });
    return json(r, r.ok ? 200 : 502);
  }
  if (b.action === 'preview' || b.action === 'draft') {
    const news = blobStore('newsletter');
    const ed = await assemble({ kind: edition, date, deskStore: store, store: news, origin: ORIGIN() });
    if (b.action === 'preview') return json({ ok: true, skip: !!ed.skip, html: ed.html || '', subject: ed.subject || '', count: approved(day).length, notes: ed.notes, substance: ed.substance || 0 });
    if (ed.skip) return json({ ok: false, error: 'This edition is marked "No edition".' }, 422);
    const why = planBlockers(day.plan);
    if (why.length) return json({ ok: false, error: why.join(' '), blockers: why }, 422);
    const r = await makeBroadcast({ kind: edition, date, store: news, resend: resendEnv(), key: env('BUTTONDOWN_API_KEY'), subject: ed.subject, html: ed.html });
    return json(r, r.ok ? 200 : (r.reason === 'already-scheduled' ? 409 : 502));
  }
  return json({ ok: false, error: 'Unknown action.' }, 400);
}

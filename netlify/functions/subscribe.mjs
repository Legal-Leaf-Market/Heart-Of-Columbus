// /api/subscribe: the newsletter signup, on Resend, with double opt in.
//
// POST { email } (JSON from the signup script, or a plain form post) stores a
// pending signup in Netlify Blobs and emails a confirmation link. Opening
// that link (GET /api/subscribe?confirm=<token>) shows one button; pressing
// it (POST confirm=<token>) adds the address to the Resend segment and sets
// its two topics, Morning edition and Evening edition, to what the reader
// chose on the form (`choice`: morning, evening or both; both when absent). The button is there because mail scanners open
// every link in an email before the reader does: a link that confirmed on
// its own was used up by the scanner, and the reader then saw "expired"
// (seen in the logs on 2026-11-24). A confirmed link keeps saying "You're
// in" for its week. The answer to a signup is the same whether or not an
// address is already signed up, so the form can't be used to check who reads
// the paper, and one address gets at most one confirmation email every ten
// minutes, so the form can't be used to flood someone's inbox.
//
// Needs RESEND_API_KEY, RESEND_SEGMENT_ID (or the older RESEND_AUDIENCE_ID:
// Resend renamed Audiences to Segments in November 2025 and kept the ids)
// and HOC_NEWSLETTER_FROM (an address on a domain verified in Resend, such as
// "Heart of Columbus <news@...>"). Without them it answers 503 and says
// signup isn't open yet. RESEND_TOPIC_MORNING and RESEND_TOPIC_EVENING are
// the topic ids; without them a reader gets whatever the segment is sent.
import { blobStore } from '../../src/blobs.mjs';

export const config = { path: '/api/subscribe' };

const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const page = (title, text, status = 200) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | Heart of Columbus</title><style>body{font-family:Georgia,serif;max-width:560px;margin:12vh auto;padding:0 20px;color:#1b1a17;background:#fbf7f0;line-height:1.5}h1{font-size:30px}a{color:#b92e2b}</style></head><body><h1>${esc(title)}</h1><p>${text}</p><p><a href="/news/">Read today's paper</a></p></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
export const validEmail = (e) => /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i.test(e) && e.length <= 254;
const token = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');
const DAY = 86400e3;
const WAIT = 10 * 60e3;
const hash = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
const RESEND = 'https://api.resend.com';

// Adds a confirmed reader to the segment (Resend's global contacts, 2025).
// A new address is created in the segment; one Resend already knows (it
// signed up before, or unsubscribed and has now confirmed again) is added to
// the segment and marked subscribed, since this confirmation is their say so.
export const CHOICES = ['both', 'morning', 'evening'];
export const cleanChoice = (c) => (CHOICES.includes(String(c || '').toLowerCase()) ? String(c).toLowerCase() : 'both');
// The topic settings for a choice: opted in to what they picked, out of the other.
export function topicsFor(choice, topics = {}) {
  const c = cleanChoice(choice);
  return [['morning', topics.morning], ['evening', topics.evening]].filter(([, id]) => id)
    .map(([k, id]) => ({ id, subscription: c === 'both' || c === k ? 'opt_in' : 'opt_out' }));
}

export async function addContact(email, cfg, fetchFn = fetch, choice = 'both') {
  const headers = { authorization: `Bearer ${cfg.key}`, 'content-type': 'application/json' };
  const topics = topicsFor(choice, cfg.topics);
  const made = await fetchFn(`${RESEND}/contacts`, { method: 'POST', headers, body: JSON.stringify({ email, unsubscribed: false, segments: [{ id: cfg.audience }], ...(topics.length ? { topics } : {}) }) });
  if (made.ok) return true;
  const e = encodeURIComponent(email);
  const into = await fetchFn(`${RESEND}/contacts/${e}/segments/${encodeURIComponent(cfg.audience)}`, { method: 'POST', headers });
  if (!into.ok && into.status !== 409) return false;
  const back = await fetchFn(`${RESEND}/contacts/${e}`, { method: 'PATCH', headers, body: JSON.stringify({ unsubscribed: false }) });
  if (!back.ok) return false;
  if (!topics.length) return true;
  const set = await fetchFn(`${RESEND}/contacts/${e}/topics`, { method: 'PATCH', headers, body: JSON.stringify(topics) });
  return set.ok;
}

const WHICH = { both: 'the morning and evening editions', morning: 'the morning edition', evening: 'the evening edition' };

export async function handle(req, { store, fetchFn = fetch, cfg }) {
  const url = new URL(req.url);
  const isForm = !(req.headers.get('content-type') || '').includes('application/json');
  const reply = (ok, msg, status) => (req.method === 'POST' && isForm ? page(ok ? 'Check your email' : 'Not yet', esc(msg), status) : json({ ok, message: msg }, status));
  if (!cfg.key || !cfg.audience || !cfg.from || !store) return reply(false, 'Newsletter signup opens soon.', 503);

  const IN = ["You're in", 'Thanks for reading. The morning edition comes at 6:45 AM and the evening edition at 6:00 PM, every day, for whichever you chose. Every email has a link to change that or unsubscribe.'];
  const pendingFor = async (raw) => {
    const t = String(raw || '').replace(/[^0-9a-f]/g, '');
    const p = t.length === 48 ? await store.getJSON(`pending-${t}`) : null;
    return p && Date.now() - new Date(p.at).getTime() <= 7 * DAY ? { t, p } : null;
  };
  const expired = () => page('That link has expired', 'Sign up again on the <a href="/newsletter/">newsletter page</a> and we will send a fresh one.', 410);

  if (req.method === 'GET') {
    const got = await pendingFor(url.searchParams.get('confirm'));
    if (!got) return expired();
    if (got.p.confirmed) return page(...IN);
    return page('One more click', `Press the button to send ${WHICH[cleanChoice(got.p.choice)]} to ${esc(got.p.email)}.</p><form method="post" action="/api/subscribe"><input type="hidden" name="confirm" value="${got.t}"><button type="submit" style="font:inherit;background:#b92e2b;color:#fff;border:0;padding:12px 20px;border-radius:8px;cursor:pointer">Yes, sign me up</button></form><p style="font-size:14px">If you didn't ask for it, close this page and nothing happens.`);
  }

  if (req.method !== 'POST') return json({ ok: false }, 405);
  let body = {};
  try { body = isForm ? Object.fromEntries(new URLSearchParams(await req.text())) : await req.json(); } catch { body = {}; }
  if (body.confirm) {
    const got = await pendingFor(body.confirm);
    if (!got) return expired();
    if (got.p.confirmed) return page(...IN);
    if (!(await addContact(got.p.email, cfg, fetchFn, got.p.choice))) return page('Something went wrong', 'We could not finish your signup. Please open the link from the email again in a minute.', 502);
    await store.setJSON(`pending-${got.t}`, { ...got.p, confirmed: new Date().toISOString() });
    return page(...IN);
  }
  if (body.website) return reply(true, 'Check your email to confirm.', 200);
  const email = String(body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return reply(false, 'That email address does not look right.', 400);
  const askKey = `ask-${await hash(email)}`;
  const asked = await store.getJSON(askKey);
  if (asked && Date.now() - new Date(asked.at).getTime() < WAIT) return reply(true, 'Check your email and click the link to confirm.', 200);
  await store.setJSON(askKey, { at: new Date().toISOString() });
  const t = token();
  const choice = cleanChoice(body.choice);
  await store.setJSON(`pending-${t}`, { email, choice, at: new Date().toISOString() });
  const link = `${cfg.origin}/api/subscribe?confirm=${t}`;
  const sent = await fetchFn(`${RESEND}/emails`, {
    method: 'POST', headers: { authorization: `Bearer ${cfg.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: cfg.from, to: [email], subject: 'Confirm your Heart of Columbus newsletter',
      html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#1b1a17"><h1 style="font-size:24px">Confirm your signup</h1><p>Confirm you want ${WHICH[choice]} of Heart of Columbus: Columbus news, a local business, what's on and the weather, every day.</p><p><a href="${link}" style="display:inline-block;background:#b92e2b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Yes, sign me up</a></p><p style="font-size:13px;color:#555">If you didn't ask for this, ignore this email and nothing happens.</p></div>`,
      text: `Confirm your Heart of Columbus newsletter: ${link}\n\nIf you didn't ask for this, ignore this email.`,
    }),
  });
  if (!sent.ok) return reply(false, 'We could not send the confirmation email. Please try again in a minute.', 502);
  return reply(true, 'Check your email and click the link to confirm.', 200);
}

export default async (req) => handle(req, {
  store: blobStore('newsletter'),
  cfg: { key: env('RESEND_API_KEY'), audience: env('RESEND_SEGMENT_ID') || env('RESEND_AUDIENCE_ID'), from: env('HOC_NEWSLETTER_FROM'), origin: env('URL') || 'https://heartofcolumbus.shop', topics: { morning: env('RESEND_TOPIC_MORNING'), evening: env('RESEND_TOPIC_EVENING') } },
});

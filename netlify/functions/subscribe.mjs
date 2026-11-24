// /api/subscribe: the newsletter signup, on Resend, with double opt in.
//
// POST { email } (JSON from the signup script, or a plain form post) stores a
// pending signup in Netlify Blobs and emails a confirmation link. Only when
// that link is opened (GET /api/subscribe?confirm=<token>) is the address
// added to the Resend audience the morning newsletter goes to. The answer is
// the same whether or not an address is already signed up, so the form can't
// be used to check who reads the paper.
//
// Needs RESEND_API_KEY, RESEND_AUDIENCE_ID and HOC_NEWSLETTER_FROM (an address
// on a domain verified in Resend, such as "Heart of Columbus <news@...>").
// Without them it answers 503 and says signup isn't open yet.
import { blobStore } from '../../src/blobs.mjs';

export const config = { path: '/api/subscribe' };

const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const page = (title, text, status = 200) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | Heart of Columbus</title><style>body{font-family:Georgia,serif;max-width:560px;margin:12vh auto;padding:0 20px;color:#1b1a17;background:#fbf7f0;line-height:1.5}h1{font-size:30px}a{color:#b92e2b}</style></head><body><h1>${esc(title)}</h1><p>${text}</p><p><a href="/news/">Read today's paper</a></p></body></html>`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
export const validEmail = (e) => /^[^\s@<>"]{1,64}@[^\s@<>"]{1,190}\.[a-z]{2,}$/i.test(e) && e.length <= 254;
const token = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');
const DAY = 86400e3;

export async function handle(req, { store, fetchFn = fetch, cfg }) {
  const url = new URL(req.url);
  const isForm = !(req.headers.get('content-type') || '').includes('application/json');
  const reply = (ok, msg, status) => (req.method === 'POST' && isForm ? page(ok ? 'Check your email' : 'Not yet', esc(msg), status) : json({ ok, message: msg }, status));
  if (!cfg.key || !cfg.audience || !cfg.from || !store) return reply(false, 'Newsletter signup opens soon.', 503);

  if (req.method === 'GET') {
    const t = (url.searchParams.get('confirm') || '').replace(/[^0-9a-f]/g, '');
    const pending = t.length === 48 ? await store.getJSON(`pending-${t}`) : null;
    if (!pending || Date.now() - new Date(pending.at).getTime() > 7 * DAY) return page('That link has expired', 'Sign up again on the <a href="/newsletter/">newsletter page</a> and we will send a fresh one.', 410);
    const add = await fetchFn(`https://api.resend.com/audiences/${encodeURIComponent(cfg.audience)}/contacts`, {
      method: 'POST', headers: { authorization: `Bearer ${cfg.key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ email: pending.email, unsubscribed: false }),
    });
    if (!add.ok && add.status !== 409) return page('Something went wrong', 'We could not finish your signup. Please try the link again in a minute.', 502);
    await store.setJSON(`pending-${t}`, null);
    return page("You're in", 'Thanks for reading. The morning edition arrives on weekdays, and every email has a one click unsubscribe.');
  }

  if (req.method !== 'POST') return json({ ok: false }, 405);
  let body = {};
  try { body = isForm ? Object.fromEntries(new URLSearchParams(await req.text())) : await req.json(); } catch { body = {}; }
  if (body.website) return reply(true, 'Check your email to confirm.', 200);
  const email = String(body.email || '').trim().toLowerCase();
  if (!validEmail(email)) return reply(false, 'That email address does not look right.', 400);
  const t = token();
  await store.setJSON(`pending-${t}`, { email, at: new Date().toISOString() });
  const link = `${cfg.origin}/api/subscribe?confirm=${t}`;
  const sent = await fetchFn('https://api.resend.com/emails', {
    method: 'POST', headers: { authorization: `Bearer ${cfg.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: cfg.from, to: [email], subject: 'Confirm your Heart of Columbus newsletter',
      html: `<div style="font-family:Georgia,serif;max-width:520px;margin:auto;color:#1b1a17"><h1 style="font-size:24px">One click and you're in</h1><p>Confirm you want the Heart of Columbus morning edition: Columbus news, what's open early and today's events, on weekdays.</p><p><a href="${link}" style="display:inline-block;background:#b92e2b;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Yes, sign me up</a></p><p style="font-size:13px;color:#555">If you didn't ask for this, ignore this email and nothing happens.</p></div>`,
      text: `Confirm your Heart of Columbus newsletter: ${link}\n\nIf you didn't ask for this, ignore this email.`,
    }),
  });
  if (!sent.ok) return reply(false, 'We could not send the confirmation email. Please try again in a minute.', 502);
  return reply(true, 'Check your email and click the link to confirm.', 200);
}

export default async (req) => handle(req, {
  store: blobStore('newsletter'),
  cfg: { key: env('RESEND_API_KEY'), audience: env('RESEND_AUDIENCE_ID'), from: env('HOC_NEWSLETTER_FROM'), origin: env('URL') || 'https://heartofcolumbus.netlify.app' },
});

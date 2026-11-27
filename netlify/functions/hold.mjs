// /api/hold: stops a scheduled edition. Resend's cancel turns a scheduled
// broadcast back into a draft (no email is sent), so Hold keeps the draft and
// the publisher can fix it and send it from Resend, or leave it.
//
// Private, like /api/desk: the key travels after # in the link and is sent as
// the x-hoc-key header, never in a query string. Two keys work: the desk key
// (HOC_ADMIN_KEY), and the one time hold code the job puts in that edition's
// note, which can hold only that edition, so the note never carries the desk
// key. Only a POST holds: mail scanners open every link in an email, and a
// link that held on its own would stop editions nobody meant to stop.
//
//   GET  ?date=YYYY-MM-DD&edition=morning|evening   what is scheduled
//   POST { date, edition }                          hold it
import { blobStore } from '../../src/blobs.mjs';
import { sameKey } from '../../src/pixel-key.mjs';
import { keysFor, kindOf, columbusDate } from '../../src/news/paper-mail.mjs';
import { resendEnv, sha } from './newsletter.mjs';

export const config = { path: '/api/hold' };

const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer' } });
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function handle(req, { store, adminKey, resend, fetchFn = fetch }) {
  if (!store) return json({ ok: false, error: 'Storage is not set up on this deploy.' }, 503);
  const u = new URL(req.url);
  let b = {};
  if (req.method === 'POST') { try { b = await req.json(); } catch { b = {}; } } else if (req.method !== 'GET') return json({ ok: false, error: 'Use GET or POST.' }, 405);
  const date = DATE.test(b.date || u.searchParams.get('date') || '') ? (b.date || u.searchParams.get('date')) : columbusDate(new Date());
  const kind = kindOf(b.edition || u.searchParams.get('edition'));
  const keys = keysFor(kind, date);
  const rec = await store.getJSON(keys.draft);
  const given = req.headers.get('x-hoc-key') || '';
  const okKey = (adminKey && sameKey(adminKey, given)) || (rec && rec.holdHash && given && sameKey(rec.holdHash, await sha(given)));
  if (!okKey) return json({ ok: false, error: 'Wrong or expired hold link.' }, 403);
  const view = { date, edition: kind, subject: (rec && rec.subject) || '', scheduled: (rec && rec.scheduled) || '', held: (rec && rec.held) || '' };
  if (req.method === 'GET') return json({ ok: true, ...view });
  if (!rec || !rec.id) return json({ ok: false, error: 'Nothing is scheduled for that edition.', ...view }, 404);
  if (rec.held) return json({ ok: true, already: true, ...view });
  if (!rec.scheduled) return json({ ok: false, error: 'That edition is a draft, not scheduled, so there is nothing to hold.', ...view }, 409);
  if (Date.now() > Date.parse(rec.scheduled)) return json({ ok: false, error: 'Too late: that edition has already gone out.', ...view }, 409);
  if (!resend.key) return json({ ok: false, error: 'RESEND_API_KEY is not set.' }, 503);
  const r = await fetchFn(`https://api.resend.com/broadcasts/${encodeURIComponent(rec.id)}/cancel`, { method: 'POST', headers: { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' } });
  if (!r.ok) return json({ ok: false, error: `Resend would not hold it (${r.status}). Cancel it at https://resend.com/broadcasts/${rec.id} before it goes out.`, ...view }, 502);
  const held = new Date().toISOString();
  await store.setJSON(keys.draft, { ...rec, held, scheduled: '' });
  const run = await store.getJSON(keys.run);
  if (run) await store.setJSON(keys.run, { ...run, held });
  return json({ ok: true, ...view, held, scheduled: '' });
}

export default async (req) => handle(req, { store: blobStore('newsletter'), adminKey: env('HOC_ADMIN_KEY'), resend: resendEnv() });

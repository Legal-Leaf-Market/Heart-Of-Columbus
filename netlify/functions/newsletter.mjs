// The morning newsletter job. Every weekday at 10:30 UTC (5:30 AM in Columbus
// in winter, 6:30 in summer) it reads today's edition, which the build wrote
// to /newsletter/editions/<date>.json from stories already published, and
// creates a DRAFT in Buttondown. An editor reads the draft and presses send:
// the paper's rule is that nothing goes out without a person reading it, so
// this job never sends.
//
// Needs BUTTONDOWN_API_KEY in Netlify's environment variables. Without it the
// job logs that it is off and does nothing. A morning with no story from the
// last 36 hours is skipped rather than resending old news. Each day's draft is
// recorded in Netlify Blobs, so a retry never makes two drafts for one day.
// To run it by hand: Netlify > Functions > newsletter > Run now.
import { blobStore } from '../../src/blobs.mjs';
import { columbusDate } from '../../src/news/editions.mjs';

export const config = { schedule: '30 10 * * 1-5' };

const API = 'https://api.buttondown.com/v1/emails';

export async function makeDraft({ key, origin, date, store, fetchFn = fetch, log = console.log }) {
  if (!key) { log('[newsletter] BUTTONDOWN_API_KEY is not set; the morning job is off.'); return { ok: false, reason: 'no-key' }; }
  if (store && (await store.getJSON(`draft-${date}`))) { log(`[newsletter] draft for ${date} already made`); return { ok: true, reason: 'already' }; }
  const res = await fetchFn(`${origin}/newsletter/editions/${date}.json`);
  if (!res.ok) { log(`[newsletter] no edition for ${date} (${res.status})`); return { ok: false, reason: 'no-edition' }; }
  const ed = await res.json();
  if (!ed.fresh) { log(`[newsletter] no new stories for ${date}; skipped`); return { ok: true, reason: 'nothing-new' }; }
  const sent = await fetchFn(API, {
    method: 'POST',
    headers: { authorization: `Token ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ subject: ed.subject, body: ed.html, status: 'draft' }),
  });
  if (!sent.ok) { log(`[newsletter] Buttondown refused the draft: ${sent.status} ${(await sent.text()).slice(0, 300)}`); return { ok: false, reason: 'refused', status: sent.status }; }
  const made = await sent.json().catch(() => ({}));
  if (store) await store.setJSON(`draft-${date}`, { id: made.id || '', at: new Date().toISOString() });
  log(`[newsletter] draft made for ${date}: ${ed.subject}`);
  return { ok: true, reason: 'drafted', id: made.id };
}

export default async () => {
  const env = (k) => (globalThis.Netlify?.env?.get(k)) ?? process.env[k];
  await makeDraft({ key: env('BUTTONDOWN_API_KEY'), origin: env('URL') || 'https://heartofcolumbus.netlify.app', date: columbusDate(new Date()), store: blobStore('newsletter') });
};

// The morning newsletter job. It runs at 6:45 AM in Columbus on weekdays
// (two UTC times, 10:45 and 11:45, so it is 6:45 in summer and in winter;
// the run that lands at any other local hour does nothing). That is after the
// publisher's 6:30 deadline at the writing desk, so it never races the desk:
// if the publisher already made a draft, the job sees it and stops.
//
// It makes a DRAFT, never a send. With an approved desk edition it drafts
// that; on a morning marked "No edition" it makes none; otherwise it reads the
// automatic edition the build wrote to /newsletter/editions/<date>.json from
// stories already published. A morning with no story from the last 36 hours
// is skipped rather than resending old news.
//
// Resend (preferred): RESEND_API_KEY, RESEND_SEGMENT_ID (or the older
// RESEND_AUDIENCE_ID) and HOC_NEWSLETTER_FROM make a broadcast DRAFT for the
// segment /api/subscribe fills. Buttondown works too: BUTTONDOWN_API_KEY makes a Buttondown draft.
// With neither the job logs that it is off and does nothing.
//
// Each day's draft is recorded in Netlify Blobs (store "newsletter",
// `draft-<date>`), so a retry never makes two drafts for one day. When the
// desk makes the draft again after an edit, the old Resend draft is deleted
// first, so the service never holds two drafts for one morning. Sending is
// only ever a person pressing send: in the service, or "Send to subscribers"
// at the desk (sendDraft below), which refuses a second send.
// To run it by hand: Netlify > Functions > newsletter > Run now (it honours
// the 6 AM hour check, so outside that hour it only logs).
import { blobStore } from '../../src/blobs.mjs';
import { columbusDate } from '../../src/news/editions.mjs';
import { approved, editionHtml } from '../../src/news/desk.mjs';
import { PAPER } from '../../src/data/paper.mjs';

export const config = { schedule: '45 10,11 * * 1-5' };

const TZ = 'America/Indiana/Indianapolis';
const RESEND = 'https://api.resend.com';
// The hour it is in Columbus, 0 to 23.
export const columbusHour = (now = new Date()) => Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(now));
const unsubscribeFooter = (html) => html.replace('</body>', '<p style="font-size:12px;color:#666"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p></body>');
const resendHeaders = (key) => ({ authorization: `Bearer ${key}`, 'content-type': 'application/json' });

// `edition` (subject, html, fresh) skips the fetch: the writing desk passes
// the publisher's approved edition. `force` makes a fresh draft even when one
// was already made that day (the desk's "make it again" after an edit).
export async function makeDraft({ key, resend = null, origin, date, store, fetchFn = fetch, log = console.log, edition = null, force = false }) {
  const useResend = !!(resend && resend.key && resend.segment && resend.from);
  if (!key && !useResend) { log('[newsletter] no RESEND_* or BUTTONDOWN_API_KEY set; the morning job is off.'); return { ok: false, reason: 'no-key' }; }
  const prev = store ? await store.getJSON(`draft-${date}`) : null;
  if (prev && prev.sentAt) { log(`[newsletter] ${date} was already sent; no new draft`); return { ok: !edition, reason: 'sent', error: 'This morning was already sent to subscribers.' }; }
  // The automatic job never replaces anything. The desk replaces its own
  // draft only when asked (force), and always replaces an automatic one: the
  // publisher's edition is the one that should go out.
  const replace = !!(prev && edition && (force || prev.from !== 'desk'));
  if (prev && !replace) { log(`[newsletter] draft for ${date} already made`); return { ok: true, reason: 'already' }; }
  let ed = edition;
  if (!ed) {
    const res = await fetchFn(`${origin}/newsletter/editions/${date}.json`);
    if (!res.ok) { log(`[newsletter] no edition for ${date} (${res.status})`); return { ok: false, reason: 'no-edition' }; }
    ed = await res.json();
  }
  if (!ed.fresh) { log(`[newsletter] no new stories for ${date}; skipped`); return { ok: true, reason: 'nothing-new' }; }
  if (replace && useResend && prev.id && prev.service !== 'buttondown') {
    const del = await fetchFn(`${RESEND}/broadcasts/${encodeURIComponent(prev.id)}`, { method: 'DELETE', headers: resendHeaders(resend.key) });
    // A draft someone already deleted by hand is fine; anything else stops
    // here rather than leave two drafts side by side.
    if (!del.ok && del.status !== 404) { log(`[newsletter] could not remove the old draft ${prev.id}: ${del.status}`); return { ok: false, reason: 'refused', status: del.status, error: 'The newsletter service would not remove the earlier draft. Delete it there, then try again.' }; }
  }
  const sent = useResend
    ? await fetchFn(`${RESEND}/broadcasts`, {
      method: 'POST',
      headers: resendHeaders(resend.key),
      body: JSON.stringify({
        segment_id: resend.segment, from: resend.from, subject: ed.subject, name: `Morning edition ${date}`,
        ...(resend.replyTo ? { reply_to: resend.replyTo } : {}),
        html: unsubscribeFooter(ed.html),
      }),
    })
    : await fetchFn('https://api.buttondown.com/v1/emails', {
      method: 'POST',
      headers: { authorization: `Token ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ subject: ed.subject, body: ed.html, status: 'draft' }),
    });
  if (!sent.ok) {
    const why = (await sent.text()).slice(0, 300);
    log(`[newsletter] the newsletter service refused the draft: ${sent.status} ${why}`);
    return { ok: false, reason: 'refused', status: sent.status, error: `The newsletter service refused the draft (${sent.status}): ${why || 'no reason given'}` };
  }
  const made = await sent.json().catch(() => ({}));
  if (store) await store.setJSON(`draft-${date}`, { id: made.id || '', at: new Date().toISOString(), subject: ed.subject, from: edition ? 'desk' : 'auto', service: useResend ? 'resend' : 'buttondown' });
  log(`[newsletter] draft made for ${date}: ${ed.subject}`);
  return { ok: true, reason: replace ? 'replaced' : 'drafted', id: made.id };
}

// "Send me a test": the edition as a single email to HOC_NEWSLETTER_TEST_TO,
// marked [Test], so the publisher reads it in a real inbox before anyone else.
export async function testSend({ resend, to, edition, fetchFn = fetch }) {
  if (!(resend && resend.key && resend.from)) return { ok: false, error: 'Test sends need RESEND_API_KEY and HOC_NEWSLETTER_FROM in Netlify.' };
  const list = String(to || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 5);
  if (!list.length) return { ok: false, error: 'Set HOC_NEWSLETTER_TEST_TO in Netlify to the address the test goes to.' };
  const r = await fetchFn(`${RESEND}/emails`, {
    method: 'POST', headers: resendHeaders(resend.key),
    body: JSON.stringify({ from: resend.from, to: list, subject: `[Test] ${edition.subject}`, html: edition.html }),
  });
  if (!r.ok) return { ok: false, error: `The newsletter service refused the test (${r.status}).` };
  return { ok: true, to: list };
}

// "Send to subscribers": a person pressing send at the desk. Sends the Resend
// draft made for that morning, once. `subject` must match the draft's, so a
// stale page cannot send an edition the publisher did not just look at.
export async function sendDraft({ resend, date, store, subject, fetchFn = fetch, log = console.log }) {
  if (!(resend && resend.key)) return { ok: false, error: 'Sending from the desk needs RESEND_API_KEY in Netlify.' };
  const rec = store && (await store.getJSON(`draft-${date}`));
  if (!rec || !rec.id) return { ok: false, error: 'Make the newsletter draft first.' };
  if (rec.service === 'buttondown') return { ok: false, error: 'This draft is in Buttondown. Send it there.' };
  if (rec.sentAt) return { ok: false, error: `Already sent at ${rec.sentAt}.` };
  if (String(subject || '') !== rec.subject) return { ok: false, error: 'The subject changed since the draft was made. Make the draft again, read it, then send.' };
  const r = await fetchFn(`${RESEND}/broadcasts/${encodeURIComponent(rec.id)}/send`, { method: 'POST', headers: resendHeaders(resend.key), body: '{}' });
  if (!r.ok) { const why = (await r.text()).slice(0, 300); log(`[newsletter] send refused: ${r.status} ${why}`); return { ok: false, error: `The newsletter service refused the send (${r.status}).` }; }
  await store.setJSON(`draft-${date}`, { ...rec, sentAt: new Date().toISOString() });
  log(`[newsletter] sent ${date}: ${rec.subject}`);
  return { ok: true, reason: 'sent' };
}

// The publisher's morning: when the writing desk (/newsroom/desk/) has an
// approved edition for today, that is the draft. A morning the publisher
// marked "skip" gets none. Otherwise the automatic edition, still a draft.
export async function deskEdition(deskStore, date, origin) {
  const day = deskStore && (await deskStore.getJSON(`day-${date}`));
  if (!day) return null;
  if (day.plan && day.plan.skip) return { skip: true };
  const pieces = approved(day);
  if (!pieces.length || !String(day.plan.subject || '').trim()) return null;
  return { subject: day.plan.subject, html: editionHtml({ name: PAPER.name, date, intro: day.plan.intro, pieces, origin }), fresh: pieces.length };
}

// Resend renamed Audiences to Segments (November 2025) and deprecated the
// audience endpoints. An old audience id is now that segment's id, so
// RESEND_AUDIENCE_ID still works; RESEND_SEGMENT_ID wins when both are set.
export const resendConfig = (env) => ({ key: env('RESEND_API_KEY'), segment: env('RESEND_SEGMENT_ID') || env('RESEND_AUDIENCE_ID'), from: env('HOC_NEWSLETTER_FROM'), replyTo: env('HOC_NEWSLETTER_REPLY_TO') });

export default async () => {
  const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
  const now = new Date();
  if (columbusHour(now) !== 6) { console.log(`[newsletter] it is ${columbusHour(now)}:45 in Columbus, not 6:45; the other run handles today`); return; }
  const origin = env('URL') || 'https://heartofcolumbus.shop';
  const date = columbusDate(now);
  const desk = await deskEdition(blobStore('desk'), date, origin);
  if (desk && desk.skip) { console.log(`[newsletter] the publisher skipped ${date}`); return; }
  await makeDraft({ key: env('BUTTONDOWN_API_KEY'), resend: resendConfig(env), origin, date, store: blobStore('newsletter'), edition: desk });
};

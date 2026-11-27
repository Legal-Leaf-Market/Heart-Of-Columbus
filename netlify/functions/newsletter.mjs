// The morning newsletter job. On weekdays at 6:45 AM in Columbus it makes
// the day's newsletter DRAFT. An editor reads the draft and presses send:
// the paper's rule is that nothing goes out without a person reading it, so
// this job never sends.
//
// Which edition: when the writing desk (/newsroom/desk/) has approved pieces
// for today, those are the draft. A morning the publisher marked "No edition"
// gets none. Otherwise the automatic edition the build wrote to
// /newsletter/editions/<date>.json from stories already published; a morning
// with no story from the last 36 hours is skipped rather than resending old
// news. If the desk already made today's draft, the job leaves it alone.
//
// The clock: Netlify schedules in UTC, and Columbus moves between UTC-5 and
// UTC-4, so the job wakes at 10:45 and 11:45 UTC and only the first wake
// at or after 6:30 AM Columbus time does anything. That is 6:45 AM all year,
// after the desk's 6:30 deadline (docs/morning-paper.md). Each day's run is
// recorded in Netlify Blobs (store "newsletter", `run-<date>`), so a retry
// or the second wake never makes a second draft.
//
// Resend (preferred): RESEND_API_KEY, HOC_NEWSLETTER_FROM and the segment
// /api/subscribe fills (RESEND_SEGMENT_ID; RESEND_AUDIENCE_ID still works,
// since Resend renamed Audiences to Segments in November 2025 and kept the
// ids) make a broadcast DRAFT. Resend sends a broadcast only when someone
// presses send. Buttondown works too: BUTTONDOWN_API_KEY makes a Buttondown
// draft. With neither the job logs that it is off and does nothing.
//
// HOC_NEWSLETTER_NOTIFY (one or more addresses, comma separated) gets a short
// note from the job each weekday morning: the draft is waiting, or why there
// is none today. It needs the Resend settings above.
//
// To run it by hand after 6:30 AM: Netlify > Functions > newsletter > Run now.
// Before then, use "Make the newsletter draft" at the desk.
import { blobStore } from '../../src/blobs.mjs';
import { columbusDate, columbusMinutes, prettyDate } from '../../src/news/editions.mjs';
import { approved, editionHtml, planBlockers } from '../../src/news/desk.mjs';
import { PAPER } from '../../src/data/paper.mjs';

export const config = { schedule: '45 10,11 * * 1-5' };

const API = 'https://api.buttondown.com/v1/emails';
const RESEND = 'https://api.resend.com';
export const START = 6 * 60 + 30; // 6:30 AM in Columbus

const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();

// The Resend settings from the environment, shared with /api/desk.
export const resendEnv = () => ({
  key: env('RESEND_API_KEY'), segment: env('RESEND_SEGMENT_ID') || env('RESEND_AUDIENCE_ID'),
  from: env('HOC_NEWSLETTER_FROM'), replyTo: env('HOC_NEWSLETTER_REPLY_TO'),
});

const withUnsubscribe = (html) => html.replace('</body>', '<p style="font-size:12px;color:#666"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a></p></body>');

// `edition` (subject, html, fresh) skips the fetch: the writing desk passes
// the publisher's approved edition. `force` replaces a draft already made
// that day (the desk's "make it again" after an edit): on Resend the old
// draft is updated in place, so there is never a stale second draft to send
// by mistake. If the old one was already sent, a new draft is made.
export async function makeDraft({ key, resend = null, origin, date, store, fetchFn = fetch, log = console.log, edition = null, force = false }) {
  const useResend = !!(resend && resend.key && (resend.segment || resend.audience) && resend.from);
  if (!key && !useResend) { log('[newsletter] no RESEND_* or BUTTONDOWN_API_KEY set; the morning job is off.'); return { ok: false, reason: 'no-key' }; }
  const before = store ? await store.getJSON(`draft-${date}`) : null;
  if (!force && before) { log(`[newsletter] draft for ${date} already made`); return { ok: true, reason: 'already', from: before.from }; }
  let ed = edition;
  if (!ed) {
    const res = await fetchFn(`${origin}/newsletter/editions/${date}.json`);
    if (!res.ok) { log(`[newsletter] no edition for ${date} (${res.status})`); return { ok: false, reason: 'no-edition' }; }
    ed = await res.json();
  }
  if (!ed.fresh) { log(`[newsletter] no new stories for ${date}; skipped`); return { ok: true, reason: 'nothing-new' }; }
  const authR = resend ? { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' } : null;
  const content = useResend ? {
    from: resend.from, subject: ed.subject, name: `Morning edition ${date}`, html: withUnsubscribe(ed.html),
    ...(resend.replyTo ? { reply_to: resend.replyTo } : {}),
  } : null;
  let sent = null;
  let updated = false;
  if (useResend && force && before && before.id && before.via === 'resend') {
    const up = await fetchFn(`${RESEND}/broadcasts/${encodeURIComponent(before.id)}`, { method: 'PATCH', headers: authR, body: JSON.stringify(content) });
    if (up.ok) { sent = up; updated = true; } else log(`[newsletter] could not update the earlier draft (${up.status}); making a new one`);
  }
  if (!sent) {
    sent = useResend
      ? await fetchFn(`${RESEND}/broadcasts`, { method: 'POST', headers: authR, body: JSON.stringify({ segment_id: resend.segment || resend.audience, ...content }) })
      : await fetchFn(API, {
        method: 'POST',
        headers: { authorization: `Token ${key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ subject: ed.subject, body: ed.html, status: 'draft' }),
      });
  }
  if (!sent.ok) { log(`[newsletter] the newsletter service refused the draft: ${sent.status} ${(await sent.text()).slice(0, 300)}`); return { ok: false, reason: 'refused', status: sent.status }; }
  const made = await sent.json().catch(() => ({}));
  const id = made.id || (updated ? before.id : '');
  if (store) await store.setJSON(`draft-${date}`, { id, via: useResend ? 'resend' : 'buttondown', at: new Date().toISOString(), subject: ed.subject, from: edition ? (edition.from || 'desk') : 'auto', replaced: before ? (updated ? 'updated' : before.id || 'yes') : '' });
  log(`[newsletter] draft ${updated ? 'updated' : 'made'} for ${date}: ${ed.subject}`);
  return { ok: true, reason: updated ? 'updated' : 'drafted', id };
}

// The publisher's morning: the desk's approved pieces, in the chosen order.
// `skip` when the publisher marked "No edition". With approved pieces but no
// subject yet, the paper's plain dated subject stands in; an open that still
// has a [CHECK] or a dash is left out rather than sent unchecked. `notes`
// says what was changed, for the morning note.
export async function deskEdition(deskStore, date, origin) {
  const day = deskStore && (await deskStore.getJSON(`day-${date}`));
  if (!day) return null;
  if (day.plan && day.plan.skip) return { skip: true };
  const pieces = approved(day);
  if (!pieces.length) return null;
  const notes = [];
  let subject = String(day.plan.subject || '').trim();
  let intro = day.plan.intro || '';
  if (planBlockers({ intro }).length) { intro = ''; notes.push('Your open was left out: it still has a [CHECK] or a dash.'); }
  if (!subject || planBlockers({ subject }).length) { subject = `${PAPER.name}, ${prettyDate(date)}`; notes.push(`The subject line was ${String(day.plan.subject || '').trim() ? 'not usable (a [CHECK] or a dash)' : 'empty'}, so the draft says "${subject}".`); }
  return { subject, html: editionHtml({ name: PAPER.name, date, intro, pieces, origin }), fresh: pieces.length, from: 'desk', notes };
}

const WHY = {
  drafted: 'The draft is waiting in the newsletter service. Read it and press send.',
  updated: 'The draft is waiting in the newsletter service. Read it and press send.',
  already: 'A draft was already made this morning. It is waiting in the newsletter service.',
  'nothing-new': 'No draft today: no approved desk pieces and no new story in the last 36 hours.',
  skip: 'No draft today: you marked this morning "No edition" at the desk.',
  'no-edition': 'No draft today: the site has no edition file for this morning. A publish of the site writes the next fourteen.',
  refused: 'No draft today: the newsletter service refused it. Check the function log (Netlify > Logs > Functions > newsletter).',
};

export async function notify({ resend, to, date, result, notes = [], fetchFn = fetch, log = console.log }) {
  const list = String(to || '').split(',').map((s) => s.trim()).filter((s) => /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(s)).slice(0, 5);
  if (!list.length || !resend || !resend.key || !resend.from) return false;
  const why = WHY[result.reason] || `The morning job ended with "${result.reason}".`;
  const lines = [why, ...notes, result.subject ? `Subject: ${result.subject}` : '', 'Resend broadcasts: https://resend.com/broadcasts', 'The desk: open your private desk link.'].filter(Boolean);
  const r = await fetchFn(`${RESEND}/emails`, {
    method: 'POST', headers: { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: resend.from, to: list, subject: `Morning edition ${date}: ${result.ok && /drafted|updated|already/.test(result.reason) ? 'draft ready' : 'no draft'}`, text: lines.join('\n\n') }),
  });
  if (!r.ok) log(`[newsletter] the morning note was not sent (${r.status})`);
  return r.ok;
}

// One morning's run. `now` decides the Columbus clock; `force` ignores it
// and the once-a-day record (tests, and a deliberate second run).
export async function morningRun({ now = new Date(), deskStore, store, origin, key, resend, notifyTo = '', fetchFn = fetch, log = console.log, force = false }) {
  const date = columbusDate(now);
  if (!force && columbusMinutes(now) < START) { log(`[newsletter] ${date}: before 6:30 AM in Columbus; the next wake makes the draft`); return { ok: true, reason: 'early' }; }
  if (!force && store && (await store.getJSON(`run-${date}`))) { log(`[newsletter] ${date}: already ran this morning`); return { ok: true, reason: 'ran' }; }
  const desk = await deskEdition(deskStore, date, origin);
  let result;
  if (desk && desk.skip) { log(`[newsletter] the publisher skipped ${date}`); result = { ok: true, reason: 'skip' }; }
  else result = await makeDraft({ key, resend, origin, date, store, fetchFn, log, edition: desk });
  const subject = desk && !desk.skip ? desk.subject : '';
  if (store) await store.setJSON(`run-${date}`, { at: now.toISOString(), reason: result.reason, ok: result.ok, from: desk && !desk.skip ? 'desk' : (result.from || 'auto'), notes: (desk && desk.notes) || [] });
  await notify({ resend, to: notifyTo, date, result: { ...result, subject }, notes: (desk && desk.notes) || [], fetchFn, log }).catch((e) => log(`[newsletter] the morning note failed: ${e.message}`));
  return result;
}

export default async () => {
  await morningRun({
    deskStore: blobStore('desk'), store: blobStore('newsletter'),
    origin: env('URL') || 'https://heartofcolumbus.shop',
    key: env('BUTTONDOWN_API_KEY'), resend: resendEnv(), notifyTo: env('HOC_NEWSLETTER_NOTIFY'),
  });
};

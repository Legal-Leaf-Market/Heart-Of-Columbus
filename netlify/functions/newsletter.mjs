// The newsletter jobs: the morning edition (this file's schedule) and the
// evening edition (newsletter-evening.mjs), every day of the week. Jake's
// decision (2026-11-27): each edition SENDS on schedule unless he presses
// Hold. The job builds the edition, makes the Resend broadcast for the
// edition's topic, schedules it for the send time, and emails him a note
// with the subject, a preview link and the Hold link.
//
// Columbus time (src/news/paper-mail.mjs, EDITIONS):
//   morning  desk deadline 6:10 AM, draft and note 6:15, send 6:45
//   evening  desk deadline 5:25 PM, draft and note 5:30, send 6:00 PM
// Netlify schedules in UTC and Columbus moves between UTC-5 and UTC-4, so each
// job wakes at both possible UTC hours and acts at the first wake at or after
// its draft time. Each run is recorded in Netlify Blobs (store "newsletter",
// `run-<date>` for the morning, `run-<date>-evening` for the evening), so a
// retry or the second wake never makes a second edition.
//
// What goes in: the desk's approved pieces and "Up the road" for that edition
// (/newsroom/desk/), or, with nothing approved, the automatic edition built
// only from published stories, the site's own data and first hand public
// sources. No writing help runs here. An edition needs the weather plus at
// least one other section, or it is skipped and the note says why. A day the
// publisher marked "No edition" gets none.
//
// Resend: RESEND_API_KEY, HOC_NEWSLETTER_FROM and the segment /api/subscribe
// fills (RESEND_SEGMENT_ID, or the older RESEND_AUDIENCE_ID). Each edition is
// scoped to its topic, RESEND_TOPIC_MORNING or RESEND_TOPIC_EVENING, so a
// reader gets only the editions they chose. An edition is skipped if its
// topic is unset. BUTTONDOWN_API_KEY makes
// a Buttondown draft instead (never sent: Buttondown has no Hold here).
//
// HOC_NEWSLETTER_NOTIFY (comma separated) gets the note for each edition.
// To run it by hand: Netlify > Functions > newsletter > Run now.
import { blobStore } from '../../src/blobs.mjs';
import { approved, planBlockers } from '../../src/news/desk.mjs';
import {
  EDITIONS, kindOf, keysFor, plan, composeEdition, subjectFor, clean, pickSpotlight, pickDesign,
  listingChanges, lookout, addDays, hoursOn, roadBlockers, fmtClock, prettyDate,
} from '../../src/news/paper-mail.mjs';
import { PAPER } from '../../src/data/paper.mjs';

export const config = { schedule: '15 10,11 * * *' };

const API = 'https://api.buttondown.com/v1/emails';
const RESEND = 'https://api.resend.com';
const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();

export const resendEnv = () => ({
  key: env('RESEND_API_KEY'), segment: env('RESEND_SEGMENT_ID') || env('RESEND_AUDIENCE_ID'),
  from: env('HOC_NEWSLETTER_FROM'), replyTo: env('HOC_NEWSLETTER_REPLY_TO'),
  topics: { morning: env('RESEND_TOPIC_MORNING'), evening: env('RESEND_TOPIC_EVENING') },
});
export const usesResend = (r) => !!(r && r.key && r.segment && r.from);

const hex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
export const holdToken = () => hex(crypto.getRandomValues(new Uint8Array(24)));
export const sha = async (s) => hex(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(s)))));

async function getJSON(url, fetchFn, init) {
  try { const r = await fetchFn(url, init); return r.ok ? await r.json() : null; } catch { return null; }
}

// Gathers everything an edition needs and builds it. Shared by the job and
// the desk's preview, so the desk shows exactly what will go out. `record`
// false (the desk) leaves the spotlight and listing histories alone.
export async function assemble({ kind = 'morning', date, deskStore, store, origin, fetchFn = fetch }) {
  const k = kindOf(kind);
  const keys = keysFor(k, date);
  const day = deskStore ? await deskStore.getJSON(keys.day) : null;
  if (day && day.plan && day.plan.skip) return { skip: true, notes: [] };
  const notes = [];
  const pieces = day ? approved(day) : [];
  let intro = (day && day.plan && day.plan.intro) || '';
  if (intro && planBlockers({ intro }).length) { intro = ''; notes.push('Your open was left out: it still has a [CHECK] or a dash.'); }
  const typed = (day && day.plan && day.plan.subject) || '';
  if (typed.trim() && !clean(typed)) notes.push('Your subject line had a [CHECK] or a dash, so the plain dated subject was used.');
  let road = (day && day.plan && day.plan.road) || null;
  if (road && (road.url || road.headline) && roadBlockers(road).length) { notes.push(`Up the road was left out: ${roadBlockers(road).join(' ')}`); road = null; }

  const evening = k === 'evening';
  const [parts, daily, events] = await Promise.all([
    evening ? null : getJSON(`${origin}/newsletter/editions/${date}.json`, fetchFn),
    getJSON(`${origin}/newsletter/daily.json`, fetchFn),
    getJSON(`${origin}/api/events?format=json&from=${evening ? addDays(date, 1) : date}&days=${evening ? 4 : 1}`, fetchFn),
  ]);
  const leads = deskStore ? await deskStore.getJSON(`leads-${date}`) : null;
  const [spotHist, designHist, snap] = store ? await Promise.all([store.getJSON('spotlight-history'), store.getJSON('design-history'), store.getJSON('dirsnap')]) : [null, null, null];

  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  const spot = !evening && daily ? pickSpotlight(daily.spotlight, spotHist || {}, date) : null;
  const design = evening && daily ? pickDesign(daily.design, designHist || {}, date) : null;
  const changes = daily && snap && snap.snapshot ? listingChanges(snap.snapshot, daily.snapshot) : null;
  const lookoutItems = lookout(k, date, { events: (events && events.events) || [], leads });
  if (!daily) notes.push('The site\'s daily file was missing, so the spotlight, Columbus by Design and listing changes were left out.');

  const ed = composeEdition({
    kind: k, date, name: PAPER.name, origin, intro, pieces, road,
    stories: (parts && parts.stories) || [], early: (parts && parts.early) || [], business: (parts && parts.business) || null, sponsors: (parts && parts.sponsors) || [],
    spotlight: spot ? { ...spot, today: hoursOn(spot.hours, dow) } : null, design, changes, lookoutItems,
  });
  return {
    skip: false, notes, html: ed.html, substance: ed.substance, sections: ed.sections,
    subject: subjectFor(k, date, PAPER.name, typed), from: pieces.length ? 'desk' : 'auto', pieces: pieces.length,
    picks: { spotlight: spot ? spot.slug : '', design: design ? design.id : '', snapshot: daily ? daily.snapshot : null },
  };
}

// Makes (or updates in place) the edition's broadcast. A draft made earlier
// at the desk is updated rather than duplicated; one already sent is not.
export async function makeBroadcast({ kind = 'morning', date, store, resend, key = '', subject, html, fetchFn = fetch, log = console.log }) {
  const k = kindOf(kind);
  const keys = keysFor(k, date);
  const useResend = usesResend(resend);
  if (!useResend && !key) { log('[newsletter] no RESEND_* or BUTTONDOWN_API_KEY set; the newsletter is off.'); return { ok: false, reason: 'no-key' }; }
  const before = store ? await store.getJSON(keys.draft) : null;
  if (!useResend) {
    if (before && before.id) return { ok: true, reason: 'already', id: before.id, via: 'buttondown' };
    const r = await fetchFn(API, { method: 'POST', headers: { authorization: `Token ${key}`, 'content-type': 'application/json' }, body: JSON.stringify({ subject, body: html, status: 'draft' }) });
    if (!r.ok) { log(`[newsletter] Buttondown refused the draft: ${r.status}`); return { ok: false, reason: 'refused', status: r.status }; }
    const made = await r.json().catch(() => ({}));
    if (store) await store.setJSON(keys.draft, { id: made.id || '', via: 'buttondown', at: new Date().toISOString(), subject });
    return { ok: true, reason: 'drafted', id: made.id || '', via: 'buttondown' };
  }
  // Never a second scheduled broadcast for one edition: hold the first.
  if (before && before.scheduled && !before.held) { log(`[newsletter] ${k} ${date} is already scheduled; hold it first`); return { ok: false, reason: 'already-scheduled', id: before.id, via: 'resend' }; }
  const topic = resend.topics?.[k];
  if (!topic) return { ok: false, reason: 'no-topic' };
  const auth = { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' };
  const content = {
    segment_id: resend.segment, from: resend.from, subject, html, name: `${EDITIONS[k].label} edition ${date}`,
    ...(resend.replyTo ? { reply_to: resend.replyTo } : {}), topic_id: topic,
  };
  let id = '';
  let updated = false;
  if (before && before.id && before.via === 'resend' && !before.scheduled) {
    const up = await fetchFn(`${RESEND}/broadcasts/${encodeURIComponent(before.id)}`, { method: 'PATCH', headers: auth, body: JSON.stringify(content) });
    if (up.ok) { id = before.id; updated = true; } else log(`[newsletter] could not update the earlier draft (${up.status}); making a new one`);
  }
  if (!id) {
    const made = await fetchFn(`${RESEND}/broadcasts`, { method: 'POST', headers: auth, body: JSON.stringify(content) });
    if (!made.ok) { log(`[newsletter] Resend refused the broadcast: ${made.status} ${(await made.text()).slice(0, 300)}`); return { ok: false, reason: 'refused', status: made.status }; }
    id = ((await made.json().catch(() => ({}))).id) || '';
  }
  if (store) await store.setJSON(keys.draft, { ...(before || {}), id, via: 'resend', at: new Date().toISOString(), subject, topic: topic || '', scheduled: '', held: '' });
  return { ok: true, reason: updated ? 'updated' : 'drafted', id, via: 'resend' };
}

// Schedules a broadcast made above. Resend sends it at `at` unless it is
// cancelled first (Hold), which turns it back into a draft.
export async function scheduleBroadcast({ id, at, resend, fetchFn = fetch, log = console.log }) {
  const r = await fetchFn(`${RESEND}/broadcasts/${encodeURIComponent(id)}/send`, {
    method: 'POST', headers: { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' }, body: JSON.stringify({ scheduled_at: at }),
  });
  if (!r.ok) log(`[newsletter] Resend would not schedule ${id}: ${r.status} ${(await r.text()).slice(0, 300)}`);
  return r.ok;
}

const WHY = {
  scheduled: (k, at) => `It goes out at ${fmtClock(EDITIONS[k].send)} unless you press Hold.`,
  late: () => 'It was NOT sent: the job ran more than an hour after the send time. The draft is waiting in Resend; send it from there if you still want it.',
  drafted: () => 'The Buttondown draft is waiting. Read it there and press send.',
  already: () => 'The draft was already made. It is waiting in the newsletter service.',
  skip: () => 'No edition: you marked it "No edition" at the desk.',
  thin: () => 'No edition: nothing to put in it besides the weather.',
  'no-topic': (kind) => `No edition: set RESEND_TOPIC_${kind.toUpperCase()} in Netlify to send only to readers who chose this edition.`,
  'not-scheduled': () => 'The broadcast was made but Resend would not schedule it, so it was NOT sent. Check the function log (Netlify > Logs > Functions).',
  'audience-unverified': () => 'The draft was saved but was NOT sent. Resend did not confirm draft status and the expected segment and topic. Check the draft audience before sending.',
  'history-unverified': () => 'No edition was sent. Resend did not return the recent broadcast history, so the job could not check for an existing edition.',
  'already-in-resend': () => 'Resend already has a scheduled, queued or previously sent broadcast for this edition and segment. No second broadcast was created.',
  refused: () => 'No edition: Resend refused it. Check the function log (Netlify > Logs > Functions).',
  'already-scheduled': () => 'This edition is already scheduled in Resend. Hold it first to remake it.',
  'no-key': () => 'No edition: no newsletter service is set in Netlify.',
};

// One note per edition: what happened, the subject, a preview link and, when
// it is scheduled, the Hold link. The edition itself follows, as a preview.
export async function notify({ resend, to, kind = 'morning', date, result, notes = [], hold = '', html = '', fetchFn = fetch, log = console.log }) {
  const k = kindOf(kind);
  const list = String(to || '').split(',').map((s) => s.trim()).filter((s) => /^[^\s@<>"]+@[^\s@<>"]+\.[a-z]{2,}$/i.test(s)).slice(0, 5);
  if (!list.length || !resend || !resend.key || !resend.from) return false;
  const why = (WHY[result.reason] || (() => `The ${k} job ended with "${result.reason}".`))(k, result.at);
  const preview = result.id && result.via === 'resend' ? `https://resend.com/broadcasts/${result.id}` : '';
  const lines = [why, ...notes, result.subject ? `Subject: ${result.subject}` : '', preview ? `Preview: ${preview}` : '', hold ? `Hold it: ${hold}` : ''].filter(Boolean);
  const status = result.reason === 'scheduled' ? `goes out at ${fmtClock(EDITIONS[k].send)}` : result.reason === 'late' ? 'not sent' : /drafted|already|updated/.test(result.reason) ? 'draft ready' : 'no edition';
  const e = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const top = `<div style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:16px;color:#1b1a17">${lines.map((l) => `<p>${e(l).replace(/(https:\/\/\S+)/g, '<a href="$1">$1</a>')}</p>`).join('')}${hold ? `<p><a href="${e(hold)}" style="display:inline-block;background:#b92e2b;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Hold this edition</a></p>` : ''}</div>`;
  const body = html ? (html.match(/<body[^>]*>([\s\S]*)<\/body>/) || [, ''])[1].replace(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g, '#') : '';
  const r = await fetchFn(`${RESEND}/emails`, {
    method: 'POST', headers: { authorization: `Bearer ${resend.key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: resend.from, to: list, subject: `${EDITIONS[k].label} edition ${prettyDate(date)}: ${status}`, text: lines.join('\n\n'), html: `${top}${body ? `<hr><div style="max-width:600px;margin:auto">${body}</div>` : ''}` }),
  });
  if (!r.ok) log(`[newsletter] the ${k} note was not sent (${r.status})`);
  return r.ok;
}

// Search older pages too. The dated match may have been queued in advance
// outside the newsroom desk. If the history is incomplete, skip the send.
async function findExistingBroadcast({ title, resend, fetchFn }) {
  const url = new URL(`${RESEND}/broadcasts?limit=100`);
  const headers = { authorization: `Bearer ${resend.key}` };
  const names = new Set([title, `${title} (from heartofcolumbus.shop)`]);
  const active = new Set(['scheduled', 'queued', 'sent']);
  for (let page = 0; page < 5; page++) {
    const history = await getJSON(url.href, fetchFn, { headers });
    if (!Array.isArray(history?.data) || typeof history.has_more !== 'boolean') return { ok: false };
    for (const broadcast of history.data) {
      if (!names.has(broadcast?.name) || !(broadcast.sent_at || active.has(broadcast.status))) continue;
      const segment = broadcast.segment_id || broadcast.audience_id;
      if (!segment) return { ok: false };
      if (segment === resend.segment) return { ok: true, existing: broadcast };
    }
    if (!history.has_more) return { ok: true };
    const cursor = history.data.at(-1)?.id;
    if (!cursor || cursor === url.searchParams.get('after')) return { ok: false };
    url.searchParams.set('after', cursor);
  }
  return { ok: false };
}

// One edition's run. `now` decides the Columbus clock; `force` ignores it and
// the once a day record (tests, and a deliberate second run).
export async function editionRun({ kind = 'morning', now = new Date(), deskStore, store, origin, key = '', resend, notifyTo = '', fetchFn = fetch, log = console.log, force = false }) {
  const k = kindOf(kind);
  const p = plan(k, now);
  const { date } = p;
  const keys = keysFor(k, date);
  if (!force && p.step === 'early') { log(`[newsletter] ${k} ${date}: before ${fmtClock(EDITIONS[k].draft)}; the next wake runs it`); return { ok: true, reason: 'early' }; }
  if (!force && store && (await store.getJSON(keys.run))) { log(`[newsletter] ${k} ${date}: already ran`); return { ok: true, reason: 'ran' }; }
  const finish = async (result, extra = {}) => {
    if (store) await store.setJSON(keys.run, { at: now.toISOString(), reason: result.reason, ok: result.ok, from: extra.from || '', notes: extra.notes || [], subject: result.subject || '', sendAt: result.at || '' });
    await notify({ resend, to: notifyTo, kind: k, date, result, notes: extra.notes || [], hold: extra.hold || '', html: extra.html || '', fetchFn, log }).catch((e) => log(`[newsletter] the ${k} note failed: ${e.message}`));
    log(`[newsletter] ${k} ${date}: ${result.reason}`);
    return result;
  };
  if (usesResend(resend) && !resend.topics?.[k]) return finish({ ok: false, reason: 'no-topic' });
  const ed = await assemble({ kind: k, date, deskStore, store, origin, fetchFn });
  if (ed.skip) return finish({ ok: true, reason: 'skip' });
  if (!ed.substance) return finish({ ok: true, reason: 'thin' }, { notes: ed.notes });
  if (usesResend(resend) && (p.step !== 'late' || force)) {
    const title = `${EDITIONS[k].label} edition ${date}`;
    const history = await findExistingBroadcast({ title, resend, fetchFn });
    if (!history.ok) {
      return finish({ ok: false, reason: 'history-unverified', subject: ed.subject }, { notes: ed.notes });
    }
    if (history.existing) {
      return finish({ ok: true, reason: 'already-in-resend', via: 'resend', id: history.existing.id, subject: ed.subject }, { notes: ed.notes });
    }
  }
  const made = await makeBroadcast({ kind: k, date, store, resend, key, subject: ed.subject, html: ed.html, fetchFn, log });
  if (!made.ok) return finish({ ...made, subject: ed.subject }, { notes: ed.notes, from: ed.from });
  let result = { ...made, subject: ed.subject };
  let hold = '';
  if (made.via === 'resend') {
    if (p.step === 'late' && !force) result = { ...result, reason: 'late' };
    else {
      const saved = made.id ? await getJSON(`${RESEND}/broadcasts/${encodeURIComponent(made.id)}`, fetchFn, {
        headers: { authorization: `Bearer ${resend.key}` },
      }) : null;
      if (!saved || saved.status !== 'draft' || (saved.segment_id || saved.audience_id) !== resend.segment || saved.topic_id !== resend.topics[k]) {
        log(`[newsletter] ${k} ${date}: Resend did not confirm draft status and the expected segment and topic`);
        return finish({ ...result, ok: false, reason: 'audience-unverified' }, { notes: ed.notes, html: ed.html, from: ed.from });
      }
      const at = p.step === 'send' ? p.at : new Date(now.getTime() + 2 * 60e3).toISOString();
      const ok = await scheduleBroadcast({ id: made.id, at, resend, fetchFn, log });
      if (ok) {
        const t = holdToken();
        hold = `${origin}/newsroom/hold/#t=${t}&d=${date}&e=${k}`;
        const rec = (store && (await store.getJSON(keys.draft))) || {};
        if (store) await store.setJSON(keys.draft, { ...rec, scheduled: at, holdHash: await sha(t), from: ed.from });
        result = { ...result, reason: 'scheduled', at };
      } else result = { ...result, reason: 'not-scheduled' };
    }
  }
  // The rotations move on only for an edition that was actually made.
  if (store) {
    const cut = addDays(date, -60);
    const prune = (o) => Object.fromEntries(Object.entries(o || {}).filter(([, d]) => d >= cut));
    if (ed.picks.spotlight) await store.setJSON('spotlight-history', { ...prune(await store.getJSON('spotlight-history')), [ed.picks.spotlight]: date });
    if (ed.picks.design) await store.setJSON('design-history', { ...prune(await store.getJSON('design-history')), [ed.picks.design]: date });
    if (ed.picks.snapshot) await store.setJSON('dirsnap', { date, kind: k, snapshot: ed.picks.snapshot });
  }
  return finish(result, { notes: ed.notes, hold, html: ed.html, from: ed.from });
}

export const runFor = (kind) => async () => {
  await editionRun({
    kind, deskStore: blobStore('desk'), store: blobStore('newsletter'),
    origin: env('URL') || 'https://heartofcolumbus.shop',
    key: env('BUTTONDOWN_API_KEY'), resend: resendEnv(), notifyTo: env('HOC_NEWSLETTER_NOTIFY'),
  });
};

export default runFor('morning');

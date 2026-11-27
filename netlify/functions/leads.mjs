// The overnight lead job: 5 AM in Columbus every day (two UTC times, 9:00 and
// 10:00, so it is 5 AM in summer and winter; the run at any other local hour
// does nothing). It gathers leads from first-hand sources (src/news/overnight.mjs)
// into the writing desk's idea bank, where the publisher finds them at 5 AM.
// It writes nothing anyone reads but the publisher: no story, no draft, no
// email. A source that fails is skipped and logged, and the others still run.
// To run it by hand: Netlify > Functions > leads > Run now (honours the hour).
import { blobStore } from '../../src/blobs.mjs';
import { EVENTS } from '../../src/data/events.mjs';
import { columbusDate } from '../../src/news/editions.mjs';
import { columbusHour } from './newsletter.mjs';
import { NWS_ALERTS, weatherLeads, eventLeads, inboxLeads, mergeLeads, INBOX_KINDS } from '../../src/news/overnight.mjs';

export const config = { schedule: '0 9,10 * * *' };

export async function gather({ desk, newsroom, now = new Date(), fetchFn = fetch, log = console.log, events = EVENTS }) {
  const date = columbusDate(now);
  const state = (await desk.getJSON('leads-state')) || { lastRun: '', seen: [] };
  const leads = [];
  try {
    // weather.gov asks every client to name itself in the User-Agent.
    const r = await fetchFn(NWS_ALERTS, { headers: { accept: 'application/geo+json', 'user-agent': 'HeartOfColumbus-newsroom (heartofcolumbus.shop)' } });
    if (r.ok) leads.push(...weatherLeads(await r.json(), now)); else log(`[leads] weather alerts answered ${r.status}`);
  } catch (e) { log(`[leads] weather alerts failed: ${e.message}`); }
  leads.push(...eventLeads(events, date));
  if (newsroom) {
    try {
      for (const kind of INBOX_KINDS) {
        const ids = ((await newsroom.getJSON(`${kind}/index`)) || []).slice(-50);
        const items = (await Promise.all(ids.map((id) => newsroom.getJSON(`${kind}/${id}`)))).filter(Boolean);
        leads.push(...inboxLeads(items, state.lastRun));
      }
    } catch (e) { log(`[leads] inbox failed: ${e.message}`); }
  }
  const ideas = (await desk.getJSON('ideas')) || [];
  const m = mergeLeads(ideas, leads, { now, seen: state.seen });
  await desk.setJSON('ideas', m.ideas);
  await desk.setJSON('leads-state', { lastRun: now.toISOString(), seen: m.seen });
  log(`[leads] ${date}: ${m.added} new lead${m.added === 1 ? '' : 's'} in the idea bank (${leads.length} found)`);
  return { ok: true, added: m.added, found: leads.length };
}

export default async () => {
  const now = new Date();
  if (columbusHour(now) !== 5) { console.log(`[leads] it is ${columbusHour(now)}:00 in Columbus, not 5:00; the other run handles today`); return; }
  const desk = blobStore('desk');
  if (!desk) { console.log('[leads] storage is not set up on this deploy'); return; }
  await gather({ desk, newsroom: blobStore('newsroom'), now });
};

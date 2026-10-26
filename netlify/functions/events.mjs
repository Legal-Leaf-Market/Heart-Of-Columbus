// GET /api/events  Local events from the library, the parks department and
// the Arts Council (src/event-feeds.mjs), merged and cleaned.
//   ?from=YYYY-MM-DD  first day (default: today in Columbus)
//   ?days=N           1 to 62 (default 31)
//   ?src=bcpl,parks   only these sources
//   ?aud=kids|teens|adults  only events with that age label
//   ?format=json|ics|csv|txt
// Cached at the CDN for an hour, so the listings refresh on their own and
// we ask each calendar at most about once an hour per view of the data.
import { collect, today, toIcs, toCsv, toText, SOURCES_IDS, AUDIENCES } from '../../src/event-feeds.mjs';

export const config = { path: '/api/events' };

const TYPES = {
  json: 'application/json; charset=utf-8',
  ics: 'text/calendar; charset=utf-8',
  csv: 'text/csv; charset=utf-8',
  txt: 'text/plain; charset=utf-8',
};

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const from = /^\d{4}-\d{2}-\d{2}$/.test(q.get('from') || '') ? q.get('from') : today();
  const days = Math.min(62, Math.max(1, Number(q.get('days')) || 31));
  const only = (q.get('src') || '').split(',').filter((s) => SOURCES_IDS.includes(s));
  const format = TYPES[q.get('format')] ? q.get('format') : 'json';
  const ids = only.length ? only : SOURCES_IDS;

  const data = await collect({ from, days, only: ids });
  const aud = q.get('aud');
  if (AUDIENCES.some(([k]) => k === aud)) data.events = data.events.filter((e) => e.aud.includes(aud));
  const allOk = data.sources.every((s) => s.ok);
  const body = format === 'ics' ? toIcs(data) : format === 'csv' ? toCsv(data) : format === 'txt' ? toText(data, ids)
    : JSON.stringify({ ok: true, generated: new Date().toISOString(), ...data });
  const headers = {
    'content-type': TYPES[format],
    'cache-control': 'public, max-age=300',
    // A source that failed is retried sooner.
    'netlify-cdn-cache-control': `public, durable, s-maxage=${allOk ? 3600 : 600}, stale-while-revalidate=86400`,
    'access-control-allow-origin': '*',
  };
  if (format !== 'json') headers['content-disposition'] = `inline; filename="columbus-events-${from}.${format}"`;
  return new Response(body, { status: 200, headers });
};

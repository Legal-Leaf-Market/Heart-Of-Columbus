// Local events from the calendars in SOURCES (src/data/events.mjs), in one
// shape for /events/, the print listing and the exports. Used by
// netlify/functions/events.mjs (live, cached an hour) and by the build (the
// hand-entered ones, as the fallback when the live feeds can't be reached).
//
// We keep only facts: title, date, time, place, ages, and the organizer's
// own page. Descriptions are never copied; the link goes to the source.
import { EVENTS, LISTINGS, SOURCES } from './data/events.mjs';

export const TZ = 'America/Indiana/Indianapolis';
export const sourceById = Object.fromEntries(SOURCES.map((s) => [s.id, s]));
const DAY = 86400000;

// ---------- Dates in Columbus ----------
const parts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
// UTC ms -> { date: 'YYYY-MM-DD', min } in Columbus.
export function local(ms) {
  const p = Object.fromEntries(parts.formatToParts(new Date(ms)).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, min: (Number(p.hour) % 24) * 60 + Number(p.minute) };
}
export const today = (now = Date.now()) => local(now).date;
export const addDays = (date, n) => new Date(Date.parse(date + 'T00:00:00Z') + n * DAY).toISOString().slice(0, 10);
const dow = (date) => new Date(date + 'T00:00:00Z').getUTCDay();

// A wall-clock time in a zone -> UTC ms (two passes settle DST edges).
export function zonedToUtc(y, mo, d, h, mi, tz = TZ) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' });
  let guess = want;
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(f.formatToParts(new Date(guess)).map((x) => [x.type, Number(x.value)]));
    guess += want - Date.UTC(p.year, p.month - 1, p.day, p.hour % 24, p.minute);
  }
  return guess;
}

// ---------- Words ----------
// The site shows no dashes. Number ranges become "3 to 5" (hyphen too); a
// dash used as a separator becomes a comma. Hyphenated words ("Drop-in") stay.
export const noDash = (s) =>
  String(s || '')
    .replace(/(\d)\s*[–—]\s*(\d)/g, '$1 to $2')
    .replace(/(\d) - (\d)/g, '$1 to $2')
    .replace(/(?<![\d-])(K|\d{1,2})-(\d{1,2})(?![\d-])/g, '$1 to $2') // "Grades 1-5", "K-5"
    .replace(/\s*[–—]+\s*|\s+-+\s+/g, ', ')
    .replace(/(^[,\s]+)|([,\s]+$)/g, '')
    .replace(/,\s*,/g, ',')
    .replace(/\s{2,}/g, ' ');
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '’', nbsp: ' ', '#39': '’', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', ndash: '–', mdash: '—', hellip: '…' };
const decode = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, k) =>
  k[0] === '#' ? String.fromCodePoint(k[1] === 'x' || k[1] === 'X' ? parseInt(k.slice(2), 16) : Number(k.slice(1))) : ENT[k.toLowerCase()] ?? m);
export const clean = (s) => noDash(decode(s).replace(/'/g, '’').replace(/\s+/g, ' ').trim());

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const AP_MON = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ymd = (s) => s.split('-').map(Number);

// Web style, as elsewhere on the site: "6 to 8 PM", "11 AM to 1 PM".
const hm = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''}`; };
const mer = (m) => (Math.floor(m / 60) % 24 < 12 ? 'AM' : 'PM');
export function webTime(a, b) {
  if (a == null) return 'All day';
  if (b == null || b <= a) return `${hm(a)} ${mer(a)}`;
  return mer(a) === mer(b) ? `${hm(a)} to ${hm(b)} ${mer(b)}` : `${hm(a)} ${mer(a)} to ${hm(b)} ${mer(b)}`;
}
export const webDate = (s) => { const [, m, d] = ymd(s); return `${DAYS[dow(s)].slice(0, 3)}, ${MON[m - 1]} ${d}`; };

// AP style for print: "noon to 1 p.m.", "5:30 to 7:30 p.m.", "Monday, Oct. 26".
const apOne = (m, withMer = true) => {
  m %= 1440;
  if (m === 720) return 'noon';
  if (m === 0) return 'midnight';
  return hm(m) + (withMer ? (m < 720 ? ' a.m.' : ' p.m.') : '');
};
export function apTime(a, b) {
  if (a == null) return 'all day';
  if (b == null || b <= a) return apOne(a);
  const bm = b % 1440; // past midnight: 1560 is 2 a.m.
  const same = b < 1440 && (a < 720) === (bm < 720) && a % 720 && bm % 720;
  return `${apOne(a, !same)} to ${apOne(b)}`;
}
export const apDate = (s) => { const [, m, d] = ymd(s); return `${DAYS[dow(s)]}, ${AP_MON[m - 1]} ${d}`; };
const shortDate = (s) => { const [, m, d] = ymd(s); return `${MON[m - 1]} ${d}`; };
const apShort = (s) => { const [, m, d] = ymd(s); return `${AP_MON[m - 1]} ${d}`; };

// Who it's for, from the library's age labels or words in a title.
export const AUDIENCES = [['kids', 'Kids and families'], ['teens', 'Teens'], ['adults', 'Adults']];
export function audience(ages = [], title = '') {
  const s = (ages.join(' ') + ' ' + title).toLowerCase();
  const out = new Set();
  if (/bab|toddler|preschool|child|kid|famil|all ages|school age|elementary|grades? k|storytime|story time/.test(s)) out.add('kids');
  if (/tween|teen/.test(s)) out.add('teens');
  if (/adult|senior|18\+|21\+/.test(s)) out.add('adults');
  if (/all ages|famil/.test(s)) { out.add('teens'); out.add('adults'); }
  return [...out];
}

// Live music and arts: concerts, open mics, comedy, poetry, dance nights.
const LIVE = /\b(concerts?|live music|bands?|open mic|comedy|comedian|stand ?up|poetry|poets?|spoken word|karaoke|jam session|jam|dj|line danc\w*|symphony|orchestra|choir|recital|musical|theat(?:er|re)|improv|songwriters?|drag show)\b|, live$/i;
export const isLive = (title, flag = false) => flag || LIVE.test(title);

// What a listing lets the public do. The parks calendar is also the booking
// sheet for its rooms, rinks and gyms, so it carries private rentals, team
// practices and "No Drop-ins" blocks next to real public programs. Those are
// read from the listing's own words and kept off the public list; a closure is
// a notice about the venue, not something to attend. Anything the words do not
// settle stays public, because these are public program calendars and a broad
// pattern that hides a real concert is the worse mistake.
//   private   a rental or private booking
//   practice  a team practice or scrimmage (not assumed open to watch)
//   closed    a facility closure or a block with no drop-in
//   public    everything else
const ACCESS = [
  ['closed', /\bno drop[- ]?ins?\b|\bclosed\b|\bclosure\b/i],
  ['private', /\bprivate (?:event|party|rental|booking|function)s?\b|\brentals?\b/i],
  ['practice', /\bpractices?\b|\bscrimmages?\b/i],
];
export const access = (title) => (ACCESS.find(([, re]) => re.test(title)) || ['public'])[0];
export const LEFT_OUT = { private: 'private bookings', practice: 'team practices', closed: 'facility notices' };

// Every item: { id, src, title, date, until, start, stop, when, ap, venue,
// ages, aud, url, access }. `date` is the day it is listed under, `until` the last
// day of a run; start/stop are minutes after midnight, or null.
function item(o) {
  const x = { ...o };
  x.live = isLive(x.title, x.live);
  x.access = x.access || access(x.title);
  x.when = webTime(x.start, x.stop);
  x.ap = apTime(x.start, x.stop);
  if (x.until && x.until > x.date) { x.when = `Through ${shortDate(x.until)}`; x.ap = `through ${apShort(x.until)}`; }
  return x;
}

// ---------- Bartholomew County Public Library (Communico) ----------
const PLACES = { columbus: 'Cleo Rogers Memorial Library' };
export function communicoUrl(from, days) {
  const req = { private: false, date: from, days, locations: [], ages: [], types: [] };
  return `${sourceById.bcpl.feed.url}?event_type=0&req=${encodeURIComponent(JSON.stringify(req))}`;
}
export function parseCommunico(rows) {
  const out = [];
  for (const r of Array.isArray(rows) ? rows : []) {
    const title = clean(r.title);
    if (!title || r.private_event === '1' || r.staff_only_registration === '1') continue;
    if (/cancel+ed|postponed/i.test(title + ' ' + (r.changed || '') + ' ' + (r.changed_reason || ''))) continue;
    if (/\bclosed\b/i.test(title)) continue; // closures are not events
    const st = String(r.event_start || r.raw_start_time || '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
    if (!st) continue;
    const en = String(r.event_end || r.raw_end_time || '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
    const loc = clean(r.location || r.library);
    const place = r.venue_type === 'external' && r.venue_name ? clean(r.venue_name)
      : PLACES[loc.toLowerCase()] || (loc ? (/branch|library|bookmobile|online|virtual/i.test(loc) ? loc : `${loc} Branch Library`) : 'Bartholomew County Public Library');
    const room = clean(r.venues || r.venue_room);
    const virtual = /online|virtual/i.test(r.event_type || '');
    const ages = Array.isArray(r.agesArray) ? r.agesArray.filter(Boolean).map(clean) : String(r.ages || '').split(',').map(clean).filter(Boolean);
    const start = +st[2] * 60 + +st[3], stop = en && en[1] === st[1] ? +en[2] * 60 + +en[3] : null;
    const allDay = start === 0 && (stop == null || stop >= 1439);
    out.push(item({
      id: `bcpl-${r.id}`, src: 'bcpl', title: r.sub_title ? `${title}: ${clean(r.sub_title)}` : title,
      date: st[1], start: allDay ? null : start, stop: allDay ? null : stop,
      venue: virtual ? 'Online' : [place, room && room !== place ? room : ''].filter(Boolean).join(', '),
      ages: ages.join(', '), aud: audience(ages, title),
      url: /^https:\/\//.test(r.url || '') ? r.url : `https://mybcpl.libnet.info/event/${encodeURIComponent(r.id)}`,
    }));
  }
  return out;
}

// ---------- Columbus Parks and Recreation (iCalendar) ----------
const unescapeIcs = (s) => s.replace(/\\n/gi, ' ').replace(/\\([,;\\])/g, '$1');
function icsTime(prop) {
  // prop: { value, params }. Returns { ms, allDay } or null.
  const v = prop.value.trim();
  let m = v.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (m || /VALUE=DATE(?!-)/i.test(prop.params)) {
    m = m || v.match(/^(\d{4})(\d{2})(\d{2})/);
    return m ? { ms: Date.UTC(+m[1], m[2] - 1, +m[3]), allDay: true, date: `${m[1]}-${m[2]}-${m[3]}` } : null;
  }
  m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})?(Z?)$/);
  if (!m) return null;
  const tz = (prop.params.match(/TZID=("?)([^;:"]+)\1/i) || [])[2];
  let ms;
  if (m[7]) ms = Date.UTC(+m[1], m[2] - 1, +m[3], +m[4], +m[5]);
  else {
    try { ms = zonedToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], tz || TZ); } catch { ms = zonedToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], TZ); }
  }
  return { ms, allDay: false };
}

export function parseIcsEvents(text) {
  const lines = String(text || '').replace(/\r\n[ \t]|\n[ \t]/g, '').split(/\r?\n/);
  const events = [];
  let cur = null, depth = 0;
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') { cur = {}; depth = 0; continue; }
    if (!cur) continue;
    if (line.startsWith('BEGIN:')) { depth++; continue; }
    if (line.startsWith('END:') && depth) { depth--; continue; }
    if (line === 'END:VEVENT') { events.push(cur); cur = null; continue; }
    if (depth) continue; // VALARM and friends
    const i = line.search(/:(?=(?:[^"]*"[^"]*")*[^"]*$)/);
    if (i < 0) continue;
    const head = line.slice(0, i), value = line.slice(i + 1);
    const [name, ...params] = head.split(';');
    const key = name.toUpperCase();
    const prop = { value, params: params.join(';') };
    if (key === 'EXDATE') (cur.EXDATE = cur.EXDATE || []).push(prop);
    else cur[key] = prop;
  }
  return events;
}

// Expands the simple repeat rules calendars use for weekly programs:
// DAILY and WEEKLY (with BYDAY, INTERVAL, COUNT, UNTIL). Anything fancier
// keeps its first date, and the link says the rest.
const BYDAY = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
function occurrences(ev, start, fromMs, toMs) {
  if (!ev.RRULE) return [start.ms];
  const r = Object.fromEntries(ev.RRULE.value.split(';').map((kv) => kv.split('=')));
  if (!['DAILY', 'WEEKLY'].includes(r.FREQ)) return [start.ms];
  const until = r.UNTIL ? icsTime({ value: r.UNTIL, params: '' })?.ms ?? Infinity : Infinity;
  const count = r.COUNT ? Number(r.COUNT) : Infinity;
  const step = Math.max(1, Number(r.INTERVAL || 1));
  const days = r.BYDAY ? r.BYDAY.split(',').map((d) => BYDAY[d.slice(-2)]).filter((d) => d != null) : null;
  const ex = new Set((ev.EXDATE || []).flatMap((p) => p.value.split(',').map((v) => icsTime({ value: v, params: p.params })?.ms)));
  const out = [];
  const base = start.allDay ? start.date : local(start.ms).date;
  const min = start.allDay ? 0 : local(start.ms).min;
  const wd0 = dow(base);
  let n = 0;
  for (let i = 0; i < 800 && n < count; i++) {
    const d = addDays(base, i), wd = dow(d);
    const hit = r.FREQ === 'DAILY' ? i % step === 0
      : (days ? days.includes(wd) : wd === wd0) && Math.floor((i + wd0) / 7) % step === 0;
    if (!hit) continue;
    const [y, m, dd] = ymd(d);
    // Same wall-clock time on every date, across DST changes.
    const t = start.allDay ? Date.UTC(y, m - 1, dd) : zonedToUtc(y, m, dd, Math.floor(min / 60), min % 60);
    if (t > until || t > toMs) break;
    n++;
    if (!ex.has(t) && t + DAY >= fromMs) out.push(t);
  }
  return out;
}

export function parseIcs(text, { src = 'parks', from, to, fallbackUrl = '' } = {}) {
  const fromMs = Date.parse(from + 'T00:00:00Z') - DAY, toMs = Date.parse(to + 'T00:00:00Z') + 2 * DAY;
  const out = [];
  const seen = new Set();
  for (const ev of parseIcsEvents(text)) {
    if (!ev.DTSTART || !ev.SUMMARY) continue;
    if (/CANCELLED/i.test(ev.STATUS?.value || '') || /cancel+ed/i.test(ev.SUMMARY.value)) continue;
    const start = icsTime(ev.DTSTART);
    if (!start) continue;
    const end = ev.DTEND ? icsTime(ev.DTEND) : null;
    const len = end ? end.ms - start.ms : 0;
    const title = clean(unescapeIcs(ev.SUMMARY.value));
    const venue = clean(unescapeIcs(ev.LOCATION?.value || '')).replace(/,?\s*Columbus,?\s*(IN|Indiana)\b.*$/i, '');
    const cats = clean(unescapeIcs(ev.CATEGORIES?.value || ''));
    const url = (ev.URL?.value || '').trim();
    for (const ms of occurrences(ev, start, fromMs, toMs)) {
      let date, sMin = null, eMin = null, until = null;
      if (start.allDay) {
        date = new Date(ms).toISOString().slice(0, 10);
        const last = new Date(ms + Math.max(DAY, len) - DAY).toISOString().slice(0, 10);
        if (last > date) until = last;
      } else {
        const a = local(ms), b = local(ms + len);
        date = a.date; sMin = a.min;
        if (len > 0 && b.date === a.date) eMin = b.min;
        else if (len > 0 && b.date > a.date && !(b.min === 0 && addDays(a.date, 1) === b.date)) until = b.date;
        else if (len > 0) eMin = 1440;
      }
      if ((until || date) < from || date > to) continue;
      const uid = `${src}-${(ev.UID?.value || title).replace(/[^\w.@-]+/g, '')}-${date}-${sMin ?? 'd'}`;
      if (seen.has(uid)) continue;
      seen.add(uid);
      out.push(item({
        id: uid, src, title, date, until, start: sMin, stop: eMin === 1440 ? null : eMin,
        venue, ages: '', aud: audience([cats], title),
        url: /^https:\/\//.test(url) ? url : fallbackUrl,
      }));
    }
  }
  return out;
}

// ---------- Hand-entered (calendars with no feed) ----------
export function handEntered() {
  return [...EVENTS, ...LISTINGS].map((e) => item({
    id: `${e.from || 'hoc'}-${e.slug}`, src: e.from || 'arts', title: clean(e.name), date: e.start,
    until: e.end > e.start ? e.end : null, start: e.times ? e.times[0] : null, stop: e.times ? e.times[1] : null,
    venue: clean(e.venue), ages: '', aud: audience([], e.name), url: e.url, live: !!e.live,
  }));
}

// Keep what overlaps [from, to], listed under its first day in the window.
export function inWindow(items, from, to) {
  return items
    .filter((x) => (x.until || x.date) >= from && x.date <= to)
    .map((x) => (x.date < from ? { ...x, date: from, ...(x.until === from ? { when: 'Final day', ap: 'final day' } : {}) } : x))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.until ? 0 : 1) - (b.until ? 0 : 1) || (a.start ?? -1) - (b.start ?? -1) || a.title.localeCompare(b.title));
}

// ---------- Fetching ----------
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.0; +https://heartofcolumbus.netlify.app)';
async function get(url, accept, fetchImpl, ms = 9000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetchImpl(url, { headers: { 'User-Agent': UA, Accept: accept }, signal: ctl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally { clearTimeout(timer); }
}

// Reads every source with a feed. One failing source never sinks the rest;
// its status says so and the page links to that calendar instead.
export async function collect({ from, days = 31, only = null, fetchImpl = globalThis.fetch } = {}) {
  const to = addDays(from, days - 1);
  const want = (id) => !only || only.includes(id);
  const status = [];
  const items = [];
  const jobs = SOURCES.filter((s) => want(s.id)).map(async (s) => {
    const st = { id: s.id, name: s.name, short: s.short, calendar: s.calendar, site: s.site, live: !!s.feed, ok: true, count: 0 };
    try {
      if (!s.feed) {
        const got = handEntered().filter((x) => x.src === s.id);
        items.push(...got);
        st.count = inWindow(got, from, to).length;
        st.checked = s.checked;
      } else if (s.feed.type === 'communico') {
        const chunks = [];
        for (let d = 0; d < days; d += 14) chunks.push([addDays(from, d), Math.min(14, days - d)]);
        const got = (await Promise.all(chunks.map(([f, n]) => get(communicoUrl(f, n), 'application/json', fetchImpl).then((t) => parseCommunico(JSON.parse(t)))))).flat();
        const uniq = [...new Map(got.map((x) => [x.id, x])).values()];
        items.push(...uniq);
        st.count = inWindow(uniq, from, to).length;
      } else if (s.feed.type === 'ics') {
        const text = await get(s.feed.url, 'text/calendar', fetchImpl);
        if (!/BEGIN:VCALENDAR/.test(text)) throw new Error('not a calendar');
        const got = parseIcs(text, { src: s.id, from, to, fallbackUrl: s.calendar });
        items.push(...got);
        st.count = inWindow(got, from, to).length;
      }
    } catch (err) {
      st.ok = false;
      st.error = String(err && err.message || err).slice(0, 120);
    }
    status.push(st);
  });
  await Promise.all(jobs);
  status.sort((a, b) => SOURCES.findIndex((s) => s.id === a.id) - SOURCES.findIndex((s) => s.id === b.id));
  const listed = inWindow(items, from, to);
  // Left off the public list, but said so: the page counts them and shows
  // closures as venue notices, so nothing disappears without a word.
  const left = listed.filter((x) => x.access !== 'public').map(({ id, src, title, date, venue, access: a }) => ({ id, src, title, date, venue, access: a }));
  return { from, to, sources: status, events: listed.filter((x) => x.access === 'public'), left };
}

// ---------- Exports for print, newspapers and calendars ----------
const credit = (srcs) => {
  const names = srcs.map((s) => (s.site ? `${s.name} (${s.site})` : s.credit));
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] || '';
  return `Listings from the public calendars of ${list}. Times and places can change; check with the organizer. Compiled by Heart of Columbus.`;
};
export const creditLine = (ids) => credit(SOURCES.filter((s) => ids.includes(s.id)));

// AP-style plain text, grouped by day, for a newspaper or magazine page.
export function toText({ events, from, to }, ids = SOURCES.map((s) => s.id)) {
  const out = [`${apShort(from)}, ${from.slice(0, 4)} to ${apShort(to)}, ${to.slice(0, 4)}`.toUpperCase(), ''];
  let day = '';
  for (const e of events) {
    if (e.date !== day) { if (day) out.push(''); day = e.date; out.push(apDate(day).toUpperCase()); }
    out.push(`${e.title}: ${[e.ap, e.venue].filter(Boolean).join(', ')}.${e.ages ? ` ${e.ages}.` : ''} (${sourceById[e.src]?.short || ''})`);
  }
  out.push('', credit(SOURCES.filter((s) => ids.includes(s.id))));
  return out.join('\n') + '\n';
}

const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const clock = (m) => (m == null ? '' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`);
export function toCsv({ events }) {
  const head = ['date', 'through', 'start', 'end', 'title', 'time_web', 'time_ap', 'venue', 'ages', 'live_arts', 'source', 'source_name', 'url'];
  const rows = events.map((e) => [e.date, e.until || '', clock(e.start), clock(e.stop), e.title, e.when, e.ap, e.venue, e.ages, e.live ? 'yes' : '', e.src, sourceById[e.src]?.name || '', e.url]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// RFC 5545. Timed events in UTC; all-day and multi-day runs as dates.
export function toIcs({ events }, now = new Date()) {
  const text = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const utc = (date, min) => { const [y, m, d] = ymd(date); return new Date(zonedToUtc(y, m, d, Math.floor(min / 60), min % 60)).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heart of Columbus//Local events//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Columbus local events', `X-WR-TIMEZONE:${TZ}`, 'REFRESH-INTERVAL;VALUE=DURATION:PT6H'];
  for (const e of events) {
    lines.push('BEGIN:VEVENT', `UID:${e.id.replace(/[^\w.@-]/g, '')}@heartofcolumbus`, `DTSTAMP:${stamp}`);
    if (e.start != null && !e.until) {
      lines.push(`DTSTART:${utc(e.date, e.start)}`, `DTEND:${utc(e.date, e.stop ?? e.start + 60)}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${addDays(e.until || e.date, 1).replace(/-/g, '')}`);
    }
    const s = sourceById[e.src];
    lines.push(`SUMMARY:${text(e.title)}`, ...(e.venue ? [`LOCATION:${text(e.venue + ', Columbus, Indiana')}`] : []), `URL:${e.url}`,
      `DESCRIPTION:${text(`${e.when}. From ${s && s.calendar ? `the ${s.name} calendar` : 'the organizer’s page'}. Details: ${e.url}`)}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map((l) => { const parts = []; let rest = l; while (rest.length > 73) { parts.push(rest.slice(0, 73)); rest = rest.slice(73); } parts.push(rest); return parts.join('\r\n '); }).join('\r\n') + '\r\n';
}

export const SOURCES_IDS = SOURCES.map((s) => s.id);

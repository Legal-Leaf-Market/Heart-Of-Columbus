// The two daily editions of the newsletter, morning and evening, as email.
// Pure logic, no network and no storage: the clock, the sections, the "Up the
// road" box, the Shop Local Spotlight and Columbus by Design picks, and the
// listing changes. netlify/functions/newsletter.mjs gathers the inputs and
// sends; the desk (/newsroom/desk/) previews with the same code.
//
// Jake's decisions (2026-11-27): two editions every day of the week, each sent
// on schedule unless he presses Hold; readers choose morning, evening or both
// (Resend topics); one IndyStar shout out per edition, pasted by hand.
//
// What goes in an automatic edition: only stories already published, the
// site's own data (directory, landmarks, events) and first hand public sources
// (the overnight leads). No writing help runs unattended, and nothing here
// writes a sentence about a real person or business that a source did not
// already state. The weather is a link to the National Weather Service
// forecast page: api.weather.gov's robots.txt disallows every path (checked
// 2026-11-27), so the edition never reads it.
import { markdown } from './markdown.mjs';
import { diffDirectory } from './leads.mjs';
import { fmtRange } from '../hours.mjs';
import { webTime, webDate } from '../event-feeds.mjs';

const TZ = 'America/Indiana/Indianapolis';
const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- The clock ----------
// Minutes past midnight, Columbus time. `wake` is the cron in UTC: Columbus is
// UTC-5 in winter and UTC-4 in summer, so each job wakes at both possible UTC
// hours and acts at the first wake at or after its draft time.
export const EDITIONS = {
  morning: { label: 'Morning', header: 'The morning edition', deadline: 6 * 60 + 10, draft: 6 * 60 + 15, send: 6 * 60 + 45, wake: '15 10,11 * * *', topicEnv: 'RESEND_TOPIC_MORNING' },
  evening: { label: 'Evening', header: 'The evening edition', deadline: 17 * 60 + 25, draft: 17 * 60 + 30, send: 18 * 60, wake: '30 21,22 * * *', topicEnv: 'RESEND_TOPIC_EVENING' },
};
export const KINDS = Object.keys(EDITIONS);
export const kindOf = (k) => (k === 'evening' ? 'evening' : 'morning');

// Blob keys. The morning keeps the keys it always had, so nothing already
// saved at the desk moves; the evening adds "-evening".
export const keysFor = (kind, date) => {
  const sfx = kindOf(kind) === 'evening' ? '-evening' : '';
  return { day: `day-${date}${sfx}`, draft: `draft-${date}${sfx}`, run: `run-${date}${sfx}`, html: `html-${date}${sfx}` };
};

export const columbusDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
export const columbusMinutes = (d) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(d).map((x) => [x.type, x.value]));
  return Number(p.hour) * 60 + Number(p.minute);
};
// The UTC instant of a Columbus wall clock time on a date. Two passes, so a
// date on either side of a daylight time change comes out right.
export function columbusInstant(date, minutes) {
  const [y, m, d] = date.split('-').map(Number);
  let t = Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60) + 5 * 3600e3;
  for (let i = 0; i < 2; i++) {
    const got = columbusMinutes(new Date(t)) + (columbusDate(new Date(t)) === date ? 0 : (columbusDate(new Date(t)) < date ? -1440 : 1440));
    t += (minutes - got) * 60e3;
  }
  return new Date(t);
}
export const sendAt = (kind, date) => columbusInstant(date, EDITIONS[kindOf(kind)].send);
export const fmtClock = (min) => {
  const hh = Math.floor(min / 60), mm = min % 60;
  return `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'AM' : 'PM'}`;
};
export const prettyDate = (date) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }).format(new Date(`${date}T12:00:00Z`));
export const addDays = (date, n) => new Date(Date.parse(`${date}T12:00:00Z`) + n * 86400e3).toISOString().slice(0, 10);

// What the job should do on a wake: 'early' before the draft time, 'send'
// with the time to schedule, or 'late' (draft only, no send) when the wake
// came more than an hour after the send time, so a stale edition never goes
// out in the middle of the day.
export function plan(kind, now) {
  const e = EDITIONS[kindOf(kind)];
  const date = columbusDate(now);
  const min = columbusMinutes(now);
  if (min < e.draft) return { date, step: 'early' };
  if (min > e.send + 60) return { date, step: 'late' };
  const at = sendAt(kind, date);
  const soon = new Date(now.getTime() + 2 * 60e3);
  return { date, step: 'send', at: (at > soon ? at : soon).toISOString() };
}

// ---------- The dash and [CHECK] rule ----------
export const DASH = /[–—]| - /;
export const hasCheck = (s) => /\[CHECK/i.test(String(s || ''));
export const clean = (s) => !DASH.test(String(s || '')) && !hasCheck(s);

// ---------- Up the road ----------
// One IndyStar story per edition, pasted by the publisher: the link, the
// headline as he types it, and an optional comment that is his. We never
// fetch indystar.com (it refuses automated reading); the link is all we keep.
export const ROAD_HOSTS = /^(www\.)?indystar\.com$/i;
export function cleanRoad(r = {}) {
  let url = '';
  try { const u = new URL(String(r.url || '').trim()); if (u.protocol === 'https:' && ROAD_HOSTS.test(u.hostname)) url = u.href; } catch { url = ''; }
  return { url: url.slice(0, 500), headline: String(r.headline || '').trim().slice(0, 200), comment: String(r.comment || '').trim().slice(0, 600) };
}
export function roadBlockers(r = {}) {
  const out = [];
  const raw = String(r.url || '').trim();
  if (!raw && !r.headline && !r.comment) return out;
  if (!cleanRoad(r).url) out.push('Up the road takes an https link to indystar.com.');
  if (!String(r.headline || '').trim()) out.push('Up the road needs the headline.');
  if (hasCheck(`${r.headline} ${r.comment}`)) out.push('Up the road still has a [CHECK] to resolve.');
  if (DASH.test(`${r.headline || ''} ${r.comment || ''}`)) out.push('Up the road has a dash used as punctuation; the paper does not use them.');
  return out;
}
export function roadHtml(r) {
  const c = cleanRoad(r || {});
  if (!c.url || !c.headline || roadBlockers(r).length) return '';
  return `<p><a href="${h(c.url)}">${h(c.headline)}</a> <small>via IndyStar</small></p>${c.comment ? `<p><em>The publisher’s note:</em> ${h(c.comment)}</p>` : ''}`;
}

// ---------- Shop Local Spotlight ----------
// One directory business a day, never the same one twice in 30 days. Founding
// Members come first, then claimed listings, then the businesses featured up
// front (src/data/spotlight.mjs), then everyone else in a fixed order. Within
// a group the one featured longest ago (or never) goes next. A member's paid
// tie and the publisher's own businesses are said in the box.
export const SPOT_GAP = 30;
const RANK = { member: 0, claimed: 1, featured: 2, listed: 3 };
export function pickSpotlight(candidates = [], history = {}, date) {
  const cutoff = addDays(date, -(SPOT_GAP - 1));
  const free = candidates.filter((c) => !history[c.slug] || history[c.slug] < cutoff);
  if (!free.length) return null;
  return free.slice().sort((a, b) => (RANK[a.tier] - RANK[b.tier]) || String(history[a.slug] || '').localeCompare(String(history[b.slug] || '')) || a.order - b.order)[0];
}
export function spotlightHtml(b, origin) {
  if (!b) return '';
  const today = b.today ? `<br><small>Hours today: ${h(b.today)}. Call ahead.</small>` : '';
  const tie = b.member ? '<p><small>★ Founding Member: this business pays Heart of Columbus for its website and a labeled spot here. It has no say in what we write.</small></p>' : '';
  const own = b.family ? `<p><small>${h(b.family)}</small></p>` : '';
  return `<p><strong><a href="${h(origin + '/b/' + b.slug + '/')}">${h(b.name)}</a></strong>${b.kind ? `, ${h(b.kind)}` : ''}${b.address ? `<br>${h(b.address)}` : ''}${today}</p>${b.type ? `<p>${h(b.type)}</p>` : ''}${tie}${own}`;
}

// ---------- Columbus by Design ----------
// One building or landmark a night, from landmarks.mjs, architecture.mjs and
// building-history.mjs. Photos only from Wikimedia Commons, credited the way
// /credits/ does; never a photo of a listed business.
export function pickDesign(list = [], history = {}, date) {
  if (!list.length) return null;
  return list.slice().sort((a, b) => String(history[a.id] || '').localeCompare(String(history[b.id] || '')) || a.order - b.order)[0] || null;
}
export function designHtml(d) {
  if (!d) return '';
  const commons = d.photo && /^https:\/\/upload\.wikimedia\.org\//.test(d.photo.src) && d.photo.credit && d.photo.license;
  const img = commons ? `<p><img src="${h(d.photo.src)}" alt="${h(d.name)}" width="560" style="width:100%;max-width:560px;height:auto;border:0;display:block"></p><p><small>Photo: ${h(d.photo.credit)}. License: ${h(d.photo.license)}. <a href="${h(d.photo.page)}">Source</a> (Wikimedia Commons)</small></p>` : '';
  const facts = [d.architect ? `Architect: ${d.architect}` : '', d.year ? `Year: ${d.year}` : '', d.street ? `Where: ${d.street}` : ''].filter(Boolean).join('. ');
  return `${img}<p><strong>${d.link ? `<a href="${h(d.link)}">${h(d.name)}</a>` : h(d.name)}</strong></p>${d.what ? `<p>${h(d.what)}</p>` : ''}${facts ? `<p><small>${h(facts)}.</small></p>` : ''}${d.source ? `<p><small>Source: <a href="${h(d.source)}">${h(d.sourceName || 'source')}</a></small></p>` : ''}`;
}

// ---------- Open, Closed, New Hours ----------
// What changed in our listings since the last edition looked. A list from the
// listings, said as that: they are wrong about closings often enough that
// every line says to call ahead (src/news/leads.mjs, "never a story").
export function listingChanges(before, after) {
  if (!before || !after) return null;
  const d = diffDirectory(before, after);
  const rows = [
    ...d.added.map((x) => ['New', x.slug, x.b.name, x.b.address]),
    ...d.reopened.map((x) => ['Reopened', x.slug, x.b.name, x.b.address]),
    ...d.closed.map((x) => ['Listed as closed', x.slug, x.b.name, x.b.address]),
    ...d.tempClosed.map((x) => ['Listed as closed for now', x.slug, x.b.name, x.b.address]),
    ...d.hours.map((x) => ['New hours', x.slug, x.b.name, x.b.address]),
  ];
  return rows.slice(0, 12).map(([what, slug, name, address]) => ({ what, slug, name, address: address || '' }));
}
export function changesHtml(rows, origin) {
  if (!rows || !rows.length) return '';
  return `<ul>${rows.map((r) => `<li><strong>${h(r.what)}:</strong> <a href="${h(r.what === 'Listed as closed' ? origin + '/explore/' : origin + '/b/' + r.slug + '/')}">${h(r.name)}</a>${r.address ? `, ${h(r.address)}` : ''}</li>`).join('')}</ul><p><small>From changes in the public listings we follow. Listings are sometimes wrong, so call ahead.</small></p>`;
}

// ---------- Lookout ----------
// Morning: today. Evening: tomorrow and the next three days. From our events
// feed (/api/events) and the meetings and closings in the overnight leads.
export function lookout(kind, date, { events = [], leads = null } = {}) {
  const from = kindOf(kind) === 'evening' ? addDays(date, 1) : date;
  const to = kindOf(kind) === 'evening' ? addDays(date, 4) : date;
  const ev = events.filter((e) => e.date && (e.until || e.date) >= from && e.date <= to)
    .map((e) => ({ on: e.date < from ? from : e.date, start: e.start ?? null, title: e.title, venue: e.venue || '', url: e.url || '' }));
  const meet = ((leads && leads.items) || []).filter((x) => x.kind === 'meeting' && x.on && x.on >= from && x.on <= to)
    .map((x) => ({ on: x.on, start: x.time ? Number(x.time.slice(0, 2)) * 60 + Number(x.time.slice(3)) : null, title: x.title, venue: x.source, url: x.url }));
  const seen = new Set();
  return [...ev, ...meet].filter((x) => x.title && !seen.has(`${x.on}|${x.title}`) && seen.add(`${x.on}|${x.title}`))
    .sort((a, b) => a.on.localeCompare(b.on) || (a.start ?? -1) - (b.start ?? -1)).slice(0, kindOf(kind) === 'evening' ? 12 : 10);
}
export function lookoutHtml(items, kind) {
  if (!items.length) return '';
  const many = kindOf(kind) === 'evening';
  return `<ul>${items.map((x) => `<li>${many ? `<strong>${h(webDate(x.on))}</strong>, ` : ''}${x.start != null ? `${h(webTime(x.start))}, ` : ''}${x.url ? `<a href="${h(x.url)}">${h(x.title)}</a>` : h(x.title)}${x.venue ? `, ${h(x.venue)}` : ''}</li>`).join('')}</ul><p><small>Times from each organizer’s own calendar. Check with them before you go.</small></p>`;
}

// ---------- The edition ----------
const weatherHtml = (kind) => kindOf(kind) === 'evening'
  ? '<p><a href="https://forecast.weather.gov/MapClick.php?lat=39.2014&amp;lon=-85.9214">Tonight and tomorrow in Columbus</a>: the forecast from the National Weather Service.</p>'
  : '<p><a href="https://forecast.weather.gov/MapClick.php?lat=39.2014&amp;lon=-85.9214">Today and tonight in Columbus</a>: the forecast from the National Weather Service.</p>';

function piecesHtml(pieces) {
  return pieces.map((p) => {
    const src = (p.sources || []).filter((s) => s && s.url);
    return `<h3 style="font-size:19px;margin:18px 0 6px">${h(p.headline)}</h3>${p.dek ? `<p style="color:#555;margin-top:-4px">${h(p.dek)}</p>` : ''}${markdown(p.body || '')}${p.shape === 'take' ? '<p><small>The publisher’s view.</small></p>' : ''}${src.length ? `<p><small>Sources: ${src.map((s) => `<a href="${h(s.url)}">${h(s.label || hostOf(s.url))}</a>`).join(', ')}</small></p>` : ''}`;
  }).join('\n');
}
export function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'source'; }
}
const storiesHtml = (stories, origin) => stories.map((s) => `<p><strong><a href="${h(s.href.startsWith('http') ? s.href : origin + s.href)}">${h(s.headline)}</a></strong>${s.dek ? `<br>${h(s.dek)}` : ''}<br><small>${h(s.label)}, by ${h(s.byline)}</small></p>`).join('');
const earlyHtml = (early, origin) => (early.length ? `<ul>${early.map((b) => `<li><a href="${h(origin + '/b/' + b.slug + '/')}">${h(b.name)}</a>, ${h(b.hours)}</li>`).join('')}</ul><p><small>Hours from their listings. Call ahead.</small></p>` : '');

// Builds one edition. Everything is optional; sections with nothing to say
// are left out. `substance` counts the sections other than the weather and
// sponsors: an edition needs at least one, or it is skipped.
export function composeEdition({
  kind = 'morning', date, name = 'Heart of Columbus', origin = 'https://heartofcolumbus.shop',
  intro = '', pieces = [], stories = [], early = [], business = null, sponsors = [],
  spotlight = null, design = null, changes = null, lookoutItems = [], road = null,
}) {
  const k = kindOf(kind);
  const ev = k === 'evening';
  const open = ev ? String(intro || '').split('\n').map((s) => s.trim()).find(Boolean) || '' : String(intro || '');
  const deskPieces = ev ? pieces.slice(0, 2) : pieces;
  const sections = [
    ['Weather', weatherHtml(k), false],
    [ev ? 'From the desk' : 'The news', deskPieces.length ? piecesHtml(deskPieces) : (!ev && stories.length ? storiesHtml(stories, origin) : ''), true],
    ['Shop Local Spotlight', ev ? '' : spotlightHtml(spotlight, origin), true],
    ['Open, Closed, New Hours', changesHtml(changes, origin), true],
    ['Open early', ev ? '' : earlyHtml(early, origin), true],
    ['Columbus by Design', ev ? designHtml(design) : '', true],
    ['Lookout', lookoutHtml(lookoutItems, k), true],
    ['Business', !ev && business ? `<p><a href="${h(origin + business.href)}">${h(business.headline)}</a></p>` : '', true],
    ['Up the road', roadHtml(road), true],
    ['Sponsored', ev ? '' : sponsors.map((s) => `<p><strong>${h(s.name)}</strong>. ${h(s.line)} <small>Sponsors have no say in our coverage.</small></p>`).join(''), false],
  ].filter(([, x]) => x);
  const substance = sections.filter(([, , s]) => s).length;
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${h(name)}, ${h(prettyDate(date))}</title></head><body style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:16px;color:#1b1a17;line-height:1.5">
<h1 style="font-size:28px;margin-bottom:4px">${h(name)}</h1><p style="margin-top:0">${h(EDITIONS[k].header)}, ${h(prettyDate(date))}</p>
${open ? (ev ? `<p>${h(open)}</p>` : markdown(open)) : ''}
${sections.map(([t, x]) => `<h2 style="font-size:18px;border-top:2px solid #1b1a17;padding-top:8px">${h(t)}</h2>${x}`).join('\n')}
<hr><p><small>You signed up at ${h(origin)}/newsletter/. <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Choose morning, evening or both, or unsubscribe</a>. Our reporting standards: ${h(origin)}/about/standards/</small></p></body></html>`;
  return { html, sections: sections.map(([t]) => t), substance };
}

// The subject: the publisher's when it is clean, otherwise the plain dated one.
export function subjectFor(kind, date, name, typed = '') {
  const s = String(typed || '').trim();
  if (s && clean(s)) return s;
  return kindOf(kind) === 'evening' ? `${name} tonight, ${prettyDate(date)}` : `${name}, ${prettyDate(date)}`;
}

// Hours on the day, for a spotlight or "open early" line.
export const hoursOn = (rows, dow) => (rows || []).filter((r) => r[0] === dow).map((r) => fmtRange(r[1], r[2])).join(', ');

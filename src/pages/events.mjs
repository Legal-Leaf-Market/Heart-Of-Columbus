// Event cards for the home page ("This weekend") and /visit/ ("What's on"),
// and the /events.ics feed. The site is static, so which events show is
// decided in the browser at load time (public/js/events.js), the way
// open-now is; each card carries the places a short walk from the venue and
// their hours so the browser can say which are open during the event.
import { esc, t, json } from '../layout.mjs';
import { svg } from '../site.mjs';
import { directory, km } from '../data/directory.mjs';
import { EVENTS, CALENDARS, SOURCES as SOURCE_LIST } from '../data/events.mjs';

const NEAR_KM = 0.4; // about a 5-minute walk
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ymd = (s) => s.split('-').map(Number);
const fmtDate = (s) => { const [, m, d] = ymd(s); return `${MONTHS[m - 1]} ${d}`; };
export const dateRange = (e) => (e.start === e.end ? fmtDate(e.start) : `${fmtDate(e.start)} to ${fmtDate(e.end)}`);
const fmtMin = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };

const nearVenue = (e) =>
  directory
    .filter((b) => b.ll && b.hours && !b.tempClosed && ['restaurants', 'coffee-sweets', 'bars'].includes(b.cat))
    .map((b) => [km(e.ll, b.ll), b])
    .filter(([d]) => d <= NEAR_KM)
    .sort((a, b) => a[0] - b[0])
    .slice(0, 24)
    .map(([, b]) => [b.slug, b.name, b.hours]);

const eventCard = (e) => `
<article class="ev" data-event data-start="${e.start}" data-end="${e.end}"${e.times ? ` data-times="${e.times.join(',')}"` : ''}>
  <p class="ev-cal" aria-hidden="true"><span>${MONTHS[ymd(e.start)[1] - 1]}</span><b>${ymd(e.start)[2]}</b></p>
  <p class="ev-date">${svg('list', 'ic-sm')}${esc(dateRange(e))}${e.times ? `, ${fmtMin(e.times[0])} to ${fmtMin(e.times[1])}` : ''}</p>
  <h3><a href="${esc(e.url)}" target="_blank" rel="noopener">${t(e.name)}</a></h3>
  <p class="ev-venue">${svg('pin', 'ic-sm')}${esc(e.venue)}</p>
  <p class="ev-line">${t(e.line)}</p>
  <div class="ev-near" data-ev-near hidden></div>
  <button type="button" class="bz-save ev-save" data-save="e:${e.slug}" aria-pressed="false" aria-label="Save ${esc(e.name)}">${svg('heart')}</button>
  <script type="application/json" data-near>${json(nearVenue(e))}</script>
</article>`;

// mode 'weekend' shows events overlapping the coming Friday to Sunday;
// 'upcoming' shows every event that has not ended.
export function eventsSection({ mode, id = 'events', title, kicker }) {
  return `
<section class="wrap ev-sec" id="${id}" data-events="${mode}" hidden>
  <div class="rail-head"><div><p class="kicker" data-ev-kicker>${esc(kicker)}</p><h2 data-ev-title>${esc(title)}</h2></div>
    <a class="see-all" href="/events/">All local events ${svg('arrow', 'ic-sm')}</a></div>
  <div class="ev-grid">${EVENTS.map(eventCard).join('')}</div>
  <p class="fine">Signature events only, from each organizer’s own page (<a href="/events.ics">add them to your calendar</a>). Library, parks and Arts Council listings are on <a href="/events/">Local events</a>. Also: ${CALENDARS.map(([l, u]) => `<a href="${u}" target="_blank" rel="noopener">${esc(l)}</a>`).join(' · ')}. Hours for nearby places come from their Google listings; call ahead.</p>
</section>`;
}

// RFC 5545 calendar of every event, as all-day entries with times in the text.
export function icsFeed(now = new Date()) {
  const text = (s) => s.replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n');
  const day = (s) => s.replace(/-/g, '');
  const next = (s) => { const [y, m, d] = ymd(s); return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, ''); };
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heart of Columbus//Events//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Heart of Columbus: signature events', 'X-WR-TIMEZONE:America/Indiana/Indianapolis'];
  for (const e of EVENTS) {
    lines.push('BEGIN:VEVENT', `UID:${e.slug}@heartofcolumbus`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${day(e.start)}`, `DTEND;VALUE=DATE:${next(e.end)}`,
      `SUMMARY:${text(e.name)}`, `LOCATION:${text(e.venue + ', Columbus, Indiana')}`, `URL:${e.url}`,
      `DESCRIPTION:${text((e.times ? `${fmtMin(e.times[0])} to ${fmtMin(e.times[1])}. ` : '') + e.line + ' Details: ' + e.url)}`, 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  // Lines longer than 75 characters continue on the next line after a space.
  const folded = lines.map((l) => l.match(/.{1,73}/g).join('\r\n '));
  return folded.join('\r\n') + '\r\n';
}

// The homepage calendar: "This week in Columbus". Fourteen day tiles with a
// count each, tap a day to list its events, tap an event for a pop up with
// the organizer's link and an add-to-calendar file. public/js/events-week.js
// fills it from /api/events (library, parks, Arts Council and hand-entered
// listings). Without the script, or if the feed fails, it shows the
// signature events as a short list, never an empty box.
export function homeEvents() {
  const upcoming = EVENTS.slice().sort((a, b) => a.start.localeCompare(b.start));
  const srcNames = Object.fromEntries(SOURCE_LIST.map((s) => [s.id, s.short || s.name]));
  return `
<section class="wrap evw" id="this-week" aria-labelledby="evw-h" data-evw data-src-names="${esc(JSON.stringify(srcNames))}">
  <div class="rail-head"><div><p class="kicker">Library, parks, arts and more</p><h2 id="evw-h">This week in Columbus</h2></div>
    <a class="see-all" href="/events/">All local events ${svg('arrow', 'ic-sm')}</a></div>
  <div class="evw-tools" data-evw-tools hidden>
    <div class="evw-filters" role="group" aria-label="Show">
      <button type="button" class="evw-chip" data-evw-filter="all" aria-pressed="true">Everything</button>
      <button type="button" class="evw-chip" data-evw-filter="kids" aria-pressed="false">Kids &amp; family</button>
      <button type="button" class="evw-chip" data-evw-filter="live" aria-pressed="false">Live music &amp; arts</button>
    </div>
  </div>
  <div class="evw-days" data-evw-days role="tablist" aria-label="Pick a day" hidden></div>
  <div class="evw-list" data-evw-list aria-live="polite">
    <ul class="evw-rows" role="list">${upcoming.map((e) => `<li><a class="evw-row" href="${esc(e.url)}" target="_blank" rel="noopener"><span class="evw-when">${esc(dateRange(e))}</span><span class="evw-what"><strong>${t(e.name)}</strong><span>${esc(e.venue)}</span></span></a></li>`).join('')}</ul>
  </div>
  <dialog class="evw-pop" data-evw-pop aria-labelledby="evw-pop-h">
    <form method="dialog"><button class="evw-x" aria-label="Close">${svg('x', 'ic-sm')}</button></form>
    <p class="evw-pop-k" data-evw-pop-k></p>
    <h3 id="evw-pop-h" data-evw-pop-h></h3>
    <p class="evw-pop-m" data-evw-pop-m></p>
    <p class="evw-pop-cta"><a class="btn" data-evw-pop-go target="_blank" rel="noopener">Details from the organizer ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost" data-evw-pop-ics download>Add to my calendar</a></p>
    <p class="fine" data-evw-pop-src></p>
  </dialog>
  <p class="fine evw-foot">Listings come from each organizer’s own calendar and link back to it. Times can change; check before you go. <a href="/events.ics">Signature events calendar</a></p>
</section>`;
}

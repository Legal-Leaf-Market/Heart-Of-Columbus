// Local events (/events/) and the printable listing (/events/print/).
// The listings come live from /api/events (netlify/functions/events.mjs),
// which reads each organizer's calendar and is cached for an hour; the
// browser draws them (public/js/calendar.js). The hand-entered ones ride
// along in the page so it is never empty when a feed can't be reached.
import { page, esc } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { SOURCES, LISTINGS, STAGES } from '../data/events.mjs';
import { handEntered, AUDIENCES, creditLine, today, inWindow, addDays, webDate } from '../event-feeds.mjs';
import { dateRange } from './events.mjs';
import { ORIGIN } from '../jsonld.mjs';

const styles = ['hoc.css'];
const ids = SOURCES.map((s) => s.id);
const pageData = () => ({
  sources: SOURCES.map(({ id, name, short, calendar, site, feed, checked }) => ({ id, name, short, calendar, site, live: !!feed, checked: checked || '' })),
  fallback: handEntered(),
  credit: creditLine(ids),
});
// What the page shows before its script runs, and all a crawler or a reader
// without JavaScript ever sees: the hand-checked listings for the month from
// the build date, each linked to its organizer. The script replaces it with
// the live calendars. Nothing here is a feed item, so nothing goes stale
// faster than the hand-entered data itself.
const firstPaint = () => {
  const from = today(), list = inWindow(handEntered(), from, addDays(from, 30));
  if (!list.length) return '';
  const days = [];
  for (const e of list) (days.at(-1)?.date === e.date ? days.at(-1) : days[days.push({ date: e.date, items: [] }) - 1]).items.push(e);
  return days.map((d) => `<section class="cal-day"><h2>${esc(webDate(d.date))}</h2>${d.items.map((e) => {
    const s = SOURCES.find((x) => x.id === e.src) || { short: '', name: '', calendar: '#' };
    return `<article class="cal-ev"><p class="cal-time">${esc(e.when)}</p><div class="cal-body"><h3>${ext(e.url, esc(e.title))}</h3><p class="cal-meta">${esc(e.venue)}</p></div>${ext(s.calendar, esc(s.short), `cal-tag cal-tag-${esc(e.src)}`)}</article>`;
  }).join('')}</section>`).join('');
};
const ext = (href, text, cls = '') => `<a${cls ? ` class="${cls}"` : ''} href="${esc(href)}" target="_blank" rel="noopener">${text}</a>`;
const fmtChecked = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); };

const sourceCards = () => SOURCES.map((s) => `
  <article class="cal-source" data-src-card="${s.id}">
    <span class="cal-dot cal-dot-${s.id}" aria-hidden="true"></span>
    <div>
      <h3>${esc(s.name)}</h3>
      <p class="muted">${s.feed ? 'Read from their public calendar feed and refreshed every hour.' : `No public feed yet, so we enter its calendar by hand. Last checked ${esc(fmtChecked(s.checked))}.`}</p>
      <p class="cal-src-state" data-src-state="${s.id}" aria-live="polite"></p>
      <p>${ext(s.calendar, `Their calendar ${svg('arrow', 'ic-sm')}`, 'see-all')}</p>
    </div>
  </article>`).join('');

// The next county fair, up top all year: it is the biggest thing on the
// calendar. The browser hides it once it has ended (data-ends).
function fairCard() {
  const fair = LISTINGS.filter((e) => e.feature && e.end >= today()).sort((a, b) => a.start.localeCompare(b.start))[0];
  if (!fair) return '';
  const s = SOURCES.find((x) => x.id === fair.from);
  const year = fair.start.slice(0, 4);
  return `
<section class="wrap cal-fair-wrap" aria-labelledby="cal-fair-h">
  <div class="cal-fair" data-ends="${fair.end}">
    <div>
      <p class="kicker">At the fairgrounds</p>
      <h2 id="cal-fair-h">${esc(fair.name).replace('4-H', '<span class="nw">4-H</span>')} ${year}</h2>
      <p class="cal-fair-when">${svg('list', 'ic-sm')}${esc(dateRange(fair))}, ${year}</p>
      <p>${esc(s.about)}</p>
      <p class="btns">${ext(fair.url, `The fair’s site ${svg('arrow', 'ic-sm')}`, 'btn btn-sm')}${ext(s.calendar, 'Fair schedule', 'btn btn-sm btn-ghost')}</p>
    </div>
  </div>
</section>`;
}

function eventsPage({ assets }) {
  const body = `
${header('events')}
<main id="main" data-cal="list">
${breadcrumbs([['/', 'Home'], ['', 'Local events']])}
<section class="order-hero vs-hero cal-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Local events</p>
    <h1>What’s on in<br><span class="hl">Columbus</span></h1>
    <p class="lede">Library programs, parks events, the county fair, live music and Arts Council nights in one list, each linked to the organizer’s own page.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>From the public calendars of the ${SOURCES.map((s) => ext(s.calendar, esc(s.name))).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Not affiliated with them. Times and places change, so check the event page before you go.</span></p>
    <p class="btns cal-tools">
      <a class="btn btn-sm" href="#live" data-kind-link>${svg('heart', 'ic-sm')}Live music and arts</a>
      <a class="btn btn-sm btn-ghost" href="/events/print/" data-cal-print>${svg('list', 'ic-sm')}Printable listing</a>
      <a class="btn btn-sm btn-ghost" href="/api/events?format=ics" data-cal-export="ics">Add to my calendar</a>
      <a class="btn btn-sm btn-ghost" href="/api/events?format=csv" data-cal-export="csv" download>Spreadsheet (CSV)</a>
    </p>
  </div>
</section>
${fairCard()}
<div class="wrap cal-wrap">
  <form class="cal-filters" data-cal-filters onsubmit="return false" aria-label="Filter events">
    <div class="cal-row" role="group" aria-label="When">
      ${[['today', 'Today'], ['weekend', 'This weekend'], ['week', 'Next 7 days'], ['month', 'Next 30 days']].map(([k, l]) => `<button type="button" class="pill" data-range="${k}" aria-pressed="${k === 'week'}">${l}</button>`).join('')}
    </div>
    <div class="cal-row" role="group" aria-label="From">
      ${SOURCES.map((s) => `<button type="button" class="pill cal-pill" data-src="${s.id}" aria-pressed="true"><span class="cal-dot cal-dot-${s.id}" aria-hidden="true"></span>${esc(s.short)}</button>`).join('')}
    </div>
    <div class="cal-row" role="group" aria-label="What">
      <button type="button" class="pill" data-kind="" aria-pressed="true">Everything</button>
      <button type="button" class="pill" data-kind="live" aria-pressed="false">🎸 Live music and arts</button>
    </div>
    <div class="cal-row" role="group" aria-label="For">
      <button type="button" class="pill" data-aud="" aria-pressed="true">Everyone</button>
      ${AUDIENCES.map(([k, l]) => `<button type="button" class="pill" data-aud="${k}" aria-pressed="false">${esc(l)}</button>`).join('')}
    </div>
    <label class="cal-search">${svg('search')}<input type="search" data-cal-q placeholder="Storytime, yoga, ice skating…" aria-label="Search events"></label>
  </form>
  <p class="cal-status" data-cal-status role="status">Arts, fair and venue listings checked by hand are below. The library and parks calendars load next.</p>
  <div class="cal-list" data-cal-list>${firstPaint()}</div>
  <noscript><p class="cal-status">The library and parks listings need JavaScript. Their calendars: ${SOURCES.filter((s) => s.feed).map((s) => ext(s.calendar, esc(s.name))).join(', ')}.</p></noscript>
  <section class="cal-live" id="live" aria-labelledby="cal-live-h">
    <p class="kicker">Concerts, open mics, comedy and poetry</p>
    <h2 id="cal-live-h">Live music and arts</h2>
    <p class="vs-lead">Dated shows are in the list above under <button type="button" class="linkish" data-kind-set="live">Live music and arts</button>. These are the stages to watch. Most post their lineups on social media rather than a calendar we can read, so we only list a date once we have seen it on the place’s own page.</p>
    <div class="cal-stage-grid">${STAGES.map((v) => `
      <article class="cal-stage">
        <h3>${esc(v.name)}</h3>
        <p class="cal-meta">${svg('pin', 'ic-sm')}${esc(v.where)}</p>
        <p>${esc(v.what)}</p>
        <p class="cal-stage-links">${v.url ? ext(v.url, `Their page ${svg('arrow', 'ic-sm')}`, 'see-all') : ''}${v.listing ? `<a href="/b/${v.listing}/">Listing here</a>` : ''}</p>
      </article>`).join('')}
    </div>
    <p class="fine">Checked ${esc(fmtChecked(STAGES[0].checked))}. Run a stage, an open mic or a poetry night in Columbus? Send us the link to your calendar and we’ll add it.</p>
  </section>
  <section class="cal-sources" aria-labelledby="cal-sources-h">
    <h2 id="cal-sources-h">Where these come from</h2>
    <div class="cal-source-grid">${sourceCards()}</div>
    <p class="fine">We show the title, time, place and ages only. Descriptions, registration and costs are on each organizer’s page. The age filters use the library’s own age labels. For papers and newsletters: the <a href="/events/print/">printable listing</a> is in AP style and can be copied as plain text, and <a href="/api/events?format=json">/api/events</a> gives the same listings as JSON, CSV (<code>format=csv</code>), text (<code>format=txt</code>) or a calendar (<code>format=ics</code>), with <code>from</code>, <code>days</code> and <code>src</code> to narrow it.</p>
  </section>
</div>
</main>
${footer()}`;
  return page({
    title: 'Local events in Columbus, Indiana | Heart of Columbus',
    description: 'Events in Columbus, Indiana from the Bartholomew County Public Library, Columbus Parks and Recreation and the Columbus Area Arts Council, each linked to its source.',
    alternates: [['en', `${ORIGIN}/events/`]], data: pageData(),
    body, scripts: ['site.js', 'calendar.js'], styles, assets,
  });
}

function printPage({ assets }) {
  const body = `
<div class="pr-screen">
${header('events')}
${breadcrumbs([['/', 'Home'], ['/events/', 'Local events'], ['', 'Printable listing']])}
</div>
<main id="main" data-cal="print">
<section class="wrap pr-controls" aria-labelledby="pr-h">
  <h1 id="pr-h">Printable listing</h1>
  <p class="muted">A calendar page for a newsletter, a bulletin board or the paper. Times and dates are in AP style. Pick the days, print it or copy the text into your layout.</p>
  <form class="pr-form" data-cal-filters onsubmit="return false">
    <label>Starts <input type="date" data-pr-from></label>
    <label>Covers <select data-pr-days><option value="7" selected>7 days</option><option value="14">14 days</option><option value="31">31 days</option></select></label>
    <label>For <select data-pr-aud><option value="">Everyone</option>${AUDIENCES.map(([k, l]) => `<option value="${k}">${esc(l)}</option>`).join('')}</select></label>
    <label>What <select data-pr-kind><option value="">Everything</option><option value="live">Live music and arts</option></select></label>
    <label>Columns <select data-pr-cols><option value="1">1</option><option value="2">2</option><option value="3" selected>3</option></select></label>
    <fieldset><legend>From</legend>${SOURCES.map((s) => `<label class="pr-check"><input type="checkbox" data-src="${s.id}" checked> ${esc(s.short)}</label>`).join('')}</fieldset>
  </form>
  <p class="btns">
    <button type="button" class="btn btn-sm" data-pr-print>${svg('list', 'ic-sm')}Print</button>
    <button type="button" class="btn btn-sm btn-ghost" data-pr-copy>Copy as text</button>
    <a class="btn btn-sm btn-ghost" href="/api/events?format=txt" data-cal-export="txt" download>Text file</a>
    <a class="btn btn-sm btn-ghost" href="/api/events?format=csv" data-cal-export="csv" download>CSV</a>
  </p>
  <p class="cal-status" data-cal-status role="status">Loading events…</p>
</section>
<article class="pr-sheet" data-pr-sheet>
  <header class="pr-mast">
    <p class="pr-kicker">Heart of Columbus</p>
    <h2>Columbus Calendar</h2>
    <p class="pr-range" data-pr-range></p>
  </header>
  <div class="pr-cols" data-cal-list></div>
  <p class="pr-credit" data-pr-credit></p>
</article>
</main>
<div class="pr-screen">${footer()}</div>`;
  return page({
    title: 'Printable events listing | Heart of Columbus',
    description: 'A printable, AP-style calendar of library, parks and Arts Council events in Columbus, Indiana.',
    data: pageData(), body, scripts: ['site.js', 'calendar.js'], styles, assets,
  });
}

export const calendarPages = (ctx) => [
  { path: 'events/index.html', html: eventsPage(ctx) },
  { path: 'events/print/index.html', html: printPage(ctx) },
];

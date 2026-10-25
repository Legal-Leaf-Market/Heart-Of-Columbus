// Trip ideas (/trips/<slug>/) and the "Columbus your way" cards used on the
// home page and /visit/. Every reason under a stop is computed here from the
// listing's own data, so the page never says more than the data does.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { directory, km, subBySlug } from '../data/directory.mjs';
import { landmarkBySlug } from '../data/landmarks.mjs';
import { TRIPS } from '../data/trips.mjs';
import { fmtRange, DAY_NAMES } from '../hours.mjs';
import { walkMin } from './landmark-pages.mjs';

const styles = ['hoc.css'];
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
const fmt = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };

// A stop as one shape, business or landmark.
export function stopOf(id) {
  if (id.startsWith('l:')) {
    const l = landmarkBySlug[id.slice(2)];
    return l && { id, kind: 'landmark', name: l.name, href: `/l/${l.slug}/`, ll: l.ll, address: l.address, l };
  }
  const b = bySlug[id];
  return b && { id, kind: 'business', name: b.name, href: `/b/${b.slug}/`, ll: b.ll, address: b.address, b };
}

// The hours row that covers [from, to] on day d, if any.
export const coveringRow = (rows, d, from, to) => (rows || []).find((r) => r[0] === d && r[1] <= from && r[2] >= to) || null;

function reasons(s, from, prev, day) {
  const out = [];
  if (s.kind === 'business') {
    const row = coveringRow(s.b.hours, day, from, from);
    if (row) out.push(`Open ${fmtRange(row[1], row[2])} on ${DAY_NAMES[day]}s`);
    if (s.b.order.length) out.push('Orders pickup online');
    if (s.b.heritage) out.push('Columbus original');
    if (s.b.dora) out.push('Social District: drinks to go');
  } else {
    out.push(s.l.note || `${s.l.architect}, ${s.l.year}`);
    if (s.l.street) out.push('Seen from the street, free');
  }
  if (prev && prev.ll && s.ll) out.push(`About ${walkMin(km(prev.ll, s.ll))} min walk from ${prev.name} (estimate)`);
  return out;
}

const shareIds = (trip) => trip.stops.map(([id]) => encodeURIComponent(id)).join(',');

function tripPage(trip, { assets }) {
  const stops = trip.stops.map(([id, from, to]) => ({ ...stopOf(id), from, to }));
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['/visit/#your-way', 'Columbus your way'], ['', trip.title]])}
<section class="wrap tp-head">
  <p class="kicker kicker-pill">A ${esc(DAY_NAMES[trip.day])} in Columbus</p>
  <h1>${t(trip.title)}</h1>
  <p class="lede">${t(trip.line)}</p>
  <p class="btns"><a class="btn btn-sm" href="/saved/?ids=${shareIds(trip)}">${svg('map', 'ic-sm')} Open as a list and map</a><button type="button" class="btn btn-sm btn-ghost" data-save-all="${esc(trip.stops.map(([id]) => id).join(','))}">${svg('heart', 'ic-sm')} <span>Save every stop</span></button></p>
</section>
<ol class="wrap tp-stops">
  ${stops.map((s, i) => `<li class="tp-stop">
    <p class="tp-time">${fmt(s.from)} to ${fmt(s.to)}</p>
    <div class="tp-card">
      <p class="tp-kind">${s.kind === 'landmark' ? 'Landmark' : esc(s.b.featured ? subBySlug[s.b.sub].label : s.b.type)}</p>
      <h2><a href="${s.href}">${t(s.name)}</a></h2>
      ${s.address ? `<p class="tp-addr">${svg('pin', 'ic-sm')}${t(s.address)}</p>` : ''}
      <ul class="tp-why">${reasons(s, s.from, stops[i - 1], trip.day).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>
  </li>`).join('')}
</ol>
<section class="wrap tp-foot">
  <p class="fine">Built from the listings on this site: hours from each business’s Google listing (October 2026), landmark facts from their cited sources. Walking times are straight-line estimates. Hours change; call ahead. We are not affiliated with these businesses.</p>
</section>
${yourWay({ except: trip.slug, title: 'More ways to spend a day' })}
</main>
${footer()}`;
  return page({
    title: `${trip.title} | Columbus, Indiana trip idea`,
    description: `${trip.title}: a ${DAY_NAMES[trip.day]} in Columbus, Indiana, built from real hours and addresses.`,
    body, scripts: ['site.js'], styles, assets,
  });
}

// Cards linking to each trip, for /visit/ and the home page.
export function yourWay({ except = '', title = 'Columbus your way', id = 'your-way' } = {}) {
  const trips = TRIPS.filter((x) => x.slug !== except);
  if (!trips.length) return '';
  return `
<section class="wrap yw" id="${id}">
  <div class="rail-head"><div><p class="kicker">Trip ideas</p><h2>${esc(title)}</h2></div></div>
  <div class="yw-grid">${trips.map((x) => `<a class="yw-card" href="/trips/${x.slug}/"><span class="yw-day">${esc(DAY_NAMES[x.day])} · ${x.stops.length} stops</span><strong>${t(x.title)}</strong><span>${t(x.line)}</span></a>`).join('')}</div>
</section>`;
}

export const tripPages = (ctx) => TRIPS.map((x) => ({ path: `trips/${x.slug}/index.html`, html: tripPage(x, ctx) }));

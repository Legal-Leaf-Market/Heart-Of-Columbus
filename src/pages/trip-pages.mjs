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
import { itemListLd, ORIGIN } from '../jsonld.mjs';
import { PAGES as ES, FACTS, REVIEW_NOTE } from '../i18n/es.mjs';

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

const EN = {
  kicker: (day) => `A ${day} in Columbus`, crumb: 'Columbus your way', openList: 'Open as a list and map', saveAll: 'Save every stop',
  landmark: 'Landmark', to: 'to',
  open: (range, day) => `Open ${range} on ${day}s`, orders: 'Orders pickup online', original: 'Columbus original',
  dora: 'Social District: drinks to go', street: 'Seen from the street, free', walk: (n, from) => `About ${n} min walk from ${from} (estimate)`,
  foot: 'Built from the listings on this site: hours from each business’s Google listing (October 2026), landmark facts from their cited sources. Walking times are straight-line estimates. Hours change; call ahead. We are not affiliated with these businesses.',
  more: 'More ways to spend a day', yourWay: 'Columbus your way', ideas: 'Trip ideas', stops: 'stops',
  description: (t, day) => `${t}: a ${day} in Columbus, Indiana, built from real hours and addresses.`,
  titles: {},
};
const strings = (lang) => (lang === 'es' ? ES.trip : EN);
const dayName = (lang, d) => (lang === 'es' ? ES.days[d] : DAY_NAMES[d]);
const titleOf = (trip, lang) => (lang === 'es' && ES.trip.titles[trip.slug]) || [trip.title, trip.line];

function reasons(s, from, prev, day, lang = 'en') {
  const L = strings(lang), out = [];
  if (s.kind === 'business') {
    const row = coveringRow(s.b.hours, day, from, from);
    if (row) out.push(L.open(fmtRange(row[1], row[2], lang === 'es' ? ' a ' : ' to '), dayName(lang, day)));
    if (s.b.order.length) out.push(L.orders);
    if (s.b.heritage) out.push(L.original);
    if (s.b.dora) out.push(L.dora);
  } else {
    const n = s.l.note || `${s.l.architect}, ${s.l.year}`;
    out.push(lang === 'es' ? FACTS[n] || n.replace(/ and /g, ' y ') : n);
    if (s.l.street) out.push(L.street);
  }
  if (prev && prev.ll && s.ll) out.push(L.walk(walkMin(km(prev.ll, s.ll)), prev.name));
  return out;
}

const shareIds = (trip) => trip.stops.map(([id]) => encodeURIComponent(id)).join(',');

function tripPage(trip, { assets }, lang = 'en') {
  const es = lang === 'es', L = strings(lang), pre = es ? '/es' : '';
  const [title, line] = titleOf(trip, lang);
  const stops = trip.stops.map(([id, from, to]) => {
    const s = stopOf(id);
    return { ...s, href: es && s.kind === 'landmark' ? '/es' + s.href : s.href, from, to };
  });
  const body = `
${header('visit', { lang, alt: es ? `/trips/${trip.slug}/` : `/es/trips/${trip.slug}/` })}
<main id="main">
${breadcrumbs([['/', es ? 'Inicio' : 'Home'], [`${pre}/visit/`, es ? 'Planee su visita' : 'Plan your visit'], [`${pre}/visit/#your-way`, L.crumb], ['', title]])}
<section class="wrap tp-head">
  <p class="kicker kicker-pill">${esc(L.kicker(dayName(lang, trip.day)))}</p>
  <h1>${t(title)}</h1>
  <p class="lede">${t(line)}</p>
  ${es ? `<p class="vs-note vs-review">${esc(REVIEW_NOTE)}</p>` : ''}
  <p class="btns"><a class="btn btn-sm" href="/saved/?ids=${shareIds(trip)}">${svg('map', 'ic-sm')} ${L.openList}</a><button type="button" class="btn btn-sm btn-ghost" data-save-all="${esc(trip.stops.map(([id]) => id).join(','))}">${svg('heart', 'ic-sm')} <span>${L.saveAll}</span></button></p>
</section>
<ol class="wrap tp-stops">
  ${stops.map((s, i) => `<li class="tp-stop">
    <p class="tp-time">${fmt(s.from)} ${L.to} ${fmt(s.to)}</p>
    <div class="tp-card">
      <p class="tp-kind">${s.kind === 'landmark' ? L.landmark : esc(s.b.featured ? subBySlug[s.b.sub].label : s.b.type)}</p>
      <h2><a href="${s.href}">${t(s.name)}</a></h2>
      ${s.address ? `<p class="tp-addr">${svg('pin', 'ic-sm')}${t(s.address)}</p>` : ''}
      <ul class="tp-why">${reasons(s, s.from, stops[i - 1], trip.day, lang).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
    </div>
  </li>`).join('')}
</ol>
<section class="wrap tp-foot">
  <p class="fine">${esc(L.foot)}</p>
</section>
${yourWay({ except: trip.slug, title: L.more, lang })}
</main>
${footer({ lang })}`;
  return page({
    title: `${title} | ${es ? 'Idea de viaje en Columbus, Indiana' : 'Columbus, Indiana trip idea'}`,
    description: L.description(title, dayName(lang, trip.day)), lang,
    alternates: [['en', `${ORIGIN}/trips/${trip.slug}/`], ['es', `${ORIGIN}/es/trips/${trip.slug}/`]],
    body, scripts: ['site.js'], styles, assets, ld: es ? [] : [itemListLd(trip.title, stops.map((s) => [s.name, s.href]))],
  });
}

// Cards linking to each trip, for /visit/ and the home page.
export function yourWay({ except = '', title = '', id = 'your-way', lang = 'en' } = {}) {
  const L = strings(lang), pre = lang === 'es' ? '/es' : '';
  const trips = TRIPS.filter((x) => x.slug !== except);
  if (!trips.length) return '';
  return `
<section class="wrap yw" id="${id}">
  <div class="rail-head"><div><p class="kicker">${esc(L.ideas)}</p><h2>${esc(title || L.yourWay)}</h2></div></div>
  <div class="yw-grid">${trips.map((x) => { const [tt, ln] = titleOf(x, lang); return `<a class="yw-card" href="${pre}/trips/${x.slug}/"><span class="yw-day">${esc(dayName(lang, x.day))} · ${x.stops.length} ${L.stops}</span><strong>${t(tt)}</strong><span>${t(ln)}</span></a>`; }).join('')}</div>
</section>`;
}

export const tripPages = (ctx) => TRIPS.flatMap((x) => [
  { path: `trips/${x.slug}/index.html`, html: tripPage(x, ctx) },
  { path: `es/trips/${x.slug}/index.html`, html: tripPage(x, ctx, 'es') },
]);

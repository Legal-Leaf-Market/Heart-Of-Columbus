// Trails (/trails/ and /trails/<slug>/): routes through places on our list,
// from src/data/trails.mjs, with an honor-system stamp card that lives only
// in this browser (public/js/trail.js). English only for now.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { km } from '../data/directory.mjs';
import { TRAILS, trailStops } from '../data/trails.mjs';
import { walkMin } from './landmark-pages.mjs';
import { itemListLd } from '../jsonld.mjs';

const styles = ['hoc.css'];
const miles = (d) => (d * 0.621371).toFixed(1).replace(/\.0$/, '');
const NOT_A_PROGRAM = 'A route through places on our list, not a program they joined. Stamps are on the honor system and kept only in this browser. There are no prizes, and nothing is sent to anyone.';
const FOOT = 'Built from the listings on this site. Distances are straight lines, so the real trip is longer. Hours change; check a place’s page or call ahead. We are not affiliated with these businesses.';

const hop = (s, prev) => {
  if (!prev || !prev.ll || !s.ll) return '';
  const d = km(prev.ll, s.ll), w = walkMin(d);
  return w <= 20 ? `About ${w} min walk from ${prev.name} (estimate)` : `About ${miles(d)} mi from ${prev.name} (straight line)`;
};

function trailPage(trail, { assets }) {
  const stops = trailStops(trail);
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['/trails/', 'Trails'], ['', trail.title]])}
<section class="wrap tp-head">
  <p class="kicker kicker-pill">${esc(trail.kicker)} trail</p>
  <h1>${t(trail.title)}</h1>
  <p class="lede">${t(trail.line)}</p>
  <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(NOT_A_PROGRAM)}</span></p>
  <p class="tl-count" data-trail-count aria-live="polite">${stops.length} stops</p>
  <p class="btns"><a class="btn btn-sm" href="/saved/?ids=${stops.map((s) => encodeURIComponent(s.id)).join(',')}">${svg('map', 'ic-sm')} Open as a list and map</a><button type="button" class="btn btn-sm btn-ghost" data-save-all="${esc(stops.map((s) => s.id).join(','))}">${svg('heart', 'ic-sm')} <span>Save every stop</span></button><button type="button" class="btn btn-sm btn-ghost" data-trail-print>Print the stamp card</button></p>
</section>
<ol class="wrap tp-stops" data-trail="${trail.slug}">
  ${stops.map((s, i) => `<li class="tp-stop">
    <div class="tp-card tl-card">
      <p class="tp-kind">${s.kind === 'landmark' ? 'Landmark' : esc(s.b.type)}</p>
      <h2><a href="${s.href}">${t(s.name)}</a></h2>
      ${s.address ? `<p class="tp-addr">${svg('pin', 'ic-sm')}${t(s.address)}</p>` : ''}
      ${hop(s, stops[i - 1]) ? `<ul class="tp-why"><li>${esc(hop(s, stops[i - 1]))}</li></ul>` : ''}
      <button type="button" class="tl-stamp" data-stamp="${esc(s.id)}" aria-pressed="false" aria-label="Mark ${esc(s.name)} visited"><span class="tl-box" aria-hidden="true"></span><span data-stamp-label>Mark visited</span></button>
    </div>
  </li>`).join('')}
</ol>
<section class="wrap tp-foot">
  <p class="fine">${esc(trail.rule)} ${esc(FOOT)}</p>
  <p class="btns"><a class="btn btn-sm btn-ghost" href="${trail.all}">See the whole category</a><button type="button" class="btn btn-sm btn-ghost" data-trail-reset hidden>Clear my stamps</button></p>
</section>
${trailCards({ except: trail.slug, title: 'More trails' })}
</main>
${footer()}`;
  return page({
    title: `${trail.title} | Columbus, Indiana trail`,
    description: `${trail.title}: ${trail.line} A stamp card you keep in your browser.`,
    body, scripts: ['site.js', 'trail.js'], styles, assets,
    ld: [itemListLd(trail.title, stops.map((s) => [s.name, s.href]))],
  });
}

// Cards linking to each trail, for /trails/ and /visit/.
export function trailCards({ except = '', title = 'Trails', id = 'trails' } = {}) {
  const list = TRAILS.filter((x) => x.slug !== except);
  return `
<section class="wrap yw" id="${id}">
  <div class="rail-head"><div><p class="kicker">Stamp cards</p><h2>${esc(title)}</h2></div></div>
  <div class="yw-grid">${list.map((x) => `<a class="yw-card" href="/trails/${x.slug}/"><span class="yw-day">${esc(x.kicker)} · ${trailStops(x).length} stops</span><strong>${t(x.title)}</strong><span>${t(x.line)}</span></a>`).join('')}</div>
</section>`;
}

function indexPage({ assets }) {
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Trails']])}
<section class="wrap tp-head">
  <p class="kicker kicker-pill">Trails</p>
  <h1>Columbus, one stop at a time</h1>
  <p class="lede">Tacos, coffee, local pours and the landmarks you can see from the street. Pick a trail, mark each place as you go, and print the card if you like paper.</p>
  <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(NOT_A_PROGRAM)}</span></p>
</section>
${trailCards({ title: 'Pick a trail' })}
</main>
${footer()}`;
  return page({
    title: 'Trails | Heart of Columbus',
    description: 'Taco, coffee, brewery and architecture trails through Columbus, Indiana, with a stamp card you keep in your browser.',
    body, scripts: ['site.js'], styles, assets,
  });
}

export const trailPages = (ctx) => [
  { path: 'trails/index.html', html: indexPage(ctx) },
  ...TRAILS.map((x) => ({ path: `trails/${x.slug}/index.html`, html: trailPage(x, ctx) })),
];

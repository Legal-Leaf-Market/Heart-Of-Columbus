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
  <p class="btns"><a class="btn btn-sm" href="/saved/?ids=${stops.map((s) => encodeURIComponent(s.id)).join(',')}">${svg('map', 'ic-sm')} Open as a list and map</a><button type="button" class="btn btn-sm btn-ghost" data-save-all="${esc(stops.map((s) => s.id).join(','))}">${svg('heart', 'ic-sm')} <span>Save every stop</span></button><button type="button" class="btn btn-sm btn-ghost" data-trail-print>Print the stamp card</button><a class="btn btn-sm btn-ghost" href="/passport/">Your passport</a></p>
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
  <p class="btns"><a class="btn btn-sm" href="/passport/">See your passport</a></p>
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

// The passport: every trail's stamp card in one place (public/js/passport.js).
// Digital discoveries on the honor system, kept in this browser; a saved file
// carries them to another device. Not a verified visit, not a reward.
export const PASSPORT_NOTE = 'Every stamp here is a digital discovery on the honor system: you marked it yourself. It is not a verified visit, it can’t be redeemed for anything, and no business has joined a program. Your passport lives only in this browser until you save a copy.';

function passportPage({ assets }) {
  const data = TRAILS.map((x) => ({ slug: x.slug, ids: trailStops(x).map((s) => s.id) }));
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['/trails/', 'Trails'], ['', 'Your passport']])}
<section class="wrap tp-head" data-passport>
  <p class="kicker kicker-pill">Columbus passport</p>
  <h1>Your Columbus passport</h1>
  <p class="lede">All your trail stamps in one place. Mark stops on any trail page and they show up here.</p>
  <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(PASSPORT_NOTE)}</span></p>
  <p class="vs-note pp-warn" data-pp-nostore hidden>This browser isn’t letting the site keep anything, so stamps can’t be saved here. Private browsing often does this. Open the site in a regular window to use your passport.</p>
  <p class="tl-count" data-pp-total aria-live="polite">${data.reduce((n, x) => n + x.ids.length, 0)} stops on ${data.length} trails</p>
</section>
<section class="wrap pp-grid">
  ${TRAILS.map((x) => `<a class="pp-card" href="/trails/${x.slug}/" data-pp-trail="${x.slug}">
    <span class="yw-day">${esc(x.kicker)}</span>
    <strong>${t(x.title)}</strong>
    <span class="pp-meter" aria-hidden="true"><span data-pp-bar></span></span>
    <span class="pp-n" data-pp-n>0 of ${trailStops(x).length}</span>
    <span class="pp-older fine" data-pp-older hidden></span>
  </a>`).join('')}
</section>
<section class="wrap tp-foot">
  <h2>Keep a copy</h2>
  <p>Your stamps stay in this browser. To move them to another phone or browser, or to keep them safe if you clear your history, save a copy and load it there. Loading a copy adds its stamps to the ones you already have; it never removes any.</p>
  <p class="btns">
    <button type="button" class="btn btn-sm" data-pp-save data-pp-needs-store disabled>Save a copy</button>
    <label class="btn btn-sm btn-ghost pp-load">Load a copy<input type="file" accept="application/json,.json" data-pp-load data-pp-needs-store></label>
    <button type="button" class="btn btn-sm btn-ghost" data-pp-clear hidden>Clear my passport</button>
  </p>
  <p class="pp-status" data-pp-status role="status" aria-live="polite"></p>
  <p class="fine">The file holds only which stops you marked, by trail. No name, no location history, nothing sent to us. ${esc(FOOT)}</p>
</section>
<script type="application/json" id="passport-data">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
</main>
${footer()}`;
  return page({
    title: 'Your Columbus passport | Heart of Columbus',
    description: 'Every Columbus, Indiana trail stamp you have marked, in one place, with a copy you can save and carry to another device.',
    body, scripts: ['site.js', 'passport.js'], styles, assets,
  });
}

export const trailPages = (ctx) => [
  { path: 'passport/index.html', html: passportPage(ctx) },
  { path: 'trails/index.html', html: indexPage(ctx) },
  ...TRAILS.map((x) => ({ path: `trails/${x.slug}/index.html`, html: trailPage(x, ctx) })),
];

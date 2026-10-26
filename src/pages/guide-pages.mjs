// Three reference guides: architecture (/architecture/), public art (/arts/)
// and Cummins (/cummins/). Every line comes from src/data/architecture.mjs,
// arts.mjs or cummins.mjs with its source; this file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { LANDMARKS, landmarkBySlug } from '../data/landmarks.mjs';
import { ARCH_FACTS, NHL, TOUR } from '../data/architecture.mjs';
import { ART, EXHIBIT } from '../data/arts.mjs';
import { CUMMINS } from '../data/cummins.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const facts = (list, cls = '') => `<ul class="vs-facts ${cls}">${list.map((f) => `<li>${t(f.text)} ${src(f.source)}</li>`).join('')}</ul>`;

const hero = ({ kicker, h1a, h1b, lede, note, jump }) => `
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', kicker]])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(kicker)}</p>
    <h1>${esc(h1a)}<br><span class="hl">${esc(h1b)}</span></h1>
    <p class="lede">${esc(lede)}</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(note)}</span></p>
    <nav class="chips vs-jump" aria-label="On this page">${jump.map(([h, l]) => `<a class="pill" href="${h}">${esc(l)}</a>`).join('')}</nav>
  </div>
</section>`;

const lmCard = (l, line = l.what, source = l.source) => `<article class="film-stop">
    <a class="film-photo" href="/l/${l.slug}/"><img src="${l.photo.src}" alt="${esc(l.name)}" loading="lazy" style="object-position:${l.photo.pos}"></a>
    <div>
      <h3><a href="/l/${l.slug}/">${t(l.name)}</a></h3>
      <p class="gd-by">${esc(l.note || `${l.architect}, ${l.year}`)}</p>
      <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(l.address)}</p>
      <p>${t(line)} ${src(source)}</p>
      <small class="credit">Photo: ${esc(l.photo.credit)}, ${esc(l.photo.license)}</small>
    </div>
  </article>`;

const textCard = (b) => `<article class="film-stop gd-text">
    <div>
      <h3>${t(b.name)}</h3>
      <p class="gd-by">${esc(`${b.architect}, ${b.year}`)}</p>
      ${b.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(b.address)}</p>` : ''}
      <p>${t(b.what)} ${src(b.source)}</p>
    </div>
  </article>`;

function architecturePage({ assets }) {
  const nhlSlugs = new Set(NHL.filter((n) => n.landmark).map((n) => n.landmark));
  const others = LANDMARKS.filter((l) => !nhlSlugs.has(l.slug));
  const body = `
${header('visit')}
<main id="main">
${hero({
  kicker: 'Architecture', h1a: 'A small city', h1b: 'built by big names.',
  lede: 'Saarinen, Pei, Venturi and Scott Brown, Weese, Roche: how Columbus came to have them, and where to see their buildings.',
  note: 'Every fact links to its source. Heart of Columbus is not the visitors bureau; the official tours start at the Visitors Center.',
  jump: [['#how', 'How it happened'], ['#landmarks', 'National Historic Landmarks'], ['#more', 'More to see'], ['#see-it', 'Seeing it']],
})}
<div class="wrap fr-list">
  <section class="fr-group" id="how" aria-labelledby="how-h">
    <h2 id="how-h">How it happened</h2>
    ${facts(ARCH_FACTS, 'gd-facts')}
    <p class="btns"><a class="btn btn-sm btn-ghost" href="/cummins/">The Cummins story</a></p>
  </section>
  <section class="fr-group" id="landmarks" aria-labelledby="landmarks-h">
    <h2 id="landmarks-h">National Historic Landmarks</h2>
    <div class="film-list gd-grid">${NHL.map((n) => (n.landmark ? lmCard(landmarkBySlug[n.landmark]) : textCard(n))).join('')}</div>
  </section>
  <section class="fr-group" id="more" aria-labelledby="more-h">
    <h2 id="more-h">More to see</h2>
    <div class="film-list gd-grid">${others.map((l) => lmCard(l)).join('')}</div>
  </section>
  <section class="fr-group" id="see-it" aria-labelledby="see-it-h">
    <h2 id="see-it-h">Seeing it</h2>
    <div class="fr-street">
      <a class="fr-lm" href="${TOUR}" target="_blank" rel="noopener"><strong>Official tours</strong><span>From the Visitors Center, including the Miller House</span><small>columbus.in.us</small></a>
      <a class="fr-lm" href="/free/#from-the-street"><strong>From the street, free</strong><span>The landmarks you can see from a public sidewalk</span><small>Free in Columbus</small></a>
      <a class="fr-lm" href="/trips/architecture-morning/"><strong>An architecture morning</strong><span>Coffee, four landmarks on foot, then lunch</span><small>Trip idea</small></a>
      <a class="fr-lm" href="/film/"><strong>The film trail</strong><span>The buildings in Columbus (2017)</span><small>Film trail</small></a>
      <a class="fr-lm" href="/explore/?view=map&amp;layers=l"><strong>The map</strong><span>Every landmark, pinned</span><small>Explore</small></a>
      <a class="fr-lm" href="/arts/"><strong>Public art</strong><span>Moore, Tinguely, Chihuly and more</span><small>Arts</small></a>
    </div>
  </section>
</div>
</main>
${footer()}`;
  return page({
    title: 'Architecture in Columbus, Indiana | Heart of Columbus',
    description: 'How Columbus, Indiana came to have buildings by Saarinen, Pei, Venturi and more, its National Historic Landmarks, and how to see them, each fact with its source.',
    body, scripts: ['site.js'], styles, assets,
  });
}

function artsPage({ assets }) {
  const work = (w) => `<li class="gd-work">
    <strong>${w.landmark ? `<a href="/l/${w.landmark}/">${t(w.title)}</a>` : t(w.title)}</strong>
    <span>${esc(w.artist)}, ${w.year}</span>
    <small>${svg('pin', 'ic-sm')} ${esc(w.where)}</small>
    ${w.line ? `<p>${t(w.line)} ${src(w.lineSource)}</p>` : ''}
  </li>`;
  const body = `
${header('visit')}
<main id="main">
${hero({
  kicker: 'Arts', h1a: 'Art on the', h1b: 'sidewalks of Columbus.',
  lede: 'A Henry Moore arch at the library, a Tinguely machine in The Commons, two Chihulys, and a design exhibition that takes over downtown every other year.',
  note: 'Every work here is on public ground or in a public building. Titles, artists and years come from Wikipedia’s list of public art in the county.',
  jump: [...ART.map((g) => [`#${g.id}`, g.title]), ['#exhibit-columbus', 'Exhibit Columbus']],
})}
<div class="wrap fr-list">
  ${ART.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h">
    <h2 id="${g.id}-h">${esc(g.title)}</h2>
    <ul class="gd-works">${g.items.map(work).join('')}</ul>
  </section>`).join('')}
  <p class="fine">Works and places from ${src(ART[0].items[0].source)}, checked ${ART[0].items[0].checked}. Some pieces move or come down; check before you make a trip for one.</p>
  <section class="vs-sec" id="exhibit-columbus">
    <span class="vs-emoji" aria-hidden="true">🏗️</span>
    <div>
      <h2>${esc(EXHIBIT.name)}</h2>
      ${facts(EXHIBIT.facts)}
      <p class="btns"><a class="btn btn-sm" href="${EXHIBIT.url}" target="_blank" rel="noopener">exhibitcolumbus.org ${svg('arrow', 'ic-sm')}</a></p>
    </div>
  </section>
  <section class="fr-group" aria-labelledby="also-h">
    <h2 id="also-h">Also</h2>
    <div class="fr-street">
      <a class="fr-lm" href="/free/#zinn"><strong>David Zinn’s chalk art</strong><span>A free search and find guide at the Visitors Center</span><small>Free in Columbus</small></a>
      <a class="fr-lm" href="/architecture/"><strong>The architecture</strong><span>The buildings around the art</span><small>Architecture</small></a>
      <a class="fr-lm" href="/explore/?view=map&amp;layers=l"><strong>The map</strong><span>Landmarks, pinned</span><small>Explore</small></a>
    </div>
  </section>
</div>
</main>
${footer()}`;
  return page({
    title: 'Public art in Columbus, Indiana | Heart of Columbus',
    description: 'Public art you can go and see in Columbus, Indiana, from Henry Moore’s Large Arch to Chihuly and Tinguely, plus Exhibit Columbus, each with its source.',
    body, scripts: ['site.js'], styles, assets,
  });
}

function cumminsPage({ assets }) {
  const C = CUMMINS;
  const body = `
${header('visit')}
<main id="main">
${hero({
  kicker: 'Cummins', h1a: 'The engine company', h1b: 'Columbus runs on.',
  lede: 'Founded here in 1919, still headquartered downtown, and the reason a small Indiana city has buildings by Saarinen and Pei.',
  note: 'Heart of Columbus is not affiliated with Cummins. Every line links to its source, and figures say which year they are for.',
  jump: [['#numbers', 'By the numbers'], ['#timeline', 'Timeline'], ['#people', 'People'], ['#downtown', 'Downtown']],
})}
<div class="wrap fr-list">
  <section class="fr-group">${facts(C.intro, 'gd-facts')}</section>
  <section class="fr-group" id="numbers" aria-labelledby="numbers-h">
    <h2 id="numbers-h">By the numbers</h2>
    <div class="gd-nums">${C.numbers.map((n) => `<div class="gd-num"><strong>${esc(n.value)}</strong><span>${esc(n.label)}</span></div>`).join('')}</div>
    <p class="fine">Figures from ${src(C.numbers[0].source)}, checked ${C.numbers[0].checked}.</p>
    <p class="btns"><a class="btn btn-sm" href="/markets/#board-h">Today’s delayed CMI quote ${svg('arrow', 'ic-sm')}</a></p>
  </section>
  <section class="fr-group" id="timeline" aria-labelledby="timeline-h">
    <h2 id="timeline-h">Timeline</h2>
    <ol class="gd-tl">${C.timeline.map((e) => `<li><span class="gd-yr">${e.year}</span><p>${t(e.text)} ${src(e.source)}</p></li>`).join('')}</ol>
  </section>
  <section class="fr-group" id="people" aria-labelledby="people-h">
    <h2 id="people-h">People</h2>
    ${facts(C.people, 'gd-facts')}
  </section>
  <section class="vs-sec" id="downtown">
    <span class="vs-emoji" aria-hidden="true">🏢</span>
    <div>
      <h2>${esc(C.hq.name)}</h2>
      <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(C.hq.address)}</p>
      ${facts(C.downtown)}
      <p class="btns"><a class="btn btn-sm btn-ghost" href="/architecture/">What the foundation paid for</a><a class="btn btn-sm btn-ghost" href="/arts/#indoors">Exploded Engine and other art</a><a class="btn btn-sm btn-ghost" href="${C.site}" target="_blank" rel="noopener">cummins.com</a></p>
    </div>
  </section>
</div>
</main>
${footer()}`;
  return page({
    title: 'Cummins and Columbus, Indiana | Heart of Columbus',
    description: 'Cummins, founded in Columbus, Indiana in 1919: a sourced timeline, the numbers, the people, and its headquarters downtown.',
    body, scripts: ['site.js'], styles, assets,
  });
}

export const guidePages = (ctx) => [
  { path: 'architecture/index.html', html: architecturePage(ctx) },
  { path: 'arts/index.html', html: artsPage(ctx) },
  { path: 'cummins/index.html', html: cumminsPage(ctx) },
];

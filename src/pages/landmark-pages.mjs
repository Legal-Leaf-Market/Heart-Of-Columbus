// One page per architecture landmark (/l/<slug>/): the photo and its credit,
// a few sourced facts, and the independents a short walk away. Walking times
// are straight-line estimates at about 80 m a minute, and say so.
import { page, esc, t } from '../layout.mjs';
import { header, footer, rail, svg, breadcrumbs } from '../site.mjs';
import { directory, km } from '../data/directory.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';
import { landmarkLd, ORIGIN } from '../jsonld.mjs';
import { filmBySlug } from '../data/film.mjs';
import { PAGES as ES, FACTS, REVIEW_NOTE, esDate } from '../i18n/es.mjs';

const styles = ['hoc.css'];
const M_PER_MIN = 80;
export const walkMin = (d) => Math.max(1, Math.round((d * 1000) / M_PER_MIN));
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

// Places of one kind within `min` minutes on foot, nearest first.
// Measured from l.walkFrom when the landmark sets one.
const origin = (l) => (l.walkFrom ? l.walkFrom.ll : l.ll);
export function within(l, min, pick) {
  const o = origin(l);
  if (!o) return [];
  return directory
    .filter((b) => b.ll && pick(b))
    .map((b) => [km(o, b.ll), b])
    .filter(([d]) => walkMin(d) <= min)
    .sort((a, b) => a[0] - b[0])
    .map(([, b]) => b);
}

const EN = {
  kicker: 'Landmark', crumb: 'Architecture', photo: 'Photo', source: 'Source', designed: 'Designed by', year: 'Year', where: 'Where', seeing: 'Seeing it',
  street: 'You can see it from the street, free.', tour: 'Only on the official tour.', indoors: 'Indoors; check before you go.',
  officialTour: 'Official tour', tours: 'Architecture tours', save: 'Save',
  facts: (src, ll, d) => `Facts from ${src}${ll ? `; map point from ${ll}` : ''}. Checked ${d}. Heart of Columbus is not the visitors bureau.`,
  measured: (label) => `Measured from ${label}. `,
  walkNote: (m) => `Walking times below are straight-line estimates at about ${m} meters a minute. Streets add a little.`,
  walk: (n) => `About ${n} min walk (estimate)`, km: (n) => `About ${n} km away`,
  coffee: 'Coffee within a 5-minute walk', food: 'Restaurants within a 10-minute walk', shops: 'Shops within a 10-minute walk', nearest: 'Closest independents',
  kCoffee: 'Close by', kFood: 'Eat nearby', kShops: 'On the way', kNearest: 'A short drive',
  more: 'More landmarks', mapTitle: (n) => `Map of ${n}`,
  description: (n, a, y) => `${n} (${a}, ${y}) in Columbus, Indiana, and the independent businesses a short walk away.`,
  walkFrom: {},
};

function landmarkPage(l, { assets }, lang = 'en') {
  const es = lang === 'es', L = es ? ES.landmark : EN, pre = es ? '/es' : '';
  const say = (x) => (es ? FACTS[x] || x : x);
  const arch = es ? l.architect.replace(/ and /g, ' y ') : l.architect;
  const p = l.photo;
  const o = origin(l);
  const walk = (b) => L.walk(walkMin(km(o, b.ll)));
  const coffee = within(l, 5, (b) => b.cat === 'coffee-sweets');
  const food = within(l, 10, (b) => b.cat === 'restaurants');
  const shops = within(l, 10, (b) => b.cat === 'shopping' && b.sub !== 'smoke');
  const nearest = o && !coffee.length && !food.length && !shops.length
    ? directory.filter((b) => b.ll).map((b) => [km(o, b.ll), b]).sort((a, b) => a[0] - b[0]).slice(0, 12).map(([, b]) => b)
    : [];
  const map = l.ll ? `https://www.google.com/maps?q=${l.ll[0]},${l.ll[1]}&z=16&output=embed` : '';
  const others = LANDMARKS.filter((x) => x.slug !== l.slug);
  const r = { seeAll: es ? ES.seeAll : 'See all' };
  const body = `
${header('', { lang, alt: es ? `/l/${l.slug}/` : `/es/l/${l.slug}/` })}
<main id="main">
<section class="area-hero lm-hero">
  <img src="${p.src}" alt="${esc(l.name)}" style="object-position:${p.pos}">
  <span class="area-shade"></span>
  <div class="wrap area-hero-txt">
    ${breadcrumbs([['/', es ? 'Inicio' : 'Home'], [es ? '/#architecture' : '/architecture/', L.crumb], ['', l.name]])}
    <p class="kicker kicker-light">${esc(L.kicker)}</p>
    <h1>${t(l.name)}</h1>
    <p>${esc(arch)}, ${l.year}</p>
    <small class="credit">${L.photo}: ${esc(p.credit)}, ${esc(p.license)}. <a href="${p.page}" target="_blank" rel="noopener">${L.source}</a></small>
  </div>
</section>
${es ? `<p class="wrap vs-note vs-review lm-review">${esc(REVIEW_NOTE)}</p>` : ''}
<section class="wrap lm-info">
  <div class="lm-facts">
    <p class="lm-what">${t(say(l.what))}</p>
    ${filmBySlug[l.slug] ? `<p class="lm-film">🎬 <a href="${pre}/film/">${es ? ES.film.seen : 'Seen in the film Columbus (2017)'}</a></p>` : ''}
    <dl>
      <div><dt>${L.designed}</dt><dd>${esc(arch)}</dd></div>
      <div><dt>${L.year}</dt><dd>${l.year}</dd></div>
      <div><dt>${L.where}</dt><dd>${esc(l.address)}, Columbus</dd></div>
      <div><dt>${L.seeing}</dt><dd>${l.street ? L.street : l.tour ? L.tour : L.indoors}</dd></div>
    </dl>
    <p class="btns">${l.tour ? `<a class="btn btn-sm" href="${l.tour}" target="_blank" rel="noopener">${L.officialTour} ${svg('arrow', 'ic-sm')}</a>` : ''}<a class="btn btn-sm btn-ghost" href="${pre}/visit/#tours">${L.tours}</a><button type="button" class="btn btn-sm btn-ghost" data-save="l:${l.slug}" aria-pressed="false">${svg('heart', 'ic-sm')} <span data-save-label>${L.save}</span></button></p>
    <p class="fine">${L.facts(`<a href="${esc(l.source)}" target="_blank" rel="noopener">${esc(host(l.source))}</a>`, l.ll ? esc(l.llSource) : '', esc(es ? esDate(l.checked) : l.checked))}</p>
  </div>
  ${map ? `<div class="side-card lm-map"><iframe title="${esc(L.mapTitle(l.name))}" loading="lazy" src="${map}" referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : ''}
</section>
${o ? `<p class="wrap lm-walk muted">${l.walkFrom ? L.measured(esc(L.walkFrom[l.walkFrom.label] || l.walkFrom.label)) : ''}${L.walkNote(M_PER_MIN)}</p>` : ''}
${rail(L.coffee, '/c/coffee-sweets/', coffee, { kicker: L.kCoffee, note: walk, ...r })}
${rail(L.food, '/c/restaurants/', food, { kicker: L.kFood, note: walk, ...r })}
${rail(L.shops, '/c/shopping/', shops, { kicker: L.kShops, note: walk, ...r })}
${rail(L.nearest, '', nearest, { kicker: L.kNearest, note: (b) => L.km(km(o, b.ll).toFixed(1)), ...r })}
<section class="wrap more-cats"><h2>${L.more}</h2>
  <div class="mini-cats">${others.map((x) => `<a href="${pre}/l/${x.slug}/">${svg('pin', 'ic-sm')} ${esc(x.name)}</a>`).join('')}</div>
</section>
</main>
${footer({ lang })}`;
  return page({
    title: `${l.name} | ${es ? 'Arquitectura de Columbus, Indiana' : 'Columbus, Indiana architecture'}`,
    description: L.description(l.name, arch, l.year), lang,
    alternates: [['en', `${ORIGIN}/l/${l.slug}/`], ['es', `${ORIGIN}/es/l/${l.slug}/`]],
    body, scripts: ['site.js', 'hub.js'], styles, assets, ld: es ? [] : [landmarkLd(l)],
  });
}

export const landmarkPages = (ctx) => LANDMARKS.flatMap((l) => [
  { path: `l/${l.slug}/index.html`, html: landmarkPage(l, ctx) },
  { path: `es/l/${l.slug}/index.html`, html: landmarkPage(l, ctx, 'es') },
]);

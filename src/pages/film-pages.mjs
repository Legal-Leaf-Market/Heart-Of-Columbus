// The "Columbus" (2017) film trail (/film/ and /es/film/): landmarks a cited
// source places in the film, from src/data/film.mjs, laid out with the
// landmark's own photo and facts.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { landmarkBySlug } from '../data/landmarks.mjs';
import { FILM, FILM_STOPS } from '../data/film.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAGES, FACTS, REVIEW_NOTE } from '../i18n/es.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;

const EN = {
  title: 'The Columbus film trail | Heart of Columbus',
  description: 'The Columbus, Indiana landmarks that appear in the film Columbus (2017), each with its source.',
  kicker: 'Film trail', h1a: 'The trail of', h1b: 'Columbus (2017)',
  lede: 'The buildings from the film that you can go and see for yourself, landmarks and public places only, each with the source that places it in the film.',
  note: 'We only list places a cited source confirms. Private offices and businesses seen in the film are left out.',
  stops: 'Stops', guide: 'Free guide at the Visitors Center', map: 'See them on the map', building: 'About the building',
};

function filmPage({ assets }, lang = 'en') {
  const es = lang === 'es', L = es ? PAGES.film : EN, pre = es ? '/es' : '';
  const say = (x) => (es ? FACTS[x] || x : x);
  const stops = FILM_STOPS.map((s) => ({ ...s, l: landmarkBySlug[s.landmark] }));
  const body = `
${header('visit', { lang, alt: es ? '/film/' : '/es/film/' })}
<main id="main">
${breadcrumbs([['/', es ? 'Inicio' : 'Home'], [`${pre}/visit/`, es ? 'Planee su visita' : 'Plan your visit'], ['', L.kicker]])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(L.kicker)}</p>
    <h1>${esc(L.h1a)}<br><span class="hl">${esc(L.h1b)}</span></h1>
    <p class="lede">${esc(L.lede)}</p>
    <ul class="vs-facts film-facts">${FILM.facts.map((f) => `<li>${t(say(f.text))} ${src(f.source)}</li>`).join('')}</ul>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(L.note)}</span></p>
    ${es ? `<p class="vs-note vs-review">${esc(REVIEW_NOTE)}</p>` : ''}
    <p class="btns"><a class="btn btn-sm" href="${FILM.guide}" target="_blank" rel="noopener">${esc(L.guide)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/explore/?view=map&amp;layers=l">${esc(L.map)}</a></p>
  </div>
</section>
<section class="wrap film-list" aria-label="${esc(L.stops)}">
  ${stops.map((s, i) => `<article class="film-stop">
    <a class="film-photo" href="${pre}/l/${s.l.slug}/"><img src="${s.l.photo.src}" alt="${esc(s.l.name)}" loading="lazy" style="object-position:${s.l.photo.pos}"><span class="film-n">${i + 1}</span></a>
    <div>
      <h2><a href="${pre}/l/${s.l.slug}/">${t(s.l.name)}</a></h2>
      <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(s.l.address)}</p>
      <p>${t(say(s.line))} ${src(s.source)}</p>
      <small class="credit">${es ? 'Foto' : 'Photo'}: ${esc(s.l.photo.credit)}, ${esc(s.l.photo.license)}</small>
    </div>
  </article>`).join('')}
</section>
</main>
${footer({ lang })}`;
  return page({
    title: L.title, description: L.description, lang,
    alternates: [['en', `${ORIGIN}/film/`], ['es', `${ORIGIN}/es/film/`]],
    body, scripts: ['site.js'], styles, assets,
  });
}

export const filmPages = (ctx) => [
  { path: 'film/index.html', html: filmPage(ctx) },
  { path: 'es/film/index.html', html: filmPage(ctx, 'es') },
];

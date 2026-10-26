// The skate park page (/skate/ and /es/skate/): the Jolie Crider Memorial
// Skatepark 2.0, its layout, its history and the people a source names in it,
// from src/data/skate.mjs, laid out like the /visit/ cards.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { SKATE } from '../data/skate.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAGES, FACTS, REVIEW_NOTE } from '../i18n/es.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');

const EN = {
  title: 'The Columbus skate park | Heart of Columbus',
  description: 'The Jolie Crider Memorial Skatepark 2.0 in Clifty Park, Columbus, Indiana: hours, rules, what’s in it and how it got built, each fact with its source.',
  kicker: 'Skate park', h1a: 'Jolie Crider', h1b: 'Memorial Skatepark 2.0',
  lede: 'Columbus has a concrete skate park in Clifty Park, designed by a Finnish skater turned architect and built by a skater owned crew from Bloomington. Here is where it is, what’s in it and how it got here.',
  note: 'Heart of Columbus is not the parks department. Each fact links to where we found it. Rules and hours come from the city’s page, so check it before you go.',
  titles: { 'the-park': 'The park', 'whats-in-it': 'What’s in it', history: 'How it got here', skaters: 'Columbus skaters' },
  kickers: { 'the-park': 'Before you go', 'whats-in-it': 'The layout', history: '1999 to now', skaters: 'The people' },
  skatersNote: 'We have not yet found a public source naming a Columbus skater who went pro or built a career in skating. We add people here only once a source does, so nobody’s story is guessed at.',
  official: 'The city’s page', directions: 'Directions', more: 'Visit Columbus Indiana on the park',
};

function skatePage({ assets }, lang = 'en') {
  const es = lang === 'es', L = es ? PAGES.skate : EN, pre = es ? '/es' : '';
  const say = (x) => (es ? FACTS[x] || x : x);
  const facts = (list) => `<ul class="vs-facts">${list
    .map((x) => `<li>${t(say(x.text))} <a class="vs-src" href="${esc(x.source)}" target="_blank" rel="noopener"${es ? ' hreflang="en"' : ''}>${esc(host(x.source))}</a></li>`)
    .join('')}</ul>`;
  const jump = SKATE.sections.map((s) => `<a class="pill" href="#${s.id}">${esc(L.titles[s.id])}</a>`).join('');
  const body = `
${header('visit', { lang, alt: es ? '/skate/' : '/es/skate/' })}
<main id="main">
${breadcrumbs([['/', es ? 'Inicio' : 'Home'], [`${pre}/visit/`, es ? 'Planee su visita' : 'Plan your visit'], ['', L.kicker]])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(L.kicker)}</p>
    <h1>${esc(L.h1a)}<br><span class="hl">${esc(L.h1b)}</span></h1>
    <p class="lede">${t(L.lede)}</p>
    <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(SKATE.address)}</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(L.note)}</span></p>
    ${es ? `<p class="vs-note vs-review">${esc(REVIEW_NOTE)}</p>` : ''}
    <p class="btns"><a class="btn btn-sm" href="${esc(SKATE.official)}" target="_blank" rel="noopener">${esc(L.official)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${esc(SKATE.directions)}" target="_blank" rel="noopener">${esc(L.directions)}</a></p>
    <nav class="chips vs-jump" aria-label="${es ? 'En esta página' : 'On this page'}">${jump}</nav>
  </div>
</section>
<div class="wrap vs-list">
${SKATE.sections.map((s) => `
<section class="vs-sec" id="${s.id}" aria-labelledby="${s.id}-h">
  <span class="vs-emoji" aria-hidden="true">${s.emoji}</span>
  <div><p class="kicker">${esc(L.kickers[s.id])}</p><h2 id="${s.id}-h">${esc(L.titles[s.id])}</h2>
  ${facts(s.facts)}
  ${s.id === 'skaters' ? `<p class="vs-note">${svg('globe', 'ic-sm')}<span>${t(L.skatersNote)}</span></p>` : ''}
  ${s.id === 'history' ? `<p class="btns"><a class="btn btn-sm btn-ghost" href="${esc(SKATE.more)}" target="_blank" rel="noopener">${esc(L.more)} ${svg('arrow', 'ic-sm')}</a></p>` : ''}
  </div>
</section>`).join('')}
</div>
</main>
${footer({ lang })}`;
  return page({
    title: L.title, description: L.description, lang,
    alternates: [['en', `${ORIGIN}/skate/`], ['es', `${ORIGIN}/es/skate/`]],
    body, scripts: ['site.js'], styles, assets,
  });
}

export const skatePages = (ctx) => [
  { path: 'skate/index.html', html: skatePage(ctx) },
  { path: 'es/skate/index.html', html: skatePage(ctx, 'es') },
];

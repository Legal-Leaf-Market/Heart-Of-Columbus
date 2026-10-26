// "Free in Columbus" (/free/): things that cost nothing, each with the page
// that says so (src/data/free.mjs), plus the landmarks you can see from the
// street (src/data/landmarks.mjs). This file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { FREE } from '../data/free.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAGES, FACTS, REVIEW_NOTE } from '../i18n/es.mjs';

const ES = PAGES;

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;

const EN = {
  title: 'Free in Columbus | Heart of Columbus',
  description: 'Free things to do in Columbus, Indiana: an indoor playground, the I. M. Pei library, Mill Race Park, the People Trail, a free city bus and architecture from the street, each with its source.',
  kicker: 'Free in Columbus', h1a: 'Columbus for', h1b: 'nothing at all.',
  lede: (n) => `A playground out of the rain, a library by I. M. Pei, a park on the river, a free bus, and ${n} landmarks you can see from the sidewalk.`,
  note: 'Each item links to the page that says it’s free. Things change, so check before you go.',
  street: 'From the street', streetTitle: 'Architecture from the street',
  streetLead: 'You don’t need a ticket to look. These are on public streets; the official tours from the Visitors Center go inside some of them.',
  map: 'See them on the map', morning: 'An architecture morning', building: 'About the building', listing: 'Its listing here',
  foot: 'Looking for cheap eats? We don’t sort places by price, because the public listings we use don’t include one. Heart of Columbus is not the visitors bureau and is not affiliated with these places.',
  groups: {}, names: {},
};

function freePage({ assets }, lang = 'en') {
  const es = lang === 'es', L = es ? ES.free : EN, pre = es ? '/es' : '';
  const say = (x) => (es ? FACTS[x] || x : x);
  const item = (i) => `
<article class="vs-sec fr-item" id="${i.slug}">
  <span class="vs-emoji" aria-hidden="true">${i.emoji}</span>
  <div>
    <h3>${t(L.names[i.slug] || i.name)}</h3>
    ${i.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(i.address)}</p>` : ''}
    <ul class="vs-facts"><li>${t(say(i.what))} ${src(i.source)}</li>${(i.more || []).map(([m, u]) => `<li>${t(say(m))} ${src(u)}</li>`).join('')}</ul>
    ${i.landmark || i.business ? `<p class="btns">${i.landmark ? `<a class="btn btn-sm btn-ghost" href="${pre}/l/${i.landmark}/">${L.building}</a>` : ''}${i.business ? `<a class="btn btn-sm btn-ghost" href="/b/${i.business}/">${L.listing}</a>` : ''}</p>` : ''}
  </div>
</article>`;
  const street = LANDMARKS.filter((l) => l.street);
  const note = (l) => { const n = l.note || `${l.architect}, ${l.year}`; return es ? FACTS[n] || n.replace(/ and /g, ' y ') : n; };
  const body = `
${header('visit', { lang, alt: es ? '/free/' : '/es/free/' })}
<main id="main">
${breadcrumbs([['/', es ? 'Inicio' : 'Home'], [`${pre}/visit/`, es ? 'Planee su visita' : 'Plan your visit'], ['', L.kicker]])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(L.kicker)}</p>
    <h1>${esc(L.h1a)}<br><span class="hl">${esc(L.h1b)}</span></h1>
    <p class="lede">${esc(L.lede(street.length))}</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${esc(L.note)}</span></p>
    ${es ? `<p class="vs-note vs-review">${esc(REVIEW_NOTE)}</p>` : ''}
    <nav class="chips vs-jump" aria-label="${es ? 'En esta página' : 'On this page'}">${FREE.map((g) => `<a class="pill" href="#${g.id}">${esc(L.groups[g.id] || g.title)}</a>`).join('')}<a class="pill" href="#from-the-street">${esc(L.street)}</a></nav>
  </div>
</section>
<div class="wrap fr-list">
${FREE.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h"><h2 id="${g.id}-h">${esc(L.groups[g.id] || g.title)}</h2>${g.items.map(item).join('')}</section>`).join('')}
<section class="fr-group" id="from-the-street" aria-labelledby="from-the-street-h">
  <h2 id="from-the-street-h">${esc(L.streetTitle)}</h2>
  <p class="vs-lead">${esc(L.streetLead)}</p>
  <div class="fr-street">${street.map((l) => `<a class="fr-lm" href="${pre}/l/${l.slug}/"><strong>${t(l.name)}</strong><span>${esc(note(l))}</span><small>${esc(l.address)}</small></a>`).join('')}</div>
  <p class="btns"><a class="btn btn-sm" href="/explore/?view=map&amp;layers=l">${esc(L.map)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${pre}/trips/architecture-morning/">${esc(L.morning)}</a></p>
</section>
<p class="fine fr-foot">${esc(L.foot)}</p>
</div>
</main>
${footer({ lang })}`;
  return page({
    title: L.title, description: L.description, lang,
    alternates: [['en', `${ORIGIN}/free/`], ['es', `${ORIGIN}/es/free/`]],
    body, scripts: ['site.js'], styles, assets,
  });
}

export const freePages = (ctx) => [
  { path: 'free/index.html', html: freePage(ctx) },
  { path: 'es/free/index.html', html: freePage(ctx, 'es') },
];

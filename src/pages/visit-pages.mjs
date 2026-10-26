// "Plan your visit" (/visit/, and /es/visit/ in Spanish): the Visitors
// Center, tours, getting here and around, and the Social District. Facts come
// from src/data/visit.mjs, each with its source; Spanish strings and fact
// translations from src/i18n/es.mjs. This file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, tel, rail, breadcrumbs } from '../site.mjs';
import { directory } from '../data/directory.mjs';
import { eventsSection } from './events.mjs';
import { yourWay } from './trip-pages.mjs';
import { spotlightSection } from './spotlight.mjs';
import { eventLd, ORIGIN } from '../jsonld.mjs';
import { EVENTS } from '../data/events.mjs';
import { VISITORS_CENTER, TOURS, GETTING_HERE, GETTING_AROUND, SOCIAL_DISTRICT, SRC } from '../data/visit.mjs';
import { VISIT as ES, FACTS as ES_FACTS, REVIEW_NOTE, esDate } from '../i18n/es.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const checkedOn = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const EN = {
  title: 'Plan your visit | Heart of Columbus',
  description: 'Visiting Columbus, Indiana: the Visitors Center, architecture tours, getting here and around, and the downtown Social District, with a source for every fact.',
  kicker: 'Plan your visit',
  h1a: 'Coming to Columbus?', h1b: 'Start here.',
  lede: 'Where to start, how to see the architecture, how to get here and get around, and the downtown Social District. Then find the independent places to eat, shop and stay busy on the rest of this site.',
  note: (official, date) => `Heart of Columbus is not the visitors bureau. For official tours, events and visitor information, go to <a href="${official}" target="_blank" rel="noopener">Visit Columbus Indiana</a>. Each fact below links to where we found it, checked ${date}.`,
  jump: { 'visitors-center': 'Visitors Center', tours: 'Architecture tours', 'getting-here': 'Getting here', 'getting-around': 'Getting around', 'social-district': 'Social District', 'call-ahead': 'Call ahead', 'your-way': 'Trip ideas', 'whats-on': 'What’s on', '/free/': 'Free in Columbus', '/holidays/': 'Holiday shopping' },
  vc: { kicker: 'Start here', name: VISITORS_CENTER.name, downtown: 'downtown', hours: 'Hours and holiday hours', listing: 'Its listing here' },
  tours: { kicker: 'Architecture', title: 'See the buildings', lead: 'Columbus is known for modern architecture. The Visitors Center runs the official guided tours.', btn: 'Tour times, prices and tickets', near: 'Downtown places nearby' },
  here: { kicker: 'Getting here', title: 'By car and by air', btn: 'Full directions' },
  around: { kicker: 'Getting around', title: 'Bus, trail and on foot', routes: 'Bus routes', trails: 'Parks and trails', map: 'Our map', near: 'Open near me now' },
  dora: { kicker: 'Downtown evenings', name: SOCIAL_DISTRICT.name, lead: 'The city runs a designated outdoor refreshment area downtown, so you can walk between places with a drink.', city: 'The city’s page', maps: SOCIAL_DISTRICT.maps.map(([l]) => l) },
  ahead: { kicker: 'Before you go', title: 'Call ahead', items: [
    'Hours on Heart of Columbus come from each business’s public listing and can change, especially around holidays. A quick call saves a trip.',
    'We are not affiliated with the businesses listed, and nothing here books a table or a tour for you.',
    'Know a detail that’s wrong? Owners can fix their listing from <a href="/owners/">the owners page</a>.',
  ], open: 'See what’s open now', calendar: 'Official events calendar' },
};

// A fact in the page's language; Spanish pages fail the test if one is missing.
const say = (lang, text) => (lang === 'es' ? ES_FACTS[text] || text : text);

function visitPage({ assets }, lang = 'en') {
  const es = lang === 'es', L = es ? ES : EN;
  const vc = VISITORS_CENTER;
  const facts = (list) => `<ul class="vs-facts">${list
    .map((x) => `<li>${t(say(lang, x.text))} <a class="vs-src" href="${esc(x.source)}" target="_blank" rel="noopener"${es ? ' hreflang="en"' : ''}>${esc(host(x.source))}</a></li>`)
    .join('')}</ul>`;
  const section = (id, emoji, kicker, title, inner) => `
<section class="vs-sec" id="${id}" aria-labelledby="${id}-h">
  <span class="vs-emoji" aria-hidden="true">${emoji}</span>
  <div><p class="kicker">${esc(kicker)}</p><h2 id="${id}-h">${esc(title)}</h2>${inner}</div>
</section>`;
  const jump = Object.entries(L.jump).map(([id, l]) => `<a class="pill" href="${id.startsWith('/') ? id : '#' + id}">${esc(l)}</a>`).join('');
  const body = `
${header('visit', { lang, alt: es ? '/visit/' : '/es/visit/' })}
<main id="main">
${es ? breadcrumbs([['/', 'Inicio'], ['', L.kicker]]) : ''}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">${esc(L.kicker)}</p>
    <h1>${esc(L.h1a)}<br><span class="hl">${esc(L.h1b)}</span></h1>
    <p class="lede">${t(L.lede)}</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>${L.note(SRC.official, es ? esDate(vc.checked) : checkedOn(vc.checked))}</span></p>
    ${es ? `<p class="vs-note vs-review">${esc(REVIEW_NOTE)} ${esc(ES.english)}</p>` : ''}
    <nav class="chips vs-jump" aria-label="${es ? 'En esta página' : 'On this page'}">${jump}</nav>
  </div>
</section>
<div class="wrap vs-list">
${section('visitors-center', '🏛️', L.vc.kicker, L.vc.name, `
  <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(vc.address)}, ${esc(L.vc.downtown)} · <a href="${tel(vc.phone)}">${esc(vc.phone)}</a></p>
  ${facts(vc.facts)}
  <p class="btns"><a class="btn btn-sm" href="${SRC.visitors}" target="_blank" rel="noopener">${esc(L.vc.hours)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/b/${vc.slug}/">${esc(L.vc.listing)}</a></p>`)}
${section('tours', '📐', L.tours.kicker, L.tours.title, `
  <p class="vs-lead">${esc(L.tours.lead)}</p>
  ${facts(TOURS.facts)}
  <p class="btns"><a class="btn btn-sm" href="${SRC.tours}" target="_blank" rel="noopener">${esc(L.tours.btn)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/n/downtown/">${esc(L.tours.near)}</a></p>`)}
${section('getting-here', '🚗', L.here.kicker, L.here.title, `
  ${facts(GETTING_HERE.facts)}
  <p class="btns"><a class="btn btn-sm btn-ghost" href="${SRC.gettingHere}" target="_blank" rel="noopener">${esc(L.here.btn)} ${svg('arrow', 'ic-sm')}</a></p>`)}
${section('getting-around', '🚌', L.around.kicker, L.around.title, `
  ${facts(GETTING_AROUND.facts)}
  <p class="btns"><a class="btn btn-sm btn-ghost" href="${SRC.routes}" target="_blank" rel="noopener">${esc(L.around.routes)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${SRC.trails}" target="_blank" rel="noopener">${esc(L.around.trails)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/explore/?view=map">${esc(L.around.map)}</a><a class="btn btn-sm btn-ghost" href="/explore/?view=map&amp;now=1">${esc(L.around.near)}</a></p>`)}
${section('social-district', '🥤', L.dora.kicker, L.dora.name, `
  <p class="vs-lead">${esc(L.dora.lead)}</p>
  ${facts(SOCIAL_DISTRICT.facts)}
  <p class="btns">${SOCIAL_DISTRICT.maps.map(([, u], i) => `<a class="btn btn-sm btn-ghost" href="${u}" target="_blank" rel="noopener">${esc(L.dora.maps[i])} ${svg('arrow', 'ic-sm')}</a>`).join('')}<a class="btn btn-sm btn-ghost" href="${SRC.dora}" target="_blank" rel="noopener">${esc(L.dora.city)}</a></p>`)}
${section('call-ahead', '📞', L.ahead.kicker, L.ahead.title, `
  <ul class="vs-facts">${L.ahead.items.map((x) => `<li>${x}</li>`).join('')}</ul>
  <p class="btns"><a class="btn btn-sm" href="/explore/">${esc(L.ahead.open)} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${SRC.events}" target="_blank" rel="noopener">${esc(L.ahead.calendar)}</a></p>`)}
</div>
${es ? yourWay({ lang: 'es' }) : `${spotlightSection({ kicker: 'While you’re in town', title: 'Three local places we’d send a friend' })}
${yourWay()}
${eventsSection({ mode: 'upcoming', id: 'whats-on', title: 'What’s on', kicker: 'Signature events' })}
${rail('Social District businesses on our list', '/n/downtown/#social-district', directory.filter((b) => b.dora), { kicker: 'Drinks to go downtown, 21 and up' })}`}
</main>
${footer({ lang })}`;
  return page({
    title: L.title, description: L.description, lang,
    alternates: [['en', ORIGIN + '/visit/'], ['es', ORIGIN + '/es/visit/']],
    body, scripts: es ? ['site.js'] : ['site.js', 'hub.js', 'events.js'], styles, assets, ld: es ? [] : EVENTS.map(eventLd),
  });
}

export const visitPages = (ctx) => [
  { path: 'visit/index.html', html: visitPage(ctx) },
  { path: 'es/visit/index.html', html: visitPage(ctx, 'es') },
];

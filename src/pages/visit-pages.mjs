// "Plan your visit" (/visit/): the Visitors Center, tours, getting here and
// around, and the Social District. Facts come from src/data/visit.mjs, each
// with its source; this file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, tel, rail } from '../site.mjs';
import { directory } from '../data/directory.mjs';
import { eventsSection } from './events.mjs';
import { yourWay } from './trip-pages.mjs';
import { VISITORS_CENTER, TOURS, GETTING_HERE, GETTING_AROUND, SOCIAL_DISTRICT, SRC } from '../data/visit.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const checkedOn = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

const facts = (list) => `<ul class="vs-facts">${list
  .map((x) => `<li>${t(x.text)} <a class="vs-src" href="${esc(x.source)}" target="_blank" rel="noopener">${esc(host(x.source))}</a></li>`)
  .join('')}</ul>`;

const section = (id, emoji, kicker, title, inner) => `
<section class="vs-sec" id="${id}" aria-labelledby="${id}-h">
  <span class="vs-emoji" aria-hidden="true">${emoji}</span>
  <div><p class="kicker">${esc(kicker)}</p><h2 id="${id}-h">${esc(title)}</h2>${inner}</div>
</section>`;

const JUMP = [
  ['visitors-center', 'Visitors Center'],
  ['tours', 'Architecture tours'],
  ['getting-here', 'Getting here'],
  ['getting-around', 'Getting around'],
  ['social-district', 'Social District'],
  ['call-ahead', 'Call ahead'],
  ['your-way', 'Trip ideas'],
  ['whats-on', 'What’s on'],
];

function visitPage({ assets }) {
  const vc = VISITORS_CENTER;
  const body = `
${header('visit')}
<main id="main">
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Plan your visit</p>
    <h1>Coming to Columbus?<br><span class="hl">Start here.</span></h1>
    <p class="lede">Where to start, how to see the architecture, how to get here and get around, and the downtown Social District. Then find the independent places to eat, shop and stay busy on the rest of this site.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Heart of Columbus is not the visitors bureau. For official tours, events and visitor information, go to <a href="${SRC.official}" target="_blank" rel="noopener">Visit Columbus Indiana</a>. Each fact below links to where we found it, checked ${checkedOn(vc.checked)}.</span></p>
    <nav class="chips vs-jump" aria-label="On this page">${JUMP.map(([id, l]) => `<a class="pill" href="#${id}">${esc(l)}</a>`).join('')}</nav>
  </div>
</section>
<div class="wrap vs-list">
${section('visitors-center', '🏛️', 'Start here', vc.name, `
  <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(vc.address)}, downtown · <a href="${tel(vc.phone)}">${esc(vc.phone)}</a></p>
  ${facts(vc.facts)}
  <p class="btns"><a class="btn btn-sm" href="${SRC.visitors}" target="_blank" rel="noopener">Hours and holiday hours ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/b/${vc.slug}/">Its listing here</a></p>`)}
${section('tours', '📐', 'Architecture', 'See the buildings', `
  <p class="vs-lead">Columbus is known for modern architecture. The Visitors Center runs the official guided tours.</p>
  ${facts(TOURS.facts)}
  <p class="btns"><a class="btn btn-sm" href="${SRC.tours}" target="_blank" rel="noopener">Tour times, prices and tickets ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/n/downtown/">Downtown places nearby</a></p>`)}
${section('getting-here', '🚗', 'Getting here', 'By car and by air', `
  ${facts(GETTING_HERE.facts)}
  <p class="btns"><a class="btn btn-sm btn-ghost" href="${SRC.gettingHere}" target="_blank" rel="noopener">Full directions ${svg('arrow', 'ic-sm')}</a></p>`)}
${section('getting-around', '🚌', 'Getting around', 'Bus, trail and on foot', `
  ${facts(GETTING_AROUND.facts)}
  <p class="btns"><a class="btn btn-sm btn-ghost" href="${SRC.routes}" target="_blank" rel="noopener">Bus routes ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${SRC.trails}" target="_blank" rel="noopener">Parks and trails ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/explore/?view=map">Our map</a></p>`)}
${section('social-district', '🥤', 'Downtown evenings', SOCIAL_DISTRICT.name, `
  <p class="vs-lead">The city runs a designated outdoor refreshment area downtown, so you can walk between places with a drink.</p>
  ${facts(SOCIAL_DISTRICT.facts)}
  <p class="btns">${SOCIAL_DISTRICT.maps.map(([l, u]) => `<a class="btn btn-sm btn-ghost" href="${u}" target="_blank" rel="noopener">${esc(l)} ${svg('arrow', 'ic-sm')}</a>`).join('')}<a class="btn btn-sm btn-ghost" href="${SRC.dora}" target="_blank" rel="noopener">The city’s page</a></p>`)}
${section('call-ahead', '📞', 'Before you go', 'Call ahead', `
  <ul class="vs-facts">
    <li>Hours on Heart of Columbus come from each business’s public listing and can change, especially around holidays. A quick call saves a trip.</li>
    <li>We are not affiliated with the businesses listed, and nothing here books a table or a tour for you.</li>
    <li>Know a detail that’s wrong? Owners can fix their listing from <a href="/owners/">the owners page</a>.</li>
  </ul>
  <p class="btns"><a class="btn btn-sm" href="/explore/">See what’s open now ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="${SRC.events}" target="_blank" rel="noopener">Official events calendar</a></p>`)}
</div>
${yourWay()}
${eventsSection({ mode: 'upcoming', id: 'whats-on', title: 'What’s on', kicker: 'Signature events' })}
${rail('Social District businesses on our list', '/n/downtown/#social-district', directory.filter((b) => b.dora), { kicker: 'Drinks to go downtown, 21 and up' })}
</main>
${footer()}`;
  return page({
    title: 'Plan your visit | Heart of Columbus',
    description: 'Visiting Columbus, Indiana: the Visitors Center, architecture tours, getting here and around, and the downtown Social District, with a source for every fact.',
    body, scripts: ['site.js', 'hub.js', 'events.js'], styles, assets,
  });
}

export const visitPages = (ctx) => [{ path: 'visit/index.html', html: visitPage(ctx) }];

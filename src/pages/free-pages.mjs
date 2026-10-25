// "Free in Columbus" (/free/): things that cost nothing, each with the page
// that says so (src/data/free.mjs), plus the landmarks you can see from the
// street (src/data/landmarks.mjs). This file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { FREE } from '../data/free.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;

const item = (i) => `
<article class="vs-sec fr-item" id="${i.slug}">
  <span class="vs-emoji" aria-hidden="true">${i.emoji}</span>
  <div>
    <h3>${t(i.name)}</h3>
    ${i.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(i.address)}</p>` : ''}
    <ul class="vs-facts"><li>${t(i.what)} ${src(i.source)}</li>${(i.more || []).map(([m, u]) => `<li>${t(m)} ${src(u)}</li>`).join('')}</ul>
    ${i.landmark || i.business ? `<p class="btns">${i.landmark ? `<a class="btn btn-sm btn-ghost" href="/l/${i.landmark}/">About the building</a>` : ''}${i.business ? `<a class="btn btn-sm btn-ghost" href="/b/${i.business}/">Its listing here</a>` : ''}</p>` : ''}
  </div>
</article>`;

function freePage({ assets }) {
  const street = LANDMARKS.filter((l) => l.street);
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Free in Columbus']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Free in Columbus</p>
    <h1>Columbus for<br><span class="hl">nothing at all.</span></h1>
    <p class="lede">A playground out of the rain, a library by I. M. Pei, a park on the river, a free bus, and ${street.length} landmarks you can see from the sidewalk.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Each item links to the page that says it’s free. Things change, so check before you go.</span></p>
    <nav class="chips vs-jump" aria-label="On this page">${FREE.map((g) => `<a class="pill" href="#${g.id}">${esc(g.title)}</a>`).join('')}<a class="pill" href="#from-the-street">From the street</a></nav>
  </div>
</section>
<div class="wrap fr-list">
${FREE.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h"><h2 id="${g.id}-h">${esc(g.title)}</h2>${g.items.map(item).join('')}</section>`).join('')}
<section class="fr-group" id="from-the-street" aria-labelledby="from-the-street-h">
  <h2 id="from-the-street-h">Architecture from the street</h2>
  <p class="vs-lead">You don’t need a ticket to look. These are on public streets; the official tours from the Visitors Center go inside some of them.</p>
  <div class="fr-street">${street.map((l) => `<a class="fr-lm" href="/l/${l.slug}/"><strong>${t(l.name)}</strong><span>${esc(l.note || `${l.architect}, ${l.year}`)}</span><small>${esc(l.address)}</small></a>`).join('')}</div>
  <p class="btns"><a class="btn btn-sm" href="/explore/?view=map&amp;layers=l">See them on the map ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/trips/architecture-morning/">An architecture morning</a></p>
</section>
<p class="fine fr-foot">Looking for cheap eats? We don’t sort places by price, because the public listings we use don’t include one. Heart of Columbus is not the visitors bureau and is not affiliated with these places.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Free in Columbus | Heart of Columbus',
    description: 'Free things to do in Columbus, Indiana: an indoor playground, the I. M. Pei library, Mill Race Park, the People Trail, a free city bus and architecture from the street, each with its source.',
    body, scripts: ['site.js'], styles, assets,
  });
}

export const freePages = (ctx) => [{ path: 'free/index.html', html: freePage(ctx) }];

// "Columbus DJs" (/djs/): DJs for weddings, parties and events, each with the
// page that says what they do (src/data/djs.mjs), plus any other DJ already in
// the directory. This file only lays them out.
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { DJS, DJ_ITEMS } from '../data/djs.mjs';
import { directory } from '../data/directory.mjs';

const styles = ['hoc.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const tel = (p) => `tel:+1${p.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')}`;

// Other DJs the directory already lists that this page doesn't cover by hand.
const listed = new Set(DJ_ITEMS.map((i) => i.listing).filter(Boolean));
export const OTHER_DJS = directory.filter((b) => b.cat === 'events' && /\bD\.?J\b|disc jockey/i.test(`${b.name} ${b.type}`) && !listed.has(b.slug));

function djPage({ assets }) {
  const item = (i, big) => `
<article class="vs-sec fr-item${big ? ' dj-feature' : ''}" id="${i.slug}">
  <span class="vs-emoji" aria-hidden="true">${i.emoji}</span>
  <div>
    ${big ? '<p class="kicker">Featured DJ</p>' : ''}
    <h3>${t(i.name)}</h3>
    ${i.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(i.address)}</p>` : ''}
    <ul class="vs-facts"><li>${t(i.what)} ${src(i.source)}</li>${(i.more || []).map(([m, u]) => `<li>${t(m)} ${src(u)}</li>`).join('')}</ul>
    <p class="btns">${i.book ? `<a class="btn btn-sm" href="${esc(i.book)}" target="_blank" rel="noopener">Check dates ${svg('arrow', 'ic-sm')}</a>` : ''}${i.website ? `<a class="btn btn-sm${i.book ? ' btn-ghost' : ''}" href="${esc(i.website)}" target="_blank" rel="noopener">Website</a>` : ''}${i.phone ? `<a class="btn btn-sm btn-ghost" href="${tel(i.phone)}">${svg('phone', 'ic-sm')}${esc(i.phone)}</a>` : ''}${i.listing ? `<a class="btn btn-sm btn-ghost" href="/b/${i.listing}/">Its listing here</a>` : ''}</p>
  </div>
</article>`;
  const group = (g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h"><h2 id="${g.id}-h">${esc(g.title)}</h2>${g.lead ? `<p class="vs-lead">${esc(g.lead)}</p>` : ''}${g.items.map((i) => item(i, g.id === 'featured')).join('')}</section>`;
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/c/events/', 'Events & Weddings'], ['', 'Columbus DJs']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Columbus DJs</p>
    <h1>Who’s playing<br><span class="hl">your party.</span></h1>
    <p class="lede">Wedding DJs, MCs, karaoke hosts and party DJs who work in and around Columbus, Indiana, starting with our featured DJ.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Each line links to the page it comes from. We book nothing here: you reach each DJ directly. Heart of Columbus is not affiliated with these DJs.</span></p>
    <nav class="chips vs-jump" aria-label="On this page">${DJS.map((g) => `<a class="pill" href="#${g.id}">${esc(g.title)}</a>`).join('')}${OTHER_DJS.length ? '<a class="pill" href="#more">More in the directory</a>' : ''}</nav>
  </div>
</section>
<div class="wrap fr-list">
${DJS.map(group).join('')}
${OTHER_DJS.length ? `<section class="fr-group" id="more" aria-labelledby="more-h"><h2 id="more-h">More DJs in the directory</h2><div class="fr-street">${OTHER_DJS.map((b) => `<a class="fr-lm" href="/b/${b.slug}/"><strong>${t(b.name)}</strong><span>${esc(b.type)}</span>${b.address ? `<small>${esc(b.address)}</small>` : ''}</a>`).join('')}</div></section>` : ''}
<section class="vs-sec" id="get-listed"><span class="vs-emoji" aria-hidden="true">📣</span><div><h3>Spin in Columbus?</h3><p>Club, lounge and party DJs belong here too. Send us your page and we’ll add you, with only what you tell us.</p><p class="btns"><a class="btn btn-sm" href="/owners/">Get listed ${svg('arrow', 'ic-sm')}</a></p></div></section>
<p class="fine fr-foot">Details come from each DJ’s own page, the Columbus Area Chamber of Commerce and the visitors bureau’s planner list, checked on the dates in our source file. Call ahead to confirm.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Columbus DJs | Heart of Columbus',
    description: 'Wedding, party and event DJs in Columbus, Indiana, led by Crossroads Wedding Co., each with its source.',
    body, scripts: ['site.js'], styles, assets,
  });
}

export const djPages = (ctx) => [{ path: 'djs/index.html', html: djPage(ctx) }];

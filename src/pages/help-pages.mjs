// Get help in Columbus (/help/): one page with every resource, a printable
// wallet card with a QR code back to it (/help/card/), and the stories that
// go with it (/help/<slug>/). Facts live in src/data/help.mjs and
// src/data/help-stories.mjs; this file only lays them out. The QR code is
// drawn at build time so the card prints with no network.
import QRCode from 'qrcode';
import { page, esc, t } from '../layout.mjs';
import { header, footer, svg, tel, breadcrumbs } from '../site.mjs';
import { HELP, FIRST, MEALS, CHECKED, HELP_SRC, helpItems } from '../data/help.mjs';
import { STORIES, SOURCE_NAMES } from '../data/help-stories.mjs';
import { ORIGIN } from '../jsonld.mjs';

const styles = ['hoc.css'];
const HELP_URL = `${ORIGIN}/help/`;
const qrSvg = await QRCode.toString(HELP_URL, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#1b1a17', light: '#ffffff' } });
const qr = (cls) => qrSvg.replace('<svg ', `<svg class="${cls}" role="img" aria-label="QR code for ${esc(HELP_URL.replace(/^https:\/\//, ''))}" `);

const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const ext = (label, u) => `<a class="btn btn-sm btn-ghost" href="${esc(u)}" target="_blank" rel="noopener">${t(label)} ${svg('arrow', 'ic-sm')}</a>`;
const call = (label, n) => `<a class="btn btn-sm hp-call" href="${tel(n)}">${svg('phone', 'ic-sm')}<span>${t(label)}</span> <b>${esc(n)}</b></a>`;
const nice = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
// tel() assumes a 10 digit number; 211, 911 and 988 dial as they are.
const dial = (n) => (/^\d{3}$/.test(n) ? `tel:${n}` : tel(n));

const firstCalls = () => `<ul class="hp-first">${FIRST.map((f) => `<li><a href="${dial(f.number)}"><small>${t(f.label)}</small><b>${esc(f.number)}</b><span>${t(f.note)}</span></a></li>`).join('')}</ul>`;

const item = (i) => {
  const words = [i.name, i.what, i.address, ...(i.list || [])].join(' ').toLowerCase();
  return `
<article class="vs-sec hp-item" id="${i.slug}" data-help-item data-words="${esc(words)}">
  <div>
    <h3>${t(i.name)}${i.form ? ' <span class="hp-tag">Apply online</span>' : ''}</h3>
    ${i.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}<a href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(i.address + (i.address.includes('Hope') ? ', IN' : ', Columbus, IN'))}" target="_blank" rel="noopener">${esc(i.address)}</a></p>` : ''}
    <p class="hp-what">${t(i.what)} ${src(i.source)}</p>
    ${i.hours ? `<p class="hp-hours">${t(i.hours)}</p>` : ''}
    ${i.list ? `<ul class="hp-list">${i.list.map((l) => `<li>${t(l).replace(/(\d{3}-\d{3}-\d{4})/, (n) => `<a href="${tel(n)}">${n}</a>`)}</li>`).join('')}</ul>` : ''}
    ${(i.more || []).length ? `<ul class="vs-facts">${i.more.map(([m, u]) => `<li>${t(m)} ${src(u)}</li>`).join('')}</ul>` : ''}
    ${i.phones || i.text || i.links || i.jump ? `<p class="btns">${(i.phones || []).map(([l, n]) => (/^\d{3}$/.test(n) ? `<a class="btn btn-sm hp-call" href="tel:${n}">${svg('phone', 'ic-sm')}<span>${t(l)}</span> <b>${n}</b></a>` : call(l, n))).join('')}${i.text ? `<a class="btn btn-sm btn-ghost" href="sms:${i.text[1].replace(/\D/g, '')}">${t(i.text[0])} <b>${esc(i.text[1])}</b></a>` : ''}${(i.links || []).map(([l, u]) => ext(l, u)).join('')}${i.jump ? `<a class="btn btn-sm btn-ghost" href="#${i.jump}">See below</a>` : ''}</p>` : ''}
  </div>
</article>`;
};

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const meals = () => `
<section class="fr-group" id="meals" aria-labelledby="meals-h">
  <h2 id="meals-h">Free hot meals, by day</h2>
  <p class="vs-lead">Open to anyone who comes, no questions asked. From United Way’s guide, updated May 2026. ${src(HELP_SRC.guide)}</p>
  <div class="hp-meals">${days.map((d) => `<div class="hp-day" data-day="${days.indexOf(d)}"><h3>${d}</h3><ul>${MEALS.filter((m) => m[0] === d).map(([, where, when]) => `<li><strong>${t(when)}</strong><span>${t(where)}</span></li>`).join('')}</ul></div>`).join('')}</div>
</section>`;

const cardBlock = () => `
<section class="hp-share" id="card" aria-labelledby="card-h">
  <div>
    <h2 id="card-h">Pass it on</h2>
    <p>Print a sheet of wallet cards with this page’s QR code and the numbers that matter most tonight. Keep a stack in the car. The next time you hand somebody a few dollars at the gas station, hand them a card too.</p>
    <p class="btns"><a class="btn" href="/help/card/">Print wallet cards ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost" href="/help/qr.svg" download="heart-of-columbus-help-qr.svg">Download the QR code</a><button class="btn btn-ghost" type="button" data-help-share hidden>${svg('share', 'ic-sm')} Share this page</button></p>
  </div>
  ${qr('hp-qr')}
</section>`;

function helpPage({ assets }) {
  const n = helpItems.length;
  const body = `
${header('', {})}
<main id="main">
${breadcrumbs([['/', 'Home'], ['', 'Get help']])}
<section class="order-hero vs-hero hp-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Get help in Columbus</p>
    <h1>Help is here.<br><span class="hl">All of it, on one page.</span></h1>
    <p class="lede">Shelter, food, rent and utilities, health care, recovery, jobs, legal help and ID in Columbus and Bartholomew County. ${n} places to call, with the online applications where there are any.</p>
    ${firstCalls()}
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Every entry links to where we found it. Hours and programs change, so call first. Checked ${esc(nice(CHECKED))}. Heart of Columbus is not one of these agencies and is not affiliated with them. <a href="${esc(HELP_SRC.guideEs)}" target="_blank" rel="noopener" lang="es">Guía de recursos en español</a>.</span></p>
    <form class="hp-find" role="search" data-help-find onsubmit="return false">
      ${svg('search')}
      <input type="search" name="q" autocomplete="off" placeholder="What do you need? Food, rent, ID, a doctor…" aria-label="Search the resources on this page">
      <output data-help-count aria-live="polite"></output>
    </form>
    <nav class="chips vs-jump" aria-label="On this page">${HELP.map((g) => `<a class="pill" href="#${g.id}">${g.emoji} ${esc(g.title)}</a>`).join('')}<a class="pill" href="#meals">🍲 Hot meals by day</a><a class="pill" href="#read">📰 Read</a></nav>
  </div>
</section>
<div class="wrap fr-list">
${HELP.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h" data-help-group><h2 id="${g.id}-h"><span aria-hidden="true">${g.emoji}</span> ${esc(g.title)}</h2>${g.lead ? `<p class="vs-lead">${t(g.lead)}</p>` : ''}${g.items.map(item).join('')}</section>`).join('')}
<p class="hp-none" data-help-none hidden>Nothing on this page matches that. Call 211, any hour, and they will look it up with you.</p>
${meals()}
${cardBlock()}
<section class="fr-group" id="read" aria-labelledby="read-h">
  <h2 id="read-h">Read</h2>
  <div class="yw-grid">${STORIES.map((s) => `<a class="yw-card" href="/help/${s.slug}/"><span class="yw-day">${esc(s.kicker)}${s.draft ? ' · Draft' : ''}</span><strong>${t(s.title)}</strong><span>${t(s.dek)}</span></a>`).join('')}</div>
</section>
<p class="fine fr-foot">This page lists public services and nonprofits as their own guides and websites describe them; listing is not a referral or an endorsement. Most numbers come from United Way of Bartholomew County’s “United We Help” guide. Something wrong or missing? United Way’s searchable directory is at <a href="${HELP_SRC.unitedWeHelp}" target="_blank" rel="noopener">unitedwehelp.org</a>.</p>
</div>
</main>
${footer({})}`;
  return page({
    title: 'Get help in Columbus | Heart of Columbus',
    description: 'One page with every resource in Columbus, Indiana: shelter, food, rent and utility help, health care, recovery, jobs, legal help and ID, with phone numbers, hours and links to the applications.',
    body, scripts: ['help.js'], styles, assets,
  });
}

// One wallet card, 3.5 by 2 inches. The sheet prints ten.
const card = () => `
<div class="hc-card">
  <div class="hc-left">
    ${qr('hc-qr')}
    <p>Every resource in Columbus, on one page</p>
  </div>
  <div class="hc-right">
    <p class="hc-title">Need help? <b>Call 211</b></p>
    <ul>
      <li><span>Crisis</span><b>988</b></li>
      <li><span>Shelter, adults</span><b>812-344-4512</b></li>
      <li><span>Shelter, families</span><b>812-799-1062</b></li>
      <li><span>Domestic violence</span><b>800-221-6311</b></li>
      <li><span>Food</span><b>292 Center St</b></li>
    </ul>
    <p class="hc-foot">Text your ZIP to 898-211 · Emergency 911</p>
  </div>
</div>`;

function cardPage({ assets }) {
  const body = `
${header('', {})}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/help/', 'Get help'], ['', 'Wallet cards']])}
<section class="wrap hc-intro">
  <p class="kicker kicker-pill">Wallet cards</p>
  <h1>Print a sheet. Hand them out.</h1>
  <p class="lede">Ten business card size cards per letter page, each with a QR code to <a href="/help/">${esc(HELP_URL.replace(/^https:\/\//, ''))}</a>. Print at 100% scale (not “fit to page”) on card stock, then cut on the lines.</p>
  <p class="btns"><button class="btn" type="button" onclick="window.print()">Print the sheet</button><a class="btn btn-ghost" href="/help/qr.svg" download="heart-of-columbus-help-qr.svg">Download the QR code</a><a class="btn btn-ghost" href="/help/">Back to the resources</a></p>
  <p class="fine">Numbers on the card come from the resource page, where each one links to its source. Shelter lines start with a phone assessment; Love Chapel’s pantry at 292 Center Street is open Monday to Saturday, 9 to 11:45 AM.</p>
</section>
<div class="hc-sheet">${Array.from({ length: 10 }, card).join('')}</div>
</main>
${footer({})}`;
  return page({
    title: 'Help wallet cards | Heart of Columbus',
    description: 'A printable sheet of wallet cards with a QR code to every resource in Columbus, Indiana, and the numbers that matter most tonight.',
    body, scripts: [], styles, assets,
  });
}

function storyPage({ assets }, s) {
  const used = [...new Set(s.body.flatMap((b) => b.src || []))];
  const cite = (u) => `<a class="hp-cite" href="#src-${used.indexOf(u) + 1}" aria-label="Source ${used.indexOf(u) + 1}">${used.indexOf(u) + 1}</a>`;
  const others = STORIES.filter((o) => o.slug !== s.slug);
  const body = `
${header('', {})}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/help/', 'Get help'], ['', s.title]])}
<article class="wrap hs">
  <header class="hs-head">
    <p class="kicker">${esc(s.kicker)}</p>
    <h1>${t(s.title)}</h1>
    <p class="hs-dek">${t(s.dek)}</p>
    <p class="hs-by">By ${esc(s.byline)} · ${esc(nice(s.date))}</p>
    ${s.draft ? `<p class="vs-note vs-review">${t(s.draft)}</p>` : ''}
  </header>
  <div class="hs-body">
    ${s.body.map((b) => (b.h ? `<h2>${t(b.h)}</h2>` : `<p>${t(b.p)}${(b.src || []).length ? `<sup>${b.src.map(cite).join(' ')}</sup>` : ''}</p>`)).join('\n    ')}
  </div>
  <aside class="hs-help">
    <p><strong>Need help now?</strong> Call 211, any hour. Every resource in Columbus is on one page.</p>
    <p class="btns"><a class="btn btn-sm" href="/help/">Get help in Columbus ${svg('arrow', 'ic-sm')}</a><a class="btn btn-sm btn-ghost" href="/help/card/">Print wallet cards</a></p>
  </aside>
  ${used.length ? `<section class="hs-sources" aria-labelledby="src-h"><h2 id="src-h">Sources</h2><ol>${used.map((u, i) => `<li id="src-${i + 1}"><a href="${esc(u)}" target="_blank" rel="noopener">${t(SOURCE_NAMES[u] || host(u))}</a></li>`).join('')}</ol></section>` : ''}
  <nav class="hs-more" aria-label="More to read"><h2>More to read</h2><div class="yw-grid">${others.map((o) => `<a class="yw-card" href="/help/${o.slug}/"><span class="yw-day">${esc(o.kicker)}${o.draft ? ' · Draft' : ''}</span><strong>${t(o.title)}</strong><span>${t(o.dek)}</span></a>`).join('')}</div></nav>
</article>
</main>
${footer({})}`;
  return page({ title: `${s.title} | Heart of Columbus`, description: s.dek, body, scripts: [], styles, assets });
}

export const helpPages = (ctx) => [
  { path: 'help/index.html', html: helpPage(ctx) },
  { path: 'help/card/index.html', html: cardPage(ctx) },
  { path: 'help/qr.svg', html: qrSvg },
  ...STORIES.map((s) => ({ path: `help/${s.slug}/index.html`, html: storyPage(ctx, s) })),
];

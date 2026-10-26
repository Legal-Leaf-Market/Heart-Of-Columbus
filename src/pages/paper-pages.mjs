// The newspaper sections: Markets (/markets/) and Obituaries (/obituaries/,
// plus the private review page /obituaries/review/?k=). Data lives in
// src/data/markets.mjs and src/data/obituaries.mjs; this file lays it out.
// Both pages print cleanly (public/css/paper.css) so the same content can go
// on paper.
import { page, esc, t } from '../layout.mjs';
import { header, svg, tel } from '../site.mjs';
import { newsPage } from '../news/frame.mjs';
import { COMPANIES, QUOTE_SOURCE, REFRESH_MINUTES } from '../data/markets.mjs';
import { FUNERAL_HOMES, PUBLISHED } from '../data/obituaries.mjs';
import { LIMITS } from '../../netlify/functions/obituary.mjs';

const styles = ['hoc.css', 'paper.css'];
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const ext = (u, label) => `<a href="${esc(u)}" target="_blank" rel="noopener">${label}</a>`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${dd}, ${y}`; };
const attribution = `Data provided by <a href="${QUOTE_SOURCE.url}" target="_blank" rel="noopener">${QUOTE_SOURCE.name}</a>`;

function marketsPage({ assets }) {
  const row = (c) => `
<tr data-sym="${c.symbol}"${c.local ? ' class="mk-local"' : ''}>
  <th scope="row"><strong>${t(c.name)}</strong><small>${t(c.what)} ${src(c.source)}</small></th>
  <td class="mk-sym">${c.symbol}</td>
  <td class="mk-num" data-price>…</td>
  <td class="mk-num" data-change></td>
</tr>`;
  const body = `
<section class="order-hero pp-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Markets</p>
    <h1>Indiana companies,<br><span class="hl">on one board.</span></h1>
    <p class="lede">Cummins started in Columbus and is still headquartered here. Next to it, public companies headquartered elsewhere in Indiana, with delayed quotes.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Quotes are delayed and refresh about every ${REFRESH_MINUTES} minutes; they can be older. Not investment advice. Heart of Columbus is not affiliated with these companies.</span></p>
  </div>
</section>
<div class="wrap pp-body">
  <section class="pp-sec" aria-labelledby="board-h">
    <div class="pp-head"><h2 id="board-h">Indiana board</h2><p class="pp-asof" data-mk-status>Loading quotes…</p></div>
    <div class="mk-wrap"><table class="mk">
      <thead><tr><th scope="col">Company</th><th scope="col">Symbol</th><th scope="col" class="mk-num">Last</th><th scope="col" class="mk-num">Change</th></tr></thead>
      <tbody>${COMPANIES.map(row).join('')}</tbody>
    </table></div>
    <p class="pp-attr">${attribution}. Prices in US dollars. Change is from the previous close.</p>
    <p class="btns pp-tools"><button type="button" class="btn btn-sm btn-ghost" data-print>Print this board</button></p>
  </section>
  <p class="fine">Which companies are here: Cummins because it is a Columbus company, and the others because each one says on its own site that it is headquartered in Indiana (Old National, that it was founded in Evansville). Each line links to that site.</p>
</div>`;
  return newsPage({ assets, path: '/markets/', title: 'Markets', description: 'Delayed stock quotes for Cummins and other Indiana companies, with the source on the page.', crumbs: [['/news/', 'News'], ['', 'Markets']], body, scripts: ['markets.js'], styles: ['paper.css'] });
}

// A notice laid out the same way online and in print. Every word in it is
// the family's; we only arrange the fields they sent.
const noticeHtml = (n) => {
  const paras = (s) => s.split(/\n\s*\n/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('');
  const life = [n.born && longDate(n.born), longDate(n.died)].filter(Boolean).join(' to ');
  return `
<article class="ob-notice" id="${esc(n.slug)}">
  <h3>${esc(n.name)}${n.known ? ` <span class="ob-known">(${esc(n.known)})</span>` : ''}</h3>
  <p class="ob-life">${esc(life)}${n.town ? ` · ${esc(n.town)}` : ''}</p>
  <div class="ob-text">${paras(n.text)}</div>
  ${n.services ? `<h4>Services</h4><div class="ob-text">${paras(n.services)}</div>` : ''}
  ${n.memorials ? `<h4>Memorials</h4><div class="ob-text">${paras(n.memorials)}</div>` : ''}
  ${n.home ? `<p class="ob-home">Arrangements: ${esc(n.home)}</p>` : ''}
</article>`;
};

function obituariesPage({ assets }) {
  const home = (h) => `
<article class="ob-fh">
  <h3>${t(h.name)}</h3>
  <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(h.address)}, Columbus</p>
  <p class="btns">
    ${h.obits ? `<a class="btn btn-sm" href="${esc(h.obits)}" target="_blank" rel="noopener">Their obituaries ${svg('arrow', 'ic-sm')}</a>` : ''}
    ${h.phone ? `<a class="btn btn-sm btn-ghost" href="${tel(h.phone)}">${svg('phone', 'ic-sm')}${esc(h.phone)}</a>` : ''}
    ${h.slug ? `<a class="btn btn-sm btn-ghost" href="/b/${h.slug}/">Its listing here</a>` : ''}
  </p>
  <p class="fine">Source: ${src(h.source)}</p>
</article>`;
  const body = `
<section class="order-hero pp-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Obituaries</p>
    <h1>Remembering<br><span class="hl">our neighbors.</span></h1>
    <p class="lede">Families can send an obituary here at no charge. We carry only what a family sends and confirms. We never write one, and we never copy one from anywhere else.</p>
    <nav class="chips vs-jump" aria-label="On this page"><a class="pill" href="#published">Published here</a><a class="pill" href="#funeral-homes">Funeral homes</a><a class="pill" href="#send">Send an obituary</a></nav>
  </div>
</section>
<div class="wrap pp-body">
  <section class="pp-sec" id="published" aria-labelledby="published-h">
    <h2 id="published-h">Published here</h2>
    ${PUBLISHED.length ? `<div class="ob-list">${PUBLISHED.map(noticeHtml).join('')}</div>` : '<p class="vs-lead">Nothing yet. Until families start sending them, recent obituaries are on the funeral homes’ own pages, just below.</p>'}
  </section>
  <section class="pp-sec" id="funeral-homes" aria-labelledby="fh-h">
    <h2 id="fh-h">Funeral homes in Columbus</h2>
    <p class="vs-lead">Each one posts the obituaries it handles. Heart of Columbus is not affiliated with them.</p>
    <div class="ob-fhs">${FUNERAL_HOMES.map(home).join('')}</div>
  </section>
  <section class="pp-sec" id="send" aria-labelledby="send-h">
    <h2 id="send-h">Send an obituary</h2>
    <ol class="ob-how">
      <li><b>You send it</b> here, in your own words. Your funeral home can send it for you, too.</li>
      <li><b>A person calls or emails you</b> to confirm, and checks with the funeral home.</li>
      <li><b>Only then is it published</b>, laid out so it prints cleanly. Ask any time to change it or take it down.</li>
    </ol>
    <div class="ob-grid">
      <form class="ow-form pk-card" data-obit novalidate>
        <fieldset><legend>About them</legend>
          <label>Full name<input name="name" required maxlength="120" autocomplete="off"></label>
          <div class="ow-two"><label>Known as <span class="muted">optional</span><input name="known" maxlength="60" autocomplete="off"></label><label>Hometown <span class="muted">optional</span><input name="town" maxlength="80" placeholder="Columbus" autocomplete="off"></label></div>
          <div class="ow-two"><label>Date of birth <span class="muted">optional</span><input name="born" type="date"></label><label>Date of death<input name="died" type="date" required></label></div>
        </fieldset>
        <label>The obituary <span class="muted">in your words, up to about 800 words</span><textarea name="text" rows="10" maxlength="${LIMITS.text}" required></textarea></label>
        <label>Services <span class="muted">visitation, funeral, burial: where and when</span><textarea name="services" rows="3" maxlength="${LIMITS.services}"></textarea></label>
        <label>Memorials <span class="muted">where gifts may go, optional</span><textarea name="memorials" rows="2" maxlength="${LIMITS.memorials}"></textarea></label>
        <label>Funeral home<select name="home"><option value="">None or not yet</option>${FUNERAL_HOMES.map((h) => `<option>${esc(h.name)}</option>`).join('')}<option value="other">Somewhere else</option></select></label>
        <label data-home-other hidden>Which one?<input name="homeOther" maxlength="120" autocomplete="off"></label>
        <fieldset><legend>About you <span class="muted">never published</span></legend>
          <div class="ow-two"><label>Your name<input name="fromName" autocomplete="name" required maxlength="80"></label><label>Your relationship<input name="relation" maxlength="60" placeholder="Daughter, funeral director…"></label></div>
          <div class="ow-two"><label>Phone<input name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="30"></label><label>Email<input name="email" type="email" autocomplete="email" maxlength="120"></label></div>
        </fieldset>
        <label class="ow-check"><input type="checkbox" name="consent"> I am family, or I speak for the family, and this is our own text to share.</label>
        <label class="ow-hp" aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label>
        <p class="ow-err" data-err role="alert" hidden></p>
        <button class="btn">Send for review ${svg('arrow', 'ic-sm')}</button>
        <p class="fine">Photos: once we confirm, we will ask you for one by email. Nothing you send is published until you and the funeral home have said yes.</p>
      </form>
      <aside class="ob-preview" aria-label="Preview">
        <p class="kicker">How it will look</p>
        <div data-preview><p class="muted">Start typing and a preview appears here, set the way it would print.</p></div>
      </aside>
    </div>
  </section>
</div>`;
  return newsPage({ assets, path: '/obituaries/', title: 'Obituaries', description: 'Obituaries for Columbus, Indiana: send one in your own words at no charge, or find recent ones at local funeral homes.', crumbs: [['/news/', 'News'], ['', 'Obituaries']], body, scripts: ['obituaries.js'], styles: ['paper.css'] });
}

function reviewPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap pk ob-review" data-obit-review>
  <p class="kicker kicker-pill">Obituaries</p>
  <h1 class="pk-h">Submissions to review</h1>
  <p class="muted" data-review-status>Loading…</p>
  <p class="btns pp-tools"><button type="button" class="btn btn-sm btn-ghost" data-print>Print all</button></p>
  <div class="ob-list" data-review-out></div>
</main>`;
  return page({ title: 'Obituary review | Heart of Columbus', description: 'Private.', body, scripts: ['obituaries.js'], styles, assets });
}

export const paperPages = (ctx) => [
  { path: 'markets/index.html', html: marketsPage(ctx) },
  { path: 'obituaries/index.html', html: obituariesPage(ctx) },
  { path: 'obituaries/review/index.html', html: reviewPage(ctx) },
];

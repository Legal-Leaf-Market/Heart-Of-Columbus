// "Farm country" (/agriculture/): 4-H, the county fair, local growers, the
// people planting things in town, and this week's grain prices, all from
// src/data/agriculture.mjs. This file only lays them out. The grain panel
// prints on its own page so it can be clipped like the old paper's markets box.
import { esc, t } from '../layout.mjs';
import { svg, tel } from '../site.mjs';
import { AG, GRAIN } from '../data/agriculture.mjs';
import { directory } from '../data/directory.mjs';
import { newsPage } from '../news/frame.mjs';
import { storiesIn } from '../news/content.mjs';
import { storyList } from '../news/render.mjs';

const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const src = (u) => `<a class="vs-src" href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a>`;
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
const longDate = (s) => new Date(s + 'T12:00:00Z').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const usd = (n) => '$' + n.toFixed(2);

export const agBusinesses = () => AG.flatMap((g) => g.businesses || []).map((s) => bySlug[s]).filter((b) => b && !b.tempClosed);

const item = (i) => `
<article class="vs-sec fr-item" id="${i.slug}">
  <div>
    <h3>${t(i.name)}</h3>
    ${i.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(i.address)}${i.phone ? ` · <a href="${tel(i.phone)}">${esc(i.phone)}</a>` : ''}</p>` : ''}
    <ul class="vs-facts"><li>${t(i.what)} ${src(i.source)}</li>${(i.more || []).map(([m, u]) => `<li>${t(m)} ${src(u)}</li>`).join('')}</ul>
    ${i.link ? `<p class="btns"><a class="btn btn-sm" href="${esc(i.link[0])}" target="_blank" rel="noopener">${t(i.link[1])} ${svg('arrow', 'ic-sm')}</a></p>` : ''}
  </div>
</article>`;

function grainPanel() {
  const row = (c) => {
    const pct = ((c.avg - c.yearAgo) / c.yearAgo) * 100;
    return `<tr><th scope="row"><span aria-hidden="true">${c.emoji}</span> ${esc(c.crop)}<small>${esc(c.grade)}, ${esc(c.delivery)}</small></th>
      <td class="ag-num"><strong>${usd(c.avg)}</strong></td><td class="ag-num">${usd(c.low)} to ${usd(c.high)}</td>
      <td class="ag-num">${usd(c.yearAgo)} <span class="ag-chg ${pct >= 0 ? 'ag-up' : 'ag-dn'}">${pct >= 0 ? 'up' : 'down'} ${Math.abs(pct).toFixed(0)}%</span></td></tr>`;
  };
  return `
<section class="ag-grain" id="grain" aria-labelledby="grain-h">
  <div class="ag-grain-head">
    <div>
      <p class="kicker">Markets</p>
      <h2 id="grain-h">Grain prices</h2>
      <p class="vs-lead">Cash bids per bushel at ${esc(GRAIN.region)}, as of <strong>${esc(longDate(GRAIN.asOf))}</strong>.</p>
    </div>
    <button type="button" class="btn btn-sm btn-ghost ag-print-btn" data-print>Print this box</button>
  </div>
  <div class="ag-table-wrap"><table class="ag-table">
    <thead><tr><th scope="col">Crop</th><th scope="col">Average</th><th scope="col">Range</th><th scope="col">A year ago</th></tr></thead>
    <tbody>${GRAIN.cash.map(row).join('')}</tbody>
  </table></div>
  <p class="ag-futures"><strong>Chicago futures at the close:</strong> ${GRAIN.futures.map((f) => `${esc(f.crop.toLowerCase())} ${usd(f.cents / 100)} (${esc(f.month)})`).join(', ')}.</p>
  <p class="fine">From the ${esc(GRAIN.report)} report. ${src(GRAIN.source)} Bids change every day and differ from one elevator to the next, so call yours before you haul. This is not a bid or advice.</p>
</section>`;
}

function agPage({ assets }) {
  const biz = agBusinesses();
  const stories = storiesIn('agriculture');
  const group = (g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h">
  <h2 id="${g.id}-h"><span aria-hidden="true">${g.emoji}</span> ${esc(g.title)}</h2>
  <p class="vs-lead">${t(g.lead)}</p>
  ${g.items.map(item).join('')}
  ${g.businesses ? `<ul class="hol-list">${biz.map((b) => `<li><a class="hol-name" href="/b/${b.slug}/">${t(b.name)}</a><span>${esc(b.type)}${b.address ? ` · ${esc(b.address)}` : ''}</span></li>`).join('')}</ul>` : ''}
</section>`;
  const body = `
<section class="order-hero vs-hero ag-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Farm country</p>
    <h1>Columbus grows<br><span class="hl">more than engines.</span></h1>
    <p class="lede">Bartholomew County is farm country the minute you leave town. Here is 4-H, the county fair, where to buy from local growers, the people planting things in town, and this week’s grain prices.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Every line links to where it came from. Heart of Columbus is not affiliated with Purdue Extension, the fair board or the USDA.</span></p>
    <nav class="chips vs-jump" aria-label="On this page"><a class="pill" href="#grain">Grain prices</a>${AG.map((g) => `<a class="pill" href="#${g.id}">${esc(g.title)}</a>`).join('')}</nav>
  </div>
</section>
<div class="wrap fr-list">
${grainPanel()}
${AG.map(group).join('')}
${stories.length ? `<section class="fr-group" id="news" aria-labelledby="news-h"><h2 id="news-h">Farm news</h2>${storyList(stories)}</section>` : ''}
<p class="fine fr-foot">Know a farm, a co-op, a 4-H club or a farm stand we should add? Owners can claim a listing on the <a href="/owners/">owners page</a>.</p>
</div>
`;
  return newsPage({
    assets, path: '/agriculture/', title: 'Farm country',
    description: 'Agriculture around Columbus, Indiana: Bartholomew County 4-H, the county fair, the farmers market, local growers and this week’s Indiana grain prices from the USDA, each with its source.',
    crumbs: [['/news/', 'News'], ['', 'Farm country']], body,
  });
}

export const agriculturePages = (ctx) => [{ path: 'agriculture/index.html', html: agPage(ctx) }];

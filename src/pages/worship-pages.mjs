// "Places of worship" (/worship/): every congregation in and around Columbus,
// of every faith, grouped by faith. The rows come from src/data/worship.mjs
// (scripts/import-worship.mjs: Google Maps, OpenStreetMap and the IRS exempt
// organizations list). This file only lays them out. Service times are never
// typed here: they change, so each row sends you to the congregation.
import { page, esc } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { WORSHIP, FAITH_NAMES } from '../data/worship.mjs';

const styles = ['hoc.css'];
// Listed names sometimes carry " - "; the paper prints no dashes.
const clean = (s) => String(s || '').replace(/\s+[-–—]\s+/g, ', ');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'website'; } };

// Faith families in the order a visitor scans for them; "Other Christian" and
// "Other faiths" last.
const ORDER = ['catholic', 'orthodox', 'episcopal', 'lutheran', 'methodist', 'presbyterian', 'baptist', 'pentecostal', 'nazarene',
  'christian-church', 'adventist', 'lds', 'jw', 'quaker', 'unitarian', 'islam', 'judaism', 'hinduism', 'buddhism', 'sikh', 'bahai', 'christian', 'other'];

export function worshipGroups(rows = WORSHIP) {
  return ORDER.map((id) => ({ id, name: FAITH_NAMES[id], rows: rows.filter((r) => r.faith === id) })).filter((g) => g.rows.length);
}

const confirmed = (r) => r.sources.some((s) => s.name === 'Google Maps');

function item(r) {
  const map = r.ll ? `https://www.google.com/maps/search/?api=1&query=${r.ll[0]},${r.ll[1]}` : '';
  return `
<article class="vs-sec wp-item" id="${esc(r.slug)}">
  <div>
    <h3>${esc(clean(r.name))}</h3>
    <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(r.address || r.town)}${r.address ? '' : ' <span class="muted">(street address not confirmed yet)</span>'}</p>
    ${r.phone ? `<p class="muted">${esc(r.phone)}</p>` : ''}
    <p class="btns">${r.website ? `<a class="btn btn-sm" href="${esc(r.website)}" target="_blank" rel="noopener">Service times on ${esc(host(r.website))}</a>` : ''}${map ? `<a class="btn btn-sm btn-ghost" href="${esc(map)}" target="_blank" rel="noopener">Map</a>` : ''}</p>
    <p class="fine">From ${r.sources.map((s) => `<a class="vs-src" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>, ${esc(s.checked)}`).join('; ')}${confirmed(r) ? '' : '. Not yet confirmed on Google Maps.'}</p>
  </div>
</article>`;
}

function worshipPage({ assets }) {
  const groups = worshipGroups();
  const faiths = groups.length;
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Places of worship']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Places of worship</p>
    <h1>Worship in<br><span class="hl">Columbus.</span></h1>
    <p class="lede">${WORSHIP.length} congregations in and around Columbus, Hope, Taylorsville and Elizabethtown, across ${faiths} faith traditions. Visiting for a weekend? Here is where to go to services.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Service times change, especially around holidays, so we don't print them: check the congregation's own website or call before you go.</span></p>
    <nav class="chips vs-jump" aria-label="Faiths on this page">${groups.map((g) => `<a class="pill" href="#${g.id}">${esc(g.name)} <span class="muted">${g.rows.length}</span></a>`).join('')}</nav>
  </div>
</section>
<div class="wrap fr-list">
${groups.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h"><h2 id="${g.id}-h">${esc(g.name)}</h2>${g.rows.map(item).join('')}</section>`).join('\n')}
<section class="fr-group" id="missing">
  <h2>Is a congregation missing or wrong?</h2>
  <p>This list is built from public records: OpenStreetMap, the IRS list of tax exempt organizations, and Google Maps. Some small or new congregations aren't in any of them yet, and a few old chapels in the records may no longer hold services. <a href="/owners/#claim">Send us a correction</a> and a person will check it.</p>
</section>
<p class="fine fr-foot">Map data © OpenStreetMap contributors. Heart of Columbus is not affiliated with any congregation listed here.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Places of worship in Columbus, Indiana | Heart of Columbus',
    description: `${WORSHIP.length} churches and places of worship in Columbus, Indiana and nearby towns, every faith, with addresses and links to each congregation's own service times.`,
    body, scripts: ['site.js'], styles, assets, path: '/worship/',
  });
}

// What the header search reads (/data/worship.json): just enough to find a
// congregation by name, faith or town and send the reader to its row here.
export const worshipIndex = () => ({
  faiths: Object.fromEntries(worshipGroups().map((g) => [g.id, g.name])),
  rows: WORSHIP.map((r) => ({ s: r.slug, n: clean(r.name), f: r.faith, t: r.town, ...(r.address ? { a: r.address } : {}) })),
});

export const worshipPages = (ctx) => [{ path: 'worship/index.html', html: worshipPage(ctx) }];

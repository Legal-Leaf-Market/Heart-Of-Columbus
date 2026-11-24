// "Apartments and landlords" (/housing/): where to rent in and around
// Columbus. The places come from src/data/housing.mjs (Google Maps and
// OpenStreetMap, scripts/import-housing.mjs) and the property managers from
// the directory. The ways to find a place reuse the help center's sourced
// entries (src/data/help.mjs). This file only lays them out. Rents and
// availability are never typed here: they change daily.
import { page, esc } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { HOUSING, HOUSING_KINDS } from '../data/housing.mjs';
import { helpItems } from '../data/help.mjs';
import { directory } from '../data/directory.mjs';

const styles = ['hoc.css'];
const clean = (s) => String(s || '').replace(/\s+[-–—]\s+/g, ', ');
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'website'; } };

// Property managers already in the directory, with their own pages.
export const managers = () => directory.filter((b) => /property manag/i.test(`${b.type} ${b.name}`));

const FIND = ['housing-list', 'indiana-housing-now', 'landlord-association', 'housing-authority', 'behind-on-rent'];

function place(r) {
  const map = r.ll ? `https://www.google.com/maps/search/?api=1&query=${r.ll[0]},${r.ll[1]}` : '';
  const where = r.address || (r.street ? `${r.street}, ${r.town}` : r.town);
  return `
<article class="vs-sec hs-item" id="${esc(r.slug)}">
  <div>
    <h3>${esc(clean(r.name))}</h3>
    <p class="vs-addr">${svg('pin', 'ic-sm')}${esc(where)}${r.address ? '' : ' <span class="muted">(full street address not confirmed yet)</span>'}</p>
    ${r.phone ? `<p class="muted">${esc(r.phone)}</p>` : ''}
    <p class="btns">${r.website ? `<a class="btn btn-sm" href="${esc(r.website)}" target="_blank" rel="noopener">Availability on ${esc(host(r.website))}</a>` : ''}${map ? `<a class="btn btn-sm btn-ghost" href="${esc(map)}" target="_blank" rel="noopener">Map</a>` : ''}</p>
    <p class="fine">From ${r.sources.map((s) => `<a class="vs-src" href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>, ${esc(s.checked)}`).join('; ')}</p>
  </div>
</article>`;
}

function housingPage({ assets }) {
  const find = FIND.map((slug) => helpItems.find((i) => i.slug === slug)).filter(Boolean);
  const mgrs = managers();
  const groups = ['apartments', 'mobile'].map((k) => ({ id: k, name: HOUSING_KINDS[k], rows: HOUSING.filter((r) => r.kind === k) })).filter((g) => g.rows.length);
  const fromData = HOUSING.filter((r) => r.kind === 'manager');
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/help/', 'Help'], ['', 'Apartments and landlords']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Apartments and landlords</p>
    <h1>Renting in<br><span class="hl">Columbus.</span></h1>
    <p class="lede">Apartment communities, mobile home communities and property managers in and around Columbus, and the lists that show rents and waiting lists for the whole county.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Rents and openings change every week, so we don't print them: call or check each place's own site before you go.</span></p>
    <nav class="chips vs-jump" aria-label="On this page"><a class="pill" href="#find">Finding a place</a>${groups.map((g) => `<a class="pill" href="#${g.id}">${esc(g.name)} <span class="muted">${g.rows.length}</span></a>`).join('')}<a class="pill" href="#managers">Property managers</a></nav>
  </div>
</section>
<div class="wrap fr-list">
<section class="fr-group" id="find" aria-labelledby="find-h">
  <h2 id="find-h">Finding a place</h2>
  ${find.map((i) => `<article class="vs-sec"><div><h3>${esc(i.name)}</h3><p>${esc(i.what)}</p><p class="btns"><a class="btn btn-sm" href="/help/#${esc(i.slug)}">Details and links</a></p></div></article>`).join('')}
</section>
${groups.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h"><h2 id="${g.id}-h">${esc(g.name)}</h2>${g.rows.map(place).join('')}</section>`).join('\n')}
<section class="fr-group" id="managers" aria-labelledby="managers-h">
  <h2 id="managers-h">Property managers</h2>
  ${mgrs.map((b) => `<article class="vs-sec hs-item"><div><h3>${esc(b.name)}</h3>${b.address ? `<p class="vs-addr">${svg('pin', 'ic-sm')}${esc(b.address)}</p>` : ''}<p class="btns"><a class="btn btn-sm" href="/b/${esc(b.slug)}/">Their listing</a></p></div></article>`).join('')}
  ${fromData.map(place).join('')}
  <p class="muted">More property managers and private landlords are coming. Rent out a place in town? <a href="/owners/#claim">Add your listing</a>, free.</p>
</section>
<section class="fr-group" id="missing">
  <h2>Is a place missing or wrong?</h2>
  <p>This page is built from public records: OpenStreetMap, Google Maps and our own directory. <a href="/owners/#claim">Send us a correction</a> and a person will check it.</p>
</section>
<p class="fine fr-foot">Map data © OpenStreetMap contributors. Heart of Columbus is not affiliated with any landlord or community listed here.</p>
</div>
</main>
${footer()}`;
  return page({
    title: 'Apartments and landlords in Columbus, Indiana | Heart of Columbus',
    description: 'Apartment communities, mobile home communities and property managers in Columbus, Indiana, plus the county housing list with rents and waiting lists.',
    body, scripts: ['site.js'], styles, assets, path: '/housing/',
  });
}

export const housingPages = (ctx) => [{ path: 'housing/index.html', html: housingPage(ctx) }];

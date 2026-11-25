// "Nonprofits" (/nonprofits/): the charities, clubs and civic groups the IRS
// lists as tax exempt in and around Columbus, grouped by what they do. Rows
// come from src/data/nonprofits.mjs (scripts/import-nonprofits.mjs). Towns
// only, never a street: for a small group the IRS address is often a
// volunteer's home. Congregations are on /worship/.
import { page, esc } from '../layout.mjs';
import { header, footer, svg, breadcrumbs } from '../site.mjs';
import { NONPROFITS, NONPROFIT_GROUPS, NONPROFITS_PULLED, NONPROFITS_SOURCE } from '../data/nonprofits.mjs';

const styles = ['hoc.css'];
const ORDER = ['help', 'health', 'youth', 'education', 'arts', 'nature', 'sports', 'community', 'faith', 'clubs', 'other'];
const clean = (s) => String(s || '').replace(/\s+[-–—]\s+/g, ', ');
const filings = (ein) => `https://projects.propublica.org/nonprofits/organizations/${encodeURIComponent(ein)}`;

export const nonprofitGroups = () => ORDER.map((id) => ({ id, name: NONPROFIT_GROUPS[id], rows: NONPROFITS.filter((r) => r.group === id) })).filter((g) => g.rows.length);

function nonprofitsPage({ assets }) {
  const groups = nonprofitGroups();
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/help/', 'Help'], ['', 'Nonprofits']])}
<section class="order-hero vs-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Nonprofits</p>
    <h1>Who helps out<br><span class="hl">in Columbus.</span></h1>
    <p class="lede">${NONPROFITS.length} charities, clubs and civic groups in and around Columbus that the IRS lists as tax exempt. Looking to volunteer, give or get help? Start here.</p>
    <p class="vs-note">${svg('globe', 'ic-sm')}<span>Need help today? The <a href="/help/">help center</a> has phone numbers and hours. Congregations are on <a href="/worship/">places of worship</a>.</span></p>
    <label class="np-find"><span class="sr-only">Search nonprofits</span><input type="search" placeholder="Search by name, like food, youth or Rotary" data-np-find autocomplete="off"></label>
    <nav class="chips vs-jump" aria-label="Kinds of nonprofits">${groups.map((g) => `<a class="pill" href="#${g.id}">${esc(g.name)} <span class="muted">${g.rows.length}</span></a>`).join('')}</nav>
  </div>
</section>
<div class="wrap fr-list">
<p class="muted" data-np-none hidden>No nonprofit matches that. Try a shorter word.</p>
${groups.map((g) => `<section class="fr-group" id="${g.id}" aria-labelledby="${g.id}-h" data-np-group><h2 id="${g.id}-h">${esc(g.name)}</h2>
<ul class="np-list" role="list">${g.rows.map((r) => `<li class="np-row" data-np-row data-words="${esc(`${r.name} ${g.name}`.toLowerCase())}"><strong>${esc(clean(r.name))}</strong> <span class="muted">${esc(r.town)}</span> <a class="vs-src" href="${filings(r.ein)}" target="_blank" rel="noopener">Filings</a></li>`).join('')}</ul></section>`).join('\n')}
<section class="fr-group" id="missing">
  <h2>Run a nonprofit that's missing or wrong?</h2>
  <p>This list comes from the IRS list of tax exempt organizations, pulled ${esc(NONPROFITS_PULLED)}. New groups take a while to appear there. <a href="/owners/#claim">Tell us about yours</a> and a person will add it.</p>
</section>
<p class="fine fr-foot">Source: <a href="${esc(NONPROFITS_SOURCE)}" target="_blank" rel="noopener">IRS Exempt Organizations Business Master File</a>. "Filings" opens each group's public tax returns on ProPublica's Nonprofit Explorer. Heart of Columbus is not affiliated with any group listed here.</p>
</div>
<style>
.np-find input { width: 100%; max-width: 520px; font: inherit; padding: 12px 14px; border: 2px solid var(--ink); border-radius: 12px; margin: 14px 0 6px; background: #fff; }
.np-list { list-style: none; padding: 0; margin: 8px 0 0; display: grid; gap: 2px 24px; grid-template-columns: minmax(0, 1fr); }
@media (min-width: 900px) { .np-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.np-row { padding: 8px 0; border-bottom: 1px solid var(--line, #e4ddd0); overflow-wrap: anywhere; }
.np-row .muted, .np-row .vs-src { font-size: 14px; margin-left: 6px; }
</style>
<script>
(function () {
  var box = document.querySelector('[data-np-find]'); if (!box) return;
  var rows = [].slice.call(document.querySelectorAll('[data-np-row]')), groups = [].slice.call(document.querySelectorAll('[data-np-group]')), none = document.querySelector('[data-np-none]');
  box.addEventListener('input', function () {
    var words = box.value.toLowerCase().split(/\\s+/).filter(Boolean), shown = 0;
    rows.forEach(function (r) { var ok = words.every(function (w) { return r.getAttribute('data-words').indexOf(w) !== -1; }); r.hidden = !ok; if (ok) shown++; });
    groups.forEach(function (g) { g.hidden = !g.querySelector('[data-np-row]:not([hidden])'); });
    none.hidden = shown > 0;
  });
})();
</script>
</main>
${footer()}`;
  return page({
    title: 'Nonprofits in Columbus, Indiana | Heart of Columbus',
    description: `${NONPROFITS.length} charities, clubs and civic groups in Columbus, Indiana, grouped by what they do, from the IRS list of tax exempt organizations.`,
    body, scripts: ['site.js'], styles, assets, path: '/nonprofits/',
  });
}

export const nonprofitsPages = (ctx) => [{ path: 'nonprofits/index.html', html: nonprofitsPage(ctx) }];

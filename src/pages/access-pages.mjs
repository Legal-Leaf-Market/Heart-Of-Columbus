// /visit/accessibility/: places whose OpenStreetMap entry records wheelchair
// access (src/data/attrs.mjs), and where to ask about the rest. We claim no
// certification for Columbus and say nothing a source doesn't.
import { page, esc } from '../layout.mjs';
import { header, footer, card, svg, breadcrumbs } from '../site.mjs';
import { directory, CATEGORIES } from '../data/directory.mjs';
import { SRC } from '../data/visit.mjs';
import { PULLED_LABEL, OSM_CREDIT } from '../attrs.mjs';

const styles = ['hoc.css'];

function accessPage({ assets }) {
  const yes = directory.filter((b) => b.attrs?.wheelchair === 'yes');
  const part = directory.filter((b) => b.attrs?.wheelchair === 'limited');
  const toilet = new Set(directory.filter((b) => b.attrs?.toilet === 'yes').map((b) => b.slug));
  const byCat = CATEGORIES.map((c) => [c, yes.filter((b) => b.cat === c.slug)]).filter(([, l]) => l.length);
  const grid = (list) => `<div class="grid">${list.map((b) => card(b, { note: toilet.has(b.slug) ? 'Accessible restroom recorded' : '' })).join('')}</div>`;
  const body = `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Accessibility']])}
<section class="wrap tp-head">
  <p class="kicker kicker-pill">Accessibility</p>
  <h1>Getting in the door</h1>
  <p class="lede">Places on our list whose map entry says they are wheelchair accessible, and where to ask about everything else.</p>
  <p class="vs-note">${svg('globe', 'ic-sm')}<span>${yes.length + part.length
    ? `These come from OpenStreetMap, where volunteers record what they saw, checked ${esc(PULLED_LABEL)}. ${OSM_CREDIT}. The businesses haven’t confirmed them, and a place missing here is unknown, not inaccessible. Call ahead if it matters.`
    : 'We haven’t found map records of wheelchair access for places on our list yet. A place missing here is unknown, not inaccessible. Call ahead if it matters.'}</span></p>
  <p class="btns"><a class="btn btn-sm" href="/explore/?attr=w">${svg('map', 'ic-sm')} Search and map them</a><a class="btn btn-sm btn-ghost" href="${SRC.transit}" target="_blank" rel="noopener">ColumBUS, the city bus</a><a class="btn btn-sm btn-ghost" href="${SRC.visitors}" target="_blank" rel="noopener">Ask the Visitors Center about tours</a></p>
</section>
${byCat.map(([c, list]) => `<section class="wrap list"><div class="sec-head"><p class="kicker">Wheelchair accessible</p><h2>${esc(c.label)}</h2></div>${grid(list)}</section>`).join('')}
${part.length ? `<section class="wrap list"><div class="sec-head"><p class="kicker">Partly accessible</p><h2>Some steps or tight spots</h2><p class="sub">Mappers marked these “limited”: some areas are reachable, others not.</p></div>${grid(part)}</section>` : ''}
<section class="wrap tp-foot">
  <h2>Help fill this in</h2>
  <p>Own a business on our list? <a href="/owners/#claim">Tell us about your entrance and restroom</a> and we will check and add it. Anyone can add what they see to <a href="https://www.openstreetmap.org/" target="_blank" rel="noopener">OpenStreetMap</a>, and it shows up here the next time we pull the map.</p>
</section>
</main>
${footer()}`;
  return page({
    title: 'Accessibility | Heart of Columbus',
    description: 'Columbus, Indiana places whose OpenStreetMap entry records wheelchair access, and where to ask about the rest.',
    body, scripts: ['site.js'], styles, assets,
  });
}

export const accessPages = (ctx) => [{ path: 'visit/accessibility/index.html', html: accessPage(ctx) }];

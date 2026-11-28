import { readFileSync } from 'node:fs';
import { directory } from '../data/directory.mjs';
import { CATALOGS } from '../data/catalogs.mjs';
import { detailedPickupSlugs, pickupMenus } from '../data/pickup-menus.mjs';
import { page, t } from '../layout.mjs';
import { noDash } from '../event-feeds.mjs';

const path = '/pickup/demo/';
const saved = (file) => JSON.parse(readFileSync(new URL(file, import.meta.url), 'utf8'));
const probes = new Map(saved('../../scripts/data/probe-deep.json').filter(row => row.ok).map(row => [row.slug, row]));
const food = new Set(['restaurants', 'coffee-sweets', 'bars']);
const generic = [['Sample pickup item', 850, 'Example menu'], ['Sample add-on', 250, 'Example menu']];

function menuLink(business) {
  if (!food.has(business.cat)) return '';
  const probe = probes.get(business.slug);
  if (!probe?.final) return '';
  const home = new URL(probe.final);
  const host = u => u.hostname.replace(/^www\./, '');
  const menuPath = /\/(?:menu|menus|(?:view-our|our|current|full|food|breakfast|lunch|dinner|columbus)-menu)(?:\/food|-[0-9]+|\.(?:html?|php))?\/?$/i;
  for (const candidate of [...(probe.pages || []), ...(probe.urls || [])]) {
    const url = URL.parse(candidate, home);
    if (url && ['http:', 'https:'].includes(url.protocol) && host(url) === host(home) && menuPath.test(url.pathname)) {
      return url.href;
    }
  }
  return '';
}

function menuFor(business) {
  if (Object.hasOwn(pickupMenus, business.slug)) return pickupMenus[business.slug];
  if (business.cat !== 'smoke' && Object.hasOwn(CATALOGS, business.slug)) {
    const snapshot = saved('../../public/catalogs/' + business.slug + '.json');
    const items = snapshot.items.filter(item => item.available && item.price > 0)
      .flatMap(item => item.variants?.length ? item.variants.filter(v => v.available && v.price > 0)
        .map(v => [v.title && v.title !== 'Default Title' ? item.title + ' (' + v.title + ')' : item.title, Math.round(v.price * 100), item.type || 'Catalog'])
        : [[item.title, Math.round(item.price * 100), item.type || 'Catalog']]);
    if (items.length) return { items: items.slice(0, 48), source: snapshot.origin, kind: 'Saved catalog, ' + snapshot.checked };
  }
  return { sample: true, items: generic, source: menuLink(business), kind: 'Sample items and prices' };
}

export function pickupDemoPages({ assets }) {
  const businesses = directory.map(business => ({ business, menu: menuFor(business) }));
  const options = businesses.slice().sort((a, b) => a.business.name.localeCompare(b.business.name))
    .map(({ business, menu }) => `<option value="${business.slug}"${menu.sample ? '' : ' data-sourced'}>${t(business.name)}</option>`).join('');
  const sourcedCount = businesses.filter(({ menu }) => !menu.sample).length;
  const styles = ['hoc.css', 'pickup-demo.css'];
  const scripts = ['pickup-demo.js'];
  const render = (title, body, data) => page({
    title: title + ' | Heart of Columbus', description: 'A Heart of Columbus pickup concept demo.',
    body, data, styles, scripts, assets, showAlert: false, head: '<meta name="referrer" content="no-referrer">',
  });
  const featured = detailedPickupSlugs.map(slug => [slug, directory.find(business => business.slug === slug).name]);
  return [
    { path: 'pickup/demo/index.html', html: render('Pickup demo', `
      <main id="main" class="pd pd-launch">
        <a href="/order/">Heart of Columbus</a>
        <h1>Try order-ahead pickup</h1>
        <p>Build a test cart on your phone and run the counter on a tablet.</p>
        <form data-pd-picker>
          <label for="pd-business-search" data-pd-filter hidden>Search businesses</label>
          <input id="pd-business-search" data-pd-filter type="search" placeholder="Business name" hidden>
          <label class="pd-checkbox" data-pd-filter hidden><input type="checkbox" data-pd-sourced> With a sourced menu or catalog</label>
          <label for="pd-business">Choose a Columbus business</label>
          <select id="pd-business" required><option value="">Select a business</option>${options}</select>
          <button class="pd-primary">Open demo</button>
          <p data-pd-results role="status">${sourcedCount} demos with sourced menus or catalogs.</p>
        </form>
        <nav aria-label="Example demos">${featured.map(([slug, name]) => `<a href="${path}${slug}/">${t(name)}</a>`).join('')}</nav>
      </main>`) },
    ...businesses.map(({ business: b, menu }) => {
      const items = menu.items.map(([name, cents, section, choices, availability]) => [noDash(name), cents, noDash(section), choices, availability]);
      return { path: `pickup/demo/${b.slug}/index.html`, html: render(b.name + ' pickup demo', `
        <main id="main" class="pd pd-experience" data-pd>
          <header class="pd-header"><a href="${path}" class="pd-brand">Heart of Columbus</a>
            <a href="/b/${b.slug}/">Business listing</a></header>
          <div class="pd-hero">
            <p class="pd-eyebrow">Order ahead for pickup</p>
            <h1>${t(b.name)}</h1>
            <p class="pd-demo-note"><strong>Demo only</strong> Not affiliated with ${t(b.name)}. Test orders stay here.</p>
          </div>
          <section data-pd-start>
            <button type="button" class="pd-primary" data-action="start">Start demo</button>
            <p>Build an order, then open the counter view on a second device.</p>
          </section>
          <section data-pd-session hidden>
            <nav class="pd-views" aria-label="Demo views">
              <a data-pd-shopper>Shopper menu</a><a data-pd-tablet>Counter tablet</a>
              <details class="pd-share"><summary>Share demo</summary><div>
                <button type="button" data-action="copy"></button>
                <button type="button" data-action="qr" aria-expanded="false" aria-controls="pd-qr">Show QR code</button>
              </div></details>
            </nav>
            <div id="pd-qr" hidden></div>
            <div data-pd-content></div>
          </section>
          <p data-pd-message role="status"></p>
          <noscript>Enable JavaScript to run a pickup demo.</noscript>
        </main>`, { slug: b.slug, ...menu, items, demoCoupon: detailedPickupSlugs.includes(b.slug) }) };
    }),
  ];
}

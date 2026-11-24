// node scripts/research-brief.mjs
// Writes docs/research/scraping-brief.md: a research brief to hand ChatGPT
// (or a person) about how every Columbus shop, restaurant and cafe website
// on our list is built, and the easiest systematic way to read its products
// or menu. Built from what our own scan found (scripts/data/probe-deep.json)
// and the daily crawl's report (scripts/data/crawl-report.json), so run it
// again after a crawl to refresh it.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { directory, CATEGORIES, catBySlug } from '../src/data/directory.mjs';
import { COMMERCE } from '../src/data/commerce.mjs';

const ROOT = new URL('../', import.meta.url);
const probes = Object.fromEntries(JSON.parse(readFileSync(new URL('scripts/data/probe-deep.json', ROOT), 'utf8')).map((p) => [p.slug, p]));
const report = existsSync(new URL('scripts/data/crawl-report.json', ROOT)) ? JSON.parse(readFileSync(new URL('scripts/data/crawl-report.json', ROOT), 'utf8')) : null;
const found = Object.fromEntries((report?.found || []).map((f) => [f.slug, f]));
const SELLS = ['restaurants', 'coffee-sweets', 'bars', 'shopping', 'smoke', 'makers', 'pets', 'kids', 'things-to-do', 'beauty'];
const cell = (s) => String(s ?? '').replace(/\|/g, '/').replace(/\s+/g, ' ').trim() || ' ';
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

function status(b) {
  const f = found[b.slug];
  if (f) return f.method === 'store feed' ? `reading it (${f.platform} feed, ${f.items} items)` : `partial (schema.org data, ${f.items} ${f.kind === 'menu' ? 'menu items' : 'products'})`;
  const c = COMMERCE[b.slug];
  if (c?.feed) return 'live feed, not in last crawl';
  if (c?.store) return 'shop link only';
  if ((c?.order || []).length) return 'order link only';
  return 'nothing yet';
}

const rows = directory.filter((b) => !b.demo && SELLS.includes(b.cat) && b.website);
const noSite = directory.filter((b) => !b.demo && SELLS.includes(b.cat) && !b.website);
const byPlatform = {};
for (const b of rows) { const p = probes[b.slug]?.platform || COMMERCE[b.slug]?.platform || 'unknown'; byPlatform[p] = (byPlatform[p] || 0) + 1; }
const stackCount = {};
for (const b of rows) for (const s of probes[b.slug]?.stack || []) stackCount[s] = (stackCount[s] || 0) + 1;

const lines = [];
const P = (s = '') => lines.push(s);
P('# How Columbus shop and restaurant websites are built, and how to read their products');
P();
P(`A research brief from Heart of Columbus, ${new Date().toISOString().slice(0, 10)}. Built by scripts/research-brief.mjs from our own scan of each site; run it again after a crawl to refresh it.`);
P();
P('## Who we are and what we need');
P();
P('Heart of Columbus is a directory of independent businesses in Columbus, Indiana (Bartholomew County). On our order page and on each business page we show what a shop sells or what a restaurant serves, read from the business\'s own website, and send the customer to the business\'s own checkout or ordering page. We never take payment or orders for a business that has not signed on with us, and we do not use marketplaces that take a cut (DoorDash, Grubhub, Uber Eats).');
P();
P('**Your job:** for every website below, work out how it is built and the easiest reliable way to read its product catalog or menu systematically, so a daily job can do it for all of them. For each item we want: name, price, in stock or not, a photo URL, the product or menu page URL, the section or category, and any variant IDs (size, color) that a cart link would need.');
P();
P('## Ground rules for any method you suggest');
P();
P('- Public data only, the same data any visitor\'s browser receives. No logins, no account APIs, no owner keys.');
P('- Respect robots.txt and each platform\'s terms. Say so plainly when a method would break a platform\'s terms; we will not use it.');
P('- No getting around bot protection, CAPTCHAs, rate limits or paywalls.');
P('- Gentle: a few requests per site per day, identified as HeartOfColumbusBot with a contact URL.');
P('- Prefer, in this order: (1) a documented public endpoint, (2) structured data the page already publishes (JSON-LD, Open Graph, embedded JSON state), (3) parsing HTML.');
P('- Cite a source for every platform claim (the platform\'s developer docs, a help article, or the URL pattern you saw), with the date you checked. If you are not sure, say "unverified".');
P();
P('## What we already do, so you can skip it');
P();
P('- **Shopify:** `/products.json?limit=250&page=N` (public on most stores). Cart handoff by cart permalink `/cart/<variant>:<qty>,...`.');
P('- **WooCommerce:** the Store API, `/wp-json/wc/store/v1/products` (and `?type=variation`). Cart handoff by `?add-to-cart=` links, one item per visit.');
P('- **Squarespace Commerce:** the store page with `?format=json`, paged by `offset`. No cart link exists, so items open their own product pages.');
P('- **Any platform:** schema.org JSON-LD `Product`, `ItemList` and `Menu`/`MenuSection`/`MenuItem` on the home, shop and menu pages, plus up to 40 product pages linked from them.');
P(`- **Results of our last crawl${report ? ` (${report.checked})` : ''}:** ${report ? `${report.withCatalog} of ${report.crawled} shops and restaurants gave us a catalog or menu (${Object.entries(report.byMethod).map(([k, v]) => `${v} by ${k}`).join(', ')}).` : 'not run yet.'} Everything marked "nothing yet" or "partial" below is where we need you.`);
P();
P('## What our scan found on these sites');
P();
P(`${rows.length} shops, restaurants, cafes, bars and makers on our list have a website (${noSite.length} more have none). The cart or site platform our scan detected:`);
P();
P('| Platform we detected | Sites |');
P('|---|---|');
for (const [p, n] of Object.entries(byPlatform).sort((a, b) => b[1] - a[1])) P(`| ${cell(p)} | ${n} |`);
P();
P('Every system whose fingerprint showed up in the pages (a site can show several: a Wix site with a Toast ordering link shows both):');
P();
P(Object.entries(stackCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ') + '.');
P();
P('## Part A: a playbook for each platform');
P();
P('For each platform in the two lists above, plus any you find in Part B, write a short section with exactly these headings:');
P();
P('1. **How to recognize it:** HTML, script or header fingerprints, and typical URL shapes.');
P('2. **Where the products or menu live:** the endpoint or embedded data (for example a JSON blob in a script tag, a public storefront API the site itself calls, a feed, a sitemap of product pages). Give a real example URL pattern.');
P('3. **One example request and the fields it returns,** and how paging works.');
P('4. **Can a cart or order be pre-filled by link?** If yes, the exact URL format; if no, say so.');
P('5. **Terms, robots and rate limits** to respect.');
P('6. **Reliability, 1 to 5,** and what usually breaks.');
P();
P('Platforms we especially need: Wix and Wix Stores, Square Online (Weebly), GoDaddy Websites + Marketing and GoDaddy Online Store, Duda, Webflow, Thryv and Hibu sites, plain WordPress without WooCommerce (menus in page builders, PDF menus), BigCommerce, Ecwid, Big Cartel, and restaurant systems: Toast, Square for Restaurants, Clover, ChowNow, GloriaFood, Popmenu, BentoBox, Slice, Menufy, Owner.com, SpotHopper, MenuDrive, Olo. Also: how to read a menu that is only a PDF or an image, and whether Google Business Profile or Facebook menus are usable (we suspect not, under their terms).');
P();
P('## Part B: one row per business');
P();
P('Visit each site below and fill one row each. Keep our slug so we can match rows back.');
P();
P('| slug | platform (confirmed) | where products or menu live (URL) | best method (endpoint, JSON-LD, embedded JSON, HTML, PDF, none) | can pre-fill cart? | sells online? (yes, no, call to order) | notes |');
P('|---|---|---|---|---|---|---|');
P();
P('Use "none" when the site really has no products or menu online, and say what it has instead (a phone number, a Facebook page, a PDF).');
P();
P('## The websites');
P();
P('Grouped by our category. "Our status" is what our daily crawl gets today.');
for (const cat of CATEGORIES.filter((c) => SELLS.includes(c.slug))) {
  const list = rows.filter((b) => b.cat === cat.slug);
  if (!list.length) continue;
  P();
  P(`### ${cat.label} (${list.length})`);
  P();
  P('| slug | name | website | detected platform | other systems seen | our status | order or booking links we found |');
  P('|---|---|---|---|---|---|---|');
  for (const b of list.sort((x, y) => x.name.localeCompare(y.name))) {
    const p = probes[b.slug] || {};
    const c = COMMERCE[b.slug] || {};
    const links = [...(c.order || []), ...(c.book || [])].map((l) => `${l.label}: ${host(l.url)}`).slice(0, 3).join('; ');
    P(`| ${b.slug} | ${cell(b.name)} | ${cell(b.website)} | ${cell(p.platform || c.platform || (p.ok === false ? 'unreachable' : 'unknown'))} | ${cell((p.stack || []).filter((s) => s !== p.platform).join(', '))} | ${cell(status(b))} | ${cell(links)} |`);
  }
}
P();
P('## Businesses with no website on file');
P();
P('These may sell through Facebook, Instagram, Etsy or a market stall. If you find a website or an online menu or shop for any of them, add a row to Part B with the URL.');
P();
P(noSite.map((b) => `${b.slug} (${catBySlug[b.cat]?.label || b.cat})`).join(', ') + '.');
P();
mkdirSync(new URL('docs/research/', ROOT), { recursive: true });
writeFileSync(new URL('docs/research/scraping-brief.md', ROOT), lines.join('\n'));
console.log('docs/research/scraping-brief.md:', rows.length, 'sites,', noSite.length, 'without a site');

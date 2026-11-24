// node scripts/snapshot-catalogs.mjs [slug,slug...]
// The daily store crawl's second half (the "Store crawl" workflow runs it
// after scripts/probe-deep.mjs and scripts/import-commerce.mjs). For every
// shop, restaurant and cafe with a website it saves what that business sells,
// as its own site publishes it, to public/catalogs/<slug>.json:
//   - stores we read live (Shopify, WooCommerce, Squarespace): the same
//     reader /api/shop uses (readCatalog), so the snapshot is a backup;
//   - every other site (Wix, Square Online, GoDaddy, WordPress, menu pages):
//     the schema.org Product and Menu data its pages publish for search
//     engines (mapJsonLd), from its shop and menu pages and up to 40
//     product pages they link to.
// Read-only toward the businesses: public pages, a few seconds apart per
// site, nothing posted. Only names, prices, stock, photos and links are
// kept; descriptions are not copied. src/data/catalogs.mjs is the index the
// site builds from, and scripts/data/crawl-report.json says what was found.
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { WEB } from '../src/data/web.mjs';
import { COMMERCE } from '../src/data/commerce.mjs';
import { directory } from '../src/data/directory.mjs';
import { findOwnPages, mapJsonLd } from '../src/commerce-core.mjs';
import { readCatalog } from '../netlify/functions/shop.mjs';

const ROOT = new URL('../', import.meta.url);
const OUT = new URL('public/catalogs/', ROOT);
const ONLY = new Set((process.argv[2] || '').split(',').filter(Boolean));
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.2; +https://heartofcolumbus.shop)';
const TODAY = new Date().toISOString().slice(0, 10);
// What a shop grid or a menu can use: shops, food and drink, and the other
// places that sell things over the counter. Services (plumbers, dentists)
// are left alone.
const SELLS = new Set(['shopping', 'smoke', 'restaurants', 'coffee-sweets', 'bars', 'pets', 'kids', 'things-to-do', 'beauty', 'makers']);
const KEEP = 300; // items saved per business, best first
const PRODUCT_PAGES = 40;

async function get(url, accept = 'text/html,application/xhtml+xml', ms = 15000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept }, redirect: 'follow', signal: ctl.signal });
    if (!r.ok) return null;
    const type = r.headers.get('content-type') || '';
    if (/json/.test(type)) return { url: r.url, body: await r.json(), pages: Number(r.headers.get('x-wp-totalpages')) || 0 };
    return /html|xml|text/.test(type) ? { url: r.url, html: (await r.text()).slice(0, 3_000_000) } : null;
  } catch { return null; } finally { clearTimeout(t); }
}
const getJson = (url) => get(url, 'application/json');
const pause = (ms) => new Promise((ok) => setTimeout(ok, ms));

// Same-site links that look like a shop, a menu, or one product.
function links(html, base) {
  const shopish = [], products = [];
  let origin;
  try { origin = new URL(base).origin; } catch { return { shopish, products }; }
  for (const m of String(html || '').matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&'), base); } catch { continue; }
    if (u.origin !== origin || /\.(pdf|jpe?g|png|gif|webp|zip)$/i.test(u.pathname)) continue;
    u.hash = '';
    const path = u.pathname.toLowerCase(), text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
    if (/\/(?:product-page|products?|item|p|shop|store)\/[^/]+\/?$/.test(path) && !/\/(?:cart|checkout|account|category|collections?\/?$)/.test(path)) products.push(u.toString());
    else if (/^\/(?:shop|store|products|collections(?:\/all)?|menu|menus|our-menu|food-menu|order-online|online-store|shop-all)\/?$/.test(path) || /^(?:shop|store|menu|our menu|shop all|online store)$/.test(text)) shopish.push(u.toString());
  }
  return { shopish: [...new Set(shopish)], products: [...new Set(products)] };
}

async function crawl(slug, website) {
  const home = await get(website);
  if (!home || !home.html) return { items: [], pages: 0, reason: 'unreachable' };
  const base = home.url || website;
  const own = findOwnPages(home.html, base);
  let { shopish, products } = links(home.html, base);
  shopish = [...new Set([own.shop, own.order, ...shopish].filter(Boolean))].slice(0, 6);
  const items = [...mapJsonLd(home.html, base)];
  let pages = 1;
  for (const u of shopish) {
    await pause(400);
    const pg = await get(u);
    if (!pg || !pg.html) continue;
    pages++;
    items.push(...mapJsonLd(pg.html, pg.url || u));
    products.push(...links(pg.html, pg.url || u).products);
  }
  // Many builders only describe a product on its own page.
  for (const u of [...new Set(products)].slice(0, PRODUCT_PAGES)) {
    await pause(300);
    const pg = await get(u);
    if (!pg || !pg.html) continue;
    pages++;
    items.push(...mapJsonLd(pg.html, pg.url || u));
  }
  const seen = new Set();
  return { items: items.filter((i) => { const k = (i.title + '|' + i.price).toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }), pages };
}

// Shop grids show only in-stock items with a photo (the owner's rule), so
// those go first; a menu keeps its order.
const rank = (items) => items.slice().sort((a, b) => (b.available - a.available) || (!!b.image - !!a.image));

async function snapshot(b) {
  const c = COMMERCE[b.slug];
  const website = (WEB[b.slug] && WEB[b.slug].website) || b.website;
  let items = [], method = '', platform = (c && c.platform) || '', origin = '', pages = 0, reason = '';
  if (c && c.feed) {
    items = await readCatalog(c, getJson, b.slug).catch(() => []);
    method = 'store feed'; origin = c.origin;
  }
  if (!items.length && website) {
    const r = await crawl(b.slug, website);
    items = r.items; pages = r.pages; reason = r.reason || ''; method = 'page data';
    try { origin = new URL(website).origin + '/'; } catch { /* keep blank */ }
  }
  const menu = items.length && items.filter((i) => i.kind === 'menu').length > items.length / 2;
  return { slug: b.slug, name: b.name, cat: b.cat, platform, method, origin, pages, reason, kind: menu ? 'menu' : 'shop', items: rank(items) };
}

const targets = directory.filter((b) => (ONLY.size ? ONLY.has(b.slug) : SELLS.has(b.cat)) && ((WEB[b.slug] && WEB[b.slug].website) || b.website || (COMMERCE[b.slug] && COMMERCE[b.slug].feed)));
console.log('crawling', targets.length, 'businesses');
mkdirSync(OUT, { recursive: true });
const results = [];
let next = 0;
async function worker() {
  while (next < targets.length) {
    const b = targets[next++];
    try { results.push(await snapshot(b)); } catch (e) { results.push({ slug: b.slug, name: b.name, cat: b.cat, items: [], reason: 'error ' + (e.message || e) }); }
    if (results.length % 25 === 0) console.log(results.length, '/', targets.length);
  }
}
await Promise.all(Array.from({ length: 8 }, worker));

// A catalog needs at least three priced items to be worth a box.
const found = results.filter((r) => r.items.length >= 3).sort((a, b) => a.slug.localeCompare(b.slug));
if (!ONLY.size) for (const f of readdirSync(OUT)) if (f.endsWith('.json') && !found.some((r) => `${r.slug}.json` === f)) unlinkSync(new URL(f, OUT));
for (const r of found) {
  const stock = r.items.filter((i) => i.available);
  writeFileSync(new URL(`${r.slug}.json`, OUT), JSON.stringify({ ok: true, slug: r.slug, checked: TODAY, method: r.method, kind: r.kind, platform: r.platform, origin: r.origin,
    stock: stock.length, pictured: stock.filter((i) => i.image).length, total: r.items.length, items: r.items.slice(0, KEEP) }) + '\n');
}
const index = Object.fromEntries(found.map((r) => [r.slug, { kind: r.kind, items: r.items.length, method: r.method, checked: TODAY }]));
if (!ONLY.size) writeFileSync(new URL('src/data/catalogs.mjs', ROOT), `// Which businesses have a saved catalog or menu in public/catalogs/, from
// the daily store crawl (scripts/snapshot-catalogs.mjs). Generated; do not edit.
export const CATALOGS = ${JSON.stringify(index, null, 1)};
`);
const report = { checked: TODAY, crawled: results.length, withCatalog: found.length,
  byMethod: found.reduce((a, r) => ((a[r.method] = (a[r.method] || 0) + 1), a), {}),
  byKind: found.reduce((a, r) => ((a[r.kind] = (a[r.kind] || 0) + 1), a), {}),
  byPlatform: found.reduce((a, r) => ((a[r.platform || 'unknown'] = (a[r.platform || 'unknown'] || 0) + 1), a), {}),
  found: found.map((r) => ({ slug: r.slug, name: r.name, cat: r.cat, kind: r.kind, method: r.method, platform: r.platform, items: r.items.length, inStockWithPhoto: r.items.filter((i) => i.available && i.image).length })),
  nothing: results.filter((r) => r.items.length < 3).map((r) => ({ slug: r.slug, cat: r.cat, platform: r.platform || '', reason: r.reason || (r.items.length ? `${r.items.length} items` : 'no product or menu data') })) };
if (!ONLY.size) writeFileSync(new URL('scripts/data/crawl-report.json', ROOT), JSON.stringify(report, null, 1) + '\n');
console.log(found.length, 'of', results.length, 'have a catalog or menu;', JSON.stringify(report.byMethod), JSON.stringify(report.byKind));

// node scripts/import-commerce.mjs <probe-results.json>
// Combines /api/probe results with the owner-set Google action links into
// src/data/commerce.mjs: platform, live feed, and first-party order/book links.
import { readFileSync, writeFileSync } from 'node:fs';
import { WEB } from '../src/data/web.mjs';
import { PROVIDERS, findProviderLinks } from '../src/commerce-core.mjs';
import { directory } from '../src/data/directory.mjs';

const rawProbes = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const probes = Array.isArray(rawProbes) ? rawProbes : Object.values(rawProbes);
const catOf = Object.fromEntries(directory.map((b) => [b.slug, b.cat]));
const FOOD = new Set(['restaurants', 'coffee-sweets', 'bars']);
const RETAIL = new Set(['shopping', 'coffee-sweets', 'pets', 'kids', 'things-to-do', 'beauty']);
const NO_FEED = new Set(['pros', 'home-services', 'auto', 'health']);
const STOREFRONT = new Set(['shopify', 'woocommerce', 'bigcommerce', 'squarespace-commerce', 'wix-stores', 'square-online']);
const bySlug = Object.fromEntries(probes.map((p) => [p.slug, p]));
// Marketplaces take a cut, so they are not "direct" and are never linked.
const MARKET = /(?:^|\.)(doordash\.com|grubhub\.com|ubereats\.com|postmates\.com|seamless\.com|yelp\.com|facebook\.com|instagram\.com|google\.com)$/i;
const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };

const out = {};
for (const slug of new Set([...Object.keys(WEB), ...Object.keys(bySlug)])) {
  const p = bySlug[slug] || {};
  const w = WEB[slug] || {};
  const order = [], book = [];
  const push = (list, label, url) => { if (url && !MARKET.test(host(url)) && !list.some((x) => x.url === url)) list.push({ label, url }); };
  for (const l of p.links || []) push(l.kind === 'order' ? order : book, l.label, l.url);
  if (p.own && p.own.order) push(order, p.own.order.label, p.own.order.url);
  for (const [label, url] of w.actions || []) {
    const known = findProviderLinks(url)[0];
    if (known) { push(known.kind === 'order' ? order : book, known.label, known.url); continue; }
    const path = (() => { try { return new URL(url).pathname.toLowerCase(); } catch { return ''; } })();
    if (/order|menu/.test(path)) push(order, host(url), url);
    else if (/book|appoint|schedul|reserv|request/.test(path) || /book|appoint|schedul|reserv/.test(host(url))) push(book, host(url), url);
  }
  const cat = catOf[slug];
  // A website that now redirects to a different domain (sold, lapsed) is not
  // the business's store, whatever it sells.
  const base = (u) => host(u).split('.').slice(-2).join('.');
  if (p.ok && w.website && base(p.origin) !== base(w.website) && !/square\.site$|wixsite\.com$|myshopify\.com$/.test(host(p.origin))) { p.ok = false; }
  // Square Online is a site builder too: its "order" page only means food
  // ordering for food businesses. For a shop it is the store; otherwise skip.
  let squareShop = '';
  if (!FOOD.has(cat)) {
    const i = order.findIndex((o) => o.label === 'Square Online');
    if (i !== -1) { if (RETAIL.has(cat)) squareShop = order[i].url; order.splice(i, 1); }
  }
  // One booking link per provider is enough.
  for (let i = book.length - 1; i > 0; i--) if (book.slice(0, i).some((b) => b.label === book[i].label)) book.splice(i, 1);
  const feed = !!(p.ok && (p.platform === 'shopify' || p.platform === 'woocommerce') && p.products > 0 && !NO_FEED.has(cat));
  // A storefront we can't read item by item still gets a "Shop online" link
  // when the site really sells: a Shopify/BigCommerce/Square Online site, or
  // a site-builder store whose own nav has a Shop page.
  let store = squareShop;
  const shopPath = (() => { try { return new URL(p.own && p.own.shop).pathname; } catch { return '/'; } })();
  if (p.ok && !feed && STOREFRONT.has(p.platform)) {
    if (p.platform === 'square-online' && FOOD.has(cat)) push(order, 'Square Online', p.origin);
    else if (RETAIL.has(cat) && p.own && p.own.shop && shopPath !== '/' && !/^\/products?\/[^/]+\/?$/.test(shopPath)) store = store || p.own.shop;
    else if (RETAIL.has(cat) && ['shopify', 'bigcommerce'].includes(p.platform)) store = store || p.origin;
  }
  if (!order.length && !book.length && !feed && !store && !p.platform) continue;
  out[slug] = { platform: p.platform || '', origin: p.origin || '', feed, store, order: order.slice(0, 2), book: book.slice(0, 2) };
}
const head = `// What each business's own website can do: its cart engine and the ordering
// or booking pages it chose. Built by scripts/import-commerce.mjs from the
// /api/probe results and owner-set Google action links. \`feed: true\` means
// /api/shop can read its live catalog. Marketplaces that take a cut are left out.
`;
writeFileSync(new URL('../src/data/commerce.mjs', import.meta.url), head + 'export const COMMERCE = ' + JSON.stringify(out, null, 1) + ';\n');
const n = (f) => Object.values(out).filter(f).length;
console.log(Object.keys(out).length, 'entries;', n((c) => c.order.length), 'order;', n((c) => c.book.length), 'book;', n((c) => c.feed), 'feeds;', n((c) => c.store), 'store links');
void PROVIDERS;

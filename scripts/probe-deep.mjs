// node scripts/probe-deep.mjs [out.json] [slug,slug...]
// The thorough version of /api/probe, run from a machine with open internet
// (the "Probe commerce" GitHub workflow). For every business website in
// src/data/web.mjs it reads the home page and up to eight of the site's own
// pages that look like ordering, booking, shopping or services pages, and
// records:
//   - stack: every site builder, cart engine and ordering/booking system whose
//     fingerprint shows in the HTML (PLATFORM_SIGNS in src/commerce-core.mjs)
//   - urls: every outside link, frame, form and script address the pages use,
//     so scripts/import-commerce.mjs can re-read them against today's
//     provider rules without fetching again
//   - feed sizes for catalogs we can read (Shopify, WooCommerce, Squarespace)
// It never posts anything and only reads public pages, a handful per site.
import { writeFileSync } from 'node:fs';
import { WEB } from '../src/data/web.mjs';
import { detectPlatform, detectStack, findProviderLinks, findOwnPages, findGiftLinks, EMBEDS, tidyUrl } from '../src/commerce-core.mjs';

const OUT = process.argv[2] || new URL('./data/probe-results.json', import.meta.url).pathname;
const ONLY = new Set((process.argv[3] || '').split(',').filter(Boolean));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 HeartOfColumbusBot/1.1 (+https://heartofcolumbus.netlify.app)';
const MAX_PAGES = 8;

async function get(url, ms = 12000, accept = 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8') {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'en-US,en;q=0.9' }, redirect: 'follow', signal: ctl.signal });
    const type = r.headers.get('content-type') || '';
    const body = r.ok && /html|json|text|xml/.test(type) ? (await r.text()).slice(0, 3_000_000) : '';
    return { status: r.status, url: r.url, body, headers: Object.fromEntries(['server', 'x-powered-by', 'x-shopid', 'x-wix-request-id', 'x-served-by'].map((k) => [k, r.headers.get(k) || '']).filter(([, v]) => v)) };
  } catch (e) {
    return { status: 0, error: String(e.cause?.code || e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

// Every absolute address the page points at: links, frames, forms, scripts,
// and bare URLs inside inline scripts (widget configs).
function addresses(html, base) {
  const out = new Set();
  const h = String(html || '');
  for (const m of h.matchAll(/(?:href|src|action|data-src|data-url|data-href)\s*=\s*["']([^"'<>\s]+)["']/gi)) {
    try { out.add(new URL(m[1].replace(/&amp;/g, '&'), base).toString()); } catch { /* not a URL */ }
  }
  for (const m of h.matchAll(/https?:(?:\\?\/){2}[a-z0-9.-]+\.[a-z]{2,}(?:\\?\/[^\s"'<>)\\]*)?/gi)) out.add(m[0].replace(/\\\//g, '/'));
  return [...out];
}

// Same-origin pages worth a second look, best first.
const WORTH = /\b(order|ordering|menu|pickup|carry ?out|take ?out|delivery|book|booking|appointments?|schedul\w*|reserv\w*|shop|store|products?|collections|services|pricing|rates|classes|tickets|gift|contact|request|quote|estimate|patients?|new-patient|visit)\b/i;
function candidates(html, base) {
  let origin;
  try { origin = new URL(base).origin; } catch { return []; }
  const seen = new Map();
  for (const m of String(html || '').matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&'), base); } catch { continue; }
    if (u.origin !== origin || /\.(pdf|jpe?g|png|gif|webp|zip|docx?)$/i.test(u.pathname) || u.pathname === '/' ) continue;
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const hay = text + ' ' + decodeURIComponent(u.pathname).replace(/[-_/]/g, ' ');
    if (!WORTH.test(hay)) continue;
    u.hash = '';
    const key = u.toString();
    const score = /order|book|appoint|schedul|reserv|shop|store/i.test(hay) ? 2 : 1;
    if (!seen.has(key) || seen.get(key) < score) seen.set(key, score);
  }
  return [...seen.entries()].sort((a, b) => b[1] - a[1]).map(([u]) => u).slice(0, MAX_PAGES);
}

async function feedCount(platform, origin, shop) {
  if (platform === 'shopify') {
    const f = await get(origin + '/products.json?limit=250', 10000, 'application/json');
    try { return (JSON.parse(f.body).products || []).length; } catch { return 0; }
  }
  if (platform === 'woocommerce') {
    const f = await get(origin + '/wp-json/wc/store/v1/products?per_page=100', 10000, 'application/json');
    try { const j = JSON.parse(f.body); return Array.isArray(j) ? j.length : 0; } catch { return 0; }
  }
  if (platform === 'squarespace-commerce' && shop) {
    const f = await get(shop.replace(/[?#].*$/, '') + '?format=json', 10000, 'application/json');
    try { const j = JSON.parse(f.body); return (j.items || []).filter((i) => i.structuredContent && i.structuredContent.productType != null || i.recordTypeLabel === 'store-item').length; } catch { return 0; }
  }
  return 0;
}

export async function probeDeep(slug) {
  const w = WEB[slug];
  if (!w || !w.website) return { slug, ok: false, reason: 'no website' };
  let home = await get(w.website);
  if (!home.body && /^https:\/\/(?!www\.)/.test(w.website)) home = await get(w.website.replace('https://', 'https://www.'));
  if (!home.body) return { slug, ok: false, origin: (() => { try { return new URL(w.website).origin; } catch { return ''; } })(), reason: 'unreachable ' + (home.status || home.error) };
  const base = home.url || w.website;
  const origin = new URL(base).origin;
  const actions = (w.actions || []).map((a) => a[1]);
  const own = findOwnPages(home.body, base);
  const stack = new Set(detectStack(home.body, home.headers));
  const urls = new Set(addresses(home.body, base));
  const out = { slug, ok: true, origin, platform: detectPlatform(home.body), links: [], own: {}, pages: [] };
  const gift0 = findGiftLinks(home.body, base);
  if (gift0) out.gift = gift0;
  const list = candidates(home.body, base);
  for (const k of ['order', 'book', 'shop']) if (own[k] && !list.includes(own[k])) list.unshift(own[k]);
  const pages = await Promise.all(list.slice(0, MAX_PAGES).map((u) => get(u, 10000)));
  pages.forEach((pg, i) => {
    const u = list[i];
    if (!pg.body) return;
    out.pages.push(new URL(pg.url || u).pathname);
    for (const s of detectStack(pg.body)) stack.add(s);
    for (const a of addresses(pg.body, pg.url || u)) urls.add(a);
    if (!out.platform) out.platform = detectPlatform(pg.body);
    const embed = EMBEDS.find((e) => e.re.test(pg.body));
    if (embed && u === own.order) out.own.order = { url: u, label: embed.label, via: embed.id };
    if (u === own.order) out.own.orderPage = u;
    if (u === own.book) out.own.bookPage = u;
    if (!out.gift) { const g = findGiftLinks(pg.body, u); if (g) out.gift = g; }
  });
  if (own.shop) out.own.shop = own.shop;
  // Keep only outside addresses (and same-site ones that name a provider).
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return ''; } };
  const me = host(origin);
  out.urls = [...urls].map(tidyUrl).filter((u) => u && host(u) !== me && !/(?:googleapis|gstatic|googletagmanager|google-analytics|doubleclick|facebook\.net|fonts\.|jquery|cloudflare|jsdelivr|unpkg|bootstrapcdn|fontawesome|typekit|w\.org|schema\.org|gravatar|youtube\.com\/embed|vimeo|recaptcha)/i.test(u)).slice(0, 200);
  out.links = findProviderLinks(out.urls.join(' '), actions);
  out.stack = [...stack].sort();
  if (['shopify', 'woocommerce', 'squarespace-commerce'].includes(out.platform)) out.products = await feedCount(out.platform, origin, own.shop);
  return out;
}

const slugs = Object.keys(WEB).filter((s) => WEB[s].website && (!ONLY.size || ONLY.has(s))).sort();
const results = [];
let next = 0, done = 0;
async function worker() {
  while (next < slugs.length) {
    const s = slugs[next++];
    try { results.push(await probeDeep(s)); } catch (e) { results.push({ slug: s, ok: false, reason: 'error ' + (e.message || e) }); }
    if (++done % 25 === 0) console.log(done, '/', slugs.length);
  }
}
await Promise.all(Array.from({ length: 16 }, worker));
results.sort((a, b) => a.slug.localeCompare(b.slug));
writeFileSync(OUT, JSON.stringify(results, null, 0).replace(/\},\{"slug"/g, '},\n{"slug"') + '\n');
const tally = {};
for (const r of results) for (const s of r.stack || []) tally[s] = (tally[s] || 0) + 1;
console.log(results.filter((r) => r.ok).length, 'of', results.length, 'reachable');
console.log(Object.entries(tally).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}: ${v}`).join('\n'));

// GET /api/shop?slug=...  A business's live catalog, from its own store.
// Shopify: /products.json. WooCommerce: the public Store API. Cached at the
// CDN for 15 minutes (stock moves; the cart checks again at checkout through
// /api/stock) so we don't lean on the shop's server. `durable` puts the
// answer in Netlify's shared cache: without it each edge node kept its own
// copy, so almost every visitor missed and waited on the shop (measured
// 2026-11-24: 0.4 to 6.7 seconds a store, every request a miss).
//
// ?top=N (1 to 96) answers with only what a grid shows: the first N items
// that are in stock and have a photo (the owner's rule), plus the counts the
// grid prints. A 1,000 item catalog is ~280 KB whole and a few KB this way.
import { COMMERCE } from '../../src/data/commerce.mjs';
import { mapShopify, mapWoo, mapSquarespace } from '../../src/commerce-core.mjs';
import { SHOP_RULES } from '../../src/data/shop-rules.mjs';

export const config = { path: '/api/shop' };
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.0; +https://heartofcolumbus.shop)';
const json = (status, body, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300', ...(cache ? { 'netlify-cdn-cache-control': 'public, durable, s-maxage=900, stale-while-revalidate=3600' } : {}) },
  });

async function getJson(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 8000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctl.signal });
    return r.ok ? { body: await r.json(), pages: Number(r.headers.get('x-wp-totalpages')) || 0 } : null;
  } catch { return null; } finally { clearTimeout(t); }
}

// One Woo Store API collection, whole. Sorted by id because the default
// date order ties on a bulk import and pages overlap; rows are deduped by id
// because a store that ignores `page` serves page one again. The first page
// says how many there are (X-WP-TotalPages), so the rest go out together
// and a function with a 10 second budget is not spent waiting in line.
export async function wooCollection(origin, query, maxPages, get = getJson) {
  // Some stores refuse the sort (Divine Family BBQ answers orderby=id with a
  // 410 from a security plugin, measured 2026-11-18), so a refused first page
  // is asked again without it: an unsorted catalog beats none.
  let sort = '&orderby=id&order=asc';
  const url = (page) => `${origin}/wp-json/wc/store/v1/products?${query ? query + '&' : ''}per_page=100${sort}&page=${page}`;
  let first = await get(url(1));
  if (!first || !Array.isArray(first.body)) { sort = ''; first = await get(url(1)); }
  const rows = [], seen = new Set();
  const take = (d) => { for (const r of (d && Array.isArray(d.body) ? d.body : [])) if (r && r.id != null && !seen.has(r.id)) { seen.add(r.id); rows.push(r); } };
  take(first);
  if (!first || !Array.isArray(first.body) || first.body.length < 100) return rows;
  const total = Math.min(maxPages, first.pages || maxPages);
  const rest = await Promise.all(Array.from({ length: Math.max(0, total - 1) }, (_, i) => get(url(i + 2))));
  rest.forEach(take);
  return rows;
}

// One business's catalog, read from its own store. Shared with the daily
// crawl (scripts/snapshot-catalogs.mjs), which saves the same thing to disk.
export async function readCatalog(c, get = getJson, slug = '') {
  const origin = c.origin.replace(/\/+$/, '');
  const rule = SHOP_RULES[slug];
  let items = [];
  if (c.platform === 'shopify') {
    for (let page = 1; page <= 4; page++) {
      const d = await get(`${origin}/products.json?limit=250&page=${page}`);
      const batch = (d && d.body && d.body.products) || [];
      items = items.concat(mapShopify(origin, rule && rule.hideShopify ? batch.filter((p) => !rule.hideShopify(p)) : batch));
      if (batch.length < 250) break;
    }
  } else if (c.platform === 'woocommerce') {
    // Variable products (a coffee in two sizes and three grinds) need their
    // variations: each has its own price, stock and add-to-cart query.
    const products = await wooCollection(origin, '', 4, get);
    const variations = products.some((p) => p.type === 'variable') ? await wooCollection(origin, 'type=variation', 6, get) : [];
    items = mapWoo(origin, products, variations);
  } else if (c.platform === 'squarespace-commerce' && c.catalog) {
    // ?format=json on their store page; later pages by the offset it gives.
    let url = `${c.catalog.replace(/[?#].*$/, '')}?format=json`;
    for (let page = 0; page < 4 && url; page++) {
      const d = await get(url);
      const body = d && d.body;
      items = items.concat(mapSquarespace(origin, (body && body.items) || []));
      const next = body && body.pagination && body.pagination.nextPage && body.pagination.nextPageOffset;
      url = next ? `${c.catalog.replace(/[?#].*$/, '')}?format=json&offset=${encodeURIComponent(next)}` : '';
    }
  }
  return items;
}

export default async (req) => {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  const c = COMMERCE[slug];
  if (!c || !c.feed) return json(404, { ok: false, error: 'This business has no online store we can read.' });
  // Listings store the origin as found ("https://shop.example/"); every path
  // in readCatalog and every cart link the browser builds starts with a slash.
  const origin = c.origin.replace(/\/+$/, '');
  const items = await readCatalog(c, getJson, slug);
  if (!items.length) return json(502, { ok: false, error: 'Their store did not answer. Try their website directly.', origin });
  return json(200, { ok: true, slug, platform: c.platform, origin, ...gridView(items, new URL(req.url).searchParams.get('top')) }, true);
};

// The whole catalog, or with ?top=N just the grid's share of it and the
// counts it prints ("120 items in stock", "See all").
export function gridView(items, top) {
  const n = Math.min(96, Math.max(0, Math.floor(Number(top) || 0)));
  if (!n) return { items };
  const stock = items.filter((i) => i.available);
  const pictured = stock.filter((i) => i.image);
  return { items: pictured.slice(0, n), stock: stock.length, pictured: pictured.length, top: n };
}

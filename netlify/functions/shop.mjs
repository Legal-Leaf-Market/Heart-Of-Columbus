// GET /api/shop?slug=...  A business's live catalog, from its own store.
// Shopify: /products.json. WooCommerce: the public Store API. Cached at the
// CDN for six hours so we don't lean on the shop's server.
import { COMMERCE } from '../../src/data/commerce.mjs';
import { mapShopify, mapWoo } from '../../src/commerce-core.mjs';

export const config = { path: '/api/shop' };
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.0; +https://heartofcolumbus.netlify.app)';
const json = (status, body, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300', ...(cache ? { 'netlify-cdn-cache-control': 'public, s-maxage=21600, stale-while-revalidate=86400' } : {}) },
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
  const url = (page) => `${origin}/wp-json/wc/store/v1/products?${query ? query + '&' : ''}per_page=100&orderby=id&order=asc&page=${page}`;
  const first = await get(url(1));
  const rows = [], seen = new Set();
  const take = (d) => { for (const r of (d && Array.isArray(d.body) ? d.body : [])) if (r && r.id != null && !seen.has(r.id)) { seen.add(r.id); rows.push(r); } };
  take(first);
  if (!first || !Array.isArray(first.body) || first.body.length < 100) return rows;
  const total = Math.min(maxPages, first.pages || maxPages);
  const rest = await Promise.all(Array.from({ length: Math.max(0, total - 1) }, (_, i) => get(url(i + 2))));
  rest.forEach(take);
  return rows;
}

export default async (req) => {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  const c = COMMERCE[slug];
  if (!c || !c.feed) return json(404, { ok: false, error: 'This business has no online store we can read.' });
  // Listings store the origin as found ("https://shop.example/"); every path
  // below and every cart link the browser builds starts with a slash.
  const origin = c.origin.replace(/\/+$/, '');
  let items = [];
  if (c.platform === 'shopify') {
    for (let page = 1; page <= 4; page++) {
      const d = await getJson(`${origin}/products.json?limit=250&page=${page}`);
      const batch = (d && d.body && d.body.products) || [];
      items = items.concat(mapShopify(origin, batch));
      if (batch.length < 250) break;
    }
  } else if (c.platform === 'woocommerce') {
    // Variable products (a coffee in two sizes and three grinds) need their
    // variations: each has its own price, stock and add-to-cart query.
    const products = await wooCollection(origin, '', 4);
    const variations = products.some((p) => p.type === 'variable') ? await wooCollection(origin, 'type=variation', 6) : [];
    items = mapWoo(origin, products, variations);
  }
  if (!items.length) return json(502, { ok: false, error: 'Their store did not answer. Try their website directly.', origin });
  return json(200, { ok: true, slug, platform: c.platform, origin, items }, true);
};

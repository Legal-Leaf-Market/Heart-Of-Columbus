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
  const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctl.signal });
    return r.ok ? await r.json() : null;
  } catch { return null; } finally { clearTimeout(t); }
}

export default async (req) => {
  const slug = new URL(req.url).searchParams.get('slug') || '';
  const c = COMMERCE[slug];
  if (!c || !c.feed) return json(404, { ok: false, error: 'This business has no online store we can read.' });
  let items = [];
  if (c.platform === 'shopify') {
    for (let page = 1; page <= 4; page++) {
      const d = await getJson(`${c.origin}/products.json?limit=250&page=${page}`);
      const batch = (d && d.products) || [];
      items = items.concat(mapShopify(c.origin, batch));
      if (batch.length < 250) break;
    }
  } else if (c.platform === 'woocommerce') {
    for (let page = 1; page <= 4; page++) {
      const d = await getJson(`${c.origin}/wp-json/wc/store/v1/products?per_page=100&page=${page}`);
      const batch = Array.isArray(d) ? d : [];
      items = items.concat(mapWoo(c.origin, batch));
      if (batch.length < 100) break;
    }
  }
  if (!items.length) return json(502, { ok: false, error: 'Their store did not answer. Try their website directly.', origin: c.origin });
  return json(200, { ok: true, slug, platform: c.platform, origin: c.origin, items }, true);
};

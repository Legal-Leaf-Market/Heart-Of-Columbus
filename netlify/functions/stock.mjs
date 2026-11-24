// POST /api/stock  { slug, lines: [{ productId, variantId, url }] }
// The cart asks this right before it hands a shop's items to the shop's own
// checkout: which of these are sold out at the store this minute? Catalogs
// on the site can be a few minutes old (CDN cache) or a day old (the saved
// file), and the owner's rule is in stock only, so the last word comes from
// the store itself. Answers { ok, sold: [variantId...] } and is never cached.
//
// Only stores in src/data/commerce.mjs are asked, at the origin on file
// there: the browser can name a business, never an address. A store that
// doesn't answer in time counts as "nothing sold out", so a slow shop never
// blocks a checkout; its own checkout still has the final word.
//
// Limit: an item whose store doesn't track inventory (Shopify "Track
// quantity" off) is always reported in stock, here and on the store's own
// page. Only the store owner can change that, in their store's settings.
import { COMMERCE } from '../../src/data/commerce.mjs';
import { SHOP_RULES } from '../../src/data/shop-rules.mjs';

export const config = { path: '/api/stock' };
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.2; +https://heartofcolumbus.shop)';
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

async function getJson(url, ms = 5000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: ctl.signal });
    return r.ok ? await r.json() : null;
  } catch { return null; } finally { clearTimeout(t); }
}

// Which lines are sold out, read from the store. `get` is injectable for tests.
export async function soldOut(c, lines, get = getJson, slug = '') {
  const rule = SHOP_RULES[slug];
  const origin = String(c.origin || '').replace(/\/+$/, '');
  let host = '';
  try { host = new URL(origin).host; } catch { return []; }
  const sold = new Set();
  const list = (Array.isArray(lines) ? lines : []).slice(0, 30);
  if (c.platform === 'shopify') {
    // One request per product: /products/<handle>.js lists every variant's
    // `available`, the same flag the store's own product page uses.
    const byHandle = new Map();
    for (const l of list) {
      let u;
      try { u = new URL(String(l.url || '')); } catch { continue; }
      const m = u.pathname.match(/\/products\/([^/?#]+)/);
      if (u.host !== host || !m) continue;
      if (!byHandle.has(m[1])) byHandle.set(m[1], []);
      byHandle.get(m[1]).push(String(l.variantId));
    }
    await Promise.all([...byHandle].map(async ([handle, ids]) => {
      const p = await get(`${origin}/products/${encodeURIComponent(handle)}.js`);
      if (!p) return;
      // A product the owner hid (shop-rules.mjs) counts as unavailable here.
      if (p.available === false || (rule && rule.hideShopify && rule.hideShopify(p))) { ids.forEach((id) => sold.add(id)); return; }
      for (const id of ids) {
        const v = (p.variants || []).find((x) => String(x.id) === id);
        if (v && v.available === false) sold.add(id);
      }
    }));
  } else if (c.platform === 'woocommerce') {
    // The Store API answers for a product or a variation by its own id.
    await Promise.all(list.map(async (l) => {
      const id = String(l.variantId || l.productId || '').replace(/\D/g, '');
      if (!id) return;
      const p = await get(`${origin}/wp-json/wc/store/v1/products/${id}`);
      if (p && (p.is_in_stock === false || p.is_purchasable === false)) sold.add(String(l.variantId || l.productId));
    }));
  }
  return [...sold];
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });
  let b = {};
  try { b = await req.json(); } catch { /* empty */ }
  const c = COMMERCE[String(b.slug || '')];
  if (!c || !['shopify', 'woocommerce'].includes(c.platform)) return json(200, { ok: true, sold: [] });
  const sold = await soldOut(c, b.lines, getJson, String(b.slug));
  return json(200, { ok: true, sold });
};

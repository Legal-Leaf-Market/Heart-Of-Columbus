// node scripts/check-handoff.mjs [out.json]
// Does the cart handoff actually work on the real shops? Run by the "Check
// cart handoff" workflow (this sandbox cannot reach business sites).
//
// Reads every live catalog through the DEPLOYED /api/shop, so it tests the
// code shoppers get. For each WooCommerce shop it follows up to two of our
// add-to-cart links (one variable product, one simple) in a fresh cookie
// session, then asks the shop's own Store API what that session's cart
// holds. That is the only honest pass: the cart has the item. It leaves at
// most two items in an anonymous cart that nobody checks out; it never places
// an order. Shopify is checked by catalog only: opening a cart permalink
// creates a checkout in the merchant's admin, which a test should not do.
// Squarespace has no cart link to test.
import { writeFileSync } from 'node:fs';
import { COMMERCE } from '../src/data/commerce.mjs';

const SITE = process.env.HOC_SITE || 'https://heartofcolumbus.shop';
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.0; +https://heartofcolumbus.shop)';
const out = { checked: new Date().toISOString(), site: SITE, shops: {} };

async function fetchJar(url, jar, hops = 6) {
  let u = url, res;
  for (let i = 0; i < hops; i++) {
    res = await fetch(u, { redirect: 'manual', headers: { 'User-Agent': UA, Cookie: [...jar].map(([k, v]) => `${k}=${v}`).join('; ') }, signal: AbortSignal.timeout(15000) });
    for (const c of res.headers.getSetCookie ? res.headers.getSetCookie() : []) {
      const [kv] = c.split(';'); const i2 = kv.indexOf('=');
      if (i2 > 0) jar.set(kv.slice(0, i2).trim(), kv.slice(i2 + 1).trim());
    }
    const loc = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && loc) { u = new URL(loc, u).toString(); continue; }
    break;
  }
  return { status: res.status, url: u, text: await res.text().catch(() => '') };
}

for (const [slug, c] of Object.entries(COMMERCE)) {
  if (!c.feed) continue;
  const row = { platform: c.platform };
  out.shops[slug] = row;
  try {
    const r = await fetch(`${SITE}/api/shop?slug=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(30000) });
    const d = await r.json();
    row.api = r.status;
    row.items = d.ok ? d.items.length : 0;
    row.inStock = d.ok ? d.items.filter((i) => i.available).length : 0;
    row.variable = d.ok ? d.items.filter((i) => i.variants.length > 1).length : 0;
    row.pick = d.ok ? d.items.filter((i) => i.pick).length : 0;
    if (!d.ok) {
      row.error = d.error;
      // Why did it not answer? Ask the shop directly from here, with and
      // without the query our function sends.
      if (c.platform === 'woocommerce') {
        const o = c.origin.replace(/\/+$/, '');
        row.direct = {};
        for (const q of ['per_page=100&page=1', 'per_page=100&orderby=id&order=asc&page=1']) {
          try {
            const x = await fetch(`${o}/wp-json/wc/store/v1/products?${q}`, { headers: { 'User-Agent': UA, Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
            const t = await x.text();
            row.direct[q] = `${x.status} ${x.headers.get('content-type') || ''} ${t.slice(0, 140).replace(/\s+/g, ' ')}`;
          } catch (e) { row.direct[q] = 'error ' + String(e && e.message || e); }
        }
      }
      continue;
    }
    if (c.platform !== 'woocommerce') continue;
    const live = d.items.filter((i) => i.available && !i.pick);
    const picks = [live.find((i) => i.variants.length > 1), live.find((i) => i.variants.length === 1)].filter(Boolean);
    row.adds = [];
    for (const it of picks) {
      const v = it.variants.find((x) => x.available) || it.variants[0];
      const link = v.add ? `${d.origin}/?${v.add}&quantity=1` : `${d.origin}/?add-to-cart=${encodeURIComponent(v.id)}&quantity=1`;
      const jar = new Map();
      const step = await fetchJar(link, jar);
      const cart = await fetchJar(`${d.origin}/wp-json/wc/store/v1/cart`, jar, 1);
      let inCart = null;
      try { const j = JSON.parse(cart.text); inCart = (j.items || []).map((x) => ({ id: x.id, qty: x.quantity, name: x.name, variation: x.variation })); } catch { /* not JSON */ }
      const want = String(v.id);
      row.adds.push({
        item: it.title, option: v.title, link, status: step.status,
        landed: step.url, notice: (step.text.match(/<div[^>]*class="[^"]*woocommerce-(?:message|error|info)[^"]*"[^>]*>([\s\S]{0,300}?)<\/(?:div|ul)>/i) || [])[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || '',
        cookies: [...jar.keys()].filter((k) => /woocommerce|wp_woo|cart/i.test(k)),
        cart: inCart, pass: !!(inCart && inCart.some((x) => String(x.id) === want)),
      });
    }
  } catch (e) { row.error = String(e && e.message || e); }
  console.log(slug, JSON.stringify(row));
}
const woo = Object.values(out.shops).flatMap((s) => s.adds || []);
out.summary = { shops: Object.keys(out.shops).length, wooAdds: woo.length, wooPass: woo.filter((a) => a.pass).length };
console.log('SUMMARY', JSON.stringify(out.summary));
writeFileSync(process.argv[2] || 'scripts/data/handoff-check.json', JSON.stringify(out, null, 1) + '\n');

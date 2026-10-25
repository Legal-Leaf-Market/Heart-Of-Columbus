// GET /api/probe?slugs=a,b,c  (up to 20)
// For each business with a known website, fetch the home page and report the
// cart engine it runs (Shopify, WooCommerce, BigCommerce...), whether its
// product feed is open, and any ordering or booking links it points to.
//
// Only fetches websites already in src/data/web.mjs, never a URL from the
// request, so this cannot be used to make the server fetch arbitrary hosts.
import { WEB } from '../../src/data/web.mjs';
import { detectPlatform, findProviderLinks, findOwnPages, findGiftLinks, EMBEDS } from '../../src/commerce-core.mjs';

export const config = { path: '/api/probe' };
const UA = 'Mozilla/5.0 (compatible; HeartOfColumbusBot/1.0; +https://heartofcolumbus.netlify.app)';

async function get(url, ms = 4500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,application/json' }, redirect: 'follow', signal: ctl.signal });
    const body = r.ok ? await r.text() : '';
    return { status: r.status, url: r.url, body };
  } catch (e) {
    return { status: 0, error: String(e.message || e) };
  } finally {
    clearTimeout(t);
  }
}

export async function probeOne(slug) {
  const w = WEB[slug];
  if (!w || !w.website) return { slug, ok: false, reason: 'no website' };
  let origin;
  try { origin = new URL(w.website).origin; } catch { return { slug, ok: false, reason: 'bad url' }; }
  const home = await get(w.website);
  if (!home.body) return { slug, ok: false, origin, reason: 'unreachable ' + (home.status || home.error) };
  const finalOrigin = home.url ? new URL(home.url).origin : origin;
  const platform = detectPlatform(home.body);
  const actions = (w.actions || []).map((a) => a[1]);
  const links = findProviderLinks(home.body, actions);
  const own = findOwnPages(home.body, home.url || w.website);
  const out = { slug, ok: true, origin: finalOrigin, platform, links, own: {} };
  const gift = findGiftLinks(home.body, home.url || w.website);
  if (gift) out.gift = gift;
  // Follow the site's own "Order" / "Book" page one level down: most
  // restaurants link Toast or Square from there, not from the home page.
  const follow = [];
  if (own.order && !links.some((l) => l.kind === 'order')) follow.push(['order', own.order]);
  if (own.book && !links.some((l) => l.kind === 'book')) follow.push(['book', own.book]);
  const feedCheck = platform === 'shopify' ? get(finalOrigin + '/products.json?limit=250', 3500)
    : platform === 'woocommerce' ? get(finalOrigin + '/wp-json/wc/store/v1/products?per_page=100', 3500) : null;
  const pages = await Promise.all(follow.map(([, u]) => get(u, 3500)));
  follow.forEach(([kind, u], i) => {
    const body = pages[i].body || '';
    for (const l of findProviderLinks(body)) if (!out.links.some((x) => x.id === l.id)) out.links.push(l);
    const embed = EMBEDS.find((e) => e.re.test(body));
    if (kind === 'order' && embed && !out.links.some((l) => l.kind === 'order')) out.own.order = { url: u, label: embed.label, via: embed.id };
    if (pages[i].body) out.own[kind + 'Page'] = u;
    if (!out.gift) { const g = findGiftLinks(body, u); if (g) out.gift = g; }
  });
  if (own.shop) out.own.shop = own.shop;
  if (feedCheck) {
    const f = await feedCheck;
    try { const j = JSON.parse(f.body); out.products = (platform === 'shopify' ? j.products || [] : j).length; } catch { out.products = 0; }
  }
  return out;
}

export default async (req) => {
  const slugs = (new URL(req.url).searchParams.get('slugs') || '').split(',').filter(Boolean).slice(0, 20);
  const results = await Promise.all(slugs.map(probeOne));
  return new Response(JSON.stringify(results), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
};

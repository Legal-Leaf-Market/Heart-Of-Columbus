// /api/picks?s=<slug>: an owner's own picks, read live from the shop's own
// product feed. Only a listing whose own-facts entry names a `picks.feed` can
// be asked for, so this is never an open proxy. The feed is RSS (Kawaii Katz
// publishes Ada's Picks at /feeds/ada-picks.xml); we keep the name, the photo
// and the product's page on the shop's own site, nothing else. Every link is
// rewritten onto `picks.site`, the shop's public address, so a feed still
// carrying an old domain never sends a visitor to a dead one.
//
// Nothing is invented: an empty, failed or unreadable feed answers 503 and the
// page keeps the section hidden, with no placeholder rows.
import { OWN_FACTS } from '../../src/data/own-facts.mjs';

export const config = { path: '/api/picks' };

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    'cache-control': status === 200 ? 'public, max-age=600' : 'no-store',
    ...(status === 200 ? { 'netlify-cdn-cache-control': 'public, s-maxage=1800, stale-while-revalidate=86400' } : {}),
  },
});

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (s) => String(s || '')
  .replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1')
  .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return ENT[e.toLowerCase()] ?? m;
  })
  .trim();
// The site's standing rule: no visible dashes. A spaced dash in a product
// name reads as a comma, as it does for listed names and event titles.
const noDash = (s) => s.replace(/\s+[-–—]\s+/g, ', ').replace(/[–—]/g, ', ').replace(/\s{2,}/g, ' ').trim();
const tag = (item, name) => { const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i')); return m ? decode(m[1]) : ''; };
const attr = (item, name, a) => { const m = item.match(new RegExp(`<${name}\\b[^>]*\\b${a}="([^"]+)"`, 'i')); return m ? decode(m[1]) : ''; };

// Items from the feed, in its own order: { name, url, image }. A product link
// must be a page on the shop (/p/<id>), and a photo must be https.
export function parsePicks(xml, site, max = 8) {
  const base = new URL(site);
  const out = [];
  for (const [, item] of String(xml || '').matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const name = noDash(tag(item, 'title'));
    let path = '';
    try { path = new URL(tag(item, 'link')).pathname; } catch { /* not a URL */ }
    const image = attr(item, 'enclosure', 'url') || attr(item, 'media:content', 'url');
    if (!name || !/^\/p\/[A-Za-z0-9._~-]+$/.test(path) || !/^https:\/\//i.test(image)) continue;
    out.push({ name: name.slice(0, 140), url: new URL(path, base).href, image });
    if (out.length >= max) break;
  }
  return out;
}

export default async (req) => {
  const slug = new URL(req.url).searchParams.get('s') || '';
  const picks = Object.hasOwn(OWN_FACTS, slug) ? OWN_FACTS[slug].picks : null;
  if (!picks || !picks.feed || !picks.site) return json({ error: 'no picks for this listing' }, 404);
  try {
    const res = await fetch(picks.feed, { headers: { accept: 'application/rss+xml, application/xml;q=0.9' }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return json({ error: `feed answered ${res.status}` }, 503);
    const items = parsePicks(await res.text(), picks.site, picks.max || 8);
    if (!items.length) return json({ error: 'no picks right now' }, 503);
    return json({ slug, title: picks.title, site: picks.site, items, read: new Date().toISOString() });
  } catch (e) {
    return json({ error: `feed unreachable: ${e.message}` }, 503);
  }
};

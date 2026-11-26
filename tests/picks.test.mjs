// An owner's own picks (own-facts.mjs `picks`, /api/picks, public/js/picks.js):
// read from the shop's own feed, rewritten onto its public address, and shown
// only when real picks arrive. No placeholder rows, ever.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { OWN_FACTS } from '../src/data/own-facts.mjs';
import { STICKER_SPOTS } from '../src/data/media.mjs';
import { MEDIA } from '../src/data/media.mjs';
import fn, { parsePicks } from '../netlify/functions/picks.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

const FEED = `<?xml version="1.0"?><rss><channel>
<item><title>Mochi Cat Plush &#8211; Pink</title><link>https://www.kawaiikatz.com/p/kk-mochi-cat</link>
<enclosure url="https://cdn.shopify.com/s/files/mochi.jpg" type="image/jpeg" length="0"/></item>
<item><title>Bento Box &amp; Bag</title><link>https://www.kawaiikatz.com/p/kk-bento</link>
<media:content url="https://cdn.shopify.com/s/files/bento.jpg" medium="image"/></item>
<item><title>Off the shop</title><link>https://elsewhere.example/buy/1</link><enclosure url="https://cdn.shopify.com/x.jpg"/></item>
<item><title>No safe photo</title><link>https://www.kawaiikatz.com/p/kk-x</link><enclosure url="http://insecure.example/x.jpg"/></item>
<item><title>Third</title><link>https://www.kawaiikatz.com/p/kk-third</link><enclosure url="https://cdn.shopify.com/third.jpg"/></item>
</channel></rss>`;

test('picks keep only shop pages with https photos, on the shop’s current address', () => {
  const items = parsePicks(FEED, 'https://kawaiikatz.heartofcolumbus.shop');
  assert.deepEqual(items.map((i) => i.url), [
    'https://kawaiikatz.heartofcolumbus.shop/p/kk-mochi-cat',
    'https://kawaiikatz.heartofcolumbus.shop/p/kk-bento',
    'https://kawaiikatz.heartofcolumbus.shop/p/kk-third',
  ]);
  assert.equal(items[0].name, 'Mochi Cat Plush, Pink', 'a spaced dash reads as a comma');
  assert.equal(items[1].name, 'Bento Box & Bag', 'entities decoded');
  assert.equal(items[1].image, 'https://cdn.shopify.com/s/files/bento.jpg');
  assert.equal(parsePicks(FEED, 'https://kawaiikatz.heartofcolumbus.shop', 1).length, 1, 'max respected');
  assert.deepEqual(parsePicks('', 'https://a.example'), []);
});

test('every picks entry names an https feed, an https site and a title', () => {
  for (const [slug, f] of Object.entries(OWN_FACTS)) {
    if (!f.picks) continue;
    assert.match(f.picks.feed, /^https:\/\//, slug);
    assert.match(f.picks.site, /^https:\/\/[^/]+$/, `${slug}: site is an origin`);
    assert.ok(f.picks.title && f.picks.sub, slug);
  }
});

test('the function only answers for listings with picks', async () => {
  const res = await fn(new Request('https://heartofcolumbus.shop/api/picks?s=jills-diner'));
  assert.equal(res.status, 404);
  const none = await fn(new Request('https://heartofcolumbus.shop/api/picks?s=__proto__'));
  assert.equal(none.status, 404);
});

test('the picks section ships hidden and empty, and only where there are picks', () => {
  const html = dist('b/kawaii-katz/index.html');
  const sec = html.slice(html.indexOf('data-picks="kawaii-katz"') - 80, html.indexOf('</section>', html.indexOf('data-picks="kawaii-katz"')));
  assert.match(sec, /<section [^>]*data-picks="kawaii-katz" hidden>/);
  assert.match(sec, /<div class="prod-grid"><\/div>/, 'no placeholder rows');
  assert.match(html, /\/js\/picks\.js\?v=/);
  assert.doesNotMatch(dist('b/jills-diner/index.html'), /picks\.js|data-picks=/);
});

test('stickers sit at known spots and each one shows on its page', () => {
  for (const [slug, m] of Object.entries(MEDIA)) {
    for (const s of m.stickers || []) {
      assert.ok(STICKER_SPOTS.includes(s.at), `${slug}/${s.file}: ${s.at} is not a spot`);
      assert.match(dist(`b/${slug}/index.html`), new RegExp(`class="brand-sticker at-${s.at}"`), `${slug}: ${s.at}`);
    }
  }
});

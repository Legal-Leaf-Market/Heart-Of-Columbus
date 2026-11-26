// Kawaii Katz's shop grid: a sample of an affiliate storefront, read from its
// own /api/catalog, /api/picks and /api/exclusions (src/commerce-core.mjs
// mapKawaiiKatz, netlify/functions/shop.mjs readCatalog), handed off to its
// own /cart page (kawaiiKatzCartUrl here, kawaiiKatzUrl in public/js/cart.js).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { mapKawaiiKatz, kawaiiKatzCartUrl, kawaiiKatzImage } from '../src/commerce-core.mjs';
import { readCatalog } from '../netlify/functions/shop.mjs';
import { COMMERCE } from '../src/data/commerce.mjs';

const ORIGIN = 'https://kawaiikatz.heartofcolumbus.shop';
const P = (id, vendor, extra = {}) => ({
  id, vendor, name: `Thing ${id}`, cat: 'plush', price: 12.5, kidSafe: true,
  image: `/api/img?u=${encodeURIComponent(`https://cdn.shopify.com/s/files/${id}.jpg`)}&w=600`,
  variants: [{ id: `${id}-v1`, title: 'Default Title', price: 12.5, available: true }], ...extra,
});
const CATALOG = {
  products: [
    P('a1', 'Shop A'), P('a2', 'Shop A'), P('a3', 'Shop A'),
    P('b1', 'Shop B'), P('b2', 'Shop B'),
    P('c1', 'Shop C'),
    P('u1', 'Untracked Shop'),
    P('s1', 'BRKOX'),
    P('n1', 'Shop B', { kidSafe: false }),
    P('h1', 'Shop C'),
    P('d1', 'Shop D', { name: 'Mochi Cat – Pink - Large', variants: [{ id: 'd1-v1', title: 'Small', price: 9, available: false }, { id: 'd1-v2', title: 'Large', price: 14, available: true }] }),
  ],
  debug: { untracked: ['Untracked Shop'], showcase: ['BRKOX'] },
};

test('Ada’s picks lead, in her order, even from a shop that does not pay', () => {
  const items = mapKawaiiKatz(ORIGIN, CATALOG, { picks: [{ id: 'u1' }, { id: 'b2' }], excluded: [], day: '2026-11-26' });
  assert.deepEqual(items.slice(0, 2).map((i) => i.id), ['ku1', 'kb2']);
});

test('what Ada hid and the showcase shops never appear, picked or not', () => {
  const items = mapKawaiiKatz(ORIGIN, CATALOG, { picks: [{ id: 'h1' }, { id: 's1' }], excluded: ['h1'], day: '2026-11-26' });
  const ids = items.map((i) => i.id);
  assert.ok(!ids.includes('kh1'), 'hidden product shown');
  assert.ok(!ids.includes('ks1'), 'showcase product shown');
});

test('the rest is kid-safe, from shops that pay, every shop once before any twice', () => {
  const items = mapKawaiiKatz(ORIGIN, CATALOG, { picks: [], excluded: [], day: '2026-11-26' });
  const ids = items.map((i) => i.id);
  assert.ok(!ids.includes('kn1'), 'not kid-safe');
  assert.ok(!ids.includes('ku1'), 'untracked shop in the rotation');
  const firstFour = new Set(items.slice(0, 4).map((i) => i.vendor));
  assert.equal(firstFour.size, 4, 'four shops before any repeats');
});

test('the rotation is fixed for a day and moves the next', () => {
  const day = (d) => mapKawaiiKatz(ORIGIN, CATALOG, { day: d }).map((i) => i.id).join(',');
  assert.equal(day('2026-11-26'), day('2026-11-26'));
  const days = new Set(['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30'].map(day));
  assert.ok(days.size > 1, 'the same order every day');
});

test('items read as HoC cards: its own page, the original photo, no dashes', () => {
  const d = mapKawaiiKatz(ORIGIN, CATALOG, { day: 'x' }).find((i) => i.id === 'kd1');
  assert.equal(d.url, `${ORIGIN}/p/d1`);
  assert.equal(d.title, 'Mochi Cat, Pink, Large');
  assert.equal(d.available, true);
  assert.deepEqual(d.variants.map((v) => [v.id, v.title, v.available]), [['d1-v1', 'Small', false], ['d1-v2', 'Large', true]]);
  const a = mapKawaiiKatz(ORIGIN, CATALOG, { day: 'x' }).find((i) => i.id === 'ka1');
  assert.equal(a.image, 'https://cdn.shopify.com/s/files/a1.jpg?width=480');
  assert.equal(a.variants[0].title, '');
  assert.equal(kawaiiKatzImage(ORIGIN, 'http://insecure.example/x.jpg'), '');
  assert.equal(kawaiiKatzImage(ORIGIN, ''), '');
});

test('the cart link is the same from the server and from the browser', () => {
  const lines = [{ productId: 'gbun-acdc-rag-trousers', variantId: '4412345', qty: 2 }, { productId: 'kk mochi&co', variantId: '', qty: 150 }, { productId: '', qty: 1 }];
  const server = kawaiiKatzCartUrl(ORIGIN + '/', lines);
  assert.equal(server, `${ORIGIN}/cart?i=gbun-acdc-rag-trousers~4412345~2&i=kk%20mochi%26co~~99`.replace(/~/g, '~'));
  const js = readFileSync(new URL('../public/js/cart.js', import.meta.url), 'utf8');
  const fn = js.match(/function kawaiiKatzUrl\(origin, lines\) \{[\s\S]*?\n  \}/)[0];
  const bare = (o) => String(o || '').replace(/\/+$/, '');
  const browser = new Function('bare', `${fn}; return kawaiiKatzUrl;`)(bare);
  assert.equal(browser(ORIGIN + '/', lines), server);
});

test('no sample when the hidden list does not answer; picks are optional', async () => {
  const c = COMMERCE['kawaii-katz'];
  assert.equal(c.platform, 'kawaiikatz');
  assert.equal(c.feed, true);
  const route = (over) => async (url) => {
    const path = new URL(url).pathname;
    if (path in over) return over[path];
    return { body: { '/api/catalog': CATALOG, '/api/picks': { picks: [{ id: 'b1' }] }, '/api/exclusions': { ids: [] } }[path] };
  };
  assert.deepEqual(await readCatalog(c, route({ '/api/exclusions': null }), 'kawaii-katz'), []);
  const noPicks = await readCatalog(c, route({ '/api/picks': null }), 'kawaii-katz');
  assert.ok(noPicks.length > 0);
  const withPicks = await readCatalog(c, route({}), 'kawaii-katz');
  assert.equal(withPicks[0].id, 'kb1');
});

test('the page offers the sample with a cart, and no separate picks box', () => {
  const html = readFileSync(new URL('../dist/b/kawaii-katz/index.html', import.meta.url), 'utf8');
  const sec = html.slice(html.indexOf('<section class="wrap shop-sec" id="shop">'), html.indexOf('</section>', html.indexOf('<section class="wrap shop-sec" id="shop">')));
  assert.match(sec, /data-shop="kawaii-katz"[^>]*data-live[^>]*data-limit="12"/);
  assert.match(sec, /class="brand-sticker at-shop"/);
  assert.match(sec, /Kawaii Katz earns a commission/);
  assert.doesNotMatch(html, /data-picks=|picks\.js/);
});

// The cart handoff and platform detection behind "Shop online" and "Order online".
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { detectPlatform, findProviderLinks, shopifyCartUrl, wooCartUrls, mapShopify, mapWoo } from '../src/commerce-core.mjs';

test('detects the cart engine from a home page', () => {
  assert.equal(detectPlatform('<link href="//cdn.shopify.com/s/files/x.css">'), 'shopify');
  assert.equal(detectPlatform('<body class="woocommerce-page">'), 'woocommerce');
  assert.equal(detectPlatform('<script src="https://cdn11.bigcommerce.com/s-abc/x.js">'), 'bigcommerce');
  assert.equal(detectPlatform('<html>plain</html>'), '');
});

test('finds first-party ordering and booking links, not marketplaces', () => {
  const html = '<a href="https://order.toasttab.com/online/jills-diner">Order</a> <a href="https://www.doordash.com/store/123">DoorDash</a> <a href="https://www.vagaro.com/salonx">Book</a>';
  const links = findProviderLinks(html);
  assert.deepEqual(links.map((l) => l.id).sort(), ['toast', 'vagaro']);
  assert.equal(links.find((l) => l.id === 'toast').kind, 'order');
});

test('Shopify permalink carries the whole cart and drops sold-out lines', () => {
  const url = shopifyCartUrl('https://shop.example', [
    { variantId: '11', qty: 2 }, { variantId: '22', qty: 1, available: false }, { variantId: '33', qty: 1 },
  ]);
  assert.equal(url, 'https://shop.example/cart/11:2,33:1');
  assert.equal(shopifyCartUrl('https://shop.example', []), 'https://shop.example/cart');
});

test('WooCommerce gets one add-to-cart link per line', () => {
  assert.deepEqual(wooCartUrls('https://w.example', [{ productId: '5', qty: 3 }]), ['https://w.example/?add-to-cart=5&quantity=3']);
});

test('catalog mapping keeps prices and availability honest', () => {
  const s = mapShopify('https://s.example', [{ id: 1, title: 'Mug', handle: 'mug', product_type: 'Home', images: [{ src: 'i.jpg' }], variants: [{ id: 9, title: 'Default Title', price: '12.50', available: true }] }]);
  assert.equal(s[0].price, 12.5);
  assert.equal(s[0].variants[0].title, '');
  assert.equal(s[0].url, 'https://s.example/products/mug');
  const w = mapWoo('https://w.example', [{ id: 4, name: 'Candle', prices: { price: '1800', currency_minor_unit: 2 }, is_in_stock: false, images: [] }]);
  assert.equal(w[0].price, 18);
  assert.equal(w[0].available, false);
});

test('findOwnPages picks same-origin order, book and shop pages only', async () => {
  const { findOwnPages } = await import('../src/commerce-core.mjs');
  const html = '<a href="https://doordash.com/x">Order on DoorDash</a><a href="/menu">Menu</a><a href="/order-online">Order Online</a><a href="/book-now">Book now</a><a href="/collections/all">Shop</a>';
  const o = findOwnPages(html, 'https://cafe.example/');
  assert.equal(o.order, 'https://cafe.example/order-online');
  assert.equal(o.book, 'https://cafe.example/book-now');
  assert.equal(o.shop, 'https://cafe.example/collections/all');
});

test('new providers: Square appointments on app. subdomain, Setmore', async () => {
  const { findProviderLinks } = await import('../src/commerce-core.mjs');
  const l = findProviderLinks('<a href="https://app.squareup.com/appointments/book/abc/start">x</a> <a href="https://joe.setmore.com/">y</a>');
  assert.deepEqual(l.map((x) => x.id).sort(), ['setmore', 'square-book']);
});

test('powered-by badges, assets and other towns are not booking links', async () => {
  const { findProviderLinks } = await import('../src/commerce-core.mjs');
  const html = '<a href="https://www.vagaro.com/pro/">Powered by Vagaro</a><img src="https://static.glossgenius.com/x.png">' +
    '<a href="https://www.opentable.com/r/place-westfield?restref=1">Book</a><a href="https://order.toasttab.com/egiftcards/x">Gift</a>' +
    '<a href="https://www.vagaro.com/realsalon">Book now</a><a href="https://order.online/business/-1?utm_source=sdk&#038;visitorId=9">Order</a>';
  const l = findProviderLinks(html);
  assert.deepEqual(l.map((x) => x.url).sort(), ['https://order.online/business/-1', 'https://www.vagaro.com/realsalon']);
});

test('gift cards: provider pages first, then the site’s own gift-card link', async () => {
  const { findGiftLinks } = await import('../src/commerce-core.mjs');
  assert.equal(findGiftLinks('<a href="https://order.toasttab.com/egiftcards/abc-123">Gift cards</a>', 'https://cafe.example/').id, 'toast-gift');
  assert.equal(findGiftLinks('<a href="https://app.squareup.com/gift/ML123/order">Buy</a>', 'https://cafe.example/').id, 'square-gift');
  const own = findGiftLinks('<a href="https://facebook.com/gift-cards">Gift cards</a><a href="/menu">Menu</a><a href="/pages/gift-cards?utm_source=x">Gift Cards</a>', 'https://cafe.example/');
  assert.deepEqual(own, { id: 'own', label: 'their website', url: 'https://cafe.example/pages/gift-cards' });
  assert.equal(findGiftLinks('<a href="/products/gift-card">Shop</a>', 'https://shop.example/').url, 'https://shop.example/products/gift-card');
  assert.equal(findGiftLinks('<a href="/gifts">Gifts for her</a><a href="/giftwrap">Wrap</a>', 'https://shop.example/'), null);
});

test('deep probe providers: trades, fitness, pets, OpenTable widget, own-engine shops', async () => {
  const { findProviderLinks, detectStack } = await import('../src/commerce-core.mjs');
  const text = 'https://book.housecallpro.com/book/Joes-Plumbing/abc123 https://clienthub.getjobber.com/booking/xyz/ ' +
    'https://www.wellnessliving.com/rs/schedule/studio https://booking.moego.pet/ol/landing?name=dogs ' +
    'https://www.opentable.com/widget/reservation/loader?rid=12345&type=standard https://maker.bigcartel.com/ ' +
    'https://www.vagaro.com/resources/WidgetEmbeddedLoader/abc https://booksy.com/widget/code.js?id=5';
  const ids = findProviderLinks(text).map((x) => x.id).sort();
  assert.deepEqual(ids, ['bigcartel', 'housecallpro', 'jobber', 'moego', 'opentable', 'wellnessliving']);
  assert.equal(findProviderLinks(text).find((x) => x.id === 'opentable').url, 'https://www.opentable.com/restref/client/?rid=12345');
  assert.deepEqual(detectStack('<script src="https://app.ecwid.com/script.js?123"></script><link href="https://static1.squarespace.com/x.css">'), ['squarespace', 'ecwid']);
});

test("Booksy's own help, trust and blog pages are never a business's booking link", async () => {
  const { findProviderLinks } = await import('../src/commerce-core.mjs');
  for (const u of ['https://help.booksy.com/', 'https://trust.booksy.com/', 'https://blog.booksy.com/us/hair/face-shape/', 'https://biz.booksy.com/en-us'])
    assert.deepEqual(findProviderLinks(u), [], u);
  assert.equal(findProviderLinks('https://help.booksy.com/ https://shantybarber.booksy.com/')[0].url, 'https://shantybarber.booksy.com/');
  assert.equal(findProviderLinks('https://booksy.com/en-us/256160_ciscos-barber-tattoo_barber-shop_19373_columbus')[0].id, 'booksy');
  const { COMMERCE } = await import('../src/data/commerce.mjs');
  for (const [slug, c] of Object.entries(COMMERCE))
    for (const l of [...c.book, ...c.order]) assert.doesNotMatch(l.url, /\/\/(?:help|support|biz|trust|blog|www|dl|partners?)\.booksy\.com/, slug);
});

test('a listing site that writes pages about other businesses is never their website', async () => {
  const { WEB } = await import('../src/data/web.mjs');
  for (const [slug, w] of Object.entries(WEB)) if (w.website) assert.doesNotMatch(new URL(w.website).hostname, /(?:^|\.)leanu\.pw$/, slug);
});

// Sojourn Coffee's coffees are variable products (size, grind). Woo's handler
// refuses a bare variation id, so each option carries the query its own form posts.
test('Woo variable products: every option with its own price, stock and add query', async () => {
  const { mapWoo, wooCartUrls } = await import('../src/commerce-core.mjs');
  const parent = {
    id: 10, type: 'variable', name: 'Organic Signature Blend', permalink: 'https://w.example/product/sig/', prices: { price: '1400', currency_minor_unit: 2 },
    is_in_stock: true, images: [{ src: 'b.jpg' }],
    attributes: [{ name: 'Grind', taxonomy: 'pa_grind', terms: [{ slug: 'whole-bean', name: 'Whole Bean' }, { slug: 'drip', name: 'Drip' }] }, { name: 'Size', taxonomy: null, terms: [] }],
  };
  const vars = [
    { id: 11, parent: 10, prices: { price: '1400', currency_minor_unit: 2 }, is_in_stock: false, attributes: [{ name: 'Grind', value: 'whole-bean' }, { name: 'Size', value: '12 oz' }] },
    { id: 12, parent: 10, prices: { price: '1500', currency_minor_unit: 2 }, is_in_stock: true, attributes: [{ name: 'Grind', value: 'Drip' }, { name: 'Size', value: '12 oz' }] },
    { id: 99, parent: 77, prices: { price: '100' }, attributes: [] },
  ];
  const [it] = mapWoo('https://w.example', [parent], vars);
  assert.equal(it.variants.length, 2);
  assert.equal(it.variants[0].title, 'Whole Bean / 12 oz');
  assert.equal(it.variants[0].available, false);
  assert.equal(it.price, 15, 'the price shown is the cheapest option you can buy');
  assert.equal(it.available, true);
  assert.equal(it.variants[1].add, 'add-to-cart=10&variation_id=12&attribute_pa_grind=drip&attribute_size=12%20oz');
  assert.deepEqual(wooCartUrls('https://w.example', [{ productId: '10', variantId: '12', add: it.variants[1].add, qty: 2 }]),
    ['https://w.example/?add-to-cart=10&variation_id=12&attribute_pa_grind=drip&attribute_size=12%20oz&quantity=2']);
  // A value that matches no declared term, or an "any" option, gets no link.
  const [odd] = mapWoo('https://w.example', [parent], [{ id: 13, parent: 10, prices: { price: '900' }, is_in_stock: true, attributes: [{ name: 'Grind', value: 'espresso' }] }]);
  assert.equal(odd.variants[0].add, undefined);
  assert.equal(odd.available, false);
  // No variations read at all: shown, but chosen on their site.
  const [blind] = mapWoo('https://w.example', [parent], []);
  assert.equal(blind.pick, true);
  assert.deepEqual(wooCartUrls('https://w.example', [{ productId: '10', pick: true, qty: 1 }]), []);
});

test('the Woo sweep dedupes a store that ignores page, and fans out the rest', async () => {
  const { wooCollection } = await import('../netlify/functions/shop.mjs');
  const page = (from) => Array.from({ length: 100 }, (_, i) => ({ id: from + i }));
  const asked = [];
  const stuck = async (url) => { asked.push(url); return { body: page(1), pages: 3 }; };
  assert.equal((await wooCollection('https://w.example', '', 4, stuck)).length, 100);
  assert.equal(asked.length, 3);
  assert.ok(asked.every((u) => /orderby=id&order=asc/.test(u)));
  const good = async (url) => { const p = Number(url.match(/&page=(\d+)/)[1]); return { body: p < 3 ? page(p * 100) : [{ id: 999 }], pages: 3 }; };
  assert.equal((await wooCollection('https://w.example', 'type=variation', 6, good)).length, 201);
});

// Square's shared assets on Gramz Bakery's own square.site page named a
// different restaurant's store; the import kept it as a second "Square
// Online" button that went to someone else.
test('a Square Online business links only its own store, once', async () => {
  const { COMMERCE } = await import('../src/data/commerce.mjs');
  assert.deepEqual(COMMERCE['gramz-bakery-and-cafe'].order, [{ label: 'Square Online', url: 'https://gramz-bakery.square.site/' }]);
  for (const [slug, c] of Object.entries(COMMERCE)) {
    const labels = c.order.map((o) => o.label);
    assert.equal(new Set(labels).size, labels.length, `${slug} lists one provider twice`);
  }
});

// The shape Sojourn Coffee's live Store API returned (2026-11-18): the
// variation row carries no attributes, only "Attribute: Whole Bean". The
// option list must read "Whole Bean" and the add link must carry the
// attribute, from the parent's own variations list or from that string.
test('Woo variations whose attributes are only on the parent or in the text', async () => {
  const { mapWoo } = await import('../src/commerce-core.mjs');
  const parent = {
    id: 692, type: 'variable', name: 'Organic Black Magic', prices: { price: '1650' }, is_in_stock: true, images: [{ src: 'b.jpg' }],
    attributes: [{ name: 'Attribute', taxonomy: null, has_variations: true, terms: [{ name: 'Whole Bean', slug: 'whole-bean' }, { name: 'Ground', slug: 'ground' }] }],
    variations: [{ id: 1909, attributes: [{ name: 'Attribute', value: 'Whole Bean' }] }],
  };
  const vars = [
    { id: 1909, parent: 692, prices: { price: '1650' }, is_in_stock: true, attributes: [], variation: 'Attribute: Whole Bean' },
    { id: 1955, parent: 692, prices: { price: '1650' }, is_in_stock: true, attributes: [], variation: 'Attribute: Ground' },
  ];
  const [it] = mapWoo('https://w.example', [parent], vars);
  assert.deepEqual(it.variants.map((v) => v.title), ['Whole Bean', 'Ground']);
  assert.equal(it.variants[0].add, 'add-to-cart=692&variation_id=1909&attribute_attribute=Whole%20Bean');
  assert.equal(it.variants[1].add, 'add-to-cart=692&variation_id=1955&attribute_attribute=Ground', 'from the text when the parent list lacks it');
  // Two attributes in one string, a taxonomy one among them.
  const two = { ...parent, attributes: [{ name: 'Size', taxonomy: 'pa_size', terms: [{ name: '12 oz', slug: '12-oz' }] }, { name: 'Grind', taxonomy: null, terms: [] }], variations: [] };
  const [t2] = mapWoo('https://w.example', [two], [{ id: 5, parent: 692, prices: { price: '100' }, attributes: [], variation: 'Size: 12 oz, Grind: Drip, fine' }]);
  assert.equal(t2.variants[0].add, 'add-to-cart=692&variation_id=5&attribute_pa_size=12-oz&attribute_grind=Drip%2C%20fine');
  assert.equal(t2.variants[0].title, '12 oz / Drip, fine');
});

test('Squarespace: both item shapes, stock, sale price, buy on their site', async () => {
  const { mapSquarespace } = await import('../src/commerce-core.mjs');
  const items = mapSquarespace('https://sq.example/', [
    // 7.1 shape: variants on the item, money as strings.
    { id: 'a1', title: 'Sage Bundle', fullUrl: '/shop/p/sage', assetUrl: 'https://images.squarespace-cdn.com/x.jpg', categories: ['Herbs'],
      variants: [{ id: 'v1', priceMoney: { value: '12.00' }, stock: { quantity: 0 }, attributes: { Size: 'Small' } },
        { id: 'v2', priceMoney: { value: '20.00' }, onSale: true, salePriceMoney: { value: '15.00' }, stock: { unlimited: true }, attributes: { Size: 'Large' } }] },
    // Older shape: structuredContent, cents.
    { id: 'b2', title: 'Candle', fullUrl: '/shop/p/candle', assetUrl: 'https://images.squarespace-cdn.com/y.jpg?v=1',
      structuredContent: { variants: [{ sku: 'C1', price: 1800, qtyInStock: 3 }] } },
    { id: 'c3', title: 'No price', variants: [{ id: 'z', priceMoney: { value: '0' } }] },
    { id: 'd4', title: 'Blog post' },
  ]);
  assert.equal(items.length, 2);
  assert.equal(items[0].url, 'https://sq.example/shop/p/sage');
  assert.equal(items[0].image, 'https://images.squarespace-cdn.com/x.jpg?format=500w');
  assert.deepEqual(items[0].variants.map((v) => [v.title, v.price, v.available]), [['Small', 12, false], ['Large', 15, true]]);
  assert.equal(items[0].price, 15, 'the price shown is the cheapest option in stock');
  assert.equal(items[0].buyOnSite, true);
  assert.equal(items[1].price, 18);
  assert.equal(items[1].image, 'https://images.squarespace-cdn.com/y.jpg?v=1&format=500w');
});

test('Shopify permalink carries the pickup note and Shopify ref tracking', async () => {
  const { shopifyCartUrlWith } = await import('../src/commerce-core.mjs');
  assert.equal(shopifyCartUrlWith('https://s.example', [{ variantId: '7', qty: 2 }], { note: 'Pickup, please.', ref: 'heartofcolumbus' }),
    'https://s.example/cart/7:2?note=Pickup%2C%20please.&ref=heartofcolumbus');
  assert.equal(shopifyCartUrlWith('https://s.example', [{ variantId: '7', qty: 1 }]), 'https://s.example/cart/7:1');
});

test('a store that refuses the sorted query is read without it', async () => {
  const { wooCollection } = await import('../netlify/functions/shop.mjs');
  const asked = [];
  const picky = async (url) => { asked.push(url); return /orderby=/.test(url) ? null : { body: [{ id: 1 }, { id: 2 }], pages: 1 }; };
  assert.equal((await wooCollection('https://w.example', '', 4, picky)).length, 2);
  assert.equal(asked.length, 2);
  assert.ok(!/orderby/.test(asked[1]));
});

test('Shopify card photos ask the CDN for 480 px; other hosts pass as is', async () => {
  const { shopifyImage } = await import('../src/commerce-core.mjs');
  assert.equal(shopifyImage('https://cdn.shopify.com/s/files/1/a.jpg?v=1'), 'https://cdn.shopify.com/s/files/1/a.jpg?v=1&width=480');
  assert.equal(shopifyImage('https://shop.example/cdn/shop/files/a.jpg'), 'https://shop.example/cdn/shop/files/a.jpg?width=480');
  assert.equal(shopifyImage('https://cdn.shopify.com/a.jpg?width=200'), 'https://cdn.shopify.com/a.jpg?width=200');
  assert.equal(shopifyImage('https://images.example/a.jpg'), 'https://images.example/a.jpg');
  assert.equal(shopifyImage(''), '');
});

test('/api/shop ?top sends only the grid: in stock with a photo, plus counts', async () => {
  const { gridView } = await import('../netlify/functions/shop.mjs');
  const items = [
    { id: 'a', available: true, image: 'a.jpg' }, { id: 'b', available: false, image: 'b.jpg' },
    { id: 'c', available: true, image: '' }, { id: 'd', available: true, image: 'd.jpg' }, { id: 'e', available: true, image: 'e.jpg' },
  ];
  assert.deepEqual(gridView(items, null), { items });
  const v = gridView(items, '2');
  assert.deepEqual(v.items.map((i) => i.id), ['a', 'd']);
  assert.equal(v.stock, 4);
  assert.equal(v.pictured, 3);
  assert.equal(gridView(items, '9999').top, 96);
});

test('/api/shop answers go to the shared (durable) CDN cache', async () => {
  const src = (await import('node:fs')).readFileSync(new URL('../netlify/functions/shop.mjs', import.meta.url), 'utf8');
  assert.match(src, /netlify-cdn-cache-control': 'public, durable,/);
});

test('JSON-LD reader: products, item lists and menus from any site builder', async () => {
  const { mapJsonLd } = await import('../src/commerce-core.mjs');
  const page = (o) => `<html><script type="application/ld+json">${JSON.stringify(o)}</script></html>`;
  const p = mapJsonLd(page({ '@context': 'https://schema.org', '@type': 'Product', name: 'Walnut Cutting Board', sku: 'WB1', image: ['/img/board.jpg'], offers: { '@type': 'Offer', price: '45.00', availability: 'https://schema.org/InStock' } }), 'https://shop.example/p/board');
  assert.equal(p.length, 1);
  assert.deepEqual([p[0].title, p[0].price, p[0].available, p[0].image, p[0].buyOnSite], ['Walnut Cutting Board', 45, true, 'https://shop.example/img/board.jpg', true]);
  const sold = mapJsonLd(page({ '@type': 'Product', name: 'Mug', offers: [{ price: 12, availability: 'OutOfStock' }] }), 'https://s.example/');
  assert.equal(sold[0].available, false);
  // No price, no item: nothing is guessed.
  assert.equal(mapJsonLd(page({ '@type': 'Product', name: 'Mystery' }), 'https://s.example/').length, 0);
  const list = mapJsonLd(page({ '@graph': [{ '@type': 'ItemList', itemListElement: [{ '@type': 'ListItem', item: { '@type': 'Product', name: 'A', url: '/a', offers: { '@type': 'AggregateOffer', lowPrice: '9.5' } } }, { '@type': 'ListItem', item: { '@type': 'Product', name: 'B', offers: { price: 3 } } }] }] }), 'https://s.example/shop');
  assert.deepEqual(list.map((i) => [i.title, i.price, i.url]), [['A', 9.5, 'https://s.example/a'], ['B', 3, 'https://s.example/shop']]);
  const menu = mapJsonLd(page({ '@type': 'Restaurant', name: 'Diner', hasMenu: { '@type': 'Menu', hasMenuSection: [{ '@type': 'MenuSection', name: 'Breakfast', hasMenuItem: [{ '@type': 'MenuItem', name: 'Two Eggs', offers: { '@type': 'Offer', price: '6.50' } }, { '@type': 'MenuItem', name: 'Toast' }] }] } }), 'https://diner.example/menu');
  assert.deepEqual(menu.map((i) => [i.title, i.price, i.type, i.kind]), [['Two Eggs', 6.5, 'Breakfast', 'menu']]);
  assert.equal(mapJsonLd('<script type="application/ld+json">{broken</script>', 'https://x.example/').length, 0);
});

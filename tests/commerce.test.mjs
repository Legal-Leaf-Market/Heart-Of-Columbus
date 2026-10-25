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

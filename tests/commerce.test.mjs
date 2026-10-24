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

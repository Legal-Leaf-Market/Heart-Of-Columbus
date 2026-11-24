// Owner rules (src/data/shop-rules.mjs) hide products everywhere a catalog
// is read: the live feed, the saved snapshot and the checkout stock check.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SHOP_RULES } from '../src/data/shop-rules.mjs';
import { readCatalog } from '../netlify/functions/shop.mjs';
import { soldOut } from '../netlify/functions/stock.mjs';

const LLM = 'legal-leaf-market-cafe';
const rule = SHOP_RULES[LLM];
const product = (id, product_type, tags = [], handle = 'p' + id) => ({ id, title: 'P' + id, handle, product_type, tags, images: [{ src: 'https://cdn.shopify.com/a.jpg' }], variants: [{ id: id * 10, title: 'Default Title', price: '5.00', available: true }] });

test('every rule names who set it, when and why', () => {
  for (const [slug, r] of Object.entries(SHOP_RULES)) {
    assert.ok(r.by && /^\d{4}-\d\d-\d\d$/.test(r.on) && r.why, slug);
  }
});

test('Legal Leaf Market Cafe: no nicotine, cigar, tobacco or Nicotia products', () => {
  assert.ok(rule.hideShopify(product(1, 'Nicotine Pouches')));
  assert.ok(rule.hideShopify(product(2, 'Nicotine Long Cut')));
  assert.ok(rule.hideShopify(product(3, 'Cigars')));
  assert.ok(rule.hideShopify(product(4, 'Tobacco Wraps')));
  assert.ok(rule.hideShopify(product(5, 'Accessories', ['cigar-accessories', 'nicotia'])));
  assert.ok(rule.hideShopify({ type: 'Nicotine Pouches', tags: [] }), 'the .js shape uses `type`');
  assert.ok(!rule.hideShopify(product(6, 'CBD Edibles', ['cbd'])));
  assert.ok(!rule.hideShopify(product(7, 'Herbal Smokes', ['herbal-leaf'])));
});

test('the live reader and the saved file drop hidden products', async () => {
  const get = async () => ({ body: { products: [product(1, 'Nicotine Pouches'), product(2, 'CBD Edibles'), product(3, 'Cigars', ['nicotia'])] } });
  const items = await readCatalog({ platform: 'shopify', origin: 'https://shop.example' }, get, LLM);
  assert.deepEqual(items.map((i) => i.id), ['s2']);
  const all = await readCatalog({ platform: 'shopify', origin: 'https://shop.example' }, get, 'someone-else');
  assert.equal(all.length, 3, 'other stores are untouched');
  const saved = JSON.parse(readFileSync(new URL('../public/catalogs/legal-leaf-market-cafe.json', import.meta.url), 'utf8'));
  for (const i of saved.items) assert.doesNotMatch(i.type || '', /nicotine|^cigars$|tobacco/i, i.title);
});

test('the checkout stock check pulls hidden products and sold-out variants', async () => {
  const c = { platform: 'shopify', origin: 'https://shop.example/' };
  const pages = {
    'https://shop.example/products/pouch.js': { available: true, type: 'Nicotine Pouches', tags: ['nicotia'], variants: [{ id: 10, available: true }] },
    'https://shop.example/products/tea.js': { available: true, type: 'Herbal Teas', tags: [], variants: [{ id: 20, available: true }, { id: 21, available: false }] },
  };
  const get = async (u) => pages[u] || null;
  const lines = [
    { variantId: 10, url: 'https://shop.example/products/pouch' },
    { variantId: 20, url: 'https://shop.example/products/tea' },
    { variantId: 21, url: 'https://shop.example/products/tea' },
    { variantId: 99, url: 'https://elsewhere.example/products/x' },
  ];
  assert.deepEqual((await soldOut(c, lines, get, LLM)).sort(), ['10', '21']);
  assert.deepEqual(await soldOut(c, lines, get, 'someone-else'), ['21']);
});

// Facts a business publishes on its own website beat the listings we swept,
// but only with the page they came from and the day we checked it.
// Live shop listings show only what is in stock and photographed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { OWN_FACTS } from '../src/data/own-facts.mjs';
import { directory } from '../src/data/directory.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

test('every own fact names a listed business, its own page and the day we checked', () => {
  for (const [slug, f] of Object.entries(OWN_FACTS)) {
    assert.ok(bySlug[slug], `${slug}: not a directory slug`);
    assert.match(f.source, /^https:\/\//, `${slug}: source`);
    assert.match(f.checked, /^\d{4}-\d{2}-\d{2}$/, `${slug}: checked`);
    for (const [d, o, c] of f.hours || []) assert.ok(d >= 0 && d <= 6 && o < c && c <= 1440, `${slug}: hours row ${d}`);
  }
});

test('the business page shows the owner\'s address, hours and where they came from', () => {
  for (const [slug, f] of Object.entries(OWN_FACTS)) {
    const b = bySlug[slug];
    if (f.address) assert.equal(b.address, f.address);
    if (f.hours) assert.deepEqual(b.hours, f.hours);
    const html = dist(`b/${slug}/index.html`);
    if (f.address) assert.ok(html.includes(f.address), `${slug}: address on the page`);
    if (f.where) assert.ok(html.includes(f.where), `${slug}: where on the page`);
    if (f.hours) assert.ok(html.includes(`href="${f.source}"`), `${slug}: hours cite the owner's page`);
  }
});

test('a family business line links a real listing, both ways when both say so', () => {
  for (const [slug, f] of Object.entries(OWN_FACTS)) {
    for (const k of f.kin || []) {
      assert.ok(bySlug[k.slug], `${slug}: kin ${k.slug} is not a directory slug`);
      assert.ok(dist(`b/${slug}/index.html`).includes(`href="/b/${k.slug}/"`), `${slug}: links ${k.slug}`);
    }
  }
  const t = dist('b/turtles-flowers/index.html');
  assert.ok(t.includes('id="plan-the-day"'), 'a florist listed in Events gets the plan-the-day rail');
  assert.ok(t.includes('href="/b/rabbits-balloons/"'));
});

test('Cookie Paradise shows the trailer on 25th St, not the old Chamber address', () => {
  const html = dist('b/cookie-paradise-llc/index.html');
  assert.ok(html.includes('3950 25th St'));
  assert.ok(!html.includes('3346 Cox Ln'));
});

test('live shop listings show only items in stock and photographed', () => {
  const cart = readFileSync(new URL('../public/js/cart.js', import.meta.url), 'utf8');
  assert.match(cart, /i\.available && i\.image/);
  assert.doesNotMatch(cart, /prod-ph/, 'no placeholder box for a product with no photo');
});

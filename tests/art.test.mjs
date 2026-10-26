// Pages load the WebP copies of public/art/ (scripts/art-webp.py writes them).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url).pathname;
const art = readdirSync(root + 'public/art');

test('every PNG has its WebP, except the app icons that must stay PNG', () => {
  for (const f of art.filter((f) => f.endsWith('.png') && !f.startsWith('sports-app-icon')))
    assert.ok(art.includes(f.replace(/\.png$/, '.webp')), `${f}: run python3 scripts/art-webp.py`);
});

test('every art path a built page, stylesheet or script names exists, and none is a PNG we have a WebP for', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(d + f).isDirectory() ? walk(d + f + '/') : /\.(html|css|js)$/.test(f) ? [d + f] : []));
  const seen = new Set();
  // The build swaps local images for resized copies in /assets/images/; its
  // manifest says which art file each copy came from.
  const from = new Map(Object.entries(JSON.parse(readFileSync(root + 'dist/assets/images/manifest.json', 'utf8')))
    .flatMap(([src, { variants }]) => variants.map((v) => [v.url.split('?')[0], src])));
  for (const f of walk(root + 'dist/')) {
    const text = readFileSync(f, 'utf8');
    for (const m of text.matchAll(/\/art\/([a-z0-9-]+\.(?:png|webp))/g)) seen.add(m[1]);
    for (const m of text.matchAll(/\/assets\/images\/[a-z0-9-]+\.webp/g)) { const src = from.get(m[0]); if (src?.startsWith('/art/')) seen.add(src.slice(5)); }
  }
  assert.ok(seen.size > 20);
  for (const f of seen) {
    assert.ok(existsSync(root + 'public/art/' + f), f);
    if (f.endsWith('.png')) assert.ok(!art.includes(f.replace(/\.png$/, '.webp')), `${f} should load as WebP`);
  }
});

test('scripts and stylesheets cached for a year are always loaded by a hashed URL', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(d + f).isDirectory() ? walk(d + f + '/') : f.endsWith('.html') ? [d + f] : []));
  for (const f of walk(root + 'dist/'))
    for (const m of readFileSync(f, 'utf8').matchAll(/(?:src|href)="(\/(?:js|css|assets)\/[^"]+)"/g))
      assert.match(m[1], /\?v=[0-9a-f]{10}$/, `${f.slice(root.length)}: ${m[1]}`);
});

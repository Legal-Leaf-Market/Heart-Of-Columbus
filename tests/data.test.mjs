// Guards the directory against the mistakes most likely to mislead someone.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { businesses, prototypes, BADGES } from '../src/data/businesses.mjs';

test('every business has a unique slug, a real-looking phone and known badges', () => {
  const slugs = new Set();
  for (const b of businesses) {
    assert.ok(!slugs.has(b.slug), `duplicate slug ${b.slug}`);
    slugs.add(b.slug);
    if (b.phone) assert.match(b.phone, /^\(\d{3}\) \d{3}-\d{4}$/, b.name);
    for (const k of b.badges) assert.ok(BADGES[k], `${b.name}: unknown badge ${k}`);
    assert.ok(b.address && b.area.length, `${b.name}: needs an address and area tags`);
  }
});

test('every prototype is built and labeled as a demo', () => {
  for (const slug of prototypes) {
    const b = businesses.find((x) => x.slug === slug);
    assert.ok(b?.demo, `${slug} needs a demo path`);
    const file = new URL(`../dist${b.demo}index.html`, import.meta.url);
    assert.ok(existsSync(file), `${b.demo} was not built`);
    const html = readFileSync(file, 'utf8');
    assert.match(html, /concept demo/i, `${b.demo} must carry the demo banner`);
    assert.match(html, /noindex/, `${b.demo} must be noindex`);
  }
});

test('no em dashes anywhere a person reads', () => {
  for (const f of ['index.html', ...prototypes.map((s) => businesses.find((b) => b.slug === s).demo.slice(1) + 'index.html')]) {
    assert.ok(!readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8').includes('—'), f);
  }
});

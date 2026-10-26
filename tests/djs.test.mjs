// "Columbus DJs" lists only what a cited page says, and leads with the featured DJ.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { DJS, DJ_ITEMS } from '../src/data/djs.mjs';
import { directory } from '../src/data/directory.mjs';

const slugs = new Set(directory.map((b) => b.slug));

test('every DJ has a source and a checked date, and so does every extra fact', () => {
  assert.ok(DJ_ITEMS.length);
  for (const i of DJ_ITEMS) {
    assert.match(i.source, /^https:\/\//, i.slug);
    assert.match(i.checked, /^\d{4}-\d{2}-\d{2}$/, i.slug);
    for (const [text, u] of i.more || []) assert.ok(text && /^https:\/\//.test(u), `${i.slug}: ${text}`);
    if (i.listing) assert.ok(slugs.has(i.listing), `${i.slug}: listing ${i.listing}`);
  }
});

test('Crossroads Wedding Co. leads the page', () => {
  assert.equal(DJS[0].id, 'featured');
  assert.equal(DJS[0].items[0].slug, 'crossroads-wedding-co');
});

test('the page lists each DJ, stays noindex and is linked from the events category', () => {
  const html = readFileSync(new URL('../dist/djs/index.html', import.meta.url), 'utf8');
  for (const i of DJ_ITEMS) assert.ok(html.includes(`id="${i.slug}"`), i.slug);
  assert.ok(html.indexOf('id="crossroads-wedding-co"') < html.indexOf('id="matty-o-entertainment"'));
  assert.ok(html.includes('not affiliated'));
  assert.ok(html.includes('noindex'));
  assert.ok(readFileSync(new URL('../dist/c/events/index.html', import.meta.url), 'utf8').includes('href="/djs/"'));
});

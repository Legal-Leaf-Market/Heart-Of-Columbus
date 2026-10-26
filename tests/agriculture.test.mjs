// Farm country only says what a cited page says, and the grain prices carry
// their report and date.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { AG, GRAIN } from '../src/data/agriculture.mjs';
import { agBusinesses } from '../src/pages/agriculture-pages.mjs';

const items = AG.flatMap((g) => g.items);

test('every item has a source and a checked date, and so does every extra fact', () => {
  assert.ok(items.length);
  for (const i of items) {
    assert.match(i.source, /^https:\/\//, i.slug);
    assert.match(i.checked, /^\d{4}-\d{2}-\d{2}$/, i.slug);
    for (const [text, u] of i.more || []) assert.ok(text && /^https:\/\//.test(u), `${i.slug}: ${text}`);
    assert.ok(!/[—–]| - /.test(JSON.stringify(i)), `${i.slug}: dash`);
  }
});

test('every listed business is in the directory', () => {
  const want = AG.flatMap((g) => g.businesses || []);
  assert.equal(agBusinesses().length, want.length);
});

test('grain prices name their report and date, and the numbers add up', () => {
  assert.match(GRAIN.source, /^https:\/\/www\.ams\.usda\.gov\//);
  assert.match(GRAIN.asOf, /^\d{4}-\d{2}-\d{2}$/);
  for (const c of GRAIN.cash) assert.ok(c.low <= c.avg && c.avg <= c.high && c.yearAgo > 0, c.crop);
  const html = readFileSync(new URL('../dist/agriculture/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes(GRAIN.source.replace(/&/g, '&amp;')));
  assert.ok(html.includes('Thursday, October 22, 2026') || !GRAIN.asOf.startsWith('2026-10-22'));
  for (const i of items) assert.ok(html.includes(`id="${i.slug}"`), i.slug);
  assert.ok(html.includes('noindex'));
  assert.match(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), /href="\/agriculture\/"/);
});

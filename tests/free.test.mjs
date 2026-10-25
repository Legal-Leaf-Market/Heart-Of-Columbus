// "Free in Columbus" only says something is free when a cited page says so.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { FREE } from '../src/data/free.mjs';
import { landmarkBySlug } from '../src/data/landmarks.mjs';

const items = FREE.flatMap((g) => g.items);

test('every free item has a source and a checked date, and so does every extra fact', () => {
  assert.ok(items.length);
  for (const i of items) {
    assert.match(i.source, /^https:\/\//, i.slug);
    assert.match(i.checked, /^\d{4}-\d{2}-\d{2}$/, i.slug);
    for (const [text, u] of i.more || []) assert.ok(text && /^https:\/\//.test(u), `${i.slug}: ${text}`);
    if (i.landmark) assert.ok(landmarkBySlug[i.landmark], `${i.slug}: landmark ${i.landmark}`);
    assert.ok(!JSON.stringify(i).includes('—'), `${i.slug}: em dash`);
  }
});

test('the page lists each item and only street-visible landmarks', () => {
  const html = readFileSync(new URL('../dist/free/index.html', import.meta.url), 'utf8');
  for (const i of items) assert.ok(html.includes(`id="${i.slug}"`), i.slug);
  assert.ok(!html.includes('href="/l/miller/"'), 'Miller House has no public access');
  assert.ok(html.includes('noindex'));
});

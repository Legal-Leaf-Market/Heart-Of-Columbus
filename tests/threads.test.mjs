import { test } from 'node:test';
import assert from 'node:assert/strict';
import { THREADS, DECADES, gaps } from '../src/print/threads.mjs';
import { ARTICLES } from '../src/data/history/index.mjs';
import { EDITION as E } from '../src/print/edition-2026-12.mjs';

const byPath = new Map(ARTICLES.map((a) => [`${a.group}/${a.slug}`, a]));

test('every stop is a real history article from its own decade', () => {
  for (const t of THREADS) {
    assert.deepEqual(Object.keys(t.stops), DECADES, `${t.month} lists every decade in order`);
    for (const [d, path] of Object.entries(t.stops)) {
      if (!path) continue;
      assert.ok(byPath.has(path), `${t.month}: ${path} exists`);
      assert.equal(byPath.get(path).group, d, `${t.month}: ${path} is from the ${d}`);
    }
  }
});

test('one thread a month, in order, each with an idea and a lead for any gap', () => {
  const months = THREADS.map((t) => t.month);
  assert.deepEqual(months, [...months].sort());
  assert.equal(new Set(months).size, months.length);
  for (const t of THREADS) {
    assert.ok(t.title && t.idea, t.month);
    if (DECADES.some((d) => !t.stops[d])) assert.ok(t.lead, `${t.month} has gaps, so it needs a lead`);
  }
  assert.ok(gaps().every((g) => g.month && g.decade));
});

test('December matches the edition it prints in', () => {
  const dec = THREADS.find((t) => t.month === '2026-12');
  assert.deepEqual(Object.values(dec.stops), E.gathers.map((g) => g[0]));
});

test('no dashes a reader would see', () => {
  for (const t of THREADS) for (const s of [t.title, t.idea, t.lead || '']) assert.doesNotMatch(s, /[–—]| - /, t.month);
});

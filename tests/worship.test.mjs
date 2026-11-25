// Places of worship (/worship/): every row is sourced, a mailing address is
// never shown as a place, and the page never prints a service time.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { WORSHIP, FAITH_NAMES } from '../src/data/worship.mjs';
import { worshipGroups, worshipIndex } from '../src/pages/worship-pages.mjs';

test('every congregation has a faith, a town and dated sources', () => {
  assert.ok(WORSHIP.length > 50);
  for (const r of WORSHIP) {
    assert.ok(FAITH_NAMES[r.faith], `${r.name}: faith ${r.faith}`);
    assert.ok(r.town, `${r.name}: town`);
    assert.ok(r.sources.length, `${r.name}: sources`);
    for (const s of r.sources) assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/, `${r.name}: ${s.name} date`);
  }
});

test('a PO box is never shown as where a congregation meets', () => {
  for (const r of WORSHIP) assert.doesNotMatch(r.address, /\bP\.?\s*O\.?\s*BOX\b/i, r.name);
});

test('slugs are unique and every row lands in a group', () => {
  assert.equal(new Set(WORSHIP.map((r) => r.slug)).size, WORSHIP.length);
  assert.equal(worshipGroups().reduce((n, g) => n + g.rows.length, 0), WORSHIP.length);
});

test('the page lists every congregation, links the visit page, and prints no service times', () => {
  const html = readFileSync(new URL('../dist/worship/index.html', import.meta.url), 'utf8');
  assert.equal((html.match(/class="vs-sec wp-item"/g) || []).length, WORSHIP.length);
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /\b\d{1,2}(:\d{2})?\s*(AM|PM)\b/i, 'no service times typed by us');
  assert.match(readFileSync(new URL('../dist/visit/index.html', import.meta.url), 'utf8'), /href="\/worship\/"/);
});

test('the header search finds congregations and every result lands on a row of /worship/', () => {
  const page = readFileSync(new URL('../dist/worship/index.html', import.meta.url), 'utf8');
  const built = JSON.parse(readFileSync(new URL('../dist/data/worship.json', import.meta.url), 'utf8'));
  assert.deepEqual(built, JSON.parse(JSON.stringify(worshipIndex())));
  assert.equal(built.rows.length, WORSHIP.length);
  for (const r of built.rows) {
    assert.ok(page.includes(`id="${r.s}"`), `${r.n}: no row on /worship/ for the search to land on`);
    assert.ok(built.faiths[r.f], `${r.n}: faith name for the search line`);
    assert.doesNotMatch(r.a || '', /\bP\.?\s*O\.?\s*BOX\b/i);
    assert.doesNotMatch(r.n, /\s[-\u2013\u2014]\s/, `${r.n}: a dash the search would print`);
  }
  const js = readFileSync(new URL('../public/js/site.js', import.meta.url), 'utf8');
  assert.match(js, /fetch\('\/data\/worship\.json'\)/);
  assert.match(js, /href="\/worship\/#/);
});

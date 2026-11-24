// Apartments and landlords (/housing/): every place is sourced, no rents or
// openings are typed by us, brokerages are not listed as landlords, and the
// help center links the page.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { HOUSING, HOUSING_KINDS } from '../src/data/housing.mjs';
import { managers } from '../src/pages/housing-pages.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('every place has a kind, a town and dated sources, and slugs are unique', () => {
  assert.ok(HOUSING.length >= 5);
  for (const r of HOUSING) {
    assert.ok(HOUSING_KINDS[r.kind], `${r.name}: kind`);
    assert.ok(r.town, `${r.name}: town`);
    assert.ok(r.sources.length, `${r.name}: sources`);
    for (const s of r.sources) assert.match(s.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
  assert.equal(new Set(HOUSING.map((r) => r.slug)).size, HOUSING.length);
  assert.ok(!HOUSING.some((r) => /realty|united way/i.test(r.name)), 'brokerages and charities are not landlords');
});

test('the page lists every place and manager, the ways to find a place, and no rents', () => {
  const html = dist('housing/index.html');
  assert.equal((html.match(/class="vs-sec hs-item"/g) || []).length, HOUSING.length + managers().length);
  for (const slug of ['housing-list', 'housing-authority', 'behind-on-rent']) assert.match(html, new RegExp(`/help/#${slug}`));
  assert.doesNotMatch(html.replace(/<[^>]+>/g, ' '), /\$\s?\d/, 'no rents typed by us');
  assert.match(dist('help/index.html'), /href="\/housing\/"/);
});

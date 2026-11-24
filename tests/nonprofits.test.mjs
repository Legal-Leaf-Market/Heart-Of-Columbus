// Nonprofits (/nonprofits/): no congregation or private foundation, no street
// address (a small group's IRS address is often a home), every row links its
// filings, and the help center links the page.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { NONPROFITS, NONPROFIT_GROUPS } from '../src/data/nonprofits.mjs';
import { WORSHIP } from '../src/data/worship.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('rows are grouped, keyed by EIN, keep no street, and leave out trusts and credit unions', () => {
  assert.ok(NONPROFITS.length > 200);
  for (const r of NONPROFITS) {
    assert.ok(NONPROFIT_GROUPS[r.group], `${r.name}: group`);
    assert.match(r.ein, /^\d{9}$/, `${r.name}: ein`);
    assert.equal(r.street, undefined, `${r.name}: no street kept`);
    assert.doesNotMatch(r.name, /benefit tr|veba|credit union/i);
  }
  assert.equal(new Set(NONPROFITS.map((r) => r.ein)).size, NONPROFITS.length);
});

test('congregations stay on /worship/, not here', () => {
  const names = new Set(NONPROFITS.map((r) => r.name.toLowerCase()));
  const both = WORSHIP.filter((w) => w.sources.some((s) => /IRS/.test(s.name)) && names.has(w.name.toLowerCase()));
  assert.deepEqual(both.map((w) => w.name), []);
});

test('the page lists every nonprofit with its filings, and the help center links it', () => {
  const html = dist('nonprofits/index.html');
  assert.equal((html.match(/<li class="np-row"/g) || []).length, NONPROFITS.length);
  assert.equal((html.match(/projects\.propublica\.org\/nonprofits\/organizations\/\d{9}/g) || []).length, NONPROFITS.length);
  assert.match(dist('help/index.html'), /href="\/nonprofits\/"/);
});

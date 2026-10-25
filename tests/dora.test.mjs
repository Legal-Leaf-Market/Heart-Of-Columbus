// Social District tags must match the city's list by address, or be left off.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { PERMITTEES } from '../src/data/dora.mjs';
import { directory } from '../src/data/directory.mjs';

const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
const num = (a) => (a || '').match(/^\d+/)?.[0];
const street = (a) => (a || '').toLowerCase().replace(/^\d+\s+/, '').replace(/\b(street|st|avenue|ave)\b\.?/g, '').replace(/\bfourth\b/, '4th').trim();

test('every permittee has a source, a checked date, and a reason when untagged', () => {
  for (const p of PERMITTEES) {
    assert.match(p.source, /^https:\/\//, p.name);
    assert.match(p.checked, /^\d{4}-\d{2}-\d{2}$/, p.name);
    if (!p.slug) assert.ok(p.note, `${p.name}: say why it is not tagged`);
  }
});

test('tagged permittees exist and sit at the address the city gives', () => {
  for (const p of PERMITTEES.filter((x) => x.slug)) {
    const b = bySlug[p.slug];
    assert.ok(b, `${p.name}: no listing ${p.slug}`);
    assert.ok(b.dora, `${p.slug} should carry the tag`);
    if (p.address) {
      assert.equal(num(b.address), num(p.address), `${p.name}: street number`);
      assert.equal(street(b.address), street(p.address), `${p.name}: street`);
    }
  }
  assert.equal(directory.filter((b) => b.dora).length, PERMITTEES.filter((x) => x.slug).length);
});

test('the tag shows on a business page and the Downtown page', () => {
  const read = (f) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');
  assert.match(read('b/henry-social-club/index.html'), /Social District: drinks to go/);
  assert.match(read('n/downtown/index.html'), /id="social-district"/);
  assert.doesNotMatch(read('b/viewpoint-books/index.html'), /Social District: drinks to go/);
});

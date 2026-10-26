// Independence is a claim, so it needs evidence and the totals have to follow it.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { OWNERSHIP, EXCLUDED_TYPES } from '../src/data/ownership.mjs';
import { directory, everyRecord, AREAS } from '../src/data/directory.mjs';

const dist = new URL('../dist/', import.meta.url).pathname;
const inDir = new Set(directory.map((b) => b.slug));

test('every ownership entry names a real record, a date and a reason', () => {
  const all = new Set(everyRecord.map((b) => b.slug));
  for (const [slug, o] of Object.entries(OWNERSHIP)) {
    assert.ok(all.has(slug), `${slug} is not a record`);
    assert.match(o.checked, /^\d{4}-\d{2}-\d{2}$/, slug);
    assert.ok(o.note && o.by, slug);
    assert.ok(['independent', 'local-group', 'franchise', 'national-chain', 'unknown'].includes(o.type), slug);
    if (EXCLUDED_TYPES.has(o.type)) assert.match(o.evidence, /^https:\/\//, `${slug} is excluded without evidence`);
  }
});

test('a chain or franchise is gone from every surface; an unknown stays', () => {
  const json = JSON.parse(readFileSync(dist + 'data/directory.json', 'utf8'));
  const jsonSlugs = new Set((json.items || json).map((b) => b.slug || b.s));
  for (const [slug, o] of Object.entries(OWNERSHIP)) {
    const gone = EXCLUDED_TYPES.has(o.type);
    assert.equal(inDir.has(slug), !gone, slug);
    assert.equal(existsSync(`${dist}b/${slug}/index.html`), !gone, slug);
    if (jsonSlugs.size > 1) assert.equal(jsonSlugs.has(slug), !gone, slug);
  }
});

test('the home page states only what the data supports', () => {
  const home = readFileSync(dist + 'index.html', 'utf8');
  assert.doesNotMatch(home, /not a single chain|chains or franchises|No chains/i);
  assert.ok(home.includes(`${directory.length} independent businesses`));
  const areaTotal = AREAS.reduce((n, a) => n + directory.filter((b) => b.area === a.slug).length, 0);
  assert.equal(areaTotal, directory.filter((b) => b.area).length, 'neighborhood counts add up to the tagged records');
});

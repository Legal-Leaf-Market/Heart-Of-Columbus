// Listing attributes come from OpenStreetMap, are matched by address and
// name (never by name alone across town), credited wherever they show, and
// never stretched: a missing record reads as unknown, not "no".
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { ATTRS, ATTRS_PULLED } from '../src/data/attrs.mjs';
import { directory } from '../src/data/directory.mjs';
import { match } from '../scripts/import-attrs.mjs';
import { searchIndex } from '../src/site.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));
const OK = { wheelchair: ['yes', 'limited', 'no'], dog: ['yes', 'no'], outdoor: ['yes', 'no'], toilet: ['yes'], veg: ['yes', 'only'], vegan: ['yes', 'only'] };

test('every record is a listed business with a map id and known values', () => {
  if (Object.keys(ATTRS).length) assert.match(ATTRS_PULLED, /^\d{4}-\d{2}-\d{2}$/);
  for (const [slug, a] of Object.entries(ATTRS)) {
    assert.ok(bySlug[slug], slug);
    assert.match(a.osm, /^(node|way|relation)\/\d+$/, slug);
    for (const [k, v] of Object.entries(a)) if (k !== 'osm') assert.ok(OK[k]?.includes(v), `${slug}: ${k}=${v}`);
  }
});

test('matching needs the address and a shared name word, and skips chains and non-businesses', () => {
  const b = { slug: 'x', name: 'Sampleton Diner', address: '12 Main St', ll: [39.2, -85.9] };
  const el = (tags, ll = [39.2001, -85.9]) => ({ ll, tags: { name: 'Sampleton Diner', ...tags } });
  assert.equal(match(el({ 'addr:housenumber': '12', 'addr:street': 'Main Street' }), [b]).slug, 'x');
  assert.equal(match(el({ name: 'County Heliport', 'addr:housenumber': '12', 'addr:street': 'Main Street' }), [b]).slug, undefined, 'same address, other place');
  assert.equal(match(el({ brand: 'Chain' }), [b]).slug, undefined);
  assert.equal(match(el({ amenity: 'place_of_worship' }), [b]).slug, undefined);
  assert.equal(match(el({}, [39.21, -85.9]), [b]).slug, undefined, 'same name a kilometer away');
});

test('business pages show the attributes with credit, and nothing when none were recorded', () => {
  for (const slug of Object.keys(ATTRS)) {
    const html = read(`b/${slug}/index.html`);
    assert.ok(html.includes('© OpenStreetMap contributors'), slug);
    assert.ok(html.includes(`https://www.openstreetmap.org/${ATTRS[slug].osm}`), slug);
  }
  const none = directory.find((b) => !ATTRS[b.slug]);
  assert.ok(!read(`b/${none.slug}/index.html`).includes('attr-box'));
  const idx = searchIndex();
  for (const r of idx) if (r.x) assert.ok(ATTRS[r.s], r.s);
});

test('the accessibility page lists what the map records and claims nothing more', () => {
  const html = read('visit/accessibility/index.html');
  for (const [slug, a] of Object.entries(ATTRS)) if (a.wheelchair === 'yes') assert.ok(html.includes(`/b/${slug}/`), slug);
  assert.ok(html.includes('unknown, not inaccessible'));
  assert.doesNotMatch(html, /certif/i);
  assert.ok(read('visit/index.html').includes('href="/visit/accessibility/"'));
});

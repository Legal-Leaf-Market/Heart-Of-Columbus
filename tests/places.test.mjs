// The shared place record (src/data/places.mjs): one valid record per listed
// business and landmark, ids that keep the public page address, honest pin
// sources, and nobody counted as a partner without signing on.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { PLACES, placeById, placeProblems, placeFromBusiness, GROUPS, APPEARANCES, PIN_NOTE, GEO_KINDS } from '../src/data/places.mjs';
import { directory } from '../src/data/directory.mjs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { PARTNERS } from '../src/data/partners.mjs';
import { MEMBERS } from '../src/data/members.mjs';
import { searchIndex } from '../src/site.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

test('every listed business and landmark is exactly one valid place', () => {
  assert.equal(PLACES.length, directory.length + LANDMARKS.length);
  assert.equal(Object.keys(placeById).length, PLACES.length, 'duplicate ids');
  assert.deepEqual(PLACES.flatMap(placeProblems), []);
});

test('ids keep the public page address and survive a rename or a move', () => {
  for (const b of directory) assert.equal(placeById[`b:${b.slug}`].href, `/b/${b.slug}/`);
  for (const l of LANDMARKS) assert.equal(placeById[`l:${l.slug}`].href, `/l/${l.slug}/`);
  const b = directory[0];
  const moved = placeFromBusiness({ ...b, name: 'A New Owner Name', address: '1 New St', ll: [39.2, -85.9], pin: 'google' });
  assert.equal(moved.id, `b:${b.slug}`);
  assert.equal(moved.href, `/b/${b.slug}/`);
});

test('a place with no pin is still searchable and says so plainly', () => {
  const unpinned = directory.filter((b) => !b.ll);
  assert.ok(unpinned.length > 0);
  const indexed = new Set(searchIndex().map((x) => x.s));
  for (const b of unpinned) {
    assert.ok(indexed.has(b.slug), b.slug);
    assert.equal(placeById[`b:${b.slug}`].location.geo, 'none');
  }
  const html = read(`b/${unpinned[0].slug}/index.html`);
  assert.ok(html.includes('data-pin="none"'));
  assert.ok(html.includes('Not on our map yet'));
});

test('every business page names where its pin came from; approximate pins say so on the map too', () => {
  for (const b of directory) {
    const geo = placeById[`b:${b.slug}`].location.geo;
    assert.ok(GEO_KINDS.includes(geo));
    assert.ok(read(`b/${b.slug}/index.html`).includes(`data-pin="${geo}"`), b.slug);
  }
  const approx = new Set(directory.filter((b) => b.pin === 'approx').map((b) => b.slug));
  for (const x of searchIndex()) assert.equal(Boolean(x.q), approx.has(x.s), x.s);
  assert.ok(PIN_NOTE.approx.includes('approximate'));
  assert.match(readFileSync(new URL('../public/js/explore.js', import.meta.url), 'utf8'), /Approximate pin/);
});

test('listed is never partnered: relation follows partners.mjs and members.mjs only', () => {
  for (const p of PLACES) {
    const want = Object.hasOwn(PARTNERS, p.slug) && p.kind === 'business' ? 'partner' : Object.hasOwn(MEMBERS, p.slug) && p.kind === 'business' ? 'member' : 'listed';
    assert.equal(p.relation, want, p.id);
  }
  const fake = { ...placeFromBusiness(directory[0]), relation: 'partner' };
  if (!Object.hasOwn(PARTNERS, directory[0].slug)) assert.match(placeProblems(fake).join(), /partner without a signed entry/);
});

test('a business with several locations keeps one page per location', () => {
  for (const [g, x] of Object.entries(GROUPS)) {
    assert.ok(x.slugs.length >= 2, g);
    for (const s of x.slugs) {
      assert.ok(bySlug[s], `${g}: ${s} is not listed`);
      assert.equal(placeById[`b:${s}`].group, g);
    }
  }
});

test('pop-up appearances are checked before the first one is ever entered', () => {
  const base = placeFromBusiness(directory[0]);
  const ok = { venue: 'A market', address: '1 Main St', ll: [39.2, -85.92], start: '2026-12-05T10:00:00-05:00', end: '2026-12-05T14:00:00-05:00', tz: 'America/Indiana/Indianapolis', source: 'owner, by email', checked: '2026-12-01' };
  assert.deepEqual(placeProblems({ ...base, appearances: [ok] }), []);
  const bad = (a) => placeProblems({ ...base, appearances: [{ ...ok, ...a }] }).join(' ');
  assert.match(bad({ end: '2026-12-05T09:00:00-05:00' }), /ends before it starts/);
  assert.match(bad({ start: '2026-12-05 10:00' }), /offset/);
  assert.match(bad({ tz: '' }), /time zone/);
  assert.match(bad({ ll: [40.7, -74] }), /outside Bartholomew County/);
  assert.match(bad({ source: '' }), /source/);
  for (const [slug, list] of Object.entries(APPEARANCES)) assert.ok(bySlug[slug] && Array.isArray(list), slug);
});

test('bad pins and mismatched ids are caught', () => {
  const base = placeFromBusiness(directory.find((b) => b.ll));
  assert.match(placeProblems({ ...base, location: { ...base.location, ll: [0, 0] } }).join(), /outside/);
  assert.match(placeProblems({ ...base, location: { ...base.location, ll: null } }).join(), /no pin but claims one/);
  assert.match(placeProblems({ ...base, id: 'b:someone-else' }).join(), /disagree/);
  assert.match(placeProblems({ ...base, href: '/elsewhere/' }).join(), /public page/);
});

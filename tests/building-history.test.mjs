// Building history on business pages (src/data/building-history.mjs): at most
// two tags, the building's historic name and year and the business that was
// at the address before, each from a source with the day we read it.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { HISTORIC, BEFORE, buildingFor, parseAddress } from '../src/data/building-history.mjs';
import { directory } from '../src/data/directory.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const DASH = /[–—]|\s-\s/;

test('every building and every earlier business has a source and the day we read it', () => {
  for (const e of [...HISTORIC, ...BEFORE]) {
    const what = e.name || e.was;
    assert.ok(Array.isArray(e.source) && e.source[0] && /^https:\/\//.test(e.source[1]), `${what}: source`);
    assert.match(e.checked, /^\d{4}-\d{2}-\d{2}$/, `${what}: checked`);
    for (const f of ['name', 'built', 'note', 'in', 'was', 'said']) assert.ok(!DASH.test(e[f] || ''), `${what}: dash in ${f}`);
  }
  for (const b of HISTORIC) {
    assert.ok(b.from <= b.to && b.from % 2 === b.to % 2, `${b.name}: range on one side of the street`);
    assert.ok(b.quote.includes(String(b.from)), `${b.name}: the quoted line names its first number`);
  }
});

test('a building matches only its own side of the street and range', () => {
  assert.equal(buildingFor('217 Washington St Suite D').historic?.name, 'Eagles Building');
  assert.equal(buildingFor('212 Washington St').historic, null);
  assert.equal(buildingFor('221 Washington St').historic, null);
  assert.equal(buildingFor('217 Franklin St').historic, null);
  assert.deepEqual(parseAddress('425 Washington St Suite 4'), { number: 425, street: 'washington', dir: false });
});

test('every building names at least one listing, and its pages show the tags and the source', () => {
  for (const h of HISTORIC) {
    const here = directory.filter((b) => b.building === h);
    assert.ok(here.length, `${h.name}: no listing in this building`);
    for (const b of here) {
      const html = dist(`b/${b.slug}/index.html`);
      assert.ok(html.includes('class="tag tag-history"'), `${b.slug}: history tag`);
      assert.ok(html.includes(`href="${h.source[1]}"`), `${b.slug}: source link`);
      assert.ok((html.match(/class="tag tag-history"/g) || []).length <= 2, `${b.slug}: at most two history tags`);
    }
  }
  for (const e of BEFORE) {
    const here = directory.filter((b) => b.before === e);
    for (const b of here) assert.ok(dist(`b/${b.slug}/index.html`).includes(`href="${e.source[1]}"`), `${b.slug}: before source`);
  }
});

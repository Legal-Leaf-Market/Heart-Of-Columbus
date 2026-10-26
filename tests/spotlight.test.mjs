// The spotlight features real listings, and its "Owner's picks" are the
// owner's own words or a marked placeholder, never something we wrote.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SPOTLIGHT, PICK_SLOTS } from '../src/data/spotlight.mjs';
import { ADDED } from '../src/data/added.mjs';
import { directory } from '../src/data/directory.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

test('every spotlight business is in the directory', () => {
  for (const s of SPOTLIGHT) assert.ok(bySlug[s.slug], `${s.slug}: not a directory slug`);
});

test('owner picks carry where they came from, and there are no more than the slots', () => {
  for (const s of SPOTLIGHT) {
    assert.ok(s.picks.length <= PICK_SLOTS, `${s.slug}: too many picks`);
    for (const p of s.picks) {
      assert.ok(p.name && p.from, `${s.slug}: pick needs a name and who sent it`);
      assert.match(p.checked, /^\d{4}-\d{2}-\d{2}$/, s.slug);
    }
  }
});

test('hand-added listings cite their own page', () => {
  for (const a of ADDED) {
    assert.match(a.source, /^https:\/\//, a.name);
    assert.match(a.checked, /^\d{4}-\d{2}-\d{2}$/, a.name);
  }
});

test('the spotlight shows on the home page, /visit/ and each business page', () => {
  const home = dist('index.html'), visit = dist('visit/index.html');
  for (const s of SPOTLIGHT) {
    assert.ok(home.includes(`href="/b/${s.slug}/#owners-picks"`), `home: ${s.slug}`);
    assert.ok(visit.includes(`href="/b/${s.slug}/#owners-picks"`), `visit: ${s.slug}`);
    const biz = dist(`b/${s.slug}/index.html`);
    assert.ok(biz.includes('id="owners-picks"'), `${s.slug}: owner's picks section`);
    const empty = (biz.match(/sp-pick is-empty/g) || []).length;
    assert.equal(empty, PICK_SLOTS - s.picks.length, `${s.slug}: placeholder slots`);
  }
});

test('each spotlight business leads its category page', () => {
  for (const s of SPOTLIGHT) {
    const b = bySlug[s.slug];
    assert.ok(dist(`c/${b.cat}/index.html`).includes(`/b/${s.slug}/#owners-picks`), `${s.slug}: /c/${b.cat}/`);
  }
});

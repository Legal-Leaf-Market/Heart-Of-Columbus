// Landmarks state facts about real buildings, so each one carries its source
// and the photo credit; pages must exist and walking times must be labeled.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { PHOTOS } from '../src/site.mjs';

test('every landmark has a source, a checked date, a credited photo and a sourced map point', () => {
  for (const l of LANDMARKS) {
    assert.match(l.source, /^https:\/\//, l.slug);
    assert.match(l.checked, /^\d{4}-\d{2}-\d{2}$/, l.slug);
    assert.ok(l.name && l.architect && l.year && l.address && l.what, l.slug);
    assert.ok(l.photo.credit && l.photo.license && l.photo.page.startsWith('https://commons.wikimedia.org/'), l.slug);
    if (l.ll) {
      assert.ok(l.llSource, `${l.slug}: say where the map point came from`);
      assert.ok(l.ll[0] > 39.1 && l.ll[0] < 39.3 && l.ll[1] > -86 && l.ll[1] < -85.8, `${l.slug}: point outside Columbus`);
    }
    assert.ok(!JSON.stringify(l).includes('—'), `${l.slug}: em dash`);
    assert.equal(PHOTOS[l.slug].title, l.name, `${l.slug}: PHOTOS view`);
  }
});

test('each landmark page is built, noindex, credited and labels walking times as estimates', () => {
  for (const l of LANDMARKS) {
    const html = readFileSync(new URL(`../dist/l/${l.slug}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /noindex/, l.slug);
    assert.ok(html.includes(l.photo.page), `${l.slug}: photo credit link`);
    if (/min walk/.test(html)) assert.match(html, /straight-line estimates/, l.slug);
  }
  const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  for (const l of LANDMARKS) assert.ok(home.includes(`href="/l/${l.slug}/"`), `home links ${l.slug}`);
});

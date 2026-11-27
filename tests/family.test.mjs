// The publisher's own businesses (src/data/family.mjs): every page names them
// with the tie said beside them, a 21+ site is always labeled, Kawaii Katz and
// the 21+ site never point at each other, and a story tagging one discloses it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { FAMILY, familyBeside, familyHref, KID_SAFE } from '../src/data/family.mjs';
import { disclosures } from '../src/news/disclosure.mjs';
import { directory } from '../src/data/directory.mjs';

const page = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('every family entry with a slug has a listing, and every one has a tie', () => {
  for (const f of FAMILY) {
    assert.ok(f.tie, f.name);
    if (f.slug) assert.ok(directory.some((b) => b.slug === f.slug), f.slug);
  }
});

test('the footer names every family site, tagged, with the tie and the 21+ label', () => {
  const html = page('index.html');
  for (const f of FAMILY) assert.ok(html.includes(familyHref(f).replace(/&/g, '&amp;')), f.name);
  assert.match(html, /class="wrap ftr-family"/);
  assert.match(html, /Kawaii Katz is his daughter Ada/);
  assert.match(html, /ftr-age">21\+/);
});

test('Kawaii Katz and the 21+ site never point at each other', () => {
  for (const kid of KID_SAFE) {
    assert.ok(!familyBeside(kid).some((f) => f.adult));
    const html = page(`b/${kid}/index.html`);
    const note = html.match(/Also from the same family:[^\n]*/)[0];
    assert.doesNotMatch(note, /Legal Leaf/);
  }
  for (const f of FAMILY.filter((x) => x.adult)) assert.ok(!familyBeside(f.slug).some((x) => KID_SAFE.has(x.slug)));
});

test('a story tagging a family business discloses the tie', () => {
  for (const f of FAMILY.filter((x) => x.slug)) {
    const d = disclosures([f.slug], { partners: {}, sponsors: {}, members: {} });
    assert.equal(d[0]?.kind, 'own', f.slug);
    assert.equal(d[0].text, f.tie);
  }
});

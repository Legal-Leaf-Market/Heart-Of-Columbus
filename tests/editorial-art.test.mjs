// Painted category scenes (src/editorial-art.mjs) decorate category page
// intros only. They never stand in for a business: no card, business page,
// spotlight or search result uses them (tests/business-media.test.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { EDITORIAL, EDITORIAL_CAPTION, editorialFor, editorialHero } from '../src/editorial-art.mjs';
import { directory, subBySlug } from '../src/data/directory.mjs';
import { card, searchIndex } from '../src/site.mjs';

const root = new URL('../', import.meta.url);
const html = (p) => readFileSync(new URL(`dist/${p}index.html`, root), 'utf8');
const barbers = directory.filter((b) => b.sub === 'barbers');
const files = Object.values(EDITORIAL).flatMap((e) => [...e.scenes, e.hero]);

test('editorial art is keyed by real type slugs and every file is the size it claims', async () => {
  for (const sub of Object.keys(EDITORIAL)) assert.ok(subBySlug[sub], `${sub}: not a type slug`);
  for (const f of files) {
    assert.ok(existsSync(new URL(`public/art/${f.file}`, root)), `${f.file} missing`);
    const { width, height } = await sharp(new URL(`public/art/${f.file}`, root).pathname).metadata();
    assert.deepEqual([width, height], [f.width, f.height], f.file);
    assert.match(f.pos, /^\d+% \d+%$/, f.file);
  }
});

test('each barbershop keeps one scene, picked from its path, and other types get none', () => {
  assert.ok(barbers.length > 5);
  for (const b of barbers) {
    const ed = editorialFor(b);
    assert.ok(ed, b.slug);
    assert.equal(editorialFor({ ...b }), ed, `${b.slug}: same listing, same scene`);
  }
  // More than one scene in use, so a grid isn't one picture repeated.
  assert.ok(new Set(barbers.map((b) => editorialFor(b).file)).size > 1);
  for (const b of directory.filter((x) => !EDITORIAL[x.sub])) assert.equal(editorialFor(b), null, b.slug);
  assert.equal(editorialFor({ cat: 'beauty', sub: 'barbers', slug: ' ' }), null);
  assert.equal(editorialHero('salons'), null);
});

test('the barbershops page: the painted header in the intro, text-first cards below it', () => {
  const page = html('c/beauty/barbers/');
  const cards = page.split('<article class="bz').slice(1);
  assert.equal(cards.length, barbers.length);
  for (const c of cards.map((x) => x.slice(0, x.indexOf('</article>')))) {
    const slug = c.match(/data-slug="([^"]+)"/)[1];
    assert.doesNotMatch(c, /art-editorial|ed-tag|ed-art|bz-stk|art-sticker|art-cover/, `${slug}: no art on a business card`);
    assert.match(c, /bz-save/, `${slug}: save button kept`);
  }
  assert.match(page, /<section class="band band-ed"/);
  assert.match(page, /class="ed-hero-art">\s*<img [^>]*alt=""/);
  assert.match(page, new RegExp(`<figcaption class="ed-tag">${EDITORIAL_CAPTION}</figcaption>`));
  assert.match(page, /See them on the map/);
  assert.match(page, /<section class="(?:wrap )?list list-ed"/);
});

test('other beauty pages keep their own header and art', () => {
  for (const p of ['c/beauty/', 'c/beauty/salons/', 'c/beauty/nails/', 'c/beauty/spa/', 'c/beauty/tattoo/']) {
    const page = html(p);
    assert.doesNotMatch(page, /band-ed|ed-hero/, p);
    assert.doesNotMatch(page, /list-ed/, p);
  }
  const salons = html('c/beauty/salons/');
  assert.doesNotMatch(salons, /ed-tag|editorial-barbers/);
});

test('no business slot carries a painted scene, on the page or in the search index', () => {
  for (const b of barbers) {
    assert.doesNotMatch(card(b), /ed-tag|ed-art|art\//, b.slug);
    const page = html(`b/${b.slug}/`);
    const top = page.slice(page.indexOf('<section class="wrap biz">'), page.indexOf('</aside>'));
    assert.doesNotMatch(top, /ed-tag|ed-art|art-editorial|biz-cover/, b.slug);
  }
  assert.ok(!searchIndex().some((x) => x.w || x.v), 'the index sends no scene and no cover flag');
  const js = readFileSync(new URL('public/js/explore.js', root), 'utf8');
  assert.doesNotMatch(js, /ed-tag|\/art\/cover-|HoCSticker/);
});

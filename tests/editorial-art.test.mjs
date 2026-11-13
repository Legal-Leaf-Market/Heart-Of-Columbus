// Painted category scenes (src/editorial-art.mjs) are a fallback for listings
// with no owner photo. They must stay put per shop, say they are
// illustrations, and never stand in for a real photo or leak to other types.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { EDITORIAL, EDITORIAL_CAPTION, editorialFor, editorialHero } from '../src/editorial-art.mjs';
import { directory, subBySlug } from '../src/data/directory.mjs';
import { MEDIA } from '../src/data/media.mjs';
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

test('an approved owner photo always wins over the painted scene', () => {
  const b = barbers[0];
  assert.match(card(b), /class="ed-tag">Category illustration</);
  MEDIA[b.slug] = { cover: { file: 'cover.webp', width: 1200, height: 800, alt: 'x' }, permission: 'test', credit: 'Photo: test', checked: '2026-11-13', sourceUrl: 'https://example.com' };
  try {
    const html = card(b);
    assert.match(html, new RegExp(`/business-media/${b.slug}/cover.webp`));
    assert.doesNotMatch(html, /ed-tag|ed-art/);
    assert.ok(!searchIndex().find((x) => x.s === b.slug).w, 'index must not send the scene either');
  } finally {
    delete MEDIA[b.slug];
  }
});

test('the barbershops page: painted cards with their tag, no emoji, and the painted header', () => {
  const page = html('c/beauty/barbers/');
  const cards = page.split('<article class="bz').slice(1);
  assert.equal(cards.length, barbers.length);
  for (const c of cards) {
    const slug = c.match(/data-slug="([^"]+)"/)[1];
    const ed = editorialFor(directory.find((b) => b.slug === slug));
    assert.match(c, /class="bz-cover bz-cover-ed"/, slug);
    assert.match(c, new RegExp(`art-${ed.file.replace('.webp', '')}-\\d+\\.webp`), `${slug}: its own scene`);
    assert.match(c, /alt=""/, slug);
    assert.ok(c.includes(`<span class="ed-tag">${EDITORIAL_CAPTION}</span>`), `${slug}: visible tag`);
    assert.doesNotMatch(c, /bz-emoji/, slug);
    assert.match(c, /bz-save/, `${slug}: save button kept`);
  }
  assert.match(page, /<section class="band band-ed"/);
  assert.match(page, /class="ed-hero-art">\s*<img [^>]*alt=""/);
  assert.match(page, new RegExp(`<figcaption class="ed-tag">${EDITORIAL_CAPTION}</figcaption>`));
  assert.match(page, /See them on the map/);
  assert.match(page, /<section class="wrap list list-ed">/);
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

test('a barbershop page shows the same scene as its card, tagged, with the photo invitation', () => {
  for (const b of barbers.slice(0, 5)) {
    const page = html(`b/${b.slug}/`);
    const cover = page.slice(page.indexOf('<div class="biz-cover'), page.indexOf('biz-credit'));
    assert.match(cover, /biz-cover biz-cover-ed/, b.slug);
    assert.match(cover, new RegExp(`art-${editorialFor(b).file.replace('.webp', '')}-\\d+\\.webp`), b.slug);
    assert.match(cover, /class="ed-tag">Category illustration</, b.slug);
    assert.doesNotMatch(cover, /biz-emoji/, b.slug);
    assert.match(page, /want=photos#claim/, b.slug);
  }
});

test('explore gets the same scene in the index and shows the same tag', () => {
  const index = searchIndex();
  for (const b of barbers) assert.deepEqual(index.find((x) => x.s === b.slug).w, { f: editorialFor(b).file, p: editorialFor(b).pos }, b.slug);
  assert.ok(!index.some((x) => x.w && !EDITORIAL[x.u]), 'only types with editorial art carry w');
  const js = readFileSync(new URL('public/js/explore.js', root), 'utf8');
  assert.ok(js.includes(`<span class="ed-tag">${EDITORIAL_CAPTION}</span>`), 'explore.js caption matches EDITORIAL_CAPTION');
});

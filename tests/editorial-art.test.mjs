// Painted category scenes (src/editorial-art.mjs) decorate category page
// intros only. They never stand in for a business: no card, business page,
// spotlight or search result uses them (tests/business-media.test.mjs).
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import sharp from 'sharp';
import { EDITORIAL, EDITORIAL_CAPTION, editorialFor, editorialHero, sectionHero } from '../src/editorial-art.mjs';
import { CATEGORIES, directory, subBySlug } from '../src/data/directory.mjs';
import { card, searchIndex } from '../src/site.mjs';

const root = new URL('../', import.meta.url);
const html = (p) => readFileSync(new URL(`dist/${p}index.html`, root), 'utf8');
const barbers = directory.filter((b) => b.sub === 'barbers');
const files = Object.values(EDITORIAL).flatMap((e) => [...e.scenes, e.hero]);
const hasBusinessSticker = (html, slug) => html.includes(`/art/business-scenes/${slug}.webp`)
  || html.includes(`/assets/images/art-business-scenes-${slug}-`);

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
    assert.ok(hasBusinessSticker(c, slug), `${slug}: individual painted sticker`);
    assert.match(c, /bz-save/, `${slug}: save button kept`);
  }
  assert.match(page, /<section class="band band-ed"/);
  assert.match(page, /class="ed-hero-art">\s*<img [^>]*alt=""/);
  assert.match(page, new RegExp(`<figcaption class="ed-tag">${EDITORIAL_CAPTION}</figcaption>`));
  assert.match(page, /See them on the map/);
  assert.match(page, /<section class="(?:wrap )?list list-ed"/);
});

test('Cisco’s related rail has a painted card for every other barbershop', () => {
  const page = html('b/ciscos-barber-shop/');
  const rail = page.match(/<section class="rail" id="more-barbershops">[\s\S]*?<\/section>/)?.[0];
  assert.ok(rail);
  assert.equal((rail.match(/<article class="bz/g) || []).length, barbers.length - 1);
  for (const { slug } of barbers.filter((b) => b.slug !== 'ciscos-barber-shop')) {
    assert.ok(rail.includes(`data-slug="${slug}"`), slug);
    assert.ok(hasBusinessSticker(rail, slug), slug);
  }
});

test('each category and subcategory has its own or inherited banner', () => {
  for (const cat of CATEGORIES) {
    const categoryHero = sectionHero(cat.slug);
    assert.ok(categoryHero?.small, cat.slug);
    assert.ok(existsSync(new URL(`public/art/${categoryHero.file}`, root)), categoryHero.file);
    assert.ok(existsSync(new URL(`public/art/${categoryHero.small}`, root)), categoryHero.small);
    const pages = [[`c/${cat.slug}/`, categoryHero]];
    if (cat.subs.length > 1) for (const sub of cat.subs) {
      pages.push([`c/${cat.slug}/${sub.slug}/`, editorialHero(sub.slug) || categoryHero]);
    }
    for (const [path, hero] of pages) {
      const banner = html(path).match(/<figure class="ed-hero-art">[\s\S]*?<\/figure>/)?.[0];
      assert.ok(banner, path);
      if (hero.small) {
        assert.ok(banner.includes(hero.file) && banner.includes(hero.small), path);
      } else {
        const responsiveSource = hero.file.replace(/\.webp$/, '-');
        assert.ok(banner.includes(hero.file) || banner.includes(responsiveSource), path);
      }
    }
  }
});

test('category scenes stay out of business slots and the search index', () => {
  for (const b of barbers) {
    assert.doesNotMatch(card(b), /ed-tag|ed-art|\/art\/(?:sections-v1|editorial-)/, b.slug);
    const page = html(`b/${b.slug}/`);
    const top = page.slice(page.indexOf('<section class="wrap biz">'), page.indexOf('</aside>'));
    assert.doesNotMatch(top, /ed-tag|ed-art|art-editorial|biz-cover/, b.slug);
    if (b.slug !== 'ciscos-barber-shop') assert.ok(hasBusinessSticker(top, b.slug), b.slug);
  }
  assert.ok(!searchIndex().some((x) => x.w || x.v), 'the index sends no scene and no cover flag');
  const js = readFileSync(new URL('public/js/explore.js', root), 'utf8');
  assert.doesNotMatch(js, /ed-tag|\/art\/cover-|HoCSticker/);
});

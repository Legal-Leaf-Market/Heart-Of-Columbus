// Directory cards can show an illustration assigned to the business. Only
// approved photos populate photo slots, and category artwork stays in headers.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';
import { MEDIA, mediaFor, businessMedia } from '../src/data/media.mjs';
import { card, searchIndex } from '../src/site.mjs';
import { spotCard } from '../src/pages/spotlight.mjs';

const root = new URL('../', import.meta.url).pathname;
const dist = root + 'dist/';
const read = (p) => readFileSync(dist + p, 'utf8');
const ART = /art-(?:cover|sticker|editorial)-|\/art\/(?:sticker|cover|editorial)|\b(?:ed-art|ed-tag|bz-stk|sp-stk|outline-stk|biz-stk|brand-mono|bz-emoji|biz-emoji)\b/;

test('every directory record resolves to one explicit media state', () => {
  const states = { photo: 0, logo: 0, none: 0 };
  for (const b of directory) {
    const m = businessMedia(b.slug);
    assert.ok(m.state in states, b.slug);
    states[m.state]++;
    if (m.state !== 'none') {
      assert.ok(m.src.startsWith(`/business-media/${b.slug}/`), `${b.slug}: its own folder`);
      assert.ok(existsSync(root + 'public' + m.src), `${b.slug}: ${m.src} exists`);
      assert.ok(m.alt && m.credit, `${b.slug}: alt and credit`);
    }
  }
  assert.equal(states.photo + states.logo + states.none, directory.length);
  // Every MEDIA entry is a real business, and none is approved without its papers.
  const slugs = new Set(directory.map((b) => b.slug));
  for (const [slug, m] of Object.entries(MEDIA)) {
    assert.ok(slugs.has(slug), slug);
    if (mediaFor(slug)) assert.ok(m.permission && m.checked && m.credit && /^https?:\/\//.test(m.sourceUrl), slug);
  }
});

test('the resolver refuses anything without permission, source, date and credit, or outside the business folder', () => {
  const b = directory.find((x) => !MEDIA[x.slug]);
  const good = { cover: { file: 'cover.webp', width: 1200, height: 800, alt: 'Front counter' }, sourceUrl: 'https://example.com/', permission: 'Owner email, 2026-11-16', credit: 'Photo: owner', checked: '2026-11-16' };
  try {
    for (const drop of ['sourceUrl', 'permission', 'credit', 'checked']) {
      MEDIA[b.slug] = { ...good, [drop]: '' };
      assert.equal(businessMedia(b.slug).state, 'none', `missing ${drop}`);
    }
    MEDIA[b.slug] = { ...good, cover: { ...good.cover, file: '../../art/sticker-auto.webp' } };
    assert.equal(businessMedia(b.slug).state, 'none', 'no path escapes the business folder');
    MEDIA[b.slug] = good;
    const m = businessMedia(b.slug);
    assert.equal(m.state, 'photo');
    assert.match(spotCard({ b, picks: [] }), new RegExp(`<a class="sp-cover"[^>]*><img class="bz-photo" src="/business-media/${b.slug}/cover.webp"`));
    assert.equal(searchIndex().find((x) => x.s === b.slug).i, `/business-media/${b.slug}/cover.webp`);
  } finally { delete MEDIA[b.slug]; }
});

test('directory cards without approved photos can show their own illustrations', () => {
  for (const b of directory.filter((x) => businessMedia(x.slug).state === 'none')) {
    const c = card(b);
    assert.doesNotMatch(c, /business-media|bz-photo|bz-cover|\/art\/(?:sections-v1|editorial-)/, b.slug);
    for (const [, slug] of c.matchAll(/(?:business-scenes\/|#biz-)([a-z0-9-]+)/g)) {
      assert.equal(slug, b.slug, 'illustrations belong to the listed business');
    }
    assert.match(c, /data-save=/, `${b.slug}: save kept`);
    assert.match(c, /data-open-slot/, `${b.slug}: open-now status has a home`);
  }
  for (const x of searchIndex()) assert.ok(!x.w && !x.v && (!x.i || x.i.startsWith(`/business-media/${x.s}/`)), x.s);
});

test('spotlight cards follow the same rule', () => {
  for (const b of directory.slice(0, 40)) {
    const c = spotCard({ b, picks: [] });
    if (businessMedia(b.slug).state === 'none') assert.doesNotMatch(c, /<img/, b.slug);
    assert.doesNotMatch(c, ART, b.slug);
  }
});

// The supplied scanner (tools/audit_business_art.py in the redesign package),
// ported: any element inside a business-media wrapper or a link to /b/ must
// not carry known art paths or classes.
test('no built page puts category art in a business slot', () => {
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(d + f).isDirectory() ? walk(d + f + '/') : f.endsWith('.html') ? [d + f] : []));
  const WRAP = /\b(?:biz-cover|bz-cover|bz-media|sp-cover|business-media|business-photo|biz-figure)\b/;
  let pages = 0;
  for (const f of walk(dist)) {
    const html = readFileSync(f, 'utf8');
    pages++;
    // Each business card and each link to a business page, up to its close.
    const scopes = [
      ...html.matchAll(/<article class="(?:bz|sp-card)[\s\S]*?<\/article>/g),
      ...html.matchAll(/<a\b[^>]*href="\/b\/[^"]+"[^>]*>[\s\S]*?<\/a>/g),
      ...html.matchAll(/<(?:div|figure|a)\b[^>]*class="[^"]*"[^>]*>/g),
    ].map((m) => m[0]).filter((x) => !x.startsWith('<div') && !x.startsWith('<figure') && !x.startsWith('<a ') || WRAP.test(x) || /href="\/b\//.test(x));
    for (const s of scopes) assert.doesNotMatch(s, ART, `${f.slice(dist.length)}: ${s.slice(0, 120)}`);
  }
  assert.ok(pages > 1000);
});

test('every directory record has its page, with identity and actions before any media', () => {
  for (const b of directory) {
    const page = read(`b/${b.slug}/index.html`);
    const main = page.slice(page.indexOf('<section class="wrap biz">'), page.indexOf('</aside>'));
    assert.doesNotMatch(main, ART, b.slug);
    assert.doesNotMatch(main, /biz-cover/, `${b.slug}: no cover region`);
    const m = businessMedia(b.slug);
    if (m.state === 'photo') {
      assert.ok(main.indexOf('biz-actions') < main.indexOf('biz-figure'), `${b.slug}: actions before the photo`);
      assert.match(main, /class="fine biz-credit">[^<]+, shown with permission\./, b.slug);
    } else {
      assert.match(page, /class="wrap biz-photo-ask"[\s\S]*want=photos#claim/, `${b.slug}: quiet photo invitation`);
    }
  }
});

test("Bip's Bites keeps its permitted photo and credit", () => {
  const m = businessMedia('bips-bites');
  assert.equal(m.state, 'photo');
  const page = read('b/bips-bites/index.html');
  assert.match(page, /<figure class="biz-figure" data-media="photo">/);
  assert.match(page, /Photo: Bip(?:’|')s Bites, shown with permission\./);
});

test('client renderers build the same text-first card and never fall back to art', () => {
  for (const f of ['site.js', 'explore.js', 'hub.js', 'views.js']) {
    const js = readFileSync(root + 'public/js/' + f, 'utf8');
    assert.doesNotMatch(js, /\/art\/(?:cover|sticker)|HoCSticker|ed-tag|bz-cover/, f);
  }
  const site = readFileSync(root + 'public/js/site.js', 'utf8');
  assert.match(site, /'\/business-media\/' \+ b\.s \+ '\/'/, 'a client photo must sit in its own business folder');
  assert.match(site, /data-open-slot/, 'open-now badge goes in the card body');
});

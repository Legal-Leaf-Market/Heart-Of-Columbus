// "In their words" and owner deals come only from the business, confirmed by
// a person, and a deal always ends. With none sent, no page shows the section.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { WORDS, DEALS, dealsFor } from '../src/data/owner-words.mjs';
import { directory } from '../src/data/directory.mjs';
import { ownerWords } from '../src/pages/owner-words.mjs';

const slugs = new Set(directory.map((b) => b.slug));
const day = /^\d{4}-\d{2}-\d{2}$/;

test('every entry is a listed business, sent and confirmed, and every deal ends', () => {
  for (const w of WORDS) {
    assert.ok(slugs.has(w.slug), w.slug);
    assert.match(w.sent, day); assert.match(w.confirmed, day);
    assert.ok(w.by && w.text, w.slug);
    assert.ok(!w.sample, 'sample content never ships');
  }
  for (const d of DEALS) {
    assert.ok(slugs.has(d.slug), d.slug);
    assert.match(d.sent, day); assert.match(d.confirmed, day); assert.match(d.ends, day);
    assert.ok(d.ends >= d.sent, `${d.slug}: ends before it was sent`);
  }
});

test('an expired or unconfirmed deal never shows, and nothing shows with nothing sent', () => {
  const b = directory[0];
  DEALS.push({ slug: b.slug, text: 'Sample deal', sent: '2026-01-01', ends: '2026-01-31', confirmed: '2026-01-02' });
  DEALS.push({ slug: b.slug, text: 'Unconfirmed', sent: '2026-01-01', ends: '2099-01-31' });
  try {
    assert.equal(dealsFor(b.slug, '2026-01-31').length, 1, 'shows through its last day');
    assert.equal(dealsFor(b.slug, '2026-02-01').length, 0, 'gone the day after');
    assert.match(ownerWords(b, '2026-01-15'), /data-ends="2026-01-31"/);
    assert.equal(ownerWords(b, '2026-02-01'), '');
  } finally { DEALS.splice(-2); }
  if (!WORDS.length && !DEALS.length) {
    const html = readFileSync(new URL(`../dist/b/${b.slug}/index.html`, import.meta.url), 'utf8');
    assert.ok(!html.includes('ow-words'), 'no placeholder section');
    assert.ok(html.includes('post a deal or tell your story'), 'the claim card invites the owner');
  }
});

test('the claim form asks for both, and the browser takes an ended deal down', () => {
  const owners = readFileSync(new URL('../dist/owners/index.html', import.meta.url), 'utf8');
  for (const n of ['name="story"', 'name="deal"', 'name="dealEnds"', 'value="story"', 'value="deal"']) assert.ok(owners.includes(n), n);
  const js = readFileSync(new URL('../public/js/site.js', import.meta.url), 'utf8');
  assert.match(js, /\[data-ends\]/);
});

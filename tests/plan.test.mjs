// Plan an event (/plan/): every job is a rule over the directory, members lead
// each list and say so, and the page never claims a business does weddings.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { ROLES, TRACKS, vendorsFor } from '../src/data/plan.mjs';
import { directory } from '../src/data/directory.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const slugs = new Set(directory.map((b) => b.slug));

test('every track names real roles, and the core jobs have businesses in them', () => {
  for (const tr of TRACKS) for (const r of tr.roles) assert.ok(ROLES[r], `${tr.slug}: ${r}`);
  for (const r of ['venues', 'flowers', 'balloons', 'cakes', 'catering', 'music', 'photo']) assert.ok(vendorsFor(r).length, r);
});

test('Founding Members lead each list, then direct ordering, and nobody is listed twice', () => {
  for (const r of Object.keys(ROLES)) {
    const v = vendorsFor(r);
    assert.equal(new Set(v.map((b) => b.slug)).size, v.length, r);
    const firstNon = v.findIndex((b) => !b.member);
    if (firstNon >= 0) assert.ok(v.slice(firstNon).every((b) => !b.member), `${r}: members first`);
  }
});

test('section labels never place a business in a job', () => {
  const coffee = directory.filter((b) => b.type === 'Coffee, Bakeries & Sweets' && !/bak|cake|cookie|treat|panader/i.test(b.name));
  for (const b of coffee) assert.ok(!vendorsFor('cakes').includes(b), b.slug);
});

test('the pages exist, link only real listings and carry the disclosures', () => {
  assert.match(dist('plan/index.html'), /href="\/plan\/weddings\/"/);
  for (const tr of TRACKS) {
    const html = dist(`plan/${tr.slug}/index.html`);
    for (const r of tr.roles) assert.ok(html.includes(`id="${r}"`), `${tr.slug}: ${r}`);
    for (const [, s] of html.matchAll(/class="pl-item" data-slug="([^"]+)"/g)) assert.ok(slugs.has(s), s);
    assert.match(html, /not by whether it has done an event like yours/);
    assert.match(html, /Founding Members come first/);
    assert.match(html, /Nothing is sent to the businesses/);
  }
  assert.match(dist('c/events/index.html'), /href="\/plan\/"/);
});

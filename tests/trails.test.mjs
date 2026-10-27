// Trails are rules over the data, never a program businesses joined: every
// stop is a listed place, open for business or seen from the street, and the
// stamp card stays in the browser.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { TRAILS, trailStops } from '../src/data/trails.mjs';
import { directory } from '../src/data/directory.mjs';
import { PARTNERS } from '../src/data/partners.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

test('every trail stop is a listed place a visitor can reach', () => {
  for (const trail of TRAILS) {
    const stops = trailStops(trail);
    assert.ok(stops.length >= 4, `${trail.slug}: too short to be a trail`);
    assert.equal(new Set(stops.map((s) => s.id)).size, stops.length, `${trail.slug}: repeats a stop`);
    for (const s of stops) {
      if (s.kind === 'business') assert.ok(bySlug[s.id] && !bySlug[s.id].tempClosed, `${trail.slug}: ${s.id}`);
      else assert.ok(s.l.street, `${trail.slug}: ${s.id} can't be seen from the street`);
    }
  }
});

test('trail pages say it is not a program and never send stamps anywhere', () => {
  for (const trail of TRAILS) {
    const html = read(`trails/${trail.slug}/index.html`);
    assert.ok(html.includes('not a program they joined'), trail.slug);
    assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /participat|win a |earn points|official trail|our partner/i, trail.slug);
    for (const s of trailStops(trail)) assert.ok(html.includes(`data-stamp="${s.id}"`), `${trail.slug}: ${s.id}`);
  }
  assert.ok(read('trails/index.html').includes('not a program they joined'));
  const js = readFileSync(new URL('../public/js/trail.js', import.meta.url), 'utf8');
  assert.doesNotMatch(js, /fetch\(|XMLHttpRequest|sendBeacon|\/api\//);
});

test('no partner check-ins until a business has signed on', () => {
  // Phase 2 (a QR code at the counter) is for partners only; with none, no page offers it.
  if (Object.keys(PARTNERS || {}).length) return;
  for (const trail of TRAILS) assert.doesNotMatch(read(`trails/${trail.slug}/index.html`), /check.?in|scan the code/i, trail.slug);
});

// Architecture, arts and Cummins guides: every line has a source and a
// checked date, every art work names its artist and year, landmark links
// resolve, and the pages are built, noindex and free of visible dashes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { ARCH_FACTS, NHL } from '../src/data/architecture.mjs';
import { ART, EXHIBIT } from '../src/data/arts.mjs';
import { CUMMINS } from '../src/data/cummins.mjs';
import { landmarkBySlug } from '../src/data/landmarks.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const sourced = (f, what) => {
  assert.match(f.source, /^https:\/\//, what);
  assert.match(f.checked, /^\d{4}-\d{2}-\d{2}$/, what);
};

test('every guide line has a source and a checked date', () => {
  for (const f of [...ARCH_FACTS, ...EXHIBIT.facts, ...CUMMINS.intro, ...CUMMINS.numbers, ...CUMMINS.timeline, ...CUMMINS.people, ...CUMMINS.downtown]) sourced(f, f.text || f.label);
  for (const n of NHL) n.landmark ? assert.ok(landmarkBySlug[n.landmark], n.landmark) : sourced(n, n.name);
  for (const w of ART.flatMap((g) => g.items)) {
    sourced(w, w.title);
    assert.ok(w.artist && w.year && w.where, w.title);
    if (w.landmark) assert.ok(landmarkBySlug[w.landmark], w.title);
    if (w.line) assert.match(w.lineSource, /^https:\/\//, w.title);
  }
});

test('the timeline runs in order', () => {
  const years = CUMMINS.timeline.map((e) => e.year);
  assert.deepEqual(years, [...years].sort((a, b) => a - b));
});

test('guide pages are built, noindex, say they are not affiliated, and show no dashes', () => {
  const visible = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n');
  for (const p of ['architecture', 'arts', 'cummins']) {
    const html = read(`${p}/index.html`);
    assert.ok(html.includes('noindex'), p);
    assert.deepEqual(visible(html).split('\n').filter((l) => /[‒-―]| - /.test(l)), [], p);
  }
  assert.ok(read('cummins/index.html').includes('not affiliated with Cummins'));
  for (const w of ART.flatMap((g) => g.items)) assert.ok(read('arts/index.html').includes(w.artist.replace(/&/g, '&amp;')), w.title);
});

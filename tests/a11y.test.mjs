// Named controls and a reachable menu, checked on the built pages.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

const dist = new URL('../dist/', import.meta.url).pathname;
const home = readFileSync(dist + 'index.html', 'utf8');

test('the mobile menu carries every top-level task, Saved and Owners', () => {
  const panel = home.match(/<details class="mmenu"[\s\S]*?<\/details>/)[0];
  for (const href of ['/visit/', '/events/', '/explore/', '/order/', '/explore/?view=map', '/saved/', '/owners/'])
    assert.ok(panel.includes(`href="${href}"`), href);
  assert.match(panel, /<summary>[\s\S]*Menu/);
});

test('the Saved link has a name even when its text and count are hidden', () => {
  assert.match(home, /class="saved-link" aria-label="Saved places"/);
  assert.match(readFileSync(dist + 'es/visit/index.html', 'utf8'), /class="saved-link" aria-label="Lugares guardados"/);
});

test('every calculator slider is labelled', () => {
  const ranges = [...home.matchAll(/<input type="range"[^>]*>/g)].map((m) => m[0]);
  assert.equal(ranges.length, 4);
  for (const r of ranges) {
    const id = r.match(/aria-labelledby="([^"]+)"/)[1];
    assert.ok(home.includes(`id="${id}"`), id);
  }
});

test('the Explore filters toggle states what it opens', () => {
  const ex = readFileSync(dist + 'explore/index.html', 'utf8');
  assert.match(ex, /data-ex-toggle aria-controls="ex-side" aria-expanded="false"/);
  assert.match(ex, /id="ex-side"/);
});

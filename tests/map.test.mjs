// The explore map's layers: landmark pins use art that exists, Social District
// pins come only from the ordinance list, and "near me now" is reachable.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readFileSync } from 'node:fs';
import { DORA_SLUGS } from '../src/data/dora.mjs';
import { searchIndex } from '../src/site.mjs';

const explore = () => readFileSync(new URL('../dist/explore/index.html', import.meta.url), 'utf8');
const pageData = (html) => JSON.parse(html.match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/)[1]);

test('every landmark pin has its drawing', () => {
  const { landmarks } = pageData(explore());
  assert.ok(landmarks.length);
  for (const l of landmarks) assert.ok(existsSync(new URL(`../public/art/pin-${l.art}.png`, import.meta.url)), `${l.s}: pin-${l.art}.png`);
});

test('Social District pins are exactly the tagged permittees', () => {
  const tagged = searchIndex().filter((b) => b.z).map((b) => b.s);
  assert.ok(tagged.length);
  for (const s of tagged) assert.ok(DORA_SLUGS.has(s), s);
});

test('explore has the layer toggles and a near me now link', () => {
  const html = explore();
  for (const k of ['b', 'l', 'e', 'z']) assert.ok(html.includes(`data-layer="${k}"`), k);
  assert.ok(html.includes('href="/explore/?view=map&amp;now=1"'));
  assert.ok(html.includes('data-now-bar'));
});

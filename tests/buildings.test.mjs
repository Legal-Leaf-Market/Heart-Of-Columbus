// "Columbus, building by building": nine field guides, one per map landmark,
// each linked from its landmark page, each a draft until an editor signs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { BUILDINGS, RELATED } from '../src/data/history/buildings.mjs';
import { ARTICLES } from '../src/data/history/index.mjs';
import { SIGNOFF } from '../src/data/history/signoff.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const guides = BUILDINGS.filter((a) => a.landmark);

test('nine guides, one per landmark on the map', () => {
  assert.equal(guides.length, 9);
  assert.equal(new Set(guides.map((a) => a.landmark)).size, 9);
});

test('each landmark page links its field guide', () => {
  for (const a of guides) assert.match(dist(`l/${a.landmark}/index.html`), new RegExp(`href="/history/buildings/${a.slug}/"`), a.slug);
});

test('related links point at real history stories', () => {
  const paths = new Set(ARTICLES.map((a) => a.path));
  for (const [slug, list] of Object.entries(RELATED)) for (const p of list) assert.ok(paths.has(p), `${slug}: ${p}`);
});

test('North Christian keeps its spire: only the cross came down', () => {
  const lex = BUILDINGS.find((a) => a.slug === 'the-lex-today').body.join(' ');
  assert.match(lex, /cross was successfully removed from the spire/);
  assert.match(lex, /The spire itself stays/);
});

test('new guides stay drafts until an editor signs', () => {
  for (const a of BUILDINGS) {
    const signed = SIGNOFF[`buildings/${a.slug}`];
    assert.match(dist(`history/buildings/${a.slug}/index.html`), signed ? /Approved by/ : /awaiting editor approval/, a.slug);
  }
});

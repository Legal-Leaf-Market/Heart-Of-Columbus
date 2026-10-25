// Spanish pages: every sourced fact has a translation, the page is marked
// Spanish and says the translation is under review, and both versions point
// at each other.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { VISIT_SECTIONS } from '../src/data/visit.mjs';
import { FACTS, REVIEW_NOTE, UI, CATEGORY } from '../src/i18n/es.mjs';
import { CATEGORIES } from '../src/data/directory.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('every /visit/ fact has a Spanish version, and no stale ones are left', () => {
  const en = VISIT_SECTIONS.flatMap((s) => s.facts.map((f) => f.text));
  for (const x of en) assert.ok(FACTS[x], `missing Spanish for: ${x}`);
  for (const k of Object.keys(FACTS)) assert.ok(en.includes(k), `no longer on the page: ${k}`);
  for (const c of CATEGORIES) assert.ok(CATEGORY[c.slug], c.slug);
});

test('/es/visit/ is Spanish, marked for review, and linked both ways', () => {
  const es = read('es/visit/index.html'), en = read('visit/index.html');
  assert.ok(es.includes('<html lang="es">'));
  assert.ok(es.includes(REVIEW_NOTE));
  assert.ok(es.includes('noindex'));
  for (const h of [es, en]) {
    assert.ok(h.includes('hreflang="en" href="') && h.includes('hreflang="es" href="'));
  }
  assert.ok(en.includes('href="/es/visit/" class="lang-link"'));
  assert.ok(es.includes(`<span>${UI.switchTo}</span>`));
  for (const v of Object.values(FACTS)) assert.ok(es.includes(v.replace(/’/g, '’')), v.slice(0, 40));
});

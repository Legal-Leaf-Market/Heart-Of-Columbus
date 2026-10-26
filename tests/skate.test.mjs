// The skate park page: every line has a source and a checked date, shows on
// the page, and the page is linked from /visit/ and the footer.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SKATE, SKATE_FACTS } from '../src/data/skate.mjs';
import { t } from '../src/layout.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('every skate park fact has a source and a checked date, and shows on the page', () => {
  const html = read('skate/index.html');
  assert.ok(SKATE_FACTS.length > 0);
  for (const f of SKATE_FACTS) {
    assert.match(f.source, /^https:\/\//);
    assert.match(f.checked, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(html.includes(t(f.text)), f.text.slice(0, 40));
    assert.ok(html.includes(`href="${f.source.replace(/&/g, '&amp;')}"`), f.source);
  }
  for (const s of SKATE.sections) assert.ok(html.includes(`id="${s.id}"`), s.id);
  assert.ok(html.includes('noindex'));
});

test('the skate park page is linked from /visit/ and the footer', () => {
  assert.ok(read('visit/index.html').includes('href="/skate/"'));
  assert.ok(read('index.html').includes('href="/skate/"'));
  assert.ok(read('es/visit/index.html').includes('href="/es/skate/"'));
});

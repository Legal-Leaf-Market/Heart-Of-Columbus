// The visitor page states facts about Columbus, so each one must say where it
// came from and when someone last checked it.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { VISIT_SECTIONS, SRC } from '../src/data/visit.mjs';

test('every visit fact has a source URL and a checked date', () => {
  for (const sec of VISIT_SECTIONS) {
    for (const f of sec.facts) {
      assert.match(f.source ?? '', /^https:\/\//, `no source: ${f.text}`);
      assert.match(f.checked ?? '', /^\d{4}-\d{2}-\d{2}$/, `no checked date: ${f.text}`);
      assert.ok(!f.text.includes('—'), `em dash in: ${f.text}`);
    }
  }
});

test('/visit/ is built, noindex, linked from the header and points to the official site', () => {
  const html = readFileSync(new URL('../dist/visit/index.html', import.meta.url), 'utf8');
  assert.match(html, /noindex/);
  assert.match(html, /not the visitors bureau/);
  assert.ok(html.includes(`href="${SRC.official}"`));
  assert.ok(!html.includes('—'));
  assert.match(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), /href="\/visit\/"/);
});

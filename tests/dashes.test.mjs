// Owner's rule: no visible dashes on the site. The build checks every page
// (src/visible.mjs); this covers the detector itself and the text that
// scripts put on the page at load time.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dashes } from '../src/visible.mjs';

test('the dash check catches dashes a person sees and skips code', () => {
  assert.deepEqual(dashes('<p>9 AM – 5 PM</p>'), ['9 AM – 5 PM']);
  assert.deepEqual(dashes('<p>a &mdash; b</p><p>c &#8211; d</p>'), ['a — b', 'c – d']);
  assert.deepEqual(dashes('<img alt="Mill Race - Columbus">'), ['Mill Race - Columbus']);
  assert.deepEqual(dashes('<meta name="description" content="Eat -- drink">'), ['Eat -- drink']);
  assert.deepEqual(dashes('<p>dog-friendly, (812) 555-0100</p><a href="/b/a-b/" class="mt-3">x</a>'), []);
  assert.deepEqual(dashes('<script>var a = b - 1; s = "–";</script><style>.x{margin:-1px}</style>'), []);
});

test('scripts and the search index carry no em or en dash', () => {
  const dir = new URL('../public/js/', import.meta.url);
  for (const f of readdirSync(dir).filter((n) => n.endsWith('.js'))) {
    assert.ok(!/[—–]/.test(readFileSync(new URL(f, dir), 'utf8')), `public/js/${f}`);
  }
  const index = readFileSync(new URL('../dist/data/directory.json', import.meta.url), 'utf8');
  assert.ok(!/[—–]|\\u201[34]/i.test(index) && !/ - /.test(index), 'dist/data/directory.json');
});

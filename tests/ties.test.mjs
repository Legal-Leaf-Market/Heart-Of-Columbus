// A business tied to the people who run Heart of Columbus (`tie` in
// src/data/added.mjs) carries a disclosure wherever its shop is shown.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const read = (f) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');

test('owner ties are disclosed on /order/ and on the shop section of their page', () => {
  const order = read('order/index.html');
  const tied = directory.filter((b) => b.added?.tie);
  assert.ok(tied.length >= 1);
  for (const b of tied) {
    const page = read(`b/${b.slug}/index.html`);
    assert.ok(page.includes(esc(b.added.tie)) || page.includes(b.added.tie), `${b.slug}: tie on its page`);
    if (order.includes(`data-shop="${b.slug}"`)) {
      const block = order.slice(order.lastIndexOf('class="shop-block"', order.indexOf(`data-shop="${b.slug}"`)), order.indexOf(`data-shop="${b.slug}"`));
      assert.match(block, /Disclosure:/, `${b.slug}: disclosure in its /order/ shop block`);
    }
  }
});

// Owner draft websites (sites/<slug>/) are served at /preview/<slug>/ so a
// link can be sent before the owner has a host. They are someone else's site,
// so they never get indexed and never pretend to be finished.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { neverIndexed } from '../src/indexing.mjs';

const dist = new URL('../dist/preview/', import.meta.url);

test('every owner preview is noindex, on the never-index list, and says it is a draft', () => {
  const slugs = readdirSync(dist);
  assert.ok(slugs.includes('tjs-chopshop'));
  for (const slug of slugs) {
    for (const f of readdirSync(new URL(`${slug}/`, dist)).filter((f) => f.endsWith('.html'))) {
      const html = readFileSync(new URL(`${slug}/${f}`, dist), 'utf8');
      assert.match(html, /<meta name="robots" content="noindex, nofollow">/, `${slug}/${f}`);
      assert.ok(neverIndexed(`preview/${slug}/${f}`), `${slug}/${f}`);
    }
    assert.match(readFileSync(new URL(`${slug}/index.html`, dist), 'utf8'), /Draft (website|for discussion)/, slug);
  }
});

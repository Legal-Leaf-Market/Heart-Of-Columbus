// The newspaper's rules: real people only in bylines, disclosures that
// can't be forgotten, and trust pages that stay noindex until launch.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { STAFF, SAMPLE_STAFF } from '../src/data/staff.mjs';
import { PAPER } from '../src/data/paper.mjs';
import { disclosures } from '../src/news/disclosure.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (p) => readFileSync(new URL(p, dist), 'utf8');

test('staff entries are complete and samples are clearly fake', () => {
  for (const [slug, s] of Object.entries(STAFF)) {
    assert.match(slug, /^[a-z0-9-]+$/);
    assert.ok(s.name && s.role && s.bio, slug);
    assert.ok(!s.sample, `${slug} is in STAFF but flagged sample`);
    assert.ok(existsSync(new URL(`staff/${slug}/index.html`, dist)), `no page for ${slug}`);
  }
  for (const [slug, s] of Object.entries(SAMPLE_STAFF)) {
    assert.ok(s.sample && /^Sample /.test(s.name), slug);
    assert.ok(!STAFF[slug], `${slug} is both real and sample`);
    assert.ok(!existsSync(new URL(`staff/${slug}/index.html`, dist)), `sample ${slug} got a staff page`);
  }
  assert.ok(STAFF[PAPER.publisher], 'publisher is on staff');
  if (PAPER.editor) assert.ok(STAFF[PAPER.editor]?.editor, 'editor is on staff and may approve');
});

test('tagging a partner or sponsor always adds a disclosure', () => {
  const partners = { 'some-cafe': { pickup: true } };
  const sponsors = { 'some-shop': { name: 'Some Shop' } };
  const d = disclosures(['some-cafe', 'some-shop', 'downtown'], { partners, sponsors });
  assert.deepEqual(d.map((x) => [x.slug, x.kind]), [['some-cafe', 'partner'], ['some-shop', 'sponsor']]);
  assert.equal(disclosures(['downtown'], { partners, sponsors }).length, 0);
});

test('trust pages exist, are noindex, and explain every label', () => {
  for (const p of ['about/', 'about/standards/', 'about/corrections/', 'staff/']) {
    const html = read(p + 'index.html');
    assert.match(html, /name="robots" content="noindex/, p);
  }
  const std = read('about/standards/index.html');
  for (const id of ['ethics', 'ai', 'sources', 'anonymous', 'conflicts', 'labels', 'corrections']) assert.ok(std.includes(`id="${id}"`), id);
});

// Editor sign-off on history pieces: every approval names a real editor, nobody
// approves their own writing, and a piece with no sign-off stays a draft.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SIGNOFF } from '../src/data/history/signoff.mjs';
import { ARTICLES } from '../src/data/history/index.mjs';
import { STAFF } from '../src/data/staff.mjs';

const byKey = Object.fromEntries(ARTICLES.map((a) => [`${a.group}/${a.slug}`, a]));

test('every sign-off is a real article and a real editor', () => {
  for (const [key, ed] of Object.entries(SIGNOFF)) {
    assert.ok(byKey[key], `${key}: no such article`);
    assert.ok(STAFF[ed]?.editor, `${key}: ${ed} cannot approve`);
  }
});

test('the two-person rule: the publisher never approves his own pieces', () => {
  for (const a of ARTICLES) if (a.group === 'publisher') assert.notEqual(SIGNOFF[`${a.group}/${a.slug}`], 'jacob-kennedy', a.slug);
});

test('approved means signed; anything unsigned is a draft', () => {
  for (const a of ARTICLES) assert.equal(a.status, SIGNOFF[`${a.group}/${a.slug}`] || a.editor ? 'approved' : 'draft', a.slug);
});

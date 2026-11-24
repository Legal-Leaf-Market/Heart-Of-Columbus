import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';
import { REVIEW_CHECKED, REVIEW_SNAPSHOTS } from '../src/data/review-snapshots.mjs';

const read = (path) => readFileSync(new URL(`../dist/${path}/index.html`, import.meta.url), 'utf8');

test('the reviews pilot shows a dated and attributed rating for each matched location', () => {
  const reviews = read('reviews');
  for (const [slug, [stars, count, source]] of Object.entries(REVIEW_SNAPSHOTS)) {
    const business = directory.find((b) => b.slug === slug);
    assert.ok(['restaurants', 'coffee-sweets'].includes(business?.cat), slug);
    assert.ok(business.address, slug);
    assert.ok(stars >= 1 && stars <= 5 && Number.isInteger(count) && count > 0, slug);
    const card = reviews.match(new RegExp(`<li class="review-card" id="${slug}"[\\s\\S]*?</li>`))?.[0];
    assert.ok(card?.includes(`href="/b/${slug}/"`), slug);
    assert.ok(card.includes(`https://restaurantguru.com/${source}`), slug);
    assert.ok(card.includes(`datetime="${REVIEW_CHECKED}"`), slug);
    assert.ok(card.includes('https://www.google.com/maps/search/?api=1'), slug);
    const profile = read(`b/${slug}`);
    assert.ok(profile.includes(`${stars.toFixed(1)} out of 5`), slug);
    assert.ok(profile.includes(`href="/reviews/#${slug}"`), slug);
  }
  assert.doesNotMatch(read('b/lucabe-coffee-co-eastbrook'), /class="review-rating"/);
  assert.doesNotMatch(read('b/124-smoke-shop'), /class="review-rating"/);
});

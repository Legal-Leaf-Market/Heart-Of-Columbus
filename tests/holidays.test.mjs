// The holiday page: the date is the Saturday after Thanksgiving, and every
// gift-card link goes to the business's own page, never a marketplace.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SMALL_BUSINESS_SATURDAY as SBS } from '../src/data/holidays.mjs';
import { giftList } from '../src/pages/holiday-pages.mjs';

test('Small Business Saturday is the Saturday after the fourth Thursday of November', () => {
  const y = Number(SBS.date.slice(0, 4));
  const nov1 = new Date(Date.UTC(y, 10, 1)).getUTCDay();
  const thanksgiving = 1 + ((4 - nov1 + 7) % 7) + 21;
  assert.equal(SBS.thanksgiving, `${y}-11-${thanksgiving}`);
  assert.equal(SBS.date, `${y}-11-${thanksgiving + 2}`);
  assert.match(SBS.source, /^https:\/\//);
  assert.match(SBS.checked, /^\d{4}-\d{2}-\d{2}$/);
});

test('gift-card links are first-party and the page lists each one', () => {
  const html = readFileSync(new URL('../dist/holidays/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('noindex'));
  const MARKET = /doordash|grubhub|ubereats|postmates|seamless|yelp|facebook|instagram|google\./i;
  for (const b of giftList()) {
    assert.ok(!MARKET.test(b.gift.url), b.slug);
    assert.ok(html.includes(b.gift.url.replace(/&/g, '&amp;')), b.slug);
  }
  assert.equal(html.includes('id="gift-cards"'), giftList().length > 0);
});

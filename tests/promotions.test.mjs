// Boost (src/promotions.mjs): paid, always labeled, sorted up and featured,
// down by itself, and never read by search.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { SPONSORS } from '../src/data/sponsors.mjs';
import { directory } from '../src/data/directory.mjs';
import { boosts, boostFirst, boostedRow, boostedSide, boostNote, DISCLOSURE, MAX } from '../src/promotions.mjs';
import { card, searchIndex } from '../src/site.mjs';

const now = new Date('2027-02-10T12:00:00Z');
const [a, b, c, d, e] = directory.filter((x) => x.cat === 'restaurants');
const deal = (o = {}) => ({ name: 'x', boost: true, slots: ['home', 'events', 'side'], since: '2027-02-01', until: '2027-02-28', confirmed: '2027-01-31', by: 'Jake, invoice 1', line: 'Fresh daily.', ...o });

test('no boost runs until one is signed, and the site shows none', () => {
  assert.equal(boosts().length, 0, 'sponsors.mjs holds no boost yet');
  const home = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
  assert.doesNotMatch(home, /class="wrap promo"|tag-boost/);
});

test('a boost needs a directory business, a confirmed payment, who confirmed it, and dates', () => {
  for (const drop of ['boost', 'confirmed', 'by', 'since', 'until']) {
    assert.equal(boosts({ now, sponsors: { [a.slug]: deal({ [drop]: '' }) } }).length, 0, `missing ${drop}`);
  }
  assert.equal(boosts({ now, sponsors: { 'not-a-business': deal() } }).length, 0);
  assert.equal(boosts({ now: new Date('2027-03-01T12:00:00Z'), sponsors: { [a.slug]: deal() } }).length, 0, 'over the day after until');
  assert.equal(boosts({ now: new Date('2027-01-31T12:00:00Z'), sponsors: { [a.slug]: deal() } }).length, 0, 'not before since');
  assert.equal(boosts({ now, sponsors: { [a.slug]: deal() } }).length, 1);
});

test('a boosted listing sorts to the top, labeled, and the rest keep their order', () => {
  const sponsors = { [c.slug]: deal() };
  const list = boostFirst([a, b, c, d], { now, sponsors });
  assert.deepEqual(list.map((x) => x.slug), [c.slug, a.slug, b.slug, d.slug]);
  assert.match(card(list[0]), /tag-boost">Boosted · paid</);
  assert.doesNotMatch(card(list[1]), /tag-boost/);
});

test('featured rows hold at most three, say Boosted and carry the disclosure', () => {
  const sponsors = Object.fromEntries([a, b, c, d, e].map((x, i) => [x.slug, deal({ since: `2027-02-0${i + 1}` })]));
  const row = boostedRow('home', { now, sponsors });
  assert.equal((row.match(/class="promo-item"/g) || []).length, MAX);
  assert.ok(row.includes(DISCLOSURE));
  assert.equal((row.match(/tag-boost/g) || []).length, MAX, 'every featured card is labeled');
  assert.match(row, /data-ends="2027-02-28"/, 'the browser takes it down after its last day');
  assert.ok(row.indexOf(a.slug) < row.indexOf(b.slug), 'oldest agreement first');
  assert.equal(boostedRow('events', { now, sponsors: { [a.slug]: deal({ slots: ['home'] }) } }), '', 'only its slots');
});

test('the side card shows another boosted business in the same category, never the page itself', () => {
  const sponsors = { [a.slug]: deal() };
  assert.match(boostedSide(b, { now, sponsors }), /Boosted · paid[\s\S]*\/b\/[^/]+\//);
  assert.equal(boostedSide(a, { now, sponsors }), '');
  const other = directory.find((x) => x.cat !== a.cat);
  assert.equal(boostedSide(other, { now, sponsors }), '');
});

test('the boosted business discloses it on its own page', () => {
  const sponsors = { [a.slug]: deal() };
  assert.match(boostNote(a, { now, sponsors }), /pays Heart of Columbus to boost this listing until 2027-02-28/);
  assert.equal(boostNote(b, { now, sponsors }), '');
});

test('search never reads a boost', () => {
  SPONSORS[a.slug] = deal({ since: '2000-01-01', until: '2999-12-31' });
  try {
    const x = searchIndex().find((r) => r.s === a.slug);
    assert.ok(!Object.keys(x).some((k) => /boost|sponsor|promo/i.test(k)) && !JSON.stringify(x).includes('Boosted'));
    const site = readFileSync(new URL('../public/js/site.js', import.meta.url), 'utf8');
    const rank = site.slice(site.indexOf('HoCScore'), site.indexOf('HoCScore') + 3000);
    assert.doesNotMatch(rank, /boost|sponsor/i);
  } finally { delete SPONSORS[a.slug]; }
});

test('the owners page explains boosting and its rules', () => {
  const owners = readFileSync(new URL('../dist/owners/index.html', import.meta.url), 'utf8');
  assert.match(owners, /id="boost"/);
  assert.match(owners, /always says Boosted · paid/);
  assert.match(owners, /never changes search results or what we write/);
});

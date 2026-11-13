// Founding Members pay us, so the badge is a disclosure as much as a perk:
// it appears only for a business that signed, it is always labeled, it puts
// the member first in its category list, and it never touches search.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { MEMBERS, PRICE, SPOTS, AMBASSADORS, REFERRAL_TIERS } from '../src/data/members.mjs';
import { CATEGORIES } from '../src/data/directory.mjs';
import { founders } from '../src/pages/founders-pages.mjs';
import { directory } from '../src/data/directory.mjs';
import { card } from '../src/site.mjs';
import { membersFirst } from '../src/pages/directory-pages.mjs';
import { disclosures } from '../src/news/disclosure.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const slugs = new Set(directory.map((b) => b.slug));

test('every member is a directory business with the date it signed', () => {
  for (const [slug, m] of Object.entries(MEMBERS)) {
    assert.ok(slugs.has(slug), `${slug}: not a directory slug`);
    assert.match(m.since, /^\d{4}-\d{2}-\d{2}$/, `${slug}: since must be the date the owner agreed`);
    assert.ok(m.contact, `${slug}: who we answer to`);
  }
  assert.ok(Object.keys(MEMBERS).length <= SPOTS, 'more members than founding spots');
});

test('the badge shows only for members', () => {
  for (const b of directory) assert.equal(!!b.member, Object.hasOwn(MEMBERS, b.slug), b.slug);
  const tj = directory.find((b) => b.slug === 'tjs-chopshop');
  assert.ok(tj, "TJ's ChopShop is listed");
  const on = card({ ...tj, member: { since: '2026-11-20' } });
  const off = card({ ...tj, member: null });
  assert.match(on, /tag-member[^>]*>★ Founding Member</);
  assert.doesNotMatch(off, /Founding Member/);
});

test('members lead their category list and keep everyone else in order', () => {
  const list = [{ slug: 'a' }, { slug: 'b', member: {} }, { slug: 'c' }, { slug: 'd', member: {} }];
  assert.deepEqual(membersFirst(list).map((b) => b.slug), ['b', 'd', 'a', 'c']);
});

test('a story tagging a member discloses it', () => {
  const d = disclosures(['tjs-chopshop'], { partners: {}, sponsors: {}, members: { 'tjs-chopshop': { since: '2026-11-20' } } });
  assert.equal(d.length, 1);
  assert.equal(d[0].kind, 'member');
  assert.match(d[0].text, /pays/);
});

test('search never ranks by membership', () => {
  const site = readFileSync(new URL('../public/js/site.js', import.meta.url), 'utf8');
  const score = site.slice(site.indexOf('HoCScore'), site.indexOf('HoCScore') + 3000);
  assert.doesNotMatch(score, /\.m\b/, 'HoCScore must not read the member flag');
});

test('/founders-club/ states the price, the free listing, the rewards and every section', () => {
  const html = dist('founders-club/index.html');
  assert.match(html, new RegExp(`\\$${PRICE} a month`));
  assert.match(html, /Free, always/);
  for (const [, what] of REFERRAL_TIERS) assert.ok(html.includes(what), what);
  const open = (html.match(/class="ow-amb-cat"/g) || []).length;
  const taken = (html.match(/class="ow-amb-cat is-taken"/g) || []).length;
  assert.equal(open + taken, CATEGORIES.length);
  assert.equal(taken, Object.keys(AMBASSADORS).length);
  assert.match(dist('owners/index.html'), /href="\/founders-club\/"/);
});

test('ambassadors name a real category and a real listing', () => {
  const cats = new Set(CATEGORIES.map((c) => c.slug));
  for (const [cat, a] of Object.entries(AMBASSADORS)) {
    assert.ok(cats.has(cat), `${cat}: not a category`);
    assert.ok(slugs.has(a.slug), `${cat}: ${a.slug} is not a directory slug`);
    assert.match(a.since, /^\d{4}-\d{2}-\d{2}$/, `${cat}: since`);
  }
});

test('founder numbers follow the order owners signed, starting at 1', () => {
  const f = founders();
  assert.deepEqual(f.map((x) => x.n), f.map((_, i) => i + 1));
  for (let i = 1; i < f.length; i++) assert.ok(f[i - 1].since <= f[i].since);
  if (!f.length) assert.match(dist('founders-club/index.html'), /Nobody on the wall yet/);
});

test('no built page shows a badge while nobody has signed', () => {
  if (Object.keys(MEMBERS).length) return;
  for (const p of ['c/beauty/barbers/index.html', 'b/tjs-chopshop/index.html']) {
    assert.doesNotMatch(dist(p), /class="tag tag-member"/, p);
  }
});

test("a listing tied to the publisher says so and never claims we are not affiliated", () => {
  const html = dist('b/legal-leaf-market-cafe/index.html');
  assert.match(html, /owned by Jacob Kennedy, who also runs Heart of Columbus/);
  assert.doesNotMatch(html, /not affiliated with this business/);
  assert.match(html, /Coming soon/);
});

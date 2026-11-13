// Founding Members pay us, so the badge is a disclosure as much as a perk:
// it appears only for a business that signed, it is always labeled, it puts
// the member first in its category list, and it never touches search.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { MEMBERS, PRICE, SPOTS } from '../src/data/members.mjs';
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

test('/owners/ explains membership and the price, and the free listing stays free', () => {
  const html = dist('owners/index.html');
  assert.match(html, /id="members"/);
  assert.match(html, new RegExp(`\\$${PRICE} a month`));
  assert.match(html, /Free, always/);
  assert.match(html, /stays free/);
});

test('no built page shows a badge while nobody has signed', () => {
  if (Object.keys(MEMBERS).length) return;
  for (const p of ['c/beauty/barbers/index.html', 'b/tjs-chopshop/index.html']) {
    assert.doesNotMatch(dist(p), /class="tag tag-member"/, p);
  }
});

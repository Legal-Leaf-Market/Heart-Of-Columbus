// Cookie Paradise and cross-listing: buttons to a business's own pages and the
// sections its own pages show it also serves (src/data/own-facts.mjs `links`,
// `also`), the pickup demo, and Founding Member #1.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { OWN_FACTS } from '../src/data/own-facts.mjs';
import { directory, CATEGORIES, inSection } from '../src/data/directory.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (p) => readFileSync(new URL(p, dist), 'utf8');

test('own-page buttons and cross-listed sections are well formed', () => {
  const slugs = new Set(directory.map((b) => b.slug));
  for (const [slug, o] of Object.entries(OWN_FACTS)) {
    assert.ok(slugs.has(slug), `${slug}: not a directory slug`);
    assert.match(o.source, /^https:\/\//, slug);
    assert.match(o.checked, /^\d{4}-\d{2}-\d{2}$/, slug);
    for (const l of o.links || []) assert.match(l.url, /^https:\/\//, `${slug}: ${l.label}`);
    for (const r of o.hours || []) assert.ok(r[0] >= 0 && r[0] <= 6 && r[1] < r[2], `${slug}: hours row ${r}`);
    for (const a of o.also || []) {
      const cat = CATEGORIES.find((c) => c.slug === a.cat);
      assert.ok(cat && cat.subs.some((s) => s.slug === a.sub), `${slug}: ${a.cat}/${a.sub} is not a section`);
      assert.match(a.url, /^https:\/\//, `${slug}: also url`);
      assert.ok(a.points.length && a.type && a.title && a.cta, `${slug}: also needs type, title, points and cta`);
    }
  }
});

test('a cross-listed business shows in that section and keeps its home section', () => {
  for (const [slug, o] of Object.entries(OWN_FACTS)) {
    const b = directory.find((x) => x.slug === slug);
    for (const a of o.also || []) {
      assert.ok(inSection(b, a.cat), `${slug} in ${a.cat}`);
      assert.ok(inSection(b, b.cat), `${slug} still in ${b.cat}`);
      assert.match(read(`c/${a.cat}/index.html`), new RegExp(`data-slug="${slug}"`), `${slug} on /c/${a.cat}/`);
      assert.match(read(`b/${slug}/index.html`), new RegExp(`id="also-${a.cat}"`), `${slug} page has its ${a.cat} section`);
    }
  }
});

test('Cookie Paradise: address and hours from its own site, the wedding page linked, first in Events as a Founding Member', () => {
  const b = directory.find((x) => x.slug === 'cookie-paradise-llc');
  assert.equal(b.address, '3950 25th St');
  assert.deepEqual(b.hours.find((r) => r[0] === 6), [6, 600, 1200]);
  const html = read('b/cookie-paradise-llc/index.html');
  assert.match(html, /Hours and address from <a href="https:\/\/cookieparadise\.co\/pages\/contact"/);
  assert.match(html, /href="https:\/\/cookieparadise\.co\/pages\/weddings-private-parties"/);
  const events = [...read('c/events/index.html').matchAll(/<article class="bz[^"]*" data-slug="([^"]+)"/g)].map((m) => m[1]);
  // Founding Members lead each section they are listed in; everyone else keeps directory order.
  assert.equal(events[0], 'cookie-paradise-llc', `order: ${events.slice(0, 3)}`);
  assert.ok(events.includes('crossroads-wedding-co'));
});

test('the Cookie Paradise pickup demo is a demo: banner, demo slug, never indexed; he is Founding Member #1', async () => {
  const { DEMO_SLUGS, PARTNERS } = await import('../src/data/partners.mjs');
  const { MEMBERS } = await import('../src/data/members.mjs');
  assert.ok(DEMO_SLUGS.includes('cookie-paradise'));
  assert.ok(!PARTNERS['cookie-paradise-llc'], 'live pickup waits for the owner’s yes');
  assert.ok(MEMBERS['cookie-paradise-llc'], 'Founding Member: Jacob confirmed he joined and paid (2026-11-13)');
  const html = read('cookie-paradise/index.html');
  assert.match(html, /Heart of Columbus concept demo/);
  assert.match(html, /<meta name="robots" content="noindex/);
  assert.match(read('preview/cookie-paradise/index.html'), /Draft website/);
  assert.match(read('preview/cookie-paradise/pitch.html'), /Founders Club/);
});

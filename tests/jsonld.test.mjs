// Structured data: every JSON-LD block parses, and what it says is on the
// page itself (name, phone, street, hours), so it never says more than we do.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { TRIPS } from '../src/data/trips.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (p) => readFileSync(new URL(p, dist), 'utf8');
const blocks = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
// Visible text, with entities and typographic quotes folded so names compare.
const text = (html) => html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&#39;|&#x27;|’/g, "'").replace(/&quot;|“|”/g, '"').replace(/\s+/g, ' ');
const fold = (s) => s.replace(/’/g, "'").replace(/[“”]/g, '"');

test('every business page has one LocalBusiness block that matches the page', () => {
  for (const b of directory) {
    const html = read(`b/${b.slug}/index.html`), seen = text(html);
    const ld = blocks(html).filter((x) => x['@type'] !== 'BreadcrumbList');
    assert.equal(ld.length, 1, b.slug);
    const x = ld[0];
    assert.ok(seen.includes(fold(x.name)), `${b.slug}: name`);
    if (x.telephone) assert.ok(seen.includes(x.telephone), `${b.slug}: phone`);
    if (x.address) assert.ok(seen.includes(fold(x.address.streetAddress)), `${b.slug}: street`);
    if (x.url) assert.ok(html.includes(`href="${x.url.replace(/&/g, '&amp;')}"`), `${b.slug}: website link`);
    if (x.openingHoursSpecification) assert.equal(x.openingHoursSpecification.length, b.hours.length, `${b.slug}: hours`);
  }
});

test('landmark, trip, visit and free pages carry parseable blocks that match', () => {
  for (const l of LANDMARKS) {
    const ld = blocks(read(`l/${l.slug}/index.html`));
    assert.ok(ld.some((x) => x.name === l.name && x['@type'].includes('TouristAttraction')), l.slug);
  }
  for (const t of TRIPS) {
    const html = read(`trips/${t.slug}/index.html`), seen = text(html);
    const list = blocks(html).find((x) => x['@type'] === 'ItemList');
    assert.equal(list.itemListElement.length, t.stops.length, t.slug);
    for (const i of list.itemListElement) assert.ok(seen.includes(fold(i.name)), `${t.slug}: ${i.name}`);
  }
  // Event markup belongs on an event's own accurate page. A static visitor page
  // cannot keep a list of dated events current between builds, and once one
  // has passed the markup says something untrue, so /visit/ carries none.
  assert.ok(!blocks(read('visit/index.html')).some((x) => x['@type'] === 'Event'));
  assert.ok(blocks(read('free/index.html')).some((x) => x['@type'] === 'BreadcrumbList'));
});

test('every JSON-LD block on every page parses', () => {
  const walk = (dir) => readdirSync(new URL(dir, dist), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}${e.name}/`) : e.name.endsWith('.html') ? [`${dir}${e.name}`] : []));
  let n = 0;
  for (const f of walk('')) for (const x of blocks(read(f))) { assert.equal(x['@context'], 'https://schema.org', f); n++; }
  assert.ok(n > 1000);
});

test('a business block names its listing page and keeps its own website as url', () => {
  const b = directory.find((x) => x.slug === 'jills-diner');
  const x = blocks(read('b/jills-diner/index.html')).find((y) => y['@type'] !== 'BreadcrumbList');
  assert.match(x['@id'], /\/b\/jills-diner\/#business$/);
  assert.match(x.mainEntityOfPage['@id'], /\/b\/jills-diner\/$/);
  if (b.website) assert.equal(x.url, b.website);
});

test('the home page says who publishes the site, and no rating or review is marked up anywhere', () => {
  const g = blocks(read('index.html')).find((x) => x['@graph']);
  assert.deepEqual(g['@graph'].map((x) => x['@type']), ['WebSite', 'Organization']);
  const walk = (dir) => readdirSync(new URL(dir, dist), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${dir}${e.name}/`) : e.name.endsWith('.html') ? [`${dir}${e.name}`] : []));
  for (const f of walk('')) for (const x of blocks(read(f))) assert.doesNotMatch(JSON.stringify(x), /AggregateRating|"Review"|ratingValue/, f);
});

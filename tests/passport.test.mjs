// The Columbus passport: honor-system digital discoveries kept in the
// browser. Imports are validated and only ever add; stamps for stops that
// left a trail are kept but not counted; nothing is sent anywhere.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { TRAILS, trailStops } from '../src/data/trails.mjs';

const src = readFileSync(new URL('../public/js/passport.js', import.meta.url), 'utf8');
const box = { document: { querySelector: () => null } };
vm.runInNewContext(src, { window: box, globalThis: box });
const core = box.HoCPassport;
// Objects from the sandbox have its prototypes; compare plain copies.
const plain = (x) => JSON.parse(JSON.stringify(x));
const P = { ...core, exportPassport: (...a) => plain(core.exportPassport(...a)), importPassport: (...a) => plain(core.importPassport(...a)), progress: (...a) => plain(core.progress(...a)) };
const html = readFileSync(new URL('../dist/passport/index.html', import.meta.url), 'utf8');

const trails = { tacos: ['a', 'b', 'c'], coffee: ['x', 'y'] };
const file = (o) => JSON.stringify({ format: P.FORMAT, version: 1, kind: 'digital-discovery', exported: '2026-11-13T00:00:00Z', ...o });

test('a saved copy loads back into an empty browser exactly', () => {
  const saved = JSON.stringify(P.exportPassport({ tacos: ['a', 'c'], coffee: [] }, trails, '2026-11-13T00:00:00Z'));
  const r = P.importPassport(saved, trails, {});
  assert.ok(r.ok);
  assert.deepEqual(r.stamps, { tacos: ['a', 'c'], coffee: [] });
  assert.equal(r.added, 2);
  assert.equal(JSON.parse(saved).kind, 'digital-discovery');
});

test('loading only adds, never removes, and never duplicates', () => {
  const r = P.importPassport(file({ trails: { tacos: ['a', 'b', 'b'] } }), trails, { tacos: ['a'], coffee: ['y'] });
  assert.deepEqual(r.stamps, { tacos: ['a', 'b'], coffee: ['y'] });
  assert.equal(r.added, 1);
});

test('broken, foreign, newer or oversized files are refused with a plain sentence', () => {
  for (const bad of ['', '{', '[]', 'null', JSON.stringify({ format: 'other', version: 1, trails: {} }),
    file({ version: 0 }), file({ version: 1.5 }), file({ version: '1' }), file({ trails: [] }), file({ trails: null })]) {
    const r = P.importPassport(bad, trails, {});
    assert.equal(r.ok, false, bad);
    assert.match(r.error, /\.$/);
  }
  assert.match(P.importPassport(file({ version: 2, trails: {} }), trails, {}).error, /newer version/);
  assert.match(P.importPassport(' '.repeat(100001), trails, {}).error, /too big/);
});

test('unknown trails and junk entries are skipped and counted, not stored', () => {
  const r = P.importPassport(file({ trails: { pizza: ['p1', 'p2'], tacos: ['a', 7, '<script>', 'b'], coffee: 'x' } }), trails, {});
  assert.ok(r.ok);
  assert.deepEqual(r.stamps, { tacos: ['a', 'b'], coffee: [] });
  assert.equal(r.skipped, 5);
  // A hand-made "__proto__" key is just an unknown trail.
  const p = P.importPassport(`{"format":"${P.FORMAT}","version":1,"trails":{"__proto__":["a"],"constructor":["a"]}}`, trails, {});
  assert.ok(p.ok);
  assert.equal(p.skipped, 2);
  assert.equal(({}).polluted, undefined);
});

test('a stamp for a stop that left the trail is kept but not counted', () => {
  const r = P.importPassport(file({ trails: { tacos: ['a', 'closed-shop'] } }), trails, {});
  assert.deepEqual(r.stamps.tacos, ['a', 'closed-shop']);
  const p = P.progress(r.stamps, trails);
  assert.deepEqual(p.per.tacos, { n: 1, of: 3, older: 1 });
  assert.equal(p.done, 1);
  assert.equal(p.total, 5);
});

test('the passport page lists every trail and stop, and says what a stamp is not', () => {
  const data = JSON.parse(html.match(/<script type="application\/json" id="passport-data">([\s\S]*?)<\/script>/)[1]);
  assert.deepEqual(data, TRAILS.map((x) => ({ slug: x.slug, ids: trailStops(x).map((s) => s.id) })));
  for (const x of TRAILS) assert.ok(html.includes(`data-pp-trail="${x.slug}"`), x.slug);
  assert.match(html, /not a verified visit/);
  assert.match(html, /can’t be redeemed/);
  assert.doesNotMatch(html.replace(/<script[\s\S]*?<\/script>/g, ''), /win a |earn points|prize|official trail|our partner/i);
  assert.doesNotMatch(src, /fetch\(|XMLHttpRequest|sendBeacon|\/api\//);
  for (const x of TRAILS) assert.ok(readFileSync(new URL(`../dist/trails/${x.slug}/index.html`, import.meta.url), 'utf8').includes('href="/passport/"'), x.slug);
});

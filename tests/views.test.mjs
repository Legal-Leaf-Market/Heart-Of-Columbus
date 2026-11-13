// Cards, Map, Table and Board on a type page (public/js/views.js). The page
// ships the switcher hidden (it needs the script) and only the links the
// search index lacks; other type pages stay as they were.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { directory } from '../src/data/directory.mjs';
import { VIEW_TYPES } from '../src/pages/directory-pages.mjs';

const root = new URL('../', import.meta.url);
const html = (p) => readFileSync(new URL(`dist/${p}index.html`, root), 'utf8');

test('the barbershops page offers four views, hidden until the script runs', () => {
  assert.ok(VIEW_TYPES.has('barbers'));
  const page = html('c/beauty/barbers/');
  assert.match(page, /<div class="wrap vbar" data-v-bar hidden>/);
  for (const v of ['cards', 'map', 'table', 'board']) assert.match(page, new RegExp(`data-v="${v}" aria-pressed="(?:true|false)"`), v);
  assert.match(page, /data-v="cards" aria-pressed="true"/);
  assert.match(page, /<div class="wrap views" data-v-root data-view="cards">/);
  for (const pane of ['data-v-list', 'data-v-map', 'data-v-table', 'data-v-board', 'data-v-float']) assert.ok(page.includes(pane), pane);
  assert.match(page, /<script src="\/js\/views\.js\?v=[0-9a-f]{10}"/);
  assert.match(page, /href="\/explore\/\?cat=beauty&sub=barbers&view=map" data-v-go="map"/, 'map button still works without the script');
});

test("the page's own links match each listing's booking and ordering links", () => {
  const page = html('c/beauty/barbers/');
  const raw = page.match(/<script type="application\/json" data-v-data>([\s\S]*?)<\/script>/)[1];
  assert.ok(!raw.includes('<'), 'JSON in a script tag escapes <');
  const data = JSON.parse(raw);
  const slugs = [...page.matchAll(/<article class="bz[^"]*" data-slug="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(slugs.length > 5);
  for (const s of slugs) {
    const b = directory.find((x) => x.slug === s);
    assert.deepEqual(data.links[s].b || null, b.book[0] ? [b.book[0].label, b.book[0].url] : null, s);
    assert.deepEqual(data.links[s].o || null, b.order[0] ? [b.order[0].label, b.order[0].url] : null, s);
  }
  assert.ok(Object.values(data.links).some((l) => l.b), 'some barbershop books online');
  assert.equal(data.areas.downtown, 'Downtown');
});

test('types without views keep the plain list', () => {
  for (const p of ['c/beauty/', 'c/beauty/salons/', 'c/restaurants/']) {
    const page = html(p);
    assert.doesNotMatch(page, /data-v-root|data-v-bar|views\.js|data-v-go/, p);
  }
});

test('views.js keeps state in the address, not in browser storage', () => {
  const js = readFileSync(new URL('public/js/views.js', root), 'utf8');
  assert.doesNotMatch(js, /localStorage|sessionStorage|document\.cookie/);
  assert.match(js, /history\.replaceState/);
  // The disclosure travels with the painted scene into every view.
  assert.match(js, /Category illustration/);
});

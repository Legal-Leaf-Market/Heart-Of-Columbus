// Search relevance, run against the real public/js/site.js and the real
// directory data, so the browser and the test cannot disagree.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const noop = () => {};
const el = { addEventListener: noop, querySelector: () => null, querySelectorAll: () => [], setAttribute: noop, getAttribute: () => null, classList: { add: noop, remove: noop, toggle: noop } };
const win = {
  document: { ...el, documentElement: el, body: el, readyState: 'complete', createElement: () => ({ ...el, style: {} }) },
  location: { search: '', hash: '', pathname: '/' }, localStorage: { getItem: () => null, setItem: noop }, sessionStorage: { getItem: () => null, setItem: noop },
  addEventListener: noop, setTimeout: () => 0, setInterval: () => 0, requestIdleCallback: () => 0, matchMedia: () => ({ matches: false, addEventListener: noop }),
  history: { replaceState: noop }, navigator: {}, fetch: () => new Promise(noop), Intl, Date, Math, JSON, URLSearchParams, console,
};
win.window = win;
vm.runInNewContext(readFileSync(new URL('../public/js/site.js', import.meta.url), 'utf8'), win);
const all = JSON.parse(readFileSync(new URL('../dist/data/directory.json', import.meta.url), 'utf8'));
const rank = (q) => win.HoCRank(all, q).map((b) => b.n);

test('coffee: places that are coffee outrank places that only share the category', () => {
  const r = rank('coffee');
  const coffee = ['Lucabe Coffee Co. 4th Street', 'Lucabe Coffee Co. Eastbrook', 'Sojourn Coffee Company', "Donuts 'n' Coffee", 'Tribal Blend Cat Cafe'];
  const at = (n) => r.indexOf(n);
  for (const c of coffee) assert.ok(at(c) >= 0 && at(c) < at('Black Jewell Popcorn') && at(c) < at('Cookie Paradise LLC'), `${c} before the popcorn and cookies`);
  assert.equal(r.length, all.filter((b) => win.HoCMatch(b, 'coffee')).length, 'ranking hides nothing');
});

test('a name comes first, with or without its apostrophe', () => {
  assert.match(rank('Lucabe')[0], /^Lucabe/);
  assert.equal(rank("Jill's")[0], "Jill's Diner");
  assert.equal(rank('Jills')[0], "Jill's Diner");
  assert.equal(rank('jill’s diner')[0], "Jill's Diner");
});

test('aliases and streets still find the right kind of place', () => {
  const tacos = rank('tacos');
  assert.equal(tacos[0], 'TaColumbus');
  assert.ok(tacos.length >= 5, 'taquerias and Mexican restaurants count as tacos');
  assert.ok(tacos.slice(0, 5).every((n) => all.find((b) => b.n === n).c === 'restaurants'), 'the first five are restaurants');
  assert.ok(rank('haircut').some((n) => all.find((b) => b.n === n).u === 'barbers'));
  assert.ok(rank('barber').slice(0, 5).every((n) => all.find((b) => b.n === n).u === 'barbers'));
  assert.ok(rank('plumber').length > 0);
  assert.ok(rank('25th St').length > 20);
  assert.ok(rank('coffee downtown').length > 0);
  assert.deepEqual(rank('qzxv nonsense'), []);
});

test('Explore defaults to best match and its empty state offers a way back', () => {
  const ex = readFileSync(new URL('../dist/explore/index.html', import.meta.url), 'utf8');
  assert.match(ex, /<select data-ex-sort aria-label="Sort"><option value="match">Best match<\/option>/);
  assert.match(ex, /data-ex-recover/);
  const js = readFileSync(new URL('../public/js/explore.js', import.meta.url), 'utf8');
  assert.match(js, /params\.get\('sort'\) \|\| 'match'/);
  assert.match(js, /window\.HoCRank\(out, st\.q\)/);
});

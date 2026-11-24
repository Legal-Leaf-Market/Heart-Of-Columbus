// The nightly cart check: which shops a shopper would find broken, and which
// of those broke since the last run.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { verdict, report, problemsOf } from '../scripts/handoff-verdict.mjs';

const ok = (items, extra = {}) => ({ platform: 'shopify', api: 200, items, ...extra });
const run = (shops) => ({ checked: '2026-11-25T09:00:00Z', site: 'https://example.test', shops });

test('a shop that reads and hands off is healthy', () => {
  const v = verdict(run({ a: ok(40), b: ok(5, { platform: 'woocommerce', adds: [{ item: 'Mug', pass: true }] }) }), null);
  assert.deepEqual(v.broken, {});
  assert.equal(v.healthy, 2);
  assert.match(report(v, run({})), /Every shop/);
});

test('no answer, no products and a failed add to cart are each broken', () => {
  assert.match(problemsOf({ api: 502, items: 0, error: 'Their store did not answer.' })[0], /could not be read \(502/);
  assert.deepEqual(problemsOf(ok(0)), ['read no products']);
  const p = problemsOf(ok(9, { adds: [{ item: 'Coffee', option: '12 oz', pass: false, notice: 'Sorry, out of stock' }] }));
  assert.match(p[0], /add to cart failed for "Coffee" \(12 oz\): Sorry, out of stock/);
});

test('a catalog that halves is flagged, a small or steady one is not', () => {
  assert.match(problemsOf(ok(40), ok(100))[0], /shrank from 100 to 40/);
  assert.deepEqual(problemsOf(ok(60), ok(100)), []);
  assert.deepEqual(problemsOf(ok(2), ok(8)), []);
});

test('a shop already broken last run is not called new', () => {
  const last = run({ a: { api: 502, items: 0, error: 'x' }, b: ok(30) });
  const v = verdict(run({ a: { api: 502, items: 0, error: 'x' }, b: ok(0) }), last);
  assert.deepEqual(Object.keys(v.broken).sort(), ['a', 'b']);
  assert.deepEqual(v.fresh, ['b']);
  assert.match(report(v, last), /\*\*b\*\* \(new since the last run\)/);
});

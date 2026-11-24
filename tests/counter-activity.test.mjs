import assert from 'node:assert/strict';
import test from 'node:test';
import { countActivity } from '../src/counter-activity.mjs';

test('counts only recently matched real orders that have not been cancelled', () => {
  const now = Date.parse('2026-11-24T15:00:00Z');
  const order = { at: '2026-11-23T10:00:00Z', click: 'referral', test: false };
  const cases = [
    order,
    { ...order, test: true },
    { ...order, test: undefined },
    { ...order, status: 'cancelled' },
    { ...order, click: 'unmatched' },
    { ...order, at: '2026-11-16T10:00:00Z' },
    { ...order, at: '2026-11-25T10:00:00Z' },
  ];
  assert.equal(countActivity(cases, new Set(['referral']), now), 1);
});

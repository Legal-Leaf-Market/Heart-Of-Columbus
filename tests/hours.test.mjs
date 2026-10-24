// Opening hours parsing and "open now".
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDay, parseWeek, openAt, fmtRange } from '../src/hours.mjs';

test('parses the shapes Google Maps uses', () => {
  assert.deepEqual(parseDay('11 AM–9 PM'), [[660, 1260]]);
  assert.deepEqual(parseDay('3–9 PM'), [[900, 1260]]);
  assert.deepEqual(parseDay('7:30 AM–5 PM'), [[450, 1020]]);
  assert.deepEqual(parseDay('11 AM–2 PM, 5–9 PM'), [[660, 840], [1020, 1260]]);
  assert.deepEqual(parseDay('12–8 PM'), [[720, 1200]]);
  assert.deepEqual(parseDay('11–1 AM'), [[660, 1500]]);
  assert.deepEqual(parseDay('5 PM–2 AM'), [[1020, 1560]]);
  assert.deepEqual(parseDay('11 AM–12 AM'), [[660, 1440]]);
  assert.deepEqual(parseDay('Open 24 hours'), [[0, 1440]]);
  assert.deepEqual(parseDay('Closed'), []);
  assert.equal(parseDay('Hours might differ'), null);
});

test('open now, including past midnight', () => {
  const w = parseWeek({ Monday: '5 PM–2 AM', Tuesday: 'Closed', Wednesday: 'Closed', Thursday: 'Closed', Friday: '11 AM–9 PM', Saturday: 'Closed', Sunday: 'Closed' });
  assert.deepEqual(openAt(w, 1, 18 * 60), { open: true, until: 1560 });
  assert.deepEqual(openAt(w, 2, 60), { open: true, until: 120 });
  assert.equal(openAt(w, 2, 180).open, false);
  assert.deepEqual(openAt(w, 2, 180), { open: false, nextDay: 3, opens: 660 });
  assert.equal(fmtRange(660, 1500), '11 AM–1 AM');
});

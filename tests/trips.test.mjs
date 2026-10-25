// Trip ideas promise that each stop is open when you get there. This test
// holds them to it, so a change in hours breaks the build, not a visit.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { TRIPS } from '../src/data/trips.mjs';
import { stopOf, coveringRow } from '../src/pages/trip-pages.mjs';
import { walkMin } from '../src/pages/landmark-pages.mjs';
import { km } from '../src/data/directory.mjs';

test('every business stop is open for its whole slot on the trip day', () => {
  for (const trip of TRIPS) {
    for (const [id, from, to] of trip.stops) {
      const s = stopOf(id);
      assert.ok(s, `${trip.slug}: unknown stop ${id}`);
      if (s.kind === 'business') {
        assert.ok(!s.b.tempClosed, `${trip.slug}: ${id} is temporarily closed`);
        assert.ok(coveringRow(s.b.hours, trip.day, from, to), `${trip.slug}: ${id} is not open ${from}-${to} on day ${trip.day}`);
      } else {
        assert.ok(s.l.street || s.l.tour, `${trip.slug}: ${id} can't be seen by a visitor`);
      }
    }
  }
});

test('slots run in order and each stop is a short walk from the last', () => {
  for (const trip of TRIPS) {
    trip.stops.forEach(([id, from, to], i) => {
      assert.ok(from < to, `${trip.slug}: ${id} slot`);
      if (!i) return;
      const [pid, , pto] = trip.stops[i - 1];
      assert.ok(from >= pto, `${trip.slug}: ${id} starts before ${pid} ends`);
      const a = stopOf(pid), b = stopOf(id);
      if (a.ll && b.ll) assert.ok(walkMin(km(a.ll, b.ll)) <= 10, `${trip.slug}: ${pid} to ${id} is not a short walk`);
    });
  }
});

test('trip copy stays factual and every trip page is built', () => {
  for (const trip of TRIPS) {
    assert.doesNotMatch(`${trip.title} ${trip.line}`, /\b(best|favorite|must|hidden gem|iconic)\b/i, trip.slug);
    const html = readFileSync(new URL(`../dist/trips/${trip.slug}/index.html`, import.meta.url), 'utf8');
    assert.match(html, /noindex/);
    assert.match(html, /straight-line estimates/);
  }
  assert.match(readFileSync(new URL('../dist/visit/index.html', import.meta.url), 'utf8'), /id="your-way"/);
});

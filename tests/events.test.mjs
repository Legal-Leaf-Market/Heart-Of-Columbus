// Events are facts about real happenings: each needs its official page, a
// source and a checked date. Stale ones are flagged so someone prunes them.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { EVENTS } from '../src/data/events.mjs';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

test('every event has dates, a venue point, its official page, a source and a checked date', () => {
  const slugs = new Set();
  for (const e of EVENTS) {
    assert.ok(!slugs.has(e.slug), `duplicate ${e.slug}`);
    slugs.add(e.slug);
    assert.match(e.start, ISO, e.slug);
    assert.match(e.end, ISO, e.slug);
    assert.ok(e.start <= e.end, `${e.slug}: ends before it starts`);
    assert.match(e.url, /^https:\/\//, `${e.slug}: official page`);
    assert.match(e.source, /^https:\/\//, `${e.slug}: source`);
    assert.match(e.checked, ISO, `${e.slug}: checked`);
    assert.ok(e.venue && e.line && e.ll && e.llSource, e.slug);
    if (e.times) assert.ok(e.times[0] < e.times[1], `${e.slug}: times`);
    assert.ok(!JSON.stringify(e).includes('—'), `${e.slug}: em dash`);
  }
});

test('warn about events that ended more than 30 days ago', (t) => {
  const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const stale = EVENTS.filter((e) => e.end < cutoff).map((e) => e.slug);
  if (stale.length) t.diagnostic(`Stale events, remove them: ${stale.join(', ')}`);
});

test('/events.ics is a calendar with every event, and both event sections are built', () => {
  const ics = readFileSync(new URL('../dist/events.ics', import.meta.url), 'utf8');
  assert.match(ics, /^BEGIN:VCALENDAR\r\n/);
  assert.match(ics, /END:VCALENDAR\r\n$/);
  for (const e of EVENTS) assert.ok(ics.includes(`UID:${e.slug}@heartofcolumbus`), e.slug);
  for (const line of ics.split('\r\n')) assert.ok(line.length <= 75, `long line: ${line}`);
  assert.match(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), /data-events="weekend"/);
  assert.match(readFileSync(new URL('../dist/visit/index.html', import.meta.url), 'utf8'), /data-events="upcoming"/);
});

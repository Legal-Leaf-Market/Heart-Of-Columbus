// The public calendar lists what the public can attend. Rentals, practices
// and closures from the parks booking sheet are counted and named, not listed.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { access, collect, toCsv, toIcs } from '../src/event-feeds.mjs';

test('the listing words decide, and a real public event is never caught', () => {
  for (const t of ['Private Event', 'Private Party, Lincoln Center', 'Shelter Rental', 'Ice Rental']) assert.equal(access(t), 'private', t);
  for (const t of ['Columbus Youth Hockey Practice', 'Figure Skating Club Practice', 'Varsity Scrimmage']) assert.equal(access(t), 'practice', t);
  for (const t of ['No Drop-ins', 'No Drop-In', 'Pool Closed for Maintenance', 'Gym closure']) assert.equal(access(t), 'closed', t);
  for (const t of ['Open Skate', 'Public Ice Skating', 'Open Gym, Drop-in Basketball', 'Toddler Storytime', 'Bluegrass Jamboree',
    'Columbus North vs. Columbus East Hockey', 'Private Investigator Talk at the Library', 'Birthday Party for Dr. Seuss', 'Halloween Fall Fest'])
    assert.equal(access(t), 'public', t);
});

const ICS = ['BEGIN:VCALENDAR', 'VERSION:2.0',
  ...[['b1', 'Open Skate', 27], ['b2', 'Private Event', 28], ['b3', 'No Drop-ins', 29], ['b4', 'Youth Hockey Practice', 30]].flatMap(([uid, s, d]) =>
    ['BEGIN:VEVENT', `UID:${uid}`, `DTSTART:202610${d}T220000Z`, `DTEND:202610${d}T230000Z`, `SUMMARY:${s}`, 'LOCATION:Hamilton Center Ice Arena', 'END:VEVENT']),
  'END:VCALENDAR', ''].join('\r\n');

test('collect keeps the public listings, counts the rest, and exports agree', async () => {
  const fake = async (url) => (String(url).includes('libnet.info') ? new Response('[]') : new Response(ICS));
  const d = await collect({ from: '2026-10-26', days: 14, only: ['parks'], fetchImpl: fake });
  assert.deepEqual(d.events.map((e) => e.title), ['Open Skate']);
  assert.deepEqual(d.left.map((x) => [x.title, x.access]), [['Private Event', 'private'], ['No Drop-ins', 'closed'], ['Youth Hockey Practice', 'practice']]);
  for (const x of d.left) assert.equal(x.venue, 'Hamilton Center Ice Arena');
  assert.doesNotMatch(toCsv(d) + toIcs(d), /Private Event|No Drop-ins|Practice/);
});

test('the events page reads the left-out list', () => {
  const js = readFileSync(new URL('../public/js/calendar.js', import.meta.url), 'utf8');
  assert.match(js, /data\.left/);
  assert.match(js, /Venue notices/);
});

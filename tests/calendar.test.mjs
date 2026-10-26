// Local events: the library's Communico rows and the parks iCalendar feed
// become one clean list with a source on every item, no dashes, and
// exports a newspaper or a calendar app can take. The rows below are
// made-up fixtures in each feed's shape, never shown on the site.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { parseCommunico, parseIcs, collect, toText, toCsv, toIcs, noDash, apTime, webTime, handEntered, communicoUrl } from '../src/event-feeds.mjs';
import { SOURCES, LISTINGS } from '../src/data/events.mjs';

const ROWS = [
  { id: '101', title: 'Toddler Storytime &amp; Songs', sub_title: '', event_start: '2026-10-27 10:30:00', event_end: '2026-10-27 11:00:00', location: 'Columbus', venues: 'Children’s Area', venue_type: 'internal', url: 'https://mybcpl.libnet.info/event/101', agesArray: ['Toddlers', 'Preschool'], private_event: '0', changed: null, changed_reason: '' },
  { id: '102', title: 'Lego Club – Grades 1-5', event_start: '2026-10-28 16:00:00', event_end: '2026-10-28 17:00:00', location: 'Hope', venues: '', url: '', agesArray: ['School Age'], private_event: '0' },
  { id: '103', title: 'All Library Locations Closed', event_start: '2026-10-29 00:00:00', event_end: '2026-10-29 23:59:00', location: 'Columbus', agesArray: [] },
  { id: '104', title: 'Board meeting', event_start: '2026-10-29 17:00:00', event_end: '2026-10-29 18:00:00', location: 'Columbus', private_event: '1' },
  { id: '105', title: 'Flow Yoga', event_start: '2026-10-29 12:00:00', event_end: '2026-10-29 13:00:00', location: 'Columbus', venues: 'Red Room', agesArray: ['Adults'], changed: 'cancelled', changed_reason: 'Instructor ill' },
];

const ICS = [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//fixture//EN',
  'BEGIN:VTIMEZONE', 'TZID:America/New_York', 'BEGIN:STANDARD', 'DTSTART:19701101T020000', 'END:STANDARD', 'END:VTIMEZONE',
  'BEGIN:VEVENT', 'UID:a1@tockify', 'DTSTART:20261031T220000Z', 'DTEND:20261101T000000Z', 'SUMMARY:Halloween Fall Fest - Donner Park',
  'LOCATION:Donner Park\\, 739 22nd St\\, Columbus\\, IN 47201', 'URL:https://columbusparksandrec.com/fall-fest/', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:a2@tockify', 'DTSTART;TZID=America/New_York:20261026T180000', 'DTEND;TZID=America/New_York:20261026T193000',
  'RRULE:FREQ=WEEKLY;BYDAY=MO,WE;COUNT=4', 'EXDATE;TZID=America/New_York:20261028T180000', 'SUMMARY:Open Skate', 'LOCATION:Hamilton Center Ice Arena', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:a3@tockify', 'DTSTART;VALUE=DATE:20261102', 'DTEND;VALUE=DATE:20261105', 'SUMMARY:Fun Guide registration week', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:a4@tockify', 'DTSTART:20261027T230000Z', 'SUMMARY:Cancelled: Trivia', 'STATUS:CANCELLED', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:a5@tockify', 'DTSTART:20251027T230000Z', 'SUMMARY:Last year', 'END:VEVENT',
  'BEGIN:VEVENT', 'UID:a6@tockify', 'DTSTART:20261030T230000Z', 'DTEND:20261031T010000Z', 'SUMMARY:Bluegrass Jamboree for all ages with a long title that folds across',
  '  two lines', 'END:VEVENT',
  'END:VCALENDAR', '',
].join('\r\n');

test('no dashes survive, ranges read "to"', () => {
  assert.equal(noDash('Lego Club – Grades 1-5'), 'Lego Club, Grades 1 to 5');
  assert.equal(noDash('Grades K-5 at 2026-10-26'), 'Grades K to 5 at 2026-10-26');
  assert.equal(noDash('Ages 3–5'), 'Ages 3 to 5');
  assert.equal(noDash('Teen Drop-in - Gaming'), 'Teen Drop-in, Gaming');
  assert.equal(noDash('— Storytime —'), 'Storytime');
  assert.equal(webTime(1080, 1200), '6 to 8 PM');
  assert.equal(webTime(660, 780), '11 AM to 1 PM');
  assert.equal(apTime(720, 780), 'noon to 1 p.m.');
  assert.equal(apTime(1050, 1170), '5:30 to 7:30 p.m.');
  assert.equal(apTime(600, 720), '10 a.m. to noon');
  assert.equal(apTime(null, null), 'all day');
  assert.equal(apTime(1260, 1560), '9 p.m. to 2 a.m.');
  assert.equal(webTime(1260, 1560), '9 PM to 2 AM');
});

test('library rows: kept, cleaned, linked; closures, private and cancelled dropped', () => {
  const got = parseCommunico(ROWS);
  assert.deepEqual(got.map((x) => x.id), ['bcpl-101', 'bcpl-102']);
  const [a, b] = got;
  assert.equal(a.title, 'Toddler Storytime & Songs');
  assert.equal(a.venue, 'Cleo Rogers Memorial Library, Children’s Area');
  assert.equal(a.when, '10:30 to 11 AM');
  assert.deepEqual(a.aud, ['kids']);
  assert.equal(b.title, 'Lego Club, Grades 1 to 5');
  assert.equal(b.venue, 'Hope Branch Library');
  assert.equal(b.url, 'https://mybcpl.libnet.info/event/102');
  assert.match(communicoUrl('2026-10-26', 14), /^https:\/\/mybcpl\.libnet\.info\/eeventcaldata\?event_type=0&req=%7B/);
});

test('parks iCalendar: time zones, repeats, exceptions, all-day runs, folding, cancellations', () => {
  const got = parseIcs(ICS, { from: '2026-10-26', to: '2026-11-08', fallbackUrl: 'https://columbusparksandrec.com/events/' });
  const by = (t) => got.filter((x) => x.title === t);
  const fest = by('Halloween Fall Fest, Donner Park')[0];
  assert.equal(fest.date, '2026-10-31');
  assert.equal(fest.when, '6 to 8 PM'); // 22:00Z is 6 PM EDT
  assert.equal(fest.venue, 'Donner Park, 739 22nd St');
  assert.equal(fest.url, 'https://columbusparksandrec.com/fall-fest/');
  // Weekly Mon and Wed, four times (COUNT includes the excluded Oct 28);
  // Nov 2 is after the DST change and still 6 PM.
  assert.deepEqual(by('Open Skate').map((x) => [x.date, x.when]), [['2026-10-26', '6 to 7:30 PM'], ['2026-11-02', '6 to 7:30 PM'], ['2026-11-04', '6 to 7:30 PM']]);
  assert.equal(by('Open Skate')[0].url, 'https://columbusparksandrec.com/events/');
  const reg = by('Fun Guide registration week')[0];
  assert.deepEqual([reg.date, reg.until, reg.when], ['2026-11-02', '2026-11-04', 'Through Nov 4']);
  assert.equal(by('Last year').length, 0);
  assert.ok(!got.some((x) => /Trivia/.test(x.title)));
  assert.equal(by('Bluegrass Jamboree for all ages with a long title that folds across two lines').length, 1);
  assert.ok(got.find((x) => /Bluegrass/.test(x.title)).aud.includes('kids'));
});

test('collect: one feed down never empties the page, and every item has a source', async () => {
  const fake = async (url) => {
    if (String(url).includes('libnet.info')) return new Response(JSON.stringify(ROWS));
    throw new Error('offline');
  };
  const d = await collect({ from: '2026-10-26', days: 31, fetchImpl: fake });
  const st = Object.fromEntries(d.sources.map((s) => [s.id, s]));
  assert.equal(st.bcpl.ok, true);
  assert.equal(st.parks.ok, false);
  assert.equal(st.arts.ok, true);
  assert.ok(d.events.some((e) => e.src === 'bcpl') && d.events.some((e) => e.src === 'arts'));
  for (const e of d.events) {
    assert.ok(SOURCES.some((s) => s.id === e.src), e.id);
    assert.match(e.url, /^https:\/\//, e.id);
    assert.ok(!/[–—]| - /.test(JSON.stringify(e)), e.id);
  }
  assert.deepEqual(d.events.map((e) => e.date), [...d.events.map((e) => e.date)].sort());

  const txt = toText(d);
  assert.match(txt, /^OCT\. 26, 2026 TO NOV\. 25, 2026\n/);
  assert.match(txt, /\nTUESDAY, OCT\. 27\nToddler Storytime & Songs: 10:30 to 11 a\.m\., Cleo Rogers Memorial Library/);
  assert.match(txt, /Listings from the public calendars of Bartholomew County Public Library \(mybcpl\.org\)/);
  assert.ok(!/[–—]| - /.test(txt));
  const csv = toCsv(d).split('\r\n');
  assert.equal(csv[0], 'date,through,start,end,title,time_web,time_ap,venue,ages,live_arts,source,source_name,url');
  assert.ok(csv.some((l) => l.startsWith('2026-10-27,,10:30,11:00,Toddler Storytime & Songs,')));
  assert.ok(d.events.filter((e) => e.src === 'garage').every((e) => e.live));
  assert.ok(!d.events.find((e) => e.id === 'bcpl-101').live);
  const ics = toIcs(d);
  assert.match(ics, /DTSTART:20261027T143000Z/); // 10:30 AM EDT
  for (const line of ics.split('\r\n')) assert.ok(line.length <= 75, line);
});

test('the function answers every format, caches at the CDN and caches failures for less time', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const { default: events } = await import('../netlify/functions/events.mjs');
    const r = await events(new Request('https://h/api/events?from=2026-11-01&days=31'));
    assert.equal(r.status, 200);
    assert.match(r.headers.get('netlify-cdn-cache-control'), /s-maxage=600/);
    const j = await r.json();
    assert.equal(j.from, '2026-11-01');
    assert.ok(j.events.some((e) => e.src === 'arts'));
    for (const f of ['ics', 'csv', 'txt']) {
      const x = await events(new Request(`https://h/api/events?from=2026-11-01&days=7&format=${f}`));
      assert.match(x.headers.get('content-type'), f === 'ics' ? /text\/calendar/ : f === 'csv' ? /text\/csv/ : /text\/plain/);
    }
    const only = await (await events(new Request('https://h/api/events?from=2026-11-01&days=31&src=arts&aud=adults'))).json();
    assert.deepEqual(only.sources.map((s) => s.id), ['arts']);
  } finally { globalThis.fetch = realFetch; }
});

test('hand-entered listings follow the event rules', () => {
  for (const e of LISTINGS) {
    assert.match(e.url, /^https:\/\//, e.slug);
    assert.match(e.source, /^https:\/\//, e.slug);
    assert.match(e.checked, /^\d{4}-\d{2}-\d{2}$/, e.slug);
    assert.ok(SOURCES.some((s) => s.id === e.from), e.slug);
    if (e.times) assert.ok(e.times[0] < e.times[1], e.slug);
  }
  assert.ok(handEntered().every((x) => x.src && x.url));
});

test('/events/ and the printable listing are built, linked and credit every source', () => {
  const list = readFileSync(new URL('../dist/events/index.html', import.meta.url), 'utf8');
  const print = readFileSync(new URL('../dist/events/print/index.html', import.meta.url), 'utf8');
  for (const s of SOURCES) {
    assert.ok(list.includes(`href="${s.calendar}"`), `${s.id} calendar link`);
    assert.ok(print.includes(s.site), `${s.id} credit`);
  }
  assert.match(list, /noindex/);
  assert.match(list, /href="\/events\/print\/"/);
  assert.match(readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8'), /href="\/events\/"/);
});

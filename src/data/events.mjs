// Signature events, entered by hand. Only events with an official page we
// read ourselves; one plain line in our own words, never a copied
// description. Dates are local (Columbus, Indiana) and inclusive. `times`
// is [start, end] in minutes after midnight when the organizer lists them.
// Visit Columbus Indiana's calendar is linked, never imported: ask them for
// a feed before pulling anything from it.
// tests/events.test.mjs fails on a missing source and warns on stale events.

const CHECKED = '2026-10-25';

export const EVENTS = [
  { slug: 'mill-race-monster-2026', name: 'Mill Race Monster Festival', start: '2026-10-23', end: '2026-10-25',
    venue: 'Mill Race Park', ll: [39.204569, -85.926671], llSource: 'Wikipedia',
    line: 'A three-day festival in Mill Race Park built around the local monster legend.',
    url: 'https://www.millracemonsterfest.com/', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  { slug: 'battle-of-the-bands-2026', name: 'Battle of the Bands', start: '2026-11-20', end: '2026-11-20', times: [1110, 1260],
    venue: 'The Commons', ll: [39.20189, -85.92178], llSource: 'Wikipedia',
    line: 'Bands compete at The Commons, run by the Columbus Area Arts Council. Free, doors at 6 PM.',
    url: 'https://www.artsincolumbus.org/botb', source: 'https://www.artsincolumbus.org/botb', checked: CHECKED },
  { slug: '50-50-2026', name: '50/50, A Community Art Project', start: '2026-12-03', end: '2027-01-15',
    venue: '411 Gallery, 6th Street Arts Alley', ll: [39.20438, -85.92098], llSource: 'U.S. Census geocoder, 411 6th Street',
    line: 'A community art show at the Arts Council’s 411 Gallery. Opening reception December 3, 5 to 7 PM.',
    url: 'https://www.artsincolumbus.org/50-50', source: 'https://www.artsincolumbus.org/50-50', checked: CHECKED },
];

// For anything else, link out.
export const CALENDARS = [
  ['Visit Columbus Indiana events', 'https://visitcolumbusindiana.com/events/'],
  ['Columbus Area Arts Council calendar', 'https://www.artsincolumbus.org/calendar'],
];

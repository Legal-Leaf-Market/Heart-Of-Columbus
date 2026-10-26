// Signature events, entered by hand. Only events with an official page we
// read ourselves; one plain line in our own words, never a copied
// description. Dates are local (Columbus, Indiana) and inclusive. `times`
// is [start, end] in minutes after midnight when the organizer lists them.
// Visit Columbus Indiana's calendar is linked, never imported: ask them for
// a feed before pulling anything from it. `from` names the calendar in
// SOURCES where we found the event.
// tests/events.test.mjs fails on a missing source and warns on stale events.

const CHECKED = '2026-10-25';

export const EVENTS = [
  { slug: 'mill-race-monster-2026', name: 'Mill Race Monster Festival', start: '2026-10-23', end: '2026-10-25',
    venue: 'Mill Race Park', ll: [39.204569, -85.926671], llSource: 'Wikipedia',
    line: 'A three-day festival in Mill Race Park built around the local monster legend.',
    from: 'arts', url: 'https://www.millracemonsterfest.com/', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  { slug: 'battle-of-the-bands-2026', name: 'Battle of the Bands', start: '2026-11-20', end: '2026-11-20', times: [1110, 1260],
    venue: 'The Commons', ll: [39.20189, -85.92178], llSource: 'Wikipedia',
    line: 'Bands compete at The Commons, run by the Columbus Area Arts Council. Free, doors at 6 PM.',
    from: 'arts', url: 'https://www.artsincolumbus.org/botb', source: 'https://www.artsincolumbus.org/botb', checked: CHECKED },
  { slug: '50-50-2026', name: '50/50, A Community Art Project', start: '2026-12-03', end: '2027-01-15',
    venue: '411 Gallery, 6th Street Arts Alley', ll: [39.20438, -85.92098], llSource: 'U.S. Census geocoder, 411 6th Street',
    line: 'A community art show at the Arts Council’s 411 Gallery. Opening reception December 3, 5 to 7 PM.',
    from: 'arts', url: 'https://www.artsincolumbus.org/50-50', source: 'https://www.artsincolumbus.org/50-50', checked: CHECKED },
];

// Calendar-only entries: smaller dated happenings from a calendar that has
// no feed, shown on /events/ and in the print listing but not on the map or
// the home page. Same rules as EVENTS, without the map point.
export const LISTINGS = [
  { slug: 'wheel-throwing-2026-11-07', name: 'One-Night Wheel Throwing with Ben Eckert', start: '2026-11-07', end: '2026-11-07', times: [1020, 1140],
    venue: 'Studio C', from: 'arts', url: 'https://www.artsincolumbus.org/studio-c', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  { slug: 'wheel-throwing-2026-11-16', name: 'One-Night Wheel Throwing with Jaye Lahee and Abigail Moses', start: '2026-11-16', end: '2026-11-16', times: [1080, 1200],
    venue: 'Studio C', from: 'arts', url: 'https://www.artsincolumbus.org/studio-c', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  { slug: 'wheel-throwing-2026-11-28-a', name: 'One-Night Wheel Throwing with Ben Eckert', start: '2026-11-28', end: '2026-11-28', times: [840, 960],
    venue: 'Studio C', from: 'arts', url: 'https://www.artsincolumbus.org/studio-c', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  { slug: 'wheel-throwing-2026-11-28-b', name: 'One-Night Wheel Throwing with Ben Eckert', start: '2026-11-28', end: '2026-11-28', times: [1020, 1140],
    venue: 'Studio C', from: 'arts', url: 'https://www.artsincolumbus.org/studio-c', source: 'https://www.artsincolumbus.org/calendar', checked: CHECKED },
  // The county fair, from the fair's own home page. `feature` puts it at the
  // top of /events/ whenever it is the next fair, however far off.
  { slug: 'county-fair-2027', name: 'Bartholomew County 4-H Fair', start: '2027-06-25', end: '2027-07-03', feature: true,
    venue: 'Bartholomew County 4-H Fairgrounds', from: 'fair', url: 'https://bartholomewcountyfair.com/', source: 'https://bartholomewcountyfair.com/', checked: CHECKED },
  { slug: 'county-fair-2028', name: 'Bartholomew County 4-H Fair', start: '2028-06-23', end: '2028-07-01', feature: true,
    venue: 'Bartholomew County 4-H Fairgrounds', from: 'fair', url: 'https://bartholomewcountyfair.com/', source: 'https://bartholomewcountyfair.com/', checked: CHECKED },
  // Live music and arts at The Garage Pub & Grill, from the events page on
  // its own site (no feed). Our wording; only the music and dance nights.
  { slug: 'garage-2026-10-29', name: 'Halloween line dancing with Matty O Entertainment', start: '2026-10-29', end: '2026-10-29', times: [1140, 1350], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { slug: 'garage-2026-10-30', name: 'The Tribute Band, live', start: '2026-10-30', end: '2026-10-30', times: [1200, 1380], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { slug: 'garage-2026-10-31', name: 'Halloween costume party with DJ Kapalez', start: '2026-10-31', end: '2026-10-31', times: [1260, 1560], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { slug: 'garage-2026-11-05', name: 'Line dancing', start: '2026-11-05', end: '2026-11-05', times: [1140, 1350], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { slug: 'garage-2026-11-06', name: 'The Cosmic Situation, live', start: '2026-11-06', end: '2026-11-06', times: [1200, 1380], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { slug: 'garage-2026-11-07', name: 'Hi-Rise, live', start: '2026-11-07', end: '2026-11-07', times: [1200, 1380], live: true,
    venue: 'The Garage Pub & Grill', from: 'garage', url: 'https://thegaragepubandgrill.com/events', source: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
];

// Places with live music and arts nights that post their lineups somewhere
// we can't read as a feed (mostly Facebook). Shown on /events/ as places to
// check, never with dates we have not seen on their own page.
export const STAGES = [
  { name: 'The Garage Pub & Grill', listing: 'the-garage-pub-and-grill', where: '308 4th Street, Downtown',
    what: 'Live bands on Friday and Saturday nights, plus line dancing and DJ nights, on its events page.', url: 'https://thegaragepubandgrill.com/events', checked: '2026-10-26' },
  { name: 'Ziggies Bar & Grill', listing: 'ziggies-bar-and-grill', where: '3029 N National Road',
    what: 'Songkick lists past concerts there, but we have not found a current public schedule. Call ahead.', url: 'https://www.songkick.com/venues/1258761-ziggies', checked: '2026-10-26' },
  { name: 'Cozy Lounge', listing: 'cozy-lounge', where: '3870 E 25th Street',
    what: 'Its Facebook page is the place to look. We have not verified a schedule.', url: 'https://m.facebook.com/Cozy-Lounge-149100758482621/', checked: '2026-10-26' },
  { name: 'Open Mic Music, Columbus Area Arts Council', listing: 'columbus-bar', where: 'Columbus Bar, Family Side, 322 4th Street',
    what: 'Select Saturdays, featured musician at 8 PM, ages 14 and up. Next date to be announced.', url: 'https://www.artsincolumbus.org/open-mic-music', checked: '2026-10-26' },
];

// The calendars /events/ is built from. `feed` is read live by
// /api/events (netlify/functions/events.mjs) and cached for an hour; a
// source with no feed is entered by hand above, from `calendar`.
// Library: the JSON its own Communico calendar page loads.
// Parks: the iCalendar feed of the Tockify calendar on its events page.
export const SOURCES = [
  { id: 'bcpl', name: 'Bartholomew County Public Library', short: 'Library', site: 'mybcpl.org',
    calendar: 'https://mybcpl.libnet.info/events', feed: { type: 'communico', url: 'https://mybcpl.libnet.info/eeventcaldata' } },
  { id: 'parks', name: 'Columbus Parks and Recreation', short: 'Parks', site: 'columbusparksandrec.com',
    calendar: 'https://columbusparksandrec.com/events/', feed: { type: 'ics', url: 'https://tockify.com/api/feeds/ics/columbusparksandrec' } },
  { id: 'fair', name: 'Bartholomew County 4-H Fair', short: 'Fairgrounds', site: 'bartholomewcountyfair.com',
    calendar: 'https://bartholomewcountyfair.com/fair-info/schedule/', feed: null, checked: CHECKED,
    about: 'The fairgrounds also host livestock shows and auctions, the Scottish Festival, public camping and building rentals through the year.' },
  { id: 'garage', name: 'The Garage Pub & Grill', short: 'The Garage', site: 'thegaragepubandgrill.com',
    calendar: 'https://thegaragepubandgrill.com/events', feed: null, checked: '2026-10-26' },
  { id: 'arts', name: 'Columbus Area Arts Council', short: 'Arts Council', site: 'artsincolumbus.org',
    calendar: 'https://www.artsincolumbus.org/calendar', feed: null, checked: CHECKED },
];

// For anything else, link out.
export const CALENDARS = [
  ['Visit Columbus Indiana events', 'https://visitcolumbusindiana.com/events/'],
  ['Columbus Area Arts Council calendar', 'https://www.artsincolumbus.org/calendar'],
];

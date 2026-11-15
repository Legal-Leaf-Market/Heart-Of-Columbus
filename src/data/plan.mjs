// "Plan an event" (/plan/): the local businesses that make a wedding, a
// corporate event or a private party, sorted into the jobs a planner has to
// fill. Nothing here is a claim that a business does weddings or parties: each
// one is placed by what its listing says it is (its type, from the Chamber,
// Google or its own page), the same words every card shows. Roles are rules
// over the directory, so new listings land in the right place by themselves.
//
// Order inside a role: Founding Members first (they pay us, the card says so,
// as on every category page), then businesses you can order, book or shop
// with online, then everyone else by name. Search never reads membership.
import { directory, inSection } from './directory.mjs';

// A type that is only a section label ("Coffee, Bakeries & Sweets") says nothing
// about what the business makes, so those rules read the name alone.
const GENERIC = new Set(['Coffee, Bakeries & Sweets', 'Flowers, home & garden', 'Marketing, print & photo']);
const text = (b) => `${b.name} ${GENERIC.has(b.type) ? '' : b.type}`;
const has = (re) => (b) => re.test(text(b));
const inCat = (cat, sub) => (b) => inSection(b, cat, sub);
const and = (...fs) => (b) => fs.every((f) => f(b));
const or = (...fs) => (b) => fs.some((f) => f(b));
const not = (f) => (b) => !f(b);

// One rule per job. `see` is where the full list lives.
export const ROLES = {
  venues: {
    label: 'Venues', emoji: '🏛️', see: '/c/events/',
    blurb: 'Event spaces, lofts and barns. Ask about capacity, catering rules and setup times.',
    match: and(inCat('events'), has(/\bvenues?\b|event (space|loft)|planning/i)),
  },
  partySpaces: {
    label: 'Party spaces', emoji: '🎈', see: '/c/events/',
    blurb: 'Rooms to rent for the party, plus play spaces that host kids’ parties.',
    match: or(and(inCat('events'), has(/\bvenues?\b|event (space|loft)/i)), has(/party (&|and) play|bounce/i)),
  },
  flowers: {
    label: 'Flowers', emoji: '💐', see: '/c/shopping/home-garden/',
    blurb: 'Florists for bouquets, centerpieces, ceremony pieces and arrangements for the office.',
    match: and(inCat('shopping', 'home-garden'), has(/florist|flowers/i)),
  },
  balloons: {
    label: 'Balloons and decor', emoji: '🎈', see: '/c/events/',
    blurb: 'Arches, garlands, columns and installs. Bring your colors or your brand guide.',
    match: has(/balloon/i),
  },
  cakes: {
    label: 'Cakes and desserts', emoji: '🎂', see: '/c/coffee-sweets/',
    blurb: 'Custom cakes, bakeries and cookies for the dessert table and the favors.',
    match: and(inCat('coffee-sweets'), has(/bak(e|es|ery)|cake|cookie|treats|panader/i)),
  },
  treats: {
    label: 'Cakes, cookies and treats', emoji: '🍪', see: '/c/coffee-sweets/',
    blurb: 'Custom cakes, cookies, bakeries and popcorn for the party or the break room.',
    match: and(inCat('coffee-sweets'), has(/bak(e|es|ery)|cake|cookie|treats|panader|popcorn/i)),
  },
  catering: {
    label: 'Food and catering', emoji: '🍽️', see: '/c/restaurants/bbq-trucks/',
    blurb: 'Caterers, barbecue and food trucks. Ask about headcount, service style and travel.',
    match: inCat('restaurants', 'bbq-trucks'),
  },
  music: {
    label: 'DJs and music', emoji: '🎧', see: '/djs/',
    blurb: 'DJs, MCs and live sets. Ask about sound for speeches and the room size.',
    match: and(inCat('events'), has(/\bD\.?J\b|entertainment|acoustic|music/i)),
  },
  entertainment: {
    label: 'DJs and entertainers', emoji: '🎉', see: '/djs/',
    blurb: 'DJs for the dance floor and entertainers for the kids.',
    match: or(and(inCat('events'), has(/\bD\.?J\b|entertainment|acoustic|music/i)), has(/kids (magic|entertainment)/i)),
  },
  photo: {
    label: 'Photos and photo booths', emoji: '📸', see: '/c/pros/creative/',
    blurb: 'Photographers and photo booth rentals.',
    match: and(inCat('pros', 'creative'), has(/photograph|photo booth|photography studio/i)),
  },
  booths: {
    label: 'Photo booths', emoji: '📸', see: '/c/pros/creative/',
    blurb: 'Photo booth and 360 booth rentals for the party.',
    match: has(/photo booth|360 video booth/i),
  },
  beauty: {
    label: 'Hair, makeup and nails', emoji: '💄', see: '/c/beauty/',
    blurb: 'Salons and nail studios for the wedding party. Book early for a group.',
    match: and(or(inCat('beauty', 'salons'), inCat('beauty', 'nails')), not(has(/school/i))),
  },
  attire: {
    label: 'Attire and rings', emoji: '💍', see: '/c/shopping/boutiques/',
    blurb: 'Bridal shops, tuxedos and jewelers.',
    match: and(inCat('shopping'), has(/bridal|tux|jewel/i)),
  },
  signs: {
    label: 'Signs and print', emoji: '🪧', see: '/c/pros/creative/',
    blurb: 'Banners, signs, programs and name badges, printed in town.',
    match: and(inCat('pros', 'creative'), has(/\bsigns?\b|signz|printer|printing/i), not(has(/apparel/i))),
  },
  swag: {
    label: 'Shirts and swag', emoji: '👕', see: '/c/pros/creative/',
    blurb: 'Custom shirts and printed apparel for the team or the guests.',
    match: has(/custom shirts|apparel printing|custom apparel/i),
  },
  rentals: {
    label: 'Rentals and rides', emoji: '⛺', see: '/c/events/',
    blurb: 'Tables, tents, party equipment and a limo for the big exit.',
    match: and(inCat('events'), has(/rental|limousine/i)),
  },
};

export const TRACKS = [
  {
    slug: 'weddings', emoji: '💍', label: 'Weddings', color: '#d6336c', tint: '#ffe3ec',
    kicker: 'Plan a wedding',
    title: 'Your wedding team,', hl: 'all from Columbus.',
    lede: 'Venue, flowers, balloons, cake, music, photos and the people who get everyone ready. Pick a favorite in each, then contact them yourself.',
    roles: ['venues', 'flowers', 'balloons', 'cakes', 'catering', 'music', 'photo', 'beauty', 'attire', 'rentals'],
  },
  {
    slug: 'corporate', emoji: '🏢', label: 'Corporate events', color: '#2f4d8c', tint: '#e3ecf8',
    kicker: 'Plan a corporate event',
    title: 'Company events,', hl: 'sourced locally.',
    lede: 'Open houses, launches, conferences and the holiday party. Venues, catering, brand-color decor, sound, signs and swag from Columbus businesses.',
    roles: ['venues', 'catering', 'balloons', 'flowers', 'treats', 'music', 'photo', 'signs', 'swag', 'rentals'],
  },
  {
    slug: 'parties', emoji: '🎉', label: 'Private parties', color: '#e8590c', tint: '#ffe8cc',
    kicker: 'Plan a party',
    title: 'Throw the party,', hl: 'keep it local.',
    lede: 'Birthdays, showers, graduations and the backyard bash. Balloons, treats, a place to hold it, rentals, entertainment and food.',
    roles: ['balloons', 'treats', 'partySpaces', 'rentals', 'entertainment', 'catering', 'flowers', 'booths'],
  },
];

const direct = (b) => b.order.length || b.book.length || b.feed || b.store;
export const vendorsFor = (role) => {
  const rows = directory.filter(ROLES[role].match);
  const rank = (b) => (b.member ? 0 : direct(b) ? 1 : 2);
  return rows.map((b, i) => [rank(b), i, b]).sort((p, q) => p[0] - q[0] || p[1] - q[1]).map(([, , b]) => b);
};
export const isDirect = (b) => !!direct(b);

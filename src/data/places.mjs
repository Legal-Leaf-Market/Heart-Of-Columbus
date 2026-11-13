// One shared place record (contract v1) for everything on the map: every
// listed business and every landmark, in one shape that the list, the map,
// trails, the passport and a future 3D view can all read. It is an adapter
// over directory.mjs and landmarks.mjs, never a second copy to edit.
//
// What the record promises:
// - id: stable. "b:<slug>" or "l:<slug>". The slug is the public page address
//   (/b/<slug>/, /l/<slug>/) and never changes because a record moved.
// - location: where we think it is, and how we know. geo is one of
//     'google'   pin from the business's own Google Maps listing
//     'listing'  pin from the public directory listing it came from
//     'census'   landmark pin from the U.S. Census geocoder
//     'wikipedia' landmark pin from the place's Wikipedia article
//     'approx'   placed by hand to about a block; shown as approximate
//     'none'     no pin. Still searchable and listed, just not on the map.
// - relation: what the place is to us. 'listed' unless it is in partners.mjs
//   (signed on in writing) or members.mjs (pays). Being listed is never a
//   partnership, and a test holds that line.
// - group: the shared name for one business with several locations. Each
//   location keeps its own id and page; GROUPS below names them by hand.
// - appearances: dated pop-ups at a venue (a stand at a market, a truck at a
//   brewery). Empty until an owner sends one; a pop-up is never an edit to
//   the business's own address. Shape is validated so the first one is right.
import { directory, catBySlug } from './directory.mjs';
import { LANDMARKS } from './landmarks.mjs';
import { PARTNERS } from './partners.mjs';
import { MEMBERS } from './members.mjs';

export const PLACE_CONTRACT = 1;
export const GEO_KINDS = ['google', 'listing', 'census', 'wikipedia', 'approx', 'none'];
export const RELATIONS = ['listed', 'partner', 'member'];

// Bartholomew County and a margin: a pin outside this is a bad pin.
export const BOUNDS = { south: 39.0, north: 39.4, west: -86.15, east: -85.65 };

// One business, several locations, by hand. Each slug keeps its own page.
export const GROUPS = {
  'winnie-tea-bar': { name: 'Winnie Tea Bar', slugs: ['winnie-tea-bar-at-nexuspark', 'winnie-tea-bar-at-the-commons'] },
};

// Dated appearances by slug, entered only from what an owner sends:
//   'some-slug': [{ venue: 'Place name', address: '...', ll: [lat, lng] | null,
//     start: '2026-12-05T10:00:00-05:00', end: '2026-12-05T14:00:00-05:00',
//     tz: 'America/Indiana/Indianapolis', source: 'owner, by email', checked: '2026-12-01' }]
export const APPEARANCES = {};

const groupOf = Object.fromEntries(Object.entries(GROUPS).flatMap(([g, x]) => x.slugs.map((s) => [s, g])));

const relationOf = (slug) => (Object.hasOwn(PARTNERS, slug) ? 'partner' : Object.hasOwn(MEMBERS, slug) ? 'member' : 'listed');

export const placeFromBusiness = (b) => ({
  contract: PLACE_CONTRACT,
  id: `b:${b.slug}`,
  kind: 'business',
  slug: b.slug,
  name: b.name,
  href: `/b/${b.slug}/`,
  category: b.cat,
  type: b.type,
  location: { address: b.address || null, area: b.area || null, ll: b.ll || null, geo: b.ll ? b.pin || 'listing' : 'none' },
  relation: relationOf(b.slug),
  group: groupOf[b.slug] || null,
  status: b.tempClosed ? 'temporarily-closed' : b.added?.soon ? 'coming-soon' : 'open',
  appearances: APPEARANCES[b.slug] || [],
});

export const placeFromLandmark = (l) => ({
  contract: PLACE_CONTRACT,
  id: `l:${l.slug}`,
  kind: 'landmark',
  slug: l.slug,
  name: l.name,
  href: `/l/${l.slug}/`,
  category: 'landmark',
  type: l.architect ? `${l.architect}, ${l.year}` : 'Landmark',
  location: { address: l.address || null, area: null, ll: l.ll || null, geo: !l.ll ? 'none' : /census/i.test(l.llSource || '') ? 'census' : /wikipedia/i.test(l.llSource || '') ? 'wikipedia' : 'listing' },
  relation: 'listed',
  group: null,
  status: 'open',
  appearances: [],
});

const inBounds = ([lat, lng]) => lat > BOUNDS.south && lat < BOUNDS.north && lng > BOUNDS.west && lng < BOUNDS.east;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/;

// Every problem with one record, as plain sentences. Empty means valid.
export function placeProblems(p) {
  const out = [];
  const say = (m) => out.push(`${p?.id || '?'}: ${m}`);
  if (!p || typeof p !== 'object') return ['?: not a record'];
  if (p.contract !== PLACE_CONTRACT) say('wrong contract version');
  if (!/^[bl]:[a-z0-9][a-z0-9-]*$/.test(p.id || '')) say('bad id');
  if (p.id && p.slug && p.id.slice(2) !== p.slug) say('id and slug disagree');
  if (!['business', 'landmark'].includes(p.kind)) say('unknown kind');
  if (p.href !== `/${p.kind === 'landmark' ? 'l' : 'b'}/${p.slug}/`) say('href is not the public page');
  if (!p.name || !String(p.name).trim()) say('no name');
  const loc = p.location || {};
  if (!GEO_KINDS.includes(loc.geo)) say('unknown geo kind');
  if (loc.ll) {
    if (!Array.isArray(loc.ll) || loc.ll.length !== 2 || !loc.ll.every(Number.isFinite)) say('pin is not [lat, lng]');
    else if (!inBounds(loc.ll)) say('pin is outside Bartholomew County');
    if (loc.geo === 'none') say('has a pin but says none');
  } else if (loc.geo !== 'none') say('no pin but claims one');
  if (!RELATIONS.includes(p.relation)) say('unknown relation');
  if (p.relation === 'partner' && !Object.hasOwn(PARTNERS, p.slug)) say('partner without a signed entry in partners.mjs');
  if (p.relation === 'member' && !Object.hasOwn(MEMBERS, p.slug)) say('member without an entry in members.mjs');
  if (p.group && !GROUPS[p.group]?.slugs.includes(p.slug)) say('group does not list this place');
  for (const a of p.appearances || []) {
    if (!a.venue || !a.source || !a.checked) say('appearance needs venue, source and checked');
    if (!ISO.test(a.start || '') || !ISO.test(a.end || '')) say('appearance times need a date, time and offset');
    else if (Date.parse(a.end) <= Date.parse(a.start)) say('appearance ends before it starts');
    if (!a.tz) say('appearance needs a time zone');
    if (a.ll && !inBounds(a.ll)) say('appearance pin is outside Bartholomew County');
  }
  return out;
}

export const PLACES = [...directory.map(placeFromBusiness), ...LANDMARKS.map(placeFromLandmark)];
export const placeById = Object.fromEntries(PLACES.map((p) => [p.id, p]));
export const categoryLabel = (p) => (p.kind === 'landmark' ? 'Landmark' : catBySlug[p.category]?.label || '');

// One sentence on where a pin comes from, for pages and popups.
export const PIN_NOTE = {
  google: 'Map pin from its Google Maps listing.',
  listing: 'Map pin from the public listing.',
  census: 'Map pin from the U.S. Census geocoder on its street address.',
  wikipedia: 'Map pin from its Wikipedia article.',
  approx: 'Map pin is approximate, placed by hand to about a block.',
  none: 'Not on our map yet: the public listings we used had no map pin. It is still in search and every list.',
};

// Trails (/trails/<slug>/): a route through places already on this site,
// with a stamp card kept only in the visitor's browser. A trail is a rule
// over the directory or the landmarks, never a hand-picked list, so it
// follows the data. No business has joined a trail program: the pages say
// "a route through places on our list", there are no prizes, and nothing
// is sent anywhere. Partner check-ins (QR at the counter) wait until a
// business is in src/data/partners.mjs and agrees in writing.
import { directory, km } from './directory.mjs';
import { LANDMARKS, landmarkBySlug } from './landmarks.mjs';

// A type that is really a category label says nothing about what is served.
const GENERIC = /^(Coffee, Bakeries & Sweets|Bars, Breweries & Wine)$/;
const said = (b) => b.name + ' ' + (GENERIC.test(b.type) ? '' : b.type);

export const TRAILS = [
  {
    slug: 'tacos', title: 'The taco trail', kicker: 'Restaurants',
    line: 'The Mexican kitchens on our list, in an order that keeps the driving short.',
    rule: 'Restaurants on this site whose listing says Mexican or tacos.',
    all: '/c/restaurants/mexican/',
    pick: (b) => b.sub === 'mexican' && /mexican|taco|taquer/i.test(said(b)),
  },
  {
    slug: 'coffee', title: 'The coffee trail', kicker: 'Coffee',
    line: 'Roasters, cafes and a cat cafe, from downtown out.',
    rule: 'Places in Coffee & sweets whose name or listing says coffee or cafe.',
    all: '/c/coffee-sweets/',
    pick: (b) => b.cat === 'coffee-sweets' && /coffee|caf[eé]|roast/i.test(said(b)),
  },
  {
    slug: 'pints', title: 'Pints and pours', kicker: 'Breweries, wine and spirits',
    line: 'The places that make what they pour: breweries, a winery and a distillery.',
    rule: 'Bars on this site whose listing says brewery, brewpub, winery, distillery or tap room.',
    all: '/c/bars/',
    pick: (b) => b.cat === 'bars' && /brew|winery|distill|tap room/i.test(said(b)),
  },
  {
    slug: 'architecture', title: 'The architecture walk', kicker: 'Landmarks',
    line: 'The landmarks you can see from the street, in walking order from Courthouse Square.',
    rule: 'Landmarks on this site that can be seen from a public street.',
    all: '/architecture/',
    landmarks: true,
    pick: (l) => l.street,
  },
];

// Nearest neighbor from the stop closest to the courthouse; places with no
// map pin go last. Good enough for a handful of stops, and the same every build.
const START = landmarkBySlug.courthouse.ll;
function route(items) {
  const left = items.filter((x) => x.ll), out = [];
  let at = START;
  while (left.length) {
    let best = 0;
    left.forEach((x, i) => { if (km(at, x.ll) < km(at, left[best].ll)) best = i; });
    const [x] = left.splice(best, 1);
    out.push(x);
    at = x.ll;
  }
  return out.concat(items.filter((x) => !x.ll));
}

// The stops of a trail, as one shape for businesses and landmarks.
export function trailStops(trail) {
  const items = trail.landmarks
    ? LANDMARKS.filter(trail.pick).map((l) => ({ id: 'l:' + l.slug, kind: 'landmark', name: l.name, href: `/l/${l.slug}/`, address: l.address, ll: l.ll, l }))
    : directory.filter((b) => !b.tempClosed && trail.pick(b)).map((b) => ({ id: b.slug, kind: 'business', name: b.name, href: `/b/${b.slug}/`, address: b.address, ll: b.ll, b }));
  return route(items);
}

export const trailBySlug = Object.fromEntries(TRAILS.map((x) => [x.slug, x]));

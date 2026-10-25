// One list of every business on the site, in the shape the pages use.
// Merges the hand-built cards (businesses.mjs) with the wider landscape
// (landscape.mjs) and files each one under the browse taxonomy below.
//
// The taxonomy is ours (how people shop, Yelp / DoorDash style); the facts on
// each business still come only from the source files.

import { businesses } from './businesses.mjs';
import { landscape } from './landscape.mjs';
import { WEB } from './web.mjs';
import { COMMERCE } from './commerce.mjs';
import { HOURS } from './hours.mjs';
import { GEO } from './geo.mjs';

// Top-level categories, in display order. `subs` map to the landscape's
// vertical/filter pairs. Emoji are the fallback icon until /art/ assets land.
export const CATEGORIES = [
  { slug: 'restaurants', label: 'Restaurants', emoji: '🍽️', color: '#c8232c', tint: '#fde7e4',
    blurb: 'Taquerias, diners, pizza, pho and everything in between.',
    subs: [
      { slug: 'mexican', label: 'Mexican & Latin', emoji: '🌮', from: ['eat', 'mexican'] },
      { slug: 'diners', label: 'Diners & Grills', emoji: '🍳', from: ['eat', 'sandwiches'] },
      { slug: 'pizza', label: 'Pizza & Italian', emoji: '🍕', from: ['eat', 'pizza'] },
      { slug: 'asian', label: 'Asian & Indian', emoji: '🍜', from: ['eat', 'asian'] },
      { slug: 'bbq-trucks', label: 'BBQ, Trucks & Catering', emoji: '🚚', from: ['eat', 'trucks'] },
    ] },
  { slug: 'coffee-sweets', label: 'Coffee & Sweets', emoji: '☕', color: '#8a4b2a', tint: '#f7ebe1',
    blurb: 'Roasters, bakeries, donuts, boba and the ice cream counter.',
    subs: [{ slug: 'coffee-sweets', label: 'Coffee, Bakeries & Treats', emoji: '🍩', from: ['eat', 'coffee'] }] },
  { slug: 'bars', label: 'Bars & Breweries', emoji: '🍺', color: '#b86b00', tint: '#fdf0d6',
    blurb: 'Taprooms, pubs, a distillery and a winery.',
    subs: [{ slug: 'bars', label: 'Bars, Breweries & Wine', emoji: '🍻', from: ['eat', 'bars'] }] },
  { slug: 'beauty', label: 'Beauty & Grooming', emoji: '💈', color: '#1e2a4a', tint: '#e5e9f4',
    blurb: 'Barbers, stylists, nails, spa days and fresh ink.',
    subs: [
      { slug: 'barbers', label: 'Barbershops', emoji: '💈', from: ['service', 'barbershops'] },
      { slug: 'salons', label: 'Hair Salons', emoji: '💇', from: ['service', 'salons'] },
      { slug: 'nails', label: 'Nail Salons', emoji: '💅', from: ['service', 'nails'] },
      { slug: 'spa', label: 'Spa, Skin & Massage', emoji: '🧖', from: ['service', 'personal-care'] },
      { slug: 'tattoo', label: 'Tattoo & Piercing', emoji: '🖋️', from: ['service', 'tattoo'] },
    ] },
  { slug: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#ff2e88', tint: '#ffe3f0',
    blurb: 'Boutiques, bookshops, antiques, markets and hobby shops.',
    subs: [
      { slug: 'boutiques', label: 'Boutiques & Bridal', emoji: '👗', from: ['shop', 'boutiques'] },
      { slug: 'gifts', label: 'Gifts, Books & Art', emoji: '📚', from: ['shop', 'gifts'] },
      { slug: 'antiques', label: 'Antiques & Thrift', emoji: '🪑', from: ['shop', 'antiques'] },
      { slug: 'home-garden', label: 'Flowers, Home & Garden', emoji: '💐', from: ['shop', 'home'] },
      { slug: 'markets', label: 'Markets & Specialty Food', emoji: '🧺', from: ['shop', 'market'] },
      { slug: 'hobbies', label: 'Sports, Games & Hobbies', emoji: '🎲', from: ['shop', 'outdoors'] },
      { slug: 'smoke', label: 'Smoke & Vape', emoji: '💨', from: ['shop', 'smoke'] },
    ] },
  { slug: 'health', label: 'Health & Wellness', emoji: '🩺', color: '#0f7b6c', tint: '#dff4ef',
    blurb: 'Dentists, chiropractors, eye care, counselors and clinics.',
    subs: [
      { slug: 'dental', label: 'Dentists', emoji: '🦷', from: ['health', 'dental'] },
      { slug: 'chiro', label: 'Chiropractic & Therapy', emoji: '🦴', from: ['health', 'chiro'] },
      { slug: 'eye-ear', label: 'Eye & Hearing', emoji: '👓', from: ['health', 'eye'] },
      { slug: 'counseling', label: 'Counseling', emoji: '🧠', from: ['health', 'counseling'] },
      { slug: 'clinics', label: 'Clinics & Care', emoji: '🏥', from: ['health', 'medical'] },
    ] },
  { slug: 'fitness', label: 'Fitness', emoji: '🏋️', color: '#2f6b3b', tint: '#e2f1e4',
    blurb: 'Gyms, martial arts, gymnastics, pilates and yoga.',
    subs: [{ slug: 'fitness', label: 'Gyms, Studios & Martial Arts', emoji: '🥋', from: ['health', 'fitness'] }] },
  { slug: 'pets', label: 'Pets', emoji: '🐾', color: '#7a4fd6', tint: '#ede6fb',
    blurb: 'Vets, groomers, boarding and dog training.',
    subs: [{ slug: 'pets', label: 'Vets, Groomers & Boarding', emoji: '🐶', from: ['service', 'pets'] }] },
  { slug: 'home-services', label: 'Home Services', emoji: '🛠️', color: '#e8590c', tint: '#ffe8d9',
    blurb: 'Plumbers, electricians, roofers, lawn crews and handymen.',
    subs: [
      { slug: 'hvac-plumbing', label: 'HVAC & Plumbing', emoji: '🔧', from: ['home', 'hvac'] },
      { slug: 'electric', label: 'Electricians', emoji: '⚡', from: ['home', 'electric'] },
      { slug: 'contractors', label: 'Contractors & Remodeling', emoji: '🏗️', from: ['home', 'roofing'] },
      { slug: 'lawn', label: 'Lawn, Landscape & Tree', emoji: '🌳', from: ['home', 'landscape'] },
      { slug: 'home-help', label: 'Cleaning, Storage & More', emoji: '🧹', from: ['home', 'supply'] },
      { slug: 'laundry', label: 'Cleaners & Laundry', emoji: '🧺', from: ['service', 'laundry'] },
    ] },
  { slug: 'auto', label: 'Auto', emoji: '🚗', color: '#36454f', tint: '#e6eaed',
    blurb: 'Mechanics, tires, body shops, detailers and used lots.',
    subs: [
      { slug: 'auto-repair', label: 'Auto Repair', emoji: '🔩', from: ['auto', 'repair'] },
      { slug: 'tires-body', label: 'Tires, Body & Glass', emoji: '🛞', from: ['auto', 'tires'] },
      { slug: 'used-cars', label: 'Used Cars & Powersports', emoji: '🏍️', from: ['auto', 'dealers'] },
      { slug: 'detail-tow', label: 'Detailing, Tint & Towing', emoji: '🧽', from: ['auto', 'detail'] },
    ] },
  { slug: 'pros', label: 'Professional Services', emoji: '💼', color: '#3b5bdb', tint: '#e5ebff',
    blurb: 'Lawyers, accountants, agents, designers and IT.',
    subs: [
      { slug: 'legal', label: 'Lawyers', emoji: '⚖️', from: ['pro', 'legal'] },
      { slug: 'accounting', label: 'Accounting & Tax', emoji: '🧾', from: ['pro', 'accounting'] },
      { slug: 'insurance', label: 'Insurance', emoji: '🛡️', from: ['pro', 'insurance'] },
      { slug: 'real-estate', label: 'Real Estate & Title', emoji: '🏡', from: ['pro', 'realestate'] },
      { slug: 'finance', label: 'Finance & Wealth', emoji: '📈', from: ['pro', 'finance'] },
      { slug: 'creative', label: 'Marketing, Print & Photo', emoji: '📸', from: ['pro', 'creative'] },
      { slug: 'tech', label: 'Tech & IT', emoji: '💻', from: ['pro', 'tech'] },
      { slug: 'business', label: 'Consulting & Business', emoji: '🤝', from: ['pro', 'staffing'] },
    ] },
  { slug: 'events', label: 'Events & Weddings', emoji: '💍', color: '#d6336c', tint: '#ffe3ec',
    blurb: 'Venues, DJs, rentals, planners and the people behind the big day.',
    subs: [{ slug: 'events', label: 'Venues, DJs & Rentals', emoji: '🎉', from: ['fun', 'venues'] }] },
  { slug: 'kids', label: 'Kids & Learning', emoji: '🎨', color: '#f08c00', tint: '#fff1d6',
    blurb: 'Childcare, preschools, dance, music and tutoring.',
    subs: [
      { slug: 'childcare', label: 'Childcare & Schools', emoji: '🧸', from: ['fun', 'kids'] },
      { slug: 'lessons', label: 'Dance & Music Lessons', emoji: '🎵', from: ['fun', 'lessons'] },
    ] },
  { slug: 'things-to-do', label: 'Things to Do', emoji: '🎳', color: '#0b7285', tint: '#dcf3f6',
    blurb: 'Bowling, golf, an indie cinema, hockey and a night away.',
    subs: [{ slug: 'things-to-do', label: 'Entertainment, Golf & Stays', emoji: '⛳', from: ['fun', 'entertainment'] }] },
  { slug: 'makers', label: 'Makers & Industry', emoji: '🏭', color: '#5c5f66', tint: '#ebecee',
    blurb: 'Machine shops, builders, engineers and suppliers.',
    subs: [
      { slug: 'machining', label: 'Machining & Fabrication', emoji: '⚙️', from: ['makers', 'machining'] },
      { slug: 'construction', label: 'Construction & Engineering', emoji: '📐', from: ['makers', 'construction'] },
      { slug: 'logistics', label: 'Logistics & Supply', emoji: '📦', from: ['makers', 'logistics'] },
    ] },
];

// Neighborhood tags come from street addresses (see landscape.mjs).
export const AREAS = [
  { slug: 'downtown', label: 'Downtown', blurb: 'Washington Street, the Commons and the blocks around the courthouse.', photo: 'commons' },
  { slug: '25th-street', label: '25th Street', blurb: 'The east-west strip from Central Avenue out past NexusPark.', photo: 'aerial' },
  { slug: 'national-road', label: 'National Road', blurb: 'US 31 on the north and east side: shops, auto row and plazas.', photo: 'firestation' },
  { slug: 'west-hill', label: 'West Hill', blurb: 'Across the river on Jonathan Moore Pike and Merchant Mile.', photo: 'bridge' },
  { slug: 'central-avenue', label: 'Central Avenue', blurb: 'A long run of shops, salons and services north of downtown.', photo: 'irwin' },
  { slug: 'east-columbus', label: 'East Columbus', blurb: 'State Street, Mapleton and the garages around Center Street.', photo: 'cityhall' },
  { slug: 'columbus-central', label: 'Columbus Central', blurb: 'Cottage Avenue, 17th Street and the neighborhoods in between.', photo: 'firstchristian' },
  { slug: 'northside', label: 'Northside', blurb: 'Middle Road, Doctors Park, Fox Pointe and the Marr Road corridor.', photo: 'northchristian' },
  { slug: 'north-washington', label: 'North Washington', blurb: 'Washington Street north of downtown toward Tipton Lakes.', photo: 'miller' },
  { slug: 'business-parks', label: 'Business Parks & Airport', blurb: 'Industrial parks, the airport and Progress Drive.', photo: 'library' },
];
const AREA_BY_LABEL = Object.fromEntries(AREAS.map((a) => [a.label === 'Business Parks & Airport' ? 'Business parks & airport' : a.label, a.slug]));

const slugify = (s) =>
  s.toLowerCase().replace(/[’']/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

const SUB_BY_PAIR = {};
for (const c of CATEGORIES) for (const s of c.subs) SUB_BY_PAIR[s.from.join('/')] = { cat: c, sub: s };

// Map pins for the hand-built cards, from the same Google Maps sweep.
const FEATURED_LL = {
  'jills-diner': [39.23, -85.899], tacolumbus: [39.216, -85.883], 'big-cheese': [39.222, -85.905],
  'tasty-express': [39.223, -85.905], rohdes: [39.201, -85.912], 'carlos-pizza': [39.225, -85.899],
  'mother-bears': [39.224, -85.899], zwanzigz: [39.209, -85.919], guatemex: [39.195, -85.898],
  'taqueria-jc': [39.198, -85.905], 'yee-kee': [39.225, -85.877], zaharakos: [39.202, -85.921],
  'gills-barber-shop': [39.202, -85.895], 'coachs-cutz': [39.232, -85.922], nomad: [39.202, -85.915],
};
const FEATURED_SUB = { mexican: 'mexican', pizza: 'pizza', sandwiches: 'diners', asian: 'asian', barbershops: 'barbers', salons: 'salons', 'personal-care': 'spa' };
const areaFromTags = (tags) => {
  const t = tags.join(' ').toLowerCase();
  if (/washington st/.test(t) && /north/.test(t)) return 'north-washington';
  if (/downtown|washington st|3rd st|4th st/.test(t)) return 'downtown';
  if (/25th/.test(t)) return '25th-street';
  if (/national rd/.test(t)) return 'national-road';
  if (/state st/.test(t)) return 'east-columbus';
  if (/cottage|2nd st|lafayette|mckinley/.test(t)) return 'columbus-central';
  return '';
};

const all = [];
const used = new Set();
const uniq = (base) => {
  let s = base, i = 2;
  while (used.has(s)) s = `${base}-${i++}`;
  used.add(s);
  return s;
};

for (const b of businesses) {
  const subSlug = b.slug === 'zaharakos' ? 'coffee-sweets' : FEATURED_SUB[b.filters[0]];
  const cat = CATEGORIES.find((c) => c.subs.some((s) => s.slug === subSlug));
  all.push({
    slug: uniq(slugify(b.name.replace(/ \(.*\)/, ''))), name: b.name, cat: cat.slug, sub: subSlug,
    type: b.focus, address: b.address, area: areaFromTags(b.area), phone: b.phone || '',
    website: b.website || '', demo: b.demo || '', ll: FEATURED_LL[b.slug] || null, featured: true,
    heritage: b.badges.includes('heritage'),
  });
}
for (const l of landscape) {
  const hit = SUB_BY_PAIR[`${l.vertical}/${l.filter}`];
  all.push({
    slug: uniq(slugify(l.name)), name: l.name, cat: hit.cat.slug, sub: hit.sub.slug, type: l.type,
    address: l.address, area: AREA_BY_LABEL[l.area] || '', phone: l.phone, website: '', demo: '',
    ll: l.ll, featured: false, heritage: false,
  });
}

// Fill in website and phone from each business's own Google listing, and
// attach what its website can do (order, book, shop) from the commerce probe.
const fmtPhone = (p) => {
  const d = String(p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : '';
};
for (const b of all) {
  const w = WEB[b.slug];
  if (w) {
    if (!b.phone && w.phone) b.phone = fmtPhone(w.phone);
    if (!b.website && w.website) b.website = w.website;
  }
  const c = COMMERCE[b.slug];
  b.order = c ? c.order || [] : [];
  b.book = c ? c.book || [] : [];
  b.feed = !!(c && c.feed);
  b.store = c && c.store ? c.store : '';
  b.platform = c ? c.platform || '' : '';
  b.hours = HOURS[b.slug] || null;
  const g = GEO[b.slug];
  if (g) {
    b.ll = [g[0], g[1]];
    if (!b.address && g[2]) b.address = g[2];
  }
  b.tempClosed = !!(w && w.tempClosed);
}

// Neighborhood for places the listings did not tag: the most common area
// among the nearest tagged neighbors, when they are close enough to count.
{
  const tagged = all.filter((b) => b.area && b.ll);
  for (const b of all) {
    if (b.area || !b.ll) continue;
    const near = tagged.map((t) => [km(b.ll, t.ll), t.area]).sort((x, y) => x[0] - y[0]).slice(0, 7).filter(([d]) => d < 1.2);
    if (near.length < 3) continue;
    const votes = {};
    for (const [, a] of near) votes[a] = (votes[a] || 0) + 1;
    const [best, n] = Object.entries(votes).sort((x, y) => y[1] - x[1])[0];
    if (n >= 3) b.area = best;
  }
}

// A business its own Google listing marks permanently closed leaves the
// directory (the hand-built featured cards are checked by hand instead).
export const directory = all.filter((b) => b.featured || !(WEB[b.slug] && WEB[b.slug].closed)).sort((a, b) => a.name.replace(/^the /i, '').localeCompare(b.name.replace(/^the /i, '')));
export const catBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
export const subBySlug = Object.fromEntries(CATEGORIES.flatMap((c) => c.subs.map((s) => [s.slug, { ...s, cat: c }])));
export const areaBySlug = Object.fromEntries(AREAS.map((a) => [a.slug, a]));

// Straight-line distance in km, for "nearby" lists.
export function km(a, b) {
  if (!a || !b) return Infinity;
  const r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

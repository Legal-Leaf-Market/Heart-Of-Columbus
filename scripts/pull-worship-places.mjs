// node scripts/pull-worship-places.mjs <out.json>
// Asks Google Maps, through the official Places API (Text Search, New), for
// every place of worship in and around Columbus, and for each congregation
// the OpenStreetMap and IRS pulls named (scripts/pull-worship.mjs). Saves
// what each listing says about itself: name, street address, pin, website,
// phone, hours and Google's own place type. Read-only; nothing is posted.
// Needs GOOGLE_PLACES_API_KEY (a GitHub secret, never in git). Run by the
// "Pull places of worship" workflow; this sandbox can't reach Google.
// Google's terms: attribute "Google Maps" wherever these facts show.
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.GOOGLE_PLACES_API_KEY || '';
if (!KEY) { console.error('GOOGLE_PLACES_API_KEY is not set: add it as a repository secret, then run again.'); process.exit(2); }

const out = process.argv[2] || 'scripts/data/places-worship.json';
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchText';
const FIELDS = ['places.id', 'places.displayName', 'places.formattedAddress', 'places.location', 'places.types', 'places.primaryType',
  'places.websiteUri', 'places.nationalPhoneNumber', 'places.regularOpeningHours.weekdayDescriptions', 'places.businessStatus', 'places.googleMapsUri'].join(',');
// Columbus, Indiana, and far enough to take in Hope, Taylorsville and Elizabethtown.
const CENTER = { latitude: 39.2014, longitude: -85.9214 };
const BIAS = { circle: { center: CENTER, radius: 25000 } };
const ZIPS = /\b(47201|47202|47203|47246|47280|47232|47226|47244|47274)\b/;

async function search(body) {
  const found = [];
  let token = '';
  for (let page = 0; page < 3; page++) {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': FIELDS + ',nextPageToken' },
      body: JSON.stringify({ ...body, locationBias: BIAS, pageSize: 20, ...(token ? { pageToken: token } : {}) }),
    });
    if (!r.ok) { console.error('places', r.status, (await r.text()).slice(0, 300)); break; }
    const j = await r.json();
    found.push(...(j.places || []));
    if (!j.nextPageToken) break;
    token = j.nextPageToken;
    await new Promise((res) => setTimeout(res, 2000));
  }
  return found;
}

const byId = new Map();
const keep = (p, how) => {
  if (!p || !p.id || !ZIPS.test(p.formattedAddress || '')) return;
  const was = byId.get(p.id);
  byId.set(p.id, {
    id: p.id, name: p.displayName && p.displayName.text, address: p.formattedAddress,
    ll: p.location ? [p.location.latitude, p.location.longitude] : null,
    type: p.primaryType || '', types: p.types || [], website: p.websiteUri || '', phone: p.nationalPhoneNumber || '',
    hours: (p.regularOpeningHours && p.regularOpeningHours.weekdayDescriptions) || [],
    status: p.businessStatus || '', maps: p.googleMapsUri || '',
    found: [...new Set([...(was ? was.found : []), how])],
  });
};

// 1. Discovery by kind, so a congregation nobody else listed still turns up.
const KINDS = [
  ['church', 'church'], ['mosque', 'mosque'], ['synagogue', 'synagogue'], ['hindu_temple', 'hindu temple'],
  [null, 'place of worship'], [null, 'buddhist temple'], [null, 'gurdwara'], [null, 'kingdom hall'], [null, 'meeting house'], [null, 'iglesia'],
];
for (const [type, words] of KINDS) {
  for (const p of await search({ textQuery: `${words} in Columbus, Indiana`, ...(type ? { includedType: type } : {}) })) keep(p, `kind:${words}`);
}

// 2. Every name the OpenStreetMap and IRS pulls gave us.
const names = new Set();
try {
  const osm = JSON.parse(readFileSync('scripts/data/osm-worship.json', 'utf8'));
  for (const e of osm.elements) if (e.tags && e.tags.name) names.add(`${e.tags.name}|COLUMBUS`);
} catch { /* not pulled yet */ }
try {
  const irs = JSON.parse(readFileSync('scripts/data/irs-eo.json', 'utf8'));
  const RELIGIOUS = /CHURCH|CHAPEL|PARISH|MINISTR|CONGREGATION|MOSQUE|ISLAMIC|MASJID|SYNAGOG|TEMPLE|HINDU|BUDDH|ZENDO|SANGHA|GURDWARA|SIKH|JEWISH|FELLOWSHIP|ASSEMBLY|TABERNACLE|IGLESIA|BAHA|QUAKER|FRIENDS MEETING|UNITARIAN|KINGDOM HALL/;
  for (const o of irs.orgs) if (/^X/.test(o.ntee_cd || '') || RELIGIOUS.test(o.name || '')) names.add(`${o.name}|${o.city || 'COLUMBUS'}`);
} catch { /* not pulled yet */ }
for (const entry of names) {
  const [name, city] = entry.split('|');
  const r = await search({ textQuery: `${name}, ${city}, Indiana` });
  if (r[0]) keep(r[0], `name:${name}`);
}

const places = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(out, JSON.stringify({ pulled: new Date().toISOString().slice(0, 10), source: 'Google Maps (Places API)', attribution: 'Google Maps', asked: { kinds: KINDS.length, names: names.size }, places }, null, 1) + '\n');
console.log(`Google Maps: ${places.length} places of worship from ${KINDS.length} kinds and ${names.size} names`);

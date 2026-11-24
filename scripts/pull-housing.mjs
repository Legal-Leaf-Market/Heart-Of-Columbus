// node scripts/pull-housing.mjs <out-dir>
// Reads public lists of apartment buildings and property managers in and
// around Columbus, for scripts/import-housing.mjs:
//   1. OpenStreetMap (always): named apartment buildings and complexes, and
//      offices tagged as property management or estate agents. One read-only
//      Overpass query. Data © OpenStreetMap contributors, ODbL.
//   2. Google Maps through the official Places API (Text Search, New), when
//      GOOGLE_PLACES_API_KEY is set: apartment complexes, apartment buildings
//      and property management companies, with address, website and phone.
// Nothing is posted. Run by the "Pull housing" workflow; this sandbox can't
// reach either source.
import { writeFileSync, mkdirSync } from 'node:fs';

const out = process.argv[2] || 'scripts/data';
mkdirSync(out, { recursive: true });
const UA = 'HeartOfColumbus/1.0 (local directory; github.com/Legal-Leaf-Market/Heart-Of-Columbus)';
const today = new Date().toISOString().slice(0, 10);
const BBOX = '39.12,-86.02,39.29,-85.80';

const q = `[out:json][timeout:120];(
nwr["building"="apartments"]["name"](${BBOX});
nwr["residential"="apartments"]["name"](${BBOX});
nwr["landuse"="residential"]["name"~"apartment|apartments|townhome|townhomes|village|commons|place|court|crossing|pointe|park",i](${BBOX});
nwr["office"~"^(property_management|estate_agent)$"](${BBOX});
);out center tags;`;
let osm;
for (const url of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }), headers: { 'user-agent': UA } });
    if (r.ok) { osm = await r.json(); break; }
    console.error(url, r.status);
  } catch (e) { console.error(url, e.message); }
}
if (osm) {
  const KEEP = ['name', 'building', 'residential', 'landuse', 'office', 'website', 'contact:website', 'phone', 'contact:phone',
    'addr:housenumber', 'addr:street', 'addr:city', 'addr:postcode', 'operator', 'building:levels'];
  const elements = osm.elements.map((e) => ({
    id: `${e.type}/${e.id}`, ll: e.center ? [e.center.lat, e.center.lon] : [e.lat, e.lon],
    tags: Object.fromEntries(KEEP.filter((k) => e.tags && e.tags[k] != null).map((k) => [k, e.tags[k]])),
  }));
  writeFileSync(`${out}/osm-housing.json`, JSON.stringify({ pulled: today, source: 'https://www.openstreetmap.org/', license: 'ODbL', bbox: BBOX, elements }, null, 1) + '\n');
  console.log('OpenStreetMap housing places:', elements.length);
} else console.error('::warning::Overpass did not answer; keeping the last OpenStreetMap pull.');

const KEY = process.env.GOOGLE_PLACES_API_KEY || '';
if (!KEY) { console.error('::warning::GOOGLE_PLACES_API_KEY is not set, so no Google Maps listings this run.'); process.exit(0); }
const FIELDS = ['places.id', 'places.displayName', 'places.formattedAddress', 'places.location', 'places.types', 'places.primaryType',
  'places.websiteUri', 'places.nationalPhoneNumber', 'places.businessStatus', 'places.googleMapsUri'].join(',');
const ZIPS = /\b(47201|47202|47203|47246|47280|47232|47226|47244|47274)\b/;
const BIAS = { circle: { center: { latitude: 39.2014, longitude: -85.9214 }, radius: 20000 } };
async function search(body) {
  const found = [];
  let token = '';
  for (let page = 0; page < 3; page++) {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
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
const ASK = [
  ['apartment_complex', 'apartment complex', 'building'], ['apartment_building', 'apartment building', 'building'],
  [null, 'apartments for rent', 'building'], [null, 'townhomes for rent', 'building'],
  [null, 'property management company', 'manager'], [null, 'rental property management', 'manager'],
];
for (const [type, words, kind] of ASK) {
  for (const p of await search({ textQuery: `${words} in Columbus, Indiana`, ...(type ? { includedType: type } : {}) })) {
    if (!p.id || !ZIPS.test(p.formattedAddress || '') || (p.businessStatus && p.businessStatus !== 'OPERATIONAL')) continue;
    const was = byId.get(p.id);
    byId.set(p.id, {
      id: p.id, name: p.displayName && p.displayName.text, address: (p.formattedAddress || '').replace(/, USA$/, ''),
      ll: p.location ? [p.location.latitude, p.location.longitude] : null, type: p.primaryType || '', types: p.types || [],
      website: p.websiteUri || '', phone: p.nationalPhoneNumber || '', maps: p.googleMapsUri || '',
      kind: (was && was.kind === 'manager') || kind === 'manager' ? (/(apartment|townhome|village|crossing|commons|pointe)/i.test(p.displayName && p.displayName.text) ? 'building' : 'manager') : 'building',
    });
  }
}
const places = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
writeFileSync(`${out}/places-housing.json`, JSON.stringify({ pulled: today, source: 'Google Maps (Places API)', attribution: 'Google Maps', places }, null, 1) + '\n');
console.log(`Google Maps: ${places.length} apartment buildings and managers`);

// node scripts/pull-osm-attrs.mjs <out.json>
// Reads the visitor attributes that OpenStreetMap mappers have recorded for
// places in and around Columbus (wheelchair access, dogs, outdoor seating,
// accessible restroom, vegetarian food) from the public Overpass API, and
// saves the raw elements for scripts/import-attrs.mjs. One read-only query.
// Run by the "Pull OSM attributes" workflow; this sandbox can't reach Overpass.
// Data © OpenStreetMap contributors, ODbL: credited wherever it shows.
import { writeFileSync } from 'node:fs';

const BBOX = '39.12,-86.02,39.29,-85.80'; // south, west, north, east
const KEYS = ['wheelchair', 'dog', 'outdoor_seating', 'toilets:wheelchair', 'diet:vegetarian', 'diet:vegan'];
const q = `[out:json][timeout:120];(${KEYS.map((k) => `nwr["name"]["${k}"](${BBOX});`).join('')});out center tags;`;
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];

let data;
for (const url of ENDPOINTS) {
  try {
    const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }), headers: { 'user-agent': 'HeartOfColumbus/1.0 (directory attributes; github.com/Legal-Leaf-Market/Heart-Of-Columbus)' } });
    if (r.ok) { data = await r.json(); break; }
    console.error(url, r.status);
  } catch (e) { console.error(url, e.message); }
}
if (!data) process.exit(1);
const keep = ['name', 'brand', 'amenity', 'shop', 'cuisine', 'addr:housenumber', 'addr:street', ...KEYS];
const elements = data.elements.map((e) => ({
  id: `${e.type}/${e.id}`,
  ll: e.center ? [e.center.lat, e.center.lon] : [e.lat, e.lon],
  tags: Object.fromEntries(keep.filter((k) => e.tags[k] != null).map((k) => [k, e.tags[k]])),
}));
writeFileSync(process.argv[2], JSON.stringify({ pulled: new Date().toISOString().slice(0, 10), source: 'https://www.openstreetmap.org/', license: 'ODbL', elements }, null, 1));
console.log(`${elements.length} places with attributes`);

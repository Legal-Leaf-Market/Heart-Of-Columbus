// node scripts/pull-worship.mjs <out-dir>
// Reads two public lists and saves them raw, for scripts/import-worship.mjs:
//   1. Every place of worship OpenStreetMap mappers have recorded in and
//      around Columbus (amenity=place_of_worship), with its religion and
//      denomination tags. One read-only Overpass query.
//      Data © OpenStreetMap contributors, ODbL: credited wherever it shows.
//   2. The IRS Exempt Organizations Business Master File for Indiana, kept
//      only for Columbus area ZIP codes: registered nonprofits, and the
//      congregations that chose to register (most churches need not).
//      Public domain (US government work).
// Run by the "Pull places of worship" workflow; this sandbox can't reach either.
import { writeFileSync, mkdirSync } from 'node:fs';

const out = process.argv[2] || 'scripts/data';
mkdirSync(out, { recursive: true });
const UA = 'HeartOfColumbus/1.0 (local directory; github.com/Legal-Leaf-Market/Heart-Of-Columbus)';
const today = new Date().toISOString().slice(0, 10);

// Bartholomew County, a little wider than the attributes pull so the
// congregations in Hope, Taylorsville and Elizabethtown come too.
const BBOX = '39.05,-86.10,39.40,-85.68';
const q = `[out:json][timeout:120];nwr["amenity"="place_of_worship"](${BBOX});out center tags;`;
let osm;
for (const url of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
  try {
    const r = await fetch(url, { method: 'POST', body: new URLSearchParams({ data: q }), headers: { 'user-agent': UA } });
    if (r.ok) { osm = await r.json(); break; }
    console.error(url, r.status);
  } catch (e) { console.error(url, e.message); }
}
// Overpass is a shared, volunteer server and times out some days. Keep the
// last good pull rather than stopping the run before the IRS and Google steps.
if (!osm) console.error('::warning::Overpass did not answer; keeping the last OpenStreetMap pull.');
const KEEP = ['name', 'alt_name', 'religion', 'denomination', 'building', 'website', 'contact:website', 'phone', 'contact:phone',
  'addr:housenumber', 'addr:street', 'addr:city', 'addr:postcode', 'service_times', 'opening_hours', 'wheelchair'];
const places = (osm ? osm.elements : []).map((e) => ({
  id: `${e.type}/${e.id}`,
  ll: e.center ? [e.center.lat, e.center.lon] : [e.lat, e.lon],
  tags: Object.fromEntries(KEEP.filter((k) => e.tags && e.tags[k] != null).map((k) => [k, e.tags[k]])),
}));
if (osm) writeFileSync(`${out}/osm-worship.json`, JSON.stringify({ pulled: today, source: 'https://www.openstreetmap.org/', license: 'ODbL', bbox: BBOX, elements: places }, null, 1) + '\n');
if (osm) console.log('OSM places of worship:', places.length);

// Columbus 47201, 47202, 47203; Hope 47246; Taylorsville 47280; Elizabethtown 47232.
const ZIPS = new Set(['47201', '47202', '47203', '47246', '47280', '47232']);
const BMF = 'https://www.irs.gov/pub/irs-soi/eo_in.csv';
const r = await fetch(BMF, { headers: { 'user-agent': UA } });
if (!r.ok) { console.error(BMF, r.status); process.exit(1); }
const lines = (await r.text()).split(/\r?\n/);
const parse = (line) => {
  const cells = []; let cur = '', q2 = false;
  for (const ch of line) {
    if (ch === '"') q2 = !q2; else if (ch === ',' && !q2) { cells.push(cur); cur = ''; } else cur += ch;
  }
  cells.push(cur);
  return cells;
};
const head = parse(lines[0]);
const col = (n) => head.indexOf(n);
const keepCols = ['EIN', 'NAME', 'ICO', 'STREET', 'CITY', 'STATE', 'ZIP', 'SUBSECTION', 'CLASSIFICATION', 'RULING', 'FOUNDATION', 'ACTIVITY', 'ORGANIZATION', 'STATUS', 'NTEE_CD', 'SORT_NAME'];
const orgs = [];
for (const line of lines.slice(1)) {
  if (!line) continue;
  const c = parse(line);
  if (!ZIPS.has(String(c[col('ZIP')] || '').slice(0, 5))) continue;
  orgs.push(Object.fromEntries(keepCols.filter((k) => col(k) !== -1).map((k) => [k.toLowerCase(), c[col(k)]])));
}
writeFileSync(`${out}/irs-eo.json`, JSON.stringify({ pulled: today, source: BMF, about: 'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf', zips: [...ZIPS], orgs }, null, 1) + '\n');
console.log('IRS exempt organizations in the Columbus ZIPs:', orgs.length);

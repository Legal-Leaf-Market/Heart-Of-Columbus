// node scripts/import-housing.mjs
// Builds src/data/housing.mjs from scripts/data/places-housing.json (Google
// Maps, when pulled) and scripts/data/osm-housing.json (OpenStreetMap): named
// apartment buildings, townhome communities, mobile home communities and
// property managers. Only what a source says; every row keeps its sources and
// the date they were pulled. Rents, reviews and availability are never typed
// here: they change daily, so each row sends you to the place itself.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => { try { return JSON.parse(readFileSync(new URL(`./data/${f}`, import.meta.url), 'utf8')); } catch { return null; } };
const google = read('places-housing.json');
const osm = read('osm-housing.json');

export const KINDS = { apartments: 'Apartments and townhomes', mobile: 'Mobile home communities', manager: 'Property managers' };
const kindOf = (name, hint = '') => (/mobile home|trailer|manufactured/i.test(`${name} ${hint}`) ? 'mobile'
  : /property management|property manager|rentals?\b|realty management/i.test(name) && !/apartment|townhome|village/i.test(name) ? 'manager' : 'apartments');
const keyOf = (s) => String(s).toLowerCase().replace(/\b(the|apartments?|townhomes?|of|columbus|in)\b/g, ' ').replace(/^st\.? /, 'saint ').replace(/[^a-z0-9]+/g, ' ').trim();
const slugOf = (s) => String(s).toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const townOf = (addr) => { const m = /,\s*([A-Za-z .]+),\s*IN\b/.exec(addr || ''); return m ? m[1].trim() : ''; };

const rows = [];
for (const p of (google && google.places) || []) {
  rows.push({ name: p.name, kind: p.kind === 'manager' ? 'manager' : kindOf(p.name, p.type), address: p.address, town: townOf(p.address) || 'Columbus',
    ll: p.ll, website: p.website, phone: p.phone, sources: [{ name: 'Google Maps', url: p.maps || 'https://www.google.com/maps', checked: google.pulled }] });
}
for (const e of (osm && osm.elements) || []) {
  const t = e.tags || {};
  // Brokerages sell houses; they are not landlords. Charities are not housing.
  if (!t.name || t.office === 'estate_agent' || t.office === 'charity') continue;
  const src = { name: 'OpenStreetMap', url: `https://www.openstreetmap.org/${e.id}`, checked: osm.pulled };
  const was = rows.find((r) => keyOf(r.name) === keyOf(t.name));
  if (was) { was.sources.push(src); was.ll = was.ll || e.ll; continue; }
  const street = t['addr:housenumber'] && t['addr:street'] ? `${t['addr:housenumber']} ${t['addr:street']}, ${t['addr:city'] || 'Columbus'}, IN` : '';
  rows.push({ name: t.name, kind: t.landuse === 'residential' && /mobile|trailer/i.test(t.name) ? 'mobile' : kindOf(t.name, t.residential || ''),
    address: street, street: street ? '' : (t['addr:street'] || ''), town: t['addr:city'] || 'Columbus', ll: e.ll,
    website: t.website || t['contact:website'] || '', phone: t.phone || t['contact:phone'] || '', sources: [src] });
}

const seen = new Set();
export const out = rows.map((r) => {
  let slug = slugOf(r.name);
  while (seen.has(slug)) slug += '-2';
  seen.add(slug);
  return { slug, ...r, street: r.street || '' };
}).sort((a, b) => a.name.localeCompare(b.name));

if (import.meta.url === `file://${process.argv[1]}`) {
  const head = `// Apartment buildings, townhome and mobile home communities, and property
// managers in and around Columbus, built by scripts/import-housing.mjs from
// Google Maps and OpenStreetMap (scripts/data/). Regenerate rather than
// hand-edit. Each row lists its sources with the date they were pulled.
`;
  writeFileSync(new URL('../src/data/housing.mjs', import.meta.url), `${head}export const HOUSING = ${JSON.stringify(out, null, 1)};\n\nexport const HOUSING_KINDS = ${JSON.stringify(KINDS, null, 1)};\n`);
  const by = {}; for (const r of out) by[r.kind] = (by[r.kind] || 0) + 1;
  console.log(out.length, 'places;', JSON.stringify(by));
}

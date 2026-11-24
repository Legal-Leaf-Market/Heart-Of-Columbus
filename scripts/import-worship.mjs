// node scripts/import-worship.mjs
// Builds src/data/worship.mjs from three public lists in scripts/data/:
//   places-worship.json  Google Maps (Places API): street address, pin,
//                        website, phone. The address source when present.
//   osm-worship.json     OpenStreetMap: pin, religion and denomination.
//   irs-eo.json          IRS exempt organizations: congregations the other
//                        two missed. Its address is a mailing address, often
//                        a PO box, so only the town is shown from it.
// Rules: only what a source says; every row keeps its sources and the date
// they were pulled; a congregation is listed once. Service times are never
// typed by us: the page links each congregation's own website.
import { readFileSync, writeFileSync } from 'node:fs';

const read = (f) => { try { return JSON.parse(readFileSync(new URL(`./data/${f}`, import.meta.url), 'utf8')); } catch { return null; } };
const google = read('places-worship.json');
const osm = read('osm-worship.json');
const irs = read('irs-eo.json');

// Faith families, checked in order: the first that matches wins.
export const FAITHS = [
  ['catholic', 'Catholic', /\bcatholic|roman_catholic|\bst\.? (?:bartholomew|columba|peter|paul|mary|michael|joseph|vincent|patrick)\b.*\b(?:catholic|parish)|\bparish\b|\bour lady\b/i],
  ['orthodox', 'Orthodox', /\borthodox\b/i],
  ['episcopal', 'Episcopal and Anglican', /\bepiscopal|anglican/i],
  ['lutheran', 'Lutheran', /\blutheran/i],
  ['methodist', 'Methodist', /\bmethodist|\bwesleyan|\bame\b/i],
  ['presbyterian', 'Presbyterian and Reformed', /\bpresbyterian|\breformed\b|\bucc\b|united church of christ/i],
  ['baptist', 'Baptist', /\bbaptist|\bbatpist|\bbautista/i],
  ['pentecostal', 'Pentecostal and Assemblies of God', /\bpentecost|assembl(?:y|ies) of god|assemblies_of_god|church of god\b|iglesia de dios|apostolic/i],
  ['nazarene', 'Nazarene and Holiness', /\bnazarene|\bholiness|free methodist/i],
  ['christian-church', 'Christian Church and Church of Christ', /\bchristian church\b|\bchurch of christ\b|disciples of christ/i],
  ['adventist', 'Seventh-day Adventist', /\badventist/i],
  ['lds', 'Latter-day Saints', /\blatter[- ]day|\blds\b|mormon/i],
  ['jw', 'Jehovah\'s Witnesses', /jehovah'?s witness|jehovahs_witness|kingdom hall/i],
  ['quaker', 'Friends (Quaker)', /\bquaker|friends meeting|religious society of friends/i],
  ['unitarian', 'Unitarian Universalist', /\bunitarian/i],
  ['islam', 'Islam', /\bmosque|\bmasjid|\bislamic|\bmuslim|religion:muslim/i],
  ['judaism', 'Judaism', /\bsynagog|\bjewish|\bcongregation (?:b'?nai|beth|shalom|sinai)|religion:jewish|\btemple (?:beth|israel|sinai)/i],
  ['hinduism', 'Hinduism', /\bhindu|\bmandir|hindu_temple|religion:hindu/i],
  ['buddhism', 'Buddhism', /\bbuddh|\bzendo|\bsangha|\bzen\b|religion:buddhist/i],
  ['sikh', 'Sikh', /\bsikh|\bgurdwara|religion:sikh/i],
  ['bahai', 'Bahá\'í', /\bbaha'?i|religion:bahai/i],
  ['christian', 'Other Christian', /church|chapel|fellowship|tabernacle|ministr|iglesia|gospel|bible|christian|religion:christian|\bchurch\b/i],
];
export const faithOf = (text) => (FAITHS.find(([, , re]) => re.test(text)) || ['other', 'Other faiths'])[0];

// Words that mark an IRS row as a congregation, and words that mark one as
// something else (a trust, a school, an association of churches).
const CONGREGATION = /CHURCH|CHAPEL|PARISH|CONGREGATION|MOSQUE|MASJID|ISLAMIC SOCIETY|ISLAMIC CENTER|SYNAGOG|TEMPLE|HINDU SOCIETY|ZENDO|SANGHA|GURDWARA|IGLESIA|KINGDOM HALL|FELLOWSHIP|TABERNACLE|FRIENDS MEETING|ASSEMBLY OF GOD/;
const NOT_A_CONGREGATION = /TRUST|FOUNDATION|ACADEMY|SCHOOL|PRESCHOOL|ASSOCIATION|AUXILIARY|ALUMNI|HOUSING|THRIFT|PANTRY|CEMETERY|ENDOWMENT|CAMP\b|BOOSTER|DISTRICT|ECUMENICAL|MUSICIANS|CLUB\b|CONFERENCE|COUNCIL OF/;

const small = new Set(['of', 'the', 'and', 'in', 'de', 'la', 'del', 'at', 'on', 'for']);
export const titleCase = (s) => String(s).replace(/INDIANAINC\b/, 'INDIANA').replace(/\s+INC\.?$/, '').toLowerCase().replace(/\b([a-z])([a-z']*)/g, (m, a, b, i) => (i > 0 && small.has(m) ? m : a.toUpperCase() + b))
  .replace(/\bSt\b/g, 'St.').replace(/\bInc\b\.?/g, '').replace(/\bOf\b/g, 'of').replace(/\s+/g, ' ').trim().replace(/[,.]$/, '');
export const keyOf = (s) => String(s).toLowerCase().replace(/&/g, ' and ').replace(/\b(the|of|inc|church|parish|ministries|ministry|congregation|in|columbus|indiana|in|corp|corporation)\b/g, ' ')
  .replace(/\bsaint\b/g, 'st').replace(/[^a-z0-9]+/g, ' ').trim();
const slugOf = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const metres = ([a, b], [c, d]) => { const R = 6371000, r = Math.PI / 180, x = (d - b) * r * Math.cos(((a + c) / 2) * r), y = (c - a) * r; return Math.hypot(x, y) * R; };
const townOf = (addr) => { const m = /,\s*([A-Za-z .]+),\s*IN\b/.exec(addr || ''); return m ? m[1].trim() : ''; };
const POBOX = /\bP\.?\s*O\.?\s*BOX\b/i;

const rows = [];
const add = (r) => { rows.push(r); return r; };
const findMatch = (name, ll) => {
  const k = keyOf(name);
  return rows.find((r) => (k && keyOf(r.name) === k) || (ll && r.ll && metres(ll, r.ll) < 120 && sharesWord(name, r.name)));
};
const sharesWord = (a, b) => { const A = new Set(keyOf(a).split(' ').filter((w) => w.length > 3)); return keyOf(b).split(' ').some((w) => A.has(w)); };

// 1. Google Maps: the address of record.
for (const p of (google && google.places) || []) {
  if (p.status && p.status !== 'OPERATIONAL') continue;
  add({ name: p.name, address: (p.address || '').replace(/, USA$/, ''), town: townOf(p.address), ll: p.ll, website: p.website || '', phone: p.phone || '',
    hint: `${p.name} ${p.type} ${(p.types || []).join(' ')}`, sources: [{ name: 'Google Maps', url: p.maps || 'https://www.google.com/maps', checked: google.pulled }] });
}
// Names the maps carry that are not congregations a visitor can attend.
// Italian Prisoner of War Chapel: a WWII memorial chapel at Camp Atterbury,
// outside Columbus, not a parish holding services.
const NOT_HERE = /italian prisoner of war chapel/i;

// 2. OpenStreetMap: a pin, a religion and a denomination.
for (const e of (osm && osm.elements) || []) {
  const t = e.tags || {};
  if (!t.name || /[?()]/.test(t.name) || NOT_HERE.test(t.name)) continue;
  const hint = `${t.name} religion:${t.religion || ''} ${t.denomination || ''}`;
  const src = { name: 'OpenStreetMap', url: `https://www.openstreetmap.org/${e.id}`, checked: osm.pulled };
  const was = findMatch(t.name, e.ll);
  if (was) { was.hint += ` ${hint}`; was.ll = was.ll || e.ll; was.website = was.website || t.website || t['contact:website'] || ''; was.sources.push(src); continue; }
  const street = t['addr:housenumber'] && t['addr:street'] ? `${t['addr:housenumber']} ${t['addr:street']}` : '';
  add({ name: t.name, address: street ? `${street.replace(/`/g, '')}, ${t['addr:city'] || 'Columbus'}, IN` : '', town: t['addr:city'] || '', ll: e.ll, website: t.website || t['contact:website'] || '', phone: t.phone || t['contact:phone'] || '', hint, sources: [src] });
}
// 3. IRS: congregations nobody mapped. Town only; a mailing address is not a door.
for (const o of (irs && irs.orgs) || []) {
  const n = o.name || '';
  if (!CONGREGATION.test(n) || NOT_A_CONGREGATION.test(n)) continue;
  const name = titleCase(n);
  const src = { name: 'IRS exempt organizations list', url: 'https://www.irs.gov/charities-non-profits/exempt-organizations-business-master-file-extract-eo-bmf', checked: irs.pulled };
  const was = findMatch(name, null);
  if (was) { was.sources.push(src); was.hint += ` ${n}`; continue; }
  add({ name, address: '', town: titleCase(o.city || ''), ll: null, website: '', phone: '', hint: n, sources: [src], mailing: POBOX.test(o.street || '') });
}

const seen = new Set();
export const out = rows.map((r) => {
  let slug = slugOf(r.name);
  while (seen.has(slug)) slug += '-2';
  seen.add(slug);
  return { slug, name: r.name, faith: faithOf(r.hint), town: r.town || 'Columbus', address: r.address, ll: r.ll, website: r.website, phone: r.phone, sources: r.sources };
}).sort((a, b) => a.name.localeCompare(b.name));

if (import.meta.url === `file://${process.argv[1]}`) {
  const head = `// Places of worship in and around Columbus, every faith, built by
// scripts/import-worship.mjs from Google Maps, OpenStreetMap and the IRS
// exempt organizations list (scripts/data/). Regenerate rather than hand-edit.
// Each row lists its sources with the date they were pulled.
`;
  writeFileSync(new URL('../src/data/worship.mjs', import.meta.url), `${head}export const WORSHIP = ${JSON.stringify(out, null, 1)};\n\nexport const FAITH_NAMES = ${JSON.stringify(Object.fromEntries([...FAITHS.map(([k, n]) => [k, n]), ['other', 'Other faiths']]), null, 1)};\n`);
  const by = {}; for (const r of out) by[r.faith] = (by[r.faith] || 0) + 1;
  console.log(out.length, 'places of worship;', out.filter((r) => r.address).length, 'with a street address;', JSON.stringify(by));
}

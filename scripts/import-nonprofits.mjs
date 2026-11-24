// node scripts/import-nonprofits.mjs
// Builds src/data/nonprofits.mjs from the IRS Exempt Organizations list for
// the Columbus area ZIPs (scripts/data/irs-eo.json, pulled by the "Pull places
// of worship" workflow). Rules:
//   - Congregations are left out: they are on /worship/ (src/data/worship.mjs).
//   - Private foundations (IRS foundation codes 02, 03, 04) are left out: they
//     are grant-making trusts, not places the public goes to.
//   - Only organizations the IRS lists as exempt (status 01).
//   - No street address is kept. For a small group the IRS address is often a
//     volunteer's home, so the page shows the town only.
// Each row keeps its EIN, which links to its public filings.
import { readFileSync, writeFileSync } from 'node:fs';
import { titleCase } from './import-worship.mjs';
import { WORSHIP } from '../src/data/worship.mjs';

const irs = JSON.parse(readFileSync(new URL('./data/irs-eo.json', import.meta.url), 'utf8'));

// Groups by the National Taxonomy of Exempt Entities (NTEE) major letter.
export const GROUPS = [
  ['help', 'Food, housing and everyday help', /^[IJKLMP]/],
  ['health', 'Health', /^[EFGH]/],
  ['youth', 'Youth and families', /^O/],
  ['education', 'Schools and education', /^B/],
  ['arts', 'Arts, culture and history', /^A/],
  ['nature', 'Animals and the outdoors', /^[CD]/],
  ['sports', 'Sports and recreation', /^N/],
  ['community', 'Community, civic and giving', /^[QRSTUVW]/],
  ['faith', 'Faith based groups (not congregations)', /^X/],
  ['clubs', 'Clubs, lodges and member groups', /^Y/],
];
// For rows the IRS gave no category, plain words in the name decide.
const BY_NAME = [
  ['sports', /BOOSTER|ATHLETIC|BASEBALL|SOFTBALL|SOCCER|BASKETBALL|SWIM|HOCKEY|WRESTLING|GOLF|BMX|RUNNING|SPORTS/],
  ['education', /SCHOOL|LEARNING|ACADEMY|LIBRARY|SCHOLARSHIP|EDUCATION|PTO\b|PTA\b|PARENT TEACHER/],
  ['help', /FIRE DEP|FIRE DEPT|VOLUNTEER FIRE|HOUSING|FOOD|PANTRY|SHELTER|RESCUE MISSION/],
  ['faith', /MINISTR|MANDAL|CHRISTIAN|BIBLE|GOSPEL/],
  ['youth', /YOUTH|CHILDREN|KIDS|SCOUT/],
  ['arts', /ARTS?\b|ORCHESTRA|SYMPHONY|DANC|MUSIC|THEAT|CHOIR|BAND\b|HISTORICAL|HERITAGE|MUSEUM/],
  ['nature', /ANIMAL|RESCUE|HUMANE|GARDEN|CONSERVATION|TRAIL|PARK/],
  ['community', /FOUNDATION|CHAMBER|ROTARY|KIWANIS|LIONS|COMMUNITY|NEIGHBORHOOD/],
];
const groupOf = (o) => {
  if (!o.ntee_cd || /^Z/.test(o.ntee_cd)) { const hit = BY_NAME.find(([, re]) => re.test(o.name || '')); if (hit) return hit[0]; }
  // Social clubs, lodges, unions and veterans' posts file under other sections.
  if (o.subsection && o.subsection !== '03' && !/^[A-X]/.test(o.ntee_cd || '')) return 'clubs';
  const g = GROUPS.find(([, , re]) => re.test(o.ntee_cd || ''));
  return g ? g[0] : 'other';
};

// IRS subsections that are not public-facing nonprofits: government
// corporations (01), employee benefit trusts (09, 17), electric and phone
// co-ops (12), cemetery companies (13), credit unions (14), insurance (15).
const NOT_PUBLIC = new Set(['01', '09', '12', '13', '14', '15', '17', '91']);
// Anything on /worship/ is a congregation, whatever the IRS files it as.
const onWorship = new Set(WORSHIP.map((w) => w.name.toLowerCase()));
const seen = new Set();
export const NONPROFITS = irs.orgs
  .filter((o) => o.status === '01' && o.foundation !== '10' && !['02', '03', '04'].includes(o.foundation) && !NOT_PUBLIC.has(o.subsection) && !/BENEFIT TR|VEBA|CREDIT UNION/.test(o.name || ''))
  .filter((o) => !onWorship.has(titleCase(o.name).toLowerCase()))
  .filter((o) => { const k = `${o.name}|${o.city}`; if (seen.has(k)) return false; seen.add(k); return true; })
  .map((o) => ({ ein: o.ein, name: titleCase(o.name).replace(/\bUsa\b/g, 'USA'), town: titleCase(o.city || 'Columbus'), group: groupOf(o), ntee: o.ntee_cd || '' }))
  .sort((a, b) => a.name.localeCompare(b.name));

if (import.meta.url === `file://${process.argv[1]}`) {
  const head = `// Nonprofit organizations in and around Columbus, built by
// scripts/import-nonprofits.mjs from the IRS Exempt Organizations list
// (scripts/data/irs-eo.json). Regenerate rather than hand-edit.
`;
  writeFileSync(new URL('../src/data/nonprofits.mjs', import.meta.url), `${head}export const NONPROFITS_PULLED = ${JSON.stringify(irs.pulled)};
export const NONPROFITS_SOURCE = ${JSON.stringify(irs.about)};
export const NONPROFIT_GROUPS = ${JSON.stringify(Object.fromEntries([...GROUPS.map(([k, n]) => [k, n]), ['other', 'Other']]), null, 1)};
export const NONPROFITS = ${JSON.stringify(NONPROFITS, null, 1)};
`);
  const by = {}; for (const r of NONPROFITS) by[r.group] = (by[r.group] || 0) + 1;
  console.log(NONPROFITS.length, 'nonprofits;', JSON.stringify(by));
}

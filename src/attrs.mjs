// How the OpenStreetMap attributes in src/data/attrs.mjs read on a page:
// plain words for what mappers recorded, short codes for the search index
// (x) that /explore/ filters on, and the credit ODbL asks for.
import { esc } from './layout.mjs';
import { ATTRS, ATTRS_PULLED } from './data/attrs.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const PULLED_LABEL = ATTRS_PULLED ? `${MONTHS[+ATTRS_PULLED.slice(5, 7) - 1]} ${ATTRS_PULLED.slice(0, 4)}` : '';
export const OSM_CREDIT = '© OpenStreetMap contributors';

// [key, value, code, words]
const LINES = [
  ['wheelchair', 'yes', 'w', 'Wheelchair accessible'],
  ['wheelchair', 'limited', 'l', 'Partly wheelchair accessible'],
  ['wheelchair', 'no', '', 'Not wheelchair accessible'],
  ['toilet', 'yes', 'r', 'Wheelchair accessible restroom'],
  ['dog', 'yes', 'd', 'Dogs welcome'],
  ['dog', 'no', '', 'No dogs'],
  ['outdoor', 'yes', 'o', 'Outdoor seating'],
  ['outdoor', 'no', '', 'No outdoor seating'],
  ['veg', 'yes', 'v', 'Vegetarian options'],
  ['veg', 'only', 'v', 'Vegetarian only'],
  ['vegan', 'yes', 'n', 'Vegan options'],
  ['vegan', 'only', 'n', 'Vegan only'],
];
export const attrWords = (a) => (a ? LINES.filter(([k, v]) => a[k] === v).map((x) => x[3]) : []);
export const attrCodes = (b) => (b.attrs ? [...new Set(LINES.filter(([k, v, c]) => c && b.attrs[k] === v).map((x) => x[2]))].join('') : '');

const FILTERS = [['w', 'Wheelchair accessible'], ['d', 'Dogs welcome'], ['o', 'Outdoor seating'], ['v', 'Vegetarian options']];
const all = Object.values(ATTRS);
export const ATTR_FILTERS = FILTERS.filter(([c]) => all.some((a) => attrCodes({ attrs: a }).includes(c)));
export const ANY_ATTRS = ATTR_FILTERS.length > 0;

// The short list on a business page, or nothing when mappers recorded nothing.
export function attrBlock(b) {
  const words = attrWords(b.attrs);
  if (!words.length) return '';
  return `<div class="attr-box"><p class="kicker">On the map</p><ul class="attr-list">${words.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>
  <p class="fine">Recorded by OpenStreetMap volunteers, checked ${PULLED_LABEL}. ${OSM_CREDIT}. Not confirmed by the business. Wrong? <a href="https://www.openstreetmap.org/${esc(b.attrs.osm)}" target="_blank" rel="noopener">Fix it on OpenStreetMap</a> or <a href="/owners/?b=${b.slug}&amp;want=fix#claim">tell us</a>.</p></div>`;
}

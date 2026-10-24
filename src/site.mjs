// Shared pieces for the directory pages: header, footer, cards, photos.
import { esc, t } from './layout.mjs';
import { CATEGORIES, AREAS, catBySlug, subBySlug, areaBySlug, directory } from './data/directory.mjs';

// Architecture photography from Wikimedia Commons, hotlinked with credit.
// Every photo is public domain or Creative Commons; see /credits/.
const C = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
export const PHOTOS = {
  firstchristian: { src: C + '5/5c/First_Christian_Church%2C_Columbus%2C_IN.jpg/1280px-First_Christian_Church%2C_Columbus%2C_IN.jpg',
    title: 'First Christian Church', note: 'Eliel Saarinen, 1942', credit: 'T G Hess', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:First_Christian_Church,_Columbus,_IN.jpg', pos: '50% 30%' },
  northchristian: { src: C + 'd/da/North_Christian_Church_%28Columbus%2C_Indiana%29_-_April_2008_-_Holly_Higgins_03.jpg/1280px-North_Christian_Church_%28Columbus%2C_Indiana%29_-_April_2008_-_Holly_Higgins_03.jpg',
    title: 'North Christian Church', note: 'Eero Saarinen, 1964', credit: 'Holly Higgins', license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:North_Christian_Church_(Columbus,_Indiana)_-_April_2008_-_Holly_Higgins_03.jpg', pos: '50% 40%' },
  irwin: { src: C + '7/76/Irwin_Union_Bank_building_in_Columbus%2C_Indiana_LCCN2013650700.tif/lossy-page1-1280px-Irwin_Union_Bank_building_in_Columbus%2C_Indiana_LCCN2013650700.tif.jpg',
    title: 'Irwin Union Bank', note: 'Eero Saarinen, 1954', credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Irwin_Union_Bank_building_in_Columbus,_Indiana_LCCN2013650700.tif', pos: '50% 50%' },
  library: { src: C + '6/69/Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg/1280px-Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg',
    title: 'Cleo Rogers Memorial Library & Large Arch', note: 'I. M. Pei, 1969; Henry Moore, 1971', credit: 'RichardMcCoy', license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Cleo_Rogers_Memorial_Library_and_Moore_Sculpture.jpeg', pos: '50% 55%' },
  courthouse: { src: C + 'd/d2/Bartholomew_County_Courthouse.jpeg/1280px-Bartholomew_County_Courthouse.jpeg',
    title: 'Bartholomew County Courthouse', note: 'Isaac Hodgson, 1874', credit: 'RichardMcCoy', license: 'CC BY-SA 3.0',
    page: 'https://commons.wikimedia.org/wiki/File:Bartholomew_County_Courthouse.jpeg', pos: '50% 35%' },
  cityhall: { src: C + '7/73/Columbus_City_Hall_%28Indiana%29_-_April_2008_-_Holly_Higgins.jpg/1280px-Columbus_City_Hall_%28Indiana%29_-_April_2008_-_Holly_Higgins.jpg',
    title: 'Columbus City Hall', note: 'Edward Charles Bassett, SOM, 1981', credit: 'Holly Higgins', license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Columbus_City_Hall_(Indiana)_-_April_2008_-_Holly_Higgins.jpg', pos: '50% 50%' },
  bridge: { src: C + '9/9b/Stewart-bridge-1933328.jpg/1280px-Stewart-bridge-1933328.jpg',
    title: 'Robert N. Stewart Bridge', note: 'Second Street over the river, 1999', credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Stewart-bridge-1933328.jpg', pos: '50% 50%' },
  miller: { src: C + '1/19/Miller_House_%28Columbus%2C_Indiana%29_-_March_2013_-_Jeff_Hart_03.jpg/1280px-Miller_House_%28Columbus%2C_Indiana%29_-_March_2013_-_Jeff_Hart_03.jpg',
    title: 'Miller House and Garden', note: 'Eero Saarinen and Dan Kiley, 1957', credit: 'Jeff Hart', license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Miller_House_(Columbus,_Indiana)_-_March_2013_-_Jeff_Hart_03.jpg', pos: '50% 60%' },
  firestation: { src: C + 'f/f4/Fire_Station_4%2C_Columbus%2C_Indiana_LCCN2013650708.jpg/1280px-Fire_Station_4%2C_Columbus%2C_Indiana_LCCN2013650708.jpg',
    title: 'Fire Station 4', note: 'Robert Venturi, 1967', credit: 'Carol M. Highsmith, Library of Congress', license: 'Public domain',
    page: 'https://commons.wikimedia.org/wiki/File:Fire_Station_4,_Columbus,_Indiana_LCCN2013650708.jpg', pos: '50% 50%' },
  commons: { src: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/2015_Chaotic_Tuesday.jpg',
    title: 'Chaos I at The Commons', note: 'Jean Tinguely, 1974', credit: 'RichardMcCoy', license: 'CC BY-SA 4.0',
    page: 'https://commons.wikimedia.org/wiki/File:2015_Chaotic_Tuesday.jpg', pos: '50% 40%' },
  aerial: { src: C + 'c/c5/Columbus%2C_Indiana_-_Aerial.jpg/1280px-Columbus%2C_Indiana_-_Aerial.jpg',
    title: 'Columbus from the air', note: 'Downtown and the river', credit: 'formulanone', license: 'CC BY-SA 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Columbus,_Indiana_-_Aerial.jpg', pos: '50% 50%' },
  zaharakos: { src: C + '8/85/Zaharakos_-_July_2011_-_Jellaluna_02.jpg/1280px-Zaharakos_-_July_2011_-_Jellaluna_02.jpg',
    title: 'Zaharakos on Washington Street', note: 'The soda fountain', credit: 'Jellaluna', license: 'CC BY 2.0',
    page: 'https://commons.wikimedia.org/wiki/File:Zaharakos_-_July_2011_-_Jellaluna_02.jpg', pos: '50% 50%' },
};

export const photoCredit = (p) => `${esc(p.title)}. Photo: ${esc(p.credit)}, ${esc(p.license)}`;

const icon = {
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  heart: '<path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.1 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/>',
  phone: '<path d="M6.6 3.5h2.8l1.5 4.2-2.1 1.5a12.5 12.5 0 0 0 6 6l1.5-2.1 4.2 1.5v2.8a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
  share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
  store: '<path d="M4 6h16l-1.5 9H5.5zM4 6 3 3H1M8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
};
export const svg = (k, cls = 'ic') =>
  `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[k]}</svg>`;

const heartLogo = `<svg viewBox="0 0 32 32" class="logo-mark" aria-hidden="true"><path d="M16 28S3 20.2 3 11.6A6.6 6.6 0 0 1 16 8.4a6.6 6.6 0 0 1 13 3.2C29 20.2 16 28 16 28z" fill="var(--brand)" stroke="var(--ink)" stroke-width="2"/><path d="M9 12.5h14M11 16.5h10M13 20.5h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;

export const tel = (p) => 'tel:+1' + p.replace(/\D/g, '');
export const mapsLink = (b) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${b.name}, ${b.address ? b.address + ', ' : ''}Columbus, IN`);

export function header(active = '') {
  const nav = [
    ['explore', '/explore/', 'Explore'],
    ['map', '/explore/?view=map', 'Map'],
    ['areas', '/#neighborhoods', 'Neighborhoods'],
  ];
  return `
<header class="hdr">
  <div class="wrap hdr-row">
    <a href="/" class="logo">${heartLogo}<span>Heart of <em>Columbus</em></span></a>
    <form class="hsearch" action="/explore/" role="search" data-typeahead>
      ${svg('search')}
      <input name="q" type="search" autocomplete="off" placeholder="Tacos, barbers, plumbers, 25th St…" aria-label="Search Columbus businesses">
      <div class="ta-list" data-ta-list hidden></div>
    </form>
    <nav class="hnav" aria-label="Main">
      ${nav.map(([k, h, l]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
      <a href="/saved/" class="saved-link"${active === 'saved' ? ' aria-current="page"' : ''}>${svg('heart')}<span>Saved</span><b data-saved-count hidden>0</b></a>
    </nav>
  </div>
  <nav class="catbar" aria-label="Categories"><div class="wrap catbar-row">
    ${CATEGORIES.map((c) => `<a href="/c/${c.slug}/" class="${active === c.slug ? 'on' : ''}" style="--c:${c.color}">${artIcon(c.slug, c.emoji, 'cb-i')}${esc(c.label)}</a>`).join('')}
  </div></nav>
</header>`;
}

// Category art from /art/ when it exists, with the emoji as the fallback.
export const artIcon = (slug, emoji, cls) =>
  `<span class="${cls}" aria-hidden="true"><img src="/art/cat-${slug}.png" alt="" loading="lazy" onerror="this.remove()"><i>${emoji}</i></span>`;

export function footer() {
  return `
<footer class="ftr">
  <div class="wrap ftr-grid">
    <div>
      <a href="/" class="logo logo-light">${heartLogo}<span>Heart of <em>Columbus</em></span></a>
      <p class="ftr-tag">Independent businesses of Columbus, Indiana. No chains, no franchises, no app fees.</p>
      <p class="ftr-small">A concept preview. Details come from public listings and may change; call ahead. Not affiliated with the businesses listed.</p>
    </div>
    <div><h3>Browse</h3>${CATEGORIES.slice(0, 8).map((c) => `<a href="/c/${c.slug}/">${esc(c.label)}</a>`).join('')}</div>
    <div><h3>More</h3>${CATEGORIES.slice(8).map((c) => `<a href="/c/${c.slug}/">${esc(c.label)}</a>`).join('')}</div>
    <div><h3>Around town</h3>${AREAS.slice(0, 7).map((a) => `<a href="/n/${a.slug}/">${esc(a.label)}</a>`).join('')}<a href="/credits/">Photo credits</a></div>
  </div>
</footer>`;
}

const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const PATTERNS = ['pat-dots', 'pat-arch', 'pat-grid', 'pat-wave', 'pat-ray'];

export function card(b, { compact = false } = {}) {
  const cat = catBySlug[b.cat];
  const sub = subBySlug[b.sub];
  const area = areaBySlug[b.area];
  const pat = PATTERNS[hash(b.slug) % PATTERNS.length];
  const tags = [];
  if (b.demo) tags.push('<span class="tag tag-hot">Order direct (demo)</span>');
  if (b.heritage) tags.push('<span class="tag">Columbus original</span>');
  return `
<article class="bz${compact ? ' bz-compact' : ''}" data-slug="${b.slug}">
  <a class="bz-cover ${pat}" href="/b/${b.slug}/" style="--c:${cat.color};--t:${cat.tint}" tabindex="-1" aria-hidden="true">
    <img class="bz-art" src="/art/cover-${b.sub}.png" alt="" loading="lazy" onerror="this.remove()">
    <span class="bz-emoji">${sub.emoji}</span>
    ${area ? `<span class="bz-area">${svg('pin', 'ic-xs')}${esc(area.label)}</span>` : ''}
  </a>
  <button type="button" class="bz-save" data-save="${b.slug}" aria-pressed="false" aria-label="Save ${esc(b.name)}">${svg('heart')}</button>
  <div class="bz-body">
    <h3 class="bz-name"><a href="/b/${b.slug}/">${t(b.name)}</a></h3>
    <p class="bz-type">${t(b.featured ? sub.label : b.type)}</p>
    ${b.address ? `<p class="bz-addr">${t(b.address)}</p>` : ''}
    ${tags.length ? `<div class="bz-tags">${tags.join('')}</div>` : ''}
  </div>
</article>`;
}

export const rail = (title, href, items, { kicker = '', id = '' } = {}) =>
  items.length
    ? `
<section class="rail"${id ? ` id="${id}"` : ''}>
  <div class="wrap rail-head">
    <div>${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}<h2>${esc(title)}</h2></div>
    ${href ? `<a class="see-all" href="${href}">See all ${svg('arrow', 'ic-sm')}</a>` : ''}
  </div>
  <div class="rail-track-wrap"><div class="rail-track" data-rail>${items.map((b) => card(b, { compact: true })).join('')}</div>
    <button type="button" class="rail-btn prev" data-rail-prev aria-label="Scroll back">‹</button>
    <button type="button" class="rail-btn next" data-rail-next aria-label="Scroll forward">›</button>
  </div>
</section>`
    : '';

// Tiny index the header search and explore page load from /data/directory.json.
export const searchIndex = () =>
  directory.map((b) => ({
    s: b.slug, n: b.name, c: b.cat, u: b.sub, y: b.featured ? subBySlug[b.sub].label : b.type, a: b.address,
    r: b.area, p: b.phone, l: b.ll, d: b.demo ? 1 : 0, h: b.heritage ? 1 : 0, e: subBySlug[b.sub].emoji,
  }));

export const breadcrumbs = (items) =>
  `<nav class="crumbs wrap" aria-label="Breadcrumb">${items
    .map(([href, label], i) => (i < items.length - 1 ? `<a href="${href}">${esc(label)}</a><span>/</span>` : `<span aria-current="page">${esc(label)}</span>`))
    .join('')}</nav>`;

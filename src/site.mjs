// Shared pieces for the directory pages: header, footer, cards, photos.
import { existsSync } from 'node:fs';
import { esc, t, json } from './layout.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { UI as ES, CATEGORY as ES_CAT } from './i18n/es.mjs';
import { CATEGORIES, AREAS, catBySlug, subBySlug, areaBySlug, directory } from './data/directory.mjs';
import { LANDMARKS } from './data/landmarks.mjs';
import { SPOTLIGHT_SLUGS } from './data/spotlight.mjs';

// Cover art for a business type, only when public/art has one for it;
// otherwise the card shows its emoji on the pattern.
export const hasCover = (sub) => existsSync(new URL(`../public/art/cover-${sub}.png`, import.meta.url));
export const coverArt = (sub, lazy = true) =>
  hasCover(sub)
    ? `<img class="bz-art" src="/art/cover-${sub}.png" alt=""${lazy ? ' loading="lazy"' : ''}>`
    : '';

// Architecture photography from Wikimedia Commons, hotlinked with credit.
// Every photo is public domain or Creative Commons; see /credits/. The
// landmark photos live with their landmark in data/landmarks.mjs; PHOTOS is
// the flat view the pages use, plus two scenes that are not landmarks.
const C = 'https://upload.wikimedia.org/wikipedia/commons/thumb/';
export const PHOTOS = {
  ...Object.fromEntries(LANDMARKS.map((l) => [l.slug, { ...l.photo, title: l.name, note: l.note || `${l.architect}, ${l.year}`, landmark: l.slug }])),
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

// lang 'es' swaps the chrome to Spanish; alt is the same page in the other
// language, shown as a switcher link.
export function header(active = '', { lang = 'en', alt = '' } = {}) {
  const es = lang === 'es';
  const L = es ? ES.nav : { visit: 'Visit', explore: 'Explore', order: 'Order & book', map: 'Map', areas: 'Neighborhoods', saved: 'Saved' };
  const nav = [
    ['visit', es ? '/es/visit/' : '/visit/', L.visit],
    ['explore', '/explore/', L.explore],
    ['order', '/order/', L.order],
    ['map', '/explore/?view=map', L.map],
    ['areas', '/#neighborhoods', L.areas],
  ];
  return `
<header class="hdr">
  <div class="wrap hdr-row">
    <a href="/" class="logo">${heartLogo}<span>Heart of <em>Columbus</em></span></a>
    <form class="hsearch" action="/explore/" role="search" data-typeahead>
      ${svg('search')}
      <input name="q" type="search" autocomplete="off" placeholder="${es ? ES.searchPlaceholder : 'Tacos, barbers, plumbers, 25th St…'}" aria-label="${es ? ES.searchLabel : 'Search Columbus businesses'}">
      <div class="ta-list" data-ta-list hidden></div>
    </form>
    <nav class="hnav" aria-label="${es ? 'Principal' : 'Main'}">
      ${nav.map(([k, h, l]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
      ${alt ? `<a href="${alt}" class="lang-link" hreflang="${es ? 'en' : 'es'}" lang="${es ? 'en' : 'es'}">${svg('globe', 'ic-sm')}<span>${es ? ES.switchTo : 'Español'}</span><abbr title="${es ? ES.switchTo : 'Español'}">${es ? 'EN' : 'ES'}</abbr></a>` : ''}
      <a href="/saved/" class="saved-link"${active === 'saved' ? ' aria-current="page"' : ''}>${svg('heart')}<span>${L.saved}</span><b data-saved-count hidden>0</b></a>
    </nav>
  </div>
  <nav class="catbar" aria-label="${es ? 'Categorías' : 'Categories'}"><div class="wrap catbar-row">
    ${CATEGORIES.map((c) => `<a href="/c/${c.slug}/" class="${active === c.slug ? 'on' : ''}" style="--c:${c.color}">${artIcon(c.slug, c.emoji, 'cb-i')}${esc(es ? ES_CAT[c.slug] : c.label)}</a>`).join('')}
  </div></nav>
</header>`;
}

// Category art from /art/ when it exists, with the emoji as the fallback.
export const artIcon = (slug, emoji, cls) =>
  `<span class="${cls}" aria-hidden="true"><img src="/art/cat-${slug}.png" alt="" loading="lazy" onerror="this.remove()"><i>${emoji}</i></span>`;

export function footer({ lang = 'en' } = {}) {
  const es = lang === 'es';
  const cat = (c) => esc(es ? ES_CAT[c.slug] : c.label);
  const k = es ? ES.links : { visit: 'Plan your visit', free: 'Free in Columbus', film: 'The Columbus film trail', architecture: 'Architecture', arts: 'Public art', cummins: 'Cummins and Columbus', holidays: 'Shop small for the holidays', djs: 'Columbus DJs', credits: 'Photo credits', markets: 'Markets', obituaries: 'Obituaries', claim: 'Claim your listing', pickup: 'Take pickup orders', direct: 'Order, book and shop direct' };
  return `
<footer class="ftr">
  <div class="wrap ftr-grid">
    <div>
      <a href="/" class="logo logo-light">${heartLogo}<span>Heart of <em>Columbus</em></span></a>
      <p class="ftr-tag">${es ? ES.footerTag : 'Independent businesses of Columbus, Indiana. No chains, no franchises, no app fees.'}</p>
      <p class="ftr-small">${es ? ES.footerSmall : 'A concept preview. Details come from public listings and may change; call ahead. Not affiliated with the businesses listed.'}</p>
    </div>
    <div><h3>${es ? ES.browse : 'Browse'}</h3>${CATEGORIES.slice(0, 8).map((c) => `<a href="/c/${c.slug}/">${cat(c)}</a>`).join('')}</div>
    <div><h3>${es ? ES.more : 'More'}</h3>${CATEGORIES.slice(8).map((c) => `<a href="/c/${c.slug}/">${cat(c)}</a>`).join('')}<a href="/djs/">${k.djs}</a></div>
    <div><h3>${es ? ES.aroundTown : 'Around town'}</h3>${AREAS.slice(0, 7).map((a) => `<a href="/n/${a.slug}/">${esc(a.label)}</a>`).join('')}<a href="${es ? '/es/visit/' : '/visit/'}">${k.visit}</a><a href="${es ? '/es/free/' : '/free/'}">${k.free}</a><a href="${es ? '/es/film/' : '/film/'}">${k.film}</a><a href="/architecture/">${k.architecture}</a><a href="/arts/">${k.arts}</a><a href="/cummins/">${k.cummins}</a><a href="${es ? '/es/holidays/' : '/holidays/'}">${k.holidays}</a><a href="/markets/">${k.markets}</a><a href="/obituaries/">${k.obituaries}</a><a href="/credits/">${k.credits}</a></div>
    <div><h3>${es ? ES.owners : 'Owners'}</h3><a href="/owners/">${k.claim}</a><a href="/owners/#claim">${k.pickup}</a><a href="/order/">${k.direct}</a></div>
  </div>
</footer>`;
}

const hash = (s) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
const PATTERNS = ['pat-dots', 'pat-arch', 'pat-grid', 'pat-wave', 'pat-ray'];

export function card(b, { compact = false, note = '' } = {}) {
  const cat = catBySlug[b.cat];
  const sub = subBySlug[b.sub];
  const area = areaBySlug[b.area];
  const pat = PATTERNS[hash(b.slug) % PATTERNS.length];
  const tags = [];
  if (SPOTLIGHT_SLUGS.has(b.slug)) tags.push('<span class="tag tag-spot">★ Spotlight</span>');
  if (b.order.length) tags.push('<span class="tag tag-go">Order online</span>');
  if (b.book.length) tags.push('<span class="tag tag-go">Book online</span>');
  if (b.feed || b.store) tags.push('<span class="tag tag-go">Shop online</span>');
  if (b.demo) tags.push('<span class="tag tag-hot">Storefront demo</span>');
  if (b.heritage) tags.push('<span class="tag">Columbus original</span>');
  if (b.dora) tags.push('<span class="tag tag-dora">Social District: drinks to go</span>');
  if (b.tempClosed) tags.push('<span class="tag tag-warn">Temporarily closed</span>');
  return `
<article class="bz${compact ? ' bz-compact' : ''}" data-slug="${b.slug}">
  <a class="bz-cover ${pat}" href="/b/${b.slug}/" style="--c:${cat.color};--t:${cat.tint}" tabindex="-1" aria-hidden="true">
    ${coverArt(b.sub)}
    <span class="bz-emoji">${sub.emoji}</span>
    ${area ? `<span class="bz-area">${svg('pin', 'ic-xs')}${esc(area.label)}</span>` : ''}
  </a>
  <button type="button" class="bz-save" data-save="${b.slug}" aria-pressed="false" aria-label="Save ${esc(b.name)}">${svg('heart')}</button>
  <div class="bz-body">
    <h3 class="bz-name"><a href="/b/${b.slug}/">${t(b.name)}</a></h3>
    <p class="bz-type">${t(b.featured ? sub.label : b.type)}</p>
    ${b.address ? `<p class="bz-addr">${t(b.address)}</p>` : ''}
    ${note ? `<p class="bz-note">${esc(note)}</p>` : ''}
    ${tags.length ? `<div class="bz-tags">${tags.join('')}</div>` : ''}
  </div>
</article>`;
}

export const rail = (title, href, items, { kicker = '', id = '', openOnly = false, note = null, seeAll = 'See all' } = {}) =>
  items.length
    ? `
<section class="rail"${id ? ` id="${id}"` : ''}${openOnly ? ' data-open-rail hidden' : ''}>
  <div class="wrap rail-head">
    <div>${kicker ? `<p class="kicker">${esc(kicker)}</p>` : ''}<h2>${esc(title)}</h2></div>
    ${href ? `<a class="see-all" href="${href}">${esc(seeAll)} ${svg('arrow', 'ic-sm')}</a>` : ''}
  </div>
  <div class="rail-track-wrap"><div class="rail-track" data-rail>${items.map((b) => card(b, { compact: true, note: note ? note(b) : '' })).join('')}</div>
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
    o: b.order.length ? 1 : 0, k: b.book.length ? 1 : 0, f: b.feed || b.store ? 1 : 0,
    ...(b.hours ? { t: b.hours } : {}),
    ...(b.dora ? { z: 1 } : {}),
    ...(hasCover(b.sub) ? { v: 1 } : {}),
  }));

export const breadcrumbs = (items) =>
  `<nav class="crumbs wrap" aria-label="Breadcrumb">${items
    .map(([href, label], i) => (i < items.length - 1 ? `<a href="${href}">${esc(label)}</a><span>/</span>` : `<span aria-current="page">${esc(label)}</span>`))
    .join('')}</nav><script type="application/ld+json">${json(breadcrumbLd(items))}</script>`;

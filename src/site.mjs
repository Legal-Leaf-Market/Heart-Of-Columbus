// Shared pieces for the directory pages: header, footer, cards, photos.
import { esc, t, json } from './layout.mjs';
import { breadcrumbLd } from './jsonld.mjs';
import { UI as ES, CATEGORY as ES_CAT } from './i18n/es.mjs';
import { CATEGORIES, AREAS, catBySlug, subBySlug, areaBySlug, directory } from './data/directory.mjs';
import { LANDMARKS } from './data/landmarks.mjs';
import { SPOTLIGHT_SLUGS } from './data/spotlight.mjs';
import { NEWS_LIVE } from './data/paper.mjs';
import { businessMedia } from './data/media.mjs';
import { attrCodes } from './attrs.mjs';
import { helpDock } from './help-dock.mjs';

// The field-guide sticker family (art-source/stickers/, cut by
// scripts/cut-stickers.py into public/art/sticker-<id>.webp, 320 px square).
// Decorative: alt is empty unless the caller says what it shows. They are
// drawings, never a business's or the city's logo, and never stand in for a
// photo of a real place.
export const CAT_STICKER = {
  restaurants: 'restaurants', 'coffee-sweets': 'coffee-pastry', bars: 'beer-hops', beauty: 'barber',
  shopping: 'shopping', smoke: 'storefront', health: 'health', fitness: 'fitness', pets: 'pets', 'home-services': 'home-services',
  auto: 'auto', pros: 'professional-services', events: 'weddings', kids: 'kids-art',
  'things-to-do': 'things-to-do', makers: 'makers',
};
export const STICKERS = [
  'heart-storefront', 'modernist-skyline', 'coffee-pastry', 'restaurants', 'beer-hops', 'barber',
  'shopping', 'health', 'fitness', 'pets', 'home-services', 'auto',
  'professional-services', 'weddings', 'kids-art', 'things-to-do', 'makers', 'map-heart',
  'taco', 'donut', 'sandwich', 'takeaway', 'breakfast', 'ice-cream',
  'indiana-heart', 'modernist-tower', 'glass-pavilion', 'arch-books', 'covered-bridge', 'storefront',
  'music', 'calendar', 'bicycle', 'park', 'community-heart', 'sun-heart',
];
export const sticker = (id, { size = 96, cls = '', alt = '', lazy = true } = {}) =>
  `<img class="stk${cls ? ' ' + cls : ''}" src="/art/sticker-${id}.webp" width="${size}" height="${size}" alt="${esc(alt)}"${alt ? '' : ' aria-hidden="true"'} decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
export const catSticker = (slug, opts) => sticker(CAT_STICKER[slug] || 'storefront', opts);
import { BUSINESS_ART_SHARDS } from './data/business-art.mjs';
const ILLUSTRATED_BUSINESSES = new Set([
  '4th-street-bar-and-grill',
  'aanartana-arts',
  'aei-fitness-center',
  'ahlmeyer-bakery',
  'ajs-daycare-llc',
  'all-pro-driving-academy-llc',
  'amazing-joes-grill',
  'analytical-engineering-inc',
  'angottis-italian-restaurant',
  'antojitos-yeyes',
  'apna-kitchen',
  'athens-animal-clinic',
  'aubrie-yeh-music-studio',
  'audio-magic-entertainment',
  'bankin-baby-bbq',
  'bark-avenue',
  'bartholomew-county-beverage',
  'bei-bambini',
  'bespoke-events-experiences',
  'best-friends-animal-healthcare',
  'beths-dancenter',
  'bettner-wire-coating-dies-inc',
  'bips-bites',
  'black-jewell-popcorn',
  'black-sheep-craft-pizza-and-cocktails',
  'blackerbys-hangar-5-restaurant',
  'bonafide-bites',
  'boyer-machine-and-tool-co-inc',
  'bright-start-child-care',
  'browns-brazilian-jiu-jitsu',
  'bruncheria-espinoza',
  'busy-bees-academy',
  'camilas-mexican-restaurant',
  'capco-llc',
  'carlos-pizza',
  'ce-systems',
  'center-studio',
  'ceraland-park',
  'chicagos-pizza',
  'china-buffet',
  'chumleys-doghouse',
  'cinlee-services-llc',
  'circle-math-club',
  'coconut-cuties-child-care-llc',
  'columbus-animal-hospital',
  'columbus-bar',
  'columbus-bowling-center',
  'columbus-fit',
  'columbus-greeks-pizzeria',
  'columbus-gymnastics-center',
  'columbus-healthy-zone',
  'columbus-industrial-electric',
  'columbus-limousine',
  'columbus-nutrition',
  'columbus-pet-salon',
  'columbus-veterinary-services',
  'columbus-warehouse-and-cartage',
  'cookie-paradise-llc',
  'country-paws-grooming',
  'cozy-lounge',
  'craft-and-bounce-with-us',
  'creative-tool-and-machining-inc',
  'crossfit-ripcord',
  'crossroads-wedding-co',
  'crowder-and-darnall-inc',
  'crump-center-for-the-performing-arts',
  'cunningham-pattern-and-engineering-inc',
  'd-j-smooth-g',
  'daileys-cnc-machining-llc',
  'dance-by-design',
  'dance-street',
  'dancers-studio-inc',
  'davids-inc',
  'dirty-dogs',
  'district-six-event-space',
  'divine-family-bbq',
  'dog-world-daycare-and-behavior-center',
  'don-r-scheidt-and-co-inc',
  'donut-central',
  'donuts-n-coffee',
  'dorothys-playhouse',
  'driftwood-builders-inc',
  'dubbs-backyard-bbq',
  'dunlap-and-co-inc',
  'e-sushi-japanese-restaurant',
  'el-guacalito-restaurante-nicaraguense',
  'el-mexicano',
  'el-nopal-mexican-cuisine',
  'el-nopal-mexican-cuisine-north',
  'el-popocatepetl-mexican-restaurant-and-grill',
  'empire-tea-services',
  'factory-12-event-loft',
  'faithprep-academy-of-indiana',
  'first-class-catering',
  'for-the-love-of-brunch',
  'force-construction-co-inc',
  'fresh-take-kitchen',
  'gather-columbus',
  'gaylor-inc',
  'gracie-mae-events-llc',
  'grammer-logistics',
  'gramz-bakery-and-cafe',
  'great-wall-chinese-restaurant',
  'grillerz-bar-and-grill-2',
  'grunt-n-gobble',
  'guardian-k9-llc',
  'guardian-kung-fu',
  'guatemex-restaurant',
  'harrison-lake-country-club',
  'henry-social-club',
  'hiker-trailers',
  'hog-molly-brewing-company',
  'homeboyz-fried-chicken-and-fish',
  'hotbox-pizza',
  'icing-on-the-cake-by-kristina',
  'ickle-pickle-magic-inc',
  'imagination-and-dreams',
  'indiana-conservatory-of-music',
  'indiana-road-ready-llc',
  'indiana-sentinels-hockey',
  'indiana-usssa-utrippin-sports-academy',
  'inn-at-irwin-gardens',
  'jills-diner',
  'kidz-first-daycare-and-preschool',
  'kinney-paper-and-chemical-co',
  'kos-martial-arts-academy',
  'koveners-korner-ice-cream',
  'la-guanajuato-grocery-and-restaurant',
  'la-patrona-cantina-and-grill',
  'las-delicias-food-truck',
  'lear-machining-and-waterjet-inc',
  'learning-tree-preschool',
  'legends-alley',
  'lhp-engineering-solutions',
  'little-lambs-child-care',
  'little-seeds-preschool',
  'lucabe-coffee-co-4th-street',
  'lucabe-coffee-co-eastbrook',
  'lucas-brothers-sandwich-shop',
  'lucianas-mexican-restaurant',
  'mancinos-pizza-and-grinders',
  'maple-lisa',
  'masala-magic',
  'master-power-transmission',
  'matty-o-entertainment',
  'meeks-and-company-professional-surveying-inc',
  'micdrop-dj',
  'milestone-design-group-inc',
  'misora',
  'miss-pollys-music-class',
  'miss-rachels-neat-treats',
  'mother-bears-pizza',
  'mutt-tubbs-n-stylin-dogs',
  'my-motorsports',
  'my-whole-kitchen',
  'nancys-creative-cakes-n-bakes',
  'noblitt-fabricating',
  'nutri-bee',
  'ogles-tool-and-party-rentals',
  'olesyas-kitchen',
  'ono-brothers-general-contractors-inc',
  'optimize-u-columbus',
  'otter-creek-bar-and-grill',
  'ozols-construction-corp',
  'p-a-l-boxing',
  'panaderia-la-azteca',
  'papas-grill',
  'party-on-rentals',
  'party-rental-vazquez-llc',
  'percifield-inc',
  'pho-shiki',
  'piepers-gourmet-catering',
  'pig-and-tasty-bbq-food-truck',
  'play-and-learn-childcare',
  'pollert-design-associates-inc',
  'precision-tools-service-inc',
  'pyramid',
  'rabbits-balloons',
  'rainbow-recovery-yoga',
  'ramen-alley',
  'real-world-testing-inc',
  'red-barn-events-of-columbus',
  'refreshable-flavors-llc',
  'riviera-maya',
  'riviera-maya-west',
  'rohdes-family-diner',
  'ru-yi-asian-cuisine',
  'ryoshi-karate-columbus',
  'sabor-de-la-vida',
  'sanctuary-kidscare',
  'savage-distilling',
  'simmons-winery-450-north-brewery',
  'sky-sport-fitness',
  'smallz-ice-cream',
  'sno-biz',
  'sojourn-coffee-company',
  'sonyas-dance-zone',
  'sophea-asian-restaurant',
  'st-paul-lutheran-preschool',
  'strand-associates',
  'studiofit-by-nancy',
  'stunnas',
  'sugar-bayers-cookie-co',
  'sweet-tooth-bakes-by-janet',
  'tacolumbus',
  'tail-twisters-dog-spaw',
  'tailwaggers-grooming-salon',
  'taku-japanese-steakhouse',
  'taqueria-j-and-c',
  'tasty-express',
  'taylor-bros-construction-co-inc',
  'thai-connection',
  'the-annex',
  'the-big-cheese',
  'the-church',
  'the-forge-english-pub',
  'the-gallery-kitchen-and-bar',
  'the-garage-pub-and-grill',
  'the-kroot-corporation',
  'the-landing-at-ceraland',
  'the-nifty-beet',
  'the-nutrition-lounge',
  'the-parts-house-llc',
  'the-phillips-company-inc',
  'the-st-denis-wine-books-and-wonders',
  'the-zen-wellness-company',
  'tipton-lakes-athletic-club',
  'tobar-inc',
  'total-fitness-of-columbus',
  'total-taekwondo',
  'travel-wonderland-by-alice',
  'tribal-blend-cat-cafe',
  'upland-columbus-pump-house',
  'victory-gymnastics-academy',
  'wild-bramble-catering',
  'wilsons-kennel',
  'winnie-mochi-donut',
  'winnie-tea-bar-at-nexuspark',
  'winnie-tea-bar-at-the-commons',
  'yats',
  'ye-olde-fish-house',
  'yee-kee-restaurant',
  'yes-cinema',
  'yoyo-boba-teahouse',
  'yummy-bowl',
  'zaharakos-ice-cream-parlor',
  'ziggies-bar-and-grill',
  'zwanzigz-pizza-and-brewing',
  'zwanzigz-tap-room',
  'rad-play',
]);
export const businessIllustration = (slug, { size = 82 } = {}) => {
  if (ILLUSTRATED_BUSINESSES.has(slug)) {
    const edge = Math.round(size * 1.25);
    return `<img class="business-illustration" src="/art/business-scenes/${slug}.webp" width="${edge}" height="${edge}" style="object-fit:contain;max-width:100%" alt="" loading="lazy" decoding="async">`;
  }
  const shard = BUSINESS_ART_SHARDS[slug];
  if (!shard) return '';
  const file = String(shard).padStart(2, '0');
  return `<svg class="business-illustration" viewBox="0 0 280 360" width="${size}" height="${Math.round(size * 1.286)}" role="img" aria-label="Heart of Columbus field guide illustration"><use href="/art/business-stickers-${file}.svg#biz-${esc(slug)}"></use></svg>`;
};


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
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9.5h18M3 14.8h18M9 9.5V20"/>',
  board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
};
export const svg = (k, cls = 'ic') =>
  `<svg viewBox="0 0 24 24" class="${cls}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon[k]}</svg>`;

const heartLogo = `<svg viewBox="0 0 32 32" class="logo-mark" aria-hidden="true"><path fill="var(--brand)" fill-rule="evenodd" d="M16 29C13 26 3 19 3 11C3 3 12 1 16 8C20 1 29 3 29 11C29 19 19 26 16 29Z M11 23V15C11 8 21 8 21 15V23L18 26V15C18 12 14 12 14 15V26Z"/></svg>`;

export const tel = (p) => 'tel:+1' + p.replace(/\D/g, '');
export const mapsLink = (b) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${b.name}, ${b.address ? b.address + ', ' : ''}Columbus, IN`);

// lang 'es' swaps the chrome to Spanish; alt is the same page in the other
// language, shown as a switcher link.
export function header(active = '', { lang = 'en', alt = '' } = {}) {
  const es = lang === 'es';
  const L = es ? ES.nav : { visit: 'Visit', events: 'Events', explore: 'Explore', order: 'Order & book', map: 'Map', areas: 'Neighborhoods', saved: 'Saved' };
  const nav = [
    ['explore', '/explore/', L.explore],
    ['visit', es ? '/es/visit/' : '/visit/', L.visit],
    ['events', '/events/', L.events],
    ['order', '/order/', L.order],
    ['map', '/explore/?view=map', L.map],
    ['areas', '/#neighborhoods', L.areas],
  ];
  // The newspaper is built and previewable before launch; the link shows once NEWS_LIVE is on.
  if (NEWS_LIVE && !es) nav.unshift(['news', '/news/', 'News']);
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
      <a href="/saved/" class="saved-link" aria-label="${es ? 'Lugares guardados' : 'Saved places'}"${active === 'saved' ? ' aria-current="page"' : ''}>${svg('heart')}<span>${L.saved}</span><b data-saved-count hidden aria-hidden="true">0</b></a>
      <details class="mmenu" data-mmenu>
        <summary>${svg('menu')}<span>${es ? 'Menú' : 'Menu'}</span></summary>
        <div class="mmenu-panel">
          ${nav.map(([k, h, l]) => `<a href="${h}"${k === active ? ' aria-current="page"' : ''}>${l}</a>`).join('')}
          <a href="/saved/"${active === 'saved' ? ' aria-current="page"' : ''}>${L.saved}</a>
          <a href="/owners/">${es ? 'Para dueños' : 'For owners'}</a>
        </div>
      </details>
    </nav>
  </div>
  <nav class="catbar" aria-label="${es ? 'Categorías' : 'Categories'}"><div class="wrap catbar-row">
    ${CATEGORIES.map((c) => `<a href="/c/${c.slug}/" class="${active === c.slug ? 'on' : ''}" style="--c:${c.color}">${artIcon(c.slug, c.emoji, 'cb-i')}${esc(es ? ES_CAT[c.slug] : c.label)}</a>`).join('')}
  </div></nav>
</header>`;
}

// Category icon: one line drawing per category (public/art/icon-<slug>.svg),
// with the emoji as the fallback if the file is missing.
export const artIcon = (slug, emoji, cls) =>
  `<span class="${cls}" aria-hidden="true"><img width="24" height="24" decoding="async" src="/art/icon-${slug}.svg" alt="" loading="lazy" onerror="this.remove()"><i>${emoji}</i></span>`;

// "Heart of Columbus: Newspaper" in the footer: every page made of articles
// (news and its sections, history, obituaries, letters, notices, meetings,
// markets, the newsletter). Guides and places stay under "Around town".
const PAPER_LINKS = [
  ['/news/', 'Latest news', 'Noticias (en inglés)'],
  ['/news/local/', 'Local', 'Local (en inglés)'],
  ['/news/business/', 'Business', 'Negocios (en inglés)'],
  ['/news/food/', 'Food', 'Comida (en inglés)'],
  ['/news/faith/', 'Faith', 'Fe (en inglés)'],
  ['/news/sports/', 'Sports', 'Deportes (en inglés)'],
  ['/news/opinion/', 'Opinion', 'Opinión (en inglés)'],
  ['/history/', 'Columbus history', 'Historia de Columbus (en inglés)'],
  ['/obituaries/', 'Obituaries', 'Obituarios (en inglés)'],
  ['/letters/', 'Letters to the editor', 'Cartas al editor (en inglés)'],
  ['/notices/', 'Public notices', 'Avisos públicos (en inglés)'],
  ['/meetings/', 'Public meetings', 'Reuniones públicas (en inglés)'],
  ['/markets/', 'Markets', 'Mercados (en inglés)'],
  ['/newsletter/', 'The newsletter', 'El boletín (en inglés)'],
  ['/tips/', 'Send a tip', 'Envíe un dato (en inglés)'],
];

export function footer({ lang = 'en' } = {}) {
  const es = lang === 'es';
  const cat = (c) => esc(es ? ES_CAT[c.slug] : c.label);
  const k = es ? ES.links : { visit: 'Plan your visit', events: 'Local events', free: 'Free in Columbus', film: 'The Columbus film trail', architecture: 'Architecture', arts: 'Public art', cummins: 'Cummins and Columbus', holidays: 'Shop small for the holidays', djs: 'Columbus DJs', plan: 'Plan an event', credits: 'Photo credits', ag: 'Farm country and 4-H', markets: 'Markets', obituaries: 'Obituaries', sports: 'Sports', history: 'Columbus history', skate: 'The skate park', claim: 'Claim your listing', pickup: 'Take pickup orders', direct: 'Order, book and shop direct', founders: 'Founders Club' };
  return `
<footer class="ftr">
  <div class="wrap ftr-grid">
    <div>
      <img class="ftr-stk" src="/art/sticker-community-heart.webp" width="72" height="72" alt="" aria-hidden="true" loading="lazy" decoding="async">
      <a href="/" class="logo logo-light">${heartLogo}<span>Heart of <em>Columbus</em></span></a>
      <p class="ftr-tag">${es ? ES.footerTag : 'Independent businesses of Columbus, Indiana. Owner-run and local. Spot a chain? Tell us and it comes off.'}</p>
      <p class="ftr-small">${es ? ES.footerSmall : 'Details come from public listings and may change; call ahead. Not affiliated with the businesses listed.'}</p>
    </div>
    <div><h3>${es ? ES.browse : 'Browse'}</h3>${CATEGORIES.slice(0, 8).map((c) => `<a href="/c/${c.slug}/">${cat(c)}</a>`).join('')}</div>
    <div><h3>${es ? ES.more : 'More'}</h3>${CATEGORIES.slice(8).map((c) => `<a href="/c/${c.slug}/">${cat(c)}</a>`).join('')}<a href="/djs/">${k.djs}</a><a href="/plan/">${k.plan}</a></div>
    <div><h3>${es ? ES.aroundTown : 'Around town'}</h3>${AREAS.slice(0, 7).map((a) => `<a href="/n/${a.slug}/">${esc(a.label)}</a>`).join('')}<a href="${es ? '/es/visit/' : '/visit/'}">${k.visit}</a><a href="/events/">${k.events}</a><a href="${es ? '/es/free/' : '/free/'}">${k.free}</a><a href="${es ? '/es/film/' : '/film/'}">${k.film}</a><a href="/trails/">${es ? 'Rutas con sellos (en inglés)' : 'Stamp trails'}</a><a href="${es ? '/es/skate/' : '/skate/'}">${k.skate}</a><a href="/architecture/">${k.architecture}</a><a href="/arts/">${k.arts}</a><a href="/cummins/">${k.cummins}</a><a href="${es ? '/es/holidays/' : '/holidays/'}">${k.holidays}</a><a href="/agriculture/">${k.ag}</a><a href="/sports/">${k.sports}</a><a href="/help/">${es ? 'Ayuda en Columbus (en inglés)' : 'Get help in Columbus'}</a><a href="/credits/">${k.credits}</a><a href="/stickers/">${es ? 'Las calcomanías' : 'The sticker set'}</a></div>
    <div class="ftr-paper"><h3>Heart of Columbus: Newspaper</h3>${PAPER_LINKS.map(([href, en, sp]) => `<a href="${href}">${es ? sp : en}</a>`).join('')}</div>
    <div><h3>${es ? ES.owners : 'Owners'}</h3><a href="/owners/">${k.claim}</a><a href="/owners/#claim">${k.pickup}</a><a href="/founders-club/">${k.founders}</a><a href="/order/">${k.direct}</a></div>
  </div>
</footer>${helpDock({ lang })}`;
}


// A photo that fails to load turns its card text-only once; no placeholder.
export const MEDIA_FAIL = "var c=this.closest('[data-media]');if(c){c.setAttribute('data-media','none')}this.parentNode.removeChild(this)";

// A business card. Text first: the category and neighborhood, the name, what
// it is, the address, the open-now status and the tags. A real photo of that
// business appears only when businessMedia() approves one; otherwise the
// card has no image region at all (docs/redesign/CLAUDE_DEEP_REDESIGN.md).
export function card(b, { compact = false, note = '' } = {}) {
  const cat = catBySlug[b.cat];
  const sub = subBySlug[b.sub];
  const area = areaBySlug[b.area];
  const tags = [];
  if (b.member) tags.push('<span class="tag tag-member" title="Pays Heart of Columbus for a website and a featured spot">★ Founding Member</span>');
  if (SPOTLIGHT_SLUGS.has(b.slug)) tags.push('<span class="tag tag-spot">★ Spotlight</span>');
  if (b.order.length) tags.push('<span class="tag tag-go">Order online</span>');
  if (b.book.length) tags.push('<span class="tag tag-go">Book online</span>');
  if (b.feed || b.store) tags.push('<span class="tag tag-go">Shop online</span>');
  if (b.demo) tags.push('<span class="tag tag-hot">Storefront demo</span>');
  if (b.heritage) tags.push('<span class="tag">Columbus original</span>');
  if (b.dora) tags.push('<span class="tag tag-dora">Social District: drinks to go</span>');
  if (b.added?.soon) tags.push('<span class="tag tag-hot">Coming soon</span>');
  if (b.tempClosed) tags.push('<span class="tag tag-warn">Temporarily closed</span>');
  return `
<article class="bz${compact ? ' bz-compact' : ''}" data-slug="${b.slug}" data-media="art" style="--t:${cat.tint}">
  <a class="bz-artwork" href="/b/${b.slug}/" tabindex="-1" aria-hidden="true" style="display:flex;align-items:center;justify-content:center;overflow:hidden;height:${compact ? 148 : 188}px;background:var(--t);border-radius:14px 14px 0 0">${businessIllustration(b.slug, { size: compact ? 112 : 146 })}</a>
  <div class="bz-body">
    <div class="bz-top">
      <p class="bz-meta">${esc(cat.label)}${area ? `<span class="bz-area">${svg('pin', 'ic-xs')}${esc(area.label)}</span>` : ''}</p>
      <button type="button" class="bz-save" data-save="${b.slug}" aria-pressed="false" aria-label="Save ${esc(b.name)}">${svg('heart')}</button>
    </div>
    <h3 class="bz-name"><a href="/b/${b.slug}/">${t(b.name)}</a></h3>
    <p class="bz-type">${t(b.featured ? sub.label : b.type)}</p>
    ${b.address ? `<p class="bz-addr">${t(b.address)}</p>` : ''}
    <p class="bz-status" data-open-slot>${b.hours ? '' : '<span class="bz-nohours">Hours not listed. Call ahead.</span>'}</p>
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
// A type that is really a category label ("Coffee, Bakeries & Sweets") says
// nothing about the place itself, so search ranks it below a specific one
// ("Coffee shop"). `g` marks it. It only ever lowers a score; it hides nothing.
const genericType = (b) => b.featured || /, [^,]+ & /.test(b.type);
export const searchIndex = () =>
  directory.map((b) => ({
    ...(genericType(b) ? { g: 1 } : {}),
    ...(businessMedia(b.slug).state === 'photo' ? { i: businessMedia(b.slug).src } : {}),
    s: b.slug, n: b.name, c: b.cat, u: b.sub, y: b.featured ? subBySlug[b.sub].label : b.type, a: b.address,
    r: b.area, p: b.phone, l: b.ll, d: b.demo ? 1 : 0, h: b.heritage ? 1 : 0, e: subBySlug[b.sub].emoji,
    o: b.order.length ? 1 : 0, k: b.book.length ? 1 : 0, f: b.feed || b.store ? 1 : 0,
    ...(b.hours ? { t: b.hours } : {}),
    ...(b.dora ? { z: 1 } : {}),
    ...(b.also && b.also.length ? { xc: b.also.map((a) => [a.cat, a.sub]) } : {}),
    ...(b.pin === 'approx' ? { q: 1 } : {}),
    ...(b.member ? { m: 1 } : {}),
    ...(attrCodes(b) ? { x: attrCodes(b) } : {}),
  }));

export const breadcrumbs = (items) =>
  `<nav class="crumbs wrap" aria-label="Breadcrumb">${items
    .map(([href, label], i) => (i < items.length - 1 ? `<a href="${href}">${esc(label)}</a><span>/</span>` : `<span aria-current="page">${esc(label)}</span>`))
    .join('')}</nav><script type="application/ld+json">${json(breadcrumbLd(items))}</script>`;

export { websiteAction } from './website.mjs';

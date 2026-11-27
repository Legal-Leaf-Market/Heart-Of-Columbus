import { page, esc, t } from '../layout.mjs';
import { catBySlug, directory, inSection, subBySlug } from '../data/directory.mjs';
import { stories } from '../news/content.mjs';
import { sectionBySlug } from '../news/sections.mjs';
import { storyBody } from './news-pages.mjs';
import { businessIllustration, catSticker } from '../site.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { worshipGroups } from './worship-pages.mjs';
import { nonprofitGroups } from './nonprofits-pages.mjs';
import { NONPROFITS_SOURCE } from '../data/nonprofits.mjs';
import { SOURCES } from '../data/events.mjs';
import { ROLES, TRACKS, vendorsFor } from '../data/plan.mjs';
import { roleSection, plannerControls } from './plan-pages.mjs';
import { addDays, handEntered, inWindow, today, webDate } from '../event-feeds.mjs';

const apps = {
  news: {
    id: '/news/', manifest: '/news/manifest.webmanifest', icon: 'news',
    name: 'Heart of Columbus', description: 'The Heart of Columbus newspaper, with local news for Columbus, Indiana.',
    theme: '#233a50', background: '#faf6ed',
  },
  food: {
    id: '/order/', manifest: '/order/manifest.webmanifest', icon: 'order',
    name: 'Columbus Food', description: 'Find local food and order directly from Columbus restaurants.',
    theme: '#6b3b28', background: '#fff8eb',
  },
  contractors: {
    id: '/apps/contractors/', manifest: '/apps/contractors/manifest.webmanifest', icon: 'contractors',
    name: 'Columbus Contractors', description: 'Find and contact local tradespeople in Columbus, Indiana.',
    theme: '#2b4539', background: '#f5f5e9',
  },
  churches: {
    id: '/apps/churches/', manifest: '/apps/churches/manifest.webmanifest', icon: 'churches',
    name: 'Columbus Churches', description: 'Find churches and places of worship near Columbus, Indiana.',
    theme: '#51405f', background: '#f8f3fb',
  },
  nonprofits: {
    id: '/apps/nonprofits/', manifest: '/apps/nonprofits/manifest.webmanifest', icon: 'nonprofits',
    name: 'Columbus Nonprofits', description: 'Find charities and civic groups serving the Columbus area.',
    theme: '#793b4b', background: '#fdf4f3',
  },
  weddings: {
    id: '/apps/weddings/', manifest: '/apps/weddings/manifest.webmanifest', icon: 'weddings',
    name: 'Weddings & Events', description: 'Build a local vendor team for a wedding, corporate event or private party.',
    theme: '#67374d', background: '#fcf4f7',
  },
  events: {
    id: '/apps/events/', manifest: '/apps/events/manifest.webmanifest', icon: 'events',
    name: 'Columbus Events', description: 'Find upcoming library, parks, arts and community events around Columbus.',
    theme: '#30516a', background: '#f1f7fb',
  },
};

const APP_LINKS = [
  ['news', 'Heart of Columbus', 'Local newspaper'],
  ['food', 'Food', 'Find a menu or order pickup'],
  ['contractors', 'Contractors', 'Find a trade and call'],
  ['churches', 'Churches', 'Find a place of worship'],
  ['nonprofits', 'Nonprofits', 'Find charities and civic groups'],
  ['weddings', 'Weddings & Events', 'Build your vendor team'],
  ['events', 'Events', 'See what’s coming up'],
];
const root = (key) => `/apps/${key}/`;
const iconPath = (app, size) => `/art/${app.icon}-app-icon-${size}.png`;

export function appLauncher() {
  return `<nav class="hoc-app-launcher" aria-labelledby="columbus-apps-title">
  <h2 id="columbus-apps-title">Columbus apps</h2>
  <ul>${APP_LINKS.map(([key, label, description]) => `<li><a href="${root(key)}">
    <img src="${iconPath(apps[key], 180)}" width="32" height="32" alt="" loading="lazy">
    <span><strong>${esc(label)}</strong><small>${esc(description)}</small></span>
  </a></li>`).join('')}</ul>
</nav>`;
}

function manifest(key, app) {
  return JSON.stringify({
    id: app.id, name: app.name, short_name: app.name, description: app.description,
    start_url: root(key), scope: root(key), display: 'standalone',
    background_color: app.background, theme_color: app.theme,
    icons: [192, 512].map((size) => ({
      src: iconPath(app, size), sizes: `${size}x${size}`, type: 'image/png', purpose: 'any',
    })),
  }, null, 2);
}

function worker(key) {
  const home = root(key);
  const fallback = key === 'food' ? home + 'offline.html' : home;
  return `const HOME = ${JSON.stringify(home)};
const FALLBACK = ${JSON.stringify(fallback)};
const PREFIX = 'hoc-app-${key}-';
const CACHE = PREFIX + 'v1';
const LIVE_ONLY = ${key === 'food'};
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add(FALLBACK)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith(PREFIX) && key !== CACHE).map((key) => caches.delete(key)),
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate' && url.pathname.startsWith(HOME)) {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (!LIVE_ONLY && response.ok) {
          await cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch {
        return (!LIVE_ONLY && await cache.match(request)) || await cache.match(FALLBACK) || Response.error();
      }
    }));
  } else if (['style', 'script', 'font', 'image'].includes(request.destination)
    && /^\\/(?:art|img|css|js|assets|fonts)\\//.test(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone()).catch(() => {});
      return response;
    }));
  }
});
`;
}

function retiredWorker(key) {
  return `self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => key.startsWith('hoc-${key}-')).map((key) => caches.delete(key)),
  )).then(() => self.registration.unregister()));
});
`;
}

function appPage({ assets, key, path = root(key), title, body, article = false, planner = false, commerce = false }) {
  const app = apps[key];
  const backLabel = article ? 'All stories' : planner && path !== root(key) ? 'All vendors' : commerce && path !== root(key) ? 'All food listings' : '';
  const back = backLabel ? `<a class="focus-back" data-app-back href="${root(key)}">← ${backLabel}</a>` : '';
  return page({
    // The news app shares the site's name, so its copy of a story says app,
    // or it would carry the same title as the story page itself.
    title: title ? `${title} | ${app.name}${key === 'news' ? ' app' : ''}` : app.name,
    description: app.description,
    assets, path, theme: `focus-app focus-${key}`, showAlert: false,
    styles: [...(article ? ['hoc.css', 'newsprint.css'] : planner || commerce ? ['hoc.css'] : []), 'focus-app.css'],
    scripts: ['app-install.js', ...(planner ? ['plan.js'] : []), ...(commerce ? ['cart.js'] : [])],
    head: `<link rel="manifest" href="${app.manifest}">
<meta name="theme-color" content="${app.theme}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${esc(app.name)}">
<link rel="apple-touch-icon" href="${iconPath(app, 180)}">`,
    body: `<header class="focus-top">
  <div class="focus-wrap focus-top-row">
    <p class="focus-brand"><img src="${iconPath(app, 180)}" alt="" width="34" height="34">${esc(app.name)}</p>
    <button type="button" class="focus-install" data-app-install aria-controls="install-hint" aria-expanded="false" hidden>Install app</button>
    ${back}
  </div>
  <p class="focus-wrap focus-install-hint" id="install-hint" data-app-install-hint hidden>Open your browser menu and look for Install app or Add to Home Screen.</p>
</header>
<main id="main"${article ? ' class="focus-article np"' : ''}>${body}</main>`,
  });
}

const filterConfig = {
  news: { category: 'Section', quick: true, sorts: [['date', 'Newest first']] },
  food: { category: 'Cuisine or shop type', quick: ['restaurants', 'coffee-sweets', 'bars', 'markets'],
    facets: [['online', 'Order online'], ['catalog', 'Has products or menu']], sorts: [['rank', 'Catalogs and ordering first']] },
  contractors: { category: 'Trade', quick: true, facets: [['phone', 'Has phone'], ['website', 'Has website']],
    sorts: [['rank', 'More contact options first']] },
  churches: { category: 'Tradition', facets: [['services', 'Service information'], ['directions', 'Has directions']],
    sorts: [['rank', 'Service information first']] },
  nonprofits: { category: 'Cause', quick: ['help', 'health', 'youth', 'arts', 'community'], facets: [['columbus', 'Columbus only']] },
  events: { category: 'Organizer', facets: [['today', 'Today'], ['weekend', 'This weekend'], ['music', 'Live music']],
    sorts: [['date', 'Soonest first']] },
  weddings: { category: 'Vendor service', facets: [['booking', 'Book online'], ['phone', 'Has phone']],
    sorts: [['rank', 'Online booking first']] },
};

function searchForm(key, label, options, tracks = []) {
  const config = filterConfig[key];
  const chips = config.quick === true ? options.slice(0, 5) : (config.quick || []).flatMap((slug) => options.filter((option) => option.slug === slug));
  const chip = (type, value, title, pressed = false) =>
    `<button type="button" class="focus-chip" data-app-chip="${type}" data-value="${esc(value)}" aria-pressed="${pressed}">${esc(title)}</button>`;
  return `<section class="focus-search-panel" aria-label="Search and filters" data-app-filters="${key}">
  <label class="focus-field focus-search-box"><span>Search</span><input type="search" data-app-search placeholder="${esc(label)}"></label>
  
  ${tracks.length || chips.length ? `<div class="focus-chips" role="group" aria-label="${tracks.length ? 'Event type' : config.category}">
    ${tracks.length ? chip('track', '', 'All event types', true) + tracks.map(({ slug, label }) => chip('track', slug, label)).join('')
      : chip('category', '', 'All', true) + chips.map(({ slug, label }) => chip('category', slug, label)).join('')}
  </div>` : ''}
  ${config.facets?.length ? `<div class="focus-chips" role="group" aria-label="Quick filters">${config.facets.map(([value, label]) => chip('facet', value, label)).join('')}</div>` : ''}
  <details class="focus-filter-details" data-app-filter-details open>
    <summary>Filters <span class="focus-filter-count" data-app-filter-count hidden></span></summary>
    <div class="focus-filter">
    <label class="focus-field"><span>${config.category}</span><select data-app-category>
      <option value="">Any ${config.category.toLowerCase()}</option>
      ${options.map(({ slug, label, tracks }) => `<option value="${esc(slug)}"${tracks ? ` data-tracks="${esc(tracks.join(' '))}"` : ''}>${esc(label)}</option>`).join('')}
    </select></label>
    <label class="focus-field"><span>Sort by</span><select data-app-sort>
      <option value="">Best match</option>
      ${(config.sorts || []).map(([value, title]) => `<option value="${value}">${title}</option>`).join('')}
      <option value="az">A to Z</option>
      <option value="za">Z to A</option>
    </select></label>
    </div>
  </details>
  <button type="button" class="focus-clear" data-app-clear hidden>Clear filters</button>
</section>`;
}

function listing({ key, heading, description, placeholder, filters, cards, events = false, source = '' }) {
  return `<div class="focus-wrap focus-content">
  <h1>${esc(heading)}</h1>
  <p class="focus-intro">${esc(description)}</p>
  ${searchForm(key, placeholder, filters)}
  <p class="focus-count" role="status" data-app-count>${cards.length} results</p>
  ${events ? '<p class="focus-count" role="status" data-app-event-status>Checking the latest event listings…</p>' : ''}
  <div class="focus-grid" data-app-results${events ? ' data-app-events' : ''}>${cards.join('')}</div>
  <p class="focus-empty" data-app-empty hidden>No matches. Try another search or category.</p>
  ${source ? `<p class="focus-source">${source}</p>` : ''}
</div>`;
}

function external(url, label, primary = false) {
  if (!/^https?:\/\//i.test(url || '')) return '';
  return `<a class="focus-action${primary ? ' focus-primary' : ''}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)} <span aria-hidden="true">↗</span></a>`;
}

function call(phone) {
  const number = String(phone ?? '').replace(/\D/g, '');
  return number.length === 10 || (number.length === 11 && number.startsWith('1'))
    ? `<a class="focus-action" href="tel:+${number.length === 10 ? '1' : ''}${number}">Call</a>` : '';
}

function directoryCard(business, category, categoryLabel, actions, { content = '', tracks = null, art = '', facets = [], rank = 0, date = '', until = '' } = {}) {
  const planner = tracks ? ` data-slug="${esc(business.slug)}" data-name="${esc(business.name)}" data-tracks="${esc(tracks.join(' '))}"` : '';
  const pick = tracks ? '<button type="button" class="focus-action focus-pick" data-pick aria-pressed="false" hidden>Select vendor</button>' : '';
  return `<article class="focus-card${tracks ? ' pl-item' : ''}${art ? ' focus-card-art' : ''}"${planner} data-app-item data-title="${esc(business.name)}" data-tags="${esc(categoryLabel)}" data-category="${esc(category)}" data-facets="${esc(facets.join(' '))}" data-rank="${rank}"${date ? ` data-date="${esc(date)}" data-until="${esc(until || date)}"` : ''} data-search="${esc([business.name, business.type, business.address, categoryLabel].filter(Boolean).join(' '))}">
  ${art}
  <p class="focus-category">${esc(categoryLabel)}</p>
  <h2>${t(business.name)}</h2>
  ${business.type ? `<p>${t(business.type)}</p>` : ''}
  ${business.address ? `<p class="focus-address">${t(business.address)}</p>` : ''}
  ${content}
  <div class="focus-actions">${actions}</div>
  ${pick}
</article>`;
}

function foodArtwork(business, accent) {
  const art = businessIllustration(business.slug, { size: 130 }) || catSticker(business.cat, { size: 100 });
  return `<div class="focus-food-art" style="--food-tint:${esc(accent)}" aria-hidden="true">${art}</div>`;
}

function foodCatalog(business) {
  if (business.snap?.kind === 'menu') return 'menu';
  if (business.feed || business.snap?.kind === 'shop') return 'products';
  return '';
}

function foodActions(business) {
  const orders = business.order.map(({ url, label }) =>
    external(url, business.order.length === 1 ? 'Order direct' : `Order via ${label}`, true)).join('');
  return orders + call(business.phone) + (!orders ? external(business.website, 'Website') : '');
}

function foodPages(assets) {
  const categories = ['restaurants', 'coffee-sweets', 'bars', 'markets'];
  const filters = [...categories.map((slug) => ({ slug, label: slug === 'markets' ? 'Specialty food' : catBySlug[slug].label })), ...catBySlug.restaurants.subs];
  const entries = directory.filter((b) => !b.tempClosed && (categories.includes(b.cat) || b.sub === 'markets'))
    .map((business) => ({
      business, kind: foodCatalog(business), category: business.sub === 'markets' ? 'markets' : business.cat,
      info: subBySlug[business.sub]?.label || catBySlug[business.cat].label,
      actions: foodActions(business),
    })).filter(({ kind, actions }) => kind || actions);
  entries.sort((x, y) => Number(Boolean(y.kind)) - Number(Boolean(x.kind)));
  const cards = entries.map(({ business, kind, category, info, actions }) => {
    const link = kind ? `<a class="focus-action focus-primary" href="${root('food')}${esc(business.slug)}/">${kind === 'products' ? 'Browse products' : 'See menu'}</a>` : '';
    const online = business.order.some(({ url }) => /^https?:\/\//i.test(url || ''));
    return directoryCard(business, [...new Set([category, business.sub].filter(Boolean))].join(' '), info, link + actions, {
      art: foodArtwork(business, catBySlug[business.cat].tint), facets: [online && 'online', kind && 'catalog'].filter(Boolean),
      rank: Number(Boolean(kind)) * 2 + Number(online),
    });
  });
  return [
    { path: 'apps/food/index.html', html: appPage({ assets, key: 'food', commerce: true, body: listing({
      key: 'food',
      heading: 'Find food in Columbus', description: 'Browse local restaurants and shops, see what they sell, and order directly.',
      placeholder: 'Restaurant, cuisine or address', filters, cards,
    }) }) },
    ...entries.filter(({ kind }) => kind).map(({ business, kind, info, actions }) => {
      const path = root('food') + business.slug + '/';
      const menu = `<details open class="focus-menu" data-app-menu="${esc(business.slug)}"><summary>Menu</summary><div data-menu-content></div></details>`;
      const shop = `<div data-shop="${esc(business.slug)}" data-name="${esc(business.name)}" data-full-catalog${business.snap?.kind === 'shop' ? ` data-snap="${esc(business.snap.checked)}"` : ''}${business.feed ? ' data-live' : ''} data-address="${esc(business.address)}"><p role="status">Loading products…</p></div>`;
      const body = `<div class="focus-wrap focus-content focus-food-catalog">
  <header class="focus-catalog-head">
    ${foodArtwork(business, catBySlug[business.cat].tint)}
    <div><p class="focus-category">${esc(info)}</p><h1>${t(business.name)}</h1>
      ${business.address ? `<p class="focus-address">${t(business.address)}</p>` : ''}
      <div class="focus-actions">${actions}</div>
    </div>
  </header>
  ${kind === 'menu' ? menu : shop}
</div>`;
      return { path: path.slice(1) + 'index.html', html: appPage({ assets, key: 'food', path, title: business.name, body, commerce: true }) };
    }),
  ];
}

function contactFacets(business) {
  return [call(business.phone) && 'phone', external(business.website, 'Website') && 'website'].filter(Boolean);
}

function contractorsPage(assets) {
  const filters = catBySlug['home-services'].subs.filter(({ slug }) => slug !== 'laundry');
  const cards = directory.filter((b) => !b.tempClosed).flatMap((b) => {
    const trades = filters.filter(({ slug }) => inSection(b, 'home-services', slug));
    if (!trades.length) return [];
    const contact = call(b.phone) + external(b.website, 'Website');
    const facets = contactFacets(b);
    return contact ? [directoryCard(b, trades.map((trade) => trade.slug).join(' '),
      trades.map((trade) => trade.label).join(' · '), contact, { facets, rank: facets.length })] : [];
  });
  return appPage({ assets, key: 'contractors', body: listing({
      key: 'contractors',
    heading: 'Find a local contractor', description: 'Search by trade, then call or visit the contractor’s own website.',
    placeholder: 'Roofing, plumbing or business name', filters, cards,
  }) });
}

const cleanName = (name) => String(name || '').replace(/\s+[-–—]\s+/g, ', ');

function churchesPage(assets) {
  const groups = worshipGroups();
  const cards = groups.flatMap(({ id, name, rows }) => rows.map((church) => {
    const address = church.address || church.town;
    const map = church.ll ? `https://www.google.com/maps/search/?api=1&query=${church.ll.join(',')}` : '';
    const website = external(church.website, 'Service times', true);
    return directoryCard({ name: cleanName(church.name), address }, id, name,
      website + call(church.phone) + external(map, 'Directions'), {
        facets: [website && 'services', map && 'directions'].filter(Boolean),
        rank: Number(Boolean(website)) * 2 + Number(Boolean(map)),
      });
  }));
  return appPage({ assets, key: 'churches', body: listing({
      key: 'churches',
    heading: 'Find a place of worship', description: 'Browse local congregations by tradition or town. Check with the congregation for current service times.',
    placeholder: 'Congregation, tradition or town',
    filters: groups.map(({ id, name }) => ({ slug: id, label: name })), cards,
    source: 'Map data © OpenStreetMap contributors.',
  }) });
}

function nonprofitsPage(assets) {
  const groups = nonprofitGroups();
  const cards = groups.flatMap(({ id, name, rows }) => rows.map((org) =>
    directoryCard({ name: cleanName(org.name), address: org.town }, id, name,
      external(`https://projects.propublica.org/nonprofits/organizations/${encodeURIComponent(org.ein)}`, 'View public filings'), { facets: /^columbus$/i.test(org.town?.trim() || '') ? ['columbus'] : [] })));
  return appPage({ assets, key: 'nonprofits', body: listing({
      key: 'nonprofits',
    heading: 'Find a local nonprofit', description: 'Search local charities, clubs and civic groups by the work they do.',
    placeholder: 'Organization, cause or town',
    filters: groups.map(({ id, name }) => ({ slug: id, label: name })), cards,
    source: 'Source: ' + external(NONPROFITS_SOURCE, 'IRS Exempt Organizations Business Master File'),
  }) });
}

function vendorActions(b) {
  return external(b.book[0]?.url, 'Book online', true) + external(b.order[0]?.url, 'Order direct', true)
    + call(b.phone) + external(b.website, 'Website')
    + (b.store !== b.website ? external(b.store, 'Shop online') : '');
}

function weddingVendorDirectory() {
  const roleKeys = [...new Set(TRACKS.flatMap((track) => track.roles))];
  const filters = roleKeys.map((slug) => ({
    slug, label: ROLES[slug].label, tracks: TRACKS.filter((track) => track.roles.includes(slug)).map((track) => track.slug),
  }));
  const vendors = new Map();
  for (const role of filters) {
    for (const business of vendorsFor(role.slug)) {
      if (business.tempClosed) continue;
      if (!vendors.has(business.slug)) vendors.set(business.slug, { business, roles: [], tracks: new Set() });
      const vendor = vendors.get(business.slug);
      vendor.roles.push(role);
      for (const track of role.tracks) vendor.tracks.add(track);
    }
  }
  const cards = [...vendors.values()].sort((x, y) => x.business.name.localeCompare(y.business.name))
    .map(({ business, roles, tracks }) => directoryCard(business,
      roles.map((role) => role.slug).join(' '), roles.map((role) => role.label).join(' · '), vendorActions(business), {
        tracks: [...tracks],
        facets: [external(business.book[0]?.url, 'Book online') && 'booking', call(business.phone) && 'phone'].filter(Boolean),
        rank: external(business.book[0]?.url, 'Book online') ? 1 : 0,
      }));
  return { filters, cards };
}

function weddingsPages(assets) {
  const base = root('weddings');
  const { filters, cards } = weddingVendorDirectory();
  const body = `<div class="pl-page" data-plan="vendors" data-plan-focused data-plan-import="${TRACKS.map((track) => track.slug).join(' ')}">
  <div class="focus-wrap focus-content">
    <h1>Find local wedding and event vendors</h1>
    ${searchForm('weddings', 'Vendor, service or address', filters, TRACKS)}
    <div class="focus-results-row">
      <p class="focus-count" role="status" data-app-count>${cards.length} results</p>
      <button type="button" class="focus-action focus-bulk" data-plan-select-all hidden>Select all results</button>
    </div>
    <section class="pl-role focus-grid" data-app-results data-role="vendors" data-role-label="Vendors" aria-label="Vendors">${cards.join('')}</section>
    <p class="focus-empty" data-app-empty hidden>No matches. Try a different search or filter.</p>
  </div>
  ${plannerControls({ label: 'Events' }, { focused: true })}
</div>`;
  return [
    { path: base.slice(1) + 'index.html', html: appPage({ assets, key: 'weddings', body, planner: true }) },
    ...TRACKS.map((track) => {
      const path = base + track.slug + '/';
      const vendor = (b, role, info) => (b.member ? '<p class="focus-category">Founding Member</p>' : '')
        + directoryCard(b, role, info.label, vendorActions(b));
      const body = `<div class="pl-page" data-plan="${track.slug}" data-plan-focused>
  <div class="focus-wrap focus-content">
    <h1>${esc(track.kicker)}</h1>
    <p class="focus-intro">${esc(track.lede)} Founding Members are paid listings.</p>
    <label class="pl-filter"><input type="checkbox" data-plan-direct> Only vendors with online ordering, booking or shopping</label>
    <div class="focus-plan-roles">${track.roles.map((role, index) => roleSection(role, track, { renderVendor: vendor, open: index === 0 })).join('')}</div>
  </div>
  ${plannerControls(track, { focused: true })}
</div>`;
      return { path: path.slice(1) + 'index.html', html: appPage({
        assets, key: 'weddings', path, title: track.label, body, planner: true,
      }) };
    }),
  ];
}

function eventsPage(assets) {
  const filters = SOURCES.map(({ id, name }) => ({ slug: id, label: name }));
  const names = new Map(filters.map(({ slug, label }) => [slug, label]));
  const start = today();
  const cards = inWindow(handEntered(), start, addDays(start, 30)).filter((event) => event.access === 'public').map((event) =>
    directoryCard({ name: event.title, type: `${webDate(event.date)} · ${event.when}`, address: event.venue },
      event.src, names.get(event.src) || 'Events', external(event.url, 'Event details', true), { date: event.date, until: event.until, facets: event.live ? ['music'] : [] }));
  return appPage({ assets, key: 'events', body: listing({
      key: 'events',
    heading: 'What’s on in Columbus', description: 'Browse the next 31 days and open event details from the organizer.',
    placeholder: 'Event, venue or organizer', filters, cards, events: true,
  }) });
}

const articlePath = (story) => root('news') + story.href.slice('/news/'.length);
const storiesByPath = new Map(stories.map((story) => [story.href, articlePath(story)]));

function readingLinks(html) {
  return html.replace(/<p class="np-tip">[\s\S]*?<\/p>/g, '').replace(/<a\b([^>]*?)\bhref="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi, (link, _before, href, _after, label) => {
    if (href.startsWith('#')) return link;
    let url;
    try { url = new URL(href.replaceAll('&amp;', '&'), ORIGIN); } catch { return label; }
    if (!['http:', 'https:'].includes(url.protocol)) return label;
    if (url.origin === ORIGIN) {
      const dest = storiesByPath.get(url.pathname.endsWith('/') ? url.pathname : url.pathname + '/');
      return dest ? `<a href="${esc(dest + url.hash)}">${label}</a>` : label;
    }
    return `<a href="${esc(url.href)}" target="_blank" rel="noopener">${label}</a>`;
  });
}

function paperPages(assets) {
  const filters = [...new Set(stories.map((story) => story.section))]
    .map((slug) => ({ slug, label: sectionBySlug[slug].name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const date = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Indiana/Indianapolis' });
  const cards = stories.map((story) => {
    const section = sectionBySlug[story.section].name;
    return `<article class="focus-card" data-app-item data-title="${esc(story.headline)}" data-tags="${esc(section)}" data-date="${esc(story.published)}" data-category="${esc(story.section)}" data-search="${esc([story.headline, story.dek, section, ...(story.tags || [])].join(' '))}">
  ${story.images?.[0] ? `<img class="focus-news-image" src="${esc(story.images[0].file)}" alt="${esc(story.images[0].alt)}" loading="lazy">` : ''}
  <p class="focus-category">${esc(section)} · <time datetime="${esc(story.published)}">${date.format(new Date(story.published))}</time></p>
  <h2><a href="${esc(articlePath(story))}">${t(story.headline)}</a></h2>
  ${story.dek ? `<p>${t(story.dek)}</p>` : ''}
</article>`;
  });
  return [
    { path: 'apps/news/index.html', html: appPage({ assets, key: 'news', body: listing({
      key: 'news',
      heading: 'Latest news', description: 'Local reporting for Columbus, Indiana.',
      placeholder: 'Story, topic or section', filters, cards,
    }) }) },
    ...stories.map((story) => ({
      path: articlePath(story).slice(1) + 'index.html',
      html: appPage({ assets, key: 'news', path: articlePath(story), title: story.headline,
        article: true, body: readingLinks(storyBody(story)) }),
    })),
  ];
}

export function appPages({ assets }) {
  return [
    ...Object.entries(apps).flatMap(([key, app]) => [
      { path: app.manifest.slice(1), html: manifest(key, app) },
      { path: root(key).slice(1) + 'sw.js', html: worker(key) },
    ]),
    { path: 'news/sw.js', html: retiredWorker('news') },
    { path: 'order/sw.js', html: retiredWorker('order') },
    ...paperPages(assets),
    ...foodPages(assets),
    { path: 'apps/contractors/index.html', html: contractorsPage(assets) },
    { path: 'apps/churches/index.html', html: churchesPage(assets) },
    { path: 'apps/nonprofits/index.html', html: nonprofitsPage(assets) },
    ...weddingsPages(assets),
    { path: 'apps/events/index.html', html: eventsPage(assets) },
    { path: 'apps/food/offline.html', html: appPage({
      assets, key: 'food', title: 'Offline', path: '/apps/food/offline.html',
      body: '<section class="focus-wrap focus-content"><h1>You’re offline</h1><p>Reconnect for current menus and ordering links.</p><p><a class="focus-action" href="/apps/food/">Try again</a></p></section>',
    }) },
  ];
}

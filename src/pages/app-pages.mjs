import { page, esc, t } from '../layout.mjs';
import { catBySlug, directory, inSection, subBySlug } from '../data/directory.mjs';
import { stories } from '../news/content.mjs';
import { sectionBySlug } from '../news/sections.mjs';
import { storyBody } from './news-pages.mjs';
import { ORIGIN } from '../jsonld.mjs';

const apps = {
  news: {
    id: '/news/', manifest: '/news/manifest.webmanifest', icon: 'news',
    name: 'Columbus Paper', description: 'Read local news from Heart of Columbus.',
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
};
const root = (key) => `/apps/${key}/`;
const iconPath = (app, size) => `/art/${app.icon}-app-icon-${size}.png`;

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

function appPage({ assets, key, path = root(key), title, body, article = false }) {
  const app = apps[key];
  const back = !article ? '' : `<a class="focus-back" href="${root(key)}">← All stories</a>`;
  return page({
    title: title ? `${title} | ${app.name}` : app.name,
    description: app.description,
    assets, path, theme: `focus-app focus-${key}`, showAlert: false,
    styles: [...(article ? ['hoc.css', 'newsprint.css'] : []), 'focus-app.css'],
    scripts: ['app-install.js'],
    head: `<link rel="manifest" href="${app.manifest}">
<meta name="theme-color" content="${app.theme}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="${app.name}">
<link rel="apple-touch-icon" href="${iconPath(app, 180)}">`,
    body: `<header class="focus-top">
  <div class="focus-wrap focus-top-row">
    <p>${app.name}</p>
    <button type="button" class="focus-install" data-app-install aria-controls="install-hint" aria-expanded="false" hidden>Install app</button>
    ${back}
  </div>
  <p class="focus-wrap focus-install-hint" id="install-hint" data-app-install-hint hidden>In Safari, tap Share, then Add to Home Screen.</p>
</header>
<main id="main"${article ? ' class="focus-article np"' : ''}>${body}</main>`,
  });
}

function searchForm(label, options) {
  return `<div class="focus-filter">
  <label class="focus-field"><span>Search</span><input type="search" data-app-search placeholder="${esc(label)}"></label>
  <label class="focus-field"><span>Category</span><select data-app-category>
    <option value="">All categories</option>
    ${options.map(({ slug, label }) => `<option value="${esc(slug)}">${esc(label)}</option>`).join('')}
  </select></label>
</div>`;
}

function listing({ heading, description, placeholder, filters, cards }) {
  return `<div class="focus-wrap focus-content">
  <h1>${esc(heading)}</h1>
  <p class="focus-intro">${esc(description)}</p>
  ${searchForm(placeholder, filters)}
  <p class="focus-count" role="status" data-app-count>${cards.length} results</p>
  <div class="focus-grid">${cards.join('')}</div>
  <p class="focus-empty" data-app-empty hidden>No matches. Try another search or category.</p>
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

function directoryCard(business, category, categoryLabel, actions, menu = '') {
  return `<article class="focus-card" data-app-item data-category="${esc(category)}" data-search="${esc([business.name, business.type, business.address, categoryLabel].filter(Boolean).join(' '))}">
  <p class="focus-category">${esc(categoryLabel)}</p>
  <h2>${t(business.name)}</h2>
  ${business.type ? `<p>${t(business.type)}</p>` : ''}
  ${business.address ? `<p class="focus-address">${t(business.address)}</p>` : ''}
  ${menu}
  <div class="focus-actions">${actions}</div>
</article>`;
}

function foodPage(assets) {
  const categories = ['restaurants', 'coffee-sweets', 'bars'];
  const filters = categories.map((slug) => ({ slug, label: catBySlug[slug].label }));
  const cards = directory.filter((b) => categories.includes(b.cat) && !b.tempClosed).flatMap((b) => {
    const orders = b.order.map(({ url, label }) => external(url, b.order.length === 1 ? 'Order direct' : `Order via ${label}`, true)).join('');
    const actions = orders + call(b.phone) + (!orders ? external(b.website, 'Website') : '');
    const category = subBySlug[b.sub]?.label || catBySlug[b.cat].label;
    const menu = b.snap?.kind === 'menu' ? `<details class="focus-menu" data-app-menu="${esc(b.slug)}"><summary>Menu</summary><div data-menu-content></div></details>` : '';
    return actions || menu ? [directoryCard(b, b.cat, category, actions, menu)] : [];
  });
  return appPage({ assets, key: 'food', body: listing({
    heading: 'Find food in Columbus', description: 'Look up a menu or order pickup directly from a local restaurant.',
    placeholder: 'Restaurant, cuisine or address', filters, cards,
  }) });
}

function contractorsPage(assets) {
  const filters = catBySlug['home-services'].subs.filter(({ slug }) => slug !== 'laundry');
  const cards = directory.filter((b) => !b.tempClosed).flatMap((b) => {
    const trades = filters.filter(({ slug }) => inSection(b, 'home-services', slug));
    if (!trades.length) return [];
    const contact = call(b.phone) + external(b.website, 'Website');
    return contact ? [directoryCard(b, trades.map((trade) => trade.slug).join(' '),
      trades.map((trade) => trade.label).join(' · '), contact)] : [];
  });
  return appPage({ assets, key: 'contractors', body: listing({
    heading: 'Find a local contractor', description: 'Search by trade, then call or visit the contractor’s own website.',
    placeholder: 'Roofing, plumbing or business name', filters, cards,
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
    return `<article class="focus-card" data-app-item data-category="${esc(story.section)}" data-search="${esc([story.headline, story.dek, section].join(' '))}">
  <p class="focus-category">${esc(section)} · <time datetime="${esc(story.published)}">${date.format(new Date(story.published))}</time></p>
  <h2><a href="${esc(articlePath(story))}">${t(story.headline)}</a></h2>
  ${story.dek ? `<p>${t(story.dek)}</p>` : ''}
</article>`;
  });
  return [
    { path: 'apps/news/index.html', html: appPage({ assets, key: 'news', body: listing({
      heading: 'The Columbus Paper', description: 'Local reporting from Heart of Columbus.',
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
    { path: 'apps/food/index.html', html: foodPage(assets) },
    { path: 'apps/contractors/index.html', html: contractorsPage(assets) },
    { path: 'apps/food/offline.html', html: appPage({
      assets, key: 'food', title: 'Offline', path: '/apps/food/offline.html',
      body: '<section class="focus-wrap focus-content"><h1>You’re offline</h1><p>Reconnect for current menus and ordering links.</p><p><a class="focus-action" href="/apps/food/">Try again</a></p></section>',
    }) },
  ];
}

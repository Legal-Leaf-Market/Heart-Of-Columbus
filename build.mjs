// Builds the site into dist/: renders every page from src/, compiles
// Tailwind, copies public/. Run: npm run build
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { renderHub } from './src/pages/hub.mjs';
import { pages as storefronts } from './src/pages/storefronts.mjs';
import { directoryPages } from './src/pages/directory-pages.mjs';
import { pickupPages } from './src/pages/pickup-pages.mjs';
import { ownersPages } from './src/pages/owners-pages.mjs';
import { visitPages } from './src/pages/visit-pages.mjs';
import { landmarkPages } from './src/pages/landmark-pages.mjs';
import { icsFeed } from './src/pages/events.mjs';
import { finalizeSeo, robotsTxt, sitemapXml } from './src/seo.mjs';
import { prepareImages, responsiveImages } from './scripts/images.mjs';
import { holidayPages } from './src/pages/holiday-pages.mjs';
import { filmPages } from './src/pages/film-pages.mjs';
import { skatePages } from './src/pages/skate-pages.mjs';
import { freePages } from './src/pages/free-pages.mjs';
import { guidePages } from './src/pages/guide-pages.mjs';
import { djPages } from './src/pages/dj-pages.mjs';
import { agriculturePages } from './src/pages/agriculture-pages.mjs';
import { tripPages } from './src/pages/trip-pages.mjs';
import { calendarPages } from './src/pages/calendar-pages.mjs';
import { paperPages } from './src/pages/paper-pages.mjs';
import { sportsPages } from './src/pages/sports-pages.mjs';
import { helpPages } from './src/pages/help-pages.mjs';
import { historyPages, articlesJson } from './src/pages/history-pages.mjs';
import { searchIndex } from './src/site.mjs';

const root = new URL('./', import.meta.url);
const out = new URL('dist/', root);
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);

await rm(out, { recursive: true, force: true });
await cp(new URL('public/', root), out, { recursive: true });

const images = await prepareImages(root, out);

// Tailwind scans src/ and public/js for class names.
await mkdir(new URL('assets/', out), { recursive: true });
execFileSync(new URL('node_modules/.bin/tailwindcss', root).pathname,
  ['-i', 'src/styles.css', '-o', 'dist/assets/app.css', '--minify'],
  { cwd: root.pathname, stdio: ['ignore', 'ignore', 'inherit'] });

const assets = { css: hash(await readFile(new URL('assets/app.css', out))) };
for (const f of await readdir(new URL('public/css/', root))) assets[f] = hash(await readFile(new URL(`public/css/${f}`, root)));
for (const f of await readdir(new URL('public/js/', root))) {
  const h = hash(await readFile(new URL(`public/js/${f}`, root)));
  assets[f] = h;
  if (f === 'core.js') assets.core = h;
}

const pages = [
  { path: 'index.html', html: renderHub({ assets }) },
  ...storefronts.map((p) => ({ path: `${p.slug}/index.html`, html: p.render({ assets }) })),
  ...directoryPages({ assets }),
  ...pickupPages({ assets }),
  ...ownersPages({ assets }),
  ...visitPages({ assets }),
  ...landmarkPages({ assets }),
  ...tripPages({ assets }),
  ...freePages({ assets }),
  ...djPages({ assets }),
  ...agriculturePages({ assets }),
  ...filmPages({ assets }),
  ...guidePages({ assets }),
  ...holidayPages({ assets }),
  ...calendarPages({ assets }),
  ...paperPages({ assets }),
  ...sportsPages({ assets }),
  ...helpPages({ assets }),
  ...historyPages({ assets }),
  ...skatePages({ assets }),
];
await mkdir(new URL('data/', out), { recursive: true });
await writeFile(new URL('data/directory.json', out), JSON.stringify(searchIndex()));
await writeFile(new URL('events.ics', out), icsFeed());
await mkdir(new URL('history/', out), { recursive: true });
await writeFile(new URL('history/articles.json', out), articlesJson());
for (const p of pages) {
  p.html = finalizeSeo(responsiveImages(p.html, images), p.path);
  const file = new URL(p.path, out);
  await mkdir(new URL('./', file), { recursive: true });
  await writeFile(file, p.html);
}

// Crawlers must be able to read the pages to see their noindex directives.
// Do not advertise an empty sitemap during the concept preview.
const sitemap = process.env.HOC_SITEMAP === '1' ? sitemapXml(pages) : null;
await writeFile(new URL('robots.txt', out), robotsTxt(Boolean(sitemap)));
if (sitemap) {
  await writeFile(new URL('sitemap.xml', out), sitemap);
}

// No visible dashes (em, en, or a spaced hyphen) in page text or in the
// alt, title, label and placeholder text a reader sees.
const visibleText = (html) => {
  const h = html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, ' ');
  const attrs = [...h.matchAll(/\s(?:alt|title|placeholder|aria-label|content)="([^"]*)"/g)].map((m) => m[1]);
  return [h.replace(/<[^>]+>/g, ' '), ...attrs].join(' ');
};
const dashed = pages.filter((p) => p.path.endsWith('.html') && /[—–]| - /.test(visibleText(p.html))).map((p) => p.path);
if (dashed.length) { console.error('Dash found in: ' + dashed.join(', ')); process.exit(1); }
console.log(`Built dist/: ${pages.length} pages`);

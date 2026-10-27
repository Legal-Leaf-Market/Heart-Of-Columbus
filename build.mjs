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
import { finalizeSeo } from './src/seo.mjs';
import { ORIGIN } from './src/jsonld.mjs';
import { prepareImages, responsiveImages } from './scripts/images.mjs';
import { holidayPages } from './src/pages/holiday-pages.mjs';
import { filmPages } from './src/pages/film-pages.mjs';
import { skatePages } from './src/pages/skate-pages.mjs';
import { freePages } from './src/pages/free-pages.mjs';
import { guidePages } from './src/pages/guide-pages.mjs';
import { djPages } from './src/pages/dj-pages.mjs';
import { agriculturePages } from './src/pages/agriculture-pages.mjs';
import { tripPages } from './src/pages/trip-pages.mjs';
import { trailPages } from './src/pages/trail-pages.mjs';
import { calendarPages } from './src/pages/calendar-pages.mjs';
import { paperPages } from './src/pages/paper-pages.mjs';
import { sportsPages } from './src/pages/sports-pages.mjs';
import { helpPages } from './src/pages/help-pages.mjs';
import { historyPages, articlesJson } from './src/pages/history-pages.mjs';
import { searchIndex } from './src/site.mjs';
import { newsPages } from './src/pages/news-pages.mjs';
import { cmsConfig } from './src/news/cms.mjs';
import { dashes } from './src/visible.mjs';
import { LAUNCH, indexable, ROBOTS_META, headersFile, robotsTxt, urlPath } from './src/indexing.mjs';

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
  ...trailPages({ assets }),
  ...freePages({ assets }),
  ...djPages({ assets }),
  ...agriculturePages({ assets }),
  ...filmPages({ assets }),
  ...guidePages({ assets }),
  ...holidayPages({ assets }),
  ...newsPages({ assets }),
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
await mkdir(new URL('admin/', out), { recursive: true });
await writeFile(new URL('admin/config.yml', out), cmsConfig());
await mkdir(new URL('history/', out), { recursive: true });
await writeFile(new URL('history/articles.json', out), articlesJson());
// The robots meta is decided here, per path, by the one policy in
// src/indexing.mjs. The layout leaves a marker so no page can opt itself in.
for (const p of pages) {
  if (!p.path.endsWith('.html')) continue;
  if (!p.html.includes('<!--robots-->')) { console.error('No robots marker in ' + p.path); process.exit(1); }
  p.html = p.html.replace('<!--robots-->', indexable(p.path) ? '' : ROBOTS_META);
}
await writeFile(new URL('_headers', out), headersFile());
await writeFile(new URL('robots.txt', out), robotsTxt(ORIGIN));
for (const p of pages) {
  p.html = finalizeSeo(responsiveImages(p.html, images), p.path);
  const file = new URL(p.path, out);
  await mkdir(new URL('./', file), { recursive: true });
  await writeFile(file, p.html);
}

// The sitemap lists exactly the pages the policy indexes, so it exists only
// after launch and can never name a noindex page.
if (LAUNCH) {
  const live = pages.filter((p) => p.path.endsWith('index.html') && indexable(p.path));
  const loc = (p) => ORIGIN + '/' + p.path.replace(/index\.html$/, '');
  await writeFile(new URL('sitemap.xml', out), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${live.map((p) => `  <url><loc>${loc(p)}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log(`Sitemap: ${live.length} indexable pages`);
}

// No dashes a person can see: em, en, or a spaced hyphen standing in for one,
// in page text or alt, title, aria-label, placeholder and meta content
// (src/visible.mjs). Em dashes are refused anywhere in the page, JSON-LD too.
const dashed = pages.flatMap((p) => {
  if (!p.path.endsWith('.html')) return [];
  const hits = dashes(p.html);
  if (p.html.includes('—') && !hits.length) hits.push('em dash in markup');
  return hits.length ? [`${p.path}: "${hits[0]}"${hits.length > 1 ? ` (+${hits.length - 1} more)` : ''}`] : [];
});
if (dashed.length) { console.error(`Visible dash on ${dashed.length} page(s). Use a comma, colon, period or "to":\n  ` + dashed.slice(0, 40).join('\n  ')); process.exit(1); }
console.log(`Built dist/: ${pages.length} pages`);

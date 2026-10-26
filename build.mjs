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
import { ORIGIN } from './src/jsonld.mjs';
import { holidayPages } from './src/pages/holiday-pages.mjs';
import { filmPages } from './src/pages/film-pages.mjs';
import { freePages } from './src/pages/free-pages.mjs';
import { guidePages } from './src/pages/guide-pages.mjs';
import { djPages } from './src/pages/dj-pages.mjs';
import { tripPages } from './src/pages/trip-pages.mjs';
import { calendarPages } from './src/pages/calendar-pages.mjs';
import { paperPages } from './src/pages/paper-pages.mjs';
import { sportsPages } from './src/pages/sports-pages.mjs';
import { searchIndex } from './src/site.mjs';
import { LAUNCH, indexable, ROBOTS_META, headersFile, robotsTxt, urlPath } from './src/indexing.mjs';

const root = new URL('./', import.meta.url);
const out = new URL('dist/', root);
const hash = (buf) => createHash('sha256').update(buf).digest('hex').slice(0, 10);

await rm(out, { recursive: true, force: true });
await cp(new URL('public/', root), out, { recursive: true });

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
  ...filmPages({ assets }),
  ...guidePages({ assets }),
  ...holidayPages({ assets }),
  ...calendarPages({ assets }),
  ...paperPages({ assets }),
  ...sportsPages({ assets }),
];
await mkdir(new URL('data/', out), { recursive: true });
await writeFile(new URL('data/directory.json', out), JSON.stringify(searchIndex()));
await writeFile(new URL('events.ics', out), icsFeed());
// The robots meta is decided here, per path, by the one policy in
// src/indexing.mjs. The layout leaves a marker so no page can opt itself in.
for (const p of pages) {
  if (!p.path.endsWith('.html')) continue;
  if (!p.html.includes('<!--robots-->')) { console.error('No robots marker in ' + p.path); process.exit(1); }
  p.html = p.html.replace('<!--robots-->', indexable(p.path) ? '' : ROBOTS_META);
  // Every page names itself, absolutely, from the one origin. Query strings
  // (list or map view, a search) are views of this same page.
  const self = ORIGIN + urlPath(p.path);
  p.html = p.html.replace('<!--canonical-->', p.path.startsWith('404') ? '' : `<link rel="canonical" href="${self}">\n<meta property="og:url" content="${self}">`);
}
await writeFile(new URL('_headers', out), headersFile());
await writeFile(new URL('robots.txt', out), robotsTxt(ORIGIN));
for (const p of pages) {
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

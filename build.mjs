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
import { djPages } from './src/pages/dj-pages.mjs';
import { tripPages } from './src/pages/trip-pages.mjs';
import { calendarPages } from './src/pages/calendar-pages.mjs';
import { searchIndex } from './src/site.mjs';

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
  ...holidayPages({ assets }),
  ...calendarPages({ assets }),
];
await mkdir(new URL('data/', out), { recursive: true });
await writeFile(new URL('data/directory.json', out), JSON.stringify(searchIndex()));
await writeFile(new URL('events.ics', out), icsFeed());
for (const p of pages) {
  const file = new URL(p.path, out);
  await mkdir(new URL('./', file), { recursive: true });
  await writeFile(file, p.html);
}

// Sitemap stays off while every page is noindex. Turn it on (HOC_SITEMAP=1)
// the day pages start going live; it lists only pages without noindex.
if (process.env.HOC_SITEMAP === '1') {
  const live = pages.filter((p) => !p.html.includes('name="robots" content="noindex') && p.path.endsWith('index.html') && !p.path.startsWith('404'));
  const loc = (p) => ORIGIN + '/' + p.path.replace(/index\.html$/, '');
  await writeFile(new URL('sitemap.xml', out), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${live.map((p) => `  <url><loc>${loc(p)}</loc></url>`).join('\n')}\n</urlset>\n`);
  console.log(`Sitemap: ${live.length} live pages`);
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

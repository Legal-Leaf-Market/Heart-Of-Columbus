// Builds the site into dist/: renders every page from src/, compiles
// Tailwind, copies public/. Run: npm run build
import { readFile, writeFile, mkdir, cp, rm, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { renderHub } from './src/pages/hub.mjs';
import { pages as storefronts } from './src/pages/storefronts.mjs';

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
for (const f of await readdir(new URL('public/js/', root))) {
  const h = hash(await readFile(new URL(`public/js/${f}`, root)));
  assets[f] = h;
  if (f === 'core.js') assets.core = h;
}

const pages = [{ path: 'index.html', html: renderHub({ assets }) }, ...storefronts.map((p) => ({ path: `${p.slug}/index.html`, html: p.render({ assets }) }))];
for (const p of pages) {
  const file = new URL(p.path, out);
  await mkdir(new URL('./', file), { recursive: true });
  await writeFile(file, p.html);
}

const emDash = pages.filter((p) => p.html.includes('—')).map((p) => p.path);
if (emDash.length) { console.error('Em dash found in: ' + emDash.join(', ')); process.exit(1); }
console.log(`Built dist/: ${pages.length} pages (${pages.map((p) => '/' + p.path.replace('index.html', '')).join(' ')})`);

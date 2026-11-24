// Saves local copies of the Wikimedia Commons photos the print edition uses,
// so the printed PDF never depends on Wikimedia answering at print time.
//
//   node scripts/print-photos.mjs
//
// Writes public/print-media/<landmark>.jpg. The site still hotlinks the same
// photos everywhere else (src/site.mjs); credits print in the colophon on the
// back page. Wikimedia serves scripts only its standard thumbnail sizes, so
// these are the 1280 pixel versions, the same files the site shows. One
// request every few seconds, with a user agent that says who is asking.
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PHOTOS } from '../src/site.mjs';
import { EDITION } from '../src/print/edition-2026-12.mjs';

const UA = 'HeartOfColumbusBot/1.0 (print edition photos; https://heartofcolumbus.netlify.app)';
const dir = new URL('../public/print-media/', import.meta.url);
await mkdir(dir, { recursive: true });
const keys = [...new Set(['aerial', 'library', ...EDITION.gathers.map((g) => g[2]).filter(Boolean),
  ...EDITION.pages.flatMap((p) => p.rows.flatMap((r) => r.mods.flatMap((m) => (Array.isArray(m.photos) ? m.photos : [])))),
])];
// A full size original is refused to scripts; ask for the 1280 thumbnail.
const thumb = (src) => (src.includes('/thumb/') ? src : src.replace(/\/commons\/(\w\/\w\w)\/([^/]+)$/, (_, p, f) => `/commons/thumb/${p}/${f}/1280px-${f}`));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
for (const k of keys) {
  const file = new URL(`${k}.jpg`, dir);
  if (existsSync(file)) { console.log(`have ${k}`); continue; }
  const url = thumb(PHOTOS[k].src);
  for (let attempt = 1; attempt <= 6; attempt++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    const type = r.headers.get('content-type') || '';
    if (r.ok && type.startsWith('image/')) { await writeFile(file, Buffer.from(await r.arrayBuffer())); console.log(`saved ${k}`); break; }
    console.log(`${k}: HTTP ${r.status}, waiting`);
    await wait(15000 * attempt);
  }
  await wait(8000);
}

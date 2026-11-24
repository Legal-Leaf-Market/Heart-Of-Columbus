// node scripts/fetch-print-media.mjs [key ...]
// Saves local copies of print photos into public/print-media/<key>.jpg, so
// the print edition never hotlinks (src/pages/print-pages.mjs prefers the
// local file). Keys come from PHOTOS in src/site.mjs; the credit and license
// stay there and print beside the photo. Only freely licensed photos are
// fetched. With no keys given, it fetches every PHOTOS entry with no local
// copy. Run by the "Fetch print media" workflow; this sandbox can't reach
// Wikimedia.
import { existsSync, writeFileSync } from 'node:fs';
import { PHOTOS } from '../src/site.mjs';

const FREE = /public domain|^CC (BY|BY-SA|0)\b|^CC0/i;
const keys = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PHOTOS).filter((k) => !existsSync(`public/print-media/${k}.jpg`));
let saved = 0, failed = 0;
for (const key of keys) {
  const p = PHOTOS[key];
  if (!p) { console.error(`${key}: not in PHOTOS`); failed++; continue; }
  if (!FREE.test(p.license || '')) { console.error(`${key}: license "${p.license}" is not free; skipped`); failed++; continue; }
  const r = await fetch(p.src, { headers: { 'user-agent': 'HeartOfColumbus/1.0 (print edition; github.com/Legal-Leaf-Market/Heart-Of-Columbus)' } });
  const type = r.headers.get('content-type') || '';
  if (!r.ok || !/^image\/jpe?g/.test(type)) { console.error(`${key}: ${r.status} ${type}`); failed++; continue; }
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 20000) { console.error(`${key}: only ${buf.length} bytes, not saved`); failed++; continue; }
  writeFileSync(`public/print-media/${key}.jpg`, buf);
  console.log(`${key}: saved ${buf.length} bytes (${p.credit}, ${p.license})`);
  saved++;
}
console.log(`${saved} saved, ${failed} not saved`);
if (failed && !saved) process.exit(1);

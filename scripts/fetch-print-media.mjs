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
  // Wikimedia throttles full-size originals from cloud runners (429), so try
  // the original with a polite wait, then its large thumbnails, which are
  // plenty for print.
  const tries = [p.src];
  const m = /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(.\/..)\/([^/]+)$/.exec(p.src);
  if (m) for (const w of [2400, 1920]) tries.push(`${m[1]}/thumb/${m[2]}/${m[3]}/${w}px-${m[3]}`);
  let buf = null;
  for (const url of tries) {
    for (let attempt = 0; attempt < 3 && !buf; attempt++) {
      const r = await fetch(url, { headers: { 'user-agent': 'HeartOfColumbusPrint/1.0 (https://github.com/Legal-Leaf-Market/Heart-Of-Columbus; print edition photo copy)' } });
      const type = r.headers.get('content-type') || '';
      if (r.ok && /^image\/jpe?g/.test(type)) { const b = Buffer.from(await r.arrayBuffer()); if (b.length >= 20000) { buf = b; console.log(`${key}: from ${url}`); } break; }
      console.error(`${key}: ${r.status} ${type} ${url}`);
      if (r.status !== 429 && r.status < 500) break;
      const wait = Math.min(Number(r.headers.get('retry-after')) || 10, 60);
      await new Promise((res) => setTimeout(res, wait * 1000));
    }
    if (buf) break;
  }
  if (!buf) { failed++; continue; }
  writeFileSync(`public/print-media/${key}.jpg`, buf);
  console.log(`${key}: saved ${buf.length} bytes (${p.credit}, ${p.license})`);
  saved++;
}
console.log(`${saved} saved, ${failed} not saved`);
if (failed && !saved) process.exit(1);

// Makes the print edition's PDF and checks it, page by page.
//
//   node scripts/print-pdf.mjs                      builds nothing; serves dist/
//   node scripts/print-pdf.mjs --url https://heartofcolumbus.shop/print/2026-12/
//   options: --out file.pdf   --shots dir   (a PNG of every page)
//
// Locally the calendar reads the library and parks feeds directly; on a
// machine whose network needs a proxy, run it with NODE_USE_ENV_PROXY=1.
//
// It opens the edition in headless Chromium, waits for print-edition.js to
// fit the pages, prints 11 by 17 with backgrounds, and reports: anything the
// fitter flagged, any photo under 200 pixels per inch at its printed size,
// and the page count. Exit code 1 if a page does not fit. Run `npm run build`
// first when proofing the local copy. Opening the live site is what fills the
// calendar from the library and parks feeds.
import { createServer } from 'node:http';
import { readFile, stat, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, all) => (x.startsWith('--') ? [...a, [x.slice(2), all[i + 1]?.startsWith('--') || all[i + 1] == null ? true : all[i + 1]]] : a), []));
const slug = args.edition || '2026-12';
const out = args.out || `print-${slug}.pdf`;
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(join(process.env.NODE_PATH || '/usr/local/lib/node_modules_global', 'playwright'))); }

// A static server for dist/, the same as scripts/serve.mjs.
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.json': 'application/json', '.woff2': 'font/woff2' };
let server, url = args.url;
if (!url) {
  server = createServer(async (req, res) => {
    // /api/events is a Netlify function on the live site. Answer it here with
    // the same collector, so a local proof shows the real calendar too.
    const u = new URL(req.url, 'http://x');
    if (u.pathname === '/api/events') {
      try {
        const { collect } = await import('../src/event-feeds.mjs');
        let data = await collect({ from: u.searchParams.get('from'), days: Number(u.searchParams.get('days')) || 31 }).catch(() => null);
        // A machine that cannot reach the feeds (a sandbox) reads the live site's answer instead.
        if (!data?.events?.length || data.sources?.some((x) => x.live && !x.ok)) {
          const r = await fetch(`https://heartofcolumbus.netlify.app/api/events${u.search}`).catch(() => null);
          if (r?.ok) { data = await r.json(); console.log('  (calendar read from the live site: the feeds were out of reach)'); }
        }
        res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(data));
      } catch (e) { res.writeHead(502); res.end(String(e)); }
      return;
    }
    let file = join(dist, normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, ''));
    try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }); res.end(await readFile(file)); }
    catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise((r) => server.listen(0, r));
  url = `http://127.0.0.1:${server.address().port}/print/${slug}/`;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(url, { waitUntil: 'load', timeout: 90000 });
await page.waitForFunction(() => document.documentElement.dataset.peReady === '1', null, { timeout: 60000 });
const report = await page.evaluate(() => window.__peReport);
await page.emulateMedia({ media: 'print' });
// Give every photo a chance to arrive, then measure what it will print at.
const photos = await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll('.pe-sheet img')];
  await Promise.all(imgs.map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 15000); }))));
  return imgs.map((i) => {
    const r = i.getBoundingClientRect();
    // object-fit: cover scales the photo to fill its box; the larger ratio wins.
    const scale = i.naturalWidth ? Math.max(r.width / i.naturalWidth, r.height / i.naturalHeight) : 0; // the rect already includes any zoom crop
    const ppi = scale ? Math.round(96 / scale) : 0;
    const inches = r.width / 96;
    return { page: i.closest('.pe-sheet').dataset.page, src: i.currentSrc || i.src, ppi, inches: +inches.toFixed(2), loaded: i.naturalWidth > 0 };
  });
});
if (args.shots) {
  await mkdir(args.shots, { recursive: true });
  await page.emulateMedia({ media: 'screen' });
  await page.evaluate(() => {
    const paper = document.querySelector('.pe-paper');
    paper.classList.remove('pe-reading');
    paper.style.zoom = '1';
    document.querySelector('[data-pe-toolbar]')?.remove();
  });
  const sheets = await page.$$('.pe-sheet');
  for (const [i, s] of sheets.entries()) await s.screenshot({ path: join(args.shots, `page-${String(i + 1).padStart(2, '0')}.png`) });
  await page.emulateMedia({ media: 'print' });
}
await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
const pdfPages = ((await readFile(out, 'latin1')).match(/\/Type\s*\/Page[^s]/g) || []).length;
await browser.close();
server?.close();

console.log(`Wrote ${out}: ${pdfPages} pages at 11 by 17 inches.`);
if (pdfPages !== report.pages) console.log(`  ! The PDF has ${pdfPages} pages, the edition ${report.pages}. Something spilled onto an extra page.`);
for (const i of report.issues) console.log(`  ! ${i}`);
for (const r of report.room || []) console.log(`  . ${r}`);
const missing = photos.filter((p) => !p.loaded);
const thin = photos.filter((p) => p.loaded && p.ppi < 200);
for (const p of missing) console.log(`  ! Page ${p.page}: photo did not load: ${p.src}`);
for (const p of thin) console.log(`  ~ Page ${p.page}: photo prints at ${p.ppi} pixels per inch (aim for 200 or more): ${p.src.split('/').pop()}`);
if (!report.issues.length && pdfPages === report.pages) console.log('  Every page fits.');
process.exit(report.ok && pdfPages === report.pages ? 0 : 1);

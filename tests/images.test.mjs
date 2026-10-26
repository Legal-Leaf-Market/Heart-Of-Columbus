import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { responsiveImages } from '../scripts/images.mjs';
const dist = new URL('../dist/', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('assets/images/manifest.json', dist)));

test('local raster images have measured dimensions and every responsive candidate resolves', () => {
  for (const file of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(new URL(file, dist), 'utf8');
    for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
      const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
      if (!src?.startsWith('/') || !/\.(png|jpe?g|webp)$/.test(src)) continue;
      const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1]);
      const height = Number(tag.match(/\bheight="(\d+)"/)?.[1]);
      assert.ok(width > 0 && height > 0, `${file}: ${src}`);
      const candidates = tag.match(/\bsrcset="([^"]+)"/)?.[1];
      if (candidates) for (const candidate of candidates.split(', ')) {
        assert.ok(existsSync(new URL(candidate.split(' ')[0].slice(1), dist)), candidate);
      }
    }
  }
});

test('homepage stays below the measured pre-audit size and image count', () => {
  const html = readFileSync(new URL('index.html', dist), 'utf8');
  assert.ok(Buffer.byteLength(html) < 400000);
  assert.ok([...html.matchAll(/<img\b/g)].length < 300);
  for (const path of ['/explore/?open=1', '/c/restaurants/mexican/', '/n/downtown/']) assert.ok(html.includes(`href="${path}"`));
});

test('cover variants reduce bytes and preserve original aspect ratio', () => {
  let sourceBytes = 0, smallBytes = 0;
  for (const [src, m] of Object.entries(manifest).filter(([src]) => src.startsWith('/art/cover-'))) {
    sourceBytes += m.bytes;
    smallBytes += (m.variants.find((v) => v.width >= 640) || m.variants.at(-1))?.bytes || m.bytes;
    const tag = responsiveImages(`<img src="${src}" alt="" width="400" height="400">`, new Map([[src, m]]));
    assert.ok(tag.includes(`height="${Math.round(400 * m.height / m.width)}"`));
  }
  assert.ok(smallBytes < sourceBytes / 2);
});

// Every same-site link, image and script in the built pages points at a file.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const pages = readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'));

const resolves = (u) => {
  let p = dist + decodeURIComponent(u).slice(1);
  if (existsSync(p) && statSync(p).isDirectory()) p += '/index.html';
  return existsSync(p);
};

test('no broken links, images or scripts on any page', () => {
  const broken = new Map();
  for (const f of pages) {
    const html = readFileSync(dist + f, 'utf8');
    for (const [, raw] of html.matchAll(/(?:href|src)="([^"#?]*)/g)) {
      if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/api/')) continue;
      if (!resolves(raw)) broken.set(raw, f);
    }
  }
  assert.deepEqual([...broken].slice(0, 10), [], `${broken.size} broken (target, first page)`);
});

test('a not-found page is built for Netlify', () => {
  assert.ok(pages.includes('404.html'));
  assert.match(readFileSync(dist + '404.html', 'utf8'), /noindex/);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { pageUrl, finalizeSeo, sitemapXml, robotsTxt } from '../src/seo.mjs';
import { ORIGIN } from '../src/jsonld.mjs';

const dist = new URL('../dist/', import.meta.url);
test('every generated content page has its own absolute canonical and social URL', () => {
  for (const f of readdirSync(dist, { recursive: true }).filter((p) => p.endsWith('.html'))) {
    const html = readFileSync(new URL(f, dist), 'utf8');
    const canonicals = [...html.matchAll(/rel="canonical" href="([^"]+)"/g)];
    assert.equal(canonicals.length, f === '404.html' ? 0 : 1, f);
    if (canonicals.length) assert.equal(canonicals[0][1], pageUrl(f), f);
    assert.ok(html.includes(`property="og:image" content="${ORIGIN}/og.png"`), f);
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'), f);
    assert.match(html, /name="robots" content="noindex, nofollow"/, f);
  }
});

test('sitemap excludes preview, utility and missing pages and escapes XML', () => {
  assert.equal(sitemapXml([{ path: 'index.html', html: '<meta name="robots" content="noindex, nofollow">' }]), null);
  const xml = sitemapXml([
    { path: 'index.html', html: '' },
    { path: 'b/example/index.html', html: '' },
    { path: 'saved/index.html', html: '<meta name="robots" content="noindex, nofollow">' },
    { path: '404.html', html: '' },
  ]);
  assert.ok(xml.includes(`<loc>${ORIGIN}/</loc>`));
  assert.ok(xml.includes(`${ORIGIN}/b/example/`));
  assert.ok(!xml.includes('/saved/') && !xml.includes('404'));
  assert.ok(!robotsTxt(false).includes('Sitemap:'));
  assert.ok(robotsTxt(true).includes(`Sitemap: ${ORIGIN}/sitemap.xml`));
});

test('metadata keeps encoded titles and descriptions safe in attributes', () => {
  const html = finalizeSeo('<html lang="es"><head><title>A &quot;B&quot;</title><meta name="description" content="C &amp; D"></head>', 'es/visit/index.html');
  assert.ok(html.includes('name="twitter:title" content="A &quot;B&quot;"'));
  assert.ok(html.includes('property="og:locale" content="es_US"'));
  assert.ok(html.includes(`${ORIGIN}/es/visit/`));
});

test('all pages have unique titles, descriptions, and reciprocal language alternates', () => {
  const titles = new Set();
  for (const file of readdirSync(dist, { recursive: true }).filter((f) => f.endsWith('.html'))) {
    const html = readFileSync(new URL(file, dist), 'utf8');
    const title = html.match(/<title>([^]*?)<\/title>/)?.[1];
    assert.ok(title?.trim(), file);
    assert.ok(!titles.has(title), `duplicate title: ${file}`);
    titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]+">/, file);
    const self = pageUrl(file);
    const language = html.match(/<html lang="([^"]+)"/)?.[1];
    const alternates = [...html.matchAll(/rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
    if (alternates.length) assert.ok(alternates.some(([, lang, url]) => lang === language && url === self), `missing self alternate: ${file}`);
    for (const [, lang, url] of alternates) {
      assert.equal(new URL(url).origin, ORIGIN);
      const target = readFileSync(new URL(new URL(url).pathname.slice(1) + 'index.html', dist), 'utf8');
      assert.ok(target.includes(`<html lang="${lang}">`), `${file}: ${url}`);
      assert.ok(target.includes(`hreflang="${language}" href="${self}"`), `missing reciprocal: ${file}: ${url}`);
    }
  }
});

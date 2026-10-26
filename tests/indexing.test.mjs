// The indexing policy: one switch, applied to the meta, the header, robots.txt
// and the sitemap together. npm test builds without HOC_INDEX, so dist/ is the
// preview build; the launch matrix runs the policy module in child processes.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const dist = new URL('../dist/', import.meta.url).pathname;
const htmlFiles = (dir) => readdirSync(dir).flatMap((f) => {
  const p = dir + f;
  return statSync(p).isDirectory() ? htmlFiles(p + '/') : f.endsWith('.html') ? [p] : [];
});

test('a preview build is noindex in both layers, and has no sitemap', () => {
  assert.match(readFileSync(dist + '_headers', 'utf8'), /^\/\*\n  X-Robots-Tag: noindex, nofollow/m);
  for (const f of htmlFiles(dist)) {
    const h = readFileSync(f, 'utf8');
    assert.ok(h.includes('<meta name="robots" content="noindex, nofollow">'), f);
    assert.ok(!h.includes('<!--robots-->'), f);
  }
  assert.equal(existsSync(dist + 'sitemap.xml'), false);
});

test('robots.txt exists and never blocks the crawl a noindex needs', () => {
  const r = readFileSync(dist + 'robots.txt', 'utf8');
  assert.match(r, /^User-agent: \*/);
  assert.doesNotMatch(r, /Disallow: \/\s*$/m);
});

test('netlify.toml no longer sets X-Robots-Tag itself', () => {
  assert.doesNotMatch(readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8'), /X-Robots-Tag\s*=/);
});

const policy = (env, expr) => execFileSync(process.execPath, ['--input-type=module', '-e',
  `const m = await import(${JSON.stringify(new URL('../src/indexing.mjs', import.meta.url).href)}); console.log(JSON.stringify(${expr}));`],
  { env: { PATH: process.env.PATH, ...env } }).toString().trim();

test('launch needs HOC_INDEX=1 on the production context', () => {
  assert.equal(policy({}, 'm.LAUNCH'), 'false');
  assert.equal(policy({ HOC_INDEX: '1' }, 'm.LAUNCH'), 'true');
  assert.equal(policy({ HOC_INDEX: '1', CONTEXT: 'production' }, 'm.LAUNCH'), 'true');
  assert.equal(policy({ HOC_INDEX: '1', CONTEXT: 'deploy-preview' }, 'm.LAUNCH'), 'false');
  assert.equal(policy({ HOC_INDEX: '1', CONTEXT: 'branch-deploy' }, 'm.LAUNCH'), 'false');
});

test('after launch, directory pages index and demos, tools and private screens do not', () => {
  const on = { HOC_INDEX: '1', CONTEXT: 'production' };
  for (const p of ['index.html', 'b/jills-diner/index.html', 'c/restaurants/index.html', 'n/downtown/index.html', 'events/index.html', 'visit/index.html'])
    assert.equal(policy(on, `m.indexable(${JSON.stringify(p)})`), 'true', p);
  for (const p of ['gills/index.html', 'tacolumbus/index.html', 'big-cheese/index.html', 'tasty-express/index.html', 'rohdes/index.html',
    'pickup/board/index.html', 'owners/inbox/index.html', 'obituaries/review/index.html', 'saved/index.html',
    'explore/index.html', 'events/print/index.html', 'es/visit/index.html', '404.html'])
    assert.equal(policy(on, `m.indexable(${JSON.stringify(p)})`), 'false', p);
  const headers = JSON.parse(policy(on, 'm.headersFile()'));
  assert.doesNotMatch(headers, /^\/\*$/m);
  assert.match(headers, /^\/gills\/\*\n  X-Robots-Tag: noindex/m);
  assert.match(JSON.parse(policy(on, 'm.robotsTxt("https://x.test")')), /Sitemap: https:\/\/x\.test\/sitemap\.xml/);
});

test('every demo storefront the build makes is on the never-index list', async () => {
  const { pages } = await import('../src/pages/storefronts.mjs');
  const { neverIndexed } = await import('../src/indexing.mjs');
  for (const p of pages) assert.ok(neverIndexed(`${p.slug}/index.html`), p.slug);
});

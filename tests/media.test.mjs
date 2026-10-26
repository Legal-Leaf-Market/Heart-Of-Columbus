// Business photos are third-party work, so each one needs its permission,
// source and checked date, a real file, and a listing to belong to.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { existsSync, readdirSync } from 'node:fs';
import { MEDIA } from '../src/data/media.mjs';
import { directory } from '../src/data/directory.mjs';

const root = new URL('../public/business-media/', import.meta.url);

test('every media entry is for a listed business and carries permission, source, credit and date', () => {
  const slugs = new Set(directory.map((b) => b.slug));
  for (const [slug, m] of Object.entries(MEDIA)) {
    assert.ok(slugs.has(slug), `${slug}: not a directory slug`);
    assert.ok(m.permission && m.credit, `${slug}: permission and credit`);
    assert.match(m.sourceUrl, /^https?:\/\//, slug);
    assert.match(m.checked, /^\d{4}-\d{2}-\d{2}$/, slug);
    for (const f of [m.cover, m.logo, ...(m.gallery || [])].filter(Boolean)) {
      assert.ok(f.alt && f.width && f.height, `${slug}/${f.file}: alt and size`);
      assert.ok(existsSync(new URL(`${slug}/${f.file}`, root)), `${slug}/${f.file}: file missing`);
    }
    assert.ok(!JSON.stringify(m).includes('—'), `${slug}: em dash`);
  }
});

test('nothing sits in public/business-media without an approved entry', () => {
  if (!existsSync(root)) return;
  for (const slug of readdirSync(root)) {
    const m = MEDIA[slug];
    assert.ok(m, `${slug}: files without a media entry`);
    const listed = new Set([m.cover, m.logo, ...(m.gallery || [])].filter(Boolean).map((f) => f.file));
    for (const f of readdirSync(new URL(`${slug}/`, root))) assert.ok(listed.has(f), `${slug}/${f}: not in the manifest`);
  }
});

test('a card shows an approved photo, and an entry missing its permission shows nothing', async () => {
  const { card } = await import('../src/site.mjs');
  const b = directory.find((x) => x.slug === 'jills-diner');
  const cover = { file: 'cover.webp', width: 1200, height: 800, alt: 'The counter' };
  MEDIA['jills-diner'] = { cover, sourceUrl: 'https://example.org', permission: 'Owner email, 2026-11-02', credit: 'Photo: the owner', checked: '2026-11-02' };
  try {
    assert.match(card(b), /src="\/business-media\/jills-diner\/cover\.webp" width="1200" height="800"/);
    MEDIA['jills-diner'] = { cover, sourceUrl: 'https://example.org', credit: 'Photo: the owner', checked: '2026-11-02' };
    assert.doesNotMatch(card(b), /business-media/);
  } finally {
    delete MEDIA['jills-diner'];
  }
});

test('no page loads a business photo from somebody else’s server', async () => {
  const { readFileSync, readdirSync, statSync } = await import('node:fs');
  const dist = new URL('../dist/', import.meta.url).pathname;
  const walk = (d) => readdirSync(d).flatMap((f) => (statSync(d + f).isDirectory() ? walk(d + f + '/') : f.endsWith('.html') ? [d + f] : []));
  for (const f of walk(dist + 'b/').slice(0, 2000)) {
    for (const m of readFileSync(f, 'utf8').matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g))
      assert.match(m[1], /^https:\/\/upload\.wikimedia\.org\//, `${f.slice(dist.length)}: ${m[1]}`);
  }
});

test('every listing without photos invites the owner to send some', async () => {
  const { readFileSync } = await import('node:fs');
  const html = readFileSync(new URL('../dist/b/jills-diner/index.html', import.meta.url), 'utf8');
  assert.match(html, /\/owners\/\?b=jills-diner&amp;want=photos#claim/);
  assert.match(readFileSync(new URL('../dist/owners/index.html', import.meta.url), 'utf8'), /name="wants" value="photos"/);
});

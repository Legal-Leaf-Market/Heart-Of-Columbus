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

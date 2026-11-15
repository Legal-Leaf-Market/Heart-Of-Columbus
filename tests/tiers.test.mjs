// Business page tiers: an outline until claimed, the owner's things once
// claimed, the business's own brand once it is a paying Founding Member.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { BRANDS, FONTS, paletteFor, contrast } from '../src/data/brands.mjs';
import { CLAIMED, tierOf } from '../src/data/claims.mjs';
import { MEMBERS } from '../src/data/members.mjs';
import { directory } from '../src/data/directory.mjs';

const dist = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const HEX = /^#[0-9a-f]{6}$/i;

test('every brand kit belongs to a member, says where it came from, and reads well', () => {
  for (const [slug, k] of Object.entries(BRANDS)) {
    assert.ok(MEMBERS[slug], `${slug}: kits are for Founding Members`);
    assert.ok(['own', 'owner', 'draft'].includes(k.from), slug);
    assert.ok(k.source && /^\d{4}-\d{2}-\d{2}$/.test(k.checked) && k.note, `${slug}: source, checked, note`);
    for (const c of ['brand', 'deep', 'accent', 'paper']) if (k[c]) assert.match(k[c], HEX, `${slug}.${c}`);
    if (k.font) assert.ok(FONTS.includes(k.font), `${slug}: ${k.font} is self-hosted`);
    assert.ok(!('logo' in k), `${slug}: logos live in media.mjs, with permission`);
    const p = paletteFor(slug, '#000000');
    assert.ok(contrast(p.brand, p.on) >= 4.5, `${slug}: button text on brand`);
    assert.ok(contrast(p.deep, p.paper) >= 4.5, `${slug}: headline on paper`);
  }
});

test('claimed needs a person: a confirmed record, published words, permitted photos or a partnership', () => {
  for (const [slug, c] of Object.entries(CLAIMED)) assert.ok(c.by && c.confirmed, slug);
  for (const b of directory) if (tierOf(b.slug) === 'member') assert.ok(MEMBERS[b.slug]);
});

test('each tier renders as itself', () => {
  const listed = directory.find((b) => tierOf(b.slug) === 'listed');
  const l = dist(`b/${listed.slug}/index.html`);
  assert.match(l, /class="tier-listed"/);
  assert.match(l, /Outline listing/);
  assert.match(l, /This page is an outline/);
  assert.match(l, /Claim this page free/);
  for (const slug of Object.keys(MEMBERS)) {
    const m = dist(`b/${slug}/index.html`);
    assert.match(m, /class="tier-member" style="--b:#[0-9a-f]{6}/i, slug);
    assert.match(m, /★ Founding Member #\d+/, slug);
    assert.match(m, /It pays Heart of Columbus \$\d+ a month/, `${slug}: still says it pays`);
  }
});

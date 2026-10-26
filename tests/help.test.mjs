// The resource center only lists what a cited page says, every phone number
// dials, and the stories cite their facts.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { HELP, FIRST, MEALS, helpItems } from '../src/data/help.mjs';
import { STORIES, SOURCE_NAMES } from '../src/data/help-stories.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const visible = (h) => h.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, '\n');
const PHONE = /^(\d{3}|\d{3}-\d{3}-\d{4})$/;

test('every resource has a source, a checked date and dialable numbers', () => {
  assert.ok(helpItems.length > 40);
  const slugs = new Set();
  for (const i of helpItems) {
    assert.ok(!slugs.has(i.slug), `duplicate ${i.slug}`); slugs.add(i.slug);
    assert.match(i.source, /^https:\/\//, i.slug);
    assert.match(i.checked, /^\d{4}-\d{2}-\d{2}$/, i.slug);
    for (const [, n] of i.phones || []) assert.match(n, PHONE, `${i.slug}: ${n}`);
    for (const [, u] of i.links || []) assert.match(u, /^https:\/\//, i.slug);
    for (const [text, u] of i.more || []) assert.ok(text && /^https:\/\//.test(u), `${i.slug}: ${text}`);
    if (i.form) assert.ok((i.links || []).length, `${i.slug} is tagged apply online but has no link`);
    if (i.jump) assert.ok(helpItems.some((o) => o.slug === i.jump), `${i.slug}: jump to ${i.jump}`);
    assert.ok(!/[—–]| - /.test(JSON.stringify(i)), `${i.slug}: dash`);
  }
  for (const f of FIRST) assert.match(f.number, PHONE, f.label);
  for (const m of MEALS) assert.ok(!/[—–]| - /.test(m.join(' ')), m[1]);
});

test('the page shows every resource, every meal, the card and a QR code', () => {
  const html = read('help/index.html');
  for (const i of helpItems) assert.ok(html.includes(`id="${i.slug}"`), i.slug);
  for (const g of HELP) assert.ok(html.includes(`id="${g.id}"`), g.id);
  for (const [, where] of MEALS) assert.ok(html.includes(where.split(',')[0]), where);
  assert.ok(html.includes('href="tel:211"') && html.includes('href="tel:988"'));
  assert.ok(html.includes('href="/help/card/"'));
  assert.match(html, /<svg class="hp-qr"/);
  assert.ok(html.includes('not affiliated'));
  assert.ok(html.includes('noindex'));
});

test('the wallet card sheet prints ten cards with the QR code', () => {
  const html = read('help/card/index.html');
  assert.equal(html.match(/class="hc-card"/g).length, 10);
  assert.equal(html.match(/<svg class="hc-qr"/g).length, 10);
  assert.match(read('help/qr.svg'), /^<svg/);
});

test('stories cite their sources, name them, and keep quotes to the record', () => {
  for (const s of STORIES) {
    const cited = s.body.flatMap((b) => b.src || []);
    assert.ok(cited.length >= 1, s.slug);
    for (const u of cited) { assert.match(u, /^https:\/\//, s.slug); assert.ok(SOURCE_NAMES[u], `${s.slug}: unnamed source ${u}`); }
    // A paragraph with a quotation must cite where it was said.
    for (const b of s.body) if (b.p && /“/.test(b.p)) assert.ok((b.src || []).length, `${s.slug}: quote without a source`);
    const html = read(`help/${s.slug}/index.html`);
    assert.ok(html.includes('id="src-1"'), s.slug);
    if (s.draft) assert.ok(html.includes('Draft.'), `${s.slug} must say it is a draft`);
  }
});

test('no dashes in the visible text of the help pages', () => {
  for (const p of ['help/index.html', 'help/card/index.html', ...STORIES.map((s) => `help/${s.slug}/index.html`)]) {
    const bad = visible(read(p)).split('\n').filter((l) => /[‒-―]| - /.test(l));
    assert.deepEqual(bad, [], p);
  }
});

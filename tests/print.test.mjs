// The December 2026 print edition (/print/2026-12/): sixteen pages, every
// history piece approved, every news slot written by a named person and
// edited by someone else, puzzles that only teach what our pages say, and QR
// codes that open real pages.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { EDITION } from '../src/print/edition-2026-12.mjs';
import { BRIEFS } from '../src/print/briefs.mjs';
import { CROSSWORD, WORDSEARCH, buildCrossword, buildWordSearch } from '../src/print/puzzles.mjs';
import { almanac } from '../src/print/almanac.mjs';
import { ARTICLES } from '../src/data/history/index.mjs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { STAFF } from '../src/data/staff.mjs';
import { stories } from '../src/news/content.mjs';
import { readiness, TODO } from '../src/pages/print-pages.mjs';
import { neverIndexed } from '../src/indexing.mjs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const html = readFileSync(dist('print/2026-12/index.html'), 'utf8');
const historyBy = Object.fromEntries(ARTICLES.map((a) => [`${a.group}/${a.slug}`, a]));
const mods = EDITION.pages.flatMap((p) => p.rows.flatMap((r) => r.mods.flatMap((m) => (m.type === 'stack' ? m.mods : [m])).map((m) => ({ ...m, page: p.n }))));
const letters = (s) => String(s).toUpperCase().replace(/[^A-Z]/g, '');

test('sixteen pages, numbered in order, each five columns wide', () => {
  assert.deepEqual(EDITION.pages.map((p) => p.n), Array.from({ length: 16 }, (_, i) => i + 1));
  const pages = [...html.matchAll(/<section class="pe-sheet[^"]*" data-page="(\d+)"/g)].map((m) => Number(m[1]));
  assert.deepEqual(pages, Array.from({ length: 16 }, (_, i) => i + 1));
  for (const p of EDITION.pages) for (const r of p.rows) assert.equal(r.mods.reduce((n, m) => n + m.span, 0), 5, `page ${p.n} row spans`);
  for (const p of EDITION.pages) assert.ok(p.rows.filter((r) => r.fill).length <= 1, `page ${p.n}: one fill row at most`);
});

test('the edition is laid out at tabloid size and never indexed', () => {
  const css = readFileSync(new URL('../public/css/print-edition.css', import.meta.url), 'utf8');
  assert.match(css, /@page \{ size: 11in 17in; margin: 0; \}/);
  assert.match(css, /\.pe-sheet \{[^}]*width: 11in; height: 17in;/);
  assert.ok(neverIndexed('/print/2026-12/') && neverIndexed('/print/2026-12/status/'));
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
});

test('every history piece in the edition is approved and sourced', () => {
  const paths = [...mods.filter((m) => m.type === 'history').map((m) => m.path), ...EDITION.gathers.map((g) => g[0])];
  assert.ok(paths.length >= 15);
  for (const p of paths) {
    const a = historyBy[p];
    assert.ok(a, `no history article ${p}`);
    assert.equal(a.status, 'approved', `${p} is not approved`);
    assert.ok(a.sources.length >= 2, `${p} needs sources`);
  }
  assert.equal(new Set(paths).size, paths.length, 'a history piece runs twice');
});

test('news slots: Claude never writes news, so each one names a brief or a guide, and the two-person rule', () => {
  for (const m of mods.filter((x) => x.type === 'writer')) {
    assert.ok(m.brief ? BRIEFS[m.brief] : m.guide, `${m.id}: a slot needs a brief or a guide for its writer`);
    assert.ok(STAFF[m.editor]?.editor, `${m.id}: the editor must be a staff editor`);
    assert.notEqual(m.writer, m.editor, `${m.id}: nobody edits their own story`);
    if (m.writer) assert.ok(STAFF[m.writer], `${m.id}: unknown writer`);
    assert.ok(m.words > 0);
  }
  // Until a writer files, the page shows the brief, labeled so it never prints as a story.
  const filed = (id) => new URL(`../content/print/2026-12/${id}.md`, import.meta.url);
  const writers = mods.filter((x) => x.type === 'writer' && !x.fallback);
  if (writers.some((m) => !existsSync(filed(m.id)))) assert.match(html, /Writer’s brief · not for print/);
  // A first draft by Claude (the owner's third exception in CLAUDE.md) stays a
  // draft with no byline and lists what it was written from.
  for (const m of writers.filter((x) => existsSync(filed(x.id)))) {
    const src = readFileSync(filed(m.id), 'utf8');
    const front = src.split(/^---$/m)[1] || '';
    if (!/^drafted:/m.test(front)) continue;
    assert.match(front, /^status: draft$/m, `${m.id}: a Claude draft cannot be ready`);
    assert.match(front, /^bylines: \[\]$/m, `${m.id}: a Claude draft carries no byline`);
    assert.match(front, /^sources:\n\s+- name:/m, `${m.id}: a draft lists its sources`);
  }
});

test('every story the edition reprints is published, and the pull quote is the writer’s own words', () => {
  const slugs = mods.flatMap((m) => [m.type === 'story' ? m.slug : null, m.fallback?.slug]).filter(Boolean);
  for (const s of slugs) assert.ok(stories.find((x) => x.slug === s), `${s} is not a published story`);
  const quote = mods.find((m) => m.box === 'byb-quote').quote;
  assert.ok(stories.find((x) => x.slug === 'my-father-my-hero').body.replace(/[*_]/g, '').includes(quote));
});

test('crossword clues only teach what our own pages say', () => {
  const landmarkText = letters(LANDMARKS.map((l) => [l.name, l.architect, l.what, l.note].join(' ')).join(' '));
  for (const [word, clue, src] of CROSSWORD) {
    const hay = src === 'landmarks' ? landmarkText : letters([historyBy[src]?.title, historyBy[src]?.dek, ...(historyBy[src]?.body || [])].join(' '));
    assert.ok(src === 'landmarks' || historyBy[src], `${word}: no source ${src}`);
    assert.ok(hay.includes(word), `${word} (${clue}) is not in ${src}`);
  }
  for (const w of WORDSEARCH.words) assert.ok(landmarkText.includes(w) || ARTICLES.some((a) => letters(a.body.join(' ')).includes(w)), `${w} is not on our pages`);
});

test('the puzzles are the same every build and their answers match', () => {
  const a = buildCrossword(), b = buildCrossword();
  assert.deepEqual(a.grid, b.grid);
  assert.ok(a.across.length + a.down.length >= 20, 'the crossword places at least 20 words');
  for (const p of [...a.across, ...a.down]) {
    const word = Array.from(p.word, (_, i) => a.grid[p.r + (p.dir === 'down' ? i : 0)][p.c + (p.dir === 'across' ? i : 0)]).join('');
    assert.equal(word, p.word);
  }
  const ws = buildWordSearch();
  for (const w of ws.where) assert.equal(Array.from(w.word, (_, i) => ws.grid[w.r + w.dr * i][w.c + w.dc * i]).join(''), w.word);
  assert.equal(ws.where.length, WORDSEARCH.words.length);
});

test('the almanac is computed, and in a sane range for Columbus', () => {
  const al = almanac(2026);
  assert.equal(al.solstice.date, '2026-12-21');
  assert.match(al.rows[0].rise, /^7:\d\d AM$/);
  assert.match(al.rows[0].set, /^5:\d\d PM$/);
  assert.ok(al.earliestSunset.date >= '2026-12-01' && al.earliestSunset.date <= '2026-12-14');
});

test('every QR code opens a page this site builds', () => {
  const targets = [...new Set([...html.matchAll(/aria-label="QR code for ([^"]+)"/g)].map((m) => m[1]))];
  assert.ok(targets.length >= 30);
  for (const t of targets) {
    const path = t.replace(/^[^/]+/, '').replace(/\/?$/, '/');
    assert.ok(existsSync(dist(`${path.slice(1)}index.html`)), `QR target ${path} is not built`);
  }
});

test('the readiness page lists every slot and every history piece', () => {
  const items = readiness();
  const slots = mods.filter((m) => m.type === 'writer').map((m) => m.id);
  for (const s of slots) assert.ok(items.find((i) => i.id === s), s);
  assert.ok(TODO.length >= 5);
  const status = readFileSync(dist('print/2026-12/status/index.html'), 'utf8');
  for (const s of slots) assert.ok(status.includes(`<code>${s}</code>`), `status page is missing ${s}`);
});

test('the five coloring portraits are part of the edition before JavaScript runs', () => {
  const placements = { 2: 'turtle', 3: 'anderson', 8: 'cardinal', 10: 'dunes', 15: 'cataract' };
  const pages = html.split(/<section class="pe-sheet[^"]*" data-page="/).slice(1);
  for (const [number, illustration] of Object.entries(placements)) {
    const page = pages.find((source) => source.startsWith(number + '"'));
    assert.ok(page, `Missing page ${number}`);
    const body = page.split('</section>\n<template')[0].split('<template id="pe-fillers">')[0];
    assert.match(body, new RegExp(`class="pe-color-card pe-color-portrait" data-coloring="${illustration}"`));
    assert.ok(body.includes(`/print-media/coloring-${illustration}-portrait.webp`));
  }
  assert.doesNotMatch(html, /class="[^"]*pe-color-preview|>Print Indiana coloring sheets<|>Color this scene</);
});

// Columbus history: ten sourced articles a decade, no dashes, nothing unsourced.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { DECADES, SERIES, ARTICLES, DECADE_ARTICLES, sectionBySlug } from '../src/data/history/index.mjs';
import { landmarkBySlug } from '../src/data/landmarks.mjs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const text = (a) => [a.title, a.dek, a.when, a.byline, a.note || '', ...a.body, ...a.sources.map(([l]) => l)];

// Decades land in batches, oldest first; each one lands whole.
const LANDED = DECADES.filter((d) => d.items.length);

test('ten articles in each decade, 1930s to 2020s', () => {
  assert.deepEqual(DECADES.map((d) => d.slug), ['1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']);
  assert.ok(LANDED.length >= 5);
  assert.deepEqual(LANDED, DECADES.slice(0, LANDED.length), 'decades land oldest first');
  for (const d of LANDED) assert.equal(d.items.length, 10, d.slug);
});

test('every article is complete and every history article cites at least two sources', () => {
  const seen = new Set();
  for (const a of ARTICLES) {
    assert.ok(!seen.has(a.path), `duplicate ${a.path}`);
    seen.add(a.path);
    assert.match(a.slug, /^[a-z0-9-]+$/, a.slug);
    assert.ok(sectionBySlug[a.section], `${a.slug}: section ${a.section}`);
    assert.ok(a.title && a.dek && a.when, a.slug);
    assert.ok(a.body.length >= 3, `${a.slug}: body`);
    if (a.landmark) assert.ok(landmarkBySlug[a.landmark], `${a.slug}: landmark ${a.landmark}`);
    for (const [l, u] of a.sources) assert.ok(l && /^https:\/\//.test(u), `${a.slug}: source ${l}`);
    if (a.kind === 'history') {
      assert.ok(a.sources.length >= 2, `${a.slug}: needs two sources`);
      assert.match(a.checked, /^\d{4}-\d{2}-\d{2}$/, a.slug);
      assert.ok(a.words >= 250, `${a.slug}: ${a.words} words`);
    }
    if (a.kind === 'tribute') {
      assert.ok(a.sources.some(([, u]) => u.includes('therepublic.com')), `${a.slug}: link the original in The Republic`);
      assert.ok(a.original && /Brian Blair/.test(a.original.by) && a.original.date, `${a.slug}: credit Brian Blair and the original date`);
    }
  }
});

test('the decade articles fall in their decade', () => {
  for (const a of DECADE_ARTICLES) {
    const y = Number(String(a.when).match(/\d{4}/)?.[0]);
    const start = Number(a.decade.slice(0, 4));
    assert.ok(y >= start && y < start + 10, `${a.slug}: ${a.when} is not in the ${a.decade}`);
  }
});

test('no dashes in anything a reader sees', () => {
  for (const a of ARTICLES) for (const s of text(a)) {
    assert.ok(!/[‒-―]/.test(s), `${a.slug}: em or en dash in "${s.slice(0, 60)}"`);
    assert.ok(!/\s-\s|\s--?\s|^-|-$/.test(s), `${a.slug}: hyphen used as a dash in "${s.slice(0, 60)}"`);
  }
});

test('opinion is labeled and bylined, and history is never opinion', () => {
  for (const a of ARTICLES) {
    if (['opinion', 'essay'].includes(a.kind)) assert.notEqual(a.byline, 'Heart of Columbus', `${a.slug}: opinion needs a person's byline`);
  }
  for (const a of SERIES.find((s) => s.slug === 'publisher').items) assert.ok(['opinion', 'essay'].includes(a.kind), a.slug);
});

test('there is a Faith story in every decade', () => {
  for (const d of LANDED) assert.ok(d.items.some((a) => a.section === 'faith'), d.slug);
});

test('pages and the print manifest are built', () => {
  for (const a of ARTICLES) assert.ok(existsSync(dist(a.path.slice(1) + 'index.html')), a.path);
  const html = readFileSync(dist('history/index.html'), 'utf8');
  assert.ok(html.includes('noindex'));
  for (const d of LANDED) assert.ok(html.includes(`href="/history/${d.slug}/"`), d.slug);
  const m = JSON.parse(readFileSync(dist('history/articles.json'), 'utf8'));
  assert.equal(m.articles.length, ARTICLES.length);
  for (const a of m.articles) assert.ok(a.words > 0 && a.print.columnInches > 0 && a.section, a.slug);
  const one = readFileSync(dist(DECADE_ARTICLES[0].path.slice(1) + 'index.html'), 'utf8');
  for (const [, u] of DECADE_ARTICLES[0].sources) assert.ok(one.includes(u.replace(/&/g, '&amp;')), u);
});

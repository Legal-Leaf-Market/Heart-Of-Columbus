// The film trail lists only landmarks a cited source places in the film,
// and no page in the visitor layer shows a dash in its visible text.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { FILM, FILM_STOPS } from '../src/data/film.mjs';
import { landmarkBySlug } from '../src/data/landmarks.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');

test('every film stop is a landmark with a source and a checked date', () => {
  for (const x of [...FILM.facts, ...FILM_STOPS]) {
    assert.match(x.source, /^https:\/\//);
    assert.match(x.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
  const html = read('film/index.html');
  for (const s of FILM_STOPS) {
    assert.ok(landmarkBySlug[s.landmark], s.landmark);
    assert.ok(html.includes(`href="/l/${s.landmark}/"`), s.landmark);
    assert.ok(read(`l/${s.landmark}/index.html`).includes('href="/film/"'), `${s.landmark}: links back`);
  }
});

// Visible text only: tags, scripts and styles removed, plus the attributes people read.
const visible = (h) => {
  const body = h.replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
  const attrs = [...body.matchAll(/\s(?:alt|title|aria-label|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  return body.replace(/<[^>]+>/g, '\n') + '\n' + attrs.join('\n');
};

test('no dashes in the visible text of the visitor pages, in either language', () => {
  const dirs = ['visit', 'free', 'film', 'skate', 'holidays'];
  const pages = [
    ...dirs.flatMap((d) => [`${d}/index.html`, `es/${d}/index.html`]),
    ...['l', 'trips'].flatMap((d) => readdirSync(new URL(`../dist/${d}/`, import.meta.url)).flatMap((s) => [`${d}/${s}/index.html`, `es/${d}/${s}/index.html`])),
  ];
  for (const p of pages) {
    const bad = visible(read(p)).split('\n').filter((l) => /[‒-―]| - /.test(l));
    assert.deepEqual(bad, [], p);
  }
});

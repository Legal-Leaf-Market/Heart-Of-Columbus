// Spanish pages: every sourced line has a translation, each page is marked
// Spanish and says the translation is under review, and both versions point
// at each other.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { VISIT_SECTIONS } from '../src/data/visit.mjs';
import { FREE } from '../src/data/free.mjs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { TRIPS } from '../src/data/trips.mjs';
import { FILM, FILM_STOPS } from '../src/data/film.mjs';
import { SMALL_BUSINESS_SATURDAY } from '../src/data/holidays.mjs';
import { FACTS, REVIEW_NOTE, UI, CATEGORY, PAGES } from '../src/i18n/es.mjs';
import { CATEGORIES } from '../src/data/directory.mjs';

const read = (p) => readFileSync(new URL(`../dist/${p}`, import.meta.url), 'utf8');
const visitFacts = VISIT_SECTIONS.flatMap((s) => s.facts.map((f) => f.text));
const freeFacts = FREE.flatMap((g) => g.items.flatMap((i) => [i.what, ...(i.more || []).map(([m]) => m)]));
const filmFacts = [...FILM.facts.map((f) => f.text), ...FILM_STOPS.map((x) => x.line)];
const lmFacts = LANDMARKS.flatMap((l) => [l.what, ...(l.note ? [l.note] : [])]);

test('every translated line has Spanish, and no stale translations are left', () => {
  const en = [...visitFacts, ...freeFacts, ...lmFacts, ...filmFacts, SMALL_BUSINESS_SATURDAY.text];
  for (const x of en) assert.ok(FACTS[x], `missing Spanish for: ${x}`);
  for (const k of Object.keys(FACTS)) assert.ok(en.includes(k), `no longer on any page: ${k}`);
  for (const c of CATEGORIES) assert.ok(CATEGORY[c.slug], c.slug);
  for (const tr of TRIPS) assert.ok(PAGES.trip.titles[tr.slug], tr.slug);
  for (const g of FREE) assert.ok(PAGES.free.groups[g.id], g.id);
});

const pairs = [
  ['visit/', visitFacts],
  ['free/', freeFacts],
  ['film/', filmFacts],
  ['holidays/', [SMALL_BUSINESS_SATURDAY.text]],
  ...LANDMARKS.map((l) => [`l/${l.slug}/`, [l.what]]),
  ...TRIPS.map((tr) => [`trips/${tr.slug}/`, []]),
];

test('Spanish pages are Spanish, marked for review, and linked both ways', () => {
  for (const [p, facts] of pairs) {
    const es = read(`es/${p}index.html`), en = read(`${p}index.html`);
    assert.ok(es.includes('<html lang="es">'), p);
    assert.ok(es.includes(REVIEW_NOTE), p);
    assert.ok(es.includes('noindex'), p);
    for (const h of [es, en]) assert.ok(h.includes('hreflang="en" href="') && h.includes('hreflang="es" href="'), p);
    assert.ok(en.includes(`href="/es/${p}" class="lang-link"`), p);
    assert.ok(es.includes(`<span>${UI.switchTo}</span>`), p);
    for (const f of facts) assert.ok(es.includes(FACTS[f]), `${p}: ${f.slice(0, 40)}`);
  }
});

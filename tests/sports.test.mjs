// Sports and the Sentinels dashboard: every fact and game has a source,
// scores only for games already played, and the app installs.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { TEAM, FACTS, GAMEDAY, GAMES, NEWS, SPORTS, STORIES, record } from '../src/data/sports.mjs';

const dist = (p) => new URL(`../dist/${p}`, import.meta.url);
const read = (p) => readFileSync(dist(p), 'utf8');

test('every fact has a source and a checked date', () => {
  for (const f of [...FACTS, ...GAMEDAY]) {
    assert.match(f.source, /^https:\/\//, f.text);
    assert.match(f.checked, /^\d{4}-\d{2}-\d{2}$/, f.text);
  }
  for (const g of SPORTS) for (const x of g.teams || []) {
    assert.match(x.url, /^https:\/\//, x.id);
    if (x.what) assert.match(x.source, /^https:\/\//, x.id);
    for (const [m, u] of x.more || []) assert.ok(m && /^https:\/\//.test(u), `${x.id}: ${m}`);
  }
  for (const n of NEWS) assert.ok(/^https:\/\//.test(n.url) && n.outlet, n.title);
  for (const s of STORIES) assert.ok(s.byline && s.date && s.url, 'a story needs a byline, a date and a link');
});

test('the season: 56 games, 28 at home, in order, no score before the game', () => {
  assert.equal(GAMES.length, 56);
  assert.equal(GAMES.filter((g) => g.home).length, 28);
  assert.equal(new Set(GAMES.map((g) => g.id)).size, GAMES.length);
  for (let i = 1; i < GAMES.length; i++) assert.ok(GAMES[i - 1].date <= GAMES[i].date, GAMES[i].date);
  for (const g of GAMES) {
    if (g.time) assert.match(g.time, /^\d{2}:\d{2}$/, g.id);
    if (g.result) assert.ok(g.result === 'postponed' || (g.result.length === 2 && g.result[0] !== g.result[1]), g.id);
    if (g.result) assert.ok(g.date <= TEAM.checked, `${g.id} has a score but was not played when checked`);
  }
  const r = record();
  assert.equal(r.w + r.l, GAMES.filter((g) => Array.isArray(g.result)).length);
});

test('the dashboard installs: manifest, icons, worker, calendar', () => {
  const m = JSON.parse(read('sports/sentinels/manifest.webmanifest'));
  assert.equal(m.start_url, '/sports/sentinels/');
  assert.equal(m.display, 'standalone');
  for (const i of m.icons) assert.ok(existsSync(dist(i.src.slice(1))), i.src);
  assert.ok(m.icons.some((i) => i.sizes === '512x512') && m.icons.some((i) => i.sizes === '192x192'));
  assert.match(read('sports/sentinels/sw.js'), /addEventListener\('fetch'/);
  const ics = read('sports/sentinels/games.ics');
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, GAMES.filter((g) => g.result !== 'postponed').length);
  // 7:30 PM in Columbus on Oct 30 (daylight time) and Nov 13 (standard time).
  assert.ok(ics.includes('DTSTART:20261030T233000Z'));
  assert.ok(ics.includes('DTSTART:20261113T003500Z') || ics.includes('DTSTART:20261114T003500Z'));
});

test('the pages read as ours: noindex, not affiliated, no team logo, linked from the footer', () => {
  const app = read('sports/sentinels/index.html');
  assert.ok(app.includes('noindex'));
  assert.ok(app.includes('rel="manifest"'));
  assert.match(app, /not affiliated with or endorsed by the Indiana Sentinels/);
  assert.ok(!/<img[^>]+(logo|hockeyshift)/i.test(app), 'no team logo');
  for (const g of GAMES) assert.ok(app.includes(`id="g-${g.id}"`), g.id);
  const hub = read('sports/index.html');
  for (const g of SPORTS) assert.ok(hub.includes(`id="${g.id}"`), g.id);
  assert.ok(hub.includes('href="/sports/sentinels/"'));
  assert.ok(read('index.html').includes('href="/sports/"'));
});

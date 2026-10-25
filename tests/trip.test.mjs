// Saved places as a trip: the saved page carries the trip tools, and
// landmarks and events can be saved alongside businesses.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { LANDMARKS } from '../src/data/landmarks.mjs';
import { EVENTS } from '../src/data/events.mjs';

const read = (f) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');

test('the saved page has share, day check, walking order, print and the trip data', () => {
  const html = read('saved/index.html');
  for (const hook of ['data-trip-share', 'data-trip-day', 'data-trip-walk', 'data-trip-print', 'data-trip-adopt', 'value="walk"']) assert.ok(html.includes(hook), hook);
  assert.ok(html.indexOf('/js/trip.js') < html.indexOf('/js/explore.js'), 'trip.js must load before explore.js');
  const data = JSON.parse(html.match(/<script type="application\/json" id="page-data">(.*?)<\/script>/s)[1]);
  assert.equal(data.landmarks.length, LANDMARKS.length);
  assert.equal(data.events.length, EVENTS.length);
  assert.ok(!read('explore/index.html').includes('data-trip-share'), 'trip tools only on /saved/');
});

test('landmarks and events can be saved with a type prefix', () => {
  for (const l of LANDMARKS) assert.ok(read(`l/${l.slug}/index.html`).includes(`data-save="l:${l.slug}"`), l.slug);
  const visit = read('visit/index.html');
  for (const e of EVENTS) assert.ok(visit.includes(`data-save="e:${e.slug}"`), e.slug);
});

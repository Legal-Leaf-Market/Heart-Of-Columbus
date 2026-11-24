// Back YOUR Blue takes reader stories: the series page leads with its newest
// story as a feature and carries a form that /api/newsroom accepts.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';

test('Back YOUR Blue: big lead, a story form, and a backend kind for it', () => {
  const html = readFileSync(new URL('../dist/news/series/back-your-blue/index.html', import.meta.url), 'utf8');
  assert.match(html, /class="sr-lead"/);
  assert.match(html, /data-newsroom="blue"/);
  for (const name of ['person', 'role', 'story', 'name', 'email', 'phone', 'ok']) assert.match(html, new RegExp(`name="${name}"`), name);
  assert.match(html, /js\/newsroom\.js\?v=/);
  const fn = readFileSync(new URL('../netlify/functions/newsroom.mjs', import.meta.url), 'utf8');
  assert.match(fn, /\n  blue: \{/);
  const js = readFileSync(new URL('../public/js/newsroom.js', import.meta.url), 'utf8');
  assert.match(js, /el\.type === 'checkbox'/, 'checkboxes send yes or nothing, not "on"');
});

// The newspaper's rules: real people only in bylines, disclosures that
// can't be forgotten, and trust pages that stay noindex until launch.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import { STAFF, SAMPLE_STAFF } from '../src/data/staff.mjs';
import { PAPER } from '../src/data/paper.mjs';
import { disclosures } from '../src/news/disclosure.mjs';

const dist = new URL('../dist/', import.meta.url);
const read = (p) => readFileSync(new URL(p, dist), 'utf8');

test('staff entries are complete and samples are clearly fake', () => {
  for (const [slug, s] of Object.entries(STAFF)) {
    assert.match(slug, /^[a-z0-9-]+$/);
    assert.ok(s.name && s.role && s.bio, slug);
    assert.ok(!s.sample, `${slug} is in STAFF but flagged sample`);
    assert.ok(existsSync(new URL(`staff/${slug}/index.html`, dist)), `no page for ${slug}`);
  }
  for (const [slug, s] of Object.entries(SAMPLE_STAFF)) {
    assert.ok(s.sample && /^Sample /.test(s.name), slug);
    assert.ok(!STAFF[slug], `${slug} is both real and sample`);
    assert.ok(!existsSync(new URL(`staff/${slug}/index.html`, dist)), `sample ${slug} got a staff page`);
  }
  assert.ok(STAFF[PAPER.publisher], 'publisher is on staff');
  if (PAPER.editor) assert.ok(STAFF[PAPER.editor]?.editor, 'editor is on staff and may approve');
});

test('tagging a partner or sponsor always adds a disclosure', () => {
  const partners = { 'some-cafe': { pickup: true } };
  const sponsors = { 'some-shop': { name: 'Some Shop' } };
  const d = disclosures(['some-cafe', 'some-shop', 'downtown'], { partners, sponsors });
  assert.deepEqual(d.map((x) => [x.slug, x.kind]), [['some-cafe', 'partner'], ['some-shop', 'sponsor']]);
  assert.equal(disclosures(['downtown'], { partners, sponsors }).length, 0);
});

test('trust pages exist, are noindex, and explain every label', () => {
  for (const p of ['about/', 'about/standards/', 'about/corrections/', 'staff/']) {
    const html = read(p + 'index.html');
    assert.match(html, /name="robots" content="noindex/, p);
  }
  const std = read('about/standards/index.html');
  for (const id of ['ethics', 'ai', 'sources', 'anonymous', 'conflicts', 'labels', 'corrections']) assert.ok(std.includes(`id="${id}"`), id);
});

// ---------- The content model (item 2) ----------
import { execFileSync } from 'node:child_process';
import { parseYaml, markdown } from '../src/news/markdown.mjs';
import { checkStory, ALL_STORIES, SAMPLES, stories, localOffset } from '../src/news/content.mjs';
import { SECTIONS } from '../src/news/sections.mjs';

test('front matter parser reads what the CMS writes', () => {
  const y = parseYaml([
    'headline: "Quoted: with a colon"', 'label: News', 'bylines: [a, b]', 'n: 3', 'draft: false',
    'sources:', '  - name: One', '    url: https://example.org/1', '  - name: Two', '    note: interview, May 1',
    'tags:', '  - x', '  - y', 'methods: >-', '  Folded', '  text.', 'developing:', '  know:', '    - A', '  dontKnow: []',
  ].join('\n'));
  assert.deepEqual(y, {
    headline: 'Quoted: with a colon', label: 'News', bylines: ['a', 'b'], n: 3, draft: false,
    sources: [{ name: 'One', url: 'https://example.org/1' }, { name: 'Two', note: 'interview, May 1' }],
    tags: ['x', 'y'], methods: 'Folded text.', developing: { know: ['A'], dontKnow: [] },
  });
  assert.throws(() => parseYaml('a: &anchor x'));
  assert.deepEqual(parseYaml('methods: We called the owner,\n  then visited.\nsources:\n  - name: A long\n      name\n    url: https://example.org'),
    { methods: 'We called the owner, then visited.', sources: [{ name: 'A long name', url: 'https://example.org' }] });
});

test('markdown escapes HTML and refuses unsafe links', () => {
  assert.equal(markdown('<script>x</script>'), '<p>&lt;script&gt;x&lt;/script&gt;</p>');
  assert.throws(() => markdown('[x](javascript:alert(1))'));
  assert.throws(() => markdown('# Two headlines'));
  assert.match(markdown('It\'s **bold** and *italic* and [a link](https://example.org).'), /It’s <strong>bold<\/strong> and <em>italic<\/em> and <a href="https:\/\/example.org" target="_blank" rel="noopener">a link<\/a>/);
  assert.equal(markdown('- one\n- two'), '<ul><li>one</li><li>two</li></ul>');
});

const good = {
  headline: 'H', label: 'News', section: 'local', bylines: ['sample-reporter'], editor: 'sample-editor', sample: true,
  published: '2026-11-02T08:00:00-05:00', tags: ['schools'], sources: [], corrections: [], images: [], body: 'Text.',
};

test('checkStory catches each broken rule', () => {
  assert.deepEqual(checkStory(good), []);
  const bad = (patch, re) => assert.ok(checkStory({ ...good, ...patch }).some((p) => re.test(p)), JSON.stringify(patch));
  bad({ label: 'Rumor' }, /label/);
  bad({ section: 'gossip' }, /section/);
  bad({ bylines: ['nobody'] }, /byline/);
  bad({ editor: 'sample-reporter' }, /not allowed to approve/);
  bad({ bylines: ['sample-editor'] }, /own story/);
  bad({ published: '2026-07-02T08:00:00-05:00' }, /offset should be -04:00/);
  bad({ published: '2026-11-02' }, /must look like/);
  bad({ label: 'Sponsored' }, /name the sponsor/);
  bad({ sponsor: 'Shop' }, /labeled Sponsored/);
  bad({ tags: ['not-a-thing-anywhere'] }, /tag/);
  bad({ images: [{ file: 'https://example.org/a.jpg', alt: 'A' }] }, /credit/);
  bad({ images: [{ file: 'https://example.org/a.jpg', credit: 'C', license: 'L' }] }, /alt/);
  bad({ sources: [{ name: 'No link' }] }, /source/);
  bad({ body: 'One — two' }, /dash/);
  bad({ sample: false, bylines: ['jacob-kennedy'], editor: 'jacob-kennedy' }, /own story/);
  bad({ sample: false, bylines: ['sample-reporter'] }, /byline/);
  assert.deepEqual(checkStory({ ...good, editor: '', draft: true }), [], 'drafts may wait for an editor');
  assert.equal(localOffset(new Date('2026-01-15T12:00:00Z')), '-05:00');
  assert.equal(localOffset(new Date('2026-07-15T12:00:00Z')), '-04:00');
});

test('no sample content in published stories, and samples stay out of the paper', () => {
  for (const s of ALL_STORIES) assert.ok(!s.sample, s.file);
  assert.ok(SAMPLES.length >= 2 && SAMPLES.every((s) => s.sample && s.href.startsWith('/news/samples/')));
  const listed = ['news/index.html', ...SECTIONS.filter((s) => !s.href).map((s) => `news/${s.slug}/index.html`)];
  for (const p of listed) assert.ok(!/\/news\/samples\/|Sampleton/.test(read(p)), `${p} links a sample`);
});

test('a story page shows label, byline, editor, sources, methods and corrections', () => {
  const html = read('news/samples/sampleton-bakery-opens/index.html');
  for (const want of ['np-label-news', 'By <span>Sample Reporter</span>', 'Edited by', 'id="references"', 'id="methods"', 'np-corr-top', 'id="corrections"', 'What we don’t know yet', 'Sample story.', 'noindex']) assert.ok(html.includes(want), want);
  assert.ok(read('news/samples/sampleton-opinion/index.html').includes('np-label-opinion'));
});

test('every published story has a page and appears in its section', () => {
  for (const s of stories) {
    const page = read(`${s.href.slice(1)}index.html`);
    assert.ok(page.includes('name="robots" content="noindex'), s.href);
    const sec = SECTIONS.find((x) => x.slug === s.section);
    if (!sec.href) assert.ok(read(`news/${sec.slug}/index.html`).includes(`href="${s.href}"`), s.href);
  }
});

// Corrections are append only: compared with the same file on origin/main
// when git has it (CI and local checkouts), skipped otherwise.
test('corrections are never edited or removed', () => {
  let base;
  try { base = execFileSync('git', ['merge-base', 'HEAD', 'origin/main'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return; }
  for (const s of ALL_STORIES) {
    let old;
    try { old = execFileSync('git', ['show', `${base}:${s.file}`], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }); } catch { continue; }
    const before = [].concat(parseYaml(old.split(/^---$/m)[1]).corrections || []).map((c) => `${c.date}|${c.text}`);
    const now = s.corrections.map((c) => `${c.date}|${c.text}`);
    assert.deepEqual(now.slice(0, before.length), before, `${s.file}: corrections changed`);
  }
});

test('the CMS offers exactly the labels, sections and staff the build accepts', async () => {
  const yml = read('admin/config.yml');
  const { LABELS } = await import('../src/news/labels.mjs');
  for (const l of Object.keys(LABELS)) assert.ok(yml.includes(`value: "${l}"`), l);
  for (const s of SECTIONS) assert.ok(yml.includes(`value: "${s.slug}"`), s.slug);
  for (const slug of Object.keys(STAFF)) assert.ok(yml.includes(`value: "${slug}"`), slug);
  for (const slug of Object.keys(SAMPLE_STAFF)) assert.ok(!yml.includes(slug), `sample ${slug} offered in the CMS`);
  assert.match(yml, /publish_mode: editorial_workflow/);
  assert.match(read('admin/index.html'), /noindex/);
});

// ---------- The story template (item 5) ----------
import { newsArticleLd } from '../src/jsonld.mjs';
import { inThisStory } from '../src/pages/news-pages.mjs';
import { inTheNews } from '../src/pages/directory-pages.mjs';
import { directory } from '../src/data/directory.mjs';
import { person } from '../src/data/staff.mjs';

// Built in memory only: a made-up story tagged with a real slug, to check the
// wiring. It is never written to content/ or dist/.
const biz = directory.find((b) => b.address);
const fake = { ...good, slug: 'wiring-check', href: '/news/2026/11/wiring-check/', tags: [biz.slug, 'downtown'], images: [{ file: '/og.png', crops: ['/a-16x9.jpg'], alt: 'A', credit: 'C', license: 'L' }] };

test('NewsArticle JSON-LD has authors with links, offset times and image crops', () => {
  const ld = newsArticleLd({ ...fake, bylines: ['jacob-kennedy'], sectionName: 'Local' }, { people: [person('jacob-kennedy')], paper: PAPER });
  assert.equal(ld['@type'], 'NewsArticle');
  assert.deepEqual(ld.author, [{ '@type': 'Person', name: 'Jacob Kennedy', url: ld.author[0].url }]);
  assert.match(ld.author[0].url, /\/staff\/jacob-kennedy\/$/);
  assert.match(ld.datePublished, /-05:00$/);
  assert.equal(ld.dateModified, ld.datePublished);
  assert.equal(ld.image.length, 2);
  assert.equal(newsArticleLd({ ...fake, label: 'Opinion' }, { people: [], paper: PAPER })['@type'], 'OpinionNewsArticle');
});

test('a story shows cards for the businesses it tags, and the business shows the story', () => {
  const html = inThisStory(fake);
  assert.ok(html.includes(`data-slug="${biz.slug}"`) && html.includes('href="/n/downtown/"') && html.includes('np-map'));
  assert.ok(inTheNews(biz, [fake]).includes('href="/news/2026/11/wiring-check/"'));
  assert.equal(inTheNews(biz, []), '');
});

// ---------- Weather, river and breaking mode (item 7) ----------
import { activeAlert, alertBanner, ALERT } from '../src/news/alert.mjs';

test('the alert banner never shows an expired, undated or inactive alert', () => {
  const now = new Date('2026-11-02T12:00:00-05:00');
  const a = { active: true, level: 'breaking', headline: 'Road closed', expires: '2026-11-02T18:00:00-05:00' };
  assert.ok(activeAlert(a, now) && alertBanner(a, now).includes('Road closed'));
  assert.equal(alertBanner({ ...a, expires: '2026-11-02T11:59:00-05:00' }, now), '', 'expired');
  assert.equal(alertBanner({ ...a, expires: '' }, now), '', 'no expiry');
  assert.equal(alertBanner({ ...a, expires: 'soon' }, now), '', 'bad date');
  assert.equal(alertBanner({ ...a, active: false }, now), '', 'inactive');
  assert.equal(alertBanner({ ...a, headline: '' }, now), '', 'no headline');
  assert.match(alertBanner(a, now), /data-expires="2026-11-02T18:00:00-05:00"/, 'the browser hides it at expiry too');
  if (!activeAlert(ALERT)) for (const p of ['index.html', 'news/index.html', 'gills/index.html']) assert.ok(!read(p).includes('class="np-alert'), p);
});

test('the front page has the weather and river box with its sources', () => {
  const html = read('news/index.html');
  for (const want of ['data-np-wx', 'data-gauge="03364000"', 'forecast.weather.gov', 'flood-inundation-maps-east-fork-white-river-columbus-indiana', '/js/news.js']) assert.ok(html.includes(want), want);
  assert.ok(read('news/alert/index.html').includes('noindex'));
});

// ---------- The business beat's lead lists (item 6) ----------
import { snapshotOf, diffDirectory, draftMarkdown, bigHoursChange, holidayCalls } from '../src/news/leads.mjs';

test('the directory diff finds closings, openings, hours and new links, as a lead list', () => {
  const base = { name: 'A Place', address: '1 Main', phone: '(812) 555-0100', hours: [[1, 540, 1020], [2, 540, 1020]], tempClosed: false, closed: false, order: [], book: [], store: '' };
  const before = { a: base, b: { ...base, name: 'B' }, c: { ...base, name: 'C' }, d: { ...base, name: 'D' }, gone: { ...base, name: 'Gone' } };
  const after = {
    a: { ...base, closed: true }, b: { ...base, name: 'B', tempClosed: true }, c: { ...base, name: 'C', hours: [[1, 540, 1020]] },
    d: { ...base, name: 'D', order: ['https://order.example'] }, n: { ...base, name: 'New' },
  };
  const d = diffDirectory(before, after);
  assert.deepEqual(Object.fromEntries(Object.entries(d).map(([k, v]) => [k, v.map((x) => x.slug)])),
    { added: ['n'], gone: ['gone'], closed: ['a'], tempClosed: ['b'], reopened: [], hours: ['c'], online: ['d'] });
  const md = draftMarkdown(d, { date: '2026-11-02', since: '2026-10-26' });
  assert.match(md, /^---\ndraft: true\n/);
  assert.match(md, /This is a lead list, not a story/);
  assert.ok(!/[—–]/.test(md));
  assert.ok(!bigHoursChange([[1, 540, 1020]], [[1, 540, 1050]]), 'half an hour is not news');
  assert.ok(bigHoursChange([[1, 540, 1020]], [[2, 540, 1020]]), 'a different day is');
  assert.deepEqual(snapshotOf({ name: 'X', order: [{ url: 'u' }] }).order, ['u']);
  assert.equal(holidayCalls([{ hours: [[4, 540, 1020]], phone: '1' }, { hours: [[5, 540, 1020]], phone: '2' }], '2026-11-26').length, 1, 'Thanksgiving is a Thursday');
});

test('drafts and lead lists are never built into the site', () => {
  assert.ok(!existsSync(new URL('drafts/', dist)) && !existsSync(new URL('content/', dist)));
  for (const s of ALL_STORIES) assert.ok(!s.leads, `${s.file} is a lead list in content/stories/`);
});

// ---------- Meetings, data and notices (item 10) ----------
import { BODIES, MEETINGS, DATASETS, NOTICE_SOURCES, NOTICE_LAW } from '../src/data/civic.mjs';

test('every civic fact has an official source and a checked date', () => {
  const day = /^\d{4}-\d{2}-\d{2}$/;
  for (const b of BODIES) if (b.url) assert.ok(/^https:\/\//.test(b.url) && day.test(b.checked), b.slug);
  for (const m of MEETINGS) {
    assert.ok(BODIES.some((b) => b.slug === m.body), m.body);
    assert.match(m.start, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[-+]\d{2}:\d{2}$/);
    assert.ok(/^https:\/\//.test(m.source) && day.test(m.checked), m.title);
  }
  for (const d of DATASETS) {
    assert.ok(/^https:\/\//.test(d.source) && day.test(d.checked) && d.rows.every((r) => r.length === d.columns.length), d.slug);
    assert.ok(existsSync(new URL(`data/${d.slug}/index.html`, dist)), d.slug);
  }
  for (const n of [...NOTICE_SOURCES, NOTICE_LAW]) assert.ok(/^https:\/\//.test(n.url || n.source) && day.test(n.checked));
  for (const p of ['meetings/', 'data/', 'notices/']) assert.match(read(p + 'index.html'), /noindex/, p);
});

test('meeting notes need the Documenters format and render it', () => {
  assert.ok(checkStory({ ...good, label: 'Meeting notes' }).some((p) => /Meeting notes need/.test(p)));
  assert.ok(checkStory({ ...good, sample: false, bylines: ['nobody'], label: 'Meeting notes', meeting: { body: 'made-up-board', date: '2026-11-03', decisions: [] } }).some((p) => /civic\.mjs/.test(p)));
  const html = read('news/samples/sampleton-council-notes/index.html');
  for (const want of ['np-label-meeting-notes', 'Who was there', 'What was decided', '<th scope="col">Tally</th>', 'Questions to follow up']) assert.ok(html.includes(want), want);
});

// ---------- Newsletter, games, membership and sponsors (items 8, 11, 12) ----------
import { morningEdition } from '../src/news/morning.mjs';
import { sponsorSlot, sponsorsFor } from '../src/news/sponsor-slot.mjs';
import { SAMPLE_QUIZZES, QUIZZES } from '../src/pages/habit-pages.mjs';
import { NEWSLETTER, MEMBERSHIP } from '../src/data/paper.mjs';

test('the morning edition is built only from published stories, newest first', () => {
  const s = (n, h) => ({ ...good, sample: false, href: `/news/2026/11/s${n}/`, headline: `Story ${n}`, label: 'News', section: n === 9 ? 'business' : 'local', bylines: ['jacob-kennedy'], published: `2026-11-0${n > 9 ? 1 : 2}T0${h}:00:00-05:00` });
  const list = [s(1, 7), s(2, 6), s(3, 5), s(9, 1)];
  const ed = morningEdition({ date: '2026-11-02', now: new Date('2026-11-02T09:00:00-05:00'), stories: list, events: [{ name: 'Fair', venue: 'Park', url: 'https://example.org', start: '2026-11-01', end: '2026-11-03' }], dir: [] });
  assert.deepEqual(ed.stories.map((x) => x.headline), ['Story 1', 'Story 2', 'Story 3', 'Story 9']);
  assert.equal(ed.events.length, 1);
  assert.ok(ed.html.includes('Unsubscribe') && !/[—–]/.test(ed.html));
  const future = morningEdition({ date: '2026-11-02', now: new Date('2026-11-02T04:00:00-05:00'), stories: list, events: [], dir: [] });
  assert.ok(!future.stories.some((x) => x.headline === 'Story 1'), 'never a story before it is published');
});

test('sponsors appear only in labeled slots, only while their deal runs, never in a story', () => {
  const sponsors = { shop: { name: 'Some Shop', since: '2026-11-01', until: '2026-11-30', slots: ['front'], line: 'Hi.' } };
  assert.match(sponsorSlot('front', { sponsors, now: new Date('2026-11-15T12:00:00Z') }), /Sponsored[\s\S]*Some Shop/);
  assert.equal(sponsorSlot('front', { sponsors, now: new Date('2026-12-01T12:00:00Z') }), '');
  assert.equal(sponsorSlot('newsletter', { sponsors, now: new Date('2026-11-15T12:00:00Z') }), '');
  assert.equal(sponsorsFor('front', new Date('2026-10-31T12:00:00Z'), sponsors).length, 0);
  const story = read('news/samples/sampleton-bakery-opens/index.html');
  const article = story.slice(story.indexOf('<article class="wrap np-story">'), story.indexOf('</article>'));
  assert.ok(!article.includes('np-sponsor'), 'sponsor inside a story');
});

test('no page asks for money or an email address until the owner turns it on', () => {
  if (!MEMBERSHIP.open) assert.ok(!read('members/index.html').includes('Become a member</a>'));
  if (!NEWSLETTER.signupAction) assert.ok(!read('newsletter/index.html').includes('type="email"'));
  for (const p of ['newsletter/', 'members/', 'privacy/', 'games/', 'games/where/', 'games/quiz/']) assert.match(read(p + 'index.html'), /noindex/, p);
  assert.ok(read('news/samples/sampleton-opinion/index.html').includes('np-ask'), 'the ask ends each story');
});

test('quizzes are written by staff, and sample quizzes stay samples', () => {
  for (const q of QUIZZES) {
    assert.ok(!q.sample && STAFF[q.editor], q.file);
    for (const x of q.questions) assert.ok(x.choices.length >= 2 && x.answer >= 0 && x.answer < x.choices.length && (!x.story || stories.some((s) => s.href === x.story)), x.q);
  }
  for (const q of SAMPLE_QUIZZES) assert.ok(q.sample && SAMPLE_STAFF[q.editor], q.file);
  assert.ok(!read('games/quiz/index.html').includes('Sampleton'));
  const where = JSON.parse(read('games/where/index.html').match(/<script type="application\/json" id="page-data">([\s\S]*?)<\/script>/)[1]).where;
  assert.ok(where.length >= 4 && where.every((w) => w.src.startsWith('https://upload.wikimedia.org/') && w.credit));
});

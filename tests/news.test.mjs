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

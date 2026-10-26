// The newspaper: front page, sections and story pages, all built from
// content/ (src/news/content.mjs). Every page here is noindex until the
// publisher launches. See docs/newspaper-plan.md.
import { esc, t } from '../layout.mjs';
import { newsPage, setBarLinks } from '../news/frame.mjs';
import { aboutPages } from './about-pages.mjs';
import { ALL_STORIES, SAMPLES, stories, storiesIn, storiesBy, correctionsLog } from '../news/content.mjs';
import { SECTIONS, sectionBySlug, sectionHref } from '../news/sections.mjs';
import { disclosures } from '../news/disclosure.mjs';
import { storyList, label, byline, editorLine, fmtWhen, fmtDate } from '../news/render.mjs';

setBarLinks(() => SECTIONS.filter((s) => s.bar !== false).map((s) => [sectionHref(s), s.name]));

const host = (u) => new URL(u).hostname.replace(/^www\./, '');

const correction = (c) => `<li><time datetime="${esc(c.date)}">${fmtDate(c.date)}</time>: ${t(c.text)}</li>`;

export function storyBody(s) {
  const major = s.corrections.filter((c) => c.major);
  const minor = s.corrections.filter((c) => !c.major);
  const disc = disclosures(s.tags);
  const img = s.images[0];
  return `
<article class="wrap np-story">
  <header class="np-story-head">
    <p class="np-story-kick">${label(s)} <a href="${sectionHref(sectionBySlug[s.section])}">${esc(sectionBySlug[s.section].name)}</a></p>
    <h1>${t(s.headline)}</h1>
    ${s.dek ? `<p class="np-dek">${t(s.dek)}</p>` : ''}
    <p class="np-byline">${byline(s)}</p>
    <p class="np-meta">${editorLine(s)}${s.editor ? ' · ' : ''}Published <time datetime="${esc(s.published)}">${fmtWhen(s.published)}</time>${s.updated ? ` · Updated <time datetime="${esc(s.updated)}">${fmtWhen(s.updated)}</time>` : ''}</p>
  </header>
  ${disc.map((d) => `<p class="np-disclose" data-kind="${d.kind}"><strong>Disclosure:</strong> ${esc(d.text)}</p>`).join('')}
  ${major.length ? `<aside class="np-corr np-corr-top" aria-label="Corrections"><h2>Correction</h2><ul>${major.map(correction).join('')}</ul></aside>` : ''}
  ${img ? `<figure class="np-fig"><img src="${esc(img.file)}" alt="${esc(img.alt)}"><figcaption>${img.caption ? `${t(img.caption)} ` : ''}<span class="np-credit">${esc(img.credit)}, ${esc(img.license)}</span></figcaption></figure>` : ''}
  ${s.developing ? `<aside class="np-dev" aria-label="Developing story"><p class="kicker">Developing story</p><div><h2>What we know</h2><ul>${s.developing.know.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div><div><h2>What we don’t know yet</h2><ul>${s.developing.dontKnow.map((x) => `<li>${t(x)}</li>`).join('')}</ul></div></aside>` : ''}
  <div class="np-prose">${s.html}</div>
  ${s.images.slice(1).map((im) => `<figure class="np-fig"><img src="${esc(im.file)}" alt="${esc(im.alt)}" loading="lazy"><figcaption>${im.caption ? `${t(im.caption)} ` : ''}<span class="np-credit">${esc(im.credit)}, ${esc(im.license)}</span></figcaption></figure>`).join('')}
  <footer class="np-trust">
    ${s.sources.length ? `<section id="references"><h2>References</h2><ul>${s.sources.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">${t(x.name)}</a> <span class="np-host">${esc(host(x.url))}</span>` : t(x.name)}${x.note ? `, ${t(x.note)}` : ''}</li>`).join('')}</ul></section>` : ''}
    ${s.methods ? `<section id="methods"><h2>How we reported this</h2><p>${t(s.methods)}</p></section>` : ''}
    ${minor.length ? `<section id="corrections"><h2>Corrections</h2><ul>${minor.map(correction).join('')}</ul></section>` : ''}
    <p class="np-tip">Spot an error? Have a tip? <a href="/about/standards/#feedback">Tell the newsroom</a>. <a href="/about/standards/#labels">What “${esc(s.label)}” means</a>.</p>
  </footer>
</article>`;
}

function storyPage(ctx, s) {
  const sec = sectionBySlug[s.section];
  const banner = s.sample
    ? '<div class="np-sample-banner"><div class="wrap"><strong>Sample story.</strong> Sampleton and everyone in it are made up. This page only shows what a story looks like.</div></div>'
    : s.draft ? '<div class="np-sample-banner"><div class="wrap"><strong>Draft.</strong> Not approved by an editor and not listed anywhere yet.</div></div>' : '';
  return newsPage({
    ...ctx, path: s.href, title: s.headline, description: s.dek || s.headline, banner,
    crumbs: [['/news/', 'News'], [sectionHref(sec), sec.name], ['', s.headline]],
    body: storyBody(s),
  });
}

function sectionPage(ctx, sec) {
  const body = `
<section class="wrap np-section">
  <header class="np-doc-head"><p class="kicker">Section</p><h1>${esc(sec.name)}</h1><p class="np-dek">${esc(sec.blurb)}</p></header>
  ${storyList(storiesIn(sec.slug), { showSection: false, empty: 'No stories in this section yet.' })}
</section>`;
  return newsPage({ ...ctx, path: sectionHref(sec), title: sec.name, description: sec.blurb, crumbs: [['/news/', 'News'], ['', sec.name]], body });
}

function samplesPage(ctx) {
  const body = `
<section class="wrap np-section">
  <header class="np-doc-head"><p class="kicker">Templates</p><h1>Sample stories</h1><p class="np-dek">Made-up stories in a made-up town, to show reporters and editors what each kind of story looks like here. None of this is news.</p></header>
  ${storyList(SAMPLES)}
</section>`;
  return newsPage({ ...ctx, path: '/news/samples/', title: 'Sample stories', description: 'Templates, not news.', crumbs: [['/news/', 'News'], ['', 'Samples']], body });
}

function frontPage(ctx) {
  const body = `
<section class="wrap np-section">
  <header class="np-doc-head"><p class="kicker">Coming soon</p><h1>The front page is being built</h1><p class="np-dek">Read <a href="/about/">about the paper</a> and <a href="/about/standards/">how we report</a> in the meantime.</p></header>
  ${storyList(stories.slice(0, 12), { empty: 'No stories published yet.' })}
</section>`;
  return newsPage({ ...ctx, path: '/news/', title: 'News', description: 'Local news for Columbus, Indiana.', body });
}

export function newsPages(ctx) {
  return [
    { path: 'news/index.html', html: frontPage(ctx) },
    ...SECTIONS.filter((s) => !s.href).map((s) => ({ path: `news/${s.slug}/index.html`, html: sectionPage(ctx, s) })),
    ...ALL_STORIES.map((s) => ({ path: `${s.href.slice(1)}index.html`, html: storyPage(ctx, s) })),
    { path: 'news/samples/index.html', html: samplesPage(ctx) },
    ...SAMPLES.map((s) => ({ path: `${s.href.slice(1)}index.html`, html: storyPage(ctx, s) })),
    ...aboutPages(ctx, {
      corrections: correctionsLog().map((c) => ({ date: c.date, dateText: fmtDate(c.date), text: c.text, story: c.story })),
      storiesBy,
    }),
  ];
}

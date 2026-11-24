// RSS feeds for the paper: everything, each series, each section. Readers,
// podcast apps and newsletter tools subscribe to these; build.mjs writes them
// to dist/. Only published stories, newest first, and nothing a page doesn't
// already show: headline, dek, byline, date, lead photo.
import { stories, storiesIn, storiesInSeries } from './content.mjs';
import { SECTIONS } from './sections.mjs';
import { SERIES, seriesHref } from './series.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAPER } from '../data/paper.mjs';
import { bylineText } from './render.mjs';

const x = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (h) => (h.startsWith('http') ? h : ORIGIN + h);

export function rss({ title, path, description, items, self }) {
  const item = (s) => {
    const img = s.images?.[0];
    return `  <item>
    <title>${x(s.headline)}</title>
    <link>${x(abs(s.href))}</link>
    <guid isPermaLink="true">${x(abs(s.href))}</guid>
    <pubDate>${new Date(s.published).toUTCString()}</pubDate>
    <dc:creator>${x(bylineText(s))}</dc:creator>
    <category>${x(s.label)}</category>
    ${s.dek ? `<description>${x(s.dek)}</description>` : ''}
    ${img ? `<media:content url="${x(abs(img.file))}" medium="image"><media:description>${x(img.alt)}</media:description><media:credit>${x(img.credit)}</media:credit></media:content>` : ''}
  </item>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>${x(title)}</title>
  <link>${x(abs(path))}</link>
  <description>${x(description)}</description>
  <language>en-us</language>
  <atom:link href="${x(abs(self))}" rel="self" type="application/rss+xml"/>
  ${items[0] ? `<lastBuildDate>${new Date(items[0].updated || items[0].published).toUTCString()}</lastBuildDate>` : ''}
${items.slice(0, 50).map(item).join('\n')}
</channel>
</rss>
`;
}

// Every feed the build writes: [file under dist/, xml, title].
export function allFeeds() {
  const out = [['news/feed.xml', rss({ title: PAPER.name, path: '/news/', description: 'Local news for Columbus, Indiana.', items: stories, self: '/news/feed.xml' }), PAPER.name]];
  for (const sr of SERIES) {
    const self = `${seriesHref(sr)}feed.xml`;
    out.push([self.slice(1), rss({ title: `${sr.name}, ${PAPER.name}`, path: seriesHref(sr), description: sr.blurb, items: storiesInSeries(sr.slug), self }), sr.name]);
  }
  for (const sec of SECTIONS.filter((s) => !s.href)) {
    const self = `/news/${sec.slug}/feed.xml`;
    out.push([self.slice(1), rss({ title: `${sec.name}, ${PAPER.name}`, path: `/news/${sec.slug}/`, description: sec.blurb, items: storiesIn(sec.slug), self }), sec.name]);
  }
  return out;
}

export const feedLink = (href, title) => `<link rel="alternate" type="application/rss+xml" title="${x(title)}" href="${x(abs(href))}">`;

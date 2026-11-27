// The frame every newspaper page shares: site header, the paper's own bar,
// breadcrumbs, footer. A section built in another file only needs this and
// a body:
//
//   newsPage({ assets, path: '/news/faith/', title: 'Faith', description: '...',
//     crumbs: [['/news/', 'News'], ['', 'Faith']], body: '<section>...</section>' })
//
// Plain CSS in public/css/hoc.css (the .np- rules), like the directory.
import { page, esc } from '../layout.mjs';
import { header, footer, breadcrumbs } from '../site.mjs';
import { PAPER } from '../data/paper.mjs';
import { feedLink } from './feeds.mjs';

// The paper's bar: the featured series, the front page, then whatever src/news/sections.mjs registers,
// then the standards. Filled in lazily so this file has no section imports.
let barLinks = () => ({ features: [], sections: [] });
export const setBarLinks = (fn) => { barLinks = fn; };

const ABOUT = [['/about/', 'About'], ['/about/standards/', 'Standards'], ['/about/corrections/', 'Corrections']];

export const newsBar = (path) => {
  // The featured series come first, then the front page and every section.
  const { features, sections } = barLinks();
  const links = [...features, ['/news/', 'Front page'], ...sections, ...ABOUT];
  return `<nav class="np-bar" aria-label="Newspaper sections"><div class="wrap np-bar-row">
  <a class="np-flag" href="/news/">${esc(PAPER.name)}</a>
  ${links.map(([h, l, cls]) => `<a href="${h}"${cls ? ` class="${cls}"` : ''}${h === path ? ' aria-current="page"' : ''}>${esc(l).replace(/\bYOUR\b/, '<span class="np-your">YOUR</span>')}</a>`).join('')}
</div></nav>`;
};

export function newsPage({ assets, path, title, description, crumbs = [], body, ld = [], scripts = [], data = null, banner = '', styles = [], alt = '', alternates = [], feeds = [], shareImage = null }) {
  const html = `
${header('news', alt ? { alt } : undefined)}
${newsBar(path)}
${banner}
<main id="main" class="np">
${crumbs.length ? breadcrumbs([['/', 'Home'], ...crumbs]) : ''}
${path === '/news/' ? '<div class="wrap"><a class="btn btn-sm btn-ghost" href="/apps/news/">Open the Heart of Columbus newspaper app</a></div>' : ''}
${body}
</main>
${footer()}`;
  // Every newspaper page names the paper's RSS feed (and any feed of its own)
  // so readers and feed apps can find them.
  const head = (path === '/news/' ? '<link rel="manifest" href="/news/manifest.webmanifest">\n' : '')
    + [['/news/feed.xml', PAPER.name], ...feeds].map(([h, t]) => feedLink(h, t)).join('\n')
    + (shareImage ? `\n<meta name="hoc:image" content="${esc(shareImage.src)}" data-alt="${esc(shareImage.alt)}" data-type="article">` : '');
  return page({ title: `${title} | ${PAPER.name}`, description, body: html, scripts: ['site.js', 'subscribe.js', ...scripts], styles: ['hoc.css', ...styles], assets, ld, data, path, alternates, head });
}

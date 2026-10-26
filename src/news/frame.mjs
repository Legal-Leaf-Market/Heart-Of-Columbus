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

// The paper's bar: front page, then whatever src/news/sections.mjs registers,
// then the standards. Filled in lazily so this file has no section imports.
let barLinks = () => [];
export const setBarLinks = (fn) => { barLinks = fn; };

const ABOUT = [['/about/', 'About'], ['/about/standards/', 'Standards'], ['/about/corrections/', 'Corrections']];

export const newsBar = (path) => {
  const links = [['/news/', 'Front page'], ...barLinks(), ...ABOUT];
  return `<nav class="np-bar" aria-label="Newspaper sections"><div class="wrap np-bar-row">
  <a class="np-flag" href="/news/">${esc(PAPER.name)}</a>
  ${links.map(([h, l]) => `<a href="${h}"${h === path ? ' aria-current="page"' : ''}>${esc(l)}</a>`).join('')}
</div></nav>`;
};

export function newsPage({ assets, path, title, description, crumbs = [], body, ld = [], scripts = [], data = null, banner = '', styles = [], alt = '', alternates = [] }) {
  const html = `
${header('news', alt ? { alt } : undefined)}
${newsBar(path)}
${banner}
<main id="main" class="np">
${crumbs.length ? breadcrumbs([['/', 'Home'], ...crumbs]) : ''}
${body}
</main>
${footer()}`;
  return page({ title: `${title} | ${PAPER.name}`, description, body: html, scripts: ['site.js', ...scripts], styles: ['hoc.css', ...styles], assets, ld, data, path, alternates });
}

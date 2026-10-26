// The newspaper: front page, sections and story pages, all built from
// content/ (see docs/newspaper-plan.md). Every page here is noindex until
// the publisher launches.
import { newsPage } from '../news/frame.mjs';
import { aboutPages } from './about-pages.mjs';

function frontPage(ctx) {
  const body = `<article class="wrap np-doc"><header class="np-doc-head"><p class="kicker">Coming soon</p><h1>The front page is being built</h1></header><p>Read <a href="/about/">about the paper</a> and <a href="/about/standards/">how we report</a> in the meantime.</p></article>`;
  return newsPage({ ...ctx, path: '/news/', title: 'News', description: 'Local news for Columbus, Indiana.', body });
}

export function newsPages(ctx) {
  return [{ path: 'news/index.html', html: frontPage(ctx) }, ...aboutPages(ctx)];
}

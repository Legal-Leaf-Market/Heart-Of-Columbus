// Finalize URLs from output paths, rather than relying on every template to
// supply a path (most currently use the HTML shell's default of '/').
import { ORIGIN } from './jsonld.mjs';
import { esc } from './layout.mjs';

export const pageUrl = (path) => new URL('/' + path.replace(/index\.html$/, ''), ORIGIN).href;

export function finalizeSeo(html, path) {
  const url = esc(pageUrl(path));
  // A page can name its own share card: <meta name="hoc:image" content="/og/x.jpg"
  // data-alt="..."> (news stories do, from their lead photo). Otherwise the
  // site card.
  const own = html.match(/<meta name="hoc:image" content="([^"]+)" data-alt="([^"]*)" data-type="([a-z]*)">/);
  const image = esc(new URL(own ? own[1] : '/og.png', ORIGIN).href);
  const imageAlt = own ? own[2] : 'Heart of Columbus, Columbus, Indiana';
  const type = own && own[3] === 'article' ? 'article' : 'website';
  const title = html.match(/<title>([^]*?)<\/title>/)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  // A missing URL should remain a real 404, never a canonical content page.
  const canonical = path === '404.html' ? '' : `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">`;
  // The shell writes og:type website; a story with its own card is an article.
  if (type === 'article') html = html.replace('<meta property="og:type" content="website">', '<meta property="og:type" content="article">');
  return html.replace('</head>', `${canonical}
<meta property="og:site_name" content="Heart of Columbus">
<meta property="og:locale" content="${html.includes('<html lang="es">') ? 'es_US' : 'en_US'}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${imageAlt}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="${imageAlt}">
</head>`);
}

export function sitemapXml(pages) {
  const live = pages.filter((p) => p.path.endsWith('index.html') && !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(p.html));
  if (!live.length) return null;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${live.map((p) => `  <url><loc>${esc(pageUrl(p.path))}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export const robotsTxt = (hasSitemap) => `User-agent: *\nAllow: /\n${hasSitemap ? `\nSitemap: ${ORIGIN}/sitemap.xml\n` : ''}`;

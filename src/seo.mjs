// Finalize URLs from output paths, rather than relying on every template to
// supply a path (most currently use the HTML shell's default of '/').
import { ORIGIN } from './jsonld.mjs';
import { esc } from './layout.mjs';

export const pageUrl = (path) => new URL('/' + path.replace(/index\.html$/, ''), ORIGIN).href;

export function finalizeSeo(html, path) {
  const url = esc(pageUrl(path));
  const image = esc(new URL('/og.png', ORIGIN).href);
  const title = html.match(/<title>([^]*?)<\/title>/)?.[1] || '';
  const description = html.match(/<meta name="description" content="([^"]*)">/)?.[1] || '';
  // A missing URL should remain a real 404, never a canonical content page.
  const canonical = path === '404.html' ? '' : `<link rel="canonical" href="${url}">\n<meta property="og:url" content="${url}">`;
  return html.replace('</head>', `${canonical}
<meta property="og:site_name" content="Heart of Columbus">
<meta property="og:locale" content="${html.includes('<html lang="es">') ? 'es_US' : 'en_US'}">
<meta property="og:image" content="${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Heart of Columbus, Columbus, Indiana">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${image}">
<meta name="twitter:image:alt" content="Heart of Columbus, Columbus, Indiana">
</head>`);
}

export function sitemapXml(pages) {
  const live = pages.filter((p) => p.path.endsWith('index.html') && !/<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i.test(p.html));
  if (!live.length) return null;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${live.map((p) => `  <url><loc>${esc(pageUrl(p.path))}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export const robotsTxt = (hasSitemap) => `User-agent: *\nAllow: /\n${hasSitemap ? `\nSitemap: ${ORIGIN}/sitemap.xml\n` : ''}`;

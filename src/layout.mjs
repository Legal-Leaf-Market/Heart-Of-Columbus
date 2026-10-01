// The HTML shell every page shares.

export const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Straight apostrophes become curly ones in text people read.
export const t = (v) => esc(String(v ?? '').replace(/'/g, '’'));

export const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Shown on every prototype storefront so nobody mistakes a pitch for the
// business's own site or thinks an order went through.
export const demoBanner = (name) => `
<div class="bg-ink text-white text-sm">
  <div class="mx-auto max-w-6xl px-4 py-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
    <p><strong>Heart of Columbus concept demo.</strong> Not affiliated with or endorsed by ${t(name)}. Orders and bookings here are not sent.</p>
    <a class="underline underline-offset-4 font-semibold whitespace-nowrap" href="/">← Back to the directory</a>
  </div>
</div>`;

export function page({ title, description, theme = '', body, scripts = [], data = null, assets, preview = true, path = '/' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${preview ? '<meta name="robots" content="noindex, nofollow">' : ''}
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:image" content="/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/app.css?v=${assets.css}">
${data ? `<script type="application/json" id="page-data">${json(data)}</script>` : ''}
<script src="/js/core.js?v=${assets.core}" defer></script>
${scripts.map((s) => `<script src="/js/${s}?v=${assets[s] ?? ''}" defer></script>`).join('\n')}
</head>
<body class="${theme} min-h-screen">
<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">Skip to content</a>
${body}
</body>
</html>
`;
}

export const footer = (extra = '') => `
<footer class="bg-ink text-white/80 text-sm">
  <div class="mx-auto max-w-6xl px-4 py-8 flex flex-wrap justify-between gap-4">
    <p><a href="/" class="font-semibold text-white">Heart of Columbus</a> · Keep it in Columbus, Indiana.</p>
    <p>${extra || 'A concept preview. Business details come from public listings and may change; call ahead.'}</p>
  </div>
</footer>`;

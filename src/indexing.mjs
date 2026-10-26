// THE indexing policy. One switch, one list, and build.mjs applies it to the
// robots meta, the X-Robots-Tag header (dist/_headers), robots.txt and the
// sitemap, so the four can never disagree.
//
// Nothing is indexed until somebody decides to launch: HOC_INDEX=1 on the
// production context. Netlify sets CONTEXT on every build, so a deploy preview
// or branch deploy stays noindex even when the variable is set site-wide.
// Removing the meta tag alone would not be enough; the header has to go too,
// and both come from here.

export const LAUNCH = process.env.HOC_INDEX === '1' && (!process.env.CONTEXT || process.env.CONTEXT === 'production');

// Pages that stay out of search even after launch. Demos are pitches, not the
// businesses' own sites. The rest are tools, private screens, a personal list,
// or a translation nobody fluent has signed off yet.
export const NEVER_INDEX = [
  ['/gills/', 'storefront demo'],
  ['/tacolumbus/', 'storefront demo'],
  ['/big-cheese/', 'storefront demo'],
  ['/tasty-express/', 'storefront demo'],
  ['/rohdes/', 'storefront demo'],
  ['/pickup/', 'pickup tickets and the counter board'],
  ['/owners/inbox/', 'private owner inbox'],
  ['/obituaries/review/', 'private review queue'],
  ['/admin/', 'newsroom CMS'],
  ['/saved/', "a visitor's own list"],
  ['/explore/', 'search and map tool; categories and neighborhoods carry the same listings'],
  ['/events/print/', 'printable copy of /events/'],
  ['/es/', 'translation under review'],
  ['/404.html', 'not found page'],
  ['/data/', 'raw data'],
  ['/api/', 'functions'],
];

// path is a URL path ("/b/jills-diner/") or a dist file path ("b/jills-diner/index.html").
export const urlPath = (p) => ('/' + p.replace(/^\/+/, '')).replace(/index\.html$/, '');
export const neverIndexed = (p) => { const u = urlPath(p); return NEVER_INDEX.some(([pre]) => u === pre || u.startsWith(pre)); };
export const indexable = (p) => LAUNCH && neverIndexed(p) === false;

export const ROBOTS_META = '<meta name="robots" content="noindex, nofollow">';

export function headersFile() {
  if (!LAUNCH) return '# Not launched: HOC_INDEX is not set on the production context.\n/*\n  X-Robots-Tag: noindex, nofollow\n';
  return NEVER_INDEX.map(([pre]) => `${pre.endsWith('/') ? pre + '*' : pre}\n  X-Robots-Tag: noindex, nofollow`).join('\n') + '\n';
}

// Before launch robots.txt still allows crawling on purpose: a crawler has to
// fetch a page to read its noindex, and a Disallow would let a linked URL be
// indexed bare, without the directive ever being seen.
export function robotsTxt(origin) {
  if (!LAUNCH) return 'User-agent: *\nAllow: /\n';
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
}

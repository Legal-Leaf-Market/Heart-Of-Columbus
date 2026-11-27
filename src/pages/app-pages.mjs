// Two separately installable experiences. Each worker owns only its own path.
const apps = [
  { path: '/news/', key: 'news', name: 'Heart of Columbus Morning Paper', short: 'Columbus Paper', description: 'Columbus news and the morning feed.', theme: '#233a50', background: '#faf6ed' },
  { path: '/order/', key: 'order', name: 'Heart of Columbus Local', short: 'Columbus Local', description: 'Order pickup, book appointments and shop Columbus businesses directly.', theme: '#6b3b28', background: '#fff8eb' },
];

const manifest = (a) => JSON.stringify({
  id: a.path, name: a.name, short_name: a.short, description: a.description,
  start_url: a.path, scope: a.path, display: 'standalone',
  background_color: a.background, theme_color: a.theme,
  icons: [192, 512].map((size) => ({ src: `/art/${a.key}-app-icon-${size}.png`, sizes: `${size}x${size}`, type: 'image/png', purpose: 'any maskable' })),
}, null, 2);

const worker = (a) => `// ${a.short}: keep reading available; always load ordering data live.
const CACHE = 'hoc-${a.key}-v1';
const HOME = '${a.path}';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['${a.key === 'order' ? '/order/offline.html' : a.path}'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('hoc-${a.key}-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    if (!url.pathname.startsWith(HOME)) return;
    e.respondWith(fetch(req).then((res) => {
      ${a.key === 'news' ? `if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy))); }` : ''}
      return res;
    }).catch(() => caches.match(${a.key === 'news' ? 'req' : "'/order/offline.html'"}).then((hit) => hit || ${a.key === 'news' ? 'caches.match(HOME)' : "Response.error()"})));
    return;
  }
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/data/') || url.pathname.startsWith('/.netlify/')) return;
  if (!/^\\/(?:art|img|css|js|assets|fonts)\\//.test(url.pathname)) return;
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => {
    if (res.ok) { const copy = res.clone(); e.waitUntil(caches.open(CACHE).then((c) => c.put(req, copy))); }
    return res;
  })));
});
`;

const offlineOrder = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Connect to order | Heart of Columbus</title><meta name="description" content="Reconnect to see current Columbus ordering and booking links."><meta property="og:title" content="Connect to order | Heart of Columbus"><!--robots--><style>body{font:1.1rem/1.5 system-ui;background:#fff8eb;color:#382a20;margin:0;padding:15vh 8vw;max-width:38rem}a{color:#73412b}</style></head><body><h1>Connect to order or book</h1><p>Prices, availability and checkout links need a current connection. Your Columbus businesses are waiting when you’re back online.</p><p><a href="/order/">Try again</a></p></body></html>`;

export const appPages = () => [
  ...apps.flatMap((a) => [
    { path: `${a.key}/manifest.webmanifest`, html: manifest(a) },
    { path: `${a.key}/sw.js`, html: worker(a) },
  ]),
  { path: 'order/offline.html', html: offlineOrder },
];

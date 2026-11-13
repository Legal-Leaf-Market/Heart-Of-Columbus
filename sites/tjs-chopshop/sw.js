/* TJ's ChopShop app shell. Pages come from the network first (so edits show
   right away) and fall back to the saved copy offline; styles, scripts and
   images are served from the cache and refreshed in the background. The
   soundtrack and anything off this site are never cached here.
   Bump VERSION when the shell list changes. */
const VERSION = 'tj-v1';
const SHELL = [
  './',
  'motion/tjs-motion.css', 'motion/tjs-motion.js',
  'motion/tjs-player.css', 'motion/tjs-player.js',
  'motion/tjs-install.css', 'motion/tjs-install.js',
  'brand/logos/monogram.svg', 'brand/logos/logo-primary.svg', 'brand/logos/logo-ivory.svg',
  'brand/artwork/hero-chair.webp', 'app/icon-192.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  if (req.method !== 'GET' || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.includes('/audio/') || req.headers.has('range')) return;

  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone();
      if (res.ok) caches.open(VERSION).then((c) => c.put(req, copy));
      return res;
    }).catch(async () => (await caches.match(req, { ignoreSearch: true })) || caches.match('./')));
    return;
  }

  e.respondWith(caches.open(VERSION).then(async (c) => {
    const hit = await c.match(req);
    const fresh = fetch(req).then((res) => { if (res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
    return hit || fresh;
  }));
});

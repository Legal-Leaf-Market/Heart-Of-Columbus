// Tiny local preview server for dist/ (no dependencies).
//   npm run dev   then open http://localhost:4321

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { demoPickup } from '../netlify/functions/pickup-demo.mjs';

const rooms = new Map();
const pickup = demoPickup(() => ({
  getWithMetadata: async (key) => structuredClone(rooms.get(key)),
  async setJSON(key, data, { onlyIfNew, onlyIfMatch }) {
    const current = rooms.get(key);
    if (onlyIfNew ? current : current?.etag !== onlyIfMatch) return { modified: false };
    rooms.set(key, { data: structuredClone(data), etag: crypto.randomUUID() });
    return { modified: true };
  },
}));

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT) || 4321;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path === '/api/pickup-demo') {
    const body = req.method === 'POST' ? { body: Readable.toWeb(req), duplex: 'half' } : {};
    const result = await pickup(new Request(new URL(req.url, 'http://localhost'), { method: req.method, headers: req.headers, ...body }));
    res.writeHead(result.status, Object.fromEntries(result.headers));
    res.end(await result.text());
    return;
  }
  let file = join(dist, path);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    // Same as Netlify: unknown paths get dist/404.html.
    const body = await readFile(join(dist, '404.html')).catch(() => 'Not found');
    res.writeHead(404, { 'content-type': types['.html'] });
    res.end(body);
  }
}).listen(port, () => console.log(`Heart of Columbus preview: http://localhost:${port}`));

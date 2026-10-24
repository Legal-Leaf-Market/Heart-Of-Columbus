// A minimal Netlify Blobs client for our functions, with no npm dependency.
// It speaks the same protocol as @netlify/blobs (site-wide stores over the
// edge URL that Netlify hands every function in NETLIFY_BLOBS_CONTEXT).
// When that context is missing (local dev, tests) `blobStore()` returns null,
// and callers must fail closed rather than pretend an order was saved.

function context() {
  const raw = globalThis.netlifyBlobsContext || (globalThis.Netlify && globalThis.Netlify.env && globalThis.Netlify.env.get('NETLIFY_BLOBS_CONTEXT')) || process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw || typeof raw !== 'string') return null;
  try {
    const c = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    return c && c.siteID && c.token && (c.edgeURL || c.apiURL) ? c : null;
  } catch {
    return null;
  }
}

export function blobStore(name) {
  const c = context();
  if (!c) return null;
  const store = `site:${name}`;
  const auth = { authorization: `Bearer ${c.token}` };

  // Reads that must see a write made a moment ago (a pickup being redeemed)
  // go through the uncached edge URL when Netlify provides one.
  async function request(method, key, body) {
    if (c.edgeURL) {
      const base = method === 'GET' && c.uncachedEdgeURL ? c.uncachedEdgeURL : c.edgeURL;
      const headers = { ...auth };
      if (method === 'PUT') headers['cache-control'] = 'max-age=0, stale-while-revalidate=60';
      return fetch(new URL(`/${c.siteID}/${store}/${key}`, base), { method, headers, body });
    }
    // Build time / API access: ask for a signed URL first.
    const api = new URL(`/api/v1/blobs/${c.siteID}/${store}/${key}`, c.apiURL || 'https://api.netlify.com');
    const signed = await fetch(api, { method, headers: { ...auth, accept: 'application/json;type=signed-url' } });
    if (signed.status !== 200) return signed;
    const { url } = await signed.json();
    return fetch(url, { method, body });
  }

  return {
    async get(key) {
      const r = await request('GET', key);
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`blobs get ${r.status}`);
      return r.text();
    },
    async getJSON(key) {
      const t = await this.get(key);
      if (t == null) return null;
      try { return JSON.parse(t); } catch { return null; }
    },
    async setJSON(key, value) {
      const r = await request('PUT', key, JSON.stringify(value));
      if (!r.ok) throw new Error(`blobs set ${r.status}`);
    },
  };
}

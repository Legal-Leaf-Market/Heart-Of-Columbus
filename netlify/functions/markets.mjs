// /api/markets: delayed quotes for the companies in src/data/markets.mjs.
//
// The source is Twelve Data (https://twelvedata.com/), free plan, with its
// key in the HOC_QUOTES_KEY environment variable on Netlify (never in git).
// Their attribution rule is "Data provided by Twelve Data", linked, next to
// the numbers; the page shows it from `source` in this response.
//
// One call fetches the whole board, at most once every REFRESH_MINUTES: the
// last good board is kept in Netlify Blobs and the CDN caches the response
// too. If the source fails we serve the last good board marked stale, and
// with nothing to serve we say so (503) rather than show made up numbers.
import { blobStore } from '../../src/blobs.mjs';
import { COMPANIES, QUOTE_SOURCE, REFRESH_MINUTES } from '../../src/data/markets.mjs';

export const config = { path: '/api/markets' };

const STALE_DAYS = 4; // covers a long weekend
const json = (body, status = 200, cdn = 0) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json',
    'cache-control': status === 200 ? 'public, max-age=300' : 'no-store',
    ...(cdn ? { 'netlify-cdn-cache-control': `public, s-maxage=${cdn}, stale-while-revalidate=600` } : {}),
  },
});
const num = (v) => (v == null || v === '' || !Number.isFinite(Number(v)) ? null : Number(v));

// Twelve Data answers one symbol with the quote itself and several with an
// object keyed by symbol. A symbol it cannot price comes back with
// status "error"; that row shows no quote rather than a wrong one.
export function normalize(raw) {
  const one = COMPANIES.length === 1 ? { [COMPANIES[0].symbol]: raw } : raw || {};
  return COMPANIES.map(({ symbol }) => {
    const q = one[symbol];
    if (!q || q.status === 'error' || num(q.close) == null) return { symbol, price: null };
    return {
      symbol,
      price: num(q.close),
      change: num(q.change),
      pct: num(q.percent_change),
      prev: num(q.previous_close),
      at: q.timestamp ? new Date(Number(q.timestamp) * 1000).toISOString() : null,
      open: q.is_market_open === true,
    };
  });
}

async function fetchBoard(key) {
  const u = new URL('https://api.twelvedata.com/quote');
  u.searchParams.set('symbol', COMPANIES.map((c) => c.symbol).join(','));
  u.searchParams.set('apikey', key);
  const r = await fetch(u, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`quotes ${r.status}`);
  const raw = await r.json();
  if (raw && raw.status === 'error' && !raw.symbol) throw new Error(raw.message || 'quotes error');
  const quotes = normalize(raw);
  if (!quotes.some((q) => q.price != null)) throw new Error('no quotes');
  return quotes;
}

export default async (req) => {
  if (req.method !== 'GET') return json({ ok: false, error: 'method' }, 405);
  const source = QUOTE_SOURCE;
  const ttl = REFRESH_MINUTES * 60e3;
  const store = blobStore('markets');
  let cached = null;
  try { cached = store ? await store.getJSON('board') : null; } catch { cached = null; }
  const age = cached ? Date.now() - Date.parse(cached.fetchedAt) : Infinity;
  if (cached && age < ttl) return json({ ok: true, source, ...cached }, 200, Math.max(60, Math.round((ttl - age) / 1000)));

  const key = process.env.HOC_QUOTES_KEY || '';
  if (key) {
    try {
      const board = { fetchedAt: new Date().toISOString(), quotes: await fetchBoard(key) };
      if (store) { try { await store.setJSON('board', board); } catch { /* serve it anyway */ } }
      return json({ ok: true, source, ...board }, 200, REFRESH_MINUTES * 60);
    } catch { /* fall through to the last good board */ }
  }
  if (cached && age < STALE_DAYS * 864e5) return json({ ok: true, stale: true, source, ...cached }, 200, 120);
  return json({ ok: false, source, error: 'Quotes are not available right now.' }, 503);
};

// The overnight lead gathering (src/news/gather.mjs). Every day at 9:15 UTC
// (4:15 AM in Columbus in winter, 5:15 in summer), before the publisher sits
// down at the desk, it reads the public sources and saves the list in the
// desk's store as `leads-<date>`. The desk shows it in the Idea bank, where
// any lead can become an idea or a piece. Nothing is written or sent from a
// lead. The desk's "Gather now" button runs the same thing on demand.
import { blobStore } from '../../src/blobs.mjs';
import { gather, columbusDay } from '../../src/news/gather.mjs';

export const config = { schedule: '15 9 * * *' };

// Runs a gathering and stores it. `seen` comes from the last few mornings so
// a notice is marked new only the first time it shows up.
export async function gatherInto(store, { fetchFn = fetch, now = new Date(), origin } = {}) {
  const seen = new Set();
  for (let i = 1; i <= 4; i++) {
    const prev = await store.getJSON(`leads-${columbusDay(new Date(now.getTime() - i * 86400e3))}`);
    for (const x of (prev && prev.items) || []) seen.add(x.id);
  }
  const today = await store.getJSON(`leads-${columbusDay(now)}`);
  // A second run the same morning keeps "new" on what was new at the first.
  const firstSeen = new Set(((today && today.items) || []).filter((x) => x.new).map((x) => x.id));
  const got = await gather({ fetchFn, now, origin, seen });
  for (const x of got.items) if (firstSeen.has(x.id)) x.new = true;
  await store.setJSON(`leads-${got.date}`, got);
  return got;
}

export default async () => {
  const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
  const store = blobStore('desk');
  if (!store) { console.log('[leads] storage is not set up on this deploy'); return; }
  const got = await gatherInto(store, { origin: env('URL') || 'https://heartofcolumbus.shop' });
  const bad = got.sources.filter((s) => !s.ok);
  console.log(`[leads] ${got.date}: ${got.items.length} leads (${got.items.filter((x) => x.new).length} new) from ${got.sources.length - bad.length} sources${bad.length ? `; failed: ${bad.map((s) => `${s.id} (${s.error})`).join(', ')}` : ''}`);
};

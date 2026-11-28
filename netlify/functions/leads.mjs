// The overnight lead gathering (src/news/gather.mjs). Every day at 9:15 UTC
// (4:15 AM in Columbus in winter, 5:15 in summer), before the publisher sits
// down at the desk, it reads the public sources and saves the list in the
// desk's store as `leads-<date>`. The desk shows it in the Idea bank, where
// any lead can become an idea or a piece. Nothing is written or sent from a
// lead. The desk's "Gather now" button runs the same thing on demand.
import { blobStore } from '../../src/blobs.mjs';
import { gather, columbusDay, directoryLeads, UA } from '../../src/news/gather.mjs';

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
  await addDirectory(store, got, { fetchFn, now, origin, seen });
  for (const x of got.items) if (firstSeen.has(x.id)) x.new = true;
  await store.setJSON(`leads-${got.date}`, got);
  return got;
}

// Our directory, night to night: the site publishes a snapshot of every
// listing at /newsletter/daily.json, and `leads-dirsnap` keeps the last one
// seen. A second gathering the same morning compares with the same earlier
// snapshot, so "Gather now" never makes the morning's changes disappear.
async function addDirectory(store, got, { fetchFn, now, origin, seen }) {
  const status = { id: 'directory', name: 'Our directory (changes since the last gathering)', home: `${origin}/explore/`, ok: true, read: 0, kept: 0 };
  try {
    const res = await fetchFn(`${origin}/newsletter/daily.json`, { headers: { 'user-agent': UA, accept: 'application/json' } });
    if (!res.ok) throw new Error(`answered ${res.status}`);
    const snapshot = (await res.json()).snapshot;
    if (!snapshot) throw new Error('no snapshot in daily.json');
    const today = columbusDay(now);
    const saved = await store.getJSON('leads-dirsnap');
    const before = saved ? (saved.date === today ? saved.prev : saved.snapshot) : null;
    const found = directoryLeads(before, snapshot, origin);
    for (const x of found) {
      const id = `directory:${x.id}`;
      got.items.push({ id, src: 'directory', source: 'Our directory', title: x.title.slice(0, 300), url: x.url, published: '', on: '', time: '', until: '', kind: 'directory', new: !seen.has(id) });
    }
    status.read = Object.keys(snapshot).length; status.kept = found.length;
    await store.setJSON('leads-dirsnap', { date: today, prev: before, snapshot });
  } catch (e) {
    Object.assign(status, { ok: false, error: String((e && e.message) || e).slice(0, 200) });
  }
  got.sources.push(status);
  got.items.sort((a, b) => b.new - a.new);
}

export default async () => {
  const env = (k) => ((globalThis.Netlify?.env?.get(k)) ?? process.env[k] ?? '').trim();
  const store = blobStore('desk');
  if (!store) { console.log('[leads] storage is not set up on this deploy'); return; }
  const got = await gatherInto(store, { origin: env('URL') || 'https://heartofcolumbus.shop' });
  const bad = got.sources.filter((s) => !s.ok);
  console.log(`[leads] ${got.date}: ${got.items.length} leads (${got.items.filter((x) => x.new).length} new) from ${got.sources.length - bad.length} sources${bad.length ? `; failed: ${bad.map((s) => `${s.id} (${s.error})`).join(', ')}` : ''}`);
};

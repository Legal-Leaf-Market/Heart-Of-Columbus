// The business beat's lead lists. Compares two snapshots of the directory
// and writes what changed as a list for a reporter to check by phone or in
// person. NEVER a story: listings are wrong about closings often enough to
// hurt a real business. See docs/newspaper-plan.md, item 6.
import { fmtRange, DAY_NAMES } from '../hours.mjs';

// The parts of a listing worth a call when they change.
export const snapshotOf = (b, closed = false) => ({
  name: b.name, address: b.address || '', phone: b.phone || '', hours: b.hours || null,
  tempClosed: !!b.tempClosed, closed: !!closed,
  order: (b.order || []).map((o) => o.url), book: (b.book || []).map((o) => o.url), store: b.store || '',
});

const minutes = (rows) => (rows || []).reduce((n, [, o, c]) => n + (c - o), 0);
const days = (rows) => new Set((rows || []).map((r) => r[0]));
const hoursText = (rows) => (rows?.length ? [1, 2, 3, 4, 5, 6, 0].map((d) => { const r = rows.filter((x) => x[0] === d); return r.length ? `${DAY_NAMES[d].slice(0, 3)} ${r.map((x) => fmtRange(x[1], x[2])).join(', ')}` : ''; }).filter(Boolean).join('; ') : 'none listed');

// A big hours change: a day opened or closed, or six or more hours a week.
export function bigHoursChange(a, b) {
  if (!a || !b) return false;
  const da = days(a), db = days(b);
  if (da.size !== db.size || [...da].some((d) => !db.has(d))) return true;
  return Math.abs(minutes(a) - minutes(b)) >= 360;
}

export function diffDirectory(before, after) {
  const out = { added: [], gone: [], closed: [], tempClosed: [], reopened: [], hours: [], online: [] };
  for (const [slug, b] of Object.entries(after)) {
    const a = before[slug];
    if (!a) { if (!b.closed) out.added.push({ slug, b }); continue; }
    if (b.closed && !a.closed) out.closed.push({ slug, a, b });
    else if (b.tempClosed && !a.tempClosed) out.tempClosed.push({ slug, a, b });
    else if (!b.tempClosed && a.tempClosed && !b.closed) out.reopened.push({ slug, a, b });
    if (!b.closed && bigHoursChange(a.hours, b.hours)) out.hours.push({ slug, a, b });
    const newLinks = ['order', 'book'].flatMap((k) => b[k].filter((u) => !a[k].includes(u)).map((u) => [k, u]));
    if (b.store && b.store !== a.store) newLinks.push(['store', b.store]);
    if (newLinks.length) out.online.push({ slug, b, links: newLinks });
  }
  for (const [slug, a] of Object.entries(before)) if (!after[slug]) out.gone.push({ slug, a });
  return out;
}

// Where else new businesses show up first. Checked by a person, by hand.
export const RECORD_SOURCES = [
  ['Indiana Alcohol and Tobacco Commission, public meetings calendar (new permit applications)', 'https://www.in.gov/atc/public-meetings/calendar'],
  ['City of Columbus, council agendas and minutes', 'https://www.columbus.in.gov/'],
  ['Columbus plan commission and board of zoning appeals agendas', 'https://www.columbus.in.gov/'],
];

const line = (slug, name) => `[${name}](/b/${slug}/)`;

export function draftMarkdown(d, { date, since }) {
  const sec = (title, items, fmt) => (items.length ? `## ${title} (${items.length})\n\n${items.map((x) => `- [ ] ${fmt(x)}`).join('\n')}\n` : '');
  const total = Object.values(d).reduce((n, xs) => n + xs.length, 0);
  return `---
draft: true
leads: true
date: ${date}
compared_with: ${since}
---
# Business leads, ${date}

**This is a lead list, not a story.** Every line came from a public listing
and needs a call or a visit before anything is published. When it runs, say
how each item was confirmed: "confirmed with the owner by phone, (date)" or
"per their Google listing; we couldn't reach them."

${total ? `${total} changes since ${since}.` : `No changes since ${since}.`}

${sec('Listings marked permanently closed', d.closed, (x) => `${line(x.slug, x.b.name)}, ${x.b.address || 'no address'}, ${x.b.phone || 'no phone'}. Call before reporting a closing.`)}
${sec('Listings marked temporarily closed', d.tempClosed, (x) => `${line(x.slug, x.b.name)}, ${x.b.phone || 'no phone'}. Why, and until when?`)}
${sec('Reopened', d.reopened, (x) => `${line(x.slug, x.b.name)}, ${x.b.phone || 'no phone'}`)}
${sec('New listings', d.added, (x) => `${line(x.slug, x.b.name)}, ${x.b.address || 'no address'}. New business, new owner, or just new to the listing?`)}
${sec('No longer in the directory', d.gone, (x) => `${x.a.name} (${x.slug}), ${x.a.address || 'no address'}, ${x.a.phone || 'no phone'}`)}
${sec('Big hours changes', d.hours, (x) => `${line(x.slug, x.b.name)}: was ${hoursText(x.a.hours)}; now ${hoursText(x.b.hours)}`)}
${sec('New online ordering, booking or shop links', d.online, (x) => `${line(x.slug, x.b.name)}: ${x.links.map(([k, u]) => `${k} ${u}`).join(', ')}`)}
## Public records to check by hand

${RECORD_SOURCES.map(([n, u]) => `- [ ] [${n}](${u})`).join('\n')}
`.replace(/\n{3,}/g, '\n\n');
}

// Places whose regular listed hours say they're open on a holiday's weekday.
// Listings don't carry holiday hours, so every one of these is a call.
export function holidayCalls(directory, isoDate) {
  const dow = new Date(`${isoDate}T12:00:00Z`).getUTCDay();
  return directory.filter((b) => b.hours && !b.tempClosed && b.hours.some((r) => r[0] === dow) && b.phone);
}

// Overnight lead gathering for the morning newsletter. The job
// (netlify/functions/leads.mjs) runs at 5 AM in Columbus and drops LEADS into
// the writing desk's idea bank: never a story, never a draft. Each lead is a
// pointer to a first-hand source with the facts it states, for the publisher
// to read, check and decide on (docs/morning-paper.md, "What we gather").
//
// Sources, all first-hand and public:
// - National Weather Service active alerts that name Bartholomew County.
// - Today's events from our own hand-checked calendar (src/data/events.mjs).
// - Reader questions, tips, letters and Back YOUR Blue stories that arrived
//   since the last run (/newsroom/inbox/). Only the kind and a short excerpt;
//   names and contact details stay in the inbox.
// No other newsroom is read, and nothing is copied beyond a headline line.

export const NWS_ALERTS = 'https://api.weather.gov/alerts/active?area=IN';
export const COUNTY = 'Bartholomew';
// A lead nobody used is dropped after three days, so the bank stays readable.
export const LEAD_TTL = 3 * 86400e3;
export const MAX_IDEAS = 200;

const clip = (s, n) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };

// NWS GeoJSON: features[].properties { id, event, headline, areaDesc, severity, ends, expires, '@id' }.
export function weatherLeads(geojson, now = new Date()) {
  return ((geojson && geojson.features) || []).map((f) => f.properties || {})
    .filter((p) => String(p.areaDesc || '').includes(COUNTY) && new Date(p.ends || p.expires || now) >= now)
    .map((p) => ({
      key: `nws:${p.id || p['@id'] || p.headline}`,
      source: 'National Weather Service',
      text: `Weather: ${clip(p.headline || p.event, 220)}${p.severity && p.severity !== 'Unknown' ? ` (${p.severity})` : ''}. Read the alert and the forecast before writing.`,
      url: /^https:\/\//.test(p['@id'] || '') ? p['@id'] : 'https://forecast.weather.gov/MapClick.php?lat=39.2014&lon=-85.9214',
    }));
}

export function eventLeads(events, date) {
  return events.filter((e) => e.start <= date && e.end >= date).map((e) => ({
    key: `event:${e.slug}:${date}`,
    source: 'Our events calendar',
    text: `Today: ${e.name}, ${e.venue}. ${clip(e.line, 200)} Checked ${e.checked}; confirm it is still on.`,
    url: /^https?:\/\//.test(e.url || '') ? e.url : '',
  }));
}

const INBOX = { ask: ['question', 'Reader question'], tip: ['tip', 'Reader tip'], letter: ['body', 'Letter to the editor'], blue: ['story', 'Back YOUR Blue story'] };
export const INBOX_KINDS = Object.keys(INBOX);

// items: submissions from the newsroom store, any kind. Only those after `since`.
export function inboxLeads(items, since) {
  const after = since ? new Date(since).getTime() : 0;
  return items.filter((x) => x && INBOX[x.kind] && new Date(x.createdAt).getTime() > after).map((x) => {
    const [field, label] = INBOX[x.kind];
    return { key: `inbox:${x.kind}:${x.id}`, source: 'Reader inbox', text: `${label}: "${clip(x[field], 200)}" Open it in the inbox to read it in full and reach the sender.`, url: '' };
  });
}

// Merges new leads into the idea bank: no repeats (by key, including leads
// the publisher already deleted, which `seen` remembers), newest first, stale
// unused leads dropped, the publisher's own ideas always kept.
export function mergeLeads(ideas, leads, { now = new Date(), seen = [] } = {}) {
  const known = new Set([...seen, ...ideas.map((i) => i.key).filter(Boolean)]);
  const fresh = leads.filter((l) => !known.has(l.key)).map((l) => ({ ...l, lead: true, added: now.toISOString() }));
  const kept = ideas.filter((i) => !i.lead || now - new Date(i.added) < LEAD_TTL);
  const merged = [...fresh, ...kept];
  // Over the cap, old leads go before any idea the publisher wrote.
  while (merged.length > MAX_IDEAS) {
    const last = merged.map((i) => !!i.lead).lastIndexOf(true);
    merged.splice(last === -1 ? merged.length - 1 : last, 1);
  }
  return { ideas: merged, added: fresh.length, seen: [...known, ...fresh.map((l) => l.key)].slice(-2000) };
}

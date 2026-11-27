// Overnight lead gathering for the morning newsletter. Reads the public,
// first-hand sources that publish facts nobody turns into news (city and
// county notices, meeting agendas and minutes, today's events) and lists what is new for the publisher at the writing desk.
//
// Leads, never stories (CLAUDE.md, "Automation makes leads, not stories"):
// only a title, a link, a date and who published it are kept. No article
// text is copied, nothing is written from a lead automatically, and every
// item links to its source so the publisher reads it there first. Other
// newsrooms are not on the list on purpose (docs/morning-paper.md).
//
// Every source was checked by hand on 2026-11-27: the address answered with
// the format named here and robots.txt does not disallow it. A source that
// fails is reported by name at the desk instead of hiding the rest.
import { clean } from '../event-feeds.mjs';

const TZ = 'America/Indiana/Indianapolis';
export const UA = 'HeartOfColumbus-leads/1.0 (+https://heartofcolumbus.shop/about/)';
const DAY = 86400e3;

export const SOURCES = [
  {
    id: 'city-news', name: 'City of Columbus, news', kind: 'wp-posts',
    url: 'https://www.columbus.in.gov/wp-json/wp/v2/posts?per_page=10&orderby=date&_fields=date_gmt,link,title',
    home: 'https://www.columbus.in.gov/', checked: '2026-11-27',
  },
  {
    // Document Library Pro on the city's site: council, public works and
    // redevelopment agendas and minutes, newest first.
    id: 'city-meetings', name: 'City of Columbus, agendas and minutes', kind: 'wp-posts',
    url: 'https://www.columbus.in.gov/wp-json/wp/v2/dlp_document?per_page=15&orderby=date&_fields=date_gmt,link,title',
    home: 'https://www.columbus.in.gov/', checked: '2026-11-27',
  },
  {
    id: 'county-news', name: 'Bartholomew County, news', kind: 'rss',
    url: 'https://www.bartholomew.in.gov/index.php/news-article-list?format=feed&type=rss',
    home: 'https://www.bartholomew.in.gov/', checked: '2026-11-27',
  },
  {
    // The county calendar (JEvents): commissioners, council, boards and
    // office closings. Titles start with the meeting's own date and time.
    id: 'county-calendar', name: 'Bartholomew County, meetings and closings', kind: 'jevents',
    url: 'https://www.bartholomew.in.gov/index.php?option=com_jevents&task=modlatest.rss&format=feed&type=rss&Itemid=111&modid=0',
    home: 'https://www.bartholomew.in.gov/', checked: '2026-11-27',
  },
  // The National Weather Service alerts (api.weather.gov) were here until
  // 2026-11-27, when a recheck found its robots.txt disallows every path.
  // The editions link the forecast page instead; check alerts there by hand.
  {
    // Our own merged events feed (library, parks, hand-entered listings).
    id: 'events', name: 'Today in Columbus (our events feed)', kind: 'events',
    url: '/api/events?format=json&days=1', home: '/events/', checked: '2026-11-27',
  },
];

export const columbusDay = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const tag = (xml, name) => {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim() : '';
};
const safeUrl = (u, base = '') => {
  try { const x = new URL(String(u || '').trim(), base || undefined); return /^https?:$/.test(x.protocol) ? x.href : ''; } catch { return ''; }
};

// RSS 2.0 or Atom: title, link and date of each item, nothing else.
export function parseRss(xml) {
  const out = [];
  for (const m of String(xml).matchAll(/<(item|entry)\b[\s\S]*?<\/\1>/gi)) {
    const it = m[0];
    const atomLink = (it.match(/<link\b[^>]*href="([^"]+)"/i) || [])[1];
    out.push({ title: clean(tag(it, 'title')), url: safeUrl(atomLink || tag(it, 'link')), published: tag(it, 'pubDate') || tag(it, 'published') || tag(it, 'updated') });
  }
  return out.filter((x) => x.title && x.url);
}

export function parseWp(rows) {
  return (Array.isArray(rows) ? rows : []).map((r) => ({
    title: clean((r.title && r.title.rendered) || ''), url: safeUrl(r.link),
    published: r.date_gmt ? `${r.date_gmt}Z` : r.date || '',
  })).filter((x) => x.title && x.url);
}

// JEvents titles read "30 Nov 2026 10:00 : Commissioners Meeting". The date
// up front is when the meeting is, which is what matters for a lead.
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
export function parseJevents(xml) {
  return parseRss(xml).map((x) => {
    const m = x.title.match(/^(\d{1,2}) (\w{3}) (\d{4})(?: (\d{1,2}):(\d{2}))?\s*:\s*(.+)$/);
    if (!m || MON[m[2].toLowerCase()] == null) return { ...x, kind: 'meeting' };
    const date = `${m[3]}-${String(MON[m[2].toLowerCase()] + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return { title: m[6].replace(/\b([A-Z]{2,})\b/g, (w) => w[0] + w.slice(1).toLowerCase()), url: x.url, published: x.published, on: date, time: m[4] ? `${m[4].padStart(2, '0')}:${m[5]}` : '', kind: 'meeting' };
  });
}

export function parseNws(json, home) {
  return ((json && json.features) || []).map((f) => f.properties || {}).filter((p) => p.event).map((p) => ({
    title: clean(p.headline || p.event), url: home, published: p.sent || p.effective || '', until: p.ends || p.expires || '', kind: 'weather', id: p.id || '',
  }));
}

export function parseEvents(json, origin) {
  return ((json && json.events) || []).map((e) => ({
    title: clean(`${e.title}${e.venue ? `, ${e.venue}` : ''}`), url: (e.url && safeUrl(e.url, origin)) || `${origin}/events/`, on: e.date, kind: 'event',
  })).filter((x) => x.title);
}

// What counts as fresh: notices and documents posted in the last three days,
// meetings and closings in the next eight, every active weather alert, and
// every public event today.
export function freshOnly(items, kind, now) {
  const today = columbusDay(now);
  const week = columbusDay(new Date(now.getTime() + 8 * DAY));
  return items.filter((x) => {
    if (kind === 'nws') return true;
    if (kind === 'events') return x.on === today;
    if (x.on) return x.on >= today && x.on <= week;
    const t = Date.parse(x.published);
    return !isNaN(t) && now - t <= 3 * DAY && t <= now.getTime() + 3600e3;
  });
}

async function getText(url, fetchFn, accept) {
  const ctl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctl ? setTimeout(() => ctl.abort(), 12000) : null;
  try {
    const res = await fetchFn(url, { headers: { 'user-agent': UA, accept }, signal: ctl ? ctl.signal : undefined });
    if (!res.ok) throw new Error(`answered ${res.status}`);
    return await res.text();
  } finally { if (timer) clearTimeout(timer); }
}

// One night's gathering. `seen` is the set of lead ids already shown on an
// earlier morning, so a notice is flagged new only once.
export async function gather({ fetchFn = fetch, now = new Date(), origin = 'https://heartofcolumbus.shop', sources = SOURCES, seen = new Set() } = {}) {
  const status = [];
  const items = [];
  await Promise.all(sources.map(async (s) => {
    const url = s.url.startsWith('/') ? origin + s.url : s.url;
    const home = s.home.startsWith('/') ? origin + s.home : s.home;
    try {
      const text = await getText(url, fetchFn, s.kind === 'rss' || s.kind === 'jevents' ? 'application/rss+xml, application/xml, text/xml' : 'application/json, application/geo+json');
      const raw = s.kind === 'wp-posts' ? parseWp(JSON.parse(text))
        : s.kind === 'rss' ? parseRss(text)
          : s.kind === 'jevents' ? parseJevents(text)
            : s.kind === 'nws' ? parseNws(JSON.parse(text), home)
              : parseEvents(JSON.parse(text), origin);
      const fresh = freshOnly(raw, s.kind, now).slice(0, 25);
      for (const x of fresh) {
        const id = `${s.id}:${x.id || x.url}${x.on ? `:${x.on}` : ''}`;
        items.push({ id, src: s.id, source: s.name, title: x.title.slice(0, 300), url: x.url, published: x.published || '', on: x.on || '', time: x.time || '', until: x.until || '', kind: x.kind || 'notice', new: !seen.has(id) });
      }
      status.push({ id: s.id, name: s.name, home, ok: true, read: raw.length, kept: fresh.length });
    } catch (e) {
      status.push({ id: s.id, name: s.name, home, ok: false, error: String((e && e.name === 'AbortError') ? 'timed out' : (e && e.message) || e).slice(0, 200) });
    }
  }));
  const order = new Map(sources.map((s, i) => [s.id, i]));
  status.sort((a, b) => order.get(a.id) - order.get(b.id));
  items.sort((a, b) => (b.new - a.new) || (order.get(a.src) - order.get(b.src)) || String(a.on || '').localeCompare(String(b.on || '')));
  return { date: columbusDay(now), at: now.toISOString(), sources: status, items };
}

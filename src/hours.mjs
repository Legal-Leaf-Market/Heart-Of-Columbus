// Opening hours: parse Google Maps' weekly hours text, and answer "open now".
// Stored compactly as [[day, open, close], ...] with day 0 = Sunday and times
// in minutes after midnight; a close past midnight is > 1440.

const DAY = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };

function toMin(t, ampm) {
  const m = /^(\d{1,2})(?::(\d{2}))?$/.exec(t.trim());
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (ampm === 'PM') h += 12;
  return h * 60 + Number(m[2] || 0);
}

// "11 AM–2 PM, 5–9 PM" -> [[660, 840], [1020, 1260]]; "Closed" -> [];
// "Open 24 hours" -> [[0, 1440]]. Returns null when the text is not hours.
export function parseDay(text) {
  const s = String(text || '').replace(/ | /g, ' ').replace(/[–—-]/g, '–').trim();
  if (/^closed/i.test(s)) return [];
  if (/open 24 hours/i.test(s)) return [[0, 1440]];
  const out = [];
  const re = /(\d{1,2}(?::\d{2})?)\s*(AM|PM)?\s*–\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)/gi;
  let m;
  while ((m = re.exec(s))) {
    const endAp = m[4].toUpperCase();
    // "5–9 PM": the start shares the end's AM/PM unless that would put it after the end.
    let startAp = (m[2] || endAp).toUpperCase();
    let a = toMin(m[1], startAp), b = toMin(m[3], endAp);
    if (a == null || b == null) continue;
    if (!m[2] && a > b && startAp === 'PM') a = toMin(m[1], 'AM');
    if (b <= a) b += 1440; // closes after midnight
    out.push([a, b]);
  }
  return out.length ? out : null;
}

// { Monday: '11 AM–9 PM', ... } -> [[1, 660, 1260], ...]; null if unusable.
export function parseWeek(hr) {
  if (!hr) return null;
  const rows = [];
  let known = 0;
  for (const [name, text] of Object.entries(hr)) {
    if (!(name in DAY)) continue;
    const p = parseDay(text);
    if (p == null) continue;
    known++;
    for (const [a, b] of p) rows.push([DAY[name], a, b]);
  }
  return known >= 5 ? rows.sort((x, y) => x[0] - y[0] || x[1] - y[1]) : null;
}

const fmt = (min) => {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60), mm = m % 60;
  const ap = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return mm ? `${h12}:${String(mm).padStart(2, '0')} ${ap}` : `${h12} ${ap}`;
};
export const fmtRange = (a, b) => (a === 0 && b === 1440 ? 'Open 24 hours' : `${fmt(a)}–${fmt(b)}`);

// Is it open at day/minute (Columbus local time)? Returns { open, until, next }.
export function openAt(rows, day, min) {
  if (!rows || !rows.length) return null;
  for (const [d, a, b] of rows) {
    if (d === day && min >= a && min < b) return { open: true, until: b };
    const prev = (day + 6) % 7; // a range from yesterday running past midnight
    if (d === prev && b > 1440 && min < b - 1440) return { open: true, until: b - 1440 };
  }
  for (let i = 0; i < 7; i++) {
    const dd = (day + i) % 7;
    const next = rows.filter(([d, a]) => d === dd && (i > 0 || a > min)).sort((x, y) => x[1] - y[1])[0];
    if (next) return { open: false, nextDay: i, opens: next[1] };
  }
  return { open: false };
}

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

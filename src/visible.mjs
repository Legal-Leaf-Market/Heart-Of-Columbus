// The text a person sees on a built page: text nodes plus alt, title,
// aria-label, placeholder and meta content. Scripts and styles are skipped.
// Used by the build to keep dashes off the site (CLAUDE.md standing rule).

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', minus: '−' };
const decode = (s) => s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e.toLowerCase()] ?? m);

export function visibleText(html) {
  const h = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ');
  const out = [];
  for (const m of h.matchAll(/\s(?:alt|title|aria-label|placeholder|content)="([^"]*)"/gi)) out.push(decode(m[1]));
  for (const t of h.split(/<[^>]*>/)) if (t.trim()) out.push(decode(t));
  return out;
}

// An em dash, an en dash, or a hyphen standing in for one (" - ", " -- ").
export const DASH = /[—–]|(^|\s)--?(\s|$)/;

export const dashes = (html) => visibleText(html).filter((t) => DASH.test(t)).map((t) => t.trim());

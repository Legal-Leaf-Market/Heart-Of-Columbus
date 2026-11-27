// What the build hands the newsletter jobs (netlify/functions/newsletter.mjs
// and newsletter-evening.mjs). The jobs build each edition at send time,
// because the leads, the listing changes and the spotlight history live in
// Netlify Blobs; the build supplies the parts only it knows:
//
//   /newsletter/editions/<date>.json  for the next fourteen days: the stories
//     published in the 36 hours before 6 AM that day, what opens early, the
//     business story and the sponsors in their deal window.
//   /newsletter/daily.json  the Shop Local Spotlight candidates, the Columbus
//     by Design list, and a snapshot of the directory for "Open, Closed, New
//     Hours".
//
// Fourteen days, so a quiet stretch with no publish (batched deploys,
// CLAUDE.md "Publishing") never leaves a morning without a file.
import { morningEdition } from './morning.mjs';
import { localOffset } from './content.mjs';
import { bylineText } from './render.mjs';
import { composeEdition, hoursOn, columbusDate, columbusMinutes, prettyDate } from './paper-mail.mjs';
import { snapshotOf } from './leads.mjs';
import { PAPER } from '../data/paper.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { directory, catBySlug, subBySlug } from '../data/directory.mjs';
import { SPOTLIGHT_SLUGS } from '../data/spotlight.mjs';
import { tierOf } from '../data/claims.mjs';
import { FAMILY } from '../data/family.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';
import { NHL } from '../data/architecture.mjs';
import { HISTORIC } from '../data/building-history.mjs';
import { sponsorsFor } from './sponsor-slot.mjs';

const DAY = 86400e3;

// One day's parts, as of 6 AM in Columbus on that day. Only stories that are
// new (the last 36 hours) go in: an edition never resends old news.
export function edition(date, opts = {}) {
  const noon = new Date(`${date}T12:00:00Z`);
  const now = new Date(`${date}T06:00:00${localOffset(noon)}`);
  const ed = morningEdition({ date, now, ...opts });
  const fresh = ed.stories.filter((s) => now - new Date(s.published) < 36 * 3600e3);
  const dow = noon.getUTCDay();
  const parts = {
    date,
    subject: `${PAPER.name}, ${prettyDate(date)}`,
    stories: fresh.map((s) => ({ href: s.href, headline: s.headline, dek: s.dek || '', label: s.label, byline: bylineText(s), published: s.published })),
    early: ed.early.map((b) => ({ slug: b.slug, name: b.name, hours: hoursOn(b.hours, dow) })),
    business: ed.business && !fresh.includes(ed.business) ? { href: ed.business.href, headline: ed.business.headline } : null,
    sponsors: sponsorsFor('newsletter', noon).map((s) => ({ name: s.name, line: s.line })),
  };
  // A look at the morning as the build knows it (no leads, no spotlight
  // history), for /newsletter/next/.
  const preview = composeEdition({ kind: 'morning', date, name: PAPER.name, origin: ORIGIN, ...parts });
  return { ...parts, fresh: fresh.length, html: preview.html };
}

export function upcomingEditions(from = new Date(), days = 14) {
  return Array.from({ length: days }, (_, i) => columbusDate(new Date(from.getTime() + i * DAY))).map((d) => edition(d));
}

const STREETS = { washington: 'Washington Street' };
const familyTie = new Map(FAMILY.filter((f) => f.slug).map((f) => [f.slug, f.tie]));
const adultSlugs = new Set(FAMILY.filter((f) => f.slug && f.adult).map((f) => f.slug));

// The spotlight candidates: open listings with an address, in a fixed order
// (directory order) so the rotation is the same on every build.
export function spotlightCandidates(dir = directory) {
  return dir.filter((b) => !b.tempClosed && !b.demo && b.address).map((b, order) => {
    const t = tierOf(b.slug);
    return {
      slug: b.slug, name: b.name, address: b.address, type: b.type || '', order,
      kind: (subBySlug[b.sub] && subBySlug[b.sub].label) || (catBySlug[b.cat] && catBySlug[b.cat].label) || '',
      tier: t === 'member' ? 'member' : t === 'claimed' ? 'claimed' : SPOTLIGHT_SLUGS.has(b.slug) ? 'featured' : 'listed',
      member: t === 'member', family: familyTie.get(b.slug) || '', adult: adultSlugs.has(b.slug), hours: b.hours || null,
    };
  });
}

// Columbus by Design: landmarks (with their Commons photo), the National
// Historic Landmarks we have no page for, and the downtown buildings the 1982
// historic district nomination names.
export function designList() {
  const wp = (u) => (/wikipedia\.org/.test(u) ? 'Wikipedia' : /columbus\.in\.us/.test(u) ? 'Visit Columbus' : 'source');
  const land = LANDMARKS.map((l) => ({ id: `l:${l.slug}`, name: l.name, architect: l.architect || '', year: l.year || '', street: l.address || '', what: l.what || '', link: `${ORIGIN}/l/${l.slug}/`, source: l.source, sourceName: wp(l.source), photo: l.photo && /^https:\/\/upload\.wikimedia\.org\//.test(l.photo.src) ? { src: l.photo.src, credit: l.photo.credit, license: l.photo.license, page: l.photo.page } : null }));
  const nhl = NHL.filter((n) => !n.landmark).map((n) => ({ id: `n:${n.name}`, name: n.name, architect: n.architect || '', year: n.year || '', street: n.address || '', what: n.what || '', link: `${ORIGIN}/architecture/`, source: n.source, sourceName: wp(n.source), photo: null }));
  const hist = HISTORIC.map((b) => ({
    id: `h:${b.street}-${b.from}`, name: b.name, architect: '', year: String(b.built).replace(/^c\.\s*/, 'about '),
    street: `${b.from === b.to ? b.from : `${b.from} to ${b.to}`} ${STREETS[b.street] || b.street}`,
    what: `A downtown building named in the 1982 National Register nomination for the Columbus Historic District, built ${String(b.built).replace(/^c\.\s*/, 'about ')}.${b.note ? ` ${b.note}` : ''}`,
    link: '', source: b.source[1], sourceName: 'the National Register nomination', photo: null,
  }));
  return [...land, ...nhl, ...hist].map((d, order) => ({ ...d, order }));
}

export function dailyData(dir = directory) {
  return {
    built: new Date().toISOString(),
    spotlight: spotlightCandidates(dir),
    design: designList(),
    snapshot: Object.fromEntries(dir.map((b) => [b.slug, snapshotOf(b)])),
  };
}

export { columbusDate, columbusMinutes, prettyDate };

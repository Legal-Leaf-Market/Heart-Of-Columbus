// Conflict disclosures, worked out from a story's tags so nobody has to
// remember them. If a story tags a pickup partner (src/data/partners.mjs) or
// a sponsor (src/data/sponsors.mjs), the story page says so, every time.
import { PARTNERS } from '../data/partners.mjs';
import { SPONSORS } from '../data/sponsors.mjs';
import { MEMBERS } from '../data/members.mjs';
import { directory } from '../data/directory.mjs';
import { FAMILY } from '../data/family.mjs';

// The publisher's own businesses, by their listing slug.
const OWN = new Map(FAMILY.filter((f) => f.slug).map((f) => [f.slug, f.tie]));

const nameOf = (slug) => SPONSORS[slug]?.name || directory.find((b) => b.slug === slug)?.name || slug;

export function disclosures(tags = [], { partners = PARTNERS, sponsors = SPONSORS, members = MEMBERS, own = OWN } = {}) {
  const out = [];
  for (const slug of tags) {
    if (own.has(slug)) out.push({ slug, kind: 'own', text: own.get(slug) });
    if (sponsors[slug]) out.push({ slug, kind: 'sponsor', text: `${nameOf(slug)} is a paying sponsor of Heart of Columbus. Sponsors have no say in what we cover or how.` });
    if (members[slug]) out.push({ slug, kind: 'member', text: `${nameOf(slug)} is a Founding Member of Heart of Columbus and pays for a website and a featured listing. Members have no say in what we cover or how.` });
    if (partners[slug]) out.push({ slug, kind: 'partner', text: `${nameOf(slug)} takes pickup orders through Heart of Columbus, which makes it a business partner of this site. Partners have no say in what we cover or how.` });
  }
  return out;
}

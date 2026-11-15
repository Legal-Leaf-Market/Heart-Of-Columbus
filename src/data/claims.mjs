// Which of the three page tiers a business gets.
//
//   listed   Nobody from the business has spoken to us. The page is an outline:
//            the public facts, plainly drawn, and an invitation to claim it.
//   claimed  Someone who speaks for the business has confirmed it: an entry
//            below, owner words we published, photos sent with permission, or a
//            pickup partnership. The page shows what they sent.
//   member   A paying Founding Member (members.mjs). The page wears the
//            business's own brand (brands.mjs), and says the business pays.
//
// CLAIMED: a business whose owner confirmed the listing through the claim form
// or in person, with who, how and when. Empty until one does.
import { MEMBERS } from './members.mjs';
import { WORDS } from './owner-words.mjs';
import { MEDIA } from './media.mjs';
import { PARTNERS } from './partners.mjs';

export const CLAIMED = {};

export function tierOf(slug) {
  if (MEMBERS[slug]) return 'member';
  if (CLAIMED[slug]?.confirmed || WORDS.some((w) => w.slug === slug && w.confirmed) || (MEDIA[slug]?.permission) || PARTNERS[slug]) return 'claimed';
  return 'listed';
}

// Founder numbers follow the order owners signed; on a shared day, the order
// they are listed in members.mjs (the same rule as the Founders Club wall).
export const founderNumber = (slug, listed = () => true) =>
  Object.entries(MEMBERS).filter(([s]) => listed(s)).sort((a, b) => a[1].since.localeCompare(b[1].since)).findIndex(([s]) => s === slug) + 1;

// Editorial category illustrations: painted scenes of imaginary places, made
// for one browse type. They never show a listed business, so they are only a
// fallback for a listing with no approved photo (mediaFor), and every use
// carries a visible "Category illustration" tag. Files live in public/art/;
// generation briefs are in art-source/editorial/PROMPTS.md.
//
// Keyed by the canonical type slug (subBySlug), never by a display label, so
// a renamed heading can't move the art. A type missing here keeps its cover-*
// clip art and emoji.
export const EDITORIAL = {
  barbers: {
    // Card and business-page fallbacks. pos is the CSS object-position that
    // keeps each painting's subject in frame when the box crops it.
    scenes: [
      { file: 'editorial-barbers-interior.webp', width: 1280, height: 853, pos: '60% 50%' },
      { file: 'editorial-barbers-tools.webp', width: 1280, height: 853, pos: '50% 56%' },
      { file: 'editorial-barbers-storefront.webp', width: 1920, height: 640, pos: '68% 50%' },
    ],
    // The /c/<cat>/<type>/ page header. Painted with open cream stucco on its
    // left third for the copy panel beside it.
    hero: { file: 'editorial-barbers-storefront.webp', width: 1920, height: 640, pos: '68% 50%' },
  },
};

export const EDITORIAL_CAPTION = 'Category illustration';

// FNV-1a, 32 bit. Same function as the art package's helper.
const fnv = (s) => {
  let h = 2166136261;
  for (const ch of s) h = Math.imul(h ^ ch.codePointAt(0), 16777619) >>> 0;
  return h;
};

// The scene for one listing, or null. A pure function of the listing's
// canonical path (category/type/slug): the same shop gets the same picture on
// every page, in every sort and filter, and after the client re-renders a
// list. Never a list index, never random.
export function editorialFor(b) {
  const set = EDITORIAL[b?.sub];
  if (!set || typeof b.slug !== 'string' || !b.slug.trim()) return null;
  return set.scenes[fnv(`${b.cat}/${b.sub}/${b.slug}`) % set.scenes.length];
}

export const editorialHero = (sub) => EDITORIAL[sub]?.hero || null;

// Section paintings (public/art/sections-v1/, 1440x480 with 768 copies):
// imaginary scenes, one per browse category, used only as the page header of
// /c/<cat>/ and of its type pages that have no hero of their own. Never a
// card fallback: one painting behind every card in a category would read as
// a photo of each shop. Each is painted with open space on its left for the
// copy panel; pos keeps the subject in frame. dark: navy copy panel.
const SEC = (name, pos, dark = false) => ({ file: `sections-v1/${name}-1440.webp`, small: `sections-v1/${name}-768.webp`, width: 1440, height: 480, pos, dark });
export const SECTION_ART = {
  'coffee-sweets': SEC('coffee-and-sweets', '74% 50%'),
  bars: SEC('downtown-after-dark', '80% 50%', true),
  shopping: SEC('makers-and-markets', '70% 50%'),
  events: SEC('arts-and-music', '76% 50%'),
  'things-to-do': SEC('parks-and-trails', '70% 50%'),
};
// The Explore page banner (list view only).
export const EXPLORE_ART = SEC('downtown-day', '74% 50%');

export const sectionHero = (cat) => SECTION_ART[cat] || null;


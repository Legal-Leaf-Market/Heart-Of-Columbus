// Photos and logos a business has let us show. EMPTY ON PURPOSE: a photo on a
// business's own website is not permission to copy it here, so nothing goes in
// until the owner (or a license we can cite) says yes. Files live in
// public/business-media/<slug>/. Unapproved candidates stay in staging, never
// under public/. To add one, key it by directory slug:
//
//   'gramz-bakery-and-cafe': {
//     cover: { file: 'cover.webp', width: 1200, height: 800, alt: 'Pastry case at the counter' },
//     logo: { file: 'logo.png', width: 400, height: 400, alt: 'Gramz Bakery logo' },
//     gallery: [],                          // more { file, width, height, alt }, shown in order
//     stickers: [],                         // a member's own cut-out art, { file, width, height, alt, at },
//                                           // placed as decoration at a named spot on its page
//     sourceUrl: 'https://...',             // where each file came from
//     permission: 'Owner email, 2026-11-02', // the grant, or a license name and its page
//     credit: 'Photo: Gramz Bakery',        // shown under the photo, as the owner asked
//     checked: '2026-11-02',                // date we confirmed source and permission
//   },
//
// A listing with no entry has NO image region at all: its card and page are
// text first (name, type, place, actions). No category art, painted scene,
// sticker or initials stands in for a business, and a photo that fails to
// load drops back to that text-only layout, never to a placeholder.
// Where a member's stickers may sit (stickerAt in src/pages/directory-pages.mjs).
export const STICKER_SPOTS = ['card', 'cover', 'picks', 'member'];

export const MEDIA = {
  // Bip said yes to showing his photos (via Jacob Kennedy, 2026-11-15). The
  // cover is the thumbnail of his own YouTube video, the one embedded on his
  // recipes page. His website's photos are behind a bot check, so the rest wait
  // until he sends the files.
  'bips-bites': {
    cover: { file: 'cover.webp', width: 1280, height: 720, alt: "NYC chopped cheese sandwich with Bip's cheese sauce, from a Bip's Bites cooking video" },
    gallery: [],
    sourceUrl: 'https://www.youtube.com/watch?v=laaXJCTVD3M',
    permission: 'Bip, the owner, said yes via Jacob Kennedy, 2026-11-15',
    credit: "Photo: Bip's Bites",
    checked: '2026-11-15',
  },
  // Kawaii Katz is an online shop, so its pictures are its own mascot artwork,
  // not photos of a storefront: the app icon (public/icon-512.png), the cast
  // (public/anime/trio.webp) and sticker poses from public/anime/ and
  // public/decora/, all files from the site's own repository. Jacob Kennedy,
  // who runs the site with his daughter Ada, asked for its full Founding
  // Member page on 2026-11-25 and for it to look its best. Only the plain cute
  // poses are used; the charm-covered decora poses belong to its /decora room.
  'kawaii-katz': {
    cover: { file: 'cover.webp', width: 1100, height: 630, alt: "Kawaii Katz's mascots: Katz the black kitten, a bunny in pink and black, and Panda, with cherry blossom petals" },
    logo: { file: 'logo.webp', width: 512, height: 512, alt: 'Kawaii Katz logo: a black kitten and a panda' },
    gallery: [],
    // Spread down its page rather than in one row (Jacob, 2026-11-25): `at`
    // names the spot (see stickerAt in src/pages/directory-pages.mjs).
    stickers: [
      { file: 'mascot-1.webp', width: 600, height: 600, alt: 'Panda hugging a parcel tied with a pink heart', at: 'card' },
      { file: 'mascot-2.webp', width: 600, height: 600, alt: 'Katz the kitten pouncing on a pile of pink puzzle pieces', at: 'cover' },
      { file: 'mascot-3.webp', width: 320, height: 320, alt: 'Panda in pink headphones holding a game controller', at: 'picks' },
      { file: 'mascot-4.webp', width: 338, height: 320, alt: 'Katz hugging a big pink heart', at: 'member' },
    ],
    sourceUrl: 'https://github.com/Legal-Leaf-Market/KawaiiKatz/tree/main/public',
    permission: 'Jacob Kennedy, who runs Kawaii Katz with his daughter Ada, 2026-11-25',
    credit: 'Art: Kawaii Katz',
    checked: '2026-11-25',
  },
};

// Every image file must be a real file under public/business-media/<slug>/.
const realFile = (f) => !!f && typeof f.file === 'string' && /^[a-z0-9][a-z0-9._-]*\.(?:webp|jpe?g|png|avif)$/i.test(f.file) && f.width > 0 && f.height > 0 && !!f.alt;

// The approved media for a listing, or null. Pages call this rather than
// reading MEDIA, so a half-filled entry (no permission, no source, no date,
// no credit) shows nothing. Unknown origin or rights means not approved.
export function mediaFor(slug) {
  const m = MEDIA[slug];
  return m && m.permission && m.checked && m.credit && /^https?:\/\//.test(m.sourceUrl || '') ? m : null;
}
export const mediaSrc = (slug, f) => `/business-media/${slug}/${f.file}`;

// The one business-media contract every surface uses (cards, business pages,
// spotlight, search index, explore, map and table views, Spin):
//   { state: 'photo', src, width, height, alt, credit }  a real, approved photo
//   { state: 'logo',  src, width, height, alt, credit }  an approved logo only
//   { state: 'none' }                                    text-first, no image region
export function businessMedia(slug) {
  const m = mediaFor(slug);
  if (m && realFile(m.cover)) return { state: 'photo', src: mediaSrc(slug, m.cover), width: m.cover.width, height: m.cover.height, alt: m.cover.alt, credit: m.credit };
  if (m && realFile(m.logo)) return { state: 'logo', src: mediaSrc(slug, m.logo), width: m.logo.width, height: m.logo.height, alt: m.logo.alt, credit: m.credit };
  return { state: 'none' };
}

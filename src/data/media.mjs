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

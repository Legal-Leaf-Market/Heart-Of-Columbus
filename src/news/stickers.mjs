// Decorative stickers a story may carry (public/art/sticker-*.webp), cut from
// the Heart of Columbus sticker sheet (Pacers design pack, 2026-11-24). They
// are illustration, never documentary: they sit beside headlines and section
// headings, never over a photo, and are hidden from screen readers.
//
// In a story's front matter:
//   stickers:
//     - sticker: olive-branch          # shown under the headline
//     - sticker: road-trip
//       heading: Getting there         # shown beside that ## heading instead

export const STICKERS = {
  'hug': 'Two friends hugging',
  'hands': 'Clasped hands',
  'indiana-heart': 'Indiana in a heart',
  'olive-branch': 'An olive branch',
  'road-trip': 'Friends on a road trip',
  'tickets': 'Two blank tickets',
  'basketball': 'A basketball',
  'hoop': 'A basketball in the hoop',
  'arena-lights': 'Arena lights',
  'cheering': 'Cheering hands',
  'pompoms': 'Blue and gold pom poms',
  'popcorn-cotton-candy': 'Popcorn and cotton candy',
  'choir': 'A school choir',
  'dance-team': 'A youth dance team',
  'starburst': 'A gold starburst',
};

export const stickerSrc = (name) => `/art/sticker-${name}.webp`;
export const stickerImg = (name, cls = 'np-sticker') =>
  `<img class="${cls}" src="${stickerSrc(name)}" alt="" aria-hidden="true" loading="lazy" width="96" height="96">`;

// Brand kits for Founding Members' pages: the colors and the display font a
// paying member's page wears. Three tiers of business page (src/data/claims.mjs):
// an unclaimed listing is a plain outline, a claimed one shows the owner's
// photos and words, and a Founding Member's page is dressed in its own brand.
//
// Where a kit may come from (`from`):
//   own    the business's own website or materials, quoted in `note`
//   owner  sent by the owner (say who and when in `note`)
//   draft  the draft website Heart of Columbus built for the member, which
//          the member has not replaced with brand files of its own yet
// Logos are never here. A logo shows only from src/data/media.mjs, with the
// owner's permission, like every business photo. Until one arrives the page
// shows the business's initials in its brand colors, never a logo we drew.
//
// Colors: `brand` is required. `deep` (dark), `accent` and `paper` (light) are
// worked out from it when missing. `font` must be one of FONTS (all self-hosted
// in public/fonts and declared in public/css/hoc.css).
export const FONTS = ['Fraunces', 'Alfa Slab One', 'Lilita One', 'Righteous', 'Bungee', 'Archivo', 'Pacifico'];

export const BRANDS = {
  'turtles-flowers': {
    brand: '#5f8f1f', accent: '#89bf34', font: 'Fraunces',
    from: 'own', source: 'https://www.turtlesflowers.com/', checked: '2026-11-15',
    note: 'theme-color #89bf34 in its own site\'s code; brand is the same green darkened so white text on it is readable.',
  },
  'bips-bites': {
    brand: '#581189', deep: '#2a0a3c', accent: '#c9a2ef', paper: '#f6efe4', font: 'Fraunces',
    from: 'own', source: 'https://www.youtube.com/watch?v=laaXJCTVD3M', checked: '2026-11-15',
    note: 'Purple and cream sampled from the title card of his own video (the photo on his page, shown with his permission).',
  },
  'cookie-paradise-llc': {
    brand: '#593412', accent: '#f6b452', paper: '#fff8ec', font: 'Lilita One',
    from: 'draft', source: 'sites/cookie-paradise/index.html', checked: '2026-11-15',
    note: 'Cocoa, honey and cream from its draft website palette.',
  },
  'tjs-chopshop': {
    brand: '#c0392b', deep: '#14181f', accent: '#e8c37a', paper: '#f4ecdd', font: 'Alfa Slab One',
    from: 'draft', source: 'sites/tjs-chopshop/GRAPHICS.md', checked: '2026-11-15',
    note: 'Barber red, ink, gold and cream with Alfa Slab One, from its draft website.',
  },
  'rabbits-balloons': {
    brand: '#bf4f3a', deep: '#1f2d52', accent: '#e98ea3', paper: '#fffaf4', font: 'Fraunces',
    from: 'draft', source: 'https://rabbits-balloons.netlify.app/', checked: '2026-11-15',
    note: 'Coral, rose, navy and ivory with Fraunces, from its draft website.',
  },
};

// Color helpers: hex in, hex out.
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => hex(rgb(a).map((v, i) => v + (rgb(b)[i] - v) * t));
const lum = (h) => {
  const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// The palette a page uses. A member without a kit wears its category color, so
// every member page is themed even before the brand files arrive.
export function paletteFor(slug, fallback) {
  const k = BRANDS[slug] || { brand: fallback };
  const brand = k.brand;
  const deep = k.deep || mix(brand, '#000000', 0.55);
  const paper = k.paper || mix(brand, '#ffffff', 0.9);
  const accent = k.accent || mix(brand, '#ffffff', 0.45);
  const on = contrast(brand, '#ffffff') >= 4.5 ? '#ffffff' : '#1b1a17';
  return { brand, deep, paper, accent, on, font: k.font || null, kit: !!BRANDS[slug] };
}

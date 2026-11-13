# Graphics brief: TJ's ChopShop draft site

Hand this to whoever makes the graphics. Files go in `sites/tjs-chopshop/img/`
with exactly these names. Each slot already exists in `index.html`; a file that
is there shows, a file that is missing leaves the current design in place.

| File | Where it shows | Size | What it should be |
| --- | --- | --- | --- |
| `img/hero.webp` | The framed sign beside the headline (desktop) | 960 x 1280, portrait 3:4 | A bold illustration or graphic for the shop: barber pole, chair, clippers, "TJ's ChopShop" lettering. Dark background, gold and barber red/blue accents. |
| `img/before.webp` | "Before" frame in The shop section | 800 x 1000, portrait 4:5 | **TJ's real photo only.** |
| `img/after.webp` | "After" frame in The shop section | 800 x 1000, portrait 4:5 | **TJ's real photo only.** |

The site's palette, so graphics match: ink `#14181f`, cream `#f4ecdd`,
barber red `#c0392b`, barber blue `#2f5f9e`, gold `#e8c37a`. Headline font is
Alfa Slab One.

## Rules

- **Before and after are real photos from TJ, never generated or found
  online.** A made-up "before" of a real shop's restoration is a fake record
  of his business, and it is the first thing he would notice.
- No photos taken from his Facebook or Booksy without his OK.
- Generated art is fine for the hero and decoration: illustrations, the logo
  lettering, patterns. Nothing that looks like a photo of his actual shop or
  of him.
- Save as WebP (`cwebp -q 82 in.png -o hero.webp`), under 300 KB each.

## After adding files

Run `npm test` from the repo root (it builds the preview), then merge. The
site updates at https://heartofcolumbus.netlify.app/preview/tjs-chopshop/

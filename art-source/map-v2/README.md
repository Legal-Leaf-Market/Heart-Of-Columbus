# Map art v2

Badges and cutouts for the maps on /explore/ and the type-page map view
(`public/js/explore.js`, `public/js/views.js`), from the "Heart of Columbus Map
Art" package (November 2026). Files live in `public/art/map-v2/`.

- `category-<slug>.svg`: 44 x 52 badges, tip at (22, 48.5). One per browse
  category, plus `barbers`, `salons`, `nails`, `spa` and `tattoo`, which a
  listing of that type uses before its category's. `category-weekend.svg`
  marks this weekend's events. Original vector drawings; edit the SVG.
- `landmark-<name>.svg`: one badge per landmark, mapped by landmark slug in
  `LANDMARK_ART` (explore.js). The Robert N. Stewart Bridge has none yet and
  keeps `/art/pin-bridge.webp`.
- `landmark-<name>-cutout-256.webp` (and `-512`): detailed cutouts of First
  Christian, North Christian and the courthouse, shown from zoom 15
  (`CUTOUT_ZOOM`). They are generated, stylized interpretations, not surveyed
  elevations: check them against the visitor center's pages before launch, and
  drop a name from `CUTOUT` to fall back to its badge. `PROMPTS.md` is how
  they were made. Their PNG masters (about 5.5 MB) stay with the package.

The package's `@2x` PNG companions are left out: browsers draw the SVGs sharp
at any density. Note for review: Visit Columbus Indiana now lists North
Christian Church as The LEX; the landmark's name in `src/data/landmarks.mjs`
is unchanged here.

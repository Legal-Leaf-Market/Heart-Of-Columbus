# Integrate TJ’s ChopShop branding
Target existing route: /preview/tjs-chopshop/ on heartofcolumbus.netlify.app. This package is an asset handoff; no live website changes have been made.

1. Inspect repository guidance and identify the route component. Preserve other Heart of Columbus business pages and the main site identity.
2. Copy logos/, icons/, patterns/, artwork/ and web/ into public/assets/tjs-chopshop/ (or project convention). Keep descriptive filenames. Import brand.css scoped to the TJ route; scope root tokens to its wrapper if the app shares styles.
3. Replace existing generic shop graphics with logo-primary.svg in header and logo-ivory.svg in dark footer. Use monogram.svg or icon-32.png as route-specific icon only if framework supports it; do not replace global Heart of Columbus favicon.
4. Use artwork/hero-chair.png as a conceptual illustrated hero, not an actual shop photo. If present, use hero-chair.webp for the optimized web version. Keep live heading and booking CTA separate. Desktop art right with left copy; on mobile stack art below copy. Use object-fit:cover and inspect focal point. Give the image its actual width and height. Only hero loads eagerly; other images lazy. Do not render its conceptual room as a real before/after.
5. Preserve booking destination exactly: https://booksy.com/en-us/1010454_tj-s-chopshop_barber-shop_19373_columbus . Header CTA “Book a cut”; hero CTA “Book on Booksy”. Existing map directions address remains 1521 17th St, Columbus, IN 47201, pending business confirmation.
6. Icons are currentColor SVGs: 24–32px in controls; decorative icons aria-hidden=true, standalone buttons have accessible names. Patterns stay decorative and low prominence.
7. Social PNGs are ready for digital posting; SVG sources allow editing copy. Do not publish unconfirmed offers, hours, pricing or services. Replace Georgia/Arial text with outlined text only if preparing physical print, not web copy.
8. Keep all existing factual placeholders explicit in this review draft. Do not fill services/prices/hours, old shop history, phone or review count by guessing. Before a public launch, obtain TJ approval for those sections and replace placeholder story with his words. No fake team portraits or haircut results.
9. Use social/open-graph.png as route OG image with absolute production asset URL; set route title and description without unverified claims. Suggested title: “TJ’s ChopShop | Columbus, Indiana”.
10. Validate 360px, 768px and 1440px layouts, no horizontal overflow, SVG appearance on dark/light surfaces, keyboard focus, booking href and image loading. Build with project’s existing command. Report files touched and outstanding factual confirmations.

Read BRAND_GUIDE.md for identity rules. Open ../index.html to browse the asset library locally. No external dependencies required.

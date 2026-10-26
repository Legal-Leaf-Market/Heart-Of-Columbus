# Photo outreach: restaurants

Who to ask for photos first. This is NOT a list of photos we may use. A
picture on a business's own website is theirs, and nothing from it goes on
Heart of Columbus until the owner says yes (see `src/data/media.mjs`).

Started 2026-10-26 from a list of image links someone pasted in. Those links
were not used and are not kept here: many looked machine-written rather than
copied from the real sites (Squarespace IDs like `1A2B3C4D5E6F7G8H9I0J`, and
tidy guesses such as `/wp-content/uploads/2021/04/papa-nachos.jpg`), and none
could be opened from the build environment to check.

## How to ask

1. Send the owner their listing (`/b/<slug>/`) and the claim link with
   photos ticked: `/owners/?b=<slug>&want=photos#claim`.
2. Ask for 1 to 5 photos they are happy to share (storefront, a signature
   dish, the room, the team, the logo), the credit line they want, and a
   short yes in writing (email or text is fine).
3. When they reply, for each photo:
   `python3 scripts/add-photo.py <slug> cover|logo|gallery <file> --alt "what it shows"`
4. Paste the printed lines into `MEDIA` in `src/data/media.mjs` and fill in
   `permission` from their actual reply (who, how, date), `credit`,
   `sourceUrl` (where they sent it, or their site) and `checked`.
5. `npm test`. A file with no entry, or an entry with no permission, fails.

## The list

| Slug | Status | Note |
|---|---|---|
| `blackerbys-hangar-5-restaurant` | To ask | |
| `for-the-love-of-brunch` | To ask | |
| `fresh-take-kitchen` | To ask | |
| `lucas-brothers-sandwich-shop` | To ask | |
| `olesyas-kitchen` | To ask | |
| `yats` | Check ownership first | Yats has locations in several cities; confirm whether the Columbus one is an independent licensee or a franchise before featuring it (`src/data/ownership.mjs`). |
| `el-nopal-mexican-cuisine` | To ask | |
| `lucianas-mexican-restaurant` | To ask | |
| `riviera-maya` | To ask | |
| `tacolumbus` | To ask | Also a storefront demo subject; a real photo makes the pitch stronger. |
| `black-sheep-craft-pizza-and-cocktails` | To ask | |
| `mother-bears-pizza` | Check ownership first | Mother Bear's has more than one location; confirm the Columbus shop is locally owned. |
| `zwanzigz-pizza-and-brewing` | To ask | |
| `ramen-alley` | To ask | |
| `thai-connection` | To ask | |
| `masala-magic` | To ask | |
| `misora` | To ask | |
| `tasty-express` | To ask | Also a storefront demo subject. |
| `amazing-joes-grill` | Check ownership first | Several Indiana locations; confirm local group versus franchise. |
| `chicagos-pizza` | Check ownership first | Several locations; confirm local group versus franchise. |
| `hotbox-pizza` | Check ownership first | A multi-state pizza brand; likely a franchise. |
| `jaggers` | Do not ask | Removed from the directory: a Texas Roadhouse brand (`src/data/ownership.mjs`). |

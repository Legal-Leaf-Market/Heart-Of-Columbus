# Seed data

> **Status (October 27, 2026):** this folder came with version 2 of the
> brief, after PRs 1 to 4 and 16 had shipped from the brief's own research.
> Most of it was already on the site (visit facts, Social District rules and
> permittees, the four public bodies, the landmarks with photos). What was
> new and is now on the site, rechecked on the cited pages: the Deja Vu Art
> and Fine Craft Show (November 14) and the Festival of Lights (December 5)
> on /events/, The Republic Newspaper Office as the seventh National
> Historic Landmark on /architecture/, North Christian Church's move to the
> library as The LEX, and the Board of Zoning Appeals on /meetings/. Left
> out until a person checks: the Irwin Union Bank vacancy and address
> conflict, the `check` permittees (the site matches them by the
> ordinance's addresses instead), and the city council schedule.

Researched starting data for the first roadmap PRs, so Claude Code doesn't
have to invent anything. Every entry cites where it came from. Checked
October 25 to 27, 2026.

| File | For | What's in it |
| --- | --- | --- |
| `visit.json` | PR 1, `/visit/` | Visitors Center, official and self-guided tours, ColumBUS, People Trail, Social District basics, getting here, the official-site note, the *Columbus* film |
| `dora.json` | PR 2, Social District tags | The city's rules, map links, and all 17 permittees matched to directory slugs: 12 likely, 3 to check, 2 not in the directory |
| `landmarks.json` | PR 3, landmark pages | The 10 landmarks in `PHOTOS` plus 3 more National Historic Landmarks, with architect, year, address, coordinates where found, access, and conflicts between sources |
| `events.json` | PR 4, "This weekend" | 4 entries through December 2026 (one already past, as a test case) and a list of events still to research |
| `meetings.json` | PR 16, `/meetings/` | County commissioners, school board, plan commission and BZA, city council, plus two public-record lead sources |

## How to use it

- Convert each file into the `src/data/*.mjs` module the brief names, in
  the repo's style, with the header comment saying where the data came from
  and when it was checked.
- Keep `source` and `checked` on every entry. The new tests should fail
  without them.
- Wherever a field is `null` or a `note` says "confirm," fill it from the
  cited kind of source and cite it, or leave the field out of the page.
  Never guess.
- `status: "check"` entries in `dora.json` and every `note` that mentions a
  conflict need a person's decision before they show on the site. List them
  in the PR description.

## What's still missing

- Coordinates for Irwin Union Bank, City Hall, the Stewart Bridge and Fire
  Station 4 (fill from OpenStreetMap, with ODbL credit).
- Photos for First Baptist Church, Mabel McDowell and the Republic building
  (Wikimedia Commons, credited on `/credits/` like the others).
- 2027 dates for the annual signature events.
- The city council's meeting schedule.
- Permittee locations from the city's Designated Permittee Map, which is an
  image, not text.

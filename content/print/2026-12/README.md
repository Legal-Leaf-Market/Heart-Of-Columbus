# December 2026 print edition: writers' files

The paper is laid out at `/print/2026-12/` (16 pages, 11 by 17 inches). Every
news slot shows its writer's brief until the file for it lands here. Add the
file, push, and the page fills itself in on the next deploy. What is still
missing is listed at `/print/2026-12/status/`.

Claude does not write news, so every file here is written by the person named
on it and checked by a different person, the editor.

## The slots

| File | Page | What | About | Writer | Editor |
|---|---|---|---|---|---|
| `river.md` | 1 | The river comes back (brief A) | 600 words | Jake Kennedy | Eli Wire |
| `publisher.md` | 2 | From the publisher: why a paper | 650 words | Jake Kennedy | Eli Wire |
| `referendum.md` | 3 | The BCSC referendum (brief B) | 650 words | to be named | Jake Kennedy |
| `election.md` | 4 | Election results (brief C) | 500 words | to be named | Jake Kennedy |
| `camping.md` | 5 | The state camping law (brief D) | 750 words | to be named | Jake Kennedy |
| `jake-december.md` | 9 | Jake Takes the Town, December (optional) | 800 words | Jake Kennedy | Eli Wire |
| `sports.md` | 13 | North and East this winter | 550 words | to be named | Jake Kennedy |
| `gathers-intro.md` | 14 | Where Columbus gathers: a short opening | 180 words | to be named | Jake Kennedy |
| `faith.md` | 14 | Christmas services and community dinners | 400 words | to be named | Jake Kennedy |

The briefs (what the sources say, what to verify, who to ask) are in
`src/print/briefs.mjs` and print in each slot until the story arrives.

## The file

```markdown
---
headline: The river comes back
dek: One sentence under the headline.
kicker: Riverfront
bylines: [jacob-kennedy]
editor: eli-wire
status: draft
photo:
  file: /news-media/2026/12/riverfront.jpg
  alt: What the photo shows
  caption: One line about the photo.
  credit: Eli Wire
  license: Staff photo
box:
  title: The project in numbers
  items:
    - About $18.9 million approved
    - Low head dam removed in September 2026
---
The story, in plain paragraphs. A line that starts with ## is a subhead.
```

- `bylines` and `editor` are slugs from `src/data/staff.mjs`. The editor
  cannot be a byline.
- `status: ready` once the editor has checked every fact. Until then the page
  marks the story Draft.
- `box` fills the side box on page 1 (the river) and page 3 (the referendum).
- No dashes a reader can see: use a comma, a colon or a period. The build
  stops and names the file if one gets in.
- Photos go in `public/news-media/2026/12/`, 2000 pixels wide or more.

## Election results (page 4)

The table fills from `results:` in `election.md`. Certified numbers only, from
the county clerk's canvass. The first candidate listed gets the check mark.

```yaml
resultsLine: Certified canvass, November 3, 2026
resultsSource: Bartholomew County Clerk, certified results
results:
  - office: County Recorder
    candidates:
      - name: Debra K. Beck Settle
        party: R
        votes: 0
      - name: Nancy Merbitz
        party: D
        votes: 0
```

Write each candidate as its own block, as above; the site's front matter
reader does not take the `{ name: ..., votes: ... }` short form.

## Checking it

Run `npm run build`, open `/print/2026-12/` and wait for the toolbar to say
"All 16 pages fit". Anything that runs long is outlined in pink and listed in
the toolbar. `node scripts/print-pdf.mjs` makes the PDF and checks it.

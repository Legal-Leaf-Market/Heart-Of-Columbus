// Recurring series: a named run of stories by one writer, across sections.
// A story joins a series with `series: <slug>` in its front matter
// (src/news/content.mjs checks the slug and that the series writer is on the
// byline). Each series gets a page at /news/series/<slug>/.
//
//   {
//     slug: 'some-series',          // URL and the value stories use in `series`
//     name: 'Some Series',          // shown on the story and the series page
//     writer: 'staff-slug',         // optional: src/data/staff.mjs, then on every byline
//     blurb: 'One plain sentence on what the series is.',
//   }

export const SERIES = [
  {
    slug: 'jake-takes-the-town',
    name: 'Jake Takes the Town',
    writer: 'jacob-kennedy',
    // Named and described by Jake Kennedy, 2026-11-24.
    blurb: 'Jake Kennedy goes to the events around Columbus and beyond, and writes about what it was like to be there.',
  },
  {
    slug: 'back-your-blue',
    name: 'Back YOUR Blue',
    // Open to more writers later (community thank you stories), so no fixed
    // writer. Named by Jake Kennedy; first published on Crossroads, 2026-11-13.
    blurb: 'A place to say thank you to a specific person who served: an officer, an EMT, a firefighter, a dispatcher, a veteran. It starts with Jake Kennedy’s tribute to his father.',
  },
];

export const seriesBySlug = Object.fromEntries(SERIES.map((s) => [s.slug, s]));
export const seriesHref = (s) => `/news/series/${s.slug}/`;

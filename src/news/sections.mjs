// The paper's sections. A story's `section` must be one of these slugs
// (tests/news.test.mjs). To add a section, add an entry; that's all a
// section of plain stories needs. The generic page at /news/<slug>/ lists
// its stories, newest first.
//
//   {
//     slug: 'faith',                 // URL and the value stories use in `section`
//     name: 'Faith',                 // shown in the paper's bar and on cards
//     blurb: 'One plain sentence on what the section covers.',
//     bar: true,                     // show in the paper's bar (default true)
//     href: '/faith/',               // only if your own file builds the page
//     links: [['/faith/map/', 'Map']], // optional: related pages shown on the section page
//   }
//
// A section with its own page (a dashboard, a directory, a data tool) sets
// `href` and builds that page itself with newsPage() from src/news/frame.mjs.
// It can still list its stories with storiesIn(slug) from
// src/news/content.mjs and storyList() from src/news/render.mjs.
//
// Rules that come with a section: sports is human written, obituaries come
// only by submission from a family or funeral home, opinion is always
// labeled. See docs/newspaper-plan.md.

export const SECTIONS = [
  { slug: 'local', name: 'Local', blurb: 'The city, the county and the schools.', links: [['/meetings/', 'Public meetings'], ['/data/', 'Public data'], ['/notices/', 'Public notices'], ['/help/', 'Get help in Columbus']] },
  { slug: 'business', name: 'Business', blurb: 'Openings, closings, new owners and expansions, confirmed with the business.' },
  { slug: 'food', name: 'Food & drink', blurb: 'Where Columbus eats and drinks, and the people behind it.' },
  { slug: 'architecture', name: 'Architecture & design', blurb: 'The beat only Columbus has.', links: [['/architecture/', 'The architecture guide'], ['/arts/', 'Public art'], ['/cummins/', 'Cummins'], ['/free/#from-the-street', 'Architecture from the street'], ['/trips/architecture-morning/', 'An architecture morning'], ['/film/', 'The Columbus film trail']] },
  { slug: 'neighborhoods', name: 'Neighborhoods', blurb: 'News from each part of town.', areas: true },
  { slug: 'sports', name: 'Sports', blurb: 'Columbus North, Columbus East and area schools. Written by people who were there.', links: [['/sports/', 'Games and schedules'], ['/sports/sentinels/', 'Indiana Sentinels']] },
  { slug: 'faith', name: 'Faith', blurb: 'Congregations of every kind across Bartholomew County: new pastors, anniversaries, missions and the people who serve.', links: [['/history/blair/', 'Brian Blair’s faith beat'], ['/history/section/faith/', 'Faith in Columbus history'], ['/history/publisher/bringing-faith-back/', 'Why we brought the faith section back']] },
  { slug: 'things-to-do', name: 'Things to do', blurb: 'What’s on this week, and what’s worth planning for.', events: true, links: [['/events/', 'Local events calendar'], ['/djs/', 'Columbus DJs'], ['/skate/', 'The skate park'], ['/visit/', 'Plan your visit'], ['/free/', 'Free in Columbus'], ['/visit/#whats-on', 'Every upcoming event']] },
  // Sections other features build as their own pages (href): listed in the
  // paper's bar, no generic /news/<slug>/ page.
  { slug: 'markets', name: 'Markets', blurb: 'Stocks of companies that matter to Columbus.', href: '/markets/' },
  { slug: 'agriculture', name: 'Agriculture', blurb: '4-H, the county fair, local growers and grain prices.', href: '/agriculture/' },
  { slug: 'skate', name: 'Skate park', blurb: 'The Jolie Crider Memorial Skatepark, its history and the people who skate it.', href: '/skate/', bar: false },
  { slug: 'obituaries', name: 'Obituaries', blurb: 'Submitted by families and funeral homes.', href: '/obituaries/' },
  { slug: 'history', name: 'History', blurb: 'Columbus from the 1930s to now, ten sourced stories a decade, plus the town’s newspapers and Brian Blair’s faith beat.', href: '/history/' },
  { slug: 'opinion', name: 'Opinion', blurb: 'Editorials, columns and letters from readers, always labeled.', links: [['/letters/', 'Write a letter to the editor']] },
  // The live events calendar (library, parks, fairgrounds, Arts Council, live
  // music), built by src/pages/calendar-pages.mjs.
  { slug: 'events', name: 'Events', blurb: 'Library, parks, fairgrounds, Arts Council and live music listings, each linked to its organizer.', href: '/events/' },
];

export const sectionBySlug = Object.fromEntries(SECTIONS.map((s) => [s.slug, s]));
export const sectionHref = (s) => s.href || `/news/${s.slug}/`;

// Topics a story may tag besides businesses, landmarks and neighborhoods.
// Lowercase, hyphenated. Add freely; a tag that isn't anything fails the test.
export const TOPICS = [
  'city-council', 'county', 'schools', 'bcsc', 'elections', 'budget', 'development', 'housing', 'roads', 'parks',
  'weather', 'river', 'flooding', 'public-safety', 'health', 'jobs', 'manufacturing', 'agriculture',
  'arts', 'music', 'history', 'faith', 'events', 'festivals', 'holidays', 'film', 'architecture', 'design',
  'restaurants', 'openings', 'closings', 'small-business', 'sports', 'high-school-sports', 'skate', 'obituaries',
  'reader-question', 'letters',
];

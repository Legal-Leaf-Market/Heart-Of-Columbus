// The December 2026 print edition, page by page: the plan in
// docs/paper/december-2026-prototype.md turned into a layout the site can
// render at /print/2026-12/ and a browser can print at tabloid size.
//
// A page is rows of modules on a five column grid (span 1 to 5). `topics`
// are history sections (src/data/history/index.mjs): when a column comes up
// short, the fitter fills it with a card from an approved history article on
// that page's topic, then with an ad for ourselves.
//
// A page is rows of modules on a five column grid (span 1 to 5). A row with
// `fill` takes whatever height is left on the page. Module types:
//
//   writer   a news story or column a named person writes. It reads
//            content/print/2026-12/<id>.md; until that file exists the page
//            shows the writer's brief (src/print/briefs.mjs) in its place.
//   history  an approved history article (group/slug in src/data/history/).
//            fit: 'trim' lets the page cut it at a paragraph to fit, with a
//            QR code to the whole thing online.
//   story    a story already published on the site (content/stories/).
//   box      a fixed module built from site data (staff, help, events...).
//
// Two-person rule: a writer slot names the person expected to write it and an
// editor who is not that person. The writer's file can change either.

export const EDITION = {
  slug: '2026-12',
  title: 'Heart of Columbus',
  volume: 1, number: 1,
  date: 'December 2026',
  month: { year: 2026, month: 12 },
  line: 'Friends and family edition. A prototype.',
  copies: 'A short run for friends and family',
  pages: [
    { n: 1, section: 'Front page', topics: ['civic', 'river'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'masthead' }] },
      { fill: true, mods: [{ span: 5, type: 'writer', id: 'river', layout: 'lead', brief: 'A', writer: 'jacob-kennedy', editor: 'eli-wire', words: 600, flow: 'river-jump', architecture: 'cityhall', readerCoupon: 'front',
        photo: { key: 'aerial', note: 'Stand in from Wikimedia Commons until Eli Wire shoots the riverfront this month.' } }] },
      { mods: [
        { span: 2, type: 'box', box: 'teaser-referendum' },
        { span: 1, type: 'box', box: 'inside' },
        { span: 2, type: 'box', box: 'almanac' },
      ] },
      { mods: [{ span: 5, type: 'box', box: 'teasers' }] },
    ] },

    { n: 2, section: 'From the publisher', topics: ['media'], rows: [
      { fill: true, mods: [
        { span: 3, type: 'writer', id: 'publisher', brief: null, writer: 'jacob-kennedy', editor: 'eli-wire', words: 650, kicker: 'From the publisher',
          working: 'Why a paper?', guide: 'Jake’s own column: why Heart of Columbus prints a paper, who it is for, and what readers can expect from it. About 650 words, in his voice.' },
        { span: 2, type: 'stack', readerLandmark: 'library', readerCoupon: 'publisher', mods: [
          { type: 'box', box: 'staff' },
          { type: 'box', box: 'reach' },
          { type: 'box', box: 'next-theme' },
        ] },
      ] },
      { mods: [{ span: 5, type: 'box', box: 'how-we-work' }] },
    ] },

    { n: 3, section: 'Schools', topics: ['schools'], rows: [
      { mods: [{ span: 5, type: 'writer', id: 'referendum', layout: 'wide', brief: 'B', writer: null, editor: 'jacob-kennedy', words: 650,
        sidebar: 'What it costs, what it pays for' }] },
      { fill: true, mods: [{ span: 5, type: 'history', path: '1960s/lincoln-elementary-and-lady-bird', fit: 'trim', label: 'From our history: a school built for every child', cols: 5 }] },
    ] },

    { n: 4, section: 'Election 2026', topics: ['civic'], rows: [
      { readerEven: true, mods: [
        { span: 2, type: 'writer', id: 'election', brief: 'C', writer: null, editor: 'jacob-kennedy', words: 500 },
        { span: 3, type: 'box', box: 'results', readerLandmark: 'firstchristian', readerCoupon: 'civic' },
      ] },
      { mods: [{ span: 5, type: 'box', box: 'civic' }] },
      { fill: true, mods: [
        { span: 3, type: 'history', path: '2020s/columbus-passes-fifty-thousand', fit: 'trim', cols: 3 },
        { span: 2, type: 'box', box: 'architecture', landmark: 'courthouse' },
      ] },
    ] },

    { n: 5, section: 'Community', topics: ['civic', 'river'], rows: [
      { mods: [
        { span: 3, type: 'writer', id: 'camping', brief: 'D', writer: null, editor: 'jacob-kennedy', words: 750 },
        { span: 2, type: 'stack', readerLandmark: 'commons', readerCoupon: 'community', mods: [
          { type: 'box', box: 'help' },
          { type: 'box', box: 'architecture', landmark: 'firestation' },
        ] },
      ] },
      { fill: true, mods: [
        { span: 3, type: 'flow', id: 'river-jump', label: 'Continued from page 1' },
        { span: 2, type: 'history', path: '1990s/memorial-for-veterans', fit: 'trim', cols: 2 },
      ] },
    ] },

    { n: 6, section: 'History', topics: ['media'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'spread-head', title: 'Columbus in print', dek: 'Before there was a website, or a radio station, there were newspapers, a lot of them. Four stories from our history of the town’s papers, from 1839 to the one that stayed.' }] },
      { mods: [
        { span: 3, type: 'history', path: 'papers/columbus-argues-in-print', fit: 'trim', cols: 3 },
        { span: 2, type: 'history', path: 'papers/the-democrats', fit: 'trim', cols: 2 },
      ] },
      { fill: true, mods: [
        { span: 3, type: 'history', path: 'papers/the-republican-arrives', fit: 'trim', cols: 3 },
        { span: 2, type: 'history', path: 'papers/the-herald', fit: 'trim', cols: 2 },
      ] },
    ] },

    // December's spotlights: the site's own list (src/data/spotlight.mjs),
    // each with its disclosure. Crossroads also has a separate ad.
    { n: 7, section: 'Spotlight', topics: ['industry', 'culture'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'spot-head' }] },
      { mods: [
        { span: 3, type: 'writer', id: 'spotlight-jills', writer: null, editor: 'jacob-kennedy', words: 400, cols: 2, media: 'jills-diner', kicker: 'Spotlight',
          working: 'Jill\u2019s Diner', guide: 'A spotlight on Jill\u2019s Diner from its listing and its own website.' },
        { span: 2, type: 'writer', id: 'spotlight-amys', writer: null, editor: 'jacob-kennedy', words: 350, kicker: 'Spotlight',
          working: 'Amy\u2019s Closet', guide: 'A spotlight on Amy\u2019s Closet from its listing and its own website.' },
      ] },
      { fill: true, mods: [
        { span: 3, type: 'writer', id: 'spotlight-crossroads', writer: null, editor: 'eli-wire', words: 350, cols: 2, kicker: 'Spotlight',
          working: 'Crossroads Wedding and Event Co.', guide: 'A spotlight on Crossroads Wedding and Event Co. from its own website.' },
        { span: 2, type: 'box', box: 'business-ad', business: 'crossroads' },
      ] },
    ] },

    // The center spread is pages 8 and 9: one sheet, printed together.
    { n: 8, section: 'Back YOUR Blue', topics: ['service'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'byb-head' }] },
      { fill: true, mods: [
        { span: 3, type: 'story', slug: 'my-father-my-hero', cols: 2, big: true,
          photo: { key: null, note: 'Photo wanted: Kevin Lee Kennedy, from the family, with permission. In uniform, or today.' } },
        { span: 2, type: 'stack', mods: [
          { type: 'box', box: 'byb-quote', quote: 'My father has broken generational curses. Several. On his own back.' },
          { type: 'box', box: 'byb-coupon' },
        ] },
      ] },
    ] },

    { n: 9, section: 'Jake Takes the Town', topics: ['sports', 'culture'], rows: [
      { fill: true, mods: [{ span: 5, type: 'writer', id: 'jake-december', optional: true, fallback: { type: 'story', slug: 'pacers-thunder' },
        writer: 'jacob-kennedy', editor: 'eli-wire', words: 800, cols: 3, photos: 3,
        guide: 'Jake’s December column for his series. Until he files one, this page reprints the series’ first story.' }] },
    ] },

    { n: 10, section: 'Free this winter', topics: ['architecture', 'culture'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'spread-head', kicker: 'Out and about', title: 'Free in Columbus this winter', dek: 'Warm places to go, things to see from the sidewalk and a bus that costs nothing, in the words of the places themselves. Every listing was checked on its own website.' }] },
      { mods: [{ span: 5, type: 'box', box: 'free' }] },
      { fill: true, mods: [
        { span: 3, type: 'box', box: 'sidewalk', photos: ['irwin', 'courthouse', 'miller'] },
        { span: 2, type: 'stack', mods: [{ type: 'box', box: 'visitors' }, { type: 'box', box: 'tours' }] },
      ] },
    ] },

    { n: 11, section: 'What’s on', topics: ['culture'], rows: [
      { mods: [{ span: 5, type: 'box', box: 'events-head' }] },
      { fill: true, mods: [{ span: 5, type: 'box', box: 'calendar' }] },
      { mods: [{ span: 5, type: 'box', box: 'events-sources' }] },
    ] },

    { n: 12, section: 'Shop small', topics: ['industry'], rows: [
      { mods: [
        { span: 3, type: 'box', box: 'shop-guide' },
        { span: 2, type: 'box', box: 'keep-math', readerCoupon: 'shop' },
      ] },
      { mods: [{ span: 5, type: 'box', box: 'gift-cards' }] },
      { fill: true, mods: [{ span: 5, type: 'box', box: 'order-direct' }] },
    ] },

    { n: 13, section: 'Sports', topics: ['sports'], rows: [
      { mods: [
        { span: 3, type: 'writer', readerCoupon: 'sports', id: 'sports', brief: null, writer: null, editor: 'jacob-kennedy', words: 550, kicker: 'Winter sports',
          working: 'North and East this winter', guide: 'A roundup of Columbus North and Columbus East winter sports: basketball, swimming, wrestling. Schedules from the schools and IHSAA, results through the press date.' },
        { span: 2, type: 'history', path: '2020s/indiana-sentinels', fit: 'trim' },
      ] },
      { fill: true, mods: [{ span: 5, type: 'history', path: '2000s/north-cross-country', fit: 'trim', cols: 5, label: 'From our history' }] },
    ] },

    { n: 14, section: 'Faith and community', topics: ['faith'], rows: [
      { mods: [{ span: 5, type: 'writer', id: 'gathers-intro', layout: 'theme', brief: null, writer: null, editor: 'jacob-kennedy', words: 180, kicker: 'A thread through the decades',
        working: 'Where Columbus gathers', guide: 'A short opening note tying the ten stops together.' }] },
      { mods: [{ span: 5, type: 'box', box: 'gathers' }] },
      { fill: true, mods: [
        { span: 3, type: 'writer', id: 'faith', brief: null, writer: null, editor: 'jacob-kennedy', words: 400, kicker: 'December services',
          working: 'Christmas services and community dinners', guide: 'Christmas Eve and Christmas Day services and community dinners, each one confirmed with the church by phone. Times, places, whether all are welcome.' },
        { span: 2, type: 'box', box: 'meals' },
      ] },
    ] },

    { n: 15, section: 'Puzzles', topics: ['architecture'], rows: [
      { mods: [
        { span: 3, type: 'box', box: 'crossword' },
        { span: 2, type: 'box', box: 'clues', readerCoupon: 'puzzles' },
      ] },
      { fill: true, mods: [
        { span: 3, type: 'box', box: 'wordsearch' },
        { span: 2, type: 'box', box: 'where' },
      ] },
    ] },

    { n: 16, section: 'Back page', topics: ['culture', 'industry'], rows: [
      { mods: [
        { span: 2, type: 'box', box: 'wallet' },
        { span: 1, type: 'box', box: 'newsletter' },
        { span: 2, type: 'box', box: 'letters' },
      ] },
      { mods: [
        { span: 3, type: 'box', box: 'answers' },
        { span: 2, type: 'box', box: 'founders' },
      ] },
      { fill: true, mods: [
        { span: 3, type: 'box', box: 'survey' },
        { span: 2, type: 'stack', mods: [
          { type: 'box', box: 'business-ad', business: 'amys' },
          { type: 'box', box: 'colophon' },
        ] },
      ] },
    ] },
  ],

  // December's thread through the decades (docs/paper/december-2026-prototype.md).
  gathers: [
    ['1930s/the-crump-gets-sound', 'The Crump Theatre', 'crump'],
    ['1940s/first-christian-church-dedicated', 'First Christian Church', 'firstchristian'],
    ['1950s/irwin-union-bank-opens', 'Irwin Union Bank', 'irwin'],
    ['1960s/north-christian-church-dedicated', 'North Christian Church', 'northchristian'],
    ['1970s/the-commons-and-chaos', 'The Commons', 'commons'],
    ['1980s/city-hall-triangle', 'City Hall', 'cityhall'],
    ['1990s/mill-race-park', 'Mill Race Park', 'millrace'],
    ['2000s/flood-of-2008', 'The flood of 2008', 'flood2008'],
    ['2010s/columbus-the-movie', 'A film of the town', 'library', 'The library plaza, a filming location for Columbus.'],
    ['2020s/yes-and', 'Yes And, downtown', 'yesand'],
  ],

  // History never offered as a filler card: it would give away a puzzle answer.
  noCards: ['1960s/cleo-rogers-library'],

  // Front page teasers: section navigation, written as house copy.
  teasers: [
    { page: 6, kicker: 'History', title: 'Columbus in print', text: 'Before The Republic there was the Advocate, the Ledger, the Gazette and more. Four stories from the town\u2019s papers.' },
    { page: 7, kicker: 'Spotlight', title: 'Three local businesses', text: 'Jill\u2019s Diner, Amy\u2019s Closet and Crossroads Wedding and Event Co., with two coupons to clip.' },
    { page: 8, kicker: 'Back YOUR Blue', title: 'My father was, and still is, my hero', text: 'Our publisher starts a series of thank you stories with his own, and asks for yours.' },
    { page: 10, kicker: 'Free this winter', title: 'Warm places that cost nothing', text: 'An indoor playground, a library by I. M. Pei, a free bus and ten landmarks to see from the sidewalk.' },
  ],

};

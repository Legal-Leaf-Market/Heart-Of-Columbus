// Columbus history, decade by decade (/history/). Ten articles a decade from
// the 1930s to the 2020s, plus two series that sit outside the decades: the
// newspapers of Columbus, a look back at Brian Blair's faith reporting for
// The Republic (summaries in our words, credited and linked), and notes from
// the publisher.
//
// Every history article is built only from its sources, listed with it as
// [label, url]. Nothing here invents a quote, a person or a number; a quote
// appears only when a cited source prints it, and where sources disagree the
// article says so. tests/history.test.mjs fails on a missing source, a
// missing checked date, an em dash, or a decade without ten articles.
//
// The same records feed the web pages, /history/articles.json and, later,
// the print magazine and newspaper, so each one carries its own section,
// word count and print length (computed below, never typed by hand).
import { A1930s } from './1930s.mjs';
import { A1940s } from './1940s.mjs';
import { A1950s } from './1950s.mjs';
import { A1960s } from './1960s.mjs';
import { A1970s } from './1970s.mjs';
import { A1980s } from './1980s.mjs';
import { A1990s } from './1990s.mjs';
import { A2000s } from './2000s.mjs';
import { A2010s } from './2010s.mjs';
import { A2020s } from './2020s.mjs';
import { PAPERS } from './papers.mjs';
import { PUBLISHER } from './publisher.mjs';
import { BLAIR } from './blair.mjs';

// Sections work like a magazine's departments. `art` is existing artwork in
// public/art used as the section's mark.
export const SECTIONS = [
  { slug: 'industry', label: 'Industry & Work', art: 'float-gear.png' },
  { slug: 'architecture', label: 'Architecture & Design', art: 'float-arch.png' },
  { slug: 'faith', label: 'Faith', art: 'float-spire.png' },
  { slug: 'civic', label: 'Civic Life', art: 'float-courthouse.png' },
  { slug: 'schools', label: 'Schools', art: 'float-tree.png' },
  { slug: 'culture', label: 'Arts & Culture', art: 'float-sparkle-1.png' },
  { slug: 'sports', label: 'Sports & Recreation', art: 'float-confetti.png' },
  { slug: 'service', label: 'War & Service', art: 'float-firestation.png' },
  { slug: 'river', label: 'River & Weather', art: 'float-bridge.png' },
  { slug: 'media', label: 'Media', art: 'float-heart.png' },
];
export const sectionBySlug = Object.fromEntries(SECTIONS.map((s) => [s.slug, s]));

// Census counts for the city, from the Wikipedia article on Columbus.
const POP = 'https://en.wikipedia.org/wiki/Columbus,_Indiana';
export const DECADES = [
  { slug: '1930s', title: 'The 1930s', pop: [1930, 9935], art: 'pattern-tools.png', items: A1930s },
  { slug: '1940s', title: 'The 1940s', pop: [1940, 11738], art: 'pattern-prairie.png', items: A1940s },
  { slug: '1950s', title: 'The 1950s', pop: [1950, 18370], art: 'pattern-girard.png', items: A1950s },
  { slug: '1960s', title: 'The 1960s', pop: [1960, 20778], art: 'pattern-arches.png', items: A1960s },
  { slug: '1970s', title: 'The 1970s', pop: [1970, 26457], art: 'pattern-food.png', items: A1970s },
  { slug: '1980s', title: 'The 1980s', pop: [1980, 30614], art: 'pattern-tools.png', items: A1980s },
  { slug: '1990s', title: 'The 1990s', pop: [1990, 31802], art: 'pattern-prairie.png', items: A1990s },
  { slug: '2000s', title: 'The 2000s', pop: [2000, 39059], art: 'pattern-girard.png', items: A2000s },
  { slug: '2010s', title: 'The 2010s', pop: [2010, 44061], art: 'pattern-arches.png', items: A2010s },
  { slug: '2020s', title: 'The 2020s', pop: [2020, 50474], art: 'pattern-food.png', items: A2020s },
].map((d) => ({ ...d, popSource: POP }));

export const SERIES = [
  { slug: 'papers', title: 'The Republican and the Democrats', kicker: 'Series', lead: 'Columbus has argued with itself in print since 1839. A short history of the town’s newspapers, from party papers to today.', items: PAPERS },
  { slug: 'blair', title: 'Brian Blair’s faith beat', kicker: 'From the archive', lead: 'For years Brian Blair covered faith in Columbus for The Republic. These are some of his best stories, retold in short with credit to him and links to the originals.', items: BLAIR },
  { slug: 'publisher', title: 'From the publisher', kicker: 'Opinion', lead: 'Notes from Jacob Kennedy, who started Heart of Columbus. These are his views, labeled as such.', items: PUBLISHER },
];

// Print planning. Newspaper copy runs about 35 words to a column inch; a
// magazine page with art holds about 500 words. Lengths are print slots.
export const WORDS_PER_INCH = 35;
export const WORDS_PER_PAGE = 500;
export const words = (a) => [a.dek, ...a.body].join(' ').split(/\s+/).filter(Boolean).length;
export const printLength = (n) => (n < 350 ? 'brief' : n < 650 ? 'standard' : 'feature');

// Labels follow the newspaper plan's story model (News, Analysis, Opinion,
// Explainer, Data, Community...). Nothing counts as approved until a named
// editor signs off: `editor` stays null and the page says "draft" until then.
const LABEL = { history: 'Explainer', tribute: 'Community', opinion: 'Opinion', essay: 'Opinion' };
const METHODS = {
  history: 'Researched from the public sources listed. No interviews. Quotes appear only where a cited source prints them, and disagreements between sources are noted in the text.',
  tribute: 'A summary in our own words of a story first published in The Republic, with credit and a link to the original. Short quotes only.',
  opinion: 'The author’s own views and experience, in his words. Facts in it link to their sources.',
  essay: 'The author’s own memories, in his words.',
};
const withMeta = (group) => (a) => {
  const n = words(a);
  const kind = a.kind || 'history';
  return {
    byline: 'Heart of Columbus', label: LABEL[kind], methods: METHODS[kind], editor: null,
    tags: [a.landmark].filter(Boolean), ...a, kind, group: group.slug, status: a.editor ? 'approved' : 'draft',
    decade: DECADES.includes(group) ? group.slug : null,
    path: `/history/${group.slug}/${a.slug}/`,
    words: n, readMin: Math.max(1, Math.round(n / 200)),
    print: { length: printLength(n), columnInches: Math.ceil(n / WORDS_PER_INCH), magazinePages: Math.round((n / WORDS_PER_PAGE) * 2) / 2 || 0.5 },
  };
};

for (const g of [...DECADES, ...SERIES]) g.items = g.items.map(withMeta(g));
export const ARTICLES = [...DECADES, ...SERIES].flatMap((g) => g.items);
export const DECADE_ARTICLES = DECADES.flatMap((d) => d.items);
export const groupBySlug = Object.fromEntries([...DECADES, ...SERIES].map((g) => [g.slug, g]));

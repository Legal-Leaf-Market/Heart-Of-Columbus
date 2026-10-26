// The newsroom: everyone who can put a name on a story. Bylines and editor
// credits in content/stories/ must be a slug here (tests/news.test.mjs).
// Only facts the person has given us go here. No invented backgrounds.
//
//   'pat-reporter': {
//     name: 'Pat Reporter',
//     role: 'Reporter',            // Publisher, Editor, Reporter, Columnist, Contributor...
//     beat: 'City and county',     // optional
//     bio: 'One or two plain sentences the person wrote or approved.',
//     email: 'pat@example.org',    // public newsroom address, never a personal one
//     editor: true,                // may approve stories (the two-person rule)
//   },

export const STAFF = {
  'jacob-kennedy': {
    name: 'Jacob Kennedy',
    role: 'Publisher',
    beat: '',
    // TODO(owner): a bio in your own words, and the public newsroom email.
    bio: 'Publisher of Heart of Columbus.',
    email: '',
    editor: false, // TODO(owner): name an editor. The publisher may also edit until one is hired.
  },
};

// Made-up people for templates and tests only, in a made-up town. They never
// get a /staff/ page and can only appear on content flagged sample: true.
export const SAMPLE_STAFF = {
  'sample-reporter': { name: 'Sample Reporter', role: 'Reporter', beat: 'Everything in Sampleton', bio: 'Not a real person. Used to show what a byline looks like.', email: '', editor: false, sample: true },
  'sample-editor': { name: 'Sample Editor', role: 'Editor', beat: '', bio: 'Not a real person. Used to show what an editor credit looks like.', email: '', editor: true, sample: true },
};

export const staffList = () => Object.entries(STAFF).map(([slug, s]) => ({ slug, ...s }));
export const person = (slug, { sample = false } = {}) => (STAFF[slug] ? { slug, ...STAFF[slug] } : sample && SAMPLE_STAFF[slug] ? { slug, ...SAMPLE_STAFF[slug] } : null);

// Loads the paper's stories from content/ and checks every one of them.
//
//   content/stories/YYYY/MM/<slug>.md   published stories, at /news/YYYY/MM/<slug>/
//   content/samples/<slug>.md           made-up stories (sample: true) that show
//                                       the template, at /news/samples/<slug>/
//
// Front matter (YAML between --- lines), then the story in Markdown:
//
//   headline: Short and true
//   dek: One sentence under the headline
//   label: News                    # src/news/labels.mjs
//   section: business              # src/news/sections.mjs
//   bylines: [pat-reporter]        # src/data/staff.mjs
//   editor: lee-editor             # staff with editor: true, not a byline
//   published: 2026-11-02T08:00:00-05:00   # America/Indiana/Indianapolis offset
//   updated: 2026-11-02T10:30:00-05:00     # optional
//   tags: [some-business-slug, downtown, city-council]
//   sources:
//     - name: City council agenda, November 2
//       url: https://www.columbus.in.gov/...
//     - name: Pat Owner, owner
//       note: interview, October 30
//   methods: How we reported this, in a sentence or two.
//   corrections:                   # append only, never edited or removed
//     - date: 2026-11-03
//       text: An earlier version gave the wrong opening day.
//       major: true                # changes the meaning: shown at the top
//   images:
//     - file: /news-media/2026/11/photo.jpg   # or an https URL
//       alt: What the photo shows
//       caption: Optional caption
//       credit: Photographer's name
//       license: Staff photo
//   sponsor: Name                  # required when label is Sponsored
//   developing:                    # optional box for a developing story
//     know: [Fact we confirmed]
//     dontKnow: [Question still open]
//   meeting:                       # required for label "Meeting notes"
//     body: city-council           # src/data/civic.mjs BODIES (samples may use any name)
//     date: 2026-11-03
//     attended: [Mayor, all seven council members]
//     decisions: [Approved the 2027 budget]
//     votes:
//       - motion: Approve the 2027 budget
//         result: Passed
//         tally: 6 to 1
//     followUps: [What happens to the parks line next year?]
//   draft: true                    # optional: built for preview, listed nowhere
//
// Anything wrong in a story stops the build with the file and the reason.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { splitFrontMatter, markdown } from './markdown.mjs';
import { LABELS } from './labels.mjs';
import { sectionBySlug, TOPICS } from './sections.mjs';
import { STAFF, SAMPLE_STAFF } from '../data/staff.mjs';
import { directory, areaBySlug } from '../data/directory.mjs';
import { landmarkBySlug } from '../data/landmarks.mjs';
import { BODIES } from '../data/civic.mjs';

const bodyBySlug = Object.fromEntries(BODIES.map((b) => [b.slug, b]));

export const CONTENT = new URL('../../content/', import.meta.url);
const bizSlugs = new Set(directory.map((b) => b.slug));

// Which kind of thing a tag points at, or null.
export const tagKind = (tag) =>
  bizSlugs.has(tag) ? 'business' : landmarkBySlug[tag] ? 'landmark' : areaBySlug[tag] ? 'area' : TOPICS.includes(tag) ? 'topic' : null;

const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?[-+]\d{2}:\d{2}$/;
const tzFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', timeZoneName: 'longOffset' });
// The offset Columbus clocks used at that instant, as "-04:00" or "-05:00".
export const localOffset = (d) => tzFmt.formatToParts(d).find((p) => p.type === 'timeZoneName').value.replace('GMT', '');
const DASH = /[—–]| - /;

export function checkStory(s) {
  const p = [];
  const staff = s.sample ? { ...STAFF, ...SAMPLE_STAFF } : STAFF;
  if (!s.headline) p.push('headline is required');
  if (!LABELS[s.label]) p.push(`label "${s.label}" is not one of: ${Object.keys(LABELS).join(', ')}`);
  if (!sectionBySlug[s.section]) p.push(`section "${s.section}" is not in src/news/sections.mjs`);
  if (!Array.isArray(s.bylines) || !s.bylines.length) p.push('bylines: at least one staff slug');
  for (const b of s.bylines || []) if (!staff[b]) p.push(`byline "${b}" is not in src/data/staff.mjs`);
  if (!s.draft) {
    if (!staff[s.editor]) p.push(`editor "${s.editor ?? ''}" is not in src/data/staff.mjs`);
    else if (!staff[s.editor].editor) p.push(`editor "${s.editor}" is not allowed to approve stories (editor: true in staff.mjs)`);
    if ((s.bylines || []).includes(s.editor)) p.push('the editor cannot approve their own story (two people on every story)');
  }
  for (const k of ['published', 'updated']) {
    if (!s[k]) { if (k === 'published') p.push('published is required'); continue; }
    if (!ISO.test(s[k])) { p.push(`${k} must look like 2026-11-02T08:00:00-05:00`); continue; }
    const want = localOffset(new Date(s[k]));
    if (!s[k].endsWith(want)) p.push(`${k} offset should be ${want} (Columbus time on that date)`);
  }
  if (s.updated && s.published && new Date(s.updated) < new Date(s.published)) p.push('updated is before published');
  if (s.label === 'Sponsored' && !s.sponsor) p.push('Sponsored stories must name the sponsor');
  if (s.sponsor && s.label !== 'Sponsored') p.push('a story with a sponsor must be labeled Sponsored');
  for (const t of s.tags || []) if (!tagKind(t)) p.push(`tag "${t}" is not a business, landmark, neighborhood or topic slug`);
  for (const src of s.sources || []) if (!src?.name || !(src.url || src.note)) p.push('each source needs a name and a url or a note');
  for (const src of s.sources || []) if (src?.url && !/^https?:\/\//.test(src.url)) p.push(`source url must be a web address: ${src.url}`);
  for (const c of s.corrections || []) if (!/^\d{4}-\d{2}-\d{2}/.test(String(c?.date)) || !c?.text) p.push('each correction needs a date and text');
  for (const im of s.images || []) {
    if (!im?.file) p.push('each image needs a file');
    if (!im?.alt) p.push(`image ${im?.file}: alt text is required`);
    if (!im?.credit) p.push(`image ${im?.file}: credit is required`);
    if (!im?.license) p.push(`image ${im?.file}: license is required (Staff photo, CC BY 4.0, used with permission...)`);
    if (im?.file?.startsWith('/') && !existsSync(new URL(`../../public${im.file}`, import.meta.url))) p.push(`image ${im.file} is not in public/`);
  }
  if (s.label === 'Meeting notes') {
    const m = s.meeting;
    if (!m || !m.body || !/^\d{4}-\d{2}-\d{2}$/.test(String(m.date)) || !Array.isArray(m.decisions)) p.push('Meeting notes need meeting: body, date (YYYY-MM-DD) and a decisions list');
    else if (!s.sample && !bodyBySlug[m.body]) p.push(`meeting body "${m.body}" is not in src/data/civic.mjs`);
    for (const v of m?.votes || []) if (!v?.motion || !v?.result) p.push('each vote needs a motion and a result');
  }
  if (s.developing && !(Array.isArray(s.developing.know) && Array.isArray(s.developing.dontKnow))) p.push('developing needs know and dontKnow lists');
  if (!s.sample && /\bSampleton\b|\bSample (Reporter|Editor)\b/.test(JSON.stringify(s) + s.body)) p.push('sample content in a real story');
  const text = JSON.stringify({ ...s, file: '' }) + s.body;
  if (DASH.test(text)) p.push('no em dash, en dash or spaced hyphen in anything a reader sees');
  return p;
}

function load(file, { sample }) {
  const src = readFileSync(file, 'utf8');
  const { data, body } = splitFrontMatter(src);
  const slug = file.pathname.split('/').pop().replace(/\.md$/, '');
  const s = {
    slug, file: file.pathname.replace(/^.*\/content\//, 'content/'),
    headline: '', dek: '', bylines: [], editor: '', label: '', section: '', tags: [], sources: [], methods: '', corrections: [], images: [],
    ...data, sample: !!data.sample, draft: !!data.draft, body,
  };
  if (sample && !s.sample) throw new Error(`${s.file}: everything in content/samples/ must say sample: true`);
  if (!sample && s.sample) throw new Error(`${s.file}: sample content can't be in content/stories/. Move it to content/samples/.`);
  s.bylines = [].concat(s.bylines || []);
  s.tags = [].concat(s.tags || []);
  s.corrections = [].concat(s.corrections || []).map((c) => ({ ...c, date: String(c.date) }));
  if (s.meeting) s.meeting = { attended: [], decisions: [], votes: [], followUps: [], ...s.meeting, date: String(s.meeting.date) };
  s.href = sample ? `/news/samples/${slug}/` : `/news/${String(s.published).slice(0, 4)}/${String(s.published).slice(5, 7)}/${slug}/`;
  if (!sample) {
    const m = s.file.match(/^content\/stories\/(\d{4})\/(\d{2})\/[a-z0-9-]+\.md$/);
    if (!m) throw new Error(`${s.file}: stories live at content/stories/YYYY/MM/<lowercase-slug>.md`);
    if (`${m[1]}-${m[2]}` !== String(s.published).slice(0, 7)) throw new Error(`${s.file}: folder doesn't match published date ${s.published}`);
  }
  const problems = checkStory(s);
  if (problems.length) throw new Error(`${s.file}:\n  ${problems.join('\n  ')}`);
  try { s.html = markdown(body); } catch (e) { throw new Error(`${s.file}: ${e.message}`); }
  return s;
}

const mdFiles = (dir) => (existsSync(dir) ? readdirSync(dir, { recursive: true }).filter((f) => f.endsWith('.md')).map((f) => new URL(f, dir)) : []);
const newest = (a, b) => b.published.localeCompare(a.published) || a.slug.localeCompare(b.slug);

// Every story, published and draft, newest first.
export const ALL_STORIES = mdFiles(new URL('stories/', CONTENT)).map((f) => load(f, { sample: false })).sort(newest);
export const SAMPLES = mdFiles(new URL('samples/', CONTENT)).map((f) => load(f, { sample: true })).sort(newest);

const seen = new Set();
for (const s of [...ALL_STORIES, ...SAMPLES]) {
  if (seen.has(s.href)) throw new Error(`two stories at ${s.href}`);
  seen.add(s.href);
}

// What readers see: published, not drafts, newest first.
export const stories = ALL_STORIES.filter((s) => !s.draft);
export const storiesIn = (section) => stories.filter((s) => s.section === section);
export const storiesTagged = (tag) => stories.filter((s) => s.tags.includes(tag));
export const storiesBy = (staffSlug) => stories.filter((s) => s.bylines.includes(staffSlug) || s.editor === staffSlug);

// Every correction on every published story, newest first, for the log.
export const correctionsLog = () =>
  stories.flatMap((s) => s.corrections.map((c) => ({ ...c, story: s }))).sort((a, b) => b.date.localeCompare(a.date));

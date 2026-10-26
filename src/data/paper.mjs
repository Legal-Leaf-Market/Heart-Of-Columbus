// The newspaper's own facts: name, masthead, who owns and funds it, and the
// launch switch. docs/newspaper-plan.md explains the choices still open.
// Every TODO(owner) here is a decision for the publisher, not for code.

export const PAPER = {
  // TODO(owner): the paper's name and motto. Until then the masthead uses
  // the site's name and no motto.
  name: 'Heart of Columbus',
  motto: '',
  publisher: 'jacob-kennedy', // a slug in src/data/staff.mjs
  // TODO(owner): the editor (a staff slug). Nothing publishes without one.
  editor: '',
  // TODO(owner): free with members, sponsors, grants, or a mix. The plan
  // recommends free to read with a membership ask and labeled sponsors.
  funding: '',
  // TODO(owner): a public newsroom address for tips, letters and corrections.
  email: '',
  // TODO(owner): approve the AI policy on /about/standards/ (AI_POLICY below).
  aiPolicyApproved: false,
};

// Turns the News link on in the header and lets the front page be announced.
// Every news page is built either way (and stays noindex), so a preview can
// be checked before anyone is told. Netlify deploy previews set it to 1.
export const NEWS_LIVE = process.env.NEWS_LIVE === '1';

// Funders and in-kind supporters, newest first: { name, what, since, url }.
// "About our funding" lists every one; an empty list says so.
export const FUNDERS = [];

// Draft policies, shown on /about/standards/ with a "draft" note until the
// publisher approves them. Plain sentences, no dashes.
export const AI_POLICY = [
  'People report and write every story, headline, quote, letter and obituary we publish. A named reporter writes it and an editor approves it.',
  'Software helps us run the paper: it builds the pages, checks spelling and links, keeps the business directory current, and turns public data into lead lists for reporters. A lead is never a story until a person has confirmed it.',
  'We do not publish AI written stories, recaps or summaries, and we do not use AI to create or alter news photos.',
  'If a tool ever helps with something a reader sees, such as a translation, the page says so.',
];

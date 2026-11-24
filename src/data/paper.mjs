// The newspaper's own facts: name, masthead, who owns and funds it, and the
// launch switch. docs/newspaper-plan.md explains the choices still open.
// Every TODO(owner) here is a decision for the publisher, not for code.

export const PAPER = {
  // TODO(owner): the paper's name and motto. Until then the masthead uses
  // the site's name and no motto.
  name: 'Heart of Columbus',
  motto: '',
  publisher: 'jacob-kennedy', // a slug in src/data/staff.mjs
  // TODO(owner): the editor (a staff slug). The publisher is acting editor
  // until one is named (editor: true in staff.mjs).
  editor: '',
  // TODO(owner): free with members, sponsors, grants, or a mix. The plan
  // recommends free to read with a membership ask and labeled sponsors.
  funding: '',
  // TODO(owner): a public newsroom address for tips, letters and corrections.
  email: '',
  // Approved by the publisher, Jake Kennedy, on 2026-11-24.
  aiPolicyApproved: true,
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
  'Every story has a named person behind it. Reporting, facts, opinions and ratings come from the reporter, and an editor who is not the byline approves every piece before it runs.',
  'Reporters may use AI writing tools, such as ChatGPT or Claude, to help shape their own words: tightening a draft, suggesting a headline, fixing flow. The reporter decides what stays, and the editor checks every fact.',
  'When an AI tool helped write a story, the story says so in its "How we reported this" note.',
  'Our history articles are drafted with the help of AI, only from the public sources listed with each one, and an editor checks them against those sources. A fact we cannot source stays out.',
  'AI never invents a quote, a person, a number or a source, and anything a tool tells us is a lead until a person confirms it.',
  'We do not publish AI made or AI altered photos, video or audio of real people, places or events.',
  'Software also helps run the paper: it builds the pages, checks spelling and links, and keeps the business directory current.',
];

// The morning newsletter. We never build email delivery: a newsletter
// service (Buttondown, beehiiv, Ghost...) handles double opt-in, sending
// and one-click unsubscribe. TODO(owner): pick the service, then set its
// public signup form address here; until then /newsletter/ says it's coming.
// The newsletter runs on Buttondown. Set HOC_BUTTONDOWN_USER (the newsletter's
// Buttondown username) in Netlify and the signup form turns on at the next
// build; BUTTONDOWN_API_KEY turns on the morning draft job
// (netlify/functions/newsletter.mjs). Both unset: the page says signup opens soon.
// Resend instead: set HOC_NEWSLETTER=resend at build (plus the RESEND_* keys for
// the functions) and the form posts to our own /api/subscribe, double opt in.
const BD_USER = (process.env.HOC_BUTTONDOWN_USER || '').trim().replace(/[^a-z0-9_-]/gi, '');
const RESEND = (process.env.HOC_NEWSLETTER || '').trim().toLowerCase() === 'resend';
export const NEWSLETTER = {
  provider: RESEND ? 'resend' : BD_USER ? 'buttondown' : '',
  signupAction: RESEND ? '/api/subscribe' : BD_USER ? `https://buttondown.com/api/emails/embed-subscribe/${BD_USER}` : '',
  archive: !RESEND && BD_USER ? `https://buttondown.com/${BD_USER}/archive/` : '',
};

// TODO(owner): memberships mean taking payment, which CLAUDE.md rules out
// for business orders but doesn't decide for the paper itself. Until you
// decide (and choose Stripe or the newsletter's paid tier), /members/ only
// explains the plan and no page asks for money.
export const MEMBERSHIP = { open: false, joinUrl: '' };

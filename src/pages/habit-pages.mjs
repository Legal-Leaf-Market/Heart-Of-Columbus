// Reasons to come back: the morning newsletter (/newsletter/), games
// (/games/), and membership (/members/), plus the privacy page those need.
// docs/newspaper-plan.md, items 8, 11 and 12.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { esc, t } from '../layout.mjs';
import { newsPage } from '../news/frame.mjs';
import { PAPER, NEWSLETTER, MEMBERSHIP } from '../data/paper.mjs';
import { LANDMARKS } from '../data/landmarks.mjs';

const doc = (kicker, h1, dek, inner) => `<article class="wrap np-doc"><header class="np-doc-head"><p class="kicker">${esc(kicker)}</p><h1>${esc(h1)}</h1><p class="np-dek">${dek}</p></header>${inner}</article>`;

// The short ask at the end of every story: no pop-up, no wall.
export const storyAsk = () => `
<aside class="np-ask" aria-label="Support local news">
  <p><strong>${esc(PAPER.name)} is free to read.</strong> ${MEMBERSHIP.open ? `Members keep it that way. <a href="/members/">Become a member</a>.` : 'Get the best of it every morning in your inbox.'}</p>
  <p><a class="btn btn-sm" href="/newsletter/">Get the morning newsletter</a></p>
</aside>`;

function newsletterPage(ctx) {
  const on = !!NEWSLETTER.signupAction;
  const body = doc('Newsletter', 'The morning edition', 'Weather, three to five stories, what’s open early, today’s events and one business change. Every weekday morning, free.', `
<section class="pk-card">${on ? `
  <form class="ow-form np-form" action="${esc(NEWSLETTER.signupAction)}" method="post" target="_blank">
    <label>Email<input name="email" type="email" autocomplete="email" required></label>
    <button class="btn" type="submit">Sign up</button>
    <p class="fine">We’ll email you once to confirm. Every newsletter has a one-click unsubscribe link. Read our <a href="/privacy/">privacy page</a>.</p>
  </form>` : '<p><strong>Sign up opens soon.</strong> The newsletter starts with the first edition of the paper.</p>'}</section>
<section><h2>How it’s made</h2><p>The morning edition is put together from stories we have already published, then an editor reads it before it goes out. It never contains anything that hasn’t run on the site.</p></section>`);
  return newsPage({ ...ctx, path: '/newsletter/', title: 'Newsletter', description: 'The morning edition: Columbus news in your inbox every weekday.', crumbs: [['/news/', 'News'], ['', 'Newsletter']], body });
}

function privacyPage(ctx) {
  const body = doc('Privacy', 'What we keep, and why', 'Short version: as little as we can.', `
<section><h2>Newsletter</h2><p>If you sign up, the newsletter service keeps your email address to send you the newsletter. You confirm once, and every email has a one-click unsubscribe. We never sell or share your address.</p></section>
<section><h2>Questions, letters and tips</h2><p>We keep what you type into those forms and nothing else: no IP address, no browser details. Only the editor can read them. Letters run with your name and town; we never publish your email or phone.</p></section>
<section><h2>Saved places and games</h2><p>Your saved places, game scores and streaks stay in your own browser. They are never sent to us.</p></section>
<section><h2>Weather and maps</h2><p>The weather box asks the National Weather Service and the USGS for the latest readings, and maps come from Google Maps. Those services see the request, as with any website.</p></section>`);
  return newsPage({ ...ctx, path: '/privacy/', title: 'Privacy', description: 'What Heart of Columbus keeps about you, and why.', crumbs: [['/about/', 'About'], ['', 'Privacy']], body });
}

function membersPage(ctx) {
  const body = doc('Membership', 'Keep Columbus news free', `${esc(PAPER.name)} is free to read, for everyone, with no paywall. That’s on purpose: news about your town shouldn’t depend on who can pay.`, `
<section><h2>How we plan to pay for it</h2><p>Readers who can chip in, and local sponsors who are always labeled and never get a say in our coverage. Every funder and sponsor is listed on our <a href="/about/#funding">about page</a>.</p></section>
<section>${MEMBERSHIP.open && MEMBERSHIP.joinUrl ? `<p><a class="btn" href="${esc(MEMBERSHIP.joinUrl)}" target="_blank" rel="noopener">Become a member</a></p>` : '<p><strong>Membership isn’t open yet.</strong> The best way to help right now is to read, share stories you like, and <a href="/tips/">send us tips</a>.</p>'}</section>`);
  return newsPage({ ...ctx, path: '/members/', title: 'Membership', description: 'Heart of Columbus is free to read. Here is how it pays for itself.', crumbs: [['/about/', 'About'], ['', 'Membership']], body });
}

// ---------- Games ----------
// Where in Columbus?: a close-up of a landmark photo, four names, one guess
// a day. Uses the credited Commons photos in src/data/landmarks.mjs.
const WHERE = LANDMARKS.filter((l) => l.photo).map((l) => ({ s: l.slug, n: l.name, src: l.photo.src, credit: `${l.photo.credit}, ${l.photo.license}` }));

// The weekly quiz: content/quizzes/<YYYY-MM-DD>.json, written by the editor
// from that week's published stories:
//   { "week": "2026-11-06", "editor": "staff-slug", "questions": [
//       { "q": "Question?", "choices": ["A", "B", "C", "D"], "answer": 0, "story": "/news/2026/11/slug/" } ] }
// content/quizzes/samples/ holds made-up quizzes ("sample": true) shown only at /games/quiz/sample/.
const QDIR = new URL('../../content/quizzes/', import.meta.url);
const readQuizzes = (dir) => (existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => ({ file: f, ...JSON.parse(readFileSync(new URL(f, dir), 'utf8')) })) : []);
export const QUIZZES = readQuizzes(QDIR);
export const SAMPLE_QUIZZES = readQuizzes(new URL('samples/', QDIR));

function gamesIndex(ctx) {
  const body = doc('Games', 'Play', 'A little Columbus every day. Scores stay in your browser.', `
<div class="np-games">
  <a class="np-game" href="/games/where/"><strong>Where in Columbus?</strong><span>A close-up of a Columbus landmark. Name it in one guess. New every day.</span></a>
  <a class="np-game" href="/games/quiz/"><strong>The weekly news quiz</strong><span>How closely were you reading this week?</span></a>
</div>
<p class="fine">A crossword is coming when a local constructor makes one for us.</p>`);
  return newsPage({ ...ctx, path: '/games/', title: 'Games', description: 'Daily and weekly games about Columbus, Indiana.', crumbs: [['/news/', 'News'], ['', 'Games']], body });
}

function wherePage(ctx) {
  const body = doc('Daily game', 'Where in Columbus?', 'Here’s a close-up of a building in Columbus. Which one is it? One guess a day.', `
<section class="np-where" data-where>
  <div class="np-where-img"><img data-where-img alt="A close-up of today’s mystery building"></div>
  <div class="np-where-choices" data-where-choices></div>
  <div data-where-result hidden></div>
  <p class="fine">Photos from Wikimedia Commons, credited when you finish. <a href="/credits/">All photo credits</a></p>
</section>`);
  return newsPage({ ...ctx, path: '/games/where/', title: 'Where in Columbus?', description: 'A daily guessing game: name the Columbus landmark from a close-up.', crumbs: [['/games/', 'Games'], ['', 'Where in Columbus?']], body, scripts: ['games.js'], data: { where: WHERE } });
}

function quizPage(ctx, quiz, { sample = false } = {}) {
  const path = sample ? '/games/quiz/sample/' : '/games/quiz/';
  const body = quiz
    ? doc(sample ? 'Sample quiz' : 'Weekly quiz', `The news quiz${quiz.week ? `, week of ${quiz.week}` : ''}`, sample ? 'Made-up questions about the made-up town of Sampleton, to show how the quiz works.' : 'Questions from this week’s stories. Each answer links to the story.', `
<section class="np-quiz" data-quiz><ol>${quiz.questions.map((q, i) => `<li class="np-q" data-q="${i}" data-answer="${q.answer}"><p>${t(q.q)}</p><div class="np-q-choices">${q.choices.map((c, j) => `<button type="button" class="pill" data-choice="${j}">${t(c)}</button>`).join('')}</div><p class="np-q-more" hidden>${q.story ? `<a href="${esc(q.story)}">Read the story</a>` : ''}</p></li>`).join('')}</ol>
<div data-quiz-result hidden></div></section>`)
    : doc('Weekly quiz', 'The news quiz', 'The first quiz arrives with the first week of stories.', '<p>Come back on Friday.</p>');
  return newsPage({ ...ctx, path, title: 'News quiz', description: 'The weekly Columbus news quiz.', crumbs: [['/games/', 'Games'], ['', sample ? 'Sample quiz' : 'News quiz']], body, scripts: ['games.js'], banner: sample ? '<div class="np-sample-banner"><div class="wrap"><strong>Sample quiz.</strong> Sampleton is made up.</div></div>' : '' });
}

export const habitPages = (ctx) => [
  { path: 'newsletter/index.html', html: newsletterPage(ctx) },
  { path: 'privacy/index.html', html: privacyPage(ctx) },
  { path: 'members/index.html', html: membersPage(ctx) },
  { path: 'games/index.html', html: gamesIndex(ctx) },
  { path: 'games/where/index.html', html: wherePage(ctx) },
  { path: 'games/quiz/index.html', html: quizPage(ctx, QUIZZES.at(-1)) },
  ...(SAMPLE_QUIZZES.length ? [{ path: 'games/quiz/sample/index.html', html: quizPage(ctx, SAMPLE_QUIZZES.at(-1), { sample: true }) }] : []),
];

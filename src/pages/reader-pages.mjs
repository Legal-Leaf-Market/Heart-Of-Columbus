// Readers talk to the newsroom: questions (/ask/), letters to the editor
// (/letters/) and tips (/tips/), all stored by /api/newsroom for an editor.
// No comment section, on purpose (docs/newspaper-plan.md, item 9).
import { esc } from '../layout.mjs';
import { newsPage } from '../news/frame.mjs';
import { PAPER } from '../data/paper.mjs';
import { storyList } from '../news/render.mjs';
import { stories } from '../news/content.mjs';

const field = (label, name, { type = 'text', area = false, req = false, auto = '', hint = '', rows = 6, max = '' } = {}) => `
<label>${esc(label)}${req ? '' : ' <span class="muted np-opt">(optional)</span>'}
  ${area ? `<textarea name="${name}" rows="${rows}"${req ? ' required' : ''}${max ? ` maxlength="${max}"` : ''}></textarea>` : `<input name="${name}" type="${type}"${auto ? ` autocomplete="${auto}"` : ''}${req ? ' required' : ''}>`}
  ${hint ? `<small class="muted">${esc(hint)}</small>` : ''}
</label>`;

const form = (kind, button, fields) => `
<form class="ow-form np-form" data-newsroom="${kind}" novalidate>
  ${fields.join('')}
  <label class="sr-only" aria-hidden="true">Leave this empty<input name="website" tabindex="-1" autocomplete="off"></label>
  <p class="pk-err" data-err hidden></p>
  <button class="btn" type="submit">${esc(button)}</button>
</form>`;

const shell = (ctx, path, crumb, title, description, kicker, h1, dek, inner) => newsPage({
  ...ctx, path, title, description, crumbs: [['/news/', 'News'], ['', crumb]], scripts: ['newsroom.js'],
  body: `<article class="wrap np-doc"><header class="np-doc-head"><p class="kicker">${esc(kicker)}</p><h1>${esc(h1)}</h1><p class="np-dek">${dek}</p></header>${inner}</article>`,
});

function askPage(ctx) {
  const answered = stories.filter((s) => s.tags.includes('reader-question'));
  return shell(ctx, '/ask/', 'Ask', 'Ask us', 'What do you want to know about Columbus? Ask, and a reporter may answer it.', 'Ask the newsroom', 'What do you want to know about Columbus?',
    'Why is that building shaped like that? Who decides when a road gets repaved? Ask us anything about Columbus. Reporters pick questions to answer, and we credit you if you like.', `
<section class="pk-card">${form('ask', 'Send my question', [
    field('Your question', 'question', { area: true, req: true, max: 2000 }),
    `<div class="ow-two">${field('Your name', 'name', { auto: 'name', hint: 'Only if you want credit when we answer it.' })}${field('Email', 'email', { type: 'email', auto: 'email', hint: 'Only so we can follow up.' })}</div>`,
    field('Your neighborhood', 'neighborhood'),
  ])}</section>
<section><h2>Questions we have answered</h2>${storyList(answered, { empty: 'None yet. Yours could be first.' })}</section>`);
}

function lettersPage(ctx) {
  const letters = stories.filter((s) => s.section === 'opinion' && s.tags.includes('letters'));
  return shell(ctx, '/letters/', 'Letters', 'Letters to the editor', 'Write a letter to the editor about Columbus or something we published.', 'Opinion', 'Letters to the editor',
    'Agree, disagree, or tell Columbus something it needs to hear. Letters run under Opinion with your name and town.', `
<section><h2>How letters work</h2><ul class="np-list">
  <li>Keep it under 300 words, about Columbus or something we published.</li>
  <li>We publish your name and town. We need an email or phone to confirm you wrote it, and we never publish those.</li>
  <li>The editor picks letters and may trim them for length. We don’t print personal attacks, or claims we can’t check.</li>
</ul></section>
<section class="pk-card">${form('letter', 'Send my letter', [
    field('Your letter', 'body', { area: true, req: true, rows: 10, max: 4000 }),
    field('What it’s about (a story link or a topic)', 'about'),
    `<div class="ow-two">${field('Your name', 'name', { auto: 'name', req: true })}${field('Your town', 'town', { auto: 'address-level2', req: true })}</div>`,
    `<div class="ow-two">${field('Email', 'email', { type: 'email', auto: 'email' })}${field('Phone', 'phone', { type: 'tel', auto: 'tel' })}</div>`,
  ])}</section>
<section><h2>Recent letters</h2>${storyList(letters, { empty: 'No letters published yet.' })}</section>`);
}

function tipsPage(ctx) {
  return shell(ctx, '/tips/', 'Tips', 'Send a tip', 'Tell the newsroom what is going on in Columbus.', 'Tips', 'Know something we should?',
    'Send a tip. Tell us what you saw or heard and how we can check it. A reporter reads every one.', `
<section class="pk-card">${form('tip', 'Send my tip', [
    field('Your tip', 'tip', { area: true, req: true, rows: 8, max: 4000 }),
    field('How to reach you', 'contact', { hint: 'Optional. Leave it empty to stay anonymous, but then we can’t ask follow-up questions.' }),
  ])}</section>
<section><h2>What we keep</h2><p>Only what you type here. This form does not record your IP address, browser or location, and only the editor can read what you send.</p></section>
<section><h2>For sensitive tips</h2><p>A web form is not the safest way to share something that could put you at risk. Don’t send it from a work computer, a work phone or a work network. Call or meet a reporter in person instead, or use an encrypted messaging app on your own phone. ${PAPER.email ? `Ask for a safer channel at <a href="mailto:${esc(PAPER.email)}">${esc(PAPER.email)}</a>.` : ''}</p>
<p>We protect our sources. Read how we handle <a href="/about/standards/#anonymous">anonymous sources</a>.</p></section>`);
  // TODO(owner): a Signal number or other secure channel for sensitive tips.
}

function inboxPage(ctx) {
  const body = `
<section class="wrap np-section" data-newsroom-inbox>
  <header class="np-doc-head"><p class="kicker">Private</p><h1>Newsroom inbox</h1></header>
  <nav class="chips np-sec-links" aria-label="Kind"><button type="button" class="pill" data-kind="ask" aria-pressed="true">Questions</button><button type="button" class="pill" data-kind="letter" aria-pressed="false">Letters</button><button type="button" class="pill" data-kind="tip" aria-pressed="false">Tips</button></nav>
  <p class="muted" data-inbox-status>Loading…</p>
  <div data-inbox-out></div>
</section>`;
  return newsPage({ ...ctx, path: '/newsroom/inbox/', title: 'Newsroom inbox', description: 'Private.', body, scripts: ['newsroom.js'] });
}

export const readerPages = (ctx) => [
  { path: 'ask/index.html', html: askPage(ctx) },
  { path: 'letters/index.html', html: lettersPage(ctx) },
  { path: 'tips/index.html', html: tipsPage(ctx) },
  { path: 'newsroom/inbox/index.html', html: inboxPage(ctx) },
];

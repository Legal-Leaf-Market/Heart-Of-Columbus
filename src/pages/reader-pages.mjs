// Readers talk to the newsroom: questions (/ask/), letters to the editor
// (/letters/) and tips (/tips/), all stored by /api/newsroom for an editor.
// No comment section, on purpose (docs/newspaper-plan.md, item 9).
import { esc, page } from '../layout.mjs';
import { header, footer } from '../site.mjs';
import { newsPage } from '../news/frame.mjs';
import { PAPER } from '../data/paper.mjs';
import { storyList } from '../news/render.mjs';
import { stories } from '../news/content.mjs';
import { SHAPES } from '../news/desk.mjs';
import { dealBusinesses } from '../deals.mjs';

export const field = (label, name, { type = 'text', area = false, req = false, auto = '', hint = '', rows = 6, max = '' } = {}) => `
<label>${esc(label)}${req ? '' : ' <span class="muted np-opt">(optional)</span>'}
  ${area ? `<textarea name="${name}" rows="${rows}"${req ? ' required' : ''}${max ? ` maxlength="${max}"` : ''}></textarea>` : `<input name="${name}" type="${type}"${auto ? ` autocomplete="${auto}"` : ''}${req ? ' required' : ''}>`}
  ${hint ? `<small class="muted">${esc(hint)}</small>` : ''}
</label>`;

export const form = (kind, button, fields) => `
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
  <nav class="chips np-sec-links" aria-label="Kind"><button type="button" class="pill" data-kind="ask" aria-pressed="true">Questions</button><button type="button" class="pill" data-kind="letter" aria-pressed="false">Letters</button><button type="button" class="pill" data-kind="tip" aria-pressed="false">Tips</button><button type="button" class="pill" data-kind="blue" aria-pressed="false">Back YOUR Blue</button></nav>
  <p class="muted" data-inbox-status>Loading…</p>
  <div data-inbox-out></div>
</section>`;
  return newsPage({ ...ctx, path: '/newsroom/inbox/', title: 'Newsroom inbox', description: 'Private.', body, scripts: ['newsroom.js'] });
}


// The publisher's writing desk: craft and approve the morning and evening
// editions (src/news/desk.mjs, /api/desk). Each edition's job builds it from
// the desk and schedules it; Hold (/api/hold) stops a scheduled send.
function deskPage(ctx) {
  const shapes = Object.entries(SHAPES).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('');
  const body = `
<style>
.dk{display:grid;gap:20px}@media(min-width:960px){.dk{grid-template-columns:320px 1fr}}
.dk-side,.dk-main{min-width:0}.dk-wrap label{display:block;margin:10px 0 4px;font-weight:600}
.dk-wrap input:not([type=checkbox]):not([type=radio]),.dk-wrap textarea,.dk-wrap select{width:100%;box-sizing:border-box;font:inherit;padding:8px;border:1px solid var(--line,#ccc);border-radius:6px;background:var(--bg,#fff);color:inherit}
.dk-wrap textarea{min-height:90px}.dk-body{min-height:320px!important;font-family:Georgia,serif;font-size:17px;line-height:1.55}
.dk-list{list-style:none;padding:0;margin:8px 0}.dk-list li{display:flex;gap:6px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line,#ddd)}
.dk-list li button.dk-open{flex:1;text-align:left;background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer}
.dk-chip{font-size:12px;padding:2px 6px;border-radius:9px;border:1px solid currentColor;white-space:nowrap}
.dk-chip[data-s=approved]{color:#1f7a3a}.dk-chip[data-s=spiked]{color:#999}.dk-chip[data-s=drafting]{color:#a36200}
.dk-tools{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.dk-tools button{font-size:14px}
.dk-out{white-space:pre-wrap;border:1px dashed var(--line,#bbb);border-radius:6px;padding:10px;margin:8px 0;font-family:Georgia,serif}
.dk-out li{cursor:pointer}.dk-src{display:grid;gap:4px;margin-bottom:8px}.dk-block{color:#b3261e}
.dk-count{font-size:13px}.dk-new{font-size:11px;font-weight:700;color:#b92e2b;margin-right:4px}.dk-src-k{font-size:12px;color:var(--muted,#666)}.dk-leads li{flex-wrap:wrap}.dk-leads li>span{min-width:min(100%,260px)}.dk-tabs{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}.dk-notes{margin:14px 0}.dk-ch{margin:6px 0;padding:6px 8px;border-left:3px solid var(--line,#ccc)}.dk-ch del{color:#b3261e}.dk-ch ins{color:#1f7a3a;text-decoration:none;border-bottom:1px solid currentColor}.dk-ch[data-took=yes]{border-color:#1f7a3a}.dk-ch[data-took=no]{border-color:#999;opacity:.7}.dk-ch .dk-tools{margin:4px 0 0}.dk-notes summary{cursor:pointer;font-weight:600}
.ow-form [data-deal-fields]{border:0;padding:0;margin:0;min-width:0}[data-deal-fields] select{width:100%;font:inherit;padding:8px;border:1px solid var(--edge);border-radius:12px}[data-deal-form]{max-width:44rem}[data-deal-fields] .deal-confirm{display:flex;align-items:baseline;gap:8px}.dk-deal-copy{overflow-wrap:anywhere;white-space:pre-line}
.dk iframe{width:100%;min-height:600px;border:1px solid var(--line,#ccc);border-radius:6px;background:#fff}
</style>
<section class="wrap np-section dk-wrap" data-desk>
  <header class="np-doc-head"><p class="kicker">Private</p><h1>The desk</h1>
  <p class="muted">Your morning and evening editions. You set the angle and the take, the desk helps you write it in your voice, and only pieces you approve go in. Each edition sends on its own at its time (6:45 AM and 6:00 PM) unless you press Hold.</p></header>
  <p class="muted" data-desk-status>Loading…</p>
  <nav class="dk-tabs" aria-label="Desk">
    <button type="button" class="pill" data-tab="today" aria-pressed="true">This edition</button>
    <button type="button" class="pill" data-tab="ideas" aria-pressed="false">Idea bank</button>
    <button type="button" class="pill" data-tab="voice" aria-pressed="false">Your voice</button>
    <button type="button" class="pill" data-tab="beat" aria-pressed="false">Beat book</button>
    <button type="button" class="pill" data-tab="deals" aria-pressed="false">Deals</button>
    <button type="button" class="pill" data-tab="preview" aria-pressed="false">Preview</button>
  </nav>

  <div class="dk" data-pane="today">
    <aside class="dk-side">
      <label for="dk-date">Day</label><input id="dk-date" type="date" data-date>
      <div class="dk-tabs" role="group" aria-label="Edition" style="margin:10px 0 0"><button type="button" class="pill" data-edition="morning" aria-pressed="true">Morning</button><button type="button" class="pill" data-edition="evening" aria-pressed="false">Evening</button></div>
      <p class="muted dk-count" data-clock></p>
      <label for="dk-subject">Subject line</label><input id="dk-subject" data-plan="subject" maxlength="150">
      <div class="dk-tools"><button type="button" class="btn" data-assist="subject">Suggest subjects</button></div>
      <label for="dk-intro">Your open <span class="muted">(Markdown, in your words; the evening uses one line)</span></label><textarea id="dk-intro" data-plan="intro" rows="5"></textarea>
      <h2>Up the road</h2>
      <p class="muted dk-count">One IndyStar story for this edition. Paste the link and type the headline; we never open their site, so it goes out as you typed it, credited "via IndyStar".</p>
      <label for="dk-road-url">IndyStar link</label><input id="dk-road-url" type="url" data-road="url" placeholder="https://www.indystar.com/story/...">
      <label for="dk-road-h">Headline <span class="muted">(as you type it)</span></label><input id="dk-road-h" data-road="headline" maxlength="200">
      <label for="dk-road-c">Your comment <span class="muted">(optional, labeled as yours)</span></label><textarea id="dk-road-c" data-road="comment" rows="2" maxlength="600"></textarea>
      <label><input type="checkbox" data-plan="skip" style="width:auto"> No edition this time</label>
      <div class="dk-tools"><button type="button" class="btn" data-save-plan>Save plan</button></div>
      <h2>Pieces</h2>
      <ol class="dk-list" data-pieces></ol>
      <div class="dk-tools"><button type="button" class="btn" data-new>New piece</button></div>
      <h2>Send</h2>
      <p class="muted dk-count" data-ready></p>
      <div class="dk-tools"><button type="button" class="btn" data-draft>Make the draft now</button><button type="button" class="btn" data-hold hidden>Hold this edition</button></div>
      <p class="muted dk-count" data-drafted></p>
      <p class="muted dk-count" data-run></p>
    </aside>
    <div class="dk-main" data-editor hidden>
      <div class="dk-tools">
        <label style="margin:0">Status <select data-f="status"><option value="idea">Idea</option><option value="drafting">Drafting</option><option value="approved">Approved</option><option value="spiked">Spiked</option></select></label>
        <label style="margin:0">Shape <select data-f="shape">${shapes}</select></label>
        <label style="margin:0">Voice <select data-f="voice"><option value="">Your main voice</option></select></label>
      </div>
      <label for="dk-headline">Headline</label><input id="dk-headline" data-f="headline" maxlength="200">
      <label for="dk-dek">Dek <span class="muted">(optional one line under the headline)</span></label><input id="dk-dek" data-f="dek" maxlength="300">
      <label for="dk-angle">Your take and direction</label>
      <textarea id="dk-angle" data-f="angle" rows="6" placeholder="What's the story, why it matters to Columbus, what you think, what to lead with, what to leave out."></textarea>
      <label>Sources <span class="muted">(link, plus the facts you're using from it)</span></label>
      <div data-sources></div>
      <div class="dk-tools"><button type="button" class="btn" data-add-source>Add a source</button></div>
      <div class="dk-tools" aria-label="Writing help">
        <button type="button" class="btn" data-assist="draft">Draft it</button>
        <button type="button" class="btn" data-assist="headlines">Headlines</button>
        <button type="button" class="btn" data-assist="hooks">Openings</button>
        <button type="button" class="btn" data-assist="tighten">Tighten</button>
        <button type="button" class="btn" data-assist="editpass">Edit pass</button>
        <button type="button" class="btn" data-assist="voice">Sound more like me</button>
        <button type="button" class="btn" data-assist="check">Check facts</button>
      </div>
      <p class="muted dk-count">Select a passage in the body, then:</p>
      <div class="dk-tools">
        <button type="button" class="btn" data-assist="tighten-part">Tighten selection</button>
        <button type="button" class="btn" data-assist="smooth">Smooth selection</button>
        <button type="button" class="btn" data-assist="grammar">Fix grammar</button>
      </div>
      <div data-out hidden><div class="dk-out" data-out-text></div><div class="dk-tools"><button type="button" class="btn" data-use="selection" hidden>Replace the selection</button><button type="button" class="btn" data-use="accept-all" hidden>Accept all</button><button type="button" class="btn" data-use="apply-pass" hidden>Apply my choices</button><button type="button" class="btn" data-use="replace">Use as the body</button><button type="button" class="btn" data-use="append">Add below the body</button><button type="button" class="btn" data-use="dismiss">Dismiss</button></div><p class="muted dk-count" data-out-meta></p></div>
      <label for="dk-body">The piece <span class="muted">(Markdown)</span></label>
      <textarea id="dk-body" class="dk-body" data-f="body"></textarea>
      <p class="muted dk-count" data-wc></p>
      <p class="muted dk-count" data-noticed hidden></p>
      <p class="dk-block" data-blockers></p>
      <div class="dk-tools"><button type="button" class="btn" data-save>Save</button><button type="button" class="btn" data-approve>Approve</button><button type="button" class="btn" data-remove>Delete</button></div>
    </div>
  </div>

  <div data-pane="ideas" hidden>
    <h2>Overnight leads</h2>
    <p class="muted">Gathered before dawn from public notices: city and county news, agendas and minutes, the county calendar and today's events. Leads, not stories: read each one at its source before you use it.</p>
    <p class="muted dk-count" data-leads-meta></p>
    <ul class="dk-list dk-leads" data-leads></ul>
    <div class="dk-tools"><button type="button" class="btn" data-gather>Gather now</button></div>
    <h2>Your ideas</h2>
    <p class="muted">Anything worth a piece: a link, a thing you overheard, a question. Start a piece from any of them.</p>
    <label for="dk-idea">New idea</label><textarea id="dk-idea" data-idea-text rows="3"></textarea>
    <label for="dk-idea-url">Link <span class="muted">(optional)</span></label><input id="dk-idea-url" data-idea-url type="url">
    <div class="dk-tools"><button type="button" class="btn" data-idea-add>Add to the bank</button></div>
    <details class="dk-notes">
      <summary>Paste notes</summary>
      <p class="muted">Paste a page of notes and each one becomes its own idea: a blank line between ideas, or one bullet per line. Your words are kept as written, the first link in each goes in its link field, and ideas already in the bank are skipped.</p>
      <label for="dk-notes">Your notes</label><textarea id="dk-notes" data-notes-text rows="6"></textarea>
      <div class="dk-tools"><button type="button" class="btn" data-notes-split>Split into ideas</button></div>
    </details>
    <ul class="dk-list" data-ideas></ul>
  </div>

  <div data-pane="voice" hidden>
    <p class="muted">The desk writes like you only if it has read you. Describe your voice, set your house rules, and paste a few pieces you wrote and like. It learns rhythm and word choice from them, never facts.</p>
    <p class="muted">Write in more than one register? Add up to five more voices (a dry briefing, a warmer column) and pick one for each piece next to its shape.</p>
    <div class="dk-tools">
      <label style="margin:0">Editing <select data-voice-pick><option value="main">Your main voice</option></select></label>
      <button type="button" class="btn" data-voice-new>New voice</button>
      <button type="button" class="btn" data-voice-del hidden>Delete this voice</button>
    </div>
    <div data-voice-name-wrap hidden><label for="dk-vname">Name of this voice</label><input id="dk-vname" data-voice="name" maxlength="60" placeholder="The briefing"></div>
    <label for="dk-about">How you sound</label><textarea id="dk-about" data-voice="about" rows="4" placeholder="Plain spoken, a little dry, Columbus born, short sentences, never cute."></textarea>
    <label for="dk-rules">House rules <span class="muted">(one per line)</span></label><textarea id="dk-rules" data-voice="rules" rows="5" placeholder="Name the street, not just the neighborhood.&#10;No exclamation points."></textarea>
    <label>Your writing samples <span class="muted">(up to six)</span></label>
    <div data-samples></div>
    <div class="dk-tools"><button type="button" class="btn" data-sample-add>Add a sample</button><button type="button" class="btn" data-voice-save>Save my voice</button></div>
  </div>


  <div data-pane="deals" hidden>
    <h2>Publish a local deal</h2>
    <p class="muted">Paste the offer as the business wrote it, including any terms. It appears on <a href="/deals/">Local deals</a> through the end date, Columbus time.</p>
    <form class="ow-form np-form" data-deal-form>
      <fieldset data-deal-fields disabled>
        <label>Business
          <select name="slug" required>
            <option value="">Choose a business</option>
            ${dealBusinesses.map((b) => `<option value="${esc(b.slug)}">${esc(b.name)}${b.address ? ` · ${esc(b.address)}` : ''}</option>`).join('')}
          </select>
        </label>
        ${field('Offer and terms', 'text', { area: true, req: true, rows: 3, max: '600' })}
        ${field('Date the business sent it', 'sent', { type: 'date', req: true })}
        ${field('Last day of the offer', 'ends', { type: 'date', req: true })}
        <label class="deal-confirm"><input type="checkbox" name="confirmed" required><span>I confirmed that the business supplied and authorized this offer.</span></label>
        <button class="btn" type="submit">Publish deal</button>
      </fieldset>
    </form>
    <h2>Deals added from the desk</h2>
    <p role="status" class="muted" data-deal-status></p>
    <ul class="dk-list dk-leads" data-desk-deals></ul>
  </div>

  <div data-pane="beat" hidden>
    <h2>Beat book</h2>
    <p class="muted">The names you write about and how to spell them. The writing help follows it, and Approve stops a piece that spells a name the wrong way or uses a phrase you have banned. Notes are for you and for spelling only: the desk never takes a fact from them.</p>
    <label for="dk-beat">Names, one per line <span class="muted">(Name | note | wrong spellings, comma separated)</span></label>
    <textarea id="dk-beat" data-beat="entries" rows="10" placeholder="Zaharakos | soda fountain on Washington Street | Zaharako's, Zaharakas&#10;Mill Race Park | riverfront park, round tower | Millrace Park"></textarea>
    <label for="dk-banned">Phrases you never use <span class="muted">(one per line)</span></label>
    <textarea id="dk-banned" data-beat="banned" rows="5" placeholder="game changer&#10;nestled"></textarea>
    <div class="dk-tools"><button type="button" class="btn" data-beat-save>Save the beat book</button></div>
    <p class="muted dk-count" data-beat-count></p>
  </div>

  <div data-pane="preview" hidden>
    <p class="muted" data-preview-note></p>
    <iframe title="Edition preview" data-preview sandbox=""></iframe>
  </div>
</section>`;
  return newsPage({ ...ctx, path: '/newsroom/desk/', title: 'The desk', description: 'Private.', body, scripts: ['prose.js', 'notes.js', 'diff.js', 'desk.js'] });
}

// Hold a scheduled edition (/api/hold). The link in each edition's note
// carries a one time code after #; the page moves it to this tab, wipes the
// address bar, and holds only when the button is pressed, so a mail scanner
// opening the link stops nothing.
function holdPage({ assets }) {
  const body = `
${header('')}
<main id="main" class="wrap prose" data-hold-page>
  <p class="kicker">Private</p>
  <h1>Hold an edition</h1>
  <p data-hold-status>Loading…</p>
  <p><button type="button" class="btn" data-hold-go hidden>Hold this edition</button></p>
  <p class="muted">Holding turns the scheduled email back into a draft in Resend. Nothing is sent. You can fix it and send it from Resend, or leave it.</p>
</main>
${footer()}`;
  return page({ title: 'Hold an edition | Heart of Columbus', description: 'Private.', body, scripts: ['hold.js'], styles: ['hoc.css'], assets, head: '<meta name="referrer" content="no-referrer">', path: '/newsroom/hold/' });
}

export const readerPages = (ctx) => [
  { path: 'newsroom/hold/index.html', html: holdPage(ctx) },
  { path: 'ask/index.html', html: askPage(ctx) },
  { path: 'letters/index.html', html: lettersPage(ctx) },
  { path: 'tips/index.html', html: tipsPage(ctx) },
  { path: 'newsroom/inbox/index.html', html: inboxPage(ctx) },
  { path: 'newsroom/desk/index.html', html: deskPage(ctx) },
];

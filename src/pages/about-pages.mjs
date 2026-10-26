// The newspaper's trust pages: /about/, /about/standards/, /about/corrections/
// and /staff/. They follow the Trust Project's indicators and the SPJ Code of
// Ethics. Policies the publisher has not signed off on say "draft".
import { esc, t } from '../layout.mjs';
import { newsPage } from '../news/frame.mjs';
import { PAPER, FUNDERS, AI_POLICY } from '../data/paper.mjs';
import { staffList, person } from '../data/staff.mjs';
import { LABELS, labelClass } from '../news/labels.mjs';

const ext = (href, text) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(text)}</a>`;
const tbd = (what) => `<span class="np-tbd">${esc(what)} is still being decided by the publisher.</span>`;
const draft = (ok) => (ok ? '' : '<p class="np-draft">Draft policy. The publisher has not signed off on it yet.</p>');
const contact = () => (PAPER.email ? `<a href="mailto:${esc(PAPER.email)}">${esc(PAPER.email)}</a>` : 'our newsroom (a public address is coming soon)');

const doc = (kicker, title, lede, sections) => `
<article class="wrap np-doc">
  <header class="np-doc-head"><p class="kicker">${esc(kicker)}</p><h1>${esc(title)}</h1>${lede ? `<p class="np-dek">${lede}</p>` : ''}</header>
  ${sections.map(([id, h, html]) => `<section id="${id}"><h2>${esc(h)}</h2>${html}</section>`).join('')}
</article>`;

const people = () => staffList().map((s) => `<li><a href="/staff/${s.slug}/"><strong>${esc(s.name)}</strong></a>, ${esc(s.role)}${s.beat ? `. ${esc(s.beat)}` : ''}</li>`).join('');

function aboutPage(ctx) {
  const pub = person(PAPER.publisher);
  const editor = PAPER.editor && person(PAPER.editor);
  const body = doc('About us', `About ${PAPER.name}`, 'Local news for Columbus, Indiana, from the people who already keep track of every independent business in town.', [
    ['mission', 'What we are for', `
      <p>Columbus deserves more news, not less. We cover the city, the county, the schools and the businesses that make this place what it is, and we put the useful stuff (what is open, what is happening, what changed) right next to the reporting.</p>
      <p>We are free to read. Every story names who wrote it, who edited it, where the facts came from and how we reported it. When we get something wrong, we say so on the story and in our <a href="/about/corrections/">corrections log</a>.</p>
      ${PAPER.motto ? `<p class="np-motto">${t(PAPER.motto)}</p>` : `<p>${tbd('Our motto')}</p>`}`],
    ['who', 'Who runs this paper', `
      <p>${pub ? `<a href="/staff/${pub.slug}/">${esc(pub.name)}</a> is the publisher.` : ''} ${editor ? `<a href="/staff/${editor.slug}/">${esc(editor.name)}</a> is the editor, and approves every story before it runs.` : tbd('Our editor')}</p>
      <ul class="np-list">${people()}</ul>
      <p><a href="/staff/">Everyone on staff</a></p>`],
    ['funding', 'About our funding', `
      ${PAPER.funding ? `<p>${t(PAPER.funding)}</p>` : `<p>${tbd('How the paper pays for itself')} Whatever we choose, this page will list every funder and sponsor, and no funder or sponsor gets a say in what we cover.</p>`}
      ${FUNDERS.length ? `<ul class="np-list">${FUNDERS.map((f) => `<li>${f.url ? ext(f.url, f.name) : esc(f.name)}: ${esc(f.what)}, since ${esc(f.since)}</li>`).join('')}</ul>` : '<p>We have no funders or sponsors yet.</p>'}
      <p>This site also runs a business directory and offers local businesses free tools such as pickup tickets. When a story mentions a business we have that kind of relationship with, the story says so automatically.</p>`],
    ['neighbors', 'Our neighbors in the news business', `
      <p><a href="https://www.therepublic.com/" target="_blank" rel="noopener"><em>The Republic</em></a> has been covering Columbus since 1872. We have been at it for slightly less time than that. We read them, we think you should too, and when they break a story we will link to it and give them full credit. We will never copy or rewrite their work.</p>
      <p>If we ever beat them to one, we promise to be gracious about it. Columbus is better with two newsrooms than with one, and we would be glad to work together any time.</p>`],
    ['reach', 'Reach us', `
      <p>Story ideas, tips, letters and corrections all go to ${contact()}. Our <a href="/about/standards/">standards</a> explain how we handle what you send.</p>`],
  ]);
  return newsPage({ ...ctx, path: '/about/', title: 'About us', description: `Who runs ${PAPER.name}, who pays for it, and how to reach the newsroom.`, crumbs: [['', 'About']], body });
}

function standardsPage(ctx) {
  const body = doc('Our standards', 'How we report', 'We follow the Society of Professional Journalists Code of Ethics and the Trust Project’s eight trust indicators. Here is what that means in practice.', [
    ['ethics', 'Ethics', `${draft(false)}
      <p>Our policy starts from the ${ext('https://www.spj.org/ethicscode.asp', 'SPJ Code of Ethics')}:</p>
      <ul class="np-list">
        <li><strong>Seek truth and report it.</strong> We check facts ourselves, name our sources, and say what we could not confirm.</li>
        <li><strong>Minimize harm.</strong> We think about the people in a story who did not ask to be there. We do not run mugshot galleries, and an arrest is not a conviction.</li>
        <li><strong>Act independently.</strong> No sponsor, funder, partner or advertiser gets a say in what we cover or how.</li>
        <li><strong>Be accountable and transparent.</strong> Every story names its author and editor, lists its sources, and explains how we reported it.</li>
      </ul>`],
    ['two-people', 'Two people on every story', `
      <p>A named person writes every story and a different person, an editor, approves it before it runs. Nobody approves their own work.</p>`],
    ['ai', 'How we use AI', `${draft(PAPER.aiPolicyApproved)}<ul class="np-list">${AI_POLICY.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`],
    ['sources', 'Sources', `
      <p>Every story ends with its references: the people we interviewed (with the date), the documents we read, and the data we used, linked where we can. If we learned something from another newsroom’s reporting, we link to it and name them.</p>
      <p>Business details in our directory come from public listings. When a story says a business opened, closed or changed hands, we confirm it with the business or say plainly that we could not reach them.</p>`],
    ['anonymous', 'Anonymous sources', `
      <p>We name our sources. We grant anonymity only when a source faces real harm for speaking, the information matters to the public, and we cannot get it any other way. The editor must agree, must know who the source is, and the story explains why we kept the name out.</p>`],
    ['conflicts', 'Conflicts of interest', `
      <p>This site also runs a business directory and free tools for local businesses. That is a relationship, and we disclose it. If a story mentions a business that takes pickup orders through us or sponsors us, a line at the top of the story says so, automatically, every time.</p>
      <p>Staff disclose their own ties (family, money, board seats) to the editor and do not cover subjects they are tied to.</p>`],
    ['labels', 'What our labels mean', `
      <p>Every story has one label above its headline, so you always know what you are reading.</p>
      <dl class="np-labels">${Object.entries(LABELS).map(([l, d]) => `<dt><span class="${labelClass(l)}">${esc(l)}</span></dt><dd>${esc(d)}</dd>`).join('')}</dl>`],
    ['corrections', 'Corrections', `
      <p>When we get a fact wrong we fix it and say so, with the date. A correction that changes what the story means goes at the top; smaller ones go at the bottom. We never quietly edit a mistake away, and corrections are never deleted. All of them are listed in our <a href="/about/corrections/">corrections log</a>.</p>`],
    ['what-we-skip', 'Things we do not do', `
      <ul class="np-list">
        <li>No comment section. Write us a letter or ask us a question instead.</li>
        <li>No police blotter or mugshots without an editor deciding the story matters.</li>
        <li>No copying or rewriting other newsrooms’ stories. We link to them.</li>
        <li>No paywall at launch.</li>
        <li>No closing announced from a map listing alone. We call first.</li>
      </ul>`],
    ['feedback', 'Tell us', `<p>Spot an error, have a tip, or think we got the balance wrong? Write to ${contact()}. A person reads every message.</p>`],
  ]);
  return newsPage({ ...ctx, path: '/about/standards/', title: 'Our standards', description: 'Ethics, AI use, sourcing, anonymous sources, conflicts of interest, labels and corrections.', crumbs: [['/about/', 'About'], ['', 'Standards']], body });
}

// log: [{ date, text, story: { headline, href } }] newest first, from the stories.
function correctionsPage(ctx, log) {
  const body = doc('Corrections', 'Corrections log', 'Every correction we have made, newest first. Each one also appears on the story it fixes.', [
    ['policy', 'Our policy', `<p>When we get a fact wrong we fix it, say what changed and when, and list it here. Corrections are never deleted. See our <a href="/about/standards/#corrections">standards</a>.</p>`],
    ['log', 'The log', log.length
      ? `<ol class="np-corr-log">${log.map((c) => `<li><time datetime="${esc(c.date)}">${esc(c.dateText || c.date)}</time> <a href="${c.story.href}">${t(c.story.headline)}</a><p>${t(c.text)}</p></li>`).join('')}</ol>`
      : '<p>No corrections yet.</p>'],
  ]);
  return newsPage({ ...ctx, path: '/about/corrections/', title: 'Corrections', description: 'Every correction we have published, newest first.', crumbs: [['/about/', 'About'], ['', 'Corrections']], body });
}

function staffIndex(ctx) {
  const body = doc('Our newsroom', 'Staff', '', [['people', 'Who we are', `<ul class="np-list">${people()}</ul>`]]);
  return newsPage({ ...ctx, path: '/staff/', title: 'Staff', description: 'The people who report, write and edit the paper.', crumbs: [['/about/', 'About'], ['', 'Staff']], body });
}

// stories: published stories bylined or edited by this person, newest first.
function staffPage(ctx, s, stories) {
  const body = `
<article class="wrap np-doc np-bio">
  <header class="np-doc-head"><p class="kicker">${esc(s.role)}</p><h1>${esc(s.name)}</h1>${s.beat ? `<p class="np-dek">Covers ${esc(s.beat.toLowerCase())}</p>` : ''}</header>
  <p>${t(s.bio)}</p>
  ${s.email ? `<p>Email <a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>` : ''}
  <section><h2>Latest work</h2>${stories.length ? `<ul class="np-list">${stories.map((x) => `<li><a href="${x.href}">${t(x.headline)}</a></li>`).join('')}</ul>` : '<p>Nothing published yet.</p>'}</section>
</article>`;
  return newsPage({ ...ctx, path: `/staff/${s.slug}/`, title: s.name, description: `${s.name}, ${s.role}.`, crumbs: [['/staff/', 'Staff'], ['', s.name]], body });
}

export function aboutPages(ctx, { corrections = [], storiesBy = () => [] } = {}) {
  return [
    { path: 'about/index.html', html: aboutPage(ctx) },
    { path: 'about/standards/index.html', html: standardsPage(ctx) },
    { path: 'about/corrections/index.html', html: correctionsPage(ctx, corrections) },
    { path: 'staff/index.html', html: staffIndex(ctx) },
    ...staffList().map((s) => ({ path: `staff/${s.slug}/index.html`, html: staffPage(ctx, s, storiesBy(s.slug)) })),
  ];
}

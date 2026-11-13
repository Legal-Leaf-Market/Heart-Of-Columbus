// The Founders Club (/founders-club/): the businesses building Heart of
// Columbus with us as it launches. Modeled on the G.O.B. Founders Club at Legal
// Leaf Market: tiers, a numbered founding run, a wall of members, and a reward
// for bringing others in. Everything it shows comes from src/data/members.mjs;
// with nobody signed it says so and invites the first.
import { page } from '../layout.mjs';
import { header, footer, card, svg } from '../site.mjs';
import { directory, CATEGORIES } from '../data/directory.mjs';
import { MEMBERS, PRICE, SPOTS, AMBASSADORS, WELCOME_MONTHS, REFERRAL_TIERS } from '../data/members.mjs';

const styles = ['hoc.css'];
const bySlug = Object.fromEntries(directory.map((b) => [b.slug, b]));

// Founder numbers follow the order owners signed, so #1 is always the first.
export const founders = () =>
  Object.entries(MEMBERS)
    .filter(([slug]) => bySlug[slug])
    .sort((a, b) => a[1].since.localeCompare(b[1].since) || a[0].localeCompare(b[0]))
    .map(([slug, m], i) => ({ n: i + 1, since: m.since, b: bySlug[slug] }));

function foundersPage({ assets }) {
  const wall = founders();
  const open = SPOTS - wall.length;
  const direct = directory.filter((b) => b.order.length || b.book.length).length;
  const tiers = [
    ['Listed', 'Free, always', 'Local businesses from public listings, with hours, map, phone and Book or Order buttons that go straight to your own pages.', ['Your listing, fixed and claimed by you', 'Your own booking or ordering, linked direct', 'Your words, your deals, your photos'], ''],
    ['Founding Member', `$${PRICE} a month`, `Your own website, built and kept current, and a featured, numbered place in the club. ${SPOTS} founding spots, price locked for as long as you stay. Cancel any time.`, ['A website on a domain in your name, yours to move to any host', 'Updates within two business days of a text', 'First in your category, marked ★ Founding Member', `Your founder number on the wall, #1 to #${SPOTS}`, 'Every new tool we build, at no extra cost'], 'is-hot'],
    ['Ambassador', 'One per section', 'The owner who knows everyone in their corner of town. Bring your neighbors on and we take care of you.', [`A welcome website, yours to keep, ${WELCOME_MONTHS} months of hosting free`, 'Your section up front at launch', 'A say in how your section works', 'Rewards for every business you bring on', 'Every new tool we build, at no extra cost'], ''],
  ];
  const body = `
${header('')}
<main id="main" class="fc-page">
<section class="order-hero fc-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Founders Club</p>
    <h1>The businesses building<br><span class="hl">Heart of Columbus.</span></h1>
    <p class="lede">Heart of Columbus is the visitor center, the local directory, order pickup and online booking for our town, all in one place. We are starting in Columbus, Indiana, and building it for towns across America. It is not only a website: we are going old school too, with a printed newspaper hand delivered to neighbors 55 and up. The Founders Club is the local owners who launch it with us.</p>
    <div class="order-stats"><a href="/explore/"><b>${directory.length}</b> local businesses listed</a><a href="/order/"><b>${direct}</b> book or order direct</a><a href="#wall"><b>${open}</b> of ${SPOTS} founding spots open</a></div>
  </div>
</section>

<section class="wrap fc-tiers" aria-label="Ways to join">
  ${tiers.map(([name, price, blurb, perks, cls]) => `<div class="fc-tier ${cls}">
    <p class="kicker">${name}</p>
    <p class="fc-price">${price}</p>
    <p>${blurb}</p>
    <ul>${perks.map((p) => `<li>${p}</li>`).join('')}</ul>
  </div>`).join('')}
</section>

<section class="wrap ow-how fc-tools" id="tools">
  <p class="kicker">Every new tool, included</p>
  <h2>Your membership grows as we build</h2>
  <p>Heart of Columbus is a software shop as much as a guide. Founders Club members get <b>full access to every new feature as it becomes available, at no additional cost</b>. Not a trial, not a time window: everything we build, all the way to a complete system. On the way:</p>
  <div class="fc-tool-row">
    <div><b>Booking of our own</b><span>Appointments, reminders and your calendar, built in, so you can drop the outside booking app if you want to.</span></div>
    <div><b>Bookkeeping for your trade</b><span>We are already building accounting software for the wedding industry. We will adapt it industry by industry, barbershops included.</span></div>
    <div><b>A full back office</b><span>The goal: an ERP for every industry, software so complete you do not need any other software to run your business.</span></div>
  </div>
  <p class="muted">Your price stays where it is. Each new tool is yours the day it is ready.</p>
</section>

<section class="wrap ow-how" id="refer">
  <h2>Bring a neighbor, skip a bill</h2>
  <p>Every business you bring in that joins earns you a reward. Founding Members and Ambassadors both count.</p>
  <div class="ow-tiers-row">${REFERRAL_TIERS.map(([n, what]) => `<div><b>${n} ${n === 1 ? 'business' : 'businesses'}</b><span>${what}</span></div>`).join('')}</div>
</section>

<section class="wrap ow-how" id="ambassadors">
  <h2>Sections looking for an ambassador</h2>
  <p>One owner per section, as we launch.</p>
  <div class="ow-amb-cats">${CATEGORIES.map((c) => {
    const a = AMBASSADORS[c.slug];
    const who = a && bySlug[a.slug];
    return who
      ? `<a class="ow-amb-cat is-taken" href="/b/${who.slug}/">${c.emoji} ${c.label} <small>${who.name}</small></a>`
      : `<a class="ow-amb-cat" href="/owners/?want=founders#claim">${c.emoji} ${c.label} <small>Open</small></a>`;
  }).join('')}</div>
</section>

<section class="wrap ow-how fc-chamber" id="chamber">
  <p class="kicker">Alongside the Chamber</p>
  <h2>Built to work with the Columbus Area Chamber of Commerce, never against it</h2>
  <p>The Chamber speaks for Columbus business: advocacy, events, connections, the network. Heart of Columbus is the shop window and the toolbox: the guide people use to find you, and the software you use to run. Being in one never takes the place of the other, and we hope you are in both.</p>
</section>

<section class="wrap list" id="wall">
  <div class="sec-head"><p class="kicker">The Founders Wall</p><h2>Founding Members, in the order they joined</h2></div>
  ${wall.length
    ? `<div class="grid fc-wall">${wall.map((f) => `<div class="fc-founder"><span class="fc-n">#${f.n}</span>${card(f.b)}</div>`).join('')}</div>`
    : `<div class="fc-empty"><span class="fc-n">#1</span><p><b>Nobody on the wall yet.</b> The first business to join is Founder #1, for good.</p><a class="btn" href="/owners/?want=founders#claim">Claim #1 ${svg('arrow', 'ic-sm')}</a></div>`}
</section>

<section class="wrap ow-how" id="promises">
  <h2>What the club never changes</h2>
  <ul>
    <li><b>Your free listing.</b> Joining is never the price of being on Heart of Columbus.</li>
    <li><b>Search.</b> Results rank by what you searched for, never by who pays.</li>
    <li><b>What we write.</b> Members and ambassadors have no say in our coverage, and every member is labeled so readers know.</li>
    <li><b>Your money.</b> We never take a cut of your bookings, orders or sales.</li>
    <li><b>Your site.</b> Cancel any time. Your website is yours: we hand over every file and help you move it to any host.</li>
    <li><b>Your price.</b> New tools and features come with your membership. No upgrade fees, no add on tiers.</li>
  </ul>
  <p><a class="btn" href="/owners/?want=founders#claim">Join the Founders Club ${svg('arrow', 'ic-sm')}</a></p>
</section>
</main>
${footer()}`;
  return page({ title: 'Founders Club | Heart of Columbus', description: `Local owners launching Heart of Columbus: Founding Members at $${PRICE} a month, one Ambassador per section, and a wall of founders in the order they joined.`, body, scripts: ['site.js'], styles, assets });
}

export function foundersPages(ctx) {
  return [{ path: 'founders-club/index.html', html: foundersPage(ctx) }];
}

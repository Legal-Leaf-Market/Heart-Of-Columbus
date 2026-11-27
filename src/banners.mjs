// Smart banners: the carousel under the homepage search, and the big promo
// banners for ordering direct, the morning edition and Columbus history.
// Plain links and markup; public/js/banners.js only orders the carousel by
// the hour, hides slides out of season and adds the arrows. Every slide links
// to a page that exists and claims nothing those pages don't.
import { esc } from './layout.mjs';
import { sticker, svg } from './site.mjs';
import { DECADES } from './data/history/index.mjs';
import { SMALL_BUSINESS_SATURDAY as SBS } from './data/holidays.mjs';
import { signupBox } from './news/share.mjs';
import { MEMBERS, SPOTS, PRICE } from './data/members.mjs';

const dayAfter = (iso) => new Date(new Date(`${iso}T12:00:00Z`).getTime() + 86400e3).toISOString().slice(0, 10);
const fmtDay = (iso) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric' }).format(new Date(`${iso}T12:00:00Z`));

// Each slide: when it leads (hours, Columbus time) and, for seasonal ones,
// the dates it shows (YYYY-MM-DD, inclusive). The script reads these.
export function slides({ news = null } = {}) {
  const decades = DECADES.filter((d) => d.items.length);
  return [
    { id: 'newsletter', lead: [5, 11], tint: '#f3efe4', stk: 'calendar', kicker: 'The newsletter', title: 'Columbus news, before your coffee cools.', text: 'Good, honest local news, a local business and what’s on. Every morning and evening, free.', href: '/newsletter/', cta: 'Get the newsletter' },
    SPOTS > Object.keys(MEMBERS).length ? { id: 'founders', lead: [14, 17], tint: '#fff0d9', stk: 'heart-storefront', kicker: 'Founders Club', title: `${SPOTS - Object.keys(MEMBERS).length} more founding spots are open.`, text: `Own a Columbus business? $${PRICE} a month gets your own website and every feature we build, the small business ERP included. Grandfathered in, promised and guaranteed.`, href: '/founders-club/#more-spots', cta: 'Claim a spot' } : null,
    { id: 'direct', lead: [11, 14], tint: '#fde7dc', stk: 'takeaway', kicker: 'Skip the app fee', title: 'Order direct. Same food, no cut.', text: 'Apps take a cut of every pickup order. Order straight from the restaurant and the whole ticket stays in Columbus.', href: '/order/#order', cta: 'Order direct' },
    news ? { id: 'news', lead: [6, 9], tint: '#eef2f7', stk: 'arch-books', kicker: 'Today’s paper', title: news.headline, text: news.dek || '', href: news.href, cta: 'Read the story' } : null,
    { id: 'history', lead: [19, 23], tint: '#efe6d6', stk: 'modernist-tower', kicker: 'Columbus history', title: `${decades.length} decades of Columbus, told one story at a time.`, text: `From the ${decades[0]?.slug || '1930s'} to today: the engines, the architects, the churches and the people who built this town.`, href: '/history/', cta: 'Start reading' },
    { id: 'visit', lead: [14, 17], tint: '#e3f1ea', stk: 'map-heart', kicker: 'Plan your visit', title: 'Coming to Columbus? Start here.', text: 'Tours, parking, the Visitors Center, the Social District and trip ideas for a day or a weekend.', href: '/visit/', cta: 'Plan your visit' },
    { id: 'free', lead: [17, 19], tint: '#fff4d6', stk: 'park', kicker: 'Free in Columbus', title: 'The best things here cost nothing.', text: 'Architecture from the street, parks, public art and free events, each with where it came from.', href: '/free/', cta: 'See what’s free' },
    { id: 'holidays', from: '2026-11-01', to: SBS.date, lead: [9, 12], tint: '#fbe3e3', stk: 'heart-storefront', kicker: 'Shop small for the holidays', title: `Small Business Saturday is ${fmtDay(SBS.date)}.`, text: 'Independent shops to visit that day and all season, plus gift cards bought straight from the business.', href: '/holidays/', cta: 'Shop small' },
    { id: 'holidays-season', from: dayAfter(SBS.date), to: '2026-12-31', lead: [9, 12], tint: '#fbe3e3', stk: 'heart-storefront', kicker: 'Shop small for the holidays', title: 'Give something made right here.', text: 'Independent Columbus shops for the season, plus gift cards bought straight from the business.', href: '/holidays/', cta: 'Shop small' },
  ].filter(Boolean);
}

export const smartCarousel = (list) => `
<section class="sc wrap" aria-roledescription="carousel" aria-label="Find your way around" data-sc>
  <div class="sc-track" data-sc-track tabindex="0">
    ${list.map((s, i) => `<a class="sc-slide" href="${esc(s.href)}" style="--sc:${s.tint}" data-sc-slide="${s.id}" data-lead="${s.lead.join(',')}"${s.from ? ` data-from="${s.from}" data-to="${s.to}"` : ''} aria-roledescription="slide" aria-label="${i + 1} of ${list.length}: ${esc(s.kicker)}">
      <span class="sc-copy"><span class="sc-k">${esc(s.kicker)}</span><strong class="sc-t">${esc(s.title)}</strong>${s.text ? `<span class="sc-x">${esc(s.text)}</span>` : ''}<span class="sc-cta">${esc(s.cta)} ${svg('arrow', 'ic-sm')}</span></span>
      ${sticker(s.stk, { size: 132, cls: 'sc-art' })}
    </a>`).join('')}
  </div>
  <div class="sc-nav" data-sc-nav hidden>
    <button type="button" class="sc-btn" data-sc-prev aria-label="Previous">${svg('arrow', 'ic-sm sc-flip')}</button>
    <span class="sc-dots" data-sc-dots></span>
    <button type="button" class="sc-btn" data-sc-next aria-label="Next">${svg('arrow', 'ic-sm')}</button>
  </div>
</section>`;

export const orderDirectBanner = ({ n = 0 } = {}) => `
<section class="pb pb-direct" aria-labelledby="pb-direct-h">
  <div class="wrap pb-grid">
    <div class="pb-copy">
      <p class="pb-k">Save restaurants the app fee</p>
      <h2 id="pb-direct-h">Order direct. Keep it in Columbus.</h2>
      <p>Ordering apps charge restaurants a cut even when you pick the food up yourself. Order straight from the restaurant instead: same food, same pickup, and the whole ticket stays with the people who made it.</p>
      <p class="pb-cta"><a class="btn btn-big" href="/order/#order">Order direct${n ? `: ${n} places` : ''} ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost" href="/#keep-it-local">See the math</a></p>
    </div>
    ${sticker('takeaway', { size: 220, cls: 'pb-art' })}
  </div>
</section>`;

export const newsletterBanner = () => `
<section class="pb pb-news" aria-labelledby="pb-news-h">
  <div class="wrap pb-grid">
    <div class="pb-copy">
      <p class="pb-k">The morning edition</p>
      <h2 id="pb-news-h">Good news about your town, every morning and evening.</h2>
      <p>Heart of Columbus is local news that’s honest and on your side: the stories, what’s open early and what’s happening today, in one short email. Free, and one click to unsubscribe.</p>
      <p class="pb-cta"><a class="btn btn-ghost" href="/news/">Read today’s paper</a><a class="btn btn-ghost" href="/news/feed.xml">Follow by RSS</a></p>
    </div>
    <div class="pb-side">${signupBox({ heading: 'Sign up free', compact: true })}</div>
  </div>
</section>`;

export const historyBanner = () => {
  const decades = DECADES.filter((d) => d.items.length);
  return `
<section class="pb pb-history" aria-labelledby="pb-history-h">
  <div class="wrap pb-grid">
    <div class="pb-copy">
      <p class="pb-k">Columbus history</p>
      <h2 id="pb-history-h">How a river town became the Athens of the Prairie.</h2>
      <p>${decades.length} decades, ten stories each, every one built from sources you can check. Pick a decade and start reading.</p>
      <ul class="pb-decades" role="list">${decades.map((d) => `<li><a href="/history/${d.slug}/">${esc(d.slug)}</a></li>`).join('')}</ul>
      <p class="pb-cta"><a class="btn btn-big" href="/history/">Explore Columbus history ${svg('arrow', 'ic-sm')}</a></p>
    </div>
    ${sticker('modernist-tower', { size: 220, cls: 'pb-art' })}
  </div>
</section>`;
};

import { smartCarousel, slides, orderDirectBanner, newsletterBanner, historyBanner } from '../banners.mjs';
import { stories } from '../news/content.mjs';
import { siteLd } from '../jsonld.mjs';
// The home page: a front door to every independent business in Columbus.
import { page, esc, t } from '../layout.mjs';
import { businesses, prototypes } from '../data/businesses.mjs';
import { directory, CATEGORIES, AREAS, inSection } from '../data/directory.mjs';
import { header, footer, rail, svg, PHOTOS, sticker, catSticker } from '../site.mjs';
import { eventsSection } from './events.mjs';
import { yourWay } from './trip-pages.mjs';
import { spotlightSection } from './spotlight.mjs';

// Each demo keeps its business's own colors; the sticker says what it sells.
const featuredStyle = {
  'gills-barber-shop': ['#1e2a4a', '#fff', 'Live chair queue, save your spot, book a cut.', 'barber'],
  tacolumbus: ['#2b1055', '#fff', 'Build birria plates and taco packs, pick a pickup time.', 'taco'],
  'big-cheese': ['#ffc93c', '#2a2118', 'Build your sub, add a combo, beat the daily countdown.', 'sandwich'],
  'tasty-express': ['#0e0e0e', '#fff', 'Lunch or dinner combos in three taps, text confirmation.', 'takeaway'],
  rohdes: ['#d7263d', '#fff', 'Build a breakfast: eggs your way, meat, potatoes, biscuit.', 'breakfast'],
};

// A rail is a taste with a "See all" link, not the whole category: n places
// spread evenly through the list, so it is not always the A names.
const RAIL = 8;
const pick = (fn, n = RAIL) => {
  const all = directory.filter(fn);
  if (all.length <= n) return all;
  return Array.from({ length: n }, (_, i) => all[Math.floor((i * all.length) / n)]);
};
// The open-now rail ships the places open the most hours a week, so a few are
// open at almost any hour; the page then shows only the ones open right now.
const OPEN_CANDIDATES = 48;
const weeklyMinutes = (b) => b.hours.reduce((n, [, o, c]) => n + (c - o), 0);
const inSub = (...subs) => (b) => subs.includes(b.sub);
const FOOD = ['restaurants', 'coffee-sweets', 'bars'];
// From each place's listed hours: open at 10 PM or later on some night, or
// open by 7 AM on some morning.
const lateNight = (b) => FOOD.includes(b.cat) && b.hours && b.hours.some(([, , close]) => close >= 22 * 60 + 30);
const earlyBird = (b) => FOOD.includes(b.cat) && b.hours && b.hours.some(([, open, close]) => open <= 7 * 60 && close - open < 1440);

export function renderHub({ assets }) {
  const bySlug = Object.fromEntries(businesses.map((b) => [b.slug, b]));
  const count = (fn) => directory.filter(fn).length;
  const total = directory.length;
  const direct = count((b) => b.order.length || b.book.length || b.store || b.feed);

  // Popular shortcuts under the search: real routes, plain words.
  const quick = [
    ['Tacos', '/c/restaurants/mexican/'], ['Coffee', '/c/coffee-sweets/'], ['Barbers', '/c/beauty/barbers/'], ['Plumbers', '/c/home-services/hvac-plumbing/'],
  ];

  const archOrder = ['firstchristian', 'northchristian', 'irwin', 'library', 'miller', 'firestation', 'cityhall', 'bridge', 'courthouse', 'commons'];

  // Rails stay for the collections people scroll; the rest are compact rows
  // with a count and a See all link, so the page is not thirteen carousels.
  const railsShown = [
    ['The taco trail', '/c/restaurants/mexican/', inSub('mexican'), 'Restaurants'],
    ['Coffee, donuts & boba', '/c/coffee-sweets/', inSub('coffee-sweets'), 'Coffee & sweets'],
    ['Downtown, block by block', '/n/downtown/', (b) => b.area === 'downtown' && ['restaurants', 'coffee-sweets', 'bars', 'shopping', 'beauty'].includes(b.cat), 'Neighborhood'],
    ['Shop small on purpose', '/c/shopping/', inSub('boutiques', 'gifts', 'antiques'), 'Shopping'],
  ];
  const trails = [
    ['Up with the sun', '/explore/?cat=restaurants', earlyBird, 'Open by 7 AM', 'breakfast'],
    ['Late-night eats', '/explore/?cat=restaurants', lateNight, 'Open past 10:30 PM', 'takeaway'],
    ['Pints & pours', '/c/bars/', inSub('bars'), 'Bars & breweries', 'beer-hops'],
    ['Fresh cuts', '/c/beauty/barbers/', inSub('barbers'), 'Barbershops', 'barber'],
    ['Nails, lashes & a spa day', '/c/beauty/', inSub('nails', 'spa'), 'Beauty', 'community-heart'],
    ['Call before it leaks', '/c/home-services/hvac-plumbing/', inSub('hvac-plumbing', 'electric'), 'Home services', 'home-services'],
    ['Your wedding team', '/c/events/', (b) => b.sub === 'events' || /bridal|tux|flower|florist|bloom|photograph/i.test(b.name + ' ' + b.type), 'Events & weddings', 'weddings'],
    ['When the check engine light comes on', '/c/auto/auto-repair/', inSub('auto-repair'), 'Auto', 'auto'],
    ['Good dogs welcome', '/c/pets/', inSub('pets'), 'Pets', 'pets'],
  ].map(([title, href, fn, kicker, stk]) => ({ title, href, kicker, stk, n: count(fn) })).filter((x) => x.n);

  const o = count((b) => b.order.length), k = count((b) => b.book.length), f = count((b) => b.feed || b.store);

  const body = `
${header()}
<main id="main">

<section class="fg-hero" aria-labelledby="hero-h">
  <div class="wrap fg-hero-grid">
    <div class="fg-hero-copy">
      <p class="kicker kicker-pill">Columbus, Indiana</p>
      <h1 id="hero-h">Find your next local favorite.</h1>
      <p class="lede">Built by legends, run by neighbors. ${total} independent businesses, owner-run and local: the taqueria, the barber, the plumber and the bookshop, in one field guide to the Athens of the Prairie.</p>
      <form class="big-search" action="/explore/" role="search" data-typeahead>
        <label for="hero-q" class="big-search-label">Search local businesses</label>
        <div class="big-search-row">
          ${svg('search')}
          <input id="hero-q" name="q" type="search" autocomplete="off" placeholder="Birria, barbers, plumbers, 25th St" data-rotate='["Birria, boba, biscuits","Barbers, nails, lashes","Plumbers, roofers, mechanics","25th St, downtown, West Hill"]'>
          <button type="submit">Search</button>
        </div>
        <div class="ta-list" data-ta-list hidden></div>
      </form>
      <p class="quick"><span>Popular:</span>${quick.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</p>
    </div>
    <div class="fg-collage" aria-hidden="true">
      <span class="fg-shape fg-arch"></span><span class="fg-shape fg-sun"></span><span class="fg-shape fg-bar"></span>
      ${sticker('heart-storefront', { size: 300, cls: 'fg-s fg-s1', lazy: false })}
      ${sticker('modernist-tower', { size: 200, cls: 'fg-s fg-s2', lazy: false })}
      ${sticker('coffee-pastry', { size: 170, cls: 'fg-s fg-s3', lazy: false })}
      ${sticker('park', { size: 180, cls: 'fg-s fg-s4', lazy: false })}
      ${sticker('bicycle', { size: 140, cls: 'fg-s fg-s5', lazy: false })}
    </div>
  </div>
  <div class="wrap">
    <dl class="fg-stats">
      <div><dt>Independent businesses</dt><dd>${total}</dd></div>
      <div><dt>Ways to browse</dt><dd>${CATEGORIES.length}</dd></div>
      <div><dt>Neighborhoods</dt><dd>${AREAS.length}</dd></div>
      <div><dt>Order, book or shop direct</dt><dd>${direct}</dd></div>
    </dl>
  </div>
</section>

${smartCarousel(slides({ news: stories[0] }))}

<section class="cats wrap" aria-labelledby="cats-h">
  <div class="fg-head"><div><p class="kicker">Browse by category</p><h2 id="cats-h">What are you after today?</h2></div>
    <p class="fg-head-note">Every category, every count, straight from the directory. Hungry, fixing something, or booking a cut.</p></div>
  <ul class="cat-grid" role="list">
    ${CATEGORIES.map((c) => `<li><a class="cat-tile" href="/c/${c.slug}/" style="--t:${c.tint}">
        <span class="cat-stk">${catSticker(c.slug, { size: 88 })}</span>
        <span class="cat-name">${esc(c.label)}</span>
        <span class="cat-n">${count((b) => inSection(b, c.slug))} places</span>
      </a></li>`).join('')}
  </ul>
</section>

${newsletterBanner()}

${spotlightSection({ title: 'Meet your neighbors.' })}

${o ? orderDirectBanner({ n: o }) : ''}

${o || k || f ? `<section class="wrap go-band" aria-labelledby="go-h">
  <div class="go-box">
    <div class="go-copy"><p class="kicker">No app in the middle</p><h2 id="go-h">Book and shop direct, too.</h2>
    <p>These places already run their own online ordering, booking or store. We send you to theirs, so they keep the whole ticket. We never take payment.</p></div>
    <ul class="go-tiles" role="list">
      ${o ? `<li><a href="/order/#order">${sticker('takeaway', { size: 72 })}<span><b>${o}</b> order pickup online</span>${svg('arrow', 'ic-sm')}</a></li>` : ''}
      ${k ? `<li><a href="/order/#book">${sticker('calendar', { size: 72 })}<span><b>${k}</b> book appointments online</span>${svg('arrow', 'ic-sm')}</a></li>` : ''}
      ${f ? `<li><a href="/order/#shop">${sticker('shopping', { size: 72 })}<span><b>${f}</b> shop their store online</span>${svg('arrow', 'ic-sm')}</a></li>` : ''}
    </ul>
  </div>
</section>` : ''}

<section class="direct" aria-labelledby="direct-h">
  <div class="wrap">
    <div class="fg-head"><div><p class="kicker">Storefront demos</p><h2 id="direct-h">What direct ordering could look like</h2></div>
      <p class="fg-head-note"><strong>Demos only.</strong> Five working concept storefronts for Columbus originals. Not affiliated with the businesses; nothing you order or book is sent to them.</p></div>
    <div class="direct-row">
      ${prototypes
        .map((slug) => {
          const b = bySlug[slug];
          const [bg, fg, line, stk] = featuredStyle[slug];
          return `<a href="${b.demo}" class="demo-card" style="--bg:${bg};--fg:${fg}">
            <span class="demo-top"><span class="demo-badge">Demo</span>${sticker(stk, { size: 84, cls: 'demo-stk' })}</span>
            <strong>${t(b.name.replace(/ \(.*\)/, ''))}</strong>
            <span class="demo-line">${esc(line)}</span>
            <span class="demo-go">Open the demo ${svg('arrow', 'ic-sm')}</span>
          </a>`;
        })
        .join('')}
    </div>
  </div>
</section>

${eventsSection({ mode: 'weekend', id: 'this-weekend', title: 'This weekend in Columbus', kicker: 'Happening Friday to Sunday' })}

${rail('Open right now', '/explore/?open=1', directory.filter((b) => b.hours && !b.tempClosed && FOOD.includes(b.cat)).sort((a, b) => weeklyMinutes(b) - weeklyMinutes(a)).slice(0, OPEN_CANDIDATES), { kicker: 'Hungry? These are open', openOnly: true })}

<div class="rails" data-shuffle-rails>
${railsShown.map(([title, href, fn, kicker]) => rail(title, href, pick(fn), { kicker })).join('')}
</div>

<section class="wrap fg-trails" aria-labelledby="trails-h">
  <div class="fg-head"><div><p class="kicker">Local trails</p><h2 id="trails-h">More ways in</h2></div>
    <p class="fg-head-note">Short lists drawn from the directory: hours, types and neighborhoods as each place lists them.</p></div>
  <ul class="trail-rows" role="list">
    ${trails.map((x) => `<li><a class="trail-row" href="${x.href}">${sticker(x.stk, { size: 64 })}<span class="trail-txt"><span class="trail-k">${esc(x.kicker)}</span><strong>${esc(x.title)}</strong></span><span class="trail-n">${x.n} places</span><span class="trail-go">See all ${svg('arrow', 'ic-sm')}</span></a></li>`).join('')}
  </ul>
</section>

${historyBanner()}

<section class="athens" id="architecture" aria-labelledby="athens-h">
  <div class="wrap athens-head">
    <div>
      <p class="kicker">The Athens of the Prairie</p>
      <h2 id="athens-h">The buildings are famous. The people inside them make it home.</h2>
      <p>Saarinen, Pei, Venturi, Kiley, Moore. Columbus commissioned modern masters for churches, banks, schools and firehouses, and the American Institute of Architects once ranked it sixth in the nation for architectural innovation. Walk past the landmarks and you’ll find the independents keeping the lights on.</p>
      <p class="athens-links"><a class="btn btn-ghost btn-sm" href="/architecture/">Architecture guide ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost btn-sm" href="/visit/">Plan a visit ${svg('arrow', 'ic-sm')}</a></p>
    </div>
    <div class="athens-art" aria-hidden="true">${sticker('glass-pavilion', { size: 180 })}${sticker('arch-books', { size: 150 })}</div>
  </div>
  <div class="arch-track" data-rail tabindex="0" role="region" aria-label="Columbus architecture landmarks">
    ${archOrder
      .map((k) => {
        const p = PHOTOS[k];
        return `<figure class="arch"><a href="/l/${k}/"><img src="${p.src}" alt="" loading="lazy" style="object-position:${p.pos}"><figcaption><strong>${esc(p.title)}</strong><span>${esc(p.note)}</span><small>Photo: ${esc(p.credit)} · ${esc(p.license)}</small></figcaption></a></figure>`;
      })
      .join('')}
  </div>
  <p class="wrap photo-note">Stickers are illustrations inspired by Columbus, not drawings of exact buildings. Photographs are of Columbus landmarks; <a href="/credits/">photo credits</a>.</p>
</section>

${yourWay({ id: 'trip-ideas' })}

<section class="areas wrap" id="neighborhoods" aria-labelledby="areas-h">
  <div class="fg-map">
    <div class="fg-map-head">
      <div><p class="kicker">Around town</p><h2 id="areas-h">Discover Columbus by neighborhood.</h2>
      <p>${AREAS.length} parts of town, each with its own rail of places. The drawing is decoration; for real pins use the <a href="/explore/?view=map">map</a>.</p></div>
      <div class="fg-map-art" aria-hidden="true">${sticker('map-heart', { size: 150 })}${sticker('covered-bridge', { size: 120 })}</div>
    </div>
    <ul class="area-list" role="list">
      ${AREAS.map((a) => `<li><a class="area-link" href="/n/${a.slug}/"><strong>${esc(a.label)}</strong><span class="area-blurb">${esc(a.blurb)}</span><span class="area-n">${count((b) => b.area === a.slug)} places ${svg('arrow', 'ic-sm')}</span></a></li>`).join('')}
    </ul>
  </div>
</section>

<section class="spin wrap" aria-labelledby="spin-h">
  <div class="spin-box">
    <div class="spin-copy">
      <p class="kicker">Feeling lucky?</p>
      <h2 id="spin-h">Spin up somewhere new</h2>
      <p>One tap, one random independent. Pick a lane or leave it to fate.</p>
      <div class="spin-opts" role="group" aria-label="Spin within">
        <button type="button" class="pill" data-spin="" aria-pressed="true">Anything</button>
        <button type="button" class="pill" data-spin="restaurants" aria-pressed="false">Food</button>
        <button type="button" class="pill" data-spin="coffee-sweets" aria-pressed="false">Sweets</button>
        <button type="button" class="pill" data-spin="shopping" aria-pressed="false">Shops</button>
        <button type="button" class="pill" data-spin="beauty" aria-pressed="false">Self-care</button>
      </div>
      <button type="button" class="btn btn-big" data-spin-go>${svg('dice')} Spin</button>
    </div>
    <div class="spin-result" data-spin-out aria-live="polite"><img class="spin-wheel" src="/art/spin-wheel.webp" alt="" data-wheel></div>
  </div>
</section>

<section id="keep-it-local" class="keep" aria-labelledby="keep-h">
  <div class="wrap keep-grid">
    <div>
      <p class="kicker">The math</p>
      <h2 id="keep-h">Keep it in Columbus</h2>
      <p class="keep-sub">Ordering apps take a cut even when you pick the food up yourself. DoorDash charges restaurants 6 percent on pickup orders. Move the sliders to see what ordering direct could keep in local pockets.</p>
      <div class="sliders">
        <label><span><span id="k-orders-l">App pickup orders per week, per business</span><output data-out="orders"></output></span>
          <input type="range" min="10" max="300" step="10" value="60" data-in="orders" id="k-orders" aria-labelledby="k-orders-l"></label>
        <label><span><span id="k-avg-l">Average order</span><output data-out="avg"></output></span>
          <input type="range" min="10" max="60" step="1" value="24" data-in="avg" id="k-avg" aria-labelledby="k-avg-l"></label>
        <label><span><span id="k-rate-l">App pickup commission</span><output data-out="rate"></output></span>
          <input type="range" min="1" max="10" step="1" value="6" data-in="rate" id="k-rate" aria-labelledby="k-rate-l"></label>
        <label><span><span id="k-biz-l">Restaurants that switch</span><output data-out="biz"></output></span>
          <input type="range" min="1" max="${count((b) => b.cat === 'restaurants')}" step="1" value="10" data-in="biz" id="k-biz" aria-labelledby="k-biz-l"></label>
      </div>
    </div>
    <div class="keep-out">
      <div class="keep-card"><p>Kept in Columbus each year</p><p class="keep-big" data-year>$0</p><p data-week></p></div>
      <div class="keep-card"><p>Your demo orders on this device</p><p class="keep-mid" data-ledger>$0.00 ordered</p><p data-ledger-kept>Place an order in any demo storefront and it shows up here.</p></div>
      <p class="keep-fine">An estimate from the numbers above, not real sales data. Pickup commission runs 1 to 10 percent here; 6 percent is DoorDash’s pickup rate for restaurants.</p>
    </div>
  </div>
</section>

<section class="owners wrap" aria-labelledby="owners-h">
  <div class="owners-box">
    <div>
      <p class="kicker">For business owners</p>
      <h2 id="owners-h">Your place is already here. Make it yours.</h2>
      <p>Every listing can become a storefront that looks like your place, takes orders or bookings directly, and keeps the customer and the money with you.</p>
    </div>
    <ul>
      <li><strong>Your own storefront</strong> Your real menu or services, your colors, your phone number up front.</li>
      <li><strong>Orders straight to you</strong> Customers order or book directly. They pay you at pickup.</li>
      <li><strong>No app in the middle</strong> No per-order commission. Keep the money, the customer and their number.</li>
    </ul>
    ${sticker('community-heart', { size: 160, cls: 'owners-art' })}
    <div class="owners-cta"><a class="btn" href="/owners/">Claim your listing ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost" href="https://jills-diner.netlify.app">See Jill’s Diner, the first one live ${svg('arrow', 'ic-sm')}</a></div>
  </div>
</section>

</main>
${footer()}`;

  return page({
    title: 'Heart of Columbus | Local Businesses in Columbus, Indiana',
    description: `${total} independent restaurants, shops, salons and trades in Columbus, Indiana. Browse by category or neighborhood, and order direct.`,
    body,
    scripts: ['site.js', 'hub.js', 'events.js', 'banners.js', 'subscribe.js'],
    styles: ['hoc.css'],
    assets,
    ld: [siteLd()],
  });
}

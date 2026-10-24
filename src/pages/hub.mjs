// The home page: a front door to every independent business in Columbus.
import { page, esc, t } from '../layout.mjs';
import { businesses, prototypes } from '../data/businesses.mjs';
import { directory, CATEGORIES, AREAS } from '../data/directory.mjs';
import { header, footer, rail, svg, PHOTOS, artIcon, photoCredit } from '../site.mjs';

const featuredStyle = {
  'gills-barber-shop': ['#1e2a4a', '#fff', 'Live chair queue, save your spot, book a cut.', '💈'],
  tacolumbus: ['#2b1055', '#fff', 'Build birria plates and taco packs, pick a pickup time.', '🌮'],
  'big-cheese': ['#ffc93c', '#2a2118', 'Build your sub, add a combo, beat the daily countdown.', '🥪'],
  'tasty-express': ['#0e0e0e', '#fff', 'Lunch or dinner combos in three taps, text confirmation.', '🥡'],
  rohdes: ['#d7263d', '#fff', 'Build a breakfast: eggs your way, meat, potatoes, biscuit.', '🍳'],
};

const pick = (fn, n = 14) => directory.filter(fn).slice(0, n);
const inSub = (...subs) => (b) => subs.includes(b.sub);

export function renderHub({ assets }) {
  const bySlug = Object.fromEntries(businesses.map((b) => [b.slug, b]));
  const count = (fn) => directory.filter(fn).length;
  const total = directory.length;

  const quick = [
    ['🌮 Tacos', '/c/restaurants/mexican/'], ['☕ Coffee', '/c/coffee-sweets/'], ['💈 Barbers', '/c/beauty/barbers/'],
    ['💅 Nails', '/c/beauty/nails/'], ['🔧 Plumbers', '/c/home-services/hvac-plumbing/'], ['🔩 Mechanics', '/c/auto/auto-repair/'],
    ['🍺 Breweries', '/c/bars/'], ['💍 Weddings', '/c/events/'],
  ];

  const archOrder = ['firstchristian', 'northchristian', 'irwin', 'library', 'miller', 'firestation', 'cityhall', 'bridge', 'courthouse', 'commons'];

  const body = `
${header()}
<main id="main">

<section class="hero">
  <div class="hero-float" aria-hidden="true">
    ${[['arch', 1], ['spire', 2], ['gear', 3], ['bridge', 4], ['courthouse', 5], ['firestation', 6], ['tree', 7], ['sparkle-1', 8], ['sparkle-2', 9], ['sparkle-3', 10]]
      .map(([n, i]) => `<img class="fl fl-${i}" src="/art/float-${n}.png" alt="" onerror="this.remove()">`).join('')}
  </div>
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="kicker kicker-pill">Columbus, Indiana · The Athens of the Prairie</p>
      <h1>Built by legends.<br><span class="hl">Run by neighbors.</span></h1>
      <p class="lede">${total} independent businesses and not a single chain. Find the taqueria, the barber, the plumber and the bookshop that make this town home.</p>
      <form class="big-search" action="/explore/" role="search" data-typeahead>
        ${svg('search')}
        <input name="q" type="search" autocomplete="off" placeholder="Search ${total} local businesses" aria-label="Search local businesses" data-rotate='["Search birria, boba, biscuits…","Search barbers, nails, lashes…","Search plumbers, roofers, mechanics…","Search 25th St, downtown, West Hill…"]'>
        <button type="submit">Search</button>
        <div class="ta-list" data-ta-list hidden></div>
      </form>
      <div class="quick">${quick.map(([l, h]) => `<a href="${h}">${l}</a>`).join('')}</div>
    </div>
    <div class="hero-art" aria-label="Columbus landmarks">
      ${['firstchristian', 'irwin', 'library']
        .map((k, i) => {
          const p = PHOTOS[k];
          return `<figure class="polaroid pol-${i + 1}"><img src="${p.src}" alt="${esc(p.title)}" style="object-position:${p.pos}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}><figcaption>${esc(p.title)}<small>${esc(p.note)}</small></figcaption></figure>`;
        })
        .join('')}
    </div>
  </div>
  <img class="skyline" src="/art/hero-skyline.png" alt="" aria-hidden="true" onerror="this.remove()">
  <div class="wrap stats">
    <div><b>${total}</b><span>independent businesses</span></div>
    <div><b>${CATEGORIES.length}</b><span>ways to browse</span></div>
    <div><b>${AREAS.length}</b><span>neighborhoods</span></div>
    <div><b>0</b><span>chains or franchises</span></div>
  </div>
</section>

<section class="cats wrap" aria-labelledby="cats-h">
  <div class="sec-head"><p class="kicker">Browse by category</p><h2 id="cats-h">What are you hungry for? Or fixing? Or booking?</h2></div>
  <div class="cat-grid">
    ${CATEGORIES.map(
      (c) => `<a class="cat-tile" href="/c/${c.slug}/" style="--c:${c.color};--t:${c.tint}">
        ${artIcon(c.slug, c.emoji, 'cat-ic')}
        <span class="cat-name">${esc(c.label)}</span>
        <span class="cat-n">${count((b) => b.cat === c.slug)} places</span>
      </a>`,
    ).join('')}
  </div>
</section>

${(() => {
  const o = count((b) => b.order.length), k = count((b) => b.book.length), f = count((b) => b.feed || b.store);
  if (!o && !k && !f) return '';
  return `<section class="wrap go-band" aria-labelledby="go-h">
    <div class="go-box">
      <div><p class="kicker">No app in the middle</p><h2 id="go-h">Order, book and shop straight from the source</h2>
      <p>These places already run their own online ordering, booking or store. We send you to theirs, so they keep the whole ticket.</p></div>
      <div class="go-tiles">
        ${o ? `<a href="/order/#order"><span>🥡</span><b>${o}</b> order pickup online</a>` : ''}
        ${k ? `<a href="/order/#book"><span>📅</span><b>${k}</b> book appointments online</a>` : ''}
        ${f ? `<a href="/order/#shop"><span>🛍️</span><b>${f}</b> shop their store online</a>` : ''}
      </div>
    </div>
  </section>`;
})()}

<section class="direct" aria-labelledby="direct-h">
  <div class="wrap">
    <div class="sec-head sec-head-row">
      <div><p class="kicker">Skip the app fees</p><h2 id="direct-h">Order straight from the counter</h2>
      <p class="sub">Five working storefront demos for Columbus originals. Nothing is sent to the businesses; it's a preview of what direct ordering could look like.</p></div>
    </div>
    <div class="direct-row">
      ${prototypes
        .map((slug) => {
          const b = bySlug[slug];
          const [bg, fg, line, emo] = featuredStyle[slug];
          return `<a href="${b.demo}" class="demo-card" style="--bg:${bg};--fg:${fg}">
            <span class="demo-top"><span class="demo-badge">Demo</span><span class="demo-emoji" aria-hidden="true">${emo}</span></span>
            <strong>${t(b.name.replace(/ \(.*\)/, ''))}</strong>
            <span class="demo-line">${esc(line)}</span>
            <span class="demo-go">Open the storefront ${svg('arrow', 'ic-sm')}</span>
          </a>`;
        })
        .join('')}
    </div>
  </div>
</section>

${rail('Open right now', '/explore/?open=1', directory.filter((b) => b.hours && !b.tempClosed && ['restaurants', 'coffee-sweets', 'bars'].includes(b.cat)).slice(0, 150), { kicker: 'Hungry? These are open', openOnly: true })}

<div class="rails" data-shuffle-rails>
${rail('The taco trail', '/c/restaurants/mexican/', pick(inSub('mexican')), { kicker: 'Restaurants' })}
${rail('Coffee, donuts & boba', '/c/coffee-sweets/', pick(inSub('coffee-sweets')), { kicker: 'Coffee & sweets' })}
${rail('Downtown, block by block', '/n/downtown/', pick((b) => b.area === 'downtown' && ['restaurants', 'coffee-sweets', 'bars', 'shopping', 'beauty'].includes(b.cat), 18), { kicker: 'Neighborhood' })}
${rail('Pints & pours', '/c/bars/', pick(inSub('bars')), { kicker: 'Bars & breweries' })}
${rail('Fresh cuts', '/c/beauty/barbers/', pick(inSub('barbers')), { kicker: 'Barbershops' })}
${rail('Nails, lashes & a spa day', '/c/beauty/', pick(inSub('nails', 'spa')), { kicker: 'Beauty' })}
${rail('Shop small on purpose', '/c/shopping/', pick(inSub('boutiques', 'gifts', 'antiques')), { kicker: 'Shopping' })}
${rail('Call before it leaks', '/c/home-services/hvac-plumbing/', pick(inSub('hvac-plumbing', 'electric')), { kicker: 'Home services' })}
${rail('Your wedding team', '/c/events/', pick((b) => b.sub === 'events' || /bridal|tux|flower|florist|bloom|photograph/i.test(b.name + ' ' + b.type), 16), { kicker: 'Events & weddings' })}
${rail('When the check engine light comes on', '/c/auto/auto-repair/', pick(inSub('auto-repair')), { kicker: 'Auto' })}
${rail('Good dogs welcome', '/c/pets/', pick(inSub('pets')), { kicker: 'Pets' })}
</div>

<section class="athens" aria-labelledby="athens-h">
  <div class="wrap athens-head">
    <p class="kicker kicker-light">The Athens of the Prairie</p>
    <h2 id="athens-h">The buildings are famous.<br>The people inside them make it home.</h2>
    <p>Saarinen, Pei, Venturi, Kiley, Moore. Columbus commissioned modern masters for churches, banks, schools and firehouses, and the American Institute of Architects once ranked it sixth in the nation for architectural innovation. Walk past the landmarks and you'll find the independents keeping the lights on.</p>
  </div>
  <div class="arch-track" data-rail>
    ${archOrder
      .map((k) => {
        const p = PHOTOS[k];
        return `<figure class="arch"><img src="${p.src}" alt="${esc(p.title)}" loading="lazy" style="object-position:${p.pos}"><figcaption><strong>${esc(p.title)}</strong><span>${esc(p.note)}</span><small>Photo: ${esc(p.credit)} · ${esc(p.license)}</small></figcaption></figure>`;
      })
      .join('')}
  </div>
</section>

<section class="areas wrap" id="neighborhoods" aria-labelledby="areas-h">
  <div class="sec-head"><p class="kicker">Around town</p><h2 id="areas-h">Pick a neighborhood and wander</h2></div>
  <div class="area-grid">
    ${AREAS.map((a, i) => {
      const p = PHOTOS[a.photo];
      const n = count((b) => b.area === a.slug);
      return `<a class="area-tile${i < 2 ? ' area-big' : ''}" href="/n/${a.slug}/">
        <img src="${p.src}" alt="" loading="lazy" style="object-position:${p.pos}">
        <span class="area-shade"></span>
        <img class="area-badge" src="/art/area-${a.slug === 'business-parks' ? 'business-parks' : a.slug}.png" alt="" loading="lazy" onerror="this.remove()">
        <span class="area-txt"><strong>${esc(a.label)}</strong><span>${n} places</span></span>
      </a>`;
    }).join('')}
  </div>
  <p class="photo-note">Landmark photos are of Columbus, not of the businesses. <a href="/credits/">Photo credits</a>.</p>
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
    <div class="spin-result" data-spin-out aria-live="polite"><img class="spin-wheel" src="/art/spin-wheel.png" alt="" data-wheel></div>
  </div>
</section>

<section id="keep-it-local" class="keep" aria-labelledby="keep-h">
  <div class="wrap keep-grid">
    <div>
      <p class="kicker kicker-light">The math</p>
      <h2 id="keep-h">Keep it in Columbus</h2>
      <p class="keep-sub">Delivery apps commonly charge restaurants 15 to 30 percent of each order. Move the sliders to see what direct ordering could keep in local pockets.</p>
      <div class="sliders">
        <label><span><span>App orders per week, per business</span><output data-out="orders"></output></span>
          <input type="range" min="10" max="300" step="10" value="60" data-in="orders"></label>
        <label><span><span>Average order</span><output data-out="avg"></output></span>
          <input type="range" min="10" max="60" step="1" value="24" data-in="avg"></label>
        <label><span><span>App commission</span><output data-out="rate"></output></span>
          <input type="range" min="15" max="30" step="1" value="25" data-in="rate"></label>
        <label><span><span>Restaurants that switch</span><output data-out="biz"></output></span>
          <input type="range" min="1" max="${count((b) => b.cat === 'restaurants')}" step="1" value="10" data-in="biz"></label>
      </div>
    </div>
    <div class="keep-out">
      <div class="keep-card"><p>Kept in Columbus each year</p><p class="keep-big" data-year>$0</p><p data-week></p></div>
      <div class="keep-card"><p>Your demo orders on this device</p><p class="keep-mid" data-ledger>$0.00 ordered</p><p data-ledger-kept>Place an order in any demo storefront and it shows up here.</p></div>
      <p class="keep-fine">An estimate from the numbers above, not real sales data. Commission range from common delivery-app restaurant plans.</p>
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
    <img class="owners-art" src="/art/owners-storefront.png" alt="" loading="lazy">
    <div class="owners-cta"><a class="btn" href="/owners/">Claim your listing ${svg('arrow', 'ic-sm')}</a><a class="btn btn-ghost" href="https://jills-diner.netlify.app">See Jill's Diner, the first one live ${svg('arrow', 'ic-sm')}</a></div>
  </div>
</section>

</main>
${footer()}`;

  return page({
    title: 'Heart of Columbus | Every independent business in Columbus, Indiana',
    description: `${total} independent restaurants, shops, salons and trades in Columbus, Indiana. No chains. Browse by category or neighborhood, and order direct.`,
    body,
    scripts: ['site.js', 'hub.js'],
    styles: ['hoc.css'],
    assets,
  });
}

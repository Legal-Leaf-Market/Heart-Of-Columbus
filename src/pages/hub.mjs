import { page, footer, esc, t } from '../layout.mjs';
import { businesses, prototypes, BADGES } from '../data/businesses.mjs';
import { landscape, VERTICALS } from '../data/landscape.mjs';

const heart = (cls = 'size-8') =>
  `<svg viewBox="0 0 32 32" class="${cls}" aria-hidden="true"><path d="M16 28S3 20.2 3 11.6A6.6 6.6 0 0 1 16 8.4a6.6 6.6 0 0 1 13 3.2C29 20.2 16 28 16 28z" fill="var(--brand)" stroke="var(--ink)" stroke-width="2"/><path d="M9 12.5h14M11 16.5h10M13 20.5h6" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;

const badgeIcon = {
  direct: '<path d="M4 6h16l-1.5 9H5.5zM4 6 3 3H1M8 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>',
  booking: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  phone: '<path d="M6.6 3.5h2.8l1.5 4.2-2.1 1.5a12.5 12.5 0 0 0 6 6l1.5-2.1 4.2 1.5v2.8a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2z"/>',
  heritage: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/>',
  walkins: '<circle cx="12" cy="5" r="2"/><path d="m10 22 2-7 3 3v4M8 13l2-5h3l3 4 3 1"/>',
};
const icon = (k) =>
  `<svg viewBox="0 0 24 24" class="size-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${badgeIcon[k]}</svg>`;

// Don't let a pitch read as a live feature: Heart of Columbus demos say so,
// and Jill's ordering is built but not switched on yet.
const badgeSuffix = (b, k) =>
  b.slug === 'jills-diner' && k === 'direct' ? ' (soon)' : b.demo && (k === 'direct' || k === 'booking') ? ' (demo)' : '';

const tel = (p) => 'tel:+1' + p.replace(/\D/g, '');

function card(b) {
  const search = [b.name, b.focus, b.address, ...b.area, ...b.filters, ...b.badges.map((k) => BADGES[k].label)].join(' ');
  return `
  <article class="biz-card flex flex-col rounded-2xl border-2 border-ink bg-surface p-5 shadow-[4px_4px_0_var(--ink)]"
    data-vertical="${b.vertical}" data-filters="${esc(b.filters.join(' '))}" data-search="${esc(search)}">
    <div class="flex items-start justify-between gap-3">
      <h3 class="font-display text-xl font-semibold leading-tight">${t(b.name)}</h3>
      ${b.demo ? '<span class="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold uppercase tracking-wide">Demo</span>' : ''}
    </div>
    <p class="mt-2 text-[15px] leading-snug text-muted">${t(b.focus)}</p>
    <p class="mt-3 text-sm font-semibold">${t(b.address)}</p>
    <ul class="mt-3 flex flex-wrap gap-1.5" aria-label="Features">
      ${b.badges
        .map(
          (k) =>
            `<li class="inline-flex items-center gap-1 rounded-full bg-ink/5 px-2.5 py-1 text-xs font-semibold" title="${esc(BADGES[k].hint)}">${icon(k)}${esc(BADGES[k].label + badgeSuffix(b, k))}</li>`,
        )
        .join('')}
    </ul>
    ${b.note ? `<p class="mt-3 text-sm text-muted">${t(b.note)}</p>` : ''}
    <div class="mt-auto pt-4 flex flex-wrap gap-2">
      ${b.demo ? `<a href="${b.demo}" class="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-ink">${b.vertical === 'service' ? 'Book (demo)' : 'Order (demo)'}</a>` : ''}
      ${b.website ? `<a href="${esc(b.website)}" class="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold" target="_blank" rel="noopener">Website</a>` : ''}
      ${b.phone ? `<a href="${tel(b.phone)}" class="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold">Call ${esc(b.phone)}</a>` : ''}
    </div>
  </article>`;
}

// A plain listing for the wider landscape: only what public listings show.
const mapLink = (l) =>
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${l.name}, ${l.address ? l.address + ', ' : ''}Columbus, IN`);
const verticalLabel = Object.fromEntries(VERTICALS.map((v) => [v.id, v.label]));

function listingCard(l) {
  const search = [l.name, l.type, l.address, l.area, l.filter, verticalLabel[l.vertical]].join(' ');
  return `
  <article class="biz-card flex flex-col rounded-2xl border-2 border-ink bg-surface p-5 shadow-[4px_4px_0_var(--ink)]"
    data-vertical="${l.vertical}" data-filters="${esc(l.filter)}" data-search="${esc(search)}" hidden>
    <h3 class="font-display text-xl font-semibold leading-tight">${t(l.name)}</h3>
    <p class="mt-2 text-[15px] leading-snug text-muted">${t(l.type)}${l.area ? ' · ' + esc(l.area) : ''}</p>
    ${l.address ? `<p class="mt-3 text-sm font-semibold">${t(l.address)}</p>` : ''}
    <div class="mt-auto pt-4 flex flex-wrap gap-2">
      ${l.phone ? `<a href="${tel(l.phone)}" class="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold">Call ${esc(l.phone)}</a>` : ''}
      <a href="${esc(mapLink(l))}" class="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold" target="_blank" rel="noopener">Find it</a>
    </div>
  </article>`;
}

const featuredStyle = {
  'gills-barber-shop': 'bg-[#1e2a4a] text-white',
  tacolumbus: 'bg-[#2b1055] text-white',
  'big-cheese': 'bg-[#ffc93c] text-[#2a2118]',
  'tasty-express': 'bg-[#0e0e0e] text-white',
  rohdes: 'bg-[#d7263d] text-white',
};
const featuredLine = {
  'gills-barber-shop': 'Live chair queue, save your spot, book a cut.',
  tacolumbus: 'Build birria plates and taco packs, pick a pickup time.',
  'big-cheese': 'Build your sub, add a combo, beat the daily countdown.',
  'tasty-express': 'Lunch or dinner combos in three taps, text confirmation.',
  rohdes: 'Build a breakfast: eggs your way, meat, potatoes, biscuit.',
};

export function renderHub({ assets }) {
  const bySlug = Object.fromEntries(businesses.map((b) => [b.slug, b]));
  const filterChips = (list, vertical) =>
    list
      .map(
        (f, i) =>
          `<button type="button" class="chip text-sm" data-filter="${f.id}" data-for="${vertical}" aria-pressed="${i === 0}">${esc(f.label)}</button>`,
      )
      .join('');

  const body = `
<header class="border-b-2 border-ink bg-paper/95 backdrop-blur sticky top-0 z-40">
  <div class="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between gap-4">
    <a href="/" class="flex items-center gap-2 font-display text-xl font-bold">${heart()}<span>Heart of Columbus</span></a>
    <nav class="hidden md:flex gap-6 font-semibold" aria-label="Main">
      <a href="#directory" data-jump="eat" class="hover:underline underline-offset-4">Eat Local</a>
      <a href="#directory" data-jump="service" class="hover:underline underline-offset-4">Book Services</a>
      <a href="#keep-it-local" class="hover:underline underline-offset-4">Keep it local</a>
    </nav>
  </div>
</header>

<main id="main">
<section class="relative overflow-hidden">
  <div class="mx-auto max-w-6xl px-4 pt-14 pb-16 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
    <div>
      <p class="font-semibold uppercase tracking-[0.2em] text-sm text-muted">Columbus, Indiana</p>
      <h1 class="mt-3 font-display text-5xl sm:text-6xl font-bold leading-[0.95] tracking-tight">Order and book straight from the people who make Columbus.</h1>
      <p class="mt-5 text-lg max-w-xl text-muted">Delivery and booking apps can take a big bite of every ticket. Heart of Columbus puts the town's independent restaurants, shops, salons and trades in one place, with direct ordering and booking that keeps the money here.</p>
      <div class="mt-7 flex flex-wrap gap-3">
        <a href="#directory" data-jump="eat" class="rounded-full bg-brand px-6 py-3 font-bold text-brand-ink border-2 border-ink shadow-[3px_3px_0_var(--ink)]">Eat Local</a>
        <a href="#directory" data-jump="service" class="rounded-full bg-surface px-6 py-3 font-bold border-2 border-ink shadow-[3px_3px_0_var(--ink)]">Book Services</a>
      </div>
    </div>
    <div class="relative" aria-hidden="true">
      <div class="grid grid-cols-3 gap-3 rotate-[-3deg]">
        ${['bg-brand', 'bg-accent', 'bg-ink', 'bg-[#2f6b3b]', 'bg-brand', 'bg-[#1e2a4a]', 'bg-accent', 'bg-[#ff2e88]', 'bg-brand']
          .map((c, i) => `<div class="${c} aspect-square rounded-2xl border-2 border-ink ${i === 4 ? 'grid place-items-center' : ''}">${i === 4 ? heart('size-14 drop-shadow') : ''}</div>`)
          .join('')}
      </div>
    </div>
  </div>
</section>

<section class="border-y-2 border-ink bg-surface" aria-labelledby="featured-h">
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h2 id="featured-h" class="font-display text-3xl font-bold">Try the storefronts</h2>
    <p class="mt-2 text-muted max-w-2xl">Five working demos of what direct ordering and booking could look like for a Columbus original. Nothing is sent to the businesses; it's a preview to show them.</p>
    <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      ${prototypes
        .map((slug) => {
          const b = bySlug[slug];
          return `<a href="${b.demo}" class="group flex flex-col justify-between rounded-2xl border-2 border-ink p-5 min-h-44 shadow-[4px_4px_0_var(--ink)] transition hover:-translate-y-1 ${featuredStyle[slug]}">
            <span class="font-display text-xl font-bold leading-tight">${t(b.name.replace(/ \(.*\)/, ''))}</span>
            <span class="mt-3 text-sm opacity-90">${esc(featuredLine[slug])}</span>
            <span class="mt-4 text-sm font-bold underline underline-offset-4">Open the demo →</span>
          </a>`;
        })
        .join('')}
    </div>
  </div>
</section>

<section id="directory" class="scroll-mt-20" aria-labelledby="dir-h">
  <div class="mx-auto max-w-6xl px-4 py-14">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h2 id="dir-h" class="font-display text-4xl font-bold">The directory</h2>
      <div role="tablist" aria-label="What are you looking for?" class="flex w-full flex-wrap gap-1 rounded-3xl border-2 border-ink bg-surface p-1">
        ${VERTICALS.map((v, i) => `<button role="tab" type="button" data-tab="${v.id}" aria-selected="${i === 0}" class="rounded-full px-4 py-2 font-bold aria-selected:bg-ink aria-selected:text-paper">${esc(v.label)}</button>`).join('')}
      </div>
      <p class="w-full text-sm font-semibold text-muted">${businesses.length + landscape.length} independent Columbus businesses and counting. No chains.</p>
    </div>
    <label class="mt-6 block">
      <span class="sr-only">Search the directory</span>
      <input type="search" data-search placeholder="Search by name, food or street: “25th St”, “birria”, “downtown”…"
        class="w-full rounded-2xl border-2 border-ink bg-surface px-5 py-4 text-lg shadow-[3px_3px_0_var(--ink)]">
    </label>
    ${VERTICALS.map((v, i) => `<div class="mt-4 flex flex-wrap gap-2${i ? ' hidden' : ''}" data-chips="${v.id}">${filterChips(v.filters, v.id)}</div>`).join('\n    ')}
    <p class="mt-4 text-sm text-muted" data-count aria-live="polite"></p>
    <div class="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" data-grid>
      ${businesses.map(card).join('')}
      ${landscape.map(listingCard).join('')}
    </div>
    <button type="button" data-more class="mx-auto mt-6 block hidden rounded-full border-2 border-ink bg-surface px-6 py-3 font-bold shadow-[3px_3px_0_var(--ink)]"></button>
    <p class="mt-6 hidden rounded-2xl border-2 border-dashed border-ink/30 p-6 text-center text-muted" data-empty>Nothing matches yet. Try a street name like “State St” or a food like “pizza”.</p>
  </div>
</section>

<section id="keep-it-local" class="scroll-mt-20 bg-ink text-white" aria-labelledby="keep-h">
  <div class="mx-auto max-w-6xl px-4 py-14 grid gap-10 lg:grid-cols-2">
    <div>
      <h2 id="keep-h" class="font-display text-4xl font-bold">Keep it in Columbus</h2>
      <p class="mt-3 text-white/80 max-w-lg">Delivery apps commonly charge restaurants 15 to 30 percent of each order. Move the sliders to see what direct ordering could keep in local pockets.</p>
      <div class="mt-6 grid gap-5">
        <label class="grid gap-2"><span class="flex justify-between font-semibold"><span>App orders per week, per business</span><output data-out="orders"></output></span>
          <input type="range" min="10" max="300" step="10" value="60" data-in="orders" class="accent-[var(--accent)]"></label>
        <label class="grid gap-2"><span class="flex justify-between font-semibold"><span>Average order</span><output data-out="avg"></output></span>
          <input type="range" min="10" max="60" step="1" value="24" data-in="avg" class="accent-[var(--accent)]"></label>
        <label class="grid gap-2"><span class="flex justify-between font-semibold"><span>App commission</span><output data-out="rate"></output></span>
          <input type="range" min="15" max="30" step="1" value="25" data-in="rate" class="accent-[var(--accent)]"></label>
        <label class="grid gap-2"><span class="flex justify-between font-semibold"><span>Businesses that switch</span><output data-out="biz"></output></span>
          <input type="range" min="1" max="${businesses.filter((b) => b.vertical === 'eat').length}" step="1" value="5" data-in="biz" class="accent-[var(--accent)]"></label>
      </div>
    </div>
    <div class="grid content-start gap-4">
      <div class="rounded-3xl border-2 border-white/20 bg-white/5 p-6">
        <p class="text-white/70 font-semibold">Kept in Columbus each year</p>
        <p class="mt-1 font-display text-6xl font-bold text-accent" data-year>$0</p>
        <p class="mt-2 text-white/70" data-week></p>
      </div>
      <div class="rounded-3xl border-2 border-white/20 bg-white/5 p-6">
        <p class="text-white/70 font-semibold">Your demo orders on this device</p>
        <p class="mt-1 font-display text-3xl font-bold" data-ledger>$0.00 ordered</p>
        <p class="mt-1 text-white/70" data-ledger-kept>Place an order in any demo storefront and it shows up here.</p>
      </div>
      <p class="text-sm text-white/60">An estimate from the numbers above, not real sales data. Commission range from common delivery-app restaurant plans.</p>
    </div>
  </div>
</section>

<section class="mx-auto max-w-6xl px-4 py-14" aria-labelledby="owners-h">
  <h2 id="owners-h" class="font-display text-3xl font-bold">For business owners</h2>
  <div class="mt-6 grid gap-5 md:grid-cols-3">
    ${[
      ['Your own storefront', 'A page that looks like your place, with your real menu or services, and your phone number front and center.'],
      ['Orders straight to you', 'Customers order or book directly. A tablet at the counter chimes the second one comes in. They pay you at pickup.'],
      ['No app in the middle', 'No per-order commission to a delivery company. Keep the money, the customer, and their phone number.'],
    ]
      .map(
        ([h, p]) =>
          `<div class="rounded-2xl border-2 border-ink bg-surface p-6"><h3 class="font-display text-xl font-bold">${esc(h)}</h3><p class="mt-2 text-muted">${esc(p)}</p></div>`,
      )
      .join('')}
  </div>
  <p class="mt-6 text-muted">Jill's Diner on National Road is the first: its own site and direct ordering are built. <a class="font-semibold underline underline-offset-4" href="https://jills-diner.netlify.app">See it →</a></p>
</section>
</main>
${footer()}`;

  return page({
    title: 'Heart of Columbus | Order and book local in Columbus, Indiana',
    description: "Columbus, Indiana's independent restaurants, shops, salons and trades in one place, with direct ordering and booking that keeps the money local.",
    body,
    scripts: ['hub.js'],
    assets,
  });
}

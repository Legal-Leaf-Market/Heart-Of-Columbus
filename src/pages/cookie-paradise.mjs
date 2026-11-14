import { page, footer, demoBanner, esc } from '../layout.mjs';
import { OWN_FACTS } from '../data/own-facts.mjs';

// Cookie Paradise pickup demo, made for the owner to try (he asked to cross
// promote; pickup through Heart of Columbus is not switched on for him).
// Facts: the menu, prices and photos are read live from their own Shopify
// store through /api/shop, so nothing here is typed in. Address and hours come
// from their Contact & Hours page (src/data/own-facts.mjs, checked 2026-11-13):
// 3950 25th St, the trailer in the Holiday Center lot; Tuesday to Friday 10 AM
// to 6 PM, Saturday 10 AM to 8 PM. The Thanksgiving box note is from that
// product's own listing: preorder pickup Wednesday, November 25, 9 AM to 6 PM.
// Orders make a demo pickup ticket that Cookie Paradise never sees.
const own = OWN_FACTS['cookie-paradise-llc'];
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const hhmm = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

const data = {
  slug: 'cookie-paradise',
  feed: 'cookie-paradise-llc',
  business: 'Cookie Paradise',
  phone: '(812) 508-9675',
  address: own.address,
  hours: Object.fromEntries(own.hours.map(([d, o, c]) => [DAYS[d], [hhmm(o), hhmm(c)]])),
  notes: { 'thanksgiving-cookie-boxes': 'Preorder: pickup Wednesday, November 25, 9 AM to 6 PM' },
};

export const cookieParadise = {
  slug: 'cookie-paradise',
  render: ({ assets }) =>
    page({
      title: 'Cookie Paradise | Order ahead, pick up at the trailer | Columbus, Indiana (demo)',
      description: 'Concept demo: pickup ordering for Cookie Paradise on 25th Street, with their live menu and a real Heart of Columbus pickup ticket.',
      theme: 'theme-cookie',
      assets,
      scripts: ['cookie-paradise.js'],
      data,
      body: `
${demoBanner(data.business)}
<header class="bg-brand text-brand-ink border-b-2 border-ink">
  <div class="mx-auto max-w-5xl px-4 pt-6 pb-10">
    <div class="flex items-center justify-between gap-3">
      <p class="font-display text-2xl">Cookie Paradise</p>
      <a href="tel:+18125089675" class="rounded-full bg-ink text-paper px-4 py-2 font-bold">Call</a>
    </div>
    <p class="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper px-3 py-1 text-sm font-bold">📍 ${esc(data.address)}, Holiday Center lot</p>
    <h1 class="mt-4 font-display text-5xl sm:text-6xl leading-[0.95]">Order ahead.<br>Grab your cookies at the trailer.</h1>
    <p class="mt-4 text-lg max-w-xl">Pick your favorites, choose a pickup time, and they are boxed up when you get there. Pay when you pick up.</p>
    <p class="mt-5 flex flex-wrap gap-2 text-sm font-bold">
      <span class="rounded-full bg-paper border-2 border-ink px-3 py-1">Tuesday to Friday, 10 AM to 6 PM</span>
      <span class="rounded-full bg-paper border-2 border-ink px-3 py-1">Saturday, 10 AM to 8 PM</span>
    </p>
  </div>
</header>

<main id="main" class="bg-paper">
  <section class="mx-auto max-w-5xl px-4 py-8">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <h2 class="font-display text-4xl">Today’s cookies</h2>
      <p class="text-sm text-muted">Live from their own store. Only what is in stock.</p>
    </div>
    <div class="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" data-menu>
      <p class="col-span-full text-muted">Loading the menu…</p>
    </div>
  </section>
  <section class="mx-auto max-w-5xl px-4 pb-12">
    <h2 class="font-display text-3xl">How pickup works</h2>
    <ol class="mt-4 grid gap-3 sm:grid-cols-3">
      <li class="rounded-3xl border-2 border-ink bg-surface p-5"><span class="font-display text-3xl text-accent">1</span><p class="mt-1 font-semibold">Tap your cookies and pick a time.</p><p class="text-sm text-muted">Times follow the trailer’s posted hours.</p></li>
      <li class="rounded-3xl border-2 border-ink bg-surface p-5"><span class="font-display text-3xl text-accent">2</span><p class="mt-1 font-semibold">You get a pickup ticket.</p><p class="text-sm text-muted">The trailer sees it on its counter board and marks it ready.</p></li>
      <li class="rounded-3xl border-2 border-ink bg-surface p-5"><span class="font-display text-3xl text-accent">3</span><p class="mt-1 font-semibold">Show the ticket, pay, enjoy.</p><p class="text-sm text-muted">No app fees, no middleman.</p></li>
    </ol>
  </section>
</main>
<div class="bg-paper h-20"></div>
${footer('Menu, prices and photos read live from Cookie Paradise’s own online store. Hours and address from their Contact &amp; Hours page, checked November 13, 2026.')}`,
    }),
};

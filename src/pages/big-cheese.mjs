import { page, footer, demoBanner, esc, t } from '../layout.mjs';

// Facts: 2403 Cottage Ave, (812) 376-3567, open Mon to Fri 9 to 4 and Sat 10
// to 2, cash only, since 1977. Listed prices: Big Cheese Special $9.75,
// Italian Sub $6.75, Pizza Sub $6.75, Reuben $9.90, Big Turkey Club $9.90,
// brownie $0.75. Build-your-own pricing, chips, pickle, lemonade and the
// daily special are samples for the pitch.
const data = {
  slug: 'big-cheese',
  business: 'The Big Cheese',
  phone: '(812) 376-3567',
  hours: { Monday: ['09:00', '16:00'], Tuesday: ['09:00', '16:00'], Wednesday: ['09:00', '16:00'], Thursday: ['09:00', '16:00'], Friday: ['09:00', '16:00'], Saturday: ['10:00', '14:00'] },
  signatures: [
    { id: 'special', name: 'Big Cheese Special', cents: 975, desc: 'Baked ham, turkey breast, roast beef, Swiss and Colby, lettuce, tomato and mayo.' },
    { id: 'italian', name: 'Italian Sub', cents: 675, desc: 'Baked ham, salami, mozzarella and creamy Italian dressing.' },
    { id: 'pizza', name: 'Pizza Sub', cents: 675, desc: 'Baked ham, pepperoni, mozzarella and pizza sauce.' },
    { id: 'reuben', name: 'Reuben', cents: 990, desc: 'Corned beef, kraut, Swiss and homemade 1000 Island.' },
    { id: 'turkey-club', name: 'Big Turkey Club', cents: 990, desc: 'Turkey breast, pepper jack, bacon, lettuce and tomato.' },
  ],
  build: {
    base: 675,
    extraMeat: 150,
    extraCheese: 75,
    breads: ['White sub roll', 'Wheat sub roll', 'Rye'],
    meats: ['Baked ham', 'Turkey breast', 'Roast beef', 'Salami', 'Pepperoni', 'Corned beef'],
    cheeses: ['Swiss', 'Colby', 'Mozzarella', 'Pepper jack'],
    toppings: ['Lettuce', 'Tomato', 'Onion', 'Pickles', 'Banana peppers'],
    dressings: ['Mayo', 'Creamy Italian', 'Homemade 1000 Island', 'Mustard'],
  },
  combo: [
    { id: 'chips', name: 'Chips', cents: 125, sample: true },
    { id: 'pickle', name: 'Pickle spear', cents: 75, sample: true },
    { id: 'lemonade', name: 'Homemade lemonade', cents: 250, sample: true },
    { id: 'brownie', name: 'Brownie', cents: 75 },
  ],
  // Sample rotation for the daily-special banner: one signature sub a day, $1 off.
  specials: { 1: 'reuben', 2: 'italian', 3: 'turkey-club', 4: 'pizza', 5: 'special', 6: 'italian' },
};

export const bigCheese = {
  slug: 'big-cheese',
  render: ({ assets }) =>
    page({
      title: 'The Big Cheese | Subs on Cottage Avenue | Columbus, Indiana (demo)',
      description: 'Concept demo: build your own sub at The Big Cheese on Cottage Avenue, add a combo, and order ahead for pickup.',
      theme: 'theme-cheese',
      assets,
      scripts: ['big-cheese.js'],
      data,
      body: `
${demoBanner(data.business)}
<div data-special class="bg-ink text-white"></div>
<header class="bg-accent border-b-4 border-ink">
  <div class="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
    <div>
      <p class="font-bold uppercase tracking-[0.2em] text-sm">Cottage Avenue · Since 1977</p>
      <h1 class="mt-2 font-display text-6xl sm:text-7xl leading-[0.9]">The Big Cheese</h1>
      <p class="mt-4 text-lg max-w-lg">Big subs, built the way you like them. Order ahead, skip the line at lunch, pay at the counter.</p>
      <p class="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold border-2 border-ink"><span>Cash only at the counter</span></p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="#build" class="rounded-full bg-brand text-white px-6 py-3 font-display text-xl border-2 border-ink shadow-[4px_4px_0_var(--ink)]">Build your sub</a>
        <a href="tel:+18123763567" class="rounded-full bg-white px-6 py-3 font-display text-xl border-2 border-ink shadow-[4px_4px_0_var(--ink)]">Call ${esc(data.phone)}</a>
      </div>
    </div>
    <svg viewBox="0 0 260 150" class="w-full max-w-sm mx-auto drop-shadow-[6px_6px_0_var(--ink)]" aria-hidden="true">
      <path d="M20 70c0-30 40-46 110-46s110 16 110 46z" fill="#e8b062" stroke="#2a2118" stroke-width="5"/>
      <path d="M22 70l20 18 20-16 20 18 20-16 20 18 20-16 20 18 20-16 20 18 20-16 20 16 16-18" fill="#ffd65a" stroke="#2a2118" stroke-width="5" stroke-linejoin="round"/>
      <path d="M18 92c40 10 180 10 224 0v10c-44 12-184 12-224 0z" fill="#d64933" stroke="#2a2118" stroke-width="5"/>
      <path d="M16 104c30 10 200 10 228 0" fill="none" stroke="#5aa64f" stroke-width="12" stroke-linecap="round"/>
      <path d="M22 108c0 26 40 34 108 34s108-8 108-34z" fill="#e8b062" stroke="#2a2118" stroke-width="5"/>
      <g fill="#fff3d6"><ellipse cx="80" cy="44" rx="6" ry="3"/><ellipse cx="130" cy="38" rx="6" ry="3"/><ellipse cx="180" cy="46" rx="6" ry="3"/></g>
    </svg>
  </div>
</header>

<main id="main">
<section id="build" class="mx-auto max-w-6xl px-4 py-12" aria-labelledby="build-h">
  <h2 id="build-h" class="font-display text-5xl">Build your sub</h2>
  <p class="mt-2 text-muted">One meat and one cheese included. Build-your-own prices are samples for the demo.</p>
  <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
    <ol class="grid gap-8" data-steps></ol>
    <aside class="self-start lg:sticky lg:top-4 rounded-3xl border-4 border-ink bg-surface p-5 shadow-[6px_6px_0_var(--ink)]" data-summary></aside>
  </div>
</section>

<section class="bg-brand text-white border-y-4 border-ink" aria-labelledby="sig-h">
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h2 id="sig-h" class="font-display text-5xl">The regulars</h2>
    <p class="mt-2 text-white/80">Prices from the shop’s public menu listings.</p>
    <ul class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      ${data.signatures
        .map(
          (s) => `
      <li class="flex flex-col rounded-3xl bg-surface text-ink border-4 border-ink p-5">
        <div class="flex items-start justify-between gap-3"><h3 class="font-display text-2xl leading-tight">${t(s.name)}</h3><p class="font-display text-2xl">$${(s.cents / 100).toFixed(2)}</p></div>
        <p class="mt-2 text-muted">${t(s.desc)}</p>
        <button type="button" data-sig="${s.id}" class="mt-auto pt-0 self-start mt-4 rounded-full bg-accent px-5 py-2 font-bold border-2 border-ink">Add</button>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>
</main>
${footer('Hours from public listings: Monday to Friday 9 AM to 4 PM, Saturday 10 AM to 2 PM. Cash only.')}`,
    }),
};

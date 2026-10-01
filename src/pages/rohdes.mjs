import { page, footer, demoBanner, esc, t } from '../layout.mjs';

// Facts: 1040 2nd St, (812) 372-1890, open Mon to Fri 6:30 to 2 and Sat 8 to
// 2, closed Sunday. Listed prices: Biscuits and Gravy $7.49 (home-style
// biscuit, thick homemade sausage gravy), Biscuit-less Biscuit & Gravy
// $12.99 (two eggs on hash browns, two bacon strips, cheese, sausage gravy),
// Rise and Shine $11.99 (two eggs, sausage patty, ham or three bacon strips,
// hash browns or fried potatoes, biscuit or white or wheat toast), French
// Toast $8.99 (Texas toast, cinnamon or powdered sugar), hash browns or
// fried potatoes $3.99. Marbled rye toast is a listed favorite. The skillet,
// tenderloin, gravy add-on and morning-rush window are samples.
const data = {
  slug: 'rohdes',
  business: "Rohde's Family Diner",
  phone: '(812) 372-1890',
  hours: { Monday: ['06:30', '14:00'], Tuesday: ['06:30', '14:00'], Wednesday: ['06:30', '14:00'], Thursday: ['06:30', '14:00'], Friday: ['06:30', '14:00'], Saturday: ['08:00', '14:00'] },
  rush: ['07:00', '09:00'],
  eggs: ['Sunny side up', 'Over easy', 'Over medium', 'Over hard', 'Scrambled'],
  rise: {
    cents: 1199,
    meats: [{ name: 'Sausage patty', cents: 0 }, { name: 'Ham', cents: 0 }, { name: '3 bacon strips', cents: 0 }, { name: 'Pork tenderloin', cents: 200, sample: true }],
    potatoes: ['Hash browns', 'Fried potatoes'],
    breads: ['Biscuit', 'White toast', 'Wheat toast', 'Marbled rye toast'],
    gravy: { cents: 150, sample: true },
  },
  skillet: {
    cents: 1099,
    meats: ['Bacon', 'Sausage', 'Ham', 'Pork tenderloin'],
    extraMeat: 150,
    veggies: ['Onion', 'Green pepper', 'Mushroom', 'Tomato'],
    cheeses: ['Cheddar', 'Pepper jack', 'Swiss', 'No cheese'],
  },
  classics: [
    { id: 'bg', name: 'Biscuits and Gravy', cents: 749, desc: 'Home-style biscuit under thick homemade sausage gravy.' },
    { id: 'bless', name: 'Biscuit-less Biscuit & Gravy', cents: 1299, desc: 'Two eggs on hash browns, two bacon strips and cheese, under sausage gravy.', eggs: true },
    { id: 'ft', name: 'French Toast', cents: 899, desc: 'Thick Texas toast with cinnamon or powdered sugar.', choice: ['Cinnamon', 'Powdered sugar'] },
    { id: 'potatoes', name: 'Hash Browns or Fried Potatoes', cents: 399, desc: 'On the side.', choice: ['Hash browns', 'Fried potatoes'] },
  ],
};

export const rohdes = {
  slug: 'rohdes',
  render: ({ assets }) =>
    page({
      title: "Rohde's Family Diner | Breakfast and lunch on 2nd Street | Columbus, Indiana (demo)",
      description: "Concept demo: build your breakfast at Rohde's Family Diner, eggs your way, and schedule a pickup around the morning rush.",
      theme: 'theme-rohdes',
      assets,
      scripts: ['rohdes.js'],
      data,
      body: `
${demoBanner(data.business)}
<div class="checker h-6 border-y-2 border-ink" aria-hidden="true"></div>
<header class="relative bg-brand text-white overflow-hidden">
  <div class="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_20%_30%,#fff_0,transparent_45%)]" aria-hidden="true"></div>
  <div class="relative mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-[1.3fr_0.7fr] items-center">
    <div>
      <p class="font-script text-3xl text-accent">Rohde’s</p>
      <h1 class="font-display text-5xl sm:text-6xl leading-[0.95] uppercase">Family Diner</h1>
      <p class="mt-4 text-lg text-white/90 max-w-lg">Good morning, Columbus. Build your breakfast just how you like it and we’ll have it hot when you walk in.</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a href="#build" class="rounded-full bg-white text-ink px-6 py-3 font-display text-lg border-2 border-ink shadow-[4px_4px_0_var(--ink)]">Build my breakfast</a>
        <a href="tel:+18123721890" class="rounded-full bg-ink text-white px-6 py-3 font-display text-lg border-2 border-white/60">Call in ${esc(data.phone)}</a>
      </div>
    </div>
    <div class="rounded-[2rem] border-4 border-white/80 bg-ink/30 p-6 text-center backdrop-blur">
      <p class="font-display uppercase tracking-widest text-accent">Open</p>
      <p class="mt-2 font-display text-3xl">Mon to Fri</p><p class="text-xl">6:30 AM to 2 PM</p>
      <p class="mt-3 font-display text-3xl">Saturday</p><p class="text-xl">8 AM to 2 PM</p>
      <p class="mt-3 text-white/80">1040 2nd Street</p>
    </div>
  </div>
</header>
<div class="checker h-6 border-y-2 border-ink" aria-hidden="true"></div>

<main id="main">
<section id="build" class="mx-auto max-w-6xl px-4 py-12" aria-labelledby="build-h">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <h2 id="build-h" class="font-display text-4xl uppercase">Build your breakfast</h2>
    <div role="tablist" class="inline-flex rounded-full border-2 border-ink bg-surface p-1" data-tabs>
      <button role="tab" type="button" data-tab="rise" aria-selected="true" class="rounded-full px-4 py-2 font-bold aria-selected:bg-brand aria-selected:text-white">Rise and Shine</button>
      <button role="tab" type="button" data-tab="skillet" aria-selected="false" class="rounded-full px-4 py-2 font-bold aria-selected:bg-brand aria-selected:text-white">Skillet<span class="sample">sample</span></button>
    </div>
  </div>
  <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
    <div class="grid gap-7" data-builder></div>
    <aside class="self-start lg:sticky lg:top-4 rounded-[2rem] border-4 border-ink bg-surface p-5 shadow-[6px_6px_0_var(--accent)]" data-summary></aside>
  </div>
</section>

<section class="bg-accent/25 border-y-2 border-ink" aria-labelledby="classics-h">
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h2 id="classics-h" class="font-display text-4xl uppercase">Biscuits &amp; classics</h2>
    <ul class="mt-6 grid gap-4 md:grid-cols-2" data-classics></ul>
  </div>
</section>
<p class="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">Prices from Rohde’s public menu listings. Items marked <span class="sample">sample</span>, and the morning-rush window, are placeholders for the demo.</p>
</main>
<div class="checker h-6 border-y-2 border-ink" aria-hidden="true"></div>
${footer()}`,
    }),
};

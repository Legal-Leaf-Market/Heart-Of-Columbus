import { page, footer, demoBanner, esc } from '../layout.mjs';

// Facts: 1804 25th St, (812) 376-8989, open Tue to Thu 10 to 9 and Fri to Sat
// 10 to 9:30 (Sunday and Monday hours weren't listed). Listed prices:
// General Tso's combo plate $7.75, lunch specials $5.75, crab rangoon (10)
// $5.75, egg roll $1.30. Other dishes use the same lunch and combo prices as
// samples; listings vary, so the page says prices may differ in store.
const data = {
  slug: 'tasty-express',
  business: 'Tasty Express',
  phone: '(812) 376-8989',
  address: '1804 25th St',
  hours: { Tuesday: ['10:00', '21:00'], Wednesday: ['10:00', '21:00'], Thursday: ['10:00', '21:00'], Friday: ['10:00', '21:30'], Saturday: ['10:00', '21:30'] },
  portions: {
    lunch: { label: 'Lunch Special', cents: 575, note: 'Entr\u00e9e portion' },
    combo: { label: 'Dinner Combo', cents: 775, note: 'With fried rice and an egg roll' },
  },
  dishes: [
    { id: 'general-tso', name: 'General Tso\u2019s Chicken', hot: true },
    { id: 'sesame', name: 'Sesame Chicken' },
    { id: 'sweet-sour', name: 'Sweet & Sour Chicken' },
    { id: 'chicken-broccoli', name: 'Chicken with Broccoli' },
    { id: 'beef-broccoli', name: 'Beef with Broccoli' },
    { id: 'lo-mein', name: 'Chicken Lo Mein' },
  ],
  sides: [
    { id: 'rangoon', name: 'Crab Rangoon (10)', cents: 575 },
    { id: 'egg-roll', name: 'Egg Roll', cents: 130 },
  ],
};

export const tastyExpress = {
  slug: 'tasty-express',
  render: ({ assets }) =>
    page({
      title: "Tasty Express | Fast Chinese carryout on 25th St | Columbus, Indiana (demo)",
      description: "Concept demo: three-tap ordering for Tasty Express (Feng's Express) on 25th Street, with lunch specials, dinner combos and a text confirmation.",
      theme: 'theme-tasty',
      assets,
      scripts: ['tasty-express.js'],
      data,
      body: `
${demoBanner(data.business)}
<header class="bg-paper text-white">
  <div class="mx-auto max-w-3xl px-4 pt-6 pb-8">
    <div class="flex items-center justify-between gap-3">
      <p class="font-display text-2xl uppercase">Tasty <span class="text-accent">Express</span></p>
      <a href="tel:+18123768989" class="rounded-full bg-brand px-4 py-2 font-bold">Call</a>
    </div>
    <h1 class="mt-8 font-display text-5xl sm:text-6xl uppercase leading-[0.9]">Hot. Fast. <span class="text-accent">Ready when you get here.</span></h1>
    <p class="mt-4 text-white/75 text-lg">Pick lunch or dinner, tap what you want, done. ${esc(data.address)}.</p>
  </div>
</header>

<main id="main" class="bg-paper text-white">
  <div class="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-white/10">
    <div class="mx-auto max-w-3xl px-4 py-3">
      <div role="radiogroup" aria-label="Portion" class="grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1.5" data-portion></div>
    </div>
  </div>
  <div class="mx-auto max-w-3xl px-4 py-6 grid gap-3" data-dishes></div>
  <div class="mx-auto max-w-3xl px-4 pb-6">
    <h2 class="font-display text-3xl uppercase mt-4">Sides</h2>
    <div class="mt-3 grid gap-3 sm:grid-cols-2" data-sides></div>
    <p class="mt-6 text-sm text-white/60">Lunch special and combo prices from public listings; dish-by-dish prices and what comes with each portion are samples and may differ in store.</p>
  </div>
</main>
<div class="bg-paper h-20"></div>
${footer('Hours from public listings: Tuesday to Thursday 10 AM to 9 PM, Friday and Saturday 10 AM to 9:30 PM.')}`,
    }),
};

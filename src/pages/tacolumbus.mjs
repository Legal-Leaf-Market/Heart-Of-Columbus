import { page, footer, demoBanner, esc } from '../layout.mjs';

// Facts: 1637 N. National Rd, (812) 343-1423, open Mon to Thu 10 to 10 and
// Fri 10 to 11 (weekend hours weren't in the listings). Prices from their
// public menu listings: tacos de birria $15.00, quesabirria con consomé
// $15.99, pollo / chorizo / carnitas tacos $3.99, tripa $4.50, horchata
// grande $4.50. Asada, pastor and agua fresca prices are samples.
const data = {
  slug: 'tacolumbus',
  business: 'TaColumbus',
  phone: '(812) 343-1423',
  hours: { Monday: ['10:00', '22:00'], Tuesday: ['10:00', '22:00'], Wednesday: ['10:00', '22:00'], Thursday: ['10:00', '22:00'], Friday: ['10:00', '23:00'] },
  birria: [
    { id: 'tacos-birria', name: 'Tacos de Birria', cents: 1500, desc: 'Slow-braised birria tacos with a cup of consomé for dipping.' },
    { id: 'quesabirria', name: 'Quesabirria con Consomé', cents: 1599, desc: 'Cheesy, griddled birria tacos with consomé.' },
  ],
  meats: [
    { id: 'pastor', name: 'Al Pastor', cents: 399, sample: true },
    { id: 'asada', name: 'Asada', cents: 399, sample: true },
    { id: 'pollo', name: 'Pollo', cents: 399 },
    { id: 'carnitas', name: 'Carnitas', cents: 399 },
    { id: 'chorizo', name: 'Chorizo', cents: 399 },
    { id: 'tripa', name: 'Tripa', cents: 450 },
  ],
  packs: [1, 3, 5],
  heat: ['Mild', 'Medium', 'Hot', 'Fuego'],
  drinks: [
    { id: 'horchata', name: 'Horchata Grande', cents: 450, desc: 'Rice, milk, vanilla and cinnamon.' },
    { id: 'agua', name: 'Agua Fresca of the Season', cents: 450, desc: 'Ask what’s fresh today.', sample: true, flavors: ['Jamaica', 'Tamarindo', 'Piña'] },
  ],
};

const star = (cls) =>
  `<svg viewBox="0 0 40 40" class="${cls}" aria-hidden="true"><path d="M20 2l4 13 14 1-11 8 4 14-11-8-11 8 4-14L2 16l14-1z" fill="var(--accent)" stroke="var(--ink)" stroke-width="2.5" stroke-linejoin="round"/></svg>`;

const section = (id, kicker, title, body) => `
<section id="${id}" class="relative rounded-[28px] border-4 border-ink bg-surface text-ink shadow-[8px_8px_0_var(--accent)] overflow-hidden" aria-labelledby="${id}-h">
  <div class="halftone absolute inset-x-0 top-0 h-28 opacity-60" aria-hidden="true"></div>
  <div class="relative p-5 sm:p-7">
    <p class="inline-block -rotate-2 rounded-lg bg-brand px-3 py-1 font-display text-sm text-white border-2 border-ink">${kicker}</p>
    <h2 id="${id}-h" class="mt-3 font-display text-3xl sm:text-4xl leading-none">${title}</h2>
    ${body}
  </div>
</section>`;

export const tacolumbus = {
  slug: 'tacolumbus',
  render: ({ assets }) =>
    page({
      title: 'TaColumbus | Birria, street tacos and horchata | Columbus, Indiana (demo)',
      description: 'Concept demo: build birria plates and street taco packs from TaColumbus on National Road and pick a pickup time. No app fees.',
      theme: 'theme-taco',
      assets,
      scripts: ['tacolumbus.js'],
      data,
      body: `
${demoBanner(data.business)}
<header class="relative overflow-hidden border-b-4 border-ink bg-paper text-white">
  <div class="speedlines absolute inset-0" aria-hidden="true"></div>
  <div class="halftone absolute inset-0" aria-hidden="true"></div>
  <div class="relative mx-auto max-w-6xl px-4 pt-6 pb-14">
    <div class="flex items-center justify-between gap-4">
      <p class="font-display text-2xl tracking-wide">TA<span class="text-accent">COLUMBUS</span></p>
      <a href="tel:+18123431423" class="rounded-full bg-accent px-5 py-2 font-bold text-ink border-2 border-ink">Call ${esc(data.phone)}</a>
    </div>
    <div class="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-center">
      <div>
        <h1 class="font-display text-5xl sm:text-7xl leading-[0.9] [text-shadow:4px_4px_0_var(--brand)]">Birria. Street tacos. Handmade tortillas.</h1>
        <p class="mt-5 max-w-xl text-lg text-white/85">Build your plate, pick a time, and grab it on National Road. Pay at the counter: no app fees on top.</p>
        <div class="mt-7 flex flex-wrap gap-3">
          <a href="#birria" class="rounded-full bg-brand px-6 py-3 font-display text-lg border-2 border-ink shadow-[4px_4px_0_var(--accent)]">Birria time</a>
          <a href="#tacos" class="rounded-full bg-white text-ink px-6 py-3 font-display text-lg border-2 border-ink shadow-[4px_4px_0_var(--brand)]">Build a taco pack</a>
        </div>
      </div>
      <div class="relative mx-auto" aria-hidden="true">
        ${star('absolute -top-6 -left-6 size-16 rotate-12')}
        ${star('absolute -bottom-4 -right-2 size-12 -rotate-12')}
        <div class="relative grid place-items-center size-64 sm:size-72 rounded-full border-4 border-ink bg-brand shadow-[8px_8px_0_var(--accent)] rotate-3">
          <div class="text-center">
            <p class="font-display text-2xl text-accent">QUESA</p>
            <p class="font-display text-5xl text-white leading-none">BIRRIA</p>
            <p class="mt-2 inline-block rounded-full bg-white px-3 py-1 font-bold text-ink">+ consomé for dipping</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</header>

<main id="main" class="mx-auto max-w-6xl px-4 py-12 grid gap-10">
  ${section(
    'birria',
    'THE MAIN EVENT',
    'Birria plates',
    `<div class="mt-6 grid gap-4 md:grid-cols-2" data-birria></div>`,
  )}
  ${section(
    'tacos',
    'BUILD IT',
    'Street taco pack',
    `<p class="mt-2 text-muted">One meat per pack. Want a mix? Add another pack.</p><div class="mt-6" data-builder></div>`,
  )}
  ${section(
    'drinks',
    'SIP SIP',
    'Horchata &amp; aguas frescas',
    `<div class="mt-6 grid gap-4 md:grid-cols-2" data-drinks></div>`,
  )}
  <p class="text-sm text-white/70">Prices from TaColumbus’s public menu listings; items marked <span class="sample !text-ink !bg-white/80">sample</span> are placeholders. Prices in the shop may differ.</p>
</main>
${footer('Hours from public listings: Monday to Thursday 10 AM to 10 PM, Friday 10 AM to 11 PM. Call for weekend hours.')}`,
    }),
};

import { page, footer, demoBanner, esc, t } from '../layout.mjs';

// Facts from public listings (Yelp, Yellow Pages, Nicelocal): 2548 McKinley
// Ave, (812) 376-7128, established 1962, Tue to Fri 8 to 5, Sat 8 to 2.
// Reviews put a regular cut around $20 and mention flat tops. Every other
// service and price is a sample for the pitch and says so on the page.
const data = {
  slug: 'gills',
  business: "Gill's Barber Shop",
  phone: '(812) 376-7128',
  hours: { Tuesday: ['08:00', '17:00'], Wednesday: ['08:00', '17:00'], Thursday: ['08:00', '17:00'], Friday: ['08:00', '17:00'], Saturday: ['08:00', '14:00'] },
  services: [
    { id: 'regular', name: 'Regular Cut', minutes: 20, cents: 2000, desc: 'A classic men\u2019s cut. Reviews put it around $20.', about: true },
    { id: 'flattop', name: 'Flat Top', minutes: 30, cents: 2200, desc: 'Squared off and level. Reviewers mention a good one here.', sample: true },
    { id: 'beard', name: 'Beard Trim', minutes: 15, cents: 1200, desc: 'Shape, line and tidy.', sample: true },
    { id: 'shave', name: 'Hot Lather Shave', minutes: 30, cents: 2500, desc: 'Hot towel, warm lather, straight razor.', sample: true },
    { id: 'father-son', name: 'Father & Son', minutes: 40, cents: 3500, desc: 'Two cuts, back to back.', sample: true },
  ],
  // Sample customers so the queue has something to show.
  queue: [
    { name: 'Dale R.', service: 'Regular Cut', chair: 1, startedMinAgo: 8 },
    { name: 'Marcus T.', service: 'Flat Top', chair: 2, startedMinAgo: 3 },
    { name: 'Jim W.', service: 'Regular Cut' },
    { name: 'Luis P.', service: 'Beard Trim' },
  ],
};

const pole = `<div class="stripes h-3 w-full border-y-2 border-ink" aria-hidden="true"></div>`;
const tel = 'tel:+18123767128';

export const gills = {
  slug: 'gills',
  render: ({ assets }) =>
    page({
      title: "Gill's Barber Shop | Walk-ins welcome | Columbus, Indiana (demo)",
      description: "Concept demo: a live chair queue and booking for Gill's Barber Shop on McKinley Avenue, cutting hair in Columbus since 1962.",
      theme: 'theme-gills',
      assets,
      scripts: ['gills.js'],
      data,
      body: `
${demoBanner(data.business)}
<header class="bg-accent text-white">
  ${pole}
  <div class="mx-auto max-w-6xl px-4 py-5 flex flex-wrap items-center justify-between gap-4">
    <a href="#main" class="leading-none">
      <span class="block font-display text-3xl sm:text-4xl tracking-wide">GILL’S</span>
      <span class="block mt-1 text-xs font-bold tracking-[0.35em] text-white/80">BARBER SHOP · EST. 1962</span>
    </a>
    <a href="${tel}" class="rounded-full bg-brand px-5 py-2.5 font-bold border-2 border-white/80">Call ${esc(data.phone)}</a>
  </div>
</header>

<main id="main">
<section class="mx-auto max-w-6xl px-4 py-12 grid gap-10 lg:grid-cols-[1fr_1.1fr] items-start">
  <div>
    <p class="font-bold tracking-[0.25em] text-brand text-sm">McKINLEY AVENUE · COLUMBUS</p>
    <h1 class="mt-3 font-display text-5xl sm:text-6xl leading-[0.95]">Walk-ins welcome. Or save your spot.</h1>
    <p class="mt-5 text-lg text-muted max-w-md">See who’s in the chair and how long the wait is before you leave the house. Put your name on the list from your phone and walk in when it’s your turn.</p>
    <dl class="mt-8 grid grid-cols-2 gap-4 max-w-md">
      <div class="rounded-2xl border-2 border-ink bg-surface p-4"><dt class="text-sm font-bold text-muted">Tue to Fri</dt><dd class="font-display text-2xl">8 to 5</dd></div>
      <div class="rounded-2xl border-2 border-ink bg-surface p-4"><dt class="text-sm font-bold text-muted">Saturday</dt><dd class="font-display text-2xl">8 to 2</dd></div>
    </dl>
    <p class="mt-3 text-sm text-muted">Closed Sunday and Monday. 2548 McKinley Avenue.</p>
  </div>

  <div class="rounded-3xl border-2 border-ink bg-surface shadow-[6px_6px_0_var(--ink)] overflow-hidden" aria-labelledby="queue-h">
    <div class="flex items-center justify-between gap-3 bg-ink text-white px-5 py-3">
      <h2 id="queue-h" class="font-display text-xl tracking-wide">THE CHAIRS</h2>
      <p class="text-sm font-semibold" data-open></p>
    </div>
    <div class="p-5">
      <div class="grid grid-cols-2 gap-3" data-chairs></div>
      <div class="mt-5 flex items-end justify-between gap-4 border-t-2 border-dashed border-ink/20 pt-4">
        <div>
          <p class="text-sm font-bold text-muted">WAITING</p>
          <p class="font-display text-4xl" data-waiting>0</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-muted">EST. WAIT IF YOU JOIN</p>
          <p class="font-display text-4xl" data-wait>0 min</p>
        </div>
      </div>
      <ol class="mt-4 grid gap-2" data-list></ol>
      <div class="mt-5" data-mine></div>
      <button type="button" data-join class="mt-2 w-full rounded-2xl bg-brand text-white font-display text-xl py-4 border-2 border-ink shadow-[3px_3px_0_var(--ink)]">SAVE MY SPOT</button>
      <p class="mt-3 text-xs text-muted text-center">Demo queue with sample customers. Gill’s doesn’t offer online check-in yet.</p>
    </div>
  </div>
</section>

${pole}

<section class="bg-surface" aria-labelledby="services-h">
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h2 id="services-h" class="font-display text-4xl">Services</h2>
    <p class="mt-2 text-muted">Prices marked <span class="sample">sample</span> are placeholders for the demo. Call the shop for today’s prices.</p>
    <ul class="mt-6 grid gap-4 md:grid-cols-2">
      ${data.services
        .map(
          (s) => `
      <li class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-ink p-5">
        <div class="min-w-0 flex-1">
          <h3 class="font-display text-2xl">${t(s.name)}${s.sample ? '<span class="sample">sample</span>' : ''}</h3>
          <p class="text-muted">${t(s.desc)}</p>
          <p class="mt-1 text-sm font-semibold">${s.minutes} min · ${s.about ? 'about ' : ''}$${(s.cents / 100).toFixed(0)}</p>
        </div>
        <button type="button" data-book="${s.id}" class="shrink-0 rounded-full bg-accent text-white px-5 py-2.5 font-bold">Book</button>
      </li>`,
        )
        .join('')}
    </ul>
  </div>
</section>

<section class="bg-accent text-white" aria-labelledby="history-h">
  <div class="mx-auto max-w-6xl px-4 py-14 grid gap-8 md:grid-cols-[auto_1fr] items-center">
    <div class="grid place-items-center size-44 rounded-full border-4 border-white text-center">
      <div><p class="text-sm font-bold tracking-[0.3em]">SINCE</p><p class="font-display text-5xl">1962</p></div>
    </div>
    <div>
      <h2 id="history-h" class="font-display text-4xl">A Columbus barbershop since 1962</h2>
      <p class="mt-4 text-lg text-white/85 max-w-2xl">Gill’s has been cutting hair in Columbus since 1962. No app, no fuss: a chair, a good cut, and a conversation.</p>
      <p class="mt-3 text-sm text-white/70">A history section like this gets written with the shop: photos, names and stories they want told.</p>
    </div>
  </div>
</section>
</main>

<dialog data-book-dialog class="w-full max-w-md rounded-3xl border-2 border-ink p-0 bg-surface text-ink backdrop:bg-black/60"></dialog>
${footer()}`,
    }),
};

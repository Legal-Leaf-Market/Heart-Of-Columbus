// Category, neighborhood, business, explore, saved and credits pages.
import { page, esc, t } from '../layout.mjs';
import { directory, CATEGORIES, AREAS, catBySlug, subBySlug, areaBySlug, km } from '../data/directory.mjs';
import { header, footer, card, rail, svg, PHOTOS, artIcon, tel, mapsLink, breadcrumbs } from '../site.mjs';

const styles = ['hoc.css'];
const listGrid = (items) => `<div class="grid" data-grid>${items.map((b) => card(b)).join('')}</div>`;
const countBy = (items, key) => items.reduce((m, b) => ((m[b[key]] = (m[b[key]] || 0) + 1), m), {});

// Client-side refine bar on list pages: filter what's already on the page.
const refine = (items, { areas = true, subs = null } = {}) => {
  const byArea = countBy(items, 'area');
  const chips = [];
  if (subs)
    chips.push(
      `<div class="chips" role="group" aria-label="Type"><button type="button" class="pill" data-f-sub="" aria-pressed="true">All types</button>${subs
        .map((s) => `<button type="button" class="pill" data-f-sub="${s.slug}" aria-pressed="false">${s.emoji} ${esc(s.label)}</button>`)
        .join('')}</div>`,
    );
  if (areas)
    chips.push(
      `<div class="chips" role="group" aria-label="Neighborhood"><button type="button" class="pill" data-f-area="" aria-pressed="true">Everywhere</button>${AREAS.filter((a) => byArea[a.slug])
        .map((a) => `<button type="button" class="pill" data-f-area="${a.slug}" aria-pressed="false">${esc(a.label)} <small>${byArea[a.slug]}</small></button>`)
        .join('')}</div>`,
    );
  return `<div class="refine wrap" data-refine>
    <label class="refine-q">${svg('search')}<input type="search" placeholder="Filter these ${items.length}…" data-f-q aria-label="Filter this list"></label>
    ${chips.join('')}
    <p class="refine-count" data-f-count aria-live="polite">${items.length} places</p>
  </div>`;
};

function categoryPage(cat, sub, { assets }) {
  const items = directory.filter((b) => b.cat === cat.slug && (!sub || b.sub === sub.slug));
  const multi = cat.subs.length > 1;
  const title = sub && multi ? sub.label : cat.label;
  const others = CATEGORIES.filter((c) => c.slug !== cat.slug);
  const body = `
${header(cat.slug)}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/explore/', 'Explore'], ...(sub && multi ? [[`/c/${cat.slug}/`, cat.label], ['', sub.label]] : [['', cat.label]])])}
<section class="band" style="--c:${cat.color};--t:${cat.tint}">
  <div class="wrap band-row">
    ${artIcon(cat.slug, sub && multi ? sub.emoji : cat.emoji, 'band-ic')}
    <div>
      <p class="kicker">${sub && multi ? esc(cat.label) : 'Category'}</p>
      <h1>${esc(title)} <span class="band-n">${items.length}</span></h1>
      <p class="band-sub">${esc(cat.blurb)} Independent and in Columbus.</p>
    </div>
    <a class="btn btn-ghost" href="/explore/?cat=${cat.slug}${sub && multi ? `&sub=${sub.slug}` : ''}&view=map">${svg('map')} See them on the map</a>
  </div>
  ${multi ? `<div class="wrap subnav">${[`<a href="/c/${cat.slug}/" class="${!sub ? 'on' : ''}">All ${esc(cat.label.toLowerCase())}</a>`, ...cat.subs.map((s) => `<a href="/c/${cat.slug}/${s.slug}/" class="${sub && sub.slug === s.slug ? 'on' : ''}">${s.emoji} ${esc(s.label)} <small>${directory.filter((b) => b.sub === s.slug).length}</small></a>`)].join('')}</div>` : ''}
</section>
${refine(items, { subs: multi && !sub ? cat.subs : null })}
<section class="wrap list">${listGrid(items)}
  <p class="empty" data-f-empty hidden><img src="/art/empty-search.png" alt="" width="160" height="160">Nothing matches. Try another neighborhood or clear the filter.</p>
</section>
<section class="wrap more-cats">
  <h2>Keep exploring</h2>
  <div class="mini-cats">${others.map((c) => `<a href="/c/${c.slug}/" style="--c:${c.color};--t:${c.tint}">${artIcon(c.slug, c.emoji, 'mc-ic')}${esc(c.label)}</a>`).join('')}</div>
</section>
</main>
${footer()}`;
  return page({ title: `${title} in Columbus, Indiana | Heart of Columbus`, description: `${items.length} independent ${title.toLowerCase()} in Columbus, Indiana.`, body, scripts: ['site.js', 'list.js'], styles, assets });
}

function areaPage(area, { assets }) {
  const items = directory.filter((b) => b.area === area.slug);
  const p = PHOTOS[area.photo];
  const cats = countBy(items, 'cat');
  const body = `
${header('areas')}
<main id="main">
<section class="area-hero">
  <img src="${p.src}" alt="" style="object-position:${p.pos}">
  <span class="area-shade"></span>
  <div class="wrap area-hero-txt">
    ${breadcrumbs([['/', 'Home'], ['/#neighborhoods', 'Neighborhoods'], ['', area.label]])}
    <img class="area-hero-badge" src="/art/area-${area.slug}.png" alt="" onerror="this.remove()">
    <p class="kicker kicker-light">Neighborhood</p>
    <h1>${esc(area.label)}</h1>
    <p>${esc(area.blurb)} ${items.length} independent places.</p>
    <small class="credit">Pictured: ${esc(p.title)}. Photo: ${esc(p.credit)}, ${esc(p.license)}</small>
  </div>
</section>
<div class="wrap jump">${CATEGORIES.filter((c) => cats[c.slug])
    .map((c) => `<a href="#cat-${c.slug}" style="--c:${c.color};--t:${c.tint}">${c.emoji} ${esc(c.label)} <small>${cats[c.slug]}</small></a>`)
    .join('')}</div>
${CATEGORIES.filter((c) => cats[c.slug])
    .map((c) => rail(c.label, `/c/${c.slug}/`, items.filter((b) => b.cat === c.slug), { id: `cat-${c.slug}` }))
    .join('')}
<section class="wrap more-cats"><h2>Other neighborhoods</h2>
  <div class="mini-cats">${AREAS.filter((a) => a.slug !== area.slug).map((a) => `<a href="/n/${a.slug}/">${svg('pin', 'ic-sm')} ${esc(a.label)}</a>`).join('')}</div>
</section>
</main>
${footer()}`;
  return page({ title: `${area.label}, Columbus, Indiana | Heart of Columbus`, description: `${items.length} independent businesses in ${area.label}, Columbus, Indiana.`, body, scripts: ['site.js', 'hub.js'], styles, assets });
}

function bizPage(b, { assets }) {
  const cat = catBySlug[b.cat];
  const sub = subBySlug[b.sub];
  const area = areaBySlug[b.area];
  const near = b.ll
    ? directory.filter((x) => x.slug !== b.slug && x.ll).map((x) => [km(b.ll, x.ll), x]).sort((a, c) => a[0] - c[0]).slice(0, 12).map((x) => x[1])
    : [];
  const same = directory.filter((x) => x.slug !== b.slug && x.sub === b.sub);
  const q = encodeURIComponent(`${b.name}, ${b.address ? b.address + ', ' : ''}Columbus, IN`);
  const body = `
${header(cat.slug)}
<main id="main">
${breadcrumbs([['/', 'Home'], [`/c/${cat.slug}/`, cat.label], ...(cat.subs.length > 1 ? [[`/c/${cat.slug}/${sub.slug}/`, sub.label]] : []), ['', b.name]])}
<section class="wrap biz">
  <div class="biz-main">
    <div class="biz-cover pat-arch" style="--c:${cat.color};--t:${cat.tint}">
      <img class="bz-art" src="/art/cover-${b.sub}.png" alt="" onerror="this.remove()">
      <span class="biz-emoji" aria-hidden="true">${sub.emoji}</span>
    </div>
    <div class="biz-head">
      <p class="kicker"><a href="/c/${cat.slug}/${cat.subs.length > 1 ? sub.slug + '/' : ''}">${esc(sub.label)}</a>${area ? ` · <a href="/n/${area.slug}/">${esc(area.label)}</a>` : ''}</p>
      <h1>${t(b.name)}</h1>
      <p class="biz-type">${t(b.type)}</p>
      <div class="bz-tags">${b.demo ? '<span class="tag tag-hot">Order direct (demo)</span>' : ''}${b.heritage ? '<span class="tag">Columbus original</span>' : ''}<span class="tag tag-plain">Independent</span></div>
      <div class="biz-actions">
        ${b.order.map((o, i) => `<a class="btn${i ? ' btn-ghost' : ''}" href="${esc(o.url)}" target="_blank" rel="noopener">${svg('store')} Order online${b.order.length > 1 ? ` (${esc(o.label)})` : ''}</a>`).join('')}
        ${b.book.map((o, i) => `<a class="btn${b.order.length || i ? ' btn-ghost' : ''}" href="${esc(o.url)}" target="_blank" rel="noopener">${svg('store')} Book online${b.book.length > 1 ? ` (${esc(o.label)})` : ''}</a>`).join('')}
        ${b.feed ? `<a class="btn${b.order.length || b.book.length ? ' btn-ghost' : ''}" href="#shop">${svg('store')} Shop online</a>` : ''}
        ${b.demo ? `<a class="btn btn-ghost" href="${b.demo}">${svg('store')} ${b.cat === 'beauty' ? 'Book' : 'Order'} (demo)</a>` : ''}
        ${b.phone ? `<a class="btn ${b.demo || b.order.length || b.book.length || b.feed ? 'btn-ghost' : ''}" href="${tel(b.phone)}">${svg('phone')} Call ${esc(b.phone)}</a>` : ''}
        <a class="btn btn-ghost" href="${mapsLink(b)}" target="_blank" rel="noopener">${svg('pin')} Directions</a>
        ${b.website ? `<a class="btn btn-ghost" href="${esc(b.website)}" target="_blank" rel="noopener">${svg('globe')} Website</a>` : ''}
        <button type="button" class="btn btn-ghost" data-save="${b.slug}" aria-pressed="false">${svg('heart')} <span data-save-label>Save</span></button>
        <button type="button" class="btn btn-ghost" data-share="${esc(b.name)}">${svg('share')} Share</button>
      </div>
      ${b.order.length || b.book.length ? `<p class="direct-note">${svg('store', 'ic-sm')} ${b.order.length ? 'Ordering' : 'Booking'} opens ${esc(b.name)}’s own ${esc((b.order[0] || b.book[0]).label)} page, the one they chose and pay for themselves. Heart of Columbus takes no cut.</p>` : ''}
    </div>
  </div>
  <aside class="biz-side">
    <div class="side-card">
      <iframe title="Map of ${esc(b.name)}" loading="lazy" src="https://www.google.com/maps?q=${q}&output=embed" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="side-body">
        ${b.address ? `<p class="side-addr">${svg('pin', 'ic-sm')} ${t(b.address)}<br><span>Columbus, Indiana</span></p>` : '<p class="side-addr">Columbus, Indiana. Address not listed publicly.</p>'}
        ${b.phone ? `<p>${svg('phone', 'ic-sm')} <a href="${tel(b.phone)}">${esc(b.phone)}</a></p>` : '<p class="muted">No public phone number in the listings we used. Try the map link for current contact details.</p>'}
      </div>
    </div>
    <div class="side-card claim">
      <p class="kicker">Is this your business?</p>
      <p>Turn this listing into a storefront with direct ordering or booking and no app fees.</p>
      <a class="btn btn-sm" href="/#owners-h">How it works ${svg('arrow', 'ic-sm')}</a>
    </div>
    <p class="fine">Details come from public listings (Chamber directory, Visit Columbus, Google Maps) and may change. Call ahead. Heart of Columbus is not affiliated with this business.</p>
  </aside>
</section>
${b.feed ? `<section class="wrap shop-sec" id="shop"><p class="kicker">Live from their store</p><h2>Shop ${t(b.name)} online</h2>
  <p class="sub">Their real products and prices, read from their own online store. Add to your cart here, then check out on their site with everything already in the cart. Choose pickup there if they offer it.</p>
  <div data-shop="${b.slug}" data-name="${esc(b.name)}"><p class="muted">Loading their store…</p></div></section>` : ''}
${rail(`More ${sub.label.toLowerCase()}`, `/c/${cat.slug}/${cat.subs.length > 1 ? sub.slug + '/' : ''}`, same.slice(0, 14))}
${rail('Close by', area ? `/n/${area.slug}/` : '', near)}
</main>
${footer()}`;
  return page({ title: `${b.name} | ${sub.label} in Columbus, Indiana`, description: `${b.name}, ${b.type}${b.address ? ', ' + b.address : ''}, Columbus, Indiana.`, body, scripts: ['site.js', 'hub.js', 'cart.js'], styles, assets });
}

function explorePage({ assets }, { saved = false } = {}) {
  const body = `
${header(saved ? 'saved' : 'explore')}
<main id="main" class="explore" data-explore${saved ? ' data-saved-only' : ''}>
  <div class="ex-top wrap">
    <div>
      <p class="kicker">${saved ? 'Your list' : 'Explore'}</p>
      <h1>${saved ? 'Saved places' : 'Every independent in Columbus'}</h1>
    </div>
    <div class="ex-views" role="group" aria-label="View">
      <button type="button" class="pill" data-view="list" aria-pressed="true">${svg('list', 'ic-sm')} List</button>
      <button type="button" class="pill" data-view="map" aria-pressed="false">${svg('map', 'ic-sm')} Map</button>
    </div>
  </div>
  <div class="ex-layout wrap">
    <aside class="ex-side" data-ex-side>
      <label class="refine-q">${svg('search')}<input type="search" placeholder="Name, type or street" data-ex-q aria-label="Search"></label>
      <h2>Category</h2>
      <div class="ex-cats">
        <button type="button" class="ex-cat" data-ex-cat="" aria-pressed="true"><span>🗺️</span>Everything <small data-n-cat=""></small></button>
        ${CATEGORIES.map((c) => `<button type="button" class="ex-cat" data-ex-cat="${c.slug}" aria-pressed="false" style="--c:${c.color}"><span>${c.emoji}</span>${esc(c.label)} <small data-n-cat="${c.slug}"></small></button>
          ${c.subs.length > 1 ? `<div class="ex-subs" data-subs-of="${c.slug}" hidden>${c.subs.map((s) => `<button type="button" class="ex-sub" data-ex-sub="${s.slug}" aria-pressed="false">${s.emoji} ${esc(s.label)}</button>`).join('')}</div>` : ''}`).join('')}
      </div>
      <h2>Neighborhood</h2>
      <select data-ex-area aria-label="Neighborhood"><option value="">Anywhere in Columbus</option>${AREAS.map((a) => `<option value="${a.slug}">${esc(a.label)}</option>`).join('')}</select>
      <h2>Show</h2>
      <label class="check"><input type="checkbox" data-ex-phone> Has a public phone number</label>
      <label class="check"><input type="checkbox" data-ex-online> Order, book or shop online</label>
      <label class="check"><input type="checkbox" data-ex-demo> Storefront demo</label>
      <h2>Sort</h2>
      <select data-ex-sort aria-label="Sort"><option value="az">A to Z</option><option value="za">Z to A</option><option value="area">By neighborhood</option></select>
    </aside>
    <section class="ex-main">
      <div class="ex-bar"><p data-ex-count aria-live="polite"></p><button type="button" class="pill ex-filters-btn" data-ex-toggle>Filters</button></div>
      <div class="ex-map" data-ex-map hidden><div id="map"></div><p class="fine">Pins for ${directory.filter((b) => b.ll).length} of ${directory.length} places; the rest had no map pin in public listings.</p></div>
      <div class="grid" data-ex-grid></div>
      <button type="button" class="btn btn-ghost more-btn" data-ex-more hidden>Show more</button>
      <div class="empty" data-ex-empty hidden><img src="/art/${saved ? 'empty-saved' : 'empty-search'}.png" alt="" width="180" height="180">${saved ? '<p>Nothing saved yet. Tap the heart on any place to keep it here.</p><a class="btn" href="/explore/">Start exploring</a>' : '<p>Nothing matches those filters.</p>'}</div>
    </section>
  </div>
</main>
${footer()}`;
  return page({
    title: saved ? 'Saved places | Heart of Columbus' : 'Explore every independent business in Columbus, Indiana | Heart of Columbus',
    description: 'Search and map every independent business in Columbus, Indiana.',
    body,
    scripts: ['site.js', 'explore.js'],
    styles,
    assets,
  });
}

function creditsPage({ assets }) {
  const body = `
${header()}
<main id="main" class="wrap prose">
  <h1>Photo credits</h1>
  <p>The landmark photography on Heart of Columbus comes from Wikimedia Commons and the Library of Congress. Each image is public domain or shared under a Creative Commons license, used here with credit. Photos show Columbus landmarks, not the businesses listed.</p>
  <div class="credits">${Object.values(PHOTOS)
    .map((p) => `<figure><img src="${p.src}" alt="${esc(p.title)}" loading="lazy"><figcaption><strong>${esc(p.title)}</strong> (${esc(p.note)})<br>Photo: ${esc(p.credit)}. License: ${esc(p.license)}. <a href="${p.page}" target="_blank" rel="noopener">Source</a></figcaption></figure>`)
    .join('')}</div>
  <p>Business details come from the Columbus Area Chamber of Commerce member directory, Visit Columbus Indiana listings and Google Maps, gathered October 2026. Map tiles on the explore page are from OpenStreetMap contributors.</p>
</main>
${footer()}`;
  return page({ title: 'Photo credits | Heart of Columbus', description: 'Credits for the photography on Heart of Columbus.', body, scripts: ['site.js'], styles, assets });
}

function orderPage({ assets }) {
  const order = directory.filter((b) => b.order.length);
  const book = directory.filter((b) => b.book.length);
  const shops = directory.filter((b) => b.feed);
  const body = `
${header('order')}
<main id="main">
<section class="order-hero">
  <div class="wrap">
    <p class="kicker kicker-pill">Pickup, appointments and local shopping</p>
    <h1>Order straight from Columbus.<br><span class="hl">Skip the middleman.</span></h1>
    <p class="lede">These businesses already run their own online ordering, booking or store. Every button here goes to their own page, so they keep the whole ticket and the customer. No delivery-app markup, no commission to us.</p>
    <div class="order-stats"><a href="#order"><b>${order.length}</b> order online</a><a href="#book"><b>${book.length}</b> book online</a><a href="#shop"><b>${shops.length}</b> shop online</a></div>
  </div>
</section>
${shops.length ? `<section class="wrap shop-sec" id="shop"><p class="kicker">One cart, many local shops</p><h2>Shop Columbus stores online</h2>
  <p class="sub">Live products from local shops that sell on their own websites. Fill one cart across all of them; each shop checks you out on its own site.</p>
  ${shops.map((b) => `<div class="shop-block"><div class="shop-block-h"><h3><a href="/b/${b.slug}/">${t(b.name)}</a></h3><a class="see-all" href="/b/${b.slug}/#shop">Their whole store ${svg('arrow', 'ic-sm')}</a></div><div data-shop="${b.slug}" data-name="${esc(b.name)}" data-limit="8"><p class="muted">Loading…</p></div></div>`).join('')}
</section>` : ''}
<section class="wrap list" id="order"><div class="sec-head"><p class="kicker">Food and drink</p><h2>Order pickup direct</h2></div>${listGrid(order)}</section>
<section class="wrap list" id="book"><div class="sec-head"><p class="kicker">Appointments</p><h2>Book online</h2></div>${listGrid(book)}</section>
</main>
${footer()}`;
  return page({ title: 'Order, book and shop direct | Heart of Columbus', description: 'Columbus, Indiana businesses you can order from, book or shop online directly, with no app in the middle.', body, scripts: ['site.js', 'cart.js'], styles, assets });
}

export function directoryPages(ctx) {
  const out = [];
  for (const c of CATEGORIES) {
    out.push({ path: `c/${c.slug}/index.html`, html: categoryPage(c, null, ctx) });
    if (c.subs.length > 1) for (const s of c.subs) out.push({ path: `c/${c.slug}/${s.slug}/index.html`, html: categoryPage(c, s, ctx) });
  }
  for (const a of AREAS) out.push({ path: `n/${a.slug}/index.html`, html: areaPage(a, ctx) });
  for (const b of directory) out.push({ path: `b/${b.slug}/index.html`, html: bizPage(b, ctx) });
  out.push({ path: 'explore/index.html', html: explorePage(ctx) });
  out.push({ path: 'saved/index.html', html: explorePage(ctx, { saved: true }) });
  out.push({ path: 'credits/index.html', html: creditsPage(ctx) });
  out.push({ path: 'order/index.html', html: orderPage(ctx) });
  return out;
}

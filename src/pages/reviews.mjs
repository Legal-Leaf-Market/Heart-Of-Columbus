import { esc, page, t } from '../layout.mjs';
import { breadcrumbs, footer, header } from '../site.mjs';
import { directory } from '../data/directory.mjs';
import { REVIEW_CHECKED, REVIEW_SNAPSHOTS } from '../data/review-snapshots.mjs';

const checkedLabel = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long', timeZone: 'UTC',
}).format(new Date(REVIEW_CHECKED));

export function reviewSnapshot(b) {
  if (!Object.hasOwn(REVIEW_SNAPSHOTS, b.slug)) return '';
  const [rating, count, source] = REVIEW_SNAPSHOTS[b.slug];
  return `<p class="review-rating"><strong><span aria-hidden="true">★</span> ${rating.toFixed(1)} out of 5</strong> on Google · ${count.toLocaleString('en-US')} ratings<br>
  <small><a href="https://restaurantguru.com/${esc(source)}" target="_blank" rel="noopener">Source: Restaurant Guru</a> · Checked <time datetime="${REVIEW_CHECKED}">${checkedLabel}</time></small></p>`;
}

export function reviewsPage({ assets }) {
  const places = directory.filter((b) => Object.hasOwn(REVIEW_SNAPSHOTS, b.slug))
    .sort((a, b) => a.name.localeCompare(b.name));
  const body = `
${header()}
<main id="main" class="wrap review-page">
  ${breadcrumbs([['/', 'Home'], ['', 'Reviews']])}
  <h1>Business reviews</h1>
  <p>Browse a snapshot of Google ratings for ${places.length} Columbus restaurants, cafés and sweet shops. Follow the Google Maps or Facebook links to read reviews. Ratings on the original pages may have changed.</p>
  <div data-review-filter hidden>
    <label for="review-search">Find a business</label>
    <input id="review-search" type="search" autocomplete="off" placeholder="Name or street">
    <p data-review-status aria-live="polite"></p>
  </div>
  <ul class="review-list">
    ${places.map((b) => {
      const facebook = b.socials.find((s) => s.label === 'Facebook');
      const maps = new URL('https://www.google.com/maps/search/');
      maps.searchParams.set('api', '1');
      maps.searchParams.set('query', `${b.name}, ${b.address}, Columbus, IN`);
      return `<li class="review-card" id="${b.slug}" data-review-card data-review-name="${esc(`${b.name} ${b.address}`)}">
        <h2><a href="/b/${b.slug}/">${t(b.name)}</a></h2>
        <p>${t(b.address)}</p>
        ${reviewSnapshot(b)}
        <div class="biz-actions">
          <a class="btn btn-ghost" href="${esc(maps.href)}" target="_blank" rel="noopener">Google Maps</a>
          ${facebook ? `<a class="btn btn-ghost" href="${esc(facebook.url)}" target="_blank" rel="noopener">Facebook</a>` : ''}
        </div>
      </li>`;
    }).join('')}
  </ul>
</main>
${footer()}`;
  return page({ title: 'Business reviews | Heart of Columbus', description: 'Public ratings and review links for local businesses in Columbus, Indiana.', body, scripts: ['site.js', 'reviews.js'], styles: ['hoc.css', 'reviews.css'], assets });
}

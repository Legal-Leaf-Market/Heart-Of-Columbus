import { page } from '../layout.mjs';
import { header, footer, breadcrumbs } from '../site.mjs';

export const dealPages = ({ assets }) => [{
  path: 'deals/index.html',
  html: page({
    title: 'Local deals in Columbus, Indiana | Heart of Columbus',
    description: 'Current offers shared by Columbus, Indiana businesses, with terms and expiration dates.',
    path: '/deals/',
    assets,
    styles: ['hoc.css'],
    scripts: ['site.js', 'deals.js'],
    body: `
${header('visit')}
<main id="main">
${breadcrumbs([['/', 'Home'], ['/visit/', 'Plan your visit'], ['', 'Local deals']])}
<section class="order-hero vs-hero"><div class="wrap">
  <h1>Local deals</h1>
  <p class="lede">Offers from Columbus businesses. Ask the business how to claim an offer.</p>
</div></section>
<section class="wrap hol-gifts" aria-label="Current offers">
  <ul class="hol-list" data-public-deals></ul>
  <p data-deals-status role="status"></p>
  <noscript><p>Turn on JavaScript to see current offers.</p></noscript>
  <p><a href="/owners/#claim">Business owners can submit an offer through their listing claim.</a></p>
</section>
</main>
${footer()}`,
  }),
}];

// A website that IS the ordering or shop page (a Square Online site) is one
// place, not two buttons: Gramz Bakery showed "Order online" and "Website"
// side by side, both opening gramz-bakery.square.site. Returns the action
// link that stands in for the website, or '' when the website is its own page.
const bareUrl = (u) => String(u || '').replace(/^https?:\/\/(?:www\.)?/i, '').replace(/[/?#]+$/, '').toLowerCase();
export const websiteAction = (b) => (b.website && [...(b.order || []), ...(b.book || [])].map((o) => o.url).concat(b.store || []).find((u) => bareUrl(u) === bareUrl(b.website))) || '';

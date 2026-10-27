// "In their words" and owner deals on a business page (src/data/owner-words.mjs).
// With none sent, nothing shows: the claim card already invites the owner.
import { esc, t } from '../layout.mjs';
import { wordsFor, dealsFor } from '../data/owner-words.mjs';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (d) => { const [y, m, day] = d.split('-').map(Number); return `${MONTHS[m - 1]} ${day}, ${y}`; };

export function ownerWords(b, on) {
  const words = wordsFor(b.slug), deals = dealsFor(b.slug, on);
  if (!words.length && !deals.length) return '';
  return `
<section class="wrap ow-words" aria-labelledby="ow-words-h">
  <p class="kicker">From the business</p>
  <h2 id="ow-words-h">${words.length ? 'In their words' : 'A deal from them'}</h2>
  ${words.map((w) => `<blockquote class="ow-quote"><p>${t(w.text)}</p><footer class="fine">Written by ${esc(w.by)} of ${t(b.name)}, sent to us ${longDate(w.sent)}. We publish it as they wrote it.</footer></blockquote>`).join('')}
  ${deals.map((d) => `<div class="ow-deal" data-ends="${d.ends}"><p><b>Deal:</b> ${t(d.text)}</p><p class="fine">From ${t(b.name)}, sent ${longDate(d.sent)}. Ends ${longDate(d.ends)}. Ask them for the details; we don’t sell or honor deals.</p></div>`).join('')}
</section>`;
}

// Getting the paper to people: the newsletter signup box, the share bar and
// the follow strip (RSS). Plain links and forms that work with no script;
// public/js/subscribe.js adds the phone share sheet, copy buttons and an
// in-page signup reply.
import { esc } from '../layout.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { NEWSLETTER, PAPER } from '../data/paper.mjs';

const abs = (h) => (h.startsWith('http') ? h : ORIGIN + h);
const enc = encodeURIComponent;

// `choice` adds the Morning, Evening or Both picker (the /newsletter/ page);
// every other box signs a reader up for both, and every email links to the
// page where they can change it.
export function signupBox({ heading = 'Get the newsletter', compact = false, choice = false } = {}) {
  const pitch = 'Good, honest Columbus news, a local business, what’s on and the weather. Every morning and evening, free.';
  if (!NEWSLETTER.signupAction) return `<aside class="np-signup${compact ? ' np-signup-sm' : ''}"><p class="np-signup-k">Newsletter</p><h2>${esc(heading)}</h2><p>${pitch}</p><p class="fine">Signup opens soon. <a href="/news/feed.xml">Follow by RSS</a> in the meantime.</p></aside>`;
  const ours = NEWSLETTER.provider === 'resend';
  return `<aside class="np-signup${compact ? ' np-signup-sm' : ''}">
  <p class="np-signup-k">Newsletter</p><h2>${esc(heading)}</h2><p>${pitch}</p>
  <form class="np-signup-form" action="${esc(NEWSLETTER.signupAction)}" method="post"${ours ? ' data-subscribe' : ' target="_blank"'}>
    <label class="sr-only" for="nl-${compact ? 's' : 'l'}">Email</label>
    <input id="nl-${compact ? 's' : 'l'}" name="email" type="email" autocomplete="email" placeholder="you@example.com" required>
    ${ours ? '<input class="np-hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' : '<input type="hidden" name="embed" value="1">'}
    ${ours && choice ? `<fieldset class="np-signup-choice"><legend>Which editions?</legend>${[['morning', 'Morning, 6:45 AM'], ['evening', 'Evening, 6:00 PM'], ['both', 'Both']].map(([v, l]) => `<label><input type="radio" name="choice" value="${v}"${v === 'both' ? ' checked' : ''}> ${l}</label>`).join(' ')}</fieldset>` : ''}
    <button type="submit">Sign up</button>
  </form>
  <p class="np-signup-msg" data-subscribe-msg role="status"></p>
  <p class="fine">We email once to confirm. One click unsubscribes. <a href="/privacy/">Privacy</a></p>
</aside>`;
}

// Share one page: the phone's own share sheet (shown by the script), then
// text, email, Facebook, X and WhatsApp links, and two copy buttons.
export function shareBar({ path, title, text = '', label = 'Share this story' }) {
  const url = abs(path);
  const post = `${title}${text ? `: ${text}` : ''} ${url}`;
  const links = [
    ['Text', `sms:?&body=${enc(`${title} ${url}`)}`],
    ['Email', `mailto:?subject=${enc(title)}&body=${enc(`${text ? text + '\n\n' : ''}${url}`)}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`],
    ['X', `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(url)}`],
    ['WhatsApp', `https://wa.me/?text=${enc(`${title} ${url}`)}`],
  ];
  return `<nav class="np-share" aria-label="${esc(label)}" data-share data-url="${esc(url)}" data-title="${esc(title)}" data-text="${esc(text)}">
  <p class="np-share-k">${esc(label)}</p>
  <div class="np-share-row">
    <button type="button" class="np-share-btn np-share-native" data-share-native hidden>Share</button>
    ${links.map(([n, h]) => `<a class="np-share-btn" href="${esc(h)}"${h.startsWith('http') ? ' target="_blank" rel="noopener"' : ''}>${n}</a>`).join('')}
    <button type="button" class="np-share-btn" data-copy="${esc(url)}">Copy link</button>
    <button type="button" class="np-share-btn" data-copy="${esc(post)}">Copy for a post</button>
  </div>
  <p class="np-share-msg" data-share-msg role="status"></p>
</nav>`;
}

// Every way to follow along, for the end of a page.
export function followStrip({ feeds = [] } = {}) {
  const all = [['/news/feed.xml', `All of ${PAPER.name}`], ...feeds];
  return `<p class="np-follow"><span>Follow by RSS:</span> ${all.map(([h, l]) => `<a href="${esc(h)}">${esc(l)}</a>`).join(' · ')} · <a href="/newsletter/">Newsletter</a> · <a href="/events.ics">Events calendar</a></p>`;
}

// The morning edition, assembled from what is already published: weather
// link, three to five stories, what opens early, today's events and one
// business change. An editor reads it before it is sent through the
// newsletter service (we never build email delivery). docs/newspaper-plan.md, item 8.
import { stories as published } from './content.mjs';
import { EVENTS } from '../data/events.mjs';
import { directory } from '../data/directory.mjs';
import { ORIGIN } from '../jsonld.mjs';
import { PAPER } from '../data/paper.mjs';
import { sponsorsFor } from './sponsor-slot.mjs';
import { fmtRange } from '../hours.mjs';
import { bylineText } from './render.mjs';

const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// date: 'YYYY-MM-DD' in Columbus. now: the moment it's built, for "last 36 hours".
export function morningEdition({ date, now = new Date(), stories = published, events = EVENTS, dir = directory }) {
  const dow = new Date(`${date}T12:00:00Z`).getUTCDay();
  const recent = stories.filter((s) => now - new Date(s.published) < 36 * 3600e3 && new Date(s.published) <= now);
  const top = (recent.length >= 3 ? recent : stories.filter((s) => new Date(s.published) <= now)).slice(0, 5);
  const business = stories.find((s) => s.section === 'business' && !top.includes(s));
  const today = events.filter((e) => e.start <= date && e.end >= date);
  const early = dir.filter((b) => b.hours && !b.tempClosed && ['coffee-sweets', 'restaurants'].includes(b.cat) && b.hours.some((r) => r[0] === dow && r[1] <= 420)).slice(0, 6);
  const sponsors = sponsorsFor('newsletter', new Date(`${date}T12:00:00Z`));
  const link = (href) => (href.startsWith('http') ? href : ORIGIN + href);
  const rows = (b) => b.hours.filter((r) => r[0] === dow).map((r) => fmtRange(r[1], r[2])).join(', ');
  const sections = [
    ['Weather', `<p><a href="https://forecast.weather.gov/MapClick.php?lat=39.2014&amp;lon=-85.9214">Today’s forecast for Columbus</a> from the National Weather Service.</p>`],
    ['The news', top.length ? top.map((s) => `<p><strong><a href="${h(link(s.href))}">${h(s.headline)}</a></strong>${s.dek ? `<br>${h(s.dek)}` : ''}<br><small>${h(s.label)}, by ${h(bylineText(s))}</small></p>`).join('') : '<p>No new stories this morning.</p>'],
    ['Open early', early.length ? `<ul>${early.map((b) => `<li><a href="${h(link(`/b/${b.slug}/`))}">${h(b.name)}</a>, ${h(rows(b))}</li>`).join('')}</ul><p><small>Hours from their Google listings. Call ahead.</small></p>` : ''],
    ['Today', today.length ? `<ul>${today.map((e) => `<li><a href="${h(e.url)}">${h(e.name)}</a>, ${h(e.venue)}</li>`).join('')}</ul>` : ''],
    ['Business', business ? `<p><a href="${h(link(business.href))}">${h(business.headline)}</a></p>` : ''],
    ['Sponsored', sponsors.map((s) => `<p><strong>${h(s.name)}</strong>. ${h(s.line)} <small>Sponsors have no say in our coverage.</small></p>`).join('')],
  ].filter(([, html]) => html);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${h(PAPER.name)}, ${h(date)}</title></head><body style="font-family:Georgia,serif;max-width:600px;margin:auto;padding:16px;color:#1b1a17">
<h1 style="font-size:28px">${h(PAPER.name)}</h1><p>The morning edition, ${h(date)}</p>
${sections.map(([t, x]) => `<h2 style="font-size:18px;border-top:2px solid #1b1a17;padding-top:8px">${h(t)}</h2>${x}`).join('\n')}
<hr><p><small>You signed up at ${h(ORIGIN)}/newsletter/. Unsubscribe with the link your newsletter service adds below.</small></p></body></html>`;
  return { html, stories: top, events: today, early, business };
}

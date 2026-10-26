// Pieces every news page uses to show stories: cards, lists, bylines, dates.
import { esc, t } from '../layout.mjs';
import { person } from '../data/staff.mjs';
import { sectionBySlug, sectionHref } from './sections.mjs';
import { labelClass } from './labels.mjs';

const TZ = 'America/Indiana/Indianapolis';
const dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'long', day: 'numeric', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
// "November 2, 2026" and "November 2, 2026, 8:05 AM" in Columbus time.
export const fmtDay = (iso) => dayFmt.format(new Date(iso));
export const fmtWhen = (iso) => `${fmtDay(iso)}, ${timeFmt.format(new Date(iso)).replace(':00', '')}`;
// A correction date is a plain day ("2026-11-03"); read it at noon so no time zone moves it.
export const fmtDate = (d) => fmtDay(/T/.test(d) ? d : `${d}T12:00:00Z`);

export const label = (s) => `<span class="${labelClass(s.label)}">${esc(s.label)}</span>`;

const nameLink = (slug, sample) => {
  const p = person(slug, { sample });
  if (!p) return esc(slug);
  return p.sample ? `<span>${esc(p.name)}</span>` : `<a href="/staff/${p.slug}/">${esc(p.name)}</a>`;
};
const join = (xs) => (xs.length < 3 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
export const byline = (s) => `By ${join(s.bylines.map((b) => nameLink(b, s.sample)))}`;
export const editorLine = (s) => (s.editor ? `Edited by ${nameLink(s.editor, s.sample)}` : '');
export const bylineText = (s) => join(s.bylines.map((b) => person(b, { sample: s.sample })?.name || b));

const firstImage = (s) => s.images?.[0];

// One story in a list. size: 'lead' (front page top), 'card' (default), 'line' (headline only).
export function storyCard(s, { size = 'card', showSection = true } = {}) {
  const sec = sectionBySlug[s.section];
  const img = firstImage(s);
  return `
<article class="np-card np-card-${size}">
  ${img && size !== 'line' ? `<a class="np-card-img" href="${s.href}" tabindex="-1" aria-hidden="true"><img src="${esc(img.file)}" alt="" loading="lazy"></a>` : ''}
  <div class="np-card-body">
    <p class="np-card-kick">${label(s)}${showSection && sec ? ` <a href="${sectionHref(sec)}">${esc(sec.name)}</a>` : ''}</p>
    <h3><a href="${s.href}">${t(s.headline)}</a></h3>
    ${s.dek && size !== 'line' ? `<p class="np-card-dek">${t(s.dek)}</p>` : ''}
    <p class="np-card-meta">${esc(bylineText(s))} · <time datetime="${esc(s.published)}">${fmtDay(s.published)}</time></p>
  </div>
</article>`;
}

export const storyList = (items, opts = {}) =>
  items.length ? `<div class="np-list-grid">${items.map((s) => storyCard(s, opts)).join('')}</div>` : `<p class="np-empty">${esc(opts.empty || 'No stories here yet.')}</p>`;

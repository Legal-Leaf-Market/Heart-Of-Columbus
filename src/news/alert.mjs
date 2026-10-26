// Breaking news mode. One file, content/alert.json, turns on a banner on
// every page and fills /news/alert/ (what we know, closures, where to go,
// how to help, last updated). An editor flips it from the CMS. An alert
// with no expiry, or one that has expired, never shows: the build leaves it
// out, and the banner hides itself in the browser once its time passes, so
// a stale build can't keep it up either.
import { readFileSync } from 'node:fs';

const h = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const ALERT = JSON.parse(readFileSync(new URL('../../content/alert.json', import.meta.url), 'utf8'));
export const LEVELS = { breaking: 'Breaking', warning: 'Weather warning', update: 'Update' };

export const activeAlert = (a = ALERT, now = new Date()) =>
  !!(a && a.active && a.headline && a.expires && !isNaN(Date.parse(a.expires)) && Date.parse(a.expires) > now.getTime());

export function alertBanner(a = ALERT, now = new Date()) {
  if (!activeAlert(a, now)) return '';
  return `<div class="np-alert np-alert-${h(a.level)}" role="region" aria-label="Alert" data-expires="${h(a.expires)}">
  <div class="np-alert-row"><strong>${h(LEVELS[a.level] || 'Alert')}</strong> <span>${h(a.headline)}</span> <a href="/news/alert/">What we know</a></div>
  <script>(function(){var e=document.currentScript.parentNode;if(Date.now()>Date.parse(e.getAttribute('data-expires')))e.remove();})();</script>
</div>`;
}

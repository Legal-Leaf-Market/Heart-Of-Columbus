// The e-reader frame around a story: warm e-ink paper, a newspaper nameplate,
// and a status line like a Paperwhite's. public/js/kindle.js turns it into
// pages you tap or swipe through; without the script it is the same paper
// read by scrolling. Styles are public/css/kindle.css (add 'kindle.css' and
// 'kindle.js' to the page). Only the frame lives here; each page passes its
// own <article>.
import { esc } from './layout.mjs';
import { PAPER } from './data/paper.mjs';

// The nameplate at the top of the first page.
export const nameplate = (parts = []) => `
<div class="kd-mast">
  <p class="kd-mast-name">${esc(PAPER.name)}</p>
  <p class="kd-mast-line">${['Columbus, Indiana', ...parts].filter(Boolean).map((p) => `<span>${esc(p)}</span>`).join('')}</p>
</div>`;

export const reader = ({ section = '', inner }) => `
<div class="kd" data-kd>
  <div class="kd-device">
    <div class="kd-screen" data-kd-screen>
      <div class="kd-top" data-kd-chrome hidden>
        <span class="kd-top-name">${esc(PAPER.name)}</span>
        <span class="kd-clock" data-kd-clock aria-hidden="true"></span>
        <span class="kd-tools">
          <button type="button" class="kd-btn" data-kd-size aria-label="Text size">Aa</button>
          <button type="button" class="kd-btn" data-kd-mode aria-pressed="false">Scroll</button>
        </span>
      </div>
      <div class="kd-view" data-kd-view>
        <div class="kd-flow" data-kd-flow>${inner}<span class="kd-end" data-kd-end></span></div>
      </div>
      <div class="kd-bot" data-kd-chrome hidden>
        <button type="button" class="kd-btn kd-turn" data-kd-prev aria-label="Previous page">‹</button>
        <span class="kd-left" data-kd-left aria-live="polite"></span>
        <span class="kd-section">${esc(section)}</span>
        <span class="kd-pct" data-kd-pct></span>
        <button type="button" class="kd-btn kd-turn" data-kd-next aria-label="Next page">›</button>
      </div>
      <div class="kd-progress" data-kd-chrome hidden><i data-kd-bar></i></div>
    </div>
  </div>
</div>`;

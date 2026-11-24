// Fits the print edition (src/pages/print-pages.mjs) onto its 16 pages.
//
// The pages are laid out by CSS; this script does what CSS can't:
//   1. fills the December calendar from /api/events (the same feed /events/
//      reads), falling back to the hand-entered listings baked into the page;
//   2. flows Back YOUR Blue from page 8 onto page 9, splitting the paragraph
//      at the jump so no column ends early;
//   3. trims history pieces marked fit: 'trim' at a sentence, with a line
//      sending the reader to the QR code for the rest;
//   4. reports anything that still doesn't fit, outlined in pink on the page
//      and listed in the toolbar, so nothing is cut off silently.
// Fitting runs at full tabloid size before the reading view is restored.
(() => {
  const paper = document.querySelector('.pe-paper');
  if (!paper) return;
  const statusEl = document.querySelector('[data-pe-status]');
  const sheets = [...paper.querySelectorAll('.pe-sheet')];
  const issues = [];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const over = (e) => e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1;
  const pageOf = (e) => e.closest('.pe-sheet')?.dataset.page;
  const flag = (e, msg) => {
    e.classList.add('pe-over');
    if (!e.querySelector(':scope > .pe-over-tag')) { const t = el('span', 'pe-over-tag', msg); if (getComputedStyle(e).position === 'static') e.style.position = 'relative'; e.append(t); }
    issues.push(`Page ${pageOf(e)}: ${msg}`);
  };
  const what = (e) => {
    const m = e.closest('[data-slot],[data-src],[data-flow-id],.pe-box');
    if (!m) return 'this page';
    if (m.dataset.slot) return `the ${m.dataset.slot} story`;
    if (m.dataset.src) return `“${(m.querySelector('.pe-hed')?.textContent || m.dataset.src).trim()}”`;
    if (m.dataset.flowId) return 'the continued story';
    return 'a box';
  };

  // ---------- Splitting a paragraph at a word or a sentence ----------
  const WORD = /\s+/g, SENTENCE = /[.!?][”’")]*\s+/g;
  function boundaries(p, re) {
    const out = [];
    const w = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    for (let n; (n = w.nextNode());) { re.lastIndex = 0; for (let m; (m = re.exec(n.data));) out.push([n, m.index + m[0].length]); }
    return out;
  }
  function cut(p, [node, off]) {
    const a = document.createRange(); a.setStart(p, 0); a.setEnd(node, off);
    const b = document.createRange(); b.setStart(node, off); b.setEnd(p, p.childNodes.length);
    return [a.cloneContents(), b.cloneContents()];
  }
  // Puts back as much of paragraph `p` as fits in `box` before `before`.
  // Returns the leftover as a fragment, or null when none of it fit.
  function fillBack(box, p, before, re) {
    const bs = boundaries(p, re);
    let lo = 0, hi = bs.length, best = null;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2);
      const [head] = cut(p, bs[mid - 1]);
      const trial = p.cloneNode(false); trial.append(head);
      box.insertBefore(trial, before);
      const fits = !over(box);
      trial.remove();
      if (fits) { lo = mid; best = mid; } else hi = mid - 1;
    }
    if (!best) return { placed: null, rest: p };
    const [head, tail] = cut(p, bs[best - 1]);
    const placed = p.cloneNode(false); placed.append(head);
    // A paragraph split mid sentence must not end on a stray space.
    if (placed.lastChild?.nodeType === 3) placed.lastChild.data = placed.lastChild.data.replace(/\s+$/, '');
    box.insertBefore(placed, before);
    const rest = p.cloneNode(false); rest.append(tail); rest.classList.add('pe-cont');
    return { placed, rest };
  }

  // ---------- 2. Jumps: a story continued on another page ----------
  function flows() {
    for (const src of paper.querySelectorAll('.pe-text[data-flow-to]')) {
      const target = paper.querySelector(`.pe-flow[data-flow-id="${src.dataset.flowTo}"]`);
      const dst = target?.querySelector('.pe-text');
      if (!dst) continue;
      if (!over(src)) { target.closest('.pe-cell').classList.add('pe-flow-empty'); flag(target, 'Nothing continues here: the story fits on the page before'); continue; }
      const out = el('p', 'pe-jump-out', `<a href="#page-${pageOf(target)}">Continued on page ${pageOf(target)}</a>`);
      src.append(out);
      while (over(src) && src.children.length > 2) dst.prepend(out.previousElementSibling);
      const first = dst.firstElementChild;
      if (first && first.tagName === 'P') {
        const { placed, rest } = fillBack(src, first, out, WORD);
        if (placed) first.replaceWith(rest);
      }
      if (over(src)) flag(src.closest('.pe-mod'), 'The story still runs long before the jump');
      const jump = target.querySelector('.pe-jump');
      if (jump) {
        const back = el('a', '');
        back.href = `#page-${pageOf(src)}`;
        back.textContent = jump.textContent.trim();
        const headline = src.closest('.pe-mod').querySelector('.pe-hed')?.textContent.trim();
        jump.replaceChildren(back, headline ? `: ${headline}` : '');
      }
    }
  }

  // ---------- 3. Trims: history that may be cut at a sentence ----------
  function trims() {
    for (const text of paper.querySelectorAll('.pe-text[data-fit="trim"]')) {
      if (!over(text)) continue;
      const full = text.cloneNode(true);
      const more = el('p', 'pe-more', 'The rest of this story, with its sources, is online. Scan the code below.');
      text.append(more);
      let last = null;
      while (over(text) && text.children.length > 2) { last = more.previousElementSibling; last.remove(); }
      // Never end on a subhead with nothing under it.
      while (more.previousElementSibling && /^H\d$/.test(more.previousElementSibling.tagName) && text.children.length > 2) more.previousElementSibling.remove();
      if (last && last.tagName === 'P') fillBack(text, last, more, SENTENCE);
      if (over(text)) flag(text.closest('.pe-mod'), `${what(text)} does not fit even trimmed: something above it on the page runs long`);
      text.classList.add('pe-trimmed');
      full.classList.add('pe-full-text');
      text.after(full);
    }
  }

  // ---------- Short text: balance it, then fill the column ----------
  // A piece shorter than its space would otherwise fill one column to the
  // bottom and leave the rest empty. Balanced, it sits across all its columns.
  function balance() {
    for (const text of paper.querySelectorAll('.pe-fill .pe-text, .pe-lead-text .pe-text')) {
      if (text.dataset.flowTo || text.querySelector('.pe-more') || over(text)) continue;
      text.classList.add('pe-balance');
      const mod = text.closest('.pe-mod');
      if (mod && mod.parentElement.classList.contains('pe-cell')) mod.classList.add('pe-short');
    }
  }
  // What is left at the bottom of a column gets a card from our history on
  // that page's topic or, failing that, an ad for ourselves. A history card
  // runs once in the edition; an ad at most three times, once per page.
  // A slim coupon strip fits a gap this small.
  const MIN = 0.6 * 96;
  const elastic = '.pe-lines';
  function gapsNow(skipElastic) {
    paper.classList.add('pe-measure');
    const out = [];
    for (const cell of paper.querySelectorAll('.pe-cell')) {
      if (cell.querySelector('.pe-waiting, .pe-calendar, .pe-masthead, .pe-spread-head, .pe-byb-head, .pe-teasers, .pe-lead')) continue;
      if (skipElastic && cell.querySelector(elastic)) continue;
      // A text that fills its column to the bottom leaves nothing to fill.
      if ([...cell.querySelectorAll('.pe-text')].some((x) => x.closest('.pe-fill') && !x.classList.contains('pe-balance'))) continue;
      const bottom = Math.max(...[...cell.children].map((k) => k.getBoundingClientRect().bottom));
      const gap = cell.getBoundingClientRect().bottom - bottom;
      if (gap > MIN) out.push([cell, gap]);
    }
    paper.classList.remove('pe-measure');
    return out;
  }
  function fillers() {
    const tpl = document.getElementById('pe-fillers');
    if (!tpl) return;
    const pool = [...tpl.content.children];
    const cards = pool.filter((x) => x.dataset.hist);
    const ads = pool.filter((x) => x.dataset.house);
    const uses = new Map();
    let turn = 0;
    for (const [cell, gap] of gapsNow(false).sort((a, b) => b[1] - a[1])) {
      const sheet = cell.closest('.pe-sheet');
      const topics = (sheet.dataset.topics || '').split(' ');
      const row = cell.closest('.pe-row');
      const body = sheet.querySelector('.pe-body');
      const rot = (list) => list.slice(turn % Math.max(1, list.length)).concat(list.slice(0, turn % Math.max(1, list.length)));
      // Coupons biggest first, rotating among the shapes of one size.
      const bySize = {};
      for (const a of ads.filter((x) => x.dataset.cap)) (bySize[a.dataset.size || 2] ||= []).push(a);
      const coupons = Object.keys(bySize).filter((k) => k > 1).sort((a, b) => b - a).flatMap((k) => rot(bySize[k]));
      // Slim one line pieces only fill what the bigger ones leave.
      const slim = [...rot(bySize[1] || []), ...rot(ads.filter((a) => !a.dataset.cap && a.classList.contains('pe-house-slim')))];
      const order = [...coupons, ...cards.filter((c) => topics.includes(c.dataset.topic)), ...rot(ads.filter((a) => !a.dataset.cap && !a.classList.contains('pe-house-slim'))), ...rot(cards.filter((c) => !topics.includes(c.dataset.topic))), ...slim];
      let room = gap;
      cell.classList.add('pe-filled');
      for (let n = 0; n < 6 && room > MIN; n++) {
        let placed = false;
        for (const item of order) {
          const id = item.dataset.hist || item.dataset.house;
          const cap = item.dataset.hist ? 1 : Number(item.dataset.cap || item.dataset.max) || 3;
          const base = (item.dataset.house || '').replace(/-slim$/, '');
          if ((uses.get(id) || 0) >= cap || (base && sheet.querySelector(`[data-house="${base}"], [data-house="${base}-slim"]`))) continue;
          // One coupon per business on a page.
          if (item.dataset.biz && sheet.querySelector(`[data-biz="${item.dataset.biz}"]`)) continue;
          const before = row.getBoundingClientRect().height;
          const copy = item.cloneNode(true);
          copy.classList.add('pe-print-filler');
          cell.append(copy);
          if (squeezed(cell) || over(body) || row.getBoundingClientRect().height > before + 1) { copy.remove(); continue; }
          uses.set(id, (uses.get(id) || 0) + 1);
          room -= copy.getBoundingClientRect().height + 14;
          turn++;
          placed = true;
          break;
        }
        if (!placed) break;
      }
      if (!cell.querySelector('.pe-house, .pe-hcard, .pe-cp')) cell.classList.remove('pe-filled');
      // What is still left goes to the last ad in the column, which grows and
      // centers its content, so the column ends on color, not white space.
      // With nothing that can grow, the pieces spread evenly down the column.
      const grow = [...cell.children].filter((k) => k.matches('.pe-cp:not(.pe-cp-strip), .pe-house:not(.pe-house-slim)')).pop();
      if (grow) grow.classList.add('pe-grow');
      else if (cell.classList.contains('pe-filled')) cell.classList.add('pe-spread');
    }
    for (const [cell, gap] of gapsNow(true)) if (gap > 0.9 * 96) room_.push(`Page ${cell.closest('.pe-sheet').dataset.page}: about ${(gap / 96).toFixed(1)} inches free at the bottom of ${what(cell.firstElementChild || cell)}`);
  }
  const room_ = [];
  // Anything in the column pushed out of its box counts, not just the column.
  const squeezed = (cell) => over(cell) || [...cell.querySelectorAll('.pe-text, .pe-mod, .pe-box, .pe-stack, .pe-lines, .pe-cal-day')].some(over);

  // ---------- 1. The calendar ----------
  const MON = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ap = (m) => { if (m == null) return ''; m %= 1440; if (m === 720) return 'noon'; const h = Math.floor(m / 60), mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'a.m.' : 'p.m.'}`; };
  const short = (d) => { const [, m, dd] = d.split('-').map(Number); return `${MON[m - 1]} ${dd}`; };
  const dowOf = (d) => new Date(d + 'T12:00:00Z').getUTCDay();
  const key = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const venue = (v) => String(v || '').replace(/,.*$/, '');

  async function calendarData() {
    const box = paper.querySelector('[data-calendar]');
    if (!box) return;
    const from = box.dataset.from, days = Number(box.dataset.days);
    let events = JSON.parse(box.querySelector('.pe-cal-seed').textContent || '[]');
    let live = null;
    try {
      const ctl = new AbortController(); const timer = setTimeout(() => ctl.abort(), 9000);
      const r = await fetch(`/api/events?from=${from}&days=${days}`, { signal: ctl.signal });
      clearTimeout(timer);
      if (r.ok) { const j = await r.json(); if (Array.isArray(j.events) && j.events.length) { events = j.events; live = j.sources?.filter((s) => s.live && s.ok).map((s) => s.short) || []; } }
    } catch { /* the seed stands in */ }
    return { box, from, events, live };
  }

  function calendar(data) {
    if (!data) return;
    const { box, from, events, live } = data;
    const [Y, M] = from.split('-').map(Number);
    const last = new Date(Date.UTC(Y, M, 0)).getUTCDate();
    const dates = Array.from({ length: last }, (_, i) => `${from.slice(0, 8)}${String(i + 1).padStart(2, '0')}`);
    // Runs of several days go in the strip on top; things that repeat on the
    // same weekday three or more times go in "Every week" under the grid.
    const ongoing = events.filter((e) => e.until && e.until > e.date);
    const single = events.filter((e) => !(e.until && e.until > e.date));
    const groups = new Map();
    for (const e of single) { const k = `${key(e.title)}|${dowOf(e.date)}|${e.start}|${key(venue(e.venue))}`; (groups.get(k) || groups.set(k, []).get(k)).push(e); }
    const weekly = [], byDay = Object.fromEntries(dates.map((d) => [d, []]));
    for (const list of groups.values()) {
      if (list.length >= 3) weekly.push(list[0]);
      else for (const e of list) byDay[e.date]?.push(e);
    }
    const hol = JSON.parse(box.dataset.holidays || '{}');
    const grid = box.querySelector('.pe-cal-grid');
    grid.innerHTML = DAYS.map((d) => `<div class="dow">${d.slice(0, 3)}</div>`).join('');
    const lead = dowOf(dates[0]);
    if (lead) { const c = el('div', 'pe-cal-day blank', ongoing.length ? `<span class="hol">Running this month</span><ul>${ongoing.map((e) => `<li><b>${esc(short(e.date) === short(from) && e.date < from ? 'Now' : short(e.date))} to ${esc(short(e.until))}</b> ${esc(e.title)} <i>${esc(venue(e.venue))}</i></li>`).join('')}</ul>` : ''); c.style.gridColumn = `span ${lead}`; grid.append(c); }
    for (const d of dates) {
      const list = byDay[d].sort((a, b) => (a.start ?? -1) - (b.start ?? -1) || a.title.localeCompare(b.title));
      const cell = el('div', 'pe-cal-day', `<span class="n">${Number(d.slice(8))}</span><span class="pe-cal-dl">${DAYS[dowOf(d)]}, ${esc(short(d))}</span>${hol[d] ? `<span class="hol">${esc(hol[d])}</span>` : ''}<ul>${list.map((e) => `<li>${e.start != null ? `<b>${esc(ap(e.start))}</b> ` : ''}${esc(e.title)} <i>${esc(venue(e.venue))}</i></li>`).join('')}</ul>`);
      grid.append(cell);
    }
    const tail = (7 - ((lead + last) % 7)) % 7;
    grid.style.gridTemplateRows = `auto repeat(${(lead + last + tail) / 7}, minmax(0, 1fr))`;
    if (tail) { const c = el('div', 'pe-cal-day blank'); c.style.gridColumn = `span ${tail}`; grid.append(c); }
    const wl = box.querySelector('.pe-cal-weekly ul');
    const byDow = DAYS.map(() => []);
    for (const e of weekly) byDow[dowOf(e.date)].push(e);
    wl.innerHTML = byDow.map((list, d) => (list.length ? `<li><b>${DAYS[d]}s</b> ${list.sort((a, b) => (a.start ?? 0) - (b.start ?? 0)).map((e) => `${e.start != null ? esc(ap(e.start)) + ' ' : ''}${esc(e.title)} <i>(${esc(venue(e.venue))})</i>`).join(' · ')}</li>` : '')).join('');
    const note = box.querySelector('.pe-cal-live');
    if (note) note.textContent = live ? `Read from the ${live.join(' and ')} calendars on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, plus listings entered by hand` : '';
    if (!live) { const f = el('p', 'pe-flag', 'Calendar not filled yet: open this page on the live site'); box.append(f); issues.push('Page 11: the calendar shows only hand-entered listings. Open the edition on the live site so it reads the library and parks calendars.'); }
    // Cut each day to what fits, and say how many more there are.
    for (const cell of grid.querySelectorAll('.pe-cal-day')) {
      const ul = cell.querySelector('ul');
      if (!ul) continue;
      const entries = [...ul.children];
      let shown = entries.length;
      while (over(cell) && shown) entries[--shown].classList.add('pe-cal-extra');
      if (shown < entries.length) {
        if (shown) entries[--shown].classList.add('pe-cal-extra');
        cell.append(el('span', 'more', `+${entries.length - shown} more online`));
      }
    }
  }

  // ---------- 4. Report ----------
  function report() {
    for (const sh of sheets) {
      const body = sh.querySelector('.pe-body');
      if (over(body)) flag(body, 'This page runs past the bottom margin');
      for (const cell of sh.querySelectorAll('.pe-fill > .pe-cell')) if (over(cell)) flag(cell, `${what(cell.firstElementChild || cell)} is cut off at the bottom`);
      for (const text of sh.querySelectorAll('.pe-text')) {
        if (text.dataset.fit === 'trim' || text.dataset.flowTo || text.closest('.pe-over')) continue;
        if (over(text)) flag(text.closest('.pe-mod, .pe-box') || text, `${what(text)} runs long: cut it or give it more room`);
      }
    }
  }

  function zoomProof() {
    if (paper.classList.contains('pe-reading')) {
      paper.style.zoom = '';
      return;
    }
    paper.style.zoom = String(Math.min(1, (document.documentElement.clientWidth - 24) / 1056));
  }

  function toolbar() {
    const tb = document.querySelector('[data-pe-toolbar]');
    const proof = tb.querySelector('[data-pe-proof]');
    const print = tb.querySelector('[data-pe-print]');
    const menus = [...tb.querySelectorAll('[data-pe-menu]')];
    for (const menu of menus) {
      menu.addEventListener('toggle', () => {
        if (menu.open) for (const other of menus) if (other !== menu) other.open = false;
      });
      menu.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || !menu.open) return;
        menu.open = false;
        menu.querySelector('summary').focus();
      });
    }
    document.addEventListener('click', (event) => {
      for (const menu of menus) {
        if (!menu.contains(event.target) || event.target.closest('.pe-contents a')) menu.open = false;
      }
    });
    print.addEventListener('click', () => window.print());
    proof.addEventListener('click', () => {
      const headerBottom = tb.getBoundingClientRect().bottom;
      const current = [...sheets].reverse().find((sheet) => sheet.getBoundingClientRect().top <= headerBottom + 12);
      const reading = paper.classList.toggle('pe-reading');
      proof.setAttribute('aria-pressed', String(!reading));
      zoomProof();
      if (current) window.scrollBy(0, current.getBoundingClientRect().top - headerBottom - 12);
    });
    tb.querySelector('[data-pe-clean]').addEventListener('change', (event) => paper.classList.toggle('pe-clean', event.target.checked));
    addEventListener('resize', zoomProof);
    return { proof, print };
  }

  async function run() {
    const { proof, print } = toolbar();
    const [calendarInput] = await Promise.all([calendarData(), document.fonts.ready]);
    paper.classList.add('pe-fitting');
    try {
      calendar(calendarInput);
      flows();
      trims();
      balance();
      fillers();
      report();
    } finally {
      paper.classList.remove('pe-fitting');
    }
    const ok = !issues.length;
    if (statusEl) {
      statusEl.classList.add(ok ? 'ok' : 'bad');
      statusEl.textContent = ok ? `All ${sheets.length} pages fit.` : `${issues.length} thing${issues.length === 1 ? '' : 's'} to fix before printing:`;
      if (!ok) {
        const ul = el('ul', 'pe-tb-issues', issues.map((i) => `<li>${esc(i)}</li>`).join(''));
        statusEl.after(ul);
      }
    }
    proof.disabled = print.disabled = false;
    window.__peReport = { ok, pages: sheets.length, issues, room: room_ };
    document.documentElement.dataset.peReady = '1';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

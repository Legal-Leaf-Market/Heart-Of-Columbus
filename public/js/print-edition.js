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
  const colorPrint = document.querySelector('[data-pe-color-print]');
  if (colorPrint) {
    colorPrint.hidden = false;
    colorPrint.addEventListener('click', () => window.print());
  }
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
    for (const text of paper.querySelectorAll('.pe-fill .pe-text:not(.pe-full-text), .pe-lead-text .pe-text')) {
      if (text.dataset.flowTo || over(text)) continue;
      text.classList.add('pe-balance');
      const mod = text.closest('.pe-mod');
      if (mod && mod.parentElement.classList.contains('pe-cell')) mod.classList.add('pe-short');
    }
  }
  // Give unoccupied space to the field guides before using history or house notices.
  const MIN = 0.34 * 96;
  function gapIn(cell) {
    const bottom = Math.max(...[...cell.children].map((child) => child.getBoundingClientRect().bottom));
    return cell.getBoundingClientRect().bottom - bottom;
  }

  // Fill existing reading gaps without making a row taller or affecting the proof.
  const readerFillers = [...paper.querySelectorAll('.pe-color-preview, .pe-reader-trivia')];
  const wideReader = matchMedia('screen and (min-width: 901px)');
  function fitReadingExtras() {
    if (!wideReader.matches || !paper.classList.contains('pe-reading') || paper.classList.contains('pe-fitting')) return;
    for (const card of readerFillers) card.hidden = true;
    for (const card of readerFillers) {
      const cell = card.parentElement;
      if (gapIn(cell) < 64) continue;
      const row = cell.parentElement;
      const height = row.getBoundingClientRect().height;
      card.hidden = false;
      if (row.getBoundingClientRect().height > height + 1) card.hidden = true;
    }
  }

  function gapsNow() {
    paper.classList.add('pe-measure');
    const out = [];
    for (const cell of paper.querySelectorAll('.pe-cell')) {
      if (cell.querySelector('.pe-waiting, .pe-calendar, .pe-masthead, .pe-spread-head, .pe-byb-head, .pe-teasers, .pe-lead')) continue;
      const gap = gapIn(cell);
      if (gap > MIN) out.push([cell, gap]);
    }
    paper.classList.remove('pe-measure');
    return out;
  }

  function fillers() {
    const tpl = document.getElementById('pe-fillers');
    if (!tpl) return;
    const pool = [...tpl.content.children];
    const architecture = pool.filter((item) => item.dataset.landmark);
    const history = pool.filter((item) => item.dataset.hist);
    const trivia = pool.filter((item) => item.dataset.trivia);
    const notices = pool.filter((item) => item.dataset.house);
    const ad = pool.find((item) => item.dataset.printAd);
    const coloring = pool.filter((item) => item.dataset.coloring);
    for (const rail of paper.querySelectorAll('.pe-wide-rail')) {
      const art = coloring.find((item) => item.dataset.colorPage === pageOf(rail));
      if (!art) continue;
      const before = rail.getBoundingClientRect().height;
      const room = gapIn(rail);
      if (room < 250) continue;
      const card = art.cloneNode(true);
      rail.append(card);
      card.style.setProperty('--pe-color-height', `${Math.floor(room - (card.offsetHeight - card.querySelector('img').offsetHeight) - 15)}px`);
      if (rail.getBoundingClientRect().height > before + 1 || gapIn(rail) < -1) card.remove();
    }
    const uses = new Map();
    const gaps = gapsNow().sort((a, b) => b[1] - a[1]);
    for (const [cell] of gaps) {
      const sheet = cell.closest('.pe-sheet');
      const topics = (sheet.dataset.topics || '').split(' ');
      const row = cell.closest('.pe-row');
      const body = sheet.querySelector('.pe-body');
      const relatedFirst = (items) => [...items.filter((item) => topics.includes(item.dataset.topic)), ...items.filter((item) => !topics.includes(item.dataset.topic))];
      const printAd = ad && !sheet.querySelector('.pe-business-ad, .pe-ad, [data-print-ad]:not(.pe-reader-extra)') ? [ad] : [];
      const color = !cell.nextElementSibling && cell.previousElementSibling && !sheet.querySelector('[data-coloring]')
        ? coloring.find((item) => item.dataset.colorPage === sheet.dataset.page) : null;
      const order = [...(color ? [color] : []), ...architecture, ...printAd, ...relatedFirst(history), ...relatedFirst(trivia), ...notices];
      const before = row.getBoundingClientRect().height;
      const fits = () => !squeezed(cell) && !over(body) && row.getBoundingClientRect().height <= before + 1;
      const pageNotices = new Set([...sheet.querySelectorAll('[data-house]')].map((item) => item.dataset.house.replace(/-slim$/, '')));
      let placed = false;
      let hasGuide = Boolean(sheet.querySelector('[data-landmark]'));
      let hasTrivia = Boolean(sheet.querySelector('[data-trivia]'));
      cell.classList.add('pe-filled');
      for (const item of order) {
        const gap = gapIn(cell);
        if (gap < MIN) break;
        if (item.dataset.coloring && gap < 250) continue;
        const id = item.dataset.landmark || item.dataset.hist || item.dataset.trivia || item.dataset.house || item.dataset.printAd || item.dataset.coloring;
        const cap = item.dataset.house || item.dataset.printAd ? 2 : 1;
        const notice = item.dataset.house?.replace(/-slim$/, '');
        if ((uses.get(id) || 0) >= cap || (notice && pageNotices.has(notice))) continue;
        if (item.dataset.landmark && hasGuide) continue;
        if (item.dataset.trivia && hasTrivia) continue;
        const copy = item.cloneNode(true);
        copy.classList.toggle('pe-architecture-fill', Boolean(item.dataset.landmark));
        if (!item.dataset.landmark && !item.dataset.trivia) copy.classList.add('pe-print-filler');
        copy.classList.toggle('pe-architecture-feature', item.hasAttribute('data-landscape'));
        cell.append(copy);
        if (item.dataset.coloring) {
          const captionHeight = copy.offsetHeight - copy.querySelector('img').offsetHeight;
          copy.style.setProperty('--pe-color-height', `${Math.floor(gap - captionHeight - 15)}px`);
        }
        if (copy.classList.contains('pe-architecture-feature') && !fits()) copy.classList.remove('pe-architecture-feature');
        if (!fits()) {
          copy.remove();
          continue;
        }
        uses.set(id, (uses.get(id) || 0) + 1);
        if (notice) pageNotices.add(notice);
        if (item.dataset.landmark) hasGuide = true;
        if (item.dataset.trivia) hasTrivia = true;
        placed = true;
      }
      if (!placed) cell.classList.remove('pe-filled');
    }
    for (const cell of paper.querySelectorAll('.pe-cell')) {
      const gap = gapIn(cell);
      if (gap > 0.9 * 96 && !cell.querySelector('.pe-lines')) room_.push(`Page ${pageOf(cell)}: about ${(gap / 96).toFixed(1)} inches free after ${what(cell.firstElementChild || cell)}`);
    }
  }
  const room_ = [];
  // Anything in the column pushed out of its box counts, not just the column.
  const squeezed = (cell) => over(cell) || [...cell.querySelectorAll('.pe-text, .pe-mod, .pe-box, .pe-stack, .pe-lines, .pe-cal-day, .pe-architecture, .pe-business-ad')].some(over);

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
    const dayCells = [];
    for (const d of dates) {
      const list = byDay[d].sort((a, b) => (a.start ?? -1) - (b.start ?? -1) || a.title.localeCompare(b.title));
      const cell = el('div', 'pe-cal-day', `<span class="n">${Number(d.slice(8))}</span><span class="pe-cal-dl">${DAYS[dowOf(d)]}, ${esc(short(d))}</span>${hol[d] ? `<span class="hol">${esc(hol[d])}</span>` : ''}<ul>${list.map((e) => `<li>${e.start != null ? `<b>${esc(ap(e.start))}</b> ` : ''}${esc(e.title)} <i>${esc(venue(e.venue))}</i></li>`).join('')}</ul>`);
      grid.append(cell);
      dayCells.push(cell);
    }
    const tail = (7 - ((lead + last) % 7)) % 7;
    if (tail) { const c = el('div', 'pe-cal-day blank'); c.style.gridColumn = `span ${tail}`; grid.append(c); }
    const wl = box.querySelector('.pe-cal-weekly ul');
    const byDow = DAYS.map(() => []);
    for (const e of weekly) byDow[dowOf(e.date)].push(e);
    wl.innerHTML = byDow.map((list, d) => (list.length ? `<li><b>${DAYS[d]}s</b> ${list.sort((a, b) => (a.start ?? 0) - (b.start ?? 0)).map((e) => `${e.start != null ? esc(ap(e.start)) + ' ' : ''}${esc(e.title)} <i>(${esc(venue(e.venue))})</i>`).join(' · ')}</li>` : '')).join('');
    const note = box.querySelector('.pe-cal-live');
    if (note) note.textContent = live ? `Read from the ${live.join(' and ')} calendars on ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, plus listings entered by hand` : '';
    if (!live) { const f = el('p', 'pe-flag', 'Calendar not filled yet: open this page on the live site'); box.append(f); issues.push('Page 11: the calendar shows only hand-entered listings. Open the edition on the live site so it reads the library and parks calendars.'); }
    // Give busy weeks more of the fixed-height print grid. The reading
    // view uses content-height rows and restores every event below.
    const loads = Array((lead + last + tail) / 7).fill(0);
    for (const [i, cell] of dayCells.entries()) {
      const week = Math.floor((i + lead) / 7);
      loads[week] = Math.max(loads[week], cell.querySelector('ul').scrollHeight);
    }
    const ongoingList = grid.querySelector('.pe-cal-day.blank ul');
    if (ongoingList) loads[0] = Math.max(loads[0], ongoingList.scrollHeight);
    const average = Math.max(1, loads.reduce((sum, load) => sum + load, 0) / loads.length);
    const rows = loads.map((load) => `minmax(0, ${Math.max(0.75, Math.min(1.5, load / average)).toFixed(2)}fr)`);
    grid.style.gridTemplateRows = `auto ${rows.join(' ')}`;

    // Reserve space for the continuation line like any other listing.
    for (const cell of grid.querySelectorAll('.pe-cal-day')) {
      const entries = [...(cell.querySelector('ul')?.children || [])];
      if (!entries.length || !over(cell)) continue;
      const more = el('span', 'more');
      cell.append(more);
      let shown = entries.length;
      while (shown && over(cell)) {
        entries[--shown].classList.add('pe-cal-extra');
        more.textContent = `+${entries.length - shown} more online`;
      }
    }
  }

  // ---------- 4. Report ----------
  function report() {
    for (const sh of sheets) {
      const body = sh.querySelector('.pe-body');
      if (over(body)) flag(body, 'This page runs past the bottom margin');
      for (const cell of sh.querySelectorAll('.pe-fill > .pe-cell')) if (over(cell)) flag(cell, `${what(cell.firstElementChild || cell)} is cut off at the bottom`);
      for (const panel of sh.querySelectorAll('.pe-lead-l, .pe-architecture, .pe-business-ad')) {
        if (over(panel)) flag(panel, 'An illustrated panel runs out of space');
      }
      for (const text of sh.querySelectorAll('.pe-text:not(.pe-full-text)')) {
        if (text.dataset.flowTo || text.closest('.pe-over')) continue;
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
      fitReadingExtras();
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
    fitReadingExtras();
    addEventListener('resize', fitReadingExtras);
    if (document.readyState !== 'complete') addEventListener('load', fitReadingExtras, { once: true });
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

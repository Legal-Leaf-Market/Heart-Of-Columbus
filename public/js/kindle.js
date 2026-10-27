// Turns a story (src/kindle.mjs) into e-reader pages: tap the right side or
// swipe left for the next page, the left edge for the one before, or use the
// arrow keys. "Aa" steps the type size and "Scroll" goes back to one long
// page; both are remembered in this browser only. Without this script the
// story reads by scrolling, so nothing here is needed to read it.
(() => {
  const root = document.querySelector('[data-kd]');
  if (!root || !('CSS' in window) || !CSS.supports('column-fill', 'auto')) return;
  const view = root.querySelector('[data-kd-view]');
  const flow = root.querySelector('[data-kd-flow]');
  const end = root.querySelector('[data-kd-end]');
  const screen = root.querySelector('[data-kd-screen]');
  const $ = (s) => root.querySelector(s);
  const SIZES = [17, 19, 21, 24];
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private window */ } },
  };
  const words = (flow.textContent.match(/\S+/g) || []).length;
  let size = Math.max(0, SIZES.indexOf(Number(store.get('kd-size'))));
  if (store.get('kd-size') === null) size = 1;
  let paged = store.get('kd-mode') !== 'scroll';
  let page = 0, pages = 1, stride = 0, turns = 0, lastW = 0, lastH = 0;

  root.querySelectorAll('[data-kd-chrome]').forEach((el) => { el.hidden = false; });
  const modeBtn = $('[data-kd-mode]');

  const stickyTop = () => {
    const h = document.querySelector('.hdr');
    return h && getComputedStyle(h).position === 'sticky' ? h.offsetHeight : 0;
  };

  function status() {
    const pct = pages > 1 ? Math.round((page / (pages - 1)) * 100) : 100;
    const left = Math.max(0, Math.round((words * (1 - (page + 1) / pages)) / 230));
    $('[data-kd-left]').textContent = paged
      ? `Page ${page + 1} of ${pages} · ${page >= pages - 1 ? 'End of story' : left ? `${left} min left in story` : 'Under a minute left'}`
      : `${Math.max(1, Math.round(words / 230))} min read`;
    $('[data-kd-pct]').textContent = paged ? `${pct}%` : '';
    $('[data-kd-bar]').style.width = `${paged ? pct : 0}%`;
    $('[data-kd-prev]').disabled = !paged || page === 0;
    $('[data-kd-next]').disabled = !paged || page >= pages - 1;
  }

  function layout(keep = true) {
    const frac = keep && pages > 1 ? page / (pages - 1) : 0;
    root.style.setProperty('--kd-size', `${SIZES[size]}px`);
    modeBtn.setAttribute('aria-pressed', String(!paged));
    root.classList.toggle('kd-paged', paged);
    if (!paged) { flow.style.removeProperty('--kd-page'); status(); return; }
    const cs = getComputedStyle(flow);
    const w = view.clientWidth - parseFloat(cs.marginLeft) - parseFloat(cs.marginRight);
    const chrome = screen.offsetHeight - view.offsetHeight;
    const device = root.querySelector('.kd-device');
    const pad = device.offsetHeight - screen.offsetHeight;
    const h = Math.round(Math.max(340, Math.min(innerHeight - stickyTop() - chrome - pad - 48, 860)));
    root.style.setProperty('--kd-w', `${w}px`);
    root.style.setProperty('--kd-h', `${h}px`);
    lastW = innerWidth; lastH = innerHeight;
    const gap = parseFloat(getComputedStyle(flow).columnGap) || 0;
    stride = w + gap;
    flow.style.setProperty('--kd-page', 0);
    const x = end.getBoundingClientRect().left - flow.getBoundingClientRect().left;
    pages = Math.max(1, Math.floor((x + 1) / stride) + 1);
    go(Math.round(frac * (pages - 1)), false);
  }

  function go(n, flash = true) {
    page = Math.max(0, Math.min(pages - 1, n));
    flow.style.setProperty('--kd-page', page);
    // E-ink redraws the whole screen every few pages; a quick blink, unless motion is reduced.
    if (flash && ++turns % 6 === 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      screen.classList.add('kd-flash');
      setTimeout(() => screen.classList.remove('kd-flash'), 90);
    }
    status();
  }

  // Bring the screen fully into view before turning, so a turn never lands half hidden.
  function turn(d) {
    if (!paged) return;
    const r = root.getBoundingClientRect();
    if (r.top < stickyTop() - 2 || r.top > innerHeight * 0.25) scrollTo({ top: scrollY + r.top - stickyTop(), behavior: 'instant' });
    go(page + d);
  }

  const pageOf = (el) => Math.floor((el.getBoundingClientRect().left - flow.getBoundingClientRect().left + page * stride + 1) / stride);
  const interactive = (el) => el.closest('a, button, input, select, textarea, label, summary, iframe, [contenteditable]');

  view.addEventListener('click', (e) => {
    if (!paged || interactive(e.target) || String(getSelection()).trim()) return;
    const r = view.getBoundingClientRect();
    turn(e.clientX - r.left < r.width * 0.3 ? -1 : 1);
  });
  let sx = 0, sy = 0;
  view.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  view.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (paged && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) { turn(dx < 0 ? 1 : -1); e.preventDefault(); }
  });
  document.addEventListener('keydown', (e) => {
    if (!paged || e.altKey || e.ctrlKey || e.metaKey || e.target.closest('input, textarea, select, [contenteditable]')) return;
    const r = root.getBoundingClientRect();
    if (r.bottom < 80 || r.top > innerHeight - 80) return;
    const d = { ArrowRight: 1, PageDown: 1, ArrowLeft: -1, PageUp: -1 }[e.key];
    if (d) { e.preventDefault(); turn(d); }
  });
  // A link or button reached with Tab, or a #link inside the story, opens its page.
  flow.addEventListener('focusin', (e) => { if (paged) { view.scrollLeft = 0; const n = pageOf(e.target); if (n !== page) go(n, false); } });
  flow.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    const t = a && document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
    if (paged && t && flow.contains(t)) { e.preventDefault(); go(pageOf(t), false); }
  });
  $('[data-kd-prev]').addEventListener('click', () => turn(-1));
  $('[data-kd-next]').addEventListener('click', () => turn(1));
  $('[data-kd-size]').addEventListener('click', () => { size = (size + 1) % SIZES.length; store.set('kd-size', SIZES[size]); layout(); });
  modeBtn.addEventListener('click', () => { paged = !paged; store.set('kd-mode', paged ? 'paged' : 'scroll'); layout(); });
  // Phones change height as the address bar slides; only a real resize re-lays the pages.
  addEventListener('resize', () => { if (innerWidth !== lastW || Math.abs(innerHeight - lastH) > 120) layout(); });
  addEventListener('beforeprint', () => { if (paged) { paged = false; layout(); paged = true; } });
  addEventListener('afterprint', () => layout());

  const clock = $('[data-kd-clock]');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 30000);

  layout(false);
  if (document.fonts) document.fonts.ready.then(() => layout());
  addEventListener('load', () => layout());
})();

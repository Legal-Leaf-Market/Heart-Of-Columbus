// The homepage carousel (src/banners.mjs). Without this every slide shows
// in a row you can swipe. With it: slides out of season are hidden, the one
// that fits the hour in Columbus leads, and arrows and dots appear. It moves
// on its own every 7 seconds unless someone is touching it, has it in focus,
// or prefers reduced motion.
(() => {
  const root = document.querySelector('[data-sc]');
  if (!root) return;
  const track = root.querySelector('[data-sc-track]');
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const today = `${get('year')}-${get('month')}-${get('day')}`;
  const hour = Number(get('hour')) % 24;
  let slides = [...track.querySelectorAll('[data-sc-slide]')];
  for (const s of slides) if ((s.dataset.from && today < s.dataset.from) || (s.dataset.to && today > s.dataset.to)) s.remove();
  slides = [...track.querySelectorAll('[data-sc-slide]')];
  const leads = (s) => { const [a, b] = s.dataset.lead.split(',').map(Number); return hour >= a && hour < b; };
  const first = slides.find(leads);
  if (first && first !== slides[0]) track.prepend(first);
  slides = [...track.querySelectorAll('[data-sc-slide]')];
  slides.forEach((s, i) => s.setAttribute('aria-label', `${i + 1} of ${slides.length}: ${s.querySelector('.sc-k').textContent}`));
  if (slides.length < 2) return;

  const nav = root.querySelector('[data-sc-nav]'), dots = root.querySelector('[data-sc-dots]');
  nav.hidden = false;
  dots.innerHTML = slides.map((_, i) => `<button type="button" class="sc-dot" aria-label="Go to slide ${i + 1}"></button>`).join('');
  const dotEls = [...dots.children];
  const index = () => Math.round(track.scrollLeft / (slides[0].offsetWidth + 16));
  const go = (i) => { const n = (i + slides.length) % slides.length; track.scrollTo({ left: slides[n].offsetLeft - slides[0].offsetLeft, behavior: still ? 'auto' : 'smooth' }); };
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mark = () => { const i = index(); dotEls.forEach((d, j) => d.setAttribute('aria-current', String(i === j))); };
  root.querySelector('[data-sc-prev]').addEventListener('click', () => go(index() - 1));
  root.querySelector('[data-sc-next]').addEventListener('click', () => go(index() + 1));
  dotEls.forEach((d, i) => d.addEventListener('click', () => go(i)));
  track.addEventListener('scroll', () => requestAnimationFrame(mark), { passive: true });
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); } });
  mark();
  if (still) return;
  let paused = false;
  for (const ev of ['pointerenter', 'focusin', 'touchstart']) root.addEventListener(ev, () => { paused = true; }, { passive: true });
  for (const ev of ['pointerleave', 'focusout']) root.addEventListener(ev, () => { paused = false; });
  setInterval(() => { if (!paused && !document.hidden) go(index() + 1); }, 7000);
})();

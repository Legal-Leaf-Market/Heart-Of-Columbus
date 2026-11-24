// The floating "Need help?" dock (src/help-dock.mjs). Opens the sheet, loads
// /help/index.json the first time someone searches, matches every word they
// type against each resource's name, description and topic, and links each
// result to its place on /help/. "Leave this site fast" replaces this page
// in the history so the back button doesn't return to it.
(() => {
  const fab = document.querySelector('button[data-help-dock]');
  const sheet = document.querySelector('[data-help-sheet]');
  if (!fab || !sheet) return;
  // On the guide itself the button would only repeat the page.
  if (/^\/help\/?$/.test(location.pathname)) { fab.hidden = true; return; }
  const q = sheet.querySelector('[data-help-q]'), out = sheet.querySelector('[data-help-results]');
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const tel = (n) => 'tel:' + (n.replace(/\D/g, '').length === 10 ? '+1' : '') + n.replace(/\D/g, '');
  // A few everyday words for what the guide calls something else.
  const SYN = { rent: 'rent eviction housing utilities', eviction: 'eviction rent legal', ride: 'ride bus transit getting around', bus: 'bus transit ride', id: 'id identification birth certificate bmv', doctor: 'doctor health clinic medical', dentist: 'dental dentist', food: 'food pantry meal', meal: 'meal food', shelter: 'shelter sleep homeless', job: 'job work employment workone', lawyer: 'legal lawyer', drugs: 'recovery substance', alcohol: 'recovery substance', electric: 'utilities energy eap', heat: 'utilities energy eap', clothes: 'clothing', coat: 'clothing coat' };
  let items = null, loading = null;
  const load = () => loading || (loading = fetch('/help/index.json').then((r) => r.json()).then((d) => { items = d.items.map((i) => ({ ...i, hay: `${i.n} ${i.w} ${i.g} ${i.a}`.toLowerCase() })); }).catch(() => { items = []; }));

  function search() {
    const words = q.value.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 1);
    if (!words.length) { out.innerHTML = ''; return; }
    if (!items) { out.innerHTML = '<li class="hd-none">Looking…</li>'; load().then(search); return; }
    const hits = items.map((i) => {
      let score = 0;
      for (const w of words) {
        const alts = (SYN[w] || w).split(' ');
        const hit = alts.some((a) => i.hay.includes(a));
        if (!hit) return null;
        if (alts.some((a) => i.n.toLowerCase().includes(a))) score += 3; else score += 1;
      }
      return { i, score };
    }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 6);
    out.innerHTML = hits.length ? hits.map(({ i }) => `<li class="hd-hit">
      <a class="hd-hit-a" href="/help/#${esc(i.s)}"><span class="hd-hit-g">${esc(i.e)} ${esc(i.g)}</span><strong>${esc(i.n)}</strong><span class="hd-hit-w">${esc(i.w)}</span>${i.h ? `<span class="hd-hit-h">${esc(i.h)}</span>` : ''}</a>
      ${i.p ? `<a class="hd-call" href="${tel(i.p[1])}" aria-label="${esc(i.p[0])} ${esc(i.n)} at ${esc(i.p[1])}"><svg viewBox="0 0 24 24" class="hd-ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.6 3.5h2.8l1.5 4.2-2.1 1.5a12.5 12.5 0 0 0 6 6l1.5-2.1 4.2 1.5v2.8a2 2 0 0 1-2.2 2A17 17 0 0 1 4.5 5.7a2 2 0 0 1 2.1-2.2z"/></svg>${esc(i.p[1])}</a>` : ''}
    </li>`).join('') : `<li class="hd-none">Nothing matched. Try one word, or call 211: they find help for any need, day or night.</li>`;
  }
  let t;
  q.addEventListener('input', () => { clearTimeout(t); t = setTimeout(search, 120); });
  q.addEventListener('focus', load, { once: true });

  fab.addEventListener('click', () => {
    if (!sheet.showModal) { location.href = '/help/'; return; }
    sheet.showModal(); fab.setAttribute('aria-expanded', 'true');
  });
  sheet.addEventListener('close', () => { fab.setAttribute('aria-expanded', 'false'); fab.focus(); });
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  sheet.querySelector('[data-help-exit]').addEventListener('click', () => {
    try { sessionStorage.clear(); } catch (e) { /* private mode */ }
    location.replace('https://www.google.com/search?q=weather');
  });
  // The button tucks in while you scroll down and comes back when you stop
  // or scroll up, so it never sits on top of what you're reading for long.
  let last = scrollY, idle;
  addEventListener('scroll', () => {
    const y = scrollY;
    fab.classList.toggle('is-tucked', y > last + 4 && y > 200);
    last = y; clearTimeout(idle); idle = setTimeout(() => fab.classList.remove('is-tucked'), 900);
  }, { passive: true });
})();

// "Coming up in Columbus" on the homepage (homeEvents() in src/pages/events.mjs).
// Reads /api/events for the next two weeks, draws a swipeable row of poster
// cards (a program that repeats shows once, with its other dates counted),
// and gives each card Share and Add to calendar. Arrow buttons page the row,
// a bar shows how far along you are. Tapping a card opens a pop up with the
// organizer's link. If the feed can't be read the server's signature events
// stay, so the row is never empty.
(() => {
  const root = document.querySelector('[data-evw]');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const track = $('[data-evc-track]'), bar = $('[data-evc-progress]'), prev = $('[data-evc-prev]'), next = $('[data-evc-next]');
  const DAYS = 14, TZ = 'America/Indiana/Indianapolis', MAX = 30;
  const names = JSON.parse(root.dataset.srcNames || '{}');
  const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const nowMin = () => { const p = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date()); return Number(p.find((x) => x.type === 'hour').value) * 60 + Number(p.find((x) => x.type === 'minute').value); };
  const today = ymd(new Date());
  const addDays = (s, n) => { const d = new Date(`${s}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const label = (s, o) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...o }).format(new Date(`${s}T12:00:00Z`));
  const clock = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };
  const when = (e) => (e.start == null ? 'All day' : e.stop != null ? `${clock(e.start)} to ${clock(e.stop)}` : clock(e.start));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const tomorrow = addDays(today, 1);
  const dayWord = (d) => (d === today ? 'Today' : d === tomorrow ? 'Tomorrow' : label(d, { weekday: 'long' }));
  // This weekend: the coming Friday through Sunday (today counts if it is one).
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  const fri = dow === 0 ? addDays(today, -2) : dow === 6 ? addDays(today, -1) : addDays(today, 5 - dow);
  const sun = addDays(fri, 2);
  let all = [], filter = root.dataset.evwStart || 'all';

  const pass = (e) => filter === 'all' ? true
    : filter === 'today' ? e.date === today
    : filter === 'weekend' ? e.date >= fri && e.date <= sun
    : filter === 'kids' ? (e.aud || []).includes('kids') : !!e.live;
  const ended = (e) => e.date === today && (e.stop ?? e.start) != null && (e.stop ?? e.start + 60) < nowMin();
  const live = (e) => e.date === today && e.start != null && e.start <= nowMin() && !ended(e);

  // One card per program: the next time it happens, with its later dates.
  function cards() {
    const seen = new Map();
    for (const e of all.filter((x) => pass(x) && !ended(x))) {
      const k = (e.title + '|' + (e.venue || '')).toLowerCase();
      if (seen.has(k)) seen.get(k).more.push(e); else seen.set(k, { ...e, more: [] });
    }
    // Within a day, take turns between calendars (library, parks, arts...)
    // so the busiest one doesn't fill the first screen; days stay in order.
    const turn = new Map();
    return [...seen.values()].map((c) => {
      const k = c.date + '|' + c.src, n = turn.get(k) || 0;
      turn.set(k, n + 1);
      return { c, n };
    }).sort((a, b) => a.c.date.localeCompare(b.c.date) || a.n - b.n || (a.c.start ?? -1) - (b.c.start ?? -1)).map((x) => x.c);
  }
  function card(c, i) {
    const more = c.more.length;
    const day = dayWord(c.date);
    return `<li class="evc-card" data-src="${esc(c.src)}">
      <button type="button" class="evc-hit" data-i="${i}" aria-label="${esc(c.title)}, ${esc(day)} ${esc(when(c))}. More details">
        <span class="evc-date"><b>${label(c.date, { day: 'numeric' })}</b>${label(c.date, { month: 'short' })}</span>
        <span class="evc-tag">${live(c) ? '<i class="evc-live"></i>Happening now' : esc(day)}</span>
        <strong class="evc-t">${esc(c.title)}</strong>
        <span class="evc-m">${esc(when(c))}<br>${esc(c.venue || '')}</span>
        ${more ? `<span class="evc-more">+${more} more ${more === 1 ? 'date' : 'dates'}</span>` : ''}
      </button>
      <div class="evc-acts">
        <span class="evc-src">${esc(names[c.src] || '')}</span>
        <button type="button" class="evc-act" data-share="${i}" aria-label="Share ${esc(c.title)}"><svg viewBox="0 0 24 24" class="ic-sm" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg></button>
        <a class="evc-act" data-ics="${i}" aria-label="Add ${esc(c.title)} to my calendar" download><svg viewBox="0 0 24 24" class="ic-sm" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg></a>
      </div></li>`;
  }
  let shown = [];
  function draw() {
    shown = cards();
    track.innerHTML = shown.length ? shown.slice(0, MAX).map(card).join('')
      : `<li class="evc-card evc-empty"><a class="evc-hit" href="/events/"><strong class="evc-t">Nothing listed ${filter === 'today' ? 'for the rest of today' : filter === 'weekend' ? 'this weekend' : 'with this filter'} yet.</strong><span class="evc-m">See every listing on the events page.</span></a></li>`;
    track.querySelectorAll('[data-ics]').forEach((a) => { const c = shown[a.dataset.ics]; a.href = ics(c); a.setAttribute('download', fileName(c)); });
    $('[data-evc-count]').textContent = shown.length > MAX ? `${MAX} of ${shown.length} shown. The rest are on the events page.` : '';
    track.scrollLeft = 0; sync();
  }

  // ---------- Paging, progress ----------
  const step = () => { const c = track.querySelector('.evc-card'); return c ? (c.getBoundingClientRect().width + 16) * Math.max(1, Math.floor(track.clientWidth / (c.getBoundingClientRect().width + 16))) : track.clientWidth; };
  function sync() {
    const max = track.scrollWidth - track.clientWidth;
    const p = max > 0 ? track.scrollLeft / max : 1;
    bar.style.width = `${Math.max(8, Math.round((track.clientWidth / track.scrollWidth) * 100 + p * (100 - (track.clientWidth / track.scrollWidth) * 100)))}%`;
    prev.disabled = track.scrollLeft < 4;
    next.disabled = track.scrollLeft > max - 4;
  }
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
  track.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { next.click(); e.preventDefault(); } if (e.key === 'ArrowLeft') { prev.click(); e.preventDefault(); } });
  addEventListener('resize', sync);
  sync();

  // ---------- Share, calendar, pop up ----------
  function ics(e) {
    const d = (s) => s.replace(/-/g, '');
    const t = (m) => String(Math.floor(m / 60)).padStart(2, '0') + String(m % 60).padStart(2, '0') + '00';
    const txt = (s) => String(s || '').replace(/[\;,]/g, (c) => '\\' + c);
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heart of Columbus//Event//EN', 'BEGIN:VEVENT', `UID:${e.id}@heartofcolumbus`,
      e.start == null ? `DTSTART;VALUE=DATE:${d(e.date)}` : `DTSTART;TZID=${TZ}:${d(e.date)}T${t(e.start)}`,
      e.start != null && e.stop != null ? `DTEND;TZID=${TZ}:${d(e.date)}T${t(e.stop)}` : '',
      `SUMMARY:${txt(e.title)}`, `LOCATION:${txt((e.venue || '') + ', Columbus, Indiana')}`, `URL:${e.url}`, `DESCRIPTION:${txt('Details: ' + e.url)}`, 'END:VEVENT', 'END:VCALENDAR'].filter(Boolean);
    return 'data:text/calendar;charset=utf-8,' + encodeURIComponent(lines.join('\r\n'));
  }
  const fileName = (e) => (e.title || 'event').replace(/[^a-z0-9]+/gi, '-').slice(0, 40) + '.ics';
  function toast(msg, near) {
    let n = root.querySelector('.evc-toast');
    if (!n) { n = document.createElement('p'); n.className = 'evc-toast'; n.setAttribute('role', 'status'); root.appendChild(n); }
    n.textContent = msg; n.classList.add('is-on');
    clearTimeout(toast.t); toast.t = setTimeout(() => n.classList.remove('is-on'), 2200);
  }
  async function share(c) {
    const text = `${c.title}, ${dayWord(c.date)} ${label(c.date, { month: 'short', day: 'numeric' })}, ${when(c)}${c.venue ? ' at ' + c.venue : ''}. Found on Heart of Columbus.`;
    if (navigator.share) { try { await navigator.share({ title: c.title, text, url: c.url }); } catch (e) { /* closed */ } return; }
    try { await navigator.clipboard.writeText(`${text} ${c.url}`); toast('Copied. Paste it anywhere.'); }
    catch (e) { window.open(c.url, '_blank', 'noopener'); }
  }
  let cur = null;
  function open(c) {
    const pop = $('[data-evw-pop]');
    if (!pop.showModal) { window.open(c.url, '_blank', 'noopener'); return; }
    cur = c;
    $('[data-evw-pop-k]').textContent = `${dayWord(c.date)}, ${label(c.date, { month: 'long', day: 'numeric' })} · ${when(c)}`;
    $('[data-evw-pop-h]').textContent = c.title;
    $('[data-evw-pop-m]').textContent = [c.venue, c.ages && `Ages: ${c.ages}`].filter(Boolean).join('. ');
    $('[data-evw-pop-more]').textContent = c.more && c.more.length ? `Also ${c.more.slice(0, 4).map((m) => `${label(m.date, { weekday: 'short', month: 'short', day: 'numeric' })}${m.start != null ? ' ' + clock(m.start) : ''}`).join('; ')}${c.more.length > 4 ? `; and ${c.more.length - 4} more` : ''}.` : '';
    $('[data-evw-pop-go]').href = c.url;
    const a = $('[data-evw-pop-ics]'); a.href = ics(c); a.download = fileName(c);
    $('[data-evw-pop-src]').textContent = names[c.src] ? `From the ${names[c.src]} calendar.` : '';
    pop.showModal();
  }
  root.addEventListener('click', (ev) => {
    const f = ev.target.closest('[data-evw-filter]');
    if (f) { filter = f.dataset.evwFilter; root.querySelectorAll('[data-evw-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === f))); draw(); return; }
    const s = ev.target.closest('[data-share]'); if (s) { share(shown[s.dataset.share]); return; }
    const h = ev.target.closest('.evc-hit[data-i]'); if (h) open(shown[h.dataset.i]);
  });
  $('[data-evw-pop-share]').addEventListener('click', () => cur && share(cur));
  $('[data-evw-pop]').addEventListener('click', (ev) => { if (ev.target === ev.currentTarget) ev.currentTarget.close(); });

  fetch(`/api/events?from=${today}&days=${DAYS}`, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      all = (data.events || []).filter((e) => e.url && e.title).sort((a, b) => a.date.localeCompare(b.date) || (a.start ?? -1) - (b.start ?? -1));
      if (!all.length) return;
      $('[data-evw-tools]').hidden = false;
      draw();
    })
    .catch(() => {});
})();

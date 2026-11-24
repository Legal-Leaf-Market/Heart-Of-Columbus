// "This week in Columbus" on the homepage (homeEvents() in src/pages/events.mjs).
// Reads /api/events for fourteen days from today in Columbus, draws a tile per
// day with its count, lists the chosen day's events, and opens a pop up with
// the organizer's link and a one-event .ics file. If the feed can't be read
// the server's signature-events list stays, so the box is never empty.
(() => {
  const root = document.querySelector('[data-evw]');
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const DAYS = 14, TZ = 'America/Indiana/Indianapolis';
  const names = JSON.parse(root.dataset.srcNames || '{}');
  const ymd = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const today = ymd(new Date());
  const addDays = (s, n) => { const d = new Date(`${s}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const label = (s, o) => new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...o }).format(new Date(`${s}T12:00:00Z`));
  const clock = (m) => { const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h % 12 || 12}${mm ? ':' + String(mm).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };
  const when = (e) => (e.start == null ? 'All day' : e.stop != null ? `${clock(e.start)} to ${clock(e.stop)}` : clock(e.start));
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dates = Array.from({ length: DAYS }, (_, i) => addDays(today, i));
  let events = [], filter = 'all', day = today;

  const on = (e, d) => e.date <= d && (e.until || e.date) >= d;
  const pass = (e) => filter === 'all' || (filter === 'kids' ? (e.aud || []).includes('kids') : !!e.live);
  const forDay = (d) => events.filter((e) => on(e, d) && pass(e)).sort((a, b) => (a.start ?? -1) - (b.start ?? -1));

  function drawDays() {
    const box = $('[data-evw-days]');
    box.innerHTML = dates.map((d) => {
      const n = forDay(d).length;
      return `<button type="button" class="evw-day${n ? '' : ' is-empty'}" role="tab" data-day="${d}" aria-selected="${d === day}" aria-label="${label(d, { weekday: 'long', month: 'long', day: 'numeric' })}: ${n} ${n === 1 ? 'event' : 'events'}">
        <span class="evw-dow">${d === today ? 'Today' : label(d, { weekday: 'short' })}</span><b>${label(d, { day: 'numeric' })}</b><span class="evw-n">${n || ''}</span></button>`;
    }).join('');
    box.hidden = false;
  }
  function drawList() {
    const list = forDay(day);
    const head = `<p class="evw-dayh">${day === today ? 'Today' : label(day, { weekday: 'long' })}, ${label(day, { month: 'long', day: 'numeric' })}</p>`;
    $('[data-evw-list]').innerHTML = head + (list.length
      ? `<ul class="evw-rows" role="list">${list.slice(0, 8).map((e) => `<li><button type="button" class="evw-row" data-id="${esc(e.id)}"><span class="evw-when">${esc(when(e))}</span><span class="evw-what"><strong>${esc(e.title)}</strong><span>${esc(e.venue || '')}</span></span><span class="evw-src">${esc(names[e.src] || '')}</span></button></li>`).join('')}</ul>${list.length > 8 ? `<p class="evw-more"><a href="/events/">${list.length - 8} more on ${label(day, { weekday: 'long' })}</a></p>` : ''}`
      : `<p class="evw-none">Nothing listed for this day${filter === 'all' ? '' : ' with this filter'}. <a href="/events/">See every listing</a></p>`);
  }
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
  function open(id) {
    const e = events.find((x) => x.id === id);
    const pop = $('[data-evw-pop]');
    if (!e || !pop.showModal) { if (e) window.open(e.url, '_blank', 'noopener'); return; }
    $('[data-evw-pop-k]').textContent = `${label(day, { weekday: 'long', month: 'long', day: 'numeric' })} · ${when(e)}`;
    $('[data-evw-pop-h]').textContent = e.title;
    $('[data-evw-pop-m]').textContent = [e.venue, e.ages && `Ages: ${e.ages}`].filter(Boolean).join('. ');
    $('[data-evw-pop-go]').href = e.url;
    const a = $('[data-evw-pop-ics]'); a.href = ics(e); a.download = (e.title || 'event').replace(/[^a-z0-9]+/gi, '-').slice(0, 40) + '.ics';
    $('[data-evw-pop-src]').textContent = names[e.src] ? `From the ${names[e.src]} calendar.` : '';
    pop.showModal();
  }

  root.addEventListener('click', (ev) => {
    const d = ev.target.closest('[data-day]'); if (d) { day = d.dataset.day; drawDays(); drawList(); return; }
    const f = ev.target.closest('[data-evw-filter]');
    if (f) { filter = f.dataset.evwFilter; root.querySelectorAll('[data-evw-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === f))); drawDays(); drawList(); return; }
    const r = ev.target.closest('.evw-row[data-id]'); if (r) open(r.dataset.id);
  });
  $('[data-evw-pop]').addEventListener('click', (ev) => { if (ev.target === ev.currentTarget) ev.currentTarget.close(); });

  fetch(`/api/events?from=${today}&days=${DAYS}`, { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((data) => {
      events = (data.events || []).filter((e) => e.url && e.title);
      if (!events.length) return;
      // Start on the first day that has something, usually today.
      day = dates.find((d) => forDay(d).length) || today;
      $('[data-evw-tools]').hidden = false;
      drawDays(); drawList();
    })
    .catch(() => {});
})();

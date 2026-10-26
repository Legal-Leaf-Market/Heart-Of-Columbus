// Local events (/events/) and the printable listing (/events/print/).
// Reads /api/events (cached an hour at the CDN) and filters in the browser,
// so every view of the same days shares one cached answer. When the live
// feeds can't be reached it falls back to the hand-entered events in the
// page and says which calendars to check instead.
(function () {
  'use strict';
  var root = document.querySelector('[data-cal]');
  if (!root) return;
  var mode = root.getAttribute('data-cal');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var D = JSON.parse($('#page-data').textContent);
  var srcBy = {};
  D.sources.forEach(function (s) { srcBy[s.id] = s; });

  // Dates are 'YYYY-MM-DD' in Columbus time.
  var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var part = function (k) { return p.filter(function (x) { return x.type === k; })[0].value; };
  var TODAY = part('year') + '-' + part('month') + '-' + part('day');
  var DAY = 86400000;
  var ms = function (d) { return Date.parse(d + 'T00:00:00Z'); };
  var addDays = function (d, n) { return new Date(ms(d) + n * DAY).toISOString().slice(0, 10); };
  var dow = function (d) { return new Date(ms(d)).getUTCDay(); };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var AP = ['Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'];
  var md = function (d, names) { var a = d.split('-').map(Number); return names[a[1] - 1] + ' ' + a[2]; };
  var webDay = function (d) { return d === TODAY ? 'Today, ' + md(d, MON) : d === addDays(TODAY, 1) ? 'Tomorrow, ' + md(d, MON) : DAYS[dow(d)] + ', ' + md(d, MON); };
  var apDay = function (d) { return DAYS[dow(d)] + ', ' + md(d, AP); };

  // Same rule as the server: overlaps [from, to], listed under its first day there.
  function inWindow(items, from, to) {
    return items.filter(function (x) { return (x.until || x.date) >= from && x.date <= to; })
      .map(function (x) { return x.date < from ? Object.assign({}, x, { date: from }, x.until === from ? { when: 'Final day', ap: 'final day' } : {}) : x; })
      .sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : ((a.until ? 0 : 1) - (b.until ? 0 : 1)) || ((a.start == null ? -1 : a.start) - (b.start == null ? -1 : b.start)) || (a.title < b.title ? -1 : 1); });
  }

  var cache = {};
  function load(from, days) {
    var key = from + '|' + days;
    if (!cache[key]) {
      cache[key] = fetch('/api/events?from=' + from + '&days=' + days, { headers: { Accept: 'application/json' } })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .catch(function () {
          return { fallback: true, events: inWindow(D.fallback, from, addDays(from, days - 1)),
            sources: D.sources.map(function (s) { return { id: s.id, ok: !s.live, live: s.live }; }) };
        });
    }
    return cache[key];
  }

  var params = new URLSearchParams(location.search);
  var state = {
    src: (params.get('src') || D.sources.map(function (s) { return s.id; }).join(',')).split(',').filter(function (s) { return srcBy[s]; }),
    aud: params.get('aud') || '',
    q: params.get('q') || '',
  };
  var pick = function (events) {
    var q = state.q.trim().toLowerCase();
    return events.filter(function (e) {
      return state.src.indexOf(e.src) >= 0 && (!state.aud || (e.aud || []).indexOf(state.aud) >= 0) &&
        (!q || (e.title + ' ' + e.venue + ' ' + (e.ages || '')).toLowerCase().indexOf(q) >= 0);
    });
  };
  var statusEl = $('[data-cal-status]'), listEl = $('[data-cal-list]');
  function trouble(data) {
    var down = (data.sources || []).filter(function (s) { return !s.ok && state.src.indexOf(s.id) >= 0; });
    if (!down.length) return '';
    return ' Couldn’t reach ' + down.map(function (s) { var x = srcBy[s.id]; return '<a href="' + esc(x.calendar) + '" target="_blank" rel="noopener">the ' + esc(x.short.toLowerCase()) + ' calendar</a>'; }).join(' or ') + ' just now, so check it directly.';
  }
  function exportLinks(from, days) {
    $$('[data-cal-export]').forEach(function (a) {
      var q = 'format=' + a.getAttribute('data-cal-export') + '&from=' + from + '&days=' + days;
      if (state.src.length < D.sources.length) q += '&src=' + state.src.join(',');
      if (state.aud) q += '&aud=' + state.aud;
      a.href = '/api/events?' + q;
    });
  }

  // ---------- /events/ ----------
  if (mode === 'list') {
    $$('[data-ends]').forEach(function (el) { if (el.getAttribute('data-ends') < TODAY) el.parentNode.remove(); });
    state.range = ['today', 'weekend', 'week', 'month'].indexOf(params.get('range')) >= 0 ? params.get('range') : 'week';
    var span = function () {
      if (state.range === 'today') return [TODAY, TODAY];
      if (state.range === 'month') return [TODAY, addDays(TODAY, 29)];
      if (state.range === 'week') return [TODAY, addDays(TODAY, 6)];
      var d = dow(TODAY), fri = d === 0 ? addDays(TODAY, -2) : d === 6 ? addDays(TODAY, -1) : addDays(TODAY, (5 - d + 7) % 7);
      return [fri < TODAY ? TODAY : fri, addDays(fri, 2)];
    };
    var sync = function () {
      $$('[data-range]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-range') === state.range)); });
      $$('[data-src]').forEach(function (b) { b.setAttribute('aria-pressed', String(state.src.indexOf(b.getAttribute('data-src')) >= 0)); });
      $$('[data-aud]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-aud') === state.aud)); });
      var q = new URLSearchParams();
      if (state.range !== 'week') q.set('range', state.range);
      if (state.src.length < D.sources.length) q.set('src', state.src.join(','));
      if (state.aud) q.set('aud', state.aud);
      if (state.q) q.set('q', state.q);
      try { history.replaceState(null, '', location.pathname + (String(q) ? '?' + q : '')); } catch (e) { /* file:// */ }
      var pr = $('[data-cal-print]');
      if (pr) pr.href = '/events/print/' + (state.src.length < D.sources.length || state.aud ? '?' + new URLSearchParams({ src: state.src.join(','), aud: state.aud }) : '');
    };
    var render = function () {
      sync();
      var w = span();
      exportLinks(w[0], Math.round((ms(w[1]) - ms(w[0])) / DAY) + 1);
      load(TODAY, 31).then(function (data) {
        var list = pick(inWindow(data.events, w[0], w[1]));
        (data.sources || []).forEach(function (s) {
          var el = $('[data-src-state="' + s.id + '"]');
          if (el) el.textContent = s.ok ? (s.count != null && !data.fallback ? s.count + (s.count === 1 ? ' event' : ' events') + ' in the next 31 days.' : '') : 'Couldn’t reach their calendar just now.';
        });
        var groups = [], cur = null;
        list.forEach(function (e) { if (!cur || cur.date !== e.date) { cur = { date: e.date, items: [] }; groups.push(cur); } cur.items.push(e); });
        listEl.innerHTML = groups.map(function (g) {
          return '<section class="cal-day"><h2>' + esc(webDay(g.date)) + '</h2>' + g.items.map(function (e) {
            var s = srcBy[e.src] || { short: '', calendar: '#' };
            return '<article class="cal-ev"><p class="cal-time">' + esc(e.when) + '</p><div class="cal-body"><h3><a href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(e.title) + '</a></h3>' +
              '<p class="cal-meta">' + [e.venue, e.ages].filter(Boolean).map(esc).join(' · ') + '</p></div>' +
              '<a class="cal-tag cal-tag-' + esc(e.src) + '" href="' + esc(s.calendar) + '" target="_blank" rel="noopener" title="From the ' + esc(s.name) + ' calendar">' + esc(s.short) + '</a></article>';
          }).join('') + '</section>';
        }).join('');
        var n = list.length;
        statusEl.innerHTML = (n ? n + (n === 1 ? ' event' : ' events') : 'Nothing matches') + ', ' + esc(w[0] === w[1] ? md(w[0], MON) : md(w[0], MON) + ' to ' + md(w[1], MON)) + '.' + trouble(data);
      });
    };
    $$('[data-range]').forEach(function (b) { b.addEventListener('click', function () { state.range = b.getAttribute('data-range'); render(); }); });
    $$('[data-src]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-src'), i = state.src.indexOf(id);
        if (i >= 0 && state.src.length > 1) state.src.splice(i, 1); else if (i < 0) state.src.push(id);
        render();
      });
    });
    $$('[data-aud]').forEach(function (b) { b.addEventListener('click', function () { state.aud = b.getAttribute('data-aud'); render(); }); });
    var qIn = $('[data-cal-q]'), t;
    qIn.value = state.q;
    qIn.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { state.q = qIn.value; render(); }, 150); });
    render();
    return;
  }

  // ---------- /events/print/ ----------
  var fromIn = $('[data-pr-from]'), daysIn = $('[data-pr-days]'), audIn = $('[data-pr-aud]'), colsIn = $('[data-pr-cols]');
  var sheet = $('[data-pr-sheet]');
  fromIn.value = /^\d{4}-\d{2}-\d{2}$/.test(params.get('from') || '') ? params.get('from') : TODAY;
  if (params.get('days')) daysIn.value = params.get('days');
  audIn.value = state.aud;
  $$('[data-src]').forEach(function (c) { c.checked = state.src.indexOf(c.getAttribute('data-src')) >= 0; });
  var shown = [];
  function line(e) { return { title: e.title, rest: [e.ap, e.venue].filter(Boolean).join(', ') + '.' + (e.ages ? ' ' + e.ages + '.' : ''), tag: (srcBy[e.src] || {}).short || '' }; }
  function draw() {
    var from = fromIn.value || TODAY, days = Number(daysIn.value) || 7, to = addDays(from, days - 1);
    state.aud = audIn.value;
    state.src = $$('[data-src]').filter(function (c) { return c.checked; }).map(function (c) { return c.getAttribute('data-src'); });
    if (!state.src.length) { state.src = [D.sources[0].id]; $('[data-src="' + state.src[0] + '"]').checked = true; }
    sheet.style.setProperty('--cols', colsIn.value);
    exportLinks(from, days);
    var y = from.slice(0, 4), y2 = to.slice(0, 4);
    $('[data-pr-range]').textContent = md(from, AP) + (y !== y2 ? ', ' + y : '') + ' to ' + md(to, AP) + ', ' + y2;
    $('[data-pr-credit]').textContent = 'Listings from the public calendars of ' + state.src.map(function (s) { return srcBy[s].name + ' (' + srcBy[s].site + ')'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + '. Times and places can change; check with the organizer. Compiled by Heart of Columbus.';
    statusEl.textContent = 'Loading events…';
    load(from, days).then(function (data) {
      shown = pick(inWindow(data.events, from, to));
      var html = '', day = '';
      shown.forEach(function (e) {
        if (e.date !== day) { if (day) html += '</section>'; day = e.date; html += '<section class="pr-day"><h3>' + esc(apDay(day)) + '</h3>'; }
        var l = line(e);
        html += '<p class="pr-ev"><b>' + esc(l.title) + ':</b> ' + esc(l.rest) + ' <span class="pr-tag">' + esc(l.tag) + '</span></p>';
      });
      listEl.innerHTML = html + (day ? '</section>' : '<p class="pr-ev">No events in these days.</p>');
      statusEl.innerHTML = shown.length + (shown.length === 1 ? ' event' : ' events') + ' on the sheet.' + trouble(data);
    });
  }
  function asText() {
    var out = [$('[data-pr-range]').textContent.toUpperCase(), ''], day = '';
    shown.forEach(function (e) {
      if (e.date !== day) { if (day) out.push(''); day = e.date; out.push(apDay(day).toUpperCase()); }
      var l = line(e);
      out.push(l.title + ': ' + l.rest + ' (' + l.tag + ')');
    });
    out.push('', $('[data-pr-credit]').textContent);
    return out.join('\n');
  }
  [fromIn, daysIn, audIn, colsIn].forEach(function (el) { el.addEventListener('change', draw); });
  $$('[data-src]').forEach(function (c) { c.addEventListener('change', draw); });
  $('[data-pr-print]').addEventListener('click', function () { window.print(); });
  $('[data-pr-copy]').addEventListener('click', function () {
    var b = this, text = asText();
    var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy as text'; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) { /* nothing */ } ta.remove(); }
  });
  draw();
})();

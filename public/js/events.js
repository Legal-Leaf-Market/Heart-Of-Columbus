// Events: show only the ones that matter today, decided at load time so the
// static page is never stale between builds. On the home page that is the
// coming Friday to Sunday; on /visit/ every event that has not ended. Each
// card then lists places near the venue that are open during the event.
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Today's date in Columbus, as a UTC-midnight Date so day math is exact.
  var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var get = function (k) { return Number(p.filter(function (x) { return x.type === k; })[0].value); };
  var today = Date.UTC(get('year'), get('month') - 1, get('day'));
  var DAY = 86400000;
  var parse = function (s) { var a = s.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); };

  // The coming weekend: this one if it is already Friday to Sunday.
  var dow = new Date(today).getUTCDay();
  var fri = dow === 0 ? today - 2 * DAY : dow === 6 ? today - DAY : today + ((5 - dow + 7) % 7) * DAY;
  var sun = fri + 2 * DAY;

  // Open at any point in [from, to) minutes on weekday d (rows: [day, open, close]).
  function openDuring(rows, d, from, to) {
    return rows.some(function (r) {
      if (r[0] === d && r[1] < to && r[2] > from) return true;
      return r[0] === (d + 6) % 7 && r[2] > 1440 && r[2] - 1440 > from;
    });
  }

  $$('[data-events]').forEach(function (sec) {
    var weekend = sec.getAttribute('data-events') === 'weekend';
    var shown = 0;
    $$('[data-event]', sec).forEach(function (card) {
      var s = parse(card.getAttribute('data-start')), e = parse(card.getAttribute('data-end'));
      var from = Math.max(s, today, weekend ? fri : today);
      var to = weekend ? Math.min(e, sun) : Math.min(e, from + 2 * DAY);
      if (e < today || from > to) { card.remove(); return; }
      shown++;
      var times = (card.getAttribute('data-times') || '0,1440').split(',').map(Number);
      var days = [];
      for (var t = from; t <= to; t += DAY) days.push(new Date(t).getUTCDay());
      var near = JSON.parse(card.querySelector('[data-near]').textContent || '[]');
      var open = near.filter(function (n) { return days.some(function (d) { return openDuring(n[2], d, times[0], times[1]); }); }).slice(0, 6);
      if (!open.length) return;
      var box = card.querySelector('[data-ev-near]');
      box.innerHTML = '<p>Open near the venue ' + (days.length > 1 ? 'on ' + days.map(function (d) { return DAYS[d]; }).join(', ') : 'that ' + (times[0] >= 960 ? 'evening' : 'day')) + '</p>' +
        open.map(function (n) { return '<a href="/b/' + n[0] + '/">' + esc(n[1]) + '</a>'; }).join('');
      box.hidden = false;
    });
    sec.hidden = !shown;
  });
})();

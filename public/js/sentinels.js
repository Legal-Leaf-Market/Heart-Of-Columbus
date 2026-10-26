// Indiana Sentinels dashboard and the /sports/ card: pick the next game at
// load time (Columbus time), mark games already played, filter the
// schedule, and on the dashboard register the offline worker and offer
// the install prompt.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var el = document.getElementById('page-data');
  var data = el ? JSON.parse(el.textContent) : {};
  var games = data.games || [];
  var DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DAY = 86400000;

  // Today and the minute of the day in Columbus.
  var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  var get = function (k) { return Number(p.filter(function (x) { return x.type === k; })[0].value); };
  var today = Date.UTC(get('year'), get('month') - 1, get('day'));
  var nowMin = get('hour') * 60 + get('minute');
  var parse = function (s) { var a = s.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); };
  var mins = function (t) { var a = t.split(':').map(Number); return a[0] * 60 + a[1]; };
  var clock = function (t) { var m = mins(t), h = Math.floor(m / 60); return (h % 12 || 12) + ':' + String(m % 60).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); };
  var day = function (s) { var d = new Date(parse(s)); return DAYS[d.getUTCDay()] + ', ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCDate(); };

  // A game is still to come until about three hours after puck drop.
  var ahead = function (g) {
    if (g.r) return false;
    var d = parse(g.d);
    if (d !== today) return d > today;
    return !g.t || nowMin < mins(g.t) + 180;
  };
  var next = games.filter(ahead)[0];

  $$('[data-next]').forEach(function (card) {
    if (!next) {
      $('[data-next-when]', card).textContent = 'Season over';
      $('[data-next-count]', card).hidden = true;
      return;
    }
    $('[data-next-when]', card).textContent = day(next.d) + (next.t ? ', ' + clock(next.t) : '');
    $('[data-next-ha]', card).textContent = next.h ? 'vs' : 'at';
    $('[data-next-opp]', card).textContent = next.o;
    $('[data-next-where]', card).textContent = next.h ? data.arena : next.c || 'Road game';
    var n = Math.round((parse(next.d) - today) / DAY), live = n === 0 && next.t && nowMin >= mins(next.t);
    var count = $('[data-next-count]', card);
    count.textContent = live ? 'On now' : n === 0 ? (next.t && mins(next.t) >= 1020 ? 'Tonight' : 'Today') : n === 1 ? 'Tomorrow' : 'In ' + n + ' days';
    count.hidden = false;
  });

  // The schedule: dim what's played, highlight the next game, filter.
  var rows = $$('[data-game]');
  rows.forEach(function (row) {
    var d = parse(row.getAttribute('data-date'));
    if (d < today) row.classList.add('sn-past');
    if (next && row.getAttribute('data-date') === next.d && Number(row.getAttribute('data-home')) === next.h) {
      row.classList.add('sn-is-next');
      row.setAttribute('aria-current', 'date');
    }
  });
  $$('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      rows.forEach(function (row) {
        var home = row.getAttribute('data-home') === '1';
        var left = !row.classList.contains('sn-done') && !row.classList.contains('sn-past');
        row.hidden = (f === 'home' && !home) || (f === 'away' && home) || (f === 'left' && !left);
      });
      $$('[data-month]').forEach(function (m) { m.hidden = !$$('[data-game]', m).some(function (r) { return !r.hidden; }); });
    });
  });

  // Dashboard only: offline copy and the install button.
  if (!$('[data-install]')) return;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sports/sentinels/sw.js', { scope: '/sports/sentinels/' }).catch(function () {}); });
  }
  var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (standalone) $('[data-installed]').hidden = false;
  var prompt = null, btn = $('[data-install]');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    prompt = e;
    btn.hidden = false;
  });
  btn.addEventListener('click', function () {
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then(function () { prompt = null; btn.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { btn.hidden = true; });
})();

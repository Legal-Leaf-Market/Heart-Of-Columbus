// Saved page as a trip: a share link (/saved/?ids=) that opens a read-only
// copy of someone's list, saved landmarks and events, a day and time check
// against each place's hours, and a printable page with a QR code back to
// the list. Loads before explore.js, which draws the businesses.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var bar = $('[data-trip]');
  if (!bar) return;
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var data = JSON.parse(($('#page-data') || {}).textContent || '{}');
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var SLOTS = { any: [0, 1440], morning: [480, 720], afternoon: [720, 1020], evening: [1020, 1320] };
  var SLOT_LABEL = { any: '', morning: ' morning', afternoon: ' afternoon', evening: ' evening' };

  // ---------- Shared lists ----------
  var shared = (new URLSearchParams(location.search).get('ids') || '').split(',').map(function (s) { return decodeURIComponent(s).trim(); }).filter(Boolean).slice(0, 200);
  var list = function () { return shared.length ? shared : window.HoCSaved(); };
  if (shared.length) {
    window.HoCTripIds = function () { return shared; };
    $('[data-trip-shared]').hidden = false;
    $('[data-trip-shared-msg]').textContent = 'Someone shared a list of ' + shared.length + (shared.length === 1 ? ' place' : ' places') + ' with you. It isn’t saved on this device yet.';
    $('[data-trip-adopt]').addEventListener('click', function () {
      var mine = window.HoCSaved();
      shared.forEach(function (id) { if (mine.indexOf(id) === -1) mine.push(id); });
      try { localStorage.setItem('hoc.saved', JSON.stringify(mine)); } catch (e) { /* private mode */ }
      location.href = '/saved/';
    });
  }
  var shareUrl = function () { return location.origin + '/saved/?ids=' + list().map(encodeURIComponent).join(','); };

  // ---------- Saved landmarks and events ----------
  function extras() {
    var ids = list(), box = $('[data-trip-extras]');
    var pick = function (arr, pre) { return (arr || []).filter(function (x) { return ids.indexOf(pre + x.s) !== -1; }); };
    var lms = pick(data.landmarks, 'l:'), evs = pick(data.events, 'e:');
    var row = function (x, pre, href, kind) {
      return '<li><span class="trip-kind">' + kind + '</span><a href="' + href + '"' + (pre === 'e:' ? ' target="_blank" rel="noopener"' : '') + '>' + esc(x.n) + '</a><small>' + esc(x.d) + ' · ' + esc(x.a) + '</small>' +
        (shared.length ? '' : '<button type="button" class="trip-x" data-save="' + pre + x.s + '" aria-label="Remove ' + esc(x.n) + '">Remove</button>') + '</li>';
    };
    box.innerHTML = lms.length || evs.length
      ? '<ul class="trip-list">' + lms.map(function (x) { return row(x, 'l:', '/l/' + x.s + '/', 'Landmark'); }).join('') + evs.map(function (x) { return row(x, 'e:', x.u, 'Event'); }).join('') + '</ul>'
      : '';
    box.hidden = !box.innerHTML;
    // The empty state is about businesses; don't show it over saved landmarks.
    var empty = $('[data-ex-empty]');
    if (empty) empty.classList.toggle('trip-has-extras', !box.hidden);
  }

  // ---------- When are you going? ----------
  var daySel = $('[data-trip-day]'), timeSel = $('[data-trip-time]');
  var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date());
  var g = function (k) { return Number(p.filter(function (x) { return x.type === k; })[0].value); };
  var today = Date.UTC(g('year'), g('month') - 1, g('day'));
  daySel.innerHTML = '<option value="">Any day</option>' + [0, 1, 2, 3, 4, 5, 6].map(function (i) {
    var d = new Date(today + i * 86400000);
    var label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAYS[d.getUTCDay()];
    return '<option value="' + d.getUTCDay() + '">' + label + ', ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) + '</option>';
  }).join('');
  try { var keep = JSON.parse(sessionStorage.getItem('hoc.trip') || '{}'); if (keep.day != null) daySel.value = keep.day; if (keep.time) timeSel.value = keep.time; } catch (e) { /* storage off */ }

  var fmt = function (m) { m = m % 1440; var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + ' ' + (h < 12 ? 'AM' : 'PM'); };
  function hoursOn(rows, d) {
    var r = rows.filter(function (x) { return x[0] === d; });
    return r.length ? r.map(function (x) { return x[1] === 0 && x[2] === 1440 ? 'Open 24 hours' : fmt(x[1]) + ' to ' + fmt(x[2]); }).join(', ') : 'Closed';
  }
  function openDuring(rows, d, w) {
    return rows.some(function (r) {
      if (r[0] === d && r[1] < w[1] && r[2] > w[0]) return true;
      return r[0] === (d + 6) % 7 && r[2] > 1440 && r[2] - 1440 > w[0];
    });
  }
  var hours = {};
  function paintDay() {
    try { sessionStorage.setItem('hoc.trip', JSON.stringify({ day: daySel.value, time: timeSel.value })); } catch (e) { /* storage off */ }
    var day = daySel.value === '' ? null : Number(daySel.value), w = SLOTS[timeSel.value] || SLOTS.any;
    $$('[data-ex-grid] .bz[data-slug]').forEach(function (card) {
      var el = $('.trip-day', card);
      if (day === null) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement('p'); $('.bz-body', card).appendChild(el); }
      var rows = hours[card.getAttribute('data-slug')];
      var when = DAYS[day] + SLOT_LABEL[timeSel.value];
      if (!rows) { el.className = 'trip-day trip-unknown'; el.textContent = 'No hours listed. Call before ' + when + '.'; return; }
      var ok = openDuring(rows, day, w);
      el.className = 'trip-day ' + (ok ? 'trip-ok' : 'trip-closed');
      el.textContent = (ok ? 'Open ' : 'Closed ') + when + ' · ' + DAYS[day].slice(0, 3) + ': ' + hoursOn(rows, day);
    });
  }
  daySel.addEventListener('change', paintDay);
  timeSel.addEventListener('change', paintDay);

  // ---------- Share and print ----------
  var shareBtn = $('[data-trip-share]');
  shareBtn.addEventListener('click', function () {
    var url = shareUrl();
    if (navigator.share) navigator.share({ title: 'My Columbus list', url: url }).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { $('span', shareBtn).textContent = 'Link copied'; });
    else prompt('Copy this link', url);
  });
  $('[data-trip-print]').addEventListener('click', function () { window.print(); });
  // Walking order on the map: the sort lives in the filters, which a phone hides.
  $('[data-trip-walk]').addEventListener('click', function () {
    var sort = $('[data-ex-sort]');
    sort.value = 'walk';
    sort.dispatchEvent(new Event('change'));
    var map = $('[data-view="map"]');
    if (map) map.click();
  });
  var qrLoaded = null;
  function paintQr() {
    var url = shareUrl();
    $('[data-trip-url]').textContent = url;
    if (!list().length) return;
    qrLoaded = qrLoaded || new Promise(function (res) {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
      s.onload = function () { res(window.qrcode); };
      s.onerror = function () { res(null); };
      document.head.appendChild(s);
    });
    qrLoaded.then(function (qrcode) {
      if (!qrcode) return;
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      $('[data-trip-qr]').innerHTML = qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
    });
  }

  function refresh() { extras(); paintQr(); }
  document.addEventListener('hoc:saved', refresh);
  document.addEventListener('hoc:rendered', paintDay);
  window.HoCDir().then(function (all) {
    all.forEach(function (b) { if (b.t) hours[b.s] = b.t; });
    paintDay();
  });
  refresh();
})();

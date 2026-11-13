// Type pages (VIEW_TYPES in src/pages/directory-pages.mjs): the same filtered
// list as Cards, a Map beside the list (Airbnb style: hover a card to find its
// pin, search as you move the map), a sortable Table, or a Board grouped by
// neighborhood, booking or open now. list.js decides what matches; every view
// draws only the cards it left visible. The view rides in ?view= so a link
// opens the same view. Nothing here hides a place the filter didn't.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var root = $('[data-v-root]');
  if (!root) return;
  var bar = $('[data-v-bar]'), list = $('[data-v-list]'), mapBox = $('[data-v-map]'), canvas = $('[data-v-canvas]');
  var tableBox = $('[data-v-table]'), boardBox = $('[data-v-board]'), float = $('[data-v-float]');
  var groupBox = $('[data-v-group-box]'), groupSel = $('[data-v-group]'), move = $('[data-v-move]'), note = $('[data-v-note]');
  var data = JSON.parse($('[data-v-data]').textContent);
  var VIEWS = ['cards', 'map', 'table', 'board'];
  var params = new URLSearchParams(location.search);
  var st = {
    view: VIEWS.indexOf(params.get('view')) > -1 ? params.get('view') : 'cards',
    group: ['area', 'book', 'open'].indexOf(params.get('group')) > -1 ? params.get('group') : 'area',
    sort: '', dir: 1, move: false, last: 'cards',
  };
  var ICON = {
    map: '<svg viewBox="0 0 24 24" class="ic-sm" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/></svg>',
    list: '<svg viewBox="0 0 24 24" class="ic-sm" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    fit: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    cal: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9 15l2 2 4-4"/></svg>',
    cut: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="7" r="2.6"/><circle cx="6" cy="17" r="2.6"/><path d="M8.2 8.4 20 17M8.2 15.6 20 7"/></svg>',
  };
  var items = [];

  // ---------- Facts for one place ----------
  var openOf = function (i) { return i.b && i.b.t ? window.HoCOpen(i.b.t) : null; };
  var area = function (i) { return (i.b && data.areas[i.b.r]) || ''; };
  var tel = function (p) { return 'tel:+1' + String(p).replace(/\D/g, ''); };
  var shown = function () { return items.filter(function (i) { return !i.el.hidden; }); };
  var shortName = function (n) { n = String(n).replace(/[’']s\b/g, '’s'); return n.length > 22 ? n.slice(0, 20).replace(/\s+\S*$/, '') + '…' : n; };
  var openLine = function (i, cls) {
    var o = openOf(i);
    return '<p class="' + cls + (o ? (o.open ? ' is-open' : ' is-closed') : ' is-unknown') + '">' + esc(o ? o.label : 'Hours not listed') + '</p>';
  };
  // Its own booking or ordering page first; the shop link on its page next.
  var onlineBtn = function (i, cls) {
    if (i.x.b) return '<a class="vbtn vbtn-book ' + cls + '" href="' + esc(i.x.b[1]) + '" target="_blank" rel="noopener">' + ICON.cal + 'Book online</a>';
    if (i.x.o) return '<a class="vbtn ' + cls + '" href="' + esc(i.x.o[1]) + '" target="_blank" rel="noopener">Order online</a>';
    if (i.b && i.b.f) return '<a class="vbtn ' + cls + '" href="/b/' + i.s + '/#shop">Shop online</a>';
    return '';
  };
  // A painted category scene is never shown without its tag.
  var thumb = function (i, cls) {
    if (!i.img) return '';
    return '<span class="' + cls + '"><img src="' + esc(i.img) + '" alt="" loading="lazy" decoding="async">' + (i.ed ? '<span class="ed-tag">Category illustration</span>' : '') + '</span>';
  };

  // ---------- Switching ----------
  function setView(v, opts) {
    if (VIEWS.indexOf(v) === -1) return;
    if (v !== 'map' && st.view !== v) st.last = v;
    st.view = v;
    render();
    if (opts && opts.scroll) bar.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  }
  function syncUrl() {
    var p = new URLSearchParams(location.search);
    if (st.view === 'cards') p.delete('view'); else p.set('view', st.view);
    if (st.view === 'board' && st.group !== 'area') p.set('group', st.group); else p.delete('group');
    var q = p.toString();
    history.replaceState(history.state, '', location.pathname + (q ? '?' + q : '') + location.hash);
  }
  function render() {
    var v = st.view;
    root.setAttribute('data-view', v);
    $$('[data-v]', bar).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-v') === v)); });
    groupBox.hidden = v !== 'board';
    list.hidden = v === 'table' || v === 'board';
    mapBox.hidden = v !== 'map';
    tableBox.hidden = v !== 'table';
    boardBox.hidden = v !== 'board';
    float.innerHTML = v === 'map' ? ICON.list + '<span>List</span>' : ICON.map + '<span>Map</span>';
    float.setAttribute('aria-label', v === 'map' ? 'Show the list' : 'Show the map');
    if (v !== 'map') offMap(null);
    if (v === 'map') drawMap();
    if (v === 'table') drawTable();
    if (v === 'board') drawBoard();
    syncUrl();
  }

  // ---------- Map: Leaflet + OpenStreetMap, loaded the first time it opens ----------
  var leaflet = null, map = null, layer = null, pins = {}, framed = false, pending = '';
  function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (leaflet) return leaflet;
    leaflet = new Promise(function (res, rej) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = function () { res(window.L); };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return leaflet;
  }
  function drawMap() {
    loadLeaflet().then(function (L) {
      if (!map) {
        map = L.map(canvas, { zoomControl: false, scrollWheelZoom: true, zoomSnap: 0.5 }).setView([39.2014, -85.9214], 13);
        L.control.zoom({ position: 'topright', zoomInTitle: 'Zoom in', zoomOutTitle: 'Zoom out' }).addTo(map);
        var Fit = L.Control.extend({
          options: { position: 'topright' },
          onAdd: function () {
            var b = L.DomUtil.create('button', 'vmap-fit leaflet-bar');
            b.type = 'button'; b.title = 'Show every pin'; b.setAttribute('aria-label', 'Show every pin'); b.innerHTML = ICON.fit;
            L.DomEvent.disableClickPropagation(b);
            L.DomEvent.on(b, 'click', function () { fit(); });
            return b;
          },
        });
        new Fit().addTo(map);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, className: 'vmap-tiles', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
        map.on('moveend', function () { if (st.move) offMap(map.getBounds()); });
        map.on('zoomend', function () { canvas.classList.toggle('vmap-near', map.getZoom() >= 16); });
        map.on('popupclose', function () { $$('.bz.is-hot', list).forEach(function (el) { el.classList.remove('is-hot'); }); });
      }
      setTimeout(function () { map.invalidateSize(); drawPins(L); }, 0);
    }).catch(function () {
      move.parentNode.hidden = true;
      canvas.innerHTML = '<p class="vmap-fail">The map could not load. Cards, Table and Board still work.</p>';
    });
  }
  // Shops at one address share a pin (three barbers at 1719 Central Ave).
  function drawPins(L) {
    if (layer) layer.remove();
    layer = L.layerGroup().addTo(map);
    pins = {};
    var groups = {}, keys = [], noPin = 0;
    shown().forEach(function (i) {
      if (!i.b || !i.b.l) { noPin++; return; }
      var k = i.b.l[0].toFixed(4) + ',' + i.b.l[1].toFixed(4);
      if (!groups[k]) { groups[k] = []; keys.push(k); }
      groups[k].push(i);
    });
    keys.forEach(function (k) {
      var g = groups[k];
      var book = g.some(function (i) { return i.x.b; });
      var open = g.some(function (i) { return (openOf(i) || {}).open; });
      var html = '<div class="vpin' + (book ? ' vpin-book' : '') + '">' +
        '<span class="vpin-dot">' + (book ? ICON.cal : ICON.cut) + (g.length > 1 ? '<b class="vpin-n">' + g.length + '</b>' : '') + (open ? '<i class="vpin-live" title="Open now"></i>' : '') + '</span>' +
        '<span class="vpin-name">' + esc(g.length > 1 ? g.length + ' shops here' : shortName(g[0].b.n)) + '</span></div>';
      var m = L.marker(g[0].b.l, {
        icon: L.divIcon({ className: 'vpin-wrap', html: html, iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -42] }),
        title: g.map(function (i) { return i.b.n; }).join(', '), riseOnHover: true, zIndexOffset: book ? 200 : 0,
      }).bindPopup(popup(g), { className: 'vpop', maxWidth: 300, minWidth: 250, autoPanPaddingTopLeft: [16, 60], autoPanPaddingBottomRight: [16, 16] }).addTo(layer);
      m.on('mouseover', function () { hotCards(g, true); });
      m.on('mouseout', function () { if (!m.isPopupOpen()) hotCards(g, false); });
      m.on('popupopen', function () { hotCards(g, true); });
      g.forEach(function (i) { pins[i.s] = m; });
    });
    note.textContent = noPin ? noPin + (noPin === 1 ? ' place has' : ' places have') + ' no map pin in public listings; ' + (noPin === 1 ? 'it stays' : 'they stay') + ' in the list.' : '';
    if (pending && pins[pending]) {
      var m = pins[pending];
      pending = '';
      map.setView(m.getLatLng(), Math.max(map.getZoom(), 16), { animate: false });
      m.openPopup();
    } else if (!st.move || !framed) fit();
    if (st.move) offMap(map.getBounds());
  }
  // Frame Columbus itself, so one pin out in the county doesn't zoom the map out.
  function fit() {
    if (!map) return;
    var pts = Object.keys(pins).map(function (s) { var p = pins[s].getLatLng(); return [p.lat, p.lng]; });
    var near = pts.filter(function (p) { return Math.abs(p[0] - 39.2014) < 0.06 && Math.abs(p[1] + 85.9214) < 0.08; });
    var use = near.length > 2 ? near : pts;
    if (use.length) map.fitBounds(use, { padding: [44, 44], maxZoom: 16 });
    framed = true;
  }
  function hotCards(g, on) {
    g.forEach(function (i) { i.el.classList.toggle('is-hot', on); });
  }
  function hotPin(i, on) {
    var m = pins[i.s];
    if (!m || !m.getElement()) return;
    m.getElement().classList.toggle('is-hot', on);
    m.setZIndexOffset(on ? 1000 : i.x.b ? 200 : 0);
  }
  // Search as I move the map: the list keeps the cards whose pin is in view.
  function offMap(bounds) {
    var n = 0;
    items.forEach(function (i) {
      var off = !!bounds && !i.el.hidden && !(i.b && i.b.l && bounds.contains(i.b.l));
      if (off) i.el.setAttribute('data-v-off', ''); else i.el.removeAttribute('data-v-off');
      if (bounds && !i.el.hidden && !off) n++;
    });
    if (bounds) note.textContent = n + (n === 1 ? ' place' : ' places') + ' in this part of the map.';
  }
  function popup(g) {
    if (g.length === 1) {
      var i = g[0];
      return '<div class="vpop-card">' + thumb(i, 'vpop-img') +
        '<div class="vpop-body"><a class="vpop-name" href="/b/' + i.s + '/">' + esc(i.b.n) + '</a>' +
        '<p class="vpop-meta">' + esc(i.b.y) + (area(i) ? ' · ' + esc(area(i)) : '') + '</p>' +
        (i.b.a ? '<p class="vpop-meta">' + esc(i.b.a) + '</p>' : '') + openLine(i, 'vpop-open') +
        '<div class="vpop-acts">' + onlineBtn(i, '') + (i.b.p ? '<a class="vbtn vbtn-ghost" href="' + tel(i.b.p) + '">Call</a>' : '') + '<a class="vbtn vbtn-ghost" href="/b/' + i.s + '/">Details</a></div></div></div>';
    }
    return '<div class="vpop-many"><p class="vpop-kicker">' + g.length + ' shops at ' + esc(g[0].b.a || 'this address') + '</p>' +
      g.map(function (i) {
        return '<div class="vpop-row"><a class="vpop-name" href="/b/' + i.s + '/">' + esc(i.b.n) + '</a>' + openLine(i, 'vpop-open') +
          '<div class="vpop-acts">' + onlineBtn(i, '') + (i.b.p ? '<a class="vbtn vbtn-ghost" href="' + tel(i.b.p) + '">Call</a>' : '') + '</div></div>';
      }).join('') + '</div>';
  }

  // ---------- Table ----------
  var COLS = [['name', 'Shop'], ['area', 'Neighborhood'], ['', 'Address'], ['', 'Phone'], ['open', 'Today'], ['online', 'Online']];
  var KEY = {
    name: function (i) { return i.b.n.toLowerCase(); },
    area: function (i) { return (area(i) || '~').toLowerCase() + ' ' + i.b.n.toLowerCase(); },
    open: function (i) { var o = openOf(i); return (o ? (o.open ? '0' : '1') : '2') + i.b.n.toLowerCase(); },
    online: function (i) { return (i.x.b ? '0' : i.x.o || i.b.f ? '1' : '2') + i.b.n.toLowerCase(); },
  };
  function sorted(list) {
    if (!st.sort) return list;
    var k = KEY[st.sort];
    return list.slice().sort(function (a, b) { return k(a) < k(b) ? -st.dir : k(a) > k(b) ? st.dir : 0; });
  }
  function drawTable() {
    var rows = sorted(shown().filter(function (i) { return i.b; }));
    if (!rows.length) { tableBox.innerHTML = empty(); return; }
    tableBox.innerHTML = '<div class="vt-scroll" tabindex="0" role="region" aria-label="Table of ' + rows.length + ' places, scrolls sideways on small screens">' +
      '<table class="vt"><thead><tr>' + COLS.map(function (c) {
        if (!c[0]) return '<th scope="col">' + c[1] + '</th>';
        var on = st.sort === c[0];
        return '<th scope="col"' + (on ? ' aria-sort="' + (st.dir > 0 ? 'ascending' : 'descending') + '"' : '') + '><button type="button" data-v-sort="' + c[0] + '">' + c[1] +
          '<span class="vt-arrow" aria-hidden="true">' + (on ? (st.dir > 0 ? '▲' : '▼') : '↕') + '</span></button></th>';
      }).join('') + '</tr></thead><tbody>' +
      rows.map(function (i) {
        return '<tr class="' + (i.x.b ? 'vt-book' : '') + '" data-slug="' + i.s + '">' +
          '<th scope="row"><a class="vt-name" href="/b/' + i.s + '/">' + esc(i.b.n) + '</a><small>' + esc(i.b.y) + '</small></th>' +
          '<td>' + esc(area(i) || 'Not placed') + '</td>' +
          '<td>' + (i.b.a ? (i.b.l ? '<button type="button" class="vt-addr" data-v-pin="' + i.s + '" title="Show on the map">' + esc(i.b.a) + '</button>' : esc(i.b.a)) : '<span class="vt-none">Not listed</span>') + '</td>' +
          '<td class="vt-nowrap">' + (i.b.p ? '<a href="' + tel(i.b.p) + '">' + esc(i.b.p) + '</a>' : '<span class="vt-none">Not listed</span>') + '</td>' +
          '<td>' + openLine(i, 'vt-open').replace(/^<p/, '<span').replace(/<\/p>$/, '</span>') + '</td>' +
          '<td class="vt-nowrap">' + (onlineBtn(i, 'vbtn-sm') || '<span class="vt-none">Not listed</span>') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  // ---------- Board ----------
  var GROUPS = {
    area: function (i) { var r = i.b.r; return r && data.areas[r] ? [r, data.areas[r], 'plain'] : ['zz', 'Not placed', 'muted']; },
    book: function (i) { return i.x.b ? ['1', 'Book online', 'book'] : i.b.p ? ['2', 'Call', 'plain'] : ['3', 'No phone listed', 'muted']; },
    open: function (i) { var o = openOf(i); return o ? (o.open ? ['1', 'Open now', 'open'] : ['2', 'Closed now', 'plain']) : ['3', 'Hours not listed', 'muted']; },
  };
  var AREA_ORDER = Object.keys(data.areas);
  function drawBoard() {
    var cols = {}, keys = [];
    shown().filter(function (i) { return i.b; }).forEach(function (i) {
      var g = GROUPS[st.group](i);
      if (!cols[g[0]]) { cols[g[0]] = { label: g[1], tone: g[2], items: [] }; keys.push(g[0]); }
      cols[g[0]].items.push(i);
    });
    if (!keys.length) { boardBox.innerHTML = empty(); return; }
    keys.sort(function (a, b) {
      if (st.group !== 'area') return a < b ? -1 : 1;
      var x = AREA_ORDER.indexOf(a), y = AREA_ORDER.indexOf(b);
      return (x < 0 ? 99 : x) - (y < 0 ? 99 : y);
    });
    boardBox.innerHTML = '<div class="vb-scroll" tabindex="0" role="region" aria-label="Board grouped by ' + esc(groupSel.options[groupSel.selectedIndex].text.toLowerCase()) + ', scrolls sideways">' +
      keys.map(function (k) {
        var c = cols[k];
        return '<section class="vb-col vb-' + c.tone + '"><h3 class="vb-h">' + esc(c.label) + ' <span class="vb-count">' + c.items.length + '</span></h3><ul class="vb-list">' +
          c.items.map(function (i) {
            return '<li class="vb-card' + (i.x.b ? ' vb-is-book' : '') + '">' + thumb(i, 'vb-img') +
              '<div class="vb-body"><a class="vb-name" href="/b/' + i.s + '/">' + esc(i.b.n) + '</a>' +
              '<p class="vb-meta">' + esc(st.group === 'area' ? i.b.a || i.b.y : area(i) || i.b.a || i.b.y) + '</p>' + openLine(i, 'vb-open') +
              '<div class="vb-acts">' + onlineBtn(i, 'vbtn-sm') + (i.b.l ? '<button type="button" class="vbtn vbtn-ghost vbtn-sm" data-v-pin="' + i.s + '">' + ICON.map + 'Map</button>' : '') + '</div></div></li>';
          }).join('') + '</ul></section>';
      }).join('') + '</div>';
  }
  var empty = function () { return '<p class="vempty">Nothing matches. Try another neighborhood or clear the filter.</p>'; };

  // ---------- Wiring ----------
  $$('[data-v]', bar).forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-v')); }); });
  float.addEventListener('click', function () { setView(st.view === 'map' ? st.last : 'map', { scroll: true }); });
  groupSel.value = st.group;
  groupSel.addEventListener('change', function () { st.group = groupSel.value; render(); });
  move.addEventListener('change', function () {
    st.move = move.checked;
    if (map) offMap(st.move ? map.getBounds() : null);
    if (!st.move) note.textContent = '';
  });
  document.addEventListener('click', function (e) {
    var go = e.target.closest && e.target.closest('[data-v-go]');
    if (go) { e.preventDefault(); setView(go.getAttribute('data-v-go'), { scroll: true }); return; }
    var pin = e.target.closest && e.target.closest('[data-v-pin]');
    if (pin) { pending = pin.getAttribute('data-v-pin'); setView('map', { scroll: true }); return; }
    var sort = e.target.closest && e.target.closest('[data-v-sort]');
    if (sort) {
      var k = sort.getAttribute('data-v-sort');
      st.dir = st.sort === k ? -st.dir : 1;
      st.sort = k;
      drawTable();
      var again = $('[data-v-sort="' + k + '"]', tableBox);
      if (again) again.focus();
    }
  });
  document.addEventListener('hoc:filtered', function () { if (items.length) render(); });
  // Sticky offsets follow the real header height (it wraps on phones).
  var hdr = $('.hdr');
  var measure = function () {
    if (hdr) document.documentElement.style.setProperty('--hdr-h', hdr.offsetHeight + 'px');
    document.documentElement.style.setProperty('--vbar-h', bar.offsetHeight + 'px');
  };
  addEventListener('resize', measure);

  window.HoCDir().then(function (all) {
    var by = {};
    all.forEach(function (b) { by[b.s] = b; });
    items = $$('[data-grid] .bz', list).map(function (el) {
      var s = el.getAttribute('data-slug');
      var img = $('.bz-cover img', el);
      var i = { s: s, el: el, b: by[s], x: data.links[s] || {}, img: img ? img.getAttribute('src') : '', ed: !!$('.ed-tag', el) };
      el.addEventListener('mouseenter', function () { if (st.view === 'map') hotPin(i, true); });
      el.addEventListener('mouseleave', function () { if (st.view === 'map') hotPin(i, false); });
      return i;
    });
    bar.hidden = false;
    float.hidden = false;
    measure();
    render();
  });
})();

// Explore and Saved: filter every business, list or map. State lives in the URL.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = $('[data-explore]');
  if (!root) return;
  var savedOnly = root.hasAttribute('data-saved-only');
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var COLOR = {
    restaurants: '#c8232c', 'coffee-sweets': '#8a4b2a', bars: '#b86b00', beauty: '#1e2a4a', shopping: '#ff2e88', health: '#0f7b6c',
    fitness: '#2f6b3b', pets: '#7a4fd6', 'home-services': '#e8590c', auto: '#36454f', pros: '#3b5bdb', events: '#d6336c',
    kids: '#f08c00', 'things-to-do': '#0b7285', makers: '#5c5f66',
  };
  var AREA = {};
  $$('[data-ex-area] option').forEach(function (o) { if (o.value) AREA[o.value] = o.textContent; });
  var PATS = ['pat-dots', 'pat-arch', 'pat-grid', 'pat-wave', 'pat-ray'];
  var hash = function (s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  var HEART = '<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.1 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg>';
  var PIN = '<svg viewBox="0 0 24 24" class="ic-xs" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';

  function card(b) {
    var t = window.HoCCat[b.c];
    return '<article class="bz" data-slug="' + b.s + '">' +
      '<a class="bz-cover ' + PATS[hash(b.s) % 5] + '" href="/b/' + b.s + '/" style="--c:' + COLOR[b.c] + ';--t:' + t[2] + '" tabindex="-1" aria-hidden="true">' +
      (b.v ? '<img class="bz-art" src="/art/cover-' + b.u + '.png" alt="" loading="lazy">' : '') + '<span class="bz-emoji">' + b.e + '</span>' +
      (b.r ? '<span class="bz-area">' + PIN + esc(AREA[b.r]) + '</span>' : '') + '</a>' +
      '<button type="button" class="bz-save" data-save="' + b.s + '" aria-pressed="false" aria-label="Save ' + esc(b.n) + '">' + HEART + '</button>' +
      '<div class="bz-body"><h3 class="bz-name"><a href="/b/' + b.s + '/">' + (st.sort === 'walk' && b._i ? '<span class="walk-n">' + b._i + '</span>' : '') + esc(b.n) + '</a></h3><p class="bz-type">' + esc(b.y) + (st.sort === 'near' && me && b._d < Infinity ? ' · <b>' + (b._d < 0.1 ? 'right here' : b._d.toFixed(1) + ' mi') + '</b>' : '') + '</p>' +
      (b.a ? '<p class="bz-addr">' + esc(b.a) + '</p>' : '') +
      (b.d || b.h || b.o || b.k || b.f ? '<div class="bz-tags">' + (b.o ? '<span class="tag tag-go">Order online</span>' : '') + (b.k ? '<span class="tag tag-go">Book online</span>' : '') + (b.f ? '<span class="tag tag-go">Shop online</span>' : '') + (b.d ? '<span class="tag tag-hot">Storefront demo</span>' : '') + (b.h ? '<span class="tag">Columbus original</span>' : '') + '</div>' : '') +
      '</div></article>';
  }

  var params = new URLSearchParams(location.search);
  var st = {
    q: params.get('q') || '', cat: params.get('cat') || '', sub: params.get('sub') || '', area: params.get('area') || '',
    phone: params.get('phone') === '1', demo: params.get('demo') === '1', online: params.get('online') === '1', open: params.get('open') === '1', sort: params.get('sort') || 'az', view: params.get('view') || 'list',
  };
  var PAGE = 48, shown = PAGE, all = [], map = null, layer = null, me = null;
  var dist = function (a, b) {
    var r = Math.PI / 180, dLat = (b[0] - a[0]) * r, dLng = (b[1] - a[1]) * r;
    var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 7918 * Math.asin(Math.sqrt(h)); // miles
  };
  function locate() {
    var msg = $('[data-ex-near-msg]');
    if (!navigator.geolocation) { msg.textContent = 'Your browser can’t share a location.'; msg.hidden = false; return; }
    msg.textContent = 'Finding you…'; msg.hidden = false;
    navigator.geolocation.getCurrentPosition(function (p) {
      me = [p.coords.latitude, p.coords.longitude];
      msg.textContent = dist(me, [39.2014, -85.9214]) > 40 ? 'You look far from Columbus, so distances are from where you are now.' : 'Sorted by distance from you. Your location stays on your device.';
      render();
    }, function () { msg.textContent = 'Location is off, so we sorted A to Z instead.'; st.sort = 'az'; $('[data-ex-sort]').value = 'az'; render(); }, { maximumAge: 300000, timeout: 10000 });
  }

  function sync() {
    var p = new URLSearchParams();
    if (params.get('ids')) p.set('ids', params.get('ids'));
    ['q', 'cat', 'sub', 'area', 'sort', 'view'].forEach(function (k) { if (st[k] && !(k === 'sort' && st[k] === 'az') && !(k === 'view' && st[k] === 'list')) p.set(k, st[k]); });
    if (st.phone) p.set('phone', '1');
    if (st.demo) p.set('demo', '1');
    if (st.online) p.set('online', '1');
    if (st.open) p.set('open', '1');
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }

  function filtered() {
    // A shared trip link (/saved/?ids=) shows its own list instead of yours.
    var saved = savedOnly ? (window.HoCTripIds ? window.HoCTripIds() : window.HoCSaved()) : null;
    var out = all.filter(function (b) {
      return (!saved || saved.indexOf(b.s) !== -1) && (!st.cat || b.c === st.cat) && (!st.sub || b.u === st.sub) &&
        (!st.area || b.r === st.area) && (!st.phone || b.p) && (!st.demo || b.d) && (!st.online || b.o || b.k || b.f) && (!st.open || ((window.HoCOpen(b.t) || {}).open)) && (!st.q || window.HoCMatch(b, st.q));
    });
    var name = function (b) { return b.n.replace(/^the /i, ''); };
    if (st.sort === 'near' && me) {
      out.forEach(function (b) { b._d = b.l ? dist(me, b.l) : Infinity; });
      return out.sort(function (a, b) { return a._d - b._d; });
    }
    if (st.sort === 'walk') return walkOrder(out);
    out.sort(function (a, b) {
      if (st.sort === 'area') return (AREA[a.r] || 'zz').localeCompare(AREA[b.r] || 'zz') || name(a).localeCompare(name(b));
      return st.sort === 'za' ? name(b).localeCompare(name(a)) : name(a).localeCompare(name(b));
    });
    return out;
  }

  // Saved list in a simple walking order: start at the westmost pin, then
  // always go to the nearest place not yet visited. Places without a pin go last.
  function walkOrder(list) {
    var left = list.filter(function (b) { return b.l; }), rest = list.filter(function (b) { return !b.l; }), out = [];
    left.sort(function (a, b) { return a.l[1] - b.l[1]; });
    while (left.length) {
      var at = out.length ? out[out.length - 1].l : left[0].l, best = 0;
      for (var i = 1; i < left.length; i++) if (dist(at, left[i].l) < dist(at, left[best].l)) best = i;
      out.push(left.splice(best, 1)[0]);
    }
    out.forEach(function (b, i) { b._i = i + 1; });
    rest.forEach(function (b) { b._i = 0; });
    return out.concat(rest);
  }

  function counts() {
    var base = all.filter(function (b) { return (!st.area || b.r === st.area) && (!st.q || window.HoCMatch(b, st.q)); });
    $$('[data-n-cat]').forEach(function (el) {
      var c = el.getAttribute('data-n-cat');
      el.textContent = base.filter(function (b) { return !c || b.c === c; }).length;
    });
  }

  function render() {
    var list = filtered();
    $('[data-ex-count]').textContent = list.length + (list.length === 1 ? ' place' : ' places') + (st.q ? ' for “' + st.q + '”' : '');
    $('[data-ex-empty]').hidden = list.length > 0;
    var showMap = st.view === 'map';
    $('[data-ex-map]').hidden = !showMap;
    $('[data-ex-grid]').innerHTML = list.slice(0, shown).map(card).join('');
    $('[data-ex-more]').hidden = list.length <= shown;
    $('[data-ex-more]').textContent = 'Show ' + Math.min(PAGE, list.length - shown) + ' more';
    $$('[data-ex-cat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.exCat === st.cat)); });
    $$('[data-subs-of]').forEach(function (d) { d.hidden = d.dataset.subsOf !== st.cat; });
    $$('[data-ex-sub]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.exSub === st.sub)); });
    $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === st.view)); });
    counts();
    if (showMap) drawMap(list);
    if (window.HoCPaintSaved) window.HoCPaintSaved();
    if (window.HoCPaintOpen) window.HoCPaintOpen();
    sync();
    document.dispatchEvent(new CustomEvent('hoc:rendered'));
  }

  // ---------- Map (Leaflet + OpenStreetMap, loaded on demand) ----------
  var leaflet = null;
  function loadLeaflet() {
    if (leaflet) return leaflet;
    leaflet = new Promise(function (res, rej) {
      var css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
      var s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = function () {
        // Marker clustering keeps 900 pins readable.
        var c1 = document.createElement('link'); c1.rel = 'stylesheet'; c1.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css'; document.head.appendChild(c1);
        var c2 = document.createElement('link'); c2.rel = 'stylesheet'; c2.href = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css'; document.head.appendChild(c2);
        var mc = document.createElement('script'); mc.src = 'https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js';
        mc.onload = function () { res(window.L); }; mc.onerror = function () { res(window.L); };
        document.head.appendChild(mc);
      };
      s.onerror = rej;
      document.head.appendChild(s);
    });
    return leaflet;
  }
  function drawMap(list) {
    loadLeaflet().then(function (L) {
      if (!map) {
        map = L.map('map', { scrollWheelZoom: false }).setView([39.21, -85.91], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      }
      if (layer) layer.remove();
      var walk = st.sort === 'walk';
      layer = (L.markerClusterGroup && !walk ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45 }) : L.layerGroup()).addTo(map);
      var pts = [];
      list.forEach(function (b) {
        if (!b.l) return;
        pts.push(b.l);
        var icon = L.divIcon({ className: '', html: '<div class="pin" style="background:' + (window.HoCCat[b.c] || [])[2] + '"><span>' + (walk && b._i ? b._i : b.e) + '</span></div>', iconSize: [28, 28], iconAnchor: [4, 28], popupAnchor: [10, -26] });
        L.marker(b.l, { icon: icon, title: b.n }).bindPopup('<a class="pop-name" href="/b/' + b.s + '/">' + esc(b.n) + '</a><small>' + esc(b.y) + (b.a ? '<br>' + esc(b.a) : '') + '</small>').addTo(layer);
      });
      if (walk && pts.length > 1) L.polyline(pts, { color: '#c8232c', weight: 3, dashArray: '6 6' }).addTo(layer);
      // Frame Columbus itself; a handful of pins out in the county shouldn't zoom the map out.
      var core = pts.filter(function (p) { return dist(p, [39.2014, -85.9214]) < 6; });
      setTimeout(function () { map.invalidateSize(); if (pts.length) map.fitBounds(core.length > 5 ? core : pts, { padding: [30, 30], maxZoom: 16 }); }, 50);
    }).catch(function () { $('#map').textContent = 'The map could not load. The list still works.'; });
  }

  // ---------- Controls ----------
  var q = $('[data-ex-q]');
  q.value = st.q;
  q.addEventListener('input', function () { st.q = q.value.trim(); shown = PAGE; render(); });
  $$('[data-ex-cat]').forEach(function (b) { b.addEventListener('click', function () { st.cat = b.dataset.exCat; st.sub = ''; shown = PAGE; render(); }); });
  $$('[data-ex-sub]').forEach(function (b) { b.addEventListener('click', function () { st.sub = st.sub === b.dataset.exSub ? '' : b.dataset.exSub; shown = PAGE; render(); }); });
  var area = $('[data-ex-area]'); area.value = st.area;
  area.addEventListener('change', function () { st.area = area.value; shown = PAGE; render(); });
  var sort = $('[data-ex-sort]'); sort.value = st.sort;
  sort.addEventListener('change', function () { st.sort = sort.value; if (st.sort === 'near' && !me) locate(); else render(); });
  if (st.sort === 'near') setTimeout(locate, 0);
  var ph = $('[data-ex-phone]'); ph.checked = st.phone;
  ph.addEventListener('change', function () { st.phone = ph.checked; shown = PAGE; render(); });
  var op = $('[data-ex-open]'); op.checked = st.open;
  op.addEventListener('change', function () { st.open = op.checked; shown = PAGE; render(); });
  var on = $('[data-ex-online]'); on.checked = st.online;
  on.addEventListener('change', function () { st.online = on.checked; shown = PAGE; render(); });
  var dm = $('[data-ex-demo]'); dm.checked = st.demo;
  dm.addEventListener('change', function () { st.demo = dm.checked; shown = PAGE; render(); });
  $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { st.view = b.dataset.view; render(); }); });
  $('[data-ex-more]').addEventListener('click', function () { shown += PAGE; render(); });
  $('[data-ex-toggle]').addEventListener('click', function () { $('[data-ex-side]').classList.toggle('open'); });
  if (savedOnly) document.addEventListener('hoc:saved', render);

  window.HoCDir().then(function (d) { all = d; render(); });
})();

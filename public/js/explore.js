// Explore and Saved: filter every business, list or map. State lives in the URL.
// The map also has layers for landmarks, this weekend's events and the Social
// District, and a "near me now" mode (?view=map&now=1): open now, nearest
// first, with one-tap category chips, for a phone on a sidewalk.
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
      (b.i ? '<img class="bz-art" src="' + esc(b.i) + '" alt="" loading="lazy" decoding="async" onerror="this.remove()">' : b.v ? '<img class="bz-art" src="/art/cover-' + b.u + '.webp" alt="" loading="lazy">' : '') + '<span class="bz-emoji">' + b.e + '</span>' +
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
    phone: params.get('phone') === '1', demo: params.get('demo') === '1', online: params.get('online') === '1', open: params.get('open') === '1', attr: (params.get('attr') || '').split(',').filter(Boolean), sort: params.get('sort') || 'match', view: params.get('view') || 'list',
    now: !savedOnly && params.get('now') === '1', layers: (params.get('layers') || 'b,l,e').split(','),
  };
  if (st.now) { st.view = 'map'; st.open = true; st.sort = 'near'; }
  var data = JSON.parse(($('#page-data') || {}).textContent || '{}');
  var layerOn = function (k) { return st.layers.indexOf(k) !== -1; };

  // This weekend in Columbus (Friday to Sunday, or what is left of it), as in events.js.
  var DAY = 86400000;
  var tp = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
  var tg = function (k) { return Number(tp.filter(function (x) { return x.type === k; })[0].value); };
  var today = Date.UTC(tg('year'), tg('month') - 1, tg('day'));
  var dow = new Date(today).getUTCDay();
  var fri = dow === 0 ? today - 2 * DAY : dow === 6 ? today - DAY : today + ((5 - dow + 7) % 7) * DAY;
  var parseDay = function (x) { var a = x.split('-').map(Number); return Date.UTC(a[0], a[1] - 1, a[2]); };
  var thisWeekend = function (e) { var s = parseDay(e.start), end = parseDay(e.end); return end >= today && Math.max(s, today, fri) <= Math.min(end, fri + 2 * DAY); };
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
      nowMsg(dist(me, [39.2014, -85.9214]) > 40 ? 'Open now. You look far from Columbus, so this shows the whole town.' : 'Open now, nearest to you first. Your location stays on your device.');
      render();
    }, function () {
      msg.textContent = 'Location is off, so we sorted by best match instead.'; st.sort = 'match'; $('[data-ex-sort]').value = 'match';
      nowMsg('Location is off, so this is everything open now, A to Z.');
      render();
    }, { maximumAge: 300000, timeout: 10000 });
  }

  function nowMsg(t) { var el = $('[data-now-msg]'); if (el && st.now) el.textContent = t; }

  function sync() {
    var p = new URLSearchParams();
    if (params.get('ids')) p.set('ids', params.get('ids'));
    ['q', 'cat', 'sub', 'area', 'sort', 'view'].forEach(function (k) { if (st[k] && !(k === 'sort' && st[k] === 'match') && !(k === 'view' && st[k] === 'list')) p.set(k, st[k]); });
    if (st.phone) p.set('phone', '1');
    if (st.demo) p.set('demo', '1');
    if (st.online) p.set('online', '1');
    if (st.attr.length) p.set('attr', st.attr.join(','));
    if (st.open && !st.now) p.set('open', '1');
    if (st.now) { p.set('now', '1'); p.delete('sort'); }
    if (st.layers.join(',') !== 'b,l,e') p.set('layers', st.layers.join(','));
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }

  function filtered() {
    // A shared trip link (/saved/?ids=) shows its own list instead of yours.
    var saved = savedOnly ? (window.HoCTripIds ? window.HoCTripIds() : window.HoCSaved()) : null;
    var out = all.filter(function (b) {
      return (!saved || saved.indexOf(b.s) !== -1) && (!st.cat || b.c === st.cat) && (!st.sub || b.u === st.sub) &&
        (!st.area || b.r === st.area) && (!st.phone || b.p) && (!st.demo || b.d) && (!st.online || b.o || b.k || b.f) && st.attr.every(function (a) { return (b.x || '').indexOf(a) !== -1; }) && (!st.open || ((window.HoCOpen(b.t) || {}).open)) && (!st.q || window.HoCMatch(b, st.q));
    });
    var name = function (b) { return b.n.replace(/^the /i, ''); };
    if (st.sort === 'near' && me) {
      out.forEach(function (b) { b._d = b.l ? dist(me, b.l) : Infinity; });
      return out.sort(function (a, b) { return a._d - b._d; });
    }
    if (st.sort === 'walk') return walkOrder(out);
    // Best match is the default: relevance with a search, A to Z without one.
    if (st.sort === 'match' && st.q) return window.HoCRank(out, st.q);
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
    if (!list.length) recover();
    var showMap = st.view === 'map';
    $('[data-ex-map]').hidden = !showMap;
    $('[data-ex-grid]').innerHTML = list.slice(0, shown).map(card).join('');
    $('[data-ex-more]').hidden = list.length <= shown;
    $('[data-ex-more]').textContent = 'Show ' + Math.min(PAGE, list.length - shown) + ' more';
    $$('[data-ex-cat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.exCat === st.cat)); });
    $$('[data-subs-of]').forEach(function (d) { d.hidden = d.dataset.subsOf !== st.cat; });
    $$('[data-ex-sub]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.exSub === st.sub)); });
    $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === st.view)); });
    $$('[data-now-cat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.nowCat === st.cat)); });
    var bar = $('[data-now-bar]'); if (bar) bar.hidden = !st.now;
    var nl = $('[data-now-link]'); if (nl) nl.setAttribute('aria-pressed', String(st.now));
    $$('[data-layer]').forEach(function (c) { c.checked = layerOn(c.dataset.layer); });
    counts();
    if (showMap) drawMap(list);
    if (window.HoCPaintSaved) window.HoCPaintSaved();
    if (window.HoCPaintOpen) window.HoCPaintOpen();
    sync();
    document.dispatchEvent(new CustomEvent('hoc:rendered'));
  }

  // ---------- No results: say why and offer a way back ----------
  // Each button says how many places it would bring back, counted with the
  // same filter the list uses, so a button never leads to another empty page.
  var FILTERS = { cat: '', sub: '', area: '', phone: false, open: false, online: false, demo: false, attr: [] };
  function countWith(over) {
    var keep = {}, k;
    for (k in over) { keep[k] = st[k]; st[k] = over[k]; }
    var n = filtered().length;
    for (k in keep) st[k] = keep[k];
    return n;
  }
  function recover() {
    var box = $('[data-ex-recover]'), why = $('[data-ex-why]');
    if (!box) return;
    var active = Object.keys(FILTERS).filter(function (k) { return Array.isArray(st[k]) ? st[k].length : st[k]; });
    var opts = [];
    if (st.q && active.length) { var n1 = countWith(FILTERS); if (n1) opts.push(['filters', 'Search all of Columbus for “' + st.q + '” (' + n1 + ')']); }
    if (st.q) { var n2 = countWith({ q: '' }); if (n2) opts.push(['query', 'Clear the search (' + n2 + ')']); }
    if (!st.q && active.length) opts.push(['filters', 'Clear all filters']);
    why.textContent = st.q && !active.length ? 'Nothing in the directory matches “' + st.q + '”. Try a shorter word, or a kind of place like “bakery”.'
      : st.q ? 'Nothing matches “' + st.q + '” with those filters.' : 'Nothing matches those filters.';
    box.innerHTML = opts.map(function (o) { return '<button type="button" class="btn btn-sm" data-recover="' + o[0] + '">' + esc(o[1]) + '</button>'; }).join('') +
      '<a class="btn btn-sm btn-ghost" href="/#cats-h">Browse by category</a>';
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-recover]');
    if (!b) return;
    if (b.dataset.recover === 'query') { st.q = ''; q.value = ''; }
    else { for (var k in FILTERS) st[k] = FILTERS[k]; area.value = ''; ph.checked = op.checked = on.checked = dm.checked = false; $$('[data-ex-attr]').forEach(function (c) { c.checked = false; }); st.now = false; }
    shown = PAGE; render();
    $('[data-ex-count]').focus && $('[data-ex-count]').setAttribute('tabindex', '-1');
    $('[data-ex-count]').focus();
  });

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
  var pinIcon = function (L, cls, inner, bg) { return L.divIcon({ className: '', html: '<div class="pin ' + cls + '"' + (bg ? ' style="background:' + bg + '"' : '') + '><span>' + inner + '</span></div>', iconSize: [28, 28], iconAnchor: [4, 28], popupAnchor: [10, -26] }); };
  var bizPopup = function (b) {
    var o = b.t ? window.HoCOpen(b.t) : null;
    return '<a class="pop-name" href="/b/' + b.s + '/">' + esc(b.n) + '</a><small>' + esc(b.y) + (b.a ? '<br>' + esc(b.a) : '') +
      (o ? '<br><b class="' + (o.open ? 'pop-open' : 'pop-closed') + '">' + esc(o.label) + '</b>' : '') + (b.z ? '<br>Social District: drinks to go' : '') + '</small>';
  };
  function drawMap(list) {
    loadLeaflet().then(function (L) {
      if (!map) {
        map = L.map('map', { scrollWheelZoom: false }).setView([39.21, -85.91], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
      }
      if (layer) layer.remove();
      var walk = st.sort === 'walk';
      var dora = layerOn('z') && !walk;
      layer = L.layerGroup().addTo(map);
      var biz = (L.markerClusterGroup && !walk ? L.markerClusterGroup({ showCoverageOnHover: false, maxClusterRadius: 45 }) : L.layerGroup()).addTo(layer);
      var pts = [];
      if (layerOn('b')) list.forEach(function (b) {
        if (!b.l || (dora && b.z)) return;
        pts.push(b.l);
        L.marker(b.l, { icon: pinIcon(L, '', walk && b._i ? b._i : b.e, (window.HoCCat[b.c] || [])[2]), title: b.n }).bindPopup(bizPopup(b)).addTo(biz);
      });
      if (walk && pts.length > 1) L.polyline(pts, { color: '#c8232c', weight: 3, dashArray: '6 6' }).addTo(layer);
      // Social District businesses stand out, unclustered, whatever the filters say (except open now).
      var ids = savedOnly ? (window.HoCTripIds ? window.HoCTripIds() : window.HoCSaved()) : null;
      if (dora) all.forEach(function (b) {
        if (!b.z || !b.l || (ids && ids.indexOf(b.s) === -1) || (st.open && !((window.HoCOpen(b.t) || {}).open))) return;
        pts.push(b.l);
        L.marker(b.l, { icon: pinIcon(L, 'pin-dora', '🥤'), title: b.n, zIndexOffset: 500 }).bindPopup(bizPopup(b)).addTo(layer);
      });
      if (layerOn('l')) (data.landmarks || []).forEach(function (x) {
        if (!x.l || (ids && ids.indexOf('l:' + x.s) === -1)) return;
        pts.push(x.l);
        var icon = L.divIcon({ className: '', html: '<div class="pin-art"><img src="/art/pin-' + x.art + '.webp" alt=""></div>', iconSize: [46, 46], iconAnchor: [23, 40], popupAnchor: [0, -34] });
        L.marker(x.l, { icon: icon, title: x.n, zIndexOffset: 800 }).bindPopup('<span class="pop-kind">Landmark</span><a class="pop-name" href="/l/' + x.s + '/">' + esc(x.n) + '</a><small>' + esc(x.d) + '<br>' + esc(x.a) + (x.street ? '<br>Seen from the street, free' : '') + '</small>').addTo(layer);
      });
      if (layerOn('e')) (data.events || []).forEach(function (x) {
        if (!x.l || (ids ? ids.indexOf('e:' + x.s) === -1 || parseDay(x.end) < today : !thisWeekend(x))) return;
        pts.push(x.l);
        L.marker(x.l, { icon: pinIcon(L, 'pin-ev', '🎉'), title: x.n, zIndexOffset: 900 }).bindPopup('<span class="pop-kind">This weekend</span><a class="pop-name" href="' + esc(x.u) + '" target="_blank" rel="noopener">' + esc(x.n) + '</a><small>' + esc(x.d) + '<br>' + esc(x.a) + '</small>').addTo(layer);
      });
      if (me) L.circleMarker(me, { radius: 8, color: '#fff', weight: 3, fillColor: '#3b5bdb', fillOpacity: 1 }).bindTooltip('You are here').addTo(layer);
      // Near me now frames you and the closest open places; otherwise frame
      // Columbus itself, so a handful of pins out in the county don't zoom the map out.
      var frame;
      if (st.now && me && dist(me, [39.2014, -85.9214]) < 40) frame = [me].concat(list.filter(function (b) { return b.l; }).slice(0, 12).map(function (b) { return b.l; }));
      else { var core = pts.filter(function (p) { return dist(p, [39.2014, -85.9214]) < 6; }); frame = core.length > 5 ? core : pts; }
      setTimeout(function () { map.invalidateSize(); if (frame.length) map.fitBounds(frame, { padding: [30, 30], maxZoom: 16 }); }, 50);
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
  if (st.now) sort.value = 'near';
  op.addEventListener('change', function () { st.open = op.checked; shown = PAGE; render(); });
  var on = $('[data-ex-online]'); on.checked = st.online;
  on.addEventListener('change', function () { st.online = on.checked; shown = PAGE; render(); });
  $$('[data-ex-attr]').forEach(function (c) {
    c.checked = st.attr.indexOf(c.dataset.exAttr) !== -1;
    c.addEventListener('change', function () { st.attr = $$('[data-ex-attr]').filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.exAttr; }); shown = PAGE; render(); });
  });
  var dm = $('[data-ex-demo]'); dm.checked = st.demo;
  dm.addEventListener('change', function () { st.demo = dm.checked; shown = PAGE; render(); });
  $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { st.view = b.dataset.view; render(); }); });
  $$('[data-layer]').forEach(function (c) {
    c.addEventListener('change', function () {
      st.layers = $$('[data-layer]').filter(function (x) { return x.checked; }).map(function (x) { return x.dataset.layer; });
      render();
    });
  });
  $$('[data-now-cat]').forEach(function (b) { b.addEventListener('click', function () { st.cat = st.cat === b.dataset.nowCat ? '' : b.dataset.nowCat; st.sub = ''; render(); }); });
  var nowLink = $('[data-now-link]');
  if (nowLink) nowLink.addEventListener('click', function (e) {
    e.preventDefault();
    st.now = true; st.view = 'map'; st.open = true; st.sort = 'near';
    op.checked = true; sort.value = 'near';
    render();
    if (!me) locate();
  });
  var nowExit = $('[data-now-exit]');
  if (nowExit) nowExit.addEventListener('click', function (e) {
    e.preventDefault();
    st.now = false; st.open = false; op.checked = false;
    render();
  });
  $('[data-ex-more]').addEventListener('click', function () { shown += PAGE; render(); });
  $('[data-ex-toggle]').addEventListener('click', function () {
    var open = $('[data-ex-side]').classList.toggle('open');
    this.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  if (savedOnly) document.addEventListener('hoc:saved', render);

  window.HoCDir().then(function (d) { all = d; render(); });
})();

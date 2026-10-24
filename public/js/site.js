// Shared directory behavior: search-as-you-type, saved places, rails, share.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- Data (lazy) ----------
  var dataPromise = null;
  window.HoCDir = function () {
    if (!dataPromise) dataPromise = fetch('/data/directory.json').then(function (r) { return r.json(); });
    return dataPromise;
  };
  var CAT = {
    restaurants: ['Restaurants', '🍽️', '#fde7e4'], 'coffee-sweets': ['Coffee & Sweets', '☕', '#f7ebe1'], bars: ['Bars & Breweries', '🍺', '#fdf0d6'],
    beauty: ['Beauty & Grooming', '💈', '#e5e9f4'], shopping: ['Shopping', '🛍️', '#ffe3f0'], health: ['Health & Wellness', '🩺', '#dff4ef'],
    fitness: ['Fitness', '🏋️', '#e2f1e4'], pets: ['Pets', '🐾', '#ede6fb'], 'home-services': ['Home Services', '🛠️', '#ffe8d9'],
    auto: ['Auto', '🚗', '#e6eaed'], pros: ['Professional Services', '💼', '#e5ebff'], events: ['Events & Weddings', '💍', '#ffe3ec'],
    kids: ['Kids & Learning', '🎨', '#fff1d6'], 'things-to-do': ['Things to Do', '🎳', '#dcf3f6'], makers: ['Makers & Industry', '🏭', '#ebecee'],
  };
  window.HoCCat = CAT;

  var norm = function (s) {
    return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
  };
  var ALIAS = { street: 'st', avenue: 'ave', road: 'rd', tacos: 'taco', haircut: 'barber', mechanic: 'auto', vet: 'animal', boba: 'tea', donut: 'donut', plumbers: 'plumb' };
  window.HoCMatch = function (b, q) {
    var hay = b._h || (b._h = norm([b.n, b.y, b.a, (CAT[b.c] || [''])[0], b.u, b.r].join(' ')));
    return norm(q).split(' ').filter(Boolean).every(function (w) {
      w = ALIAS[w] || w;
      if (w.length > 4 && w.slice(-1) === 's') w = w.slice(0, -1);
      return hay.indexOf(w) !== -1;
    });
  };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---------- Opening hours (mirror of src/hours.mjs) ----------
  // Rows are [day, open, close]: day 0 = Sunday, minutes after midnight.
  var nowParts = function () {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return { day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday), min: Number(p.hour) * 60 + Number(p.minute) };
  };
  var fmtMin = function (m) {
    m = ((m % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h % 12 || 12) + (mm ? ':' + (mm < 10 ? '0' : '') + mm : '') + (h < 12 ? ' AM' : ' PM');
  };
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  window.HoCOpen = function (rows, at) {
    if (!rows || !rows.length) return null;
    var n = at || nowParts(), i, r;
    for (i = 0; i < rows.length; i++) {
      r = rows[i];
      if (r[0] === n.day && n.min >= r[1] && n.min < r[2]) return { open: true, until: r[2], label: r[1] === 0 && r[2] === 1440 ? 'Open 24 hours' : 'Open until ' + fmtMin(r[2]) };
      if (r[0] === (n.day + 6) % 7 && r[2] > 1440 && n.min < r[2] - 1440) return { open: true, until: r[2] - 1440, label: 'Open until ' + fmtMin(r[2]) };
    }
    for (var k = 0; k < 7; k++) {
      var dd = (n.day + k) % 7, best = null;
      rows.forEach(function (x) { if (x[0] === dd && (k > 0 || x[1] > n.min) && (!best || x[1] < best[1])) best = x; });
      if (best) return { open: false, label: 'Closed · opens ' + (k === 0 ? '' : k === 1 ? 'tomorrow ' : DAYS[dd] + ' ') + fmtMin(best[1]) };
    }
    return { open: false, label: 'Closed' };
  };
  // Paint "Open now" on every card that has hours, and fill [data-open-now].
  function paintOpen(all) {
    var by = {};
    all.forEach(function (b) { if (b.t) by[b.s] = b.t; });
    $$('.bz[data-slug]').forEach(function (card) {
      var st = window.HoCOpen(by[card.getAttribute('data-slug')]);
      var el = $('.bz-open', card);
      if (!st) { if (el) el.remove(); return; }
      if (!el) { el = document.createElement('span'); el.className = 'bz-open'; var cover = $('.bz-cover', card); if (cover) cover.appendChild(el); }
      el.className = 'bz-open ' + (st.open ? 'is-open' : 'is-closed');
      el.textContent = st.open ? 'Open now' : 'Closed';
      card.setAttribute('data-is-open', st.open ? '1' : '0');
    });
    $$('[data-open-now]').forEach(function (el) {
      var st = window.HoCOpen(JSON.parse(el.getAttribute('data-open-now') || 'null'));
      if (!st) return;
      el.textContent = st.label;
      el.className = 'open-badge ' + (st.open ? 'is-open' : 'is-closed');
      el.hidden = false;
    });
    $$('[data-today]').forEach(function (tr) { if (Number(tr.getAttribute('data-today')) === nowParts().day) tr.classList.add('today'); });
    // Rails that should only show places open right now.
    $$('[data-open-rail]').forEach(function (sec) {
      var cards = $$('.bz', sec);
      cards.forEach(function (c) { if (c.getAttribute('data-is-open') !== '1') c.remove(); });
      var left = $$('.bz', sec);
      for (var i = left.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); left[i].parentNode.insertBefore(left[j], left[i]); }
      sec.hidden = left.length < 3;
    });
  }
  window.HoCPaintOpen = function () { window.HoCDir().then(paintOpen); };
  if ($('.bz[data-slug]') || $('[data-open-now]')) {
    if (window.requestIdleCallback) window.requestIdleCallback(function () { window.HoCPaintOpen(); }, { timeout: 1500 }); else setTimeout(window.HoCPaintOpen, 400);
    setInterval(function () { if (!document.hidden) window.HoCPaintOpen(); }, 120000);
  }

  // ---------- Typeahead ----------
  $$('[data-typeahead]').forEach(function (form) {
    var input = $('input', form), list = $('[data-ta-list]', form), sel = -1;
    function render(q) {
      if (!q) { list.hidden = true; return; }
      window.HoCDir().then(function (all) {
        var hits = all.filter(function (b) { return window.HoCMatch(b, q); });
        var cats = Object.keys(CAT).filter(function (k) { return norm(CAT[k][0]).indexOf(norm(q)) !== -1; }).slice(0, 2);
        var html = cats.map(function (k) {
          return '<a href="/c/' + k + '/"><span class="ta-e" style="--t:' + CAT[k][2] + '">' + CAT[k][1] + '</span><span><strong>' + esc(CAT[k][0]) + '</strong><small>Browse the category</small></span></a>';
        }).join('');
        html += hits.slice(0, 7).map(function (b) {
          var c = CAT[b.c] || ['', '📍', '#eee'];
          return '<a href="/b/' + b.s + '/"><span class="ta-e" style="--t:' + c[2] + '">' + c[1] + '</span><span><strong>' + esc(b.n) + '</strong><small>' + esc(b.y) + (b.a ? ' · ' + esc(b.a) : '') + '</small></span></a>';
        }).join('');
        html += '<a href="/explore/?q=' + encodeURIComponent(q) + '" class="ta-all"><span class="ta-e">🔎</span><span><strong>See all ' + hits.length + ' results</strong><small>for “' + esc(q) + '”</small></span></a>';
        list.innerHTML = html;
        list.hidden = false;
        sel = -1;
      });
    }
    input.addEventListener('input', function () { render(input.value.trim()); });
    input.addEventListener('focus', function () { window.HoCDir(); if (input.value.trim()) render(input.value.trim()); });
    input.addEventListener('keydown', function (e) {
      var items = $$('a', list);
      if (list.hidden || !items.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.setAttribute('aria-selected', String(i === sel)); });
      } else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); location.href = items[sel].href; }
      else if (e.key === 'Escape') { list.hidden = true; }
    });
    document.addEventListener('click', function (e) { if (!form.contains(e.target)) list.hidden = true; });
    // Rotating placeholder on the big search.
    var rot = input.getAttribute('data-rotate');
    if (rot && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var opts = JSON.parse(rot), i = 0;
      setInterval(function () { if (document.activeElement !== input && !input.value) input.placeholder = opts[i++ % opts.length]; }, 2600);
    }
  });

  // ---------- Saved places ----------
  var KEY = 'hoc.saved';
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  var write = function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  window.HoCSaved = read;
  function paintSaved() {
    var s = read();
    $$('[data-save]').forEach(function (b) {
      var on = s.indexOf(b.dataset.save) !== -1;
      b.setAttribute('aria-pressed', String(on));
      var l = $('[data-save-label]', b);
      if (l) l.textContent = on ? 'Saved' : 'Save';
    });
    $$('[data-saved-count]').forEach(function (c) { c.textContent = s.length; c.hidden = !s.length; });
  }
  window.HoCPaintSaved = paintSaved;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-save]');
    if (!b) return;
    e.preventDefault();
    var s = read(), i = s.indexOf(b.dataset.save);
    if (i === -1) s.push(b.dataset.save); else s.splice(i, 1);
    write(s);
    paintSaved();
    document.dispatchEvent(new CustomEvent('hoc:saved'));
  });
  paintSaved();

  // ---------- Rails ----------
  $$('.rail-track-wrap').forEach(function (w) {
    var tr = $('[data-rail]', w), prev = $('[data-rail-prev]', w), next = $('[data-rail-next]', w);
    if (!tr || !prev) return;
    var upd = function () {
      prev.disabled = tr.scrollLeft < 10;
      next.disabled = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 10;
    };
    prev.addEventListener('click', function () { tr.scrollBy({ left: -tr.clientWidth * 0.9, behavior: 'smooth' }); });
    next.addEventListener('click', function () { tr.scrollBy({ left: tr.clientWidth * 0.9, behavior: 'smooth' }); });
    tr.addEventListener('scroll', upd, { passive: true });
    upd();
  });
  // Fresh order every visit so the same places don't always lead.
  $$('[data-shuffle-rails] [data-rail]').forEach(function (tr) {
    var kids = Array.prototype.slice.call(tr.children);
    for (var i = kids.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = kids[i]; kids[i] = kids[j]; kids[j] = t; }
    kids.forEach(function (k) { tr.appendChild(k); });
    tr.scrollLeft = 0;
  });

  // ---------- Share ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-share]');
    if (!b) return;
    var data = { title: b.dataset.share, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.lastChild.textContent = ' Link copied'; });
  });
})();

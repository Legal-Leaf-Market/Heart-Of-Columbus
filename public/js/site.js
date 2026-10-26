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
  var ALIAS = { street: 'st', avenue: 'ave', road: 'rd', tacos: 'taco', haircuts: 'haircut', mechanic: 'auto', vets: 'vet', boba: 'tea', donut: 'donut', plumbers: 'plumb' };
  // Query words with aliases applied. Plurals are trimmed for matching
  // ("tacos" finds "taco"), but kept for ranking, so "Jills" still puts
  // Jill's Diner ahead of a Jill.
  var tokens = function (q, keepPlural) {
    return norm(q).split(' ').filter(Boolean).map(function (w) {
      w = ALIAS[w] || w;
      return !keepPlural && w.length > 4 && w.slice(-1) === 's' ? w.slice(0, -1) : w;
    });
  };
  // Every word of the query has to appear somewhere: name, type, address,
  // category or neighborhood.
  // Words people search that a listing rarely says: a taqueria never writes
  // "taco". Each extra word is a real kind of the same thing, not a guess.
  var SYN = { taco: ['taqueria', 'mexican'], burrito: ['taqueria', 'mexican'], pho: ['vietnamese'], sushi: ['japanese'], haircut: ['barber', 'salon'], vet: ['veterinar', 'animal'] };
  var hit = function (hay, w) { return hay.indexOf(w) !== -1 || (SYN[w] || []).some(function (x) { return hay.indexOf(x) !== -1; }); };
  window.HoCMatch = function (b, q) {
    var hay = b._h || (b._h = norm([b.n, b.y, b.a, (CAT[b.c] || [''])[0], b.u, b.r].join(' ')));
    return tokens(q).every(function (w) { return hit(hay, w); });
  };
  // How well a match fits, so "coffee" puts the coffee shops ahead of the
  // popcorn maker that only shares a category with them. The name counts
  // most, then a specific type, then the street or neighborhood, then the
  // broad category. 0 means no match. Ties keep A to Z.
  var starts = function (hay, w) { return (' ' + hay).indexOf(' ' + w) !== -1; };
  window.HoCScore = function (b, q) {
    if (!window.HoCMatch(b, q)) return 0;
    var n = b._n || (b._n = norm(b.n.replace(/^the /i, ''))), y = norm(b.y), where = norm([b.a, b.r].join(' ')), qn = tokens(q, true).join(' ');
    var s = n === qn ? 1000 : n.indexOf(qn) === 0 ? 400 : starts(n, qn) ? 250 : 0;
    var whole = tokens(q, true);
    tokens(q).forEach(function (w, i) {
      if (starts(n, whole[i])) s += 120;
      else if (starts(n, w)) s += 100;
      else if (n.indexOf(w) !== -1) s += 70;
      else if (!b.g && starts(y, w)) s += 60;
      else if (hit(n, w) || (!b.g && hit(y, w))) s += 50;
      else if (starts(where, w)) s += 20;
      else s += 5;
    });
    return s;
  };
  // Matches for q, best first.
  window.HoCRank = function (list, q) {
    var name = function (b) { return b.n.replace(/^the /i, ''); };
    return list.map(function (b) { return [window.HoCScore(b, q), b]; })
      .filter(function (x) { return x[0] > 0; })
      .sort(function (a, b) { return b[0] - a[0] || name(a[1]).localeCompare(name(b[1])); })
      .map(function (x) { return x[1]; });
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
    // Closed cards are hidden, never removed, so one that opens while the page
    // is up comes back on the next repaint. Shuffled once per visit.
    $$('[data-open-rail]').forEach(function (sec) {
      var track = $('[data-rail]', sec);
      if (track && !track.hasAttribute('data-shuffled')) {
        var kids = $$('.bz', track);
        for (var i = kids.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = kids[i]; kids[i] = kids[j]; kids[j] = t; }
        kids.forEach(function (k) { track.appendChild(k); });
        track.setAttribute('data-shuffled', '');
      }
      var open = $$('.bz', sec).filter(function (c) { var o = c.getAttribute('data-is-open') === '1'; c.hidden = !o; return o; });
      open.slice(12).forEach(function (c) { c.hidden = true; });
      sec.hidden = open.length < 3;
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
        var hits = window.HoCRank(all, q);
        var cats = Object.keys(CAT).filter(function (k) { return norm(CAT[k][0]).indexOf(norm(q)) !== -1; }).slice(0, 2);
        var html = cats.map(function (k) {
          return '<a href="/c/' + k + '/"><span class="ta-e" style="--t:' + CAT[k][2] + '">' + CAT[k][1] + '</span><span><strong>' + esc(CAT[k][0]) + '</strong><small>Browse the category</small></span></a>';
        }).join('');
        html += hits.slice(0, 7).map(function (b) {
          var c = CAT[b.c] || ['', '📍', '#eee'];
          var st = b.t ? window.HoCOpen(b.t) : null;
          var extra = (st ? ' · <em class="' + (st.open ? 'ta-open' : 'ta-closed') + '">' + (st.open ? 'Open now' : 'Closed') + '</em>' : '') + (b.o ? ' · Order online' : b.k ? ' · Book online' : b.f ? ' · Shop online' : '');
          return '<a href="/b/' + b.s + '/"><span class="ta-e" style="--t:' + c[2] + '">' + c[1] + '</span><span><strong>' + esc(b.n) + '</strong><small>' + esc(b.y) + (b.a ? ' · ' + esc(b.a) : '') + extra + '</small></span></a>';
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
  // "Save every stop" on a trip page adds them all at once.
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-save-all]');
    if (!b) return;
    var s = read();
    b.dataset.saveAll.split(',').forEach(function (id) { if (s.indexOf(id) === -1) s.push(id); });
    write(s);
    paintSaved();
    var l = b.querySelector('span');
    if (l) l.textContent = 'Saved to your list';
    document.dispatchEvent(new CustomEvent('hoc:saved'));
  });

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

  // ---------- Print one box ----------
  // [data-print] prints only its own section (the grain prices box).
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-print]');
    if (!b) return;
    document.body.classList.add('print-one');
    b.closest('section').classList.add('is-printing');
    window.print();
  });
  window.addEventListener('afterprint', function () {
    document.body.classList.remove('print-one');
    $$('.is-printing').forEach(function (s) { s.classList.remove('is-printing'); });
  });

  // ---------- Share ----------
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-share]');
    if (!b) return;
    var data = { title: b.dataset.share, url: location.href };
    if (navigator.share) navigator.share(data).catch(function () {});
    else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { b.lastChild.textContent = ' Link copied'; });
  });
  // ---------- Mobile menu ----------
  // The menu is a <details>, so it works without this. This adds Escape to
  // close (focus back on the button) and closes it on a tap outside.
  $$('[data-mmenu]').forEach(function (d) {
    var sum = d.querySelector('summary');
    d.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && d.open) { d.open = false; sum.focus(); }
    });
    document.addEventListener('click', function (e) { if (d.open && !d.contains(e.target)) d.open = false; });
  });
})();

// Gill's demo: a simulated chair queue you can join, and appointment booking.
// The clock runs fast (one real second = one shop minute) so the queue
// visibly moves during a pitch.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC, $ = function (s) { return document.querySelector(s); };
  var MIN = 1000; // demo minute
  var CUT = { 'Regular Cut': 20, 'Flat Top': 30, 'Beard Trim': 15, 'Hot Lather Shave': 30, 'Father & Son': 40 };

  var t0 = Date.now();
  var chairs = [1, 2].map(function (n) {
    var c = D.queue.find(function (q) { return q.chair === n; });
    return c ? { who: c.name, service: c.service, start: t0 - c.startedMinAgo * MIN } : null;
  });
  var waiting = D.queue.filter(function (q) { return !q.chair; }).map(function (q) { return { name: q.name, service: q.service }; });
  var mine = H.read('hoc-gills-spot', null);
  if (mine) waiting.push(mine);

  function left(c) { return Math.max(0, (CUT[c.service] || 20) - Math.floor((Date.now() - c.start) / MIN)); }

  function tick() {
    chairs = chairs.map(function (c) {
      if (c && left(c) > 0) return c;
      var next = waiting.shift();
      if (next && next.mine) { mine = null; H.write('hoc-gills-spot', null); H.toast('You’re up! Head on in.'); }
      return next ? { who: next.name, service: next.service, start: Date.now(), mine: next.mine } : null;
    });
    // Keep the demo lively: a sample walk-in now and then.
    if (waiting.length < 2 && Math.random() < 0.08) waiting.splice(0, 0, { name: ['Ray S.', 'Tom K.', 'Andre B.', 'Gary L.'][Math.floor(Math.random() * 4)], service: 'Regular Cut' });
    draw();
  }

  function waitFor(position) {
    // Minutes until a chair frees for the person at `position` (0-based).
    var free = chairs.map(function (c) { return c ? left(c) : 0; }).sort(function (a, b) { return a - b; });
    for (var i = 0; i <= position; i++) {
      var soonest = free.shift();
      var svc = i < waiting.length ? waiting[i].service : 'Regular Cut';
      if (i === position) return soonest;
      free.push(soonest + (CUT[svc] || 20));
      free.sort(function (a, b) { return a - b; });
    }
    return 0;
  }

  function draw() {
    $('[data-open]').textContent = H.openNow(D.hours) ? 'OPEN NOW' : 'CLOSED NOW · DEMO RUNS ANYWAY';
    $('[data-chairs]').innerHTML = chairs.map(function (c, i) {
      if (!c) return '<div class="rounded-2xl border-2 border-dashed border-ink/30 p-4"><p class="text-sm font-bold text-muted">CHAIR ' + (i + 1) + '</p><p class="font-display text-xl text-brand">Open</p></div>';
      var total = CUT[c.service] || 20, pct = Math.min(100, Math.round((1 - left(c) / total) * 100));
      return '<div class="rounded-2xl border-2 border-ink p-4' + (c.mine ? ' bg-accent text-white' : '') + '"><p class="text-sm font-bold opacity-70">CHAIR ' + (i + 1) + '</p>' +
        '<p class="font-display text-xl leading-tight">' + H.esc(c.who) + '</p><p class="text-sm opacity-80">' + H.esc(c.service) + ' · ' + left(c) + ' min left</p>' +
        '<div class="mt-2 h-2 rounded-full bg-ink/10"><div class="h-2 rounded-full bg-brand" style="width:' + pct + '%"></div></div></div>';
    }).join('');
    $('[data-waiting]').textContent = waiting.length;
    $('[data-wait]').textContent = waitFor(waiting.length) + ' min';
    $('[data-list]').innerHTML = waiting.map(function (w, i) {
      return '<li class="flex justify-between rounded-xl px-3 py-2 ' + (w.mine ? 'bg-brand text-white font-bold' : 'bg-ink/5') + '"><span>' + (i + 1) + '. ' + H.esc(w.name) + (w.mine ? ' (you)' : '') +
        '</span><span>' + H.esc(w.service) + ' · ~' + waitFor(i) + ' min</span></li>';
    }).join('');
    var idx = waiting.findIndex(function (w) { return w.mine; });
    $('[data-join]').hidden = idx !== -1 || chairs.some(function (c) { return c && c.mine; });
    $('[data-mine]').innerHTML = idx === -1 ? '' :
      '<div class="rounded-2xl border-2 border-ink bg-accent/10 p-4 flex items-center justify-between gap-3"><p><strong>You’re #' + (idx + 1) + '.</strong> Head over in about ' + Math.max(0, waitFor(idx) - 10) + ' min.</p>' +
      '<button type="button" data-leave class="rounded-full border-2 border-ink px-4 py-1.5 font-bold">Leave line</button></div>';
    var leave = document.querySelector('[data-leave]');
    if (leave) leave.addEventListener('click', function () {
      waiting = waiting.filter(function (w) { return !w.mine; }); mine = null; H.write('hoc-gills-spot', null); draw();
    });
  }

  // ---------- Dialog helpers ----------
  var dlg = document.querySelector('[data-book-dialog]');
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  function show(html) { dlg.innerHTML = '<div class="p-6 grid gap-4">' + html + '</div>'; if (!dlg.open) dlg.showModal(); var x = dlg.querySelector('[data-x]'); if (x) x.addEventListener('click', function () { dlg.close(); }); }
  var close = '<button type="button" data-x class="justify-self-end -mb-2 size-10 rounded-full border-2 border-ink text-xl" aria-label="Close">×</button>';
  var input = function (label, name, type) { return '<label class="grid gap-1 font-semibold">' + label + '<input name="' + name + '"' + (type ? ' type="tel" inputmode="tel" autocomplete="tel"' : ' autocomplete="given-name"') + ' class="hoc-input"></label>'; };
  var err = '<p data-err role="alert" class="hidden rounded-xl bg-red-50 border-2 border-red-700 text-red-800 px-3 py-2 font-semibold"></p>';
  function check(f) {
    var digits = f.phone.value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
    var e = !f.name.value.trim() ? 'Please add your name.' : !/^[2-9]\d{9}$/.test(digits) ? 'Please enter a 10-digit phone number.' : '';
    if (e) { var el = dlg.querySelector('[data-err]'); el.textContent = e; el.classList.remove('hidden'); }
    return !e;
  }
  var svcOptions = D.services.map(function (s) { return '<option>' + H.esc(s.name) + '</option>'; }).join('');

  // ---------- Save my spot ----------
  document.querySelector('[data-join]').addEventListener('click', function () {
    show(close + '<h2 class="font-display text-3xl">Save my spot</h2><form class="grid gap-3" novalidate>' + input('First name', 'name') + input('Phone', 'phone', 'tel') +
      '<label class="grid gap-1 font-semibold">Service<select name="service" class="hoc-input">' + svcOptions + '</select></label>' + err +
      '<button class="rounded-2xl bg-brand text-white font-display text-xl py-3 border-2 border-ink">Put me on the list</button>' +
      '<p class="text-xs text-muted text-center">Demo: Gill’s won’t see this. We’d text you when you’re next.</p></form>');
    dlg.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (!check(e.target.elements)) return;
      mine = { name: e.target.elements.name.value.trim().split(' ')[0], service: e.target.elements.service.value, mine: true };
      waiting.push(mine); H.write('hoc-gills-spot', mine);
      dlg.close(); draw(); H.toast('You’re on the list.');
    });
  });

  // ---------- Book an appointment ----------
  document.querySelectorAll('[data-book]').forEach(function (b) {
    b.addEventListener('click', function () {
      var svc = D.services.find(function (s) { return s.id === b.dataset.book; });
      var slots = H.slots(D.hours, { step: 30, lead: 60, days: 3 });
      if (!slots.length) slots = H.slots({ Monday: ['08:00', '17:00'], Tuesday: ['08:00', '17:00'], Wednesday: ['08:00', '17:00'], Thursday: ['08:00', '17:00'], Friday: ['08:00', '17:00'], Saturday: ['08:00', '14:00'], Sunday: ['08:00', '14:00'] }, { step: 30, lead: 60, days: 3 });
      var days = {}; slots.forEach(function (s) { (days[s.day] = days[s.day] || []).push(s); });
      // A few taken times so the grid looks real.
      var taken = function (i) { return i % 5 === 1 || i % 7 === 3; };
      var n = 0;
      show(close + '<h2 class="font-display text-3xl">Book: ' + H.esc(svc.name) + '</h2>' +
        '<form class="grid gap-3" novalidate><div class="grid gap-3 max-h-72 overflow-y-auto pr-1">' + Object.keys(days).map(function (d) {
          return '<fieldset><legend class="font-bold mb-2">' + H.esc(d) + '</legend><div class="grid grid-cols-3 gap-2">' + days[d].map(function (s) {
            var i = n++;
            return taken(i) ? '<span class="rounded-xl border-2 border-ink/10 px-2 py-2 text-center text-sm text-muted line-through">' + H.esc(s.time) + '</span>'
              : '<label class="opt text-center text-sm px-2 py-2"><input type="radio" name="slot" value="' + s.ms + '" class="sr-only">' + H.esc(s.time) + '</label>';
          }).join('') + '</div></fieldset>';
        }).join('') + '</div>' + input('First name', 'name') + input('Phone', 'phone', 'tel') + err +
        '<button class="rounded-2xl bg-accent text-white font-display text-xl py-3 border-2 border-ink">Book it</button>' +
        '<p class="text-xs text-muted text-center">Demo booking: nothing is sent to Gill’s.</p></form>');
      dlg.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var f = e.target.elements;
        var picked = dlg.querySelector('input[name=slot]:checked');
        if (!picked) { var el = dlg.querySelector('[data-err]'); el.textContent = 'Pick a time.'; el.classList.remove('hidden'); return; }
        if (!check(f)) return;
        var ms = Number(picked.value);
        H.ledger.add('gills', svc.cents);
        show(close + '<p class="font-display text-3xl">You’re booked.</p><p class="text-lg">' + H.esc(svc.name) + ', ' + H.esc(H.dayLabel(ms)) + ' at ' + H.esc(H.timeFmt.format(ms)) + '.</p>' +
          '<p class="rounded-xl bg-ink/5 px-3 py-2 text-sm">Demo only: Gill’s didn’t get this booking. Call <a class="font-bold underline" href="tel:+18123767128">' + H.esc(D.phone) + '</a> to book for real.</p>');
      });
    });
  });

  draw();
  setInterval(tick, MIN);
})();

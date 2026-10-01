// Heart of Columbus shared engine for the five demo storefronts.
//   HoC.cart(slug)         a cart saved in localStorage, one per business
//   HoC.slots(hours)       pickup / appointment times from real hours
//   HoC.mountCart(opts)    floating cart button + checkout drawer
//   HoC.ledger             what demo orders would have kept out of app fees
// Nothing here sends an order anywhere: these are demos until a business
// signs on. Every confirmation says so.
(function () {
  'use strict';

  var TZ = 'America/Indiana/Indianapolis';
  var money = function (cents) { return '$' + (Math.round(cents) / 100).toFixed(2); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var read = function (k, fallback) {
    try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? fallback : v; } catch (e) { return fallback; }
  };
  var write = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };

  // ---------- Cart ----------
  // A line is { key, name, details: [..], cents, qty }. Lines with the same
  // key (same item, same choices) stack.
  function cart(slug) {
    var KEY = 'hoc-cart-' + slug;
    var listeners = [];
    var state = read(KEY, { lines: [] });
    if (!state || !Array.isArray(state.lines)) state = { lines: [] };
    function save() { write(KEY, state); listeners.forEach(function (f) { f(state); }); }
    return {
      lines: function () { return state.lines; },
      add: function (line) {
        var hit = state.lines.find(function (l) { return l.key === line.key; });
        if (hit) hit.qty = Math.min(20, hit.qty + (line.qty || 1));
        else state.lines.push({ key: line.key, name: line.name, details: line.details || [], cents: line.cents, qty: line.qty || 1 });
        save();
      },
      setQty: function (key, qty) {
        state.lines = state.lines
          .map(function (l) { return l.key === key ? Object.assign({}, l, { qty: Math.min(20, qty) }) : l; })
          .filter(function (l) { return l.qty > 0; });
        save();
      },
      clear: function () { state.lines = []; save(); },
      count: function () { return state.lines.reduce(function (n, l) { return n + l.qty; }, 0); },
      subtotal: function () { return state.lines.reduce(function (n, l) { return n + l.cents * l.qty; }, 0); },
      onChange: function (f) { listeners.push(f); f(state); },
    };
  }

  // ---------- Time ----------
  var DAY = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
  function partsAt(ms) {
    var p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hourCycle: 'h23', weekday: 'long',
    }).formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, dow: DAY[p.weekday] };
  }
  function zoned(y, mo, d, h, mi) {
    var want = Date.UTC(y, mo - 1, d, h, mi), guess = want;
    for (var i = 0; i < 2; i++) {
      var p = partsAt(guess);
      guess += want - Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi);
    }
    return guess;
  }
  var toMin = function (hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; };
  var dayFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'short', day: 'numeric' });
  var timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' });
  function dayLabel(ms) {
    var now = Date.now();
    var d = dayFmt.format(ms);
    if (d === dayFmt.format(now)) return 'Today';
    if (d === dayFmt.format(now + 86400000)) return 'Tomorrow';
    return d;
  }

  // hours: { Monday: ['06:30','14:00'], ... } with missing days closed.
  // Returns [{ ms, day, time, busy }] for the next `days` open days.
  // busy marks a known rush window, if the page passes one.
  function slots(hours, opts) {
    opts = opts || {};
    var step = opts.step || 15, lead = opts.lead == null ? 20 : opts.lead, days = opts.days || 2;
    var now = opts.now || Date.now();
    var out = [], openDays = 0, today = partsAt(now);
    for (var off = 0; off < 8 && openDays < days; off++) {
      var day = partsAt(zoned(today.y, today.mo, today.d, 12, 0) + off * 86400000);
      var name = Object.keys(DAY).find(function (k) { return DAY[k] === day.dow; });
      var h = hours[name];
      if (!h) continue;
      var any = false;
      for (var m = toMin(h[0]) + step; m <= toMin(h[1]) - step; m += step) {
        var ms = zoned(day.y, day.mo, day.d, Math.floor(m / 60), m % 60);
        if (ms < now + lead * 60000) continue;
        var busy = !!(opts.rush && m >= toMin(opts.rush[0]) && m < toMin(opts.rush[1]));
        out.push({ ms: ms, day: dayLabel(ms), time: timeFmt.format(ms), busy: busy });
        any = true;
      }
      if (any) openDays++;
    }
    return out;
  }

  function openNow(hours, now) {
    now = now || Date.now();
    var p = partsAt(now);
    var name = Object.keys(DAY).find(function (k) { return DAY[k] === p.dow; });
    var h = hours[name];
    if (!h) return false;
    var m = p.h * 60 + p.mi;
    return m >= toMin(h[0]) && m < toMin(h[1]);
  }

  // ---------- Savings ledger ----------
  // Every demo order adds its subtotal. The hub shows what those orders
  // would have lost to a delivery app at the chosen commission rate.
  var ledger = {
    add: function (slug, cents) {
      var all = read('hoc-ledger', []);
      all.push({ slug: slug, cents: cents, at: Date.now() });
      write('hoc-ledger', all.slice(-500));
    },
    entries: function () { return read('hoc-ledger', []); },
    total: function () { return ledger.entries().reduce(function (n, e) { return n + e.cents; }, 0); },
  };

  // ---------- Toast ----------
  function toast(msg) {
    var t = document.createElement('div');
    t.setAttribute('role', 'status');
    t.className = 'fixed left-1/2 -translate-x-1/2 bottom-24 z-[80] rounded-full bg-ink text-paper px-5 py-3 font-semibold shadow-lg transition-opacity duration-300';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; }, 1600);
    setTimeout(function () { t.remove(); }, 2000);
  }

  // ---------- Cart drawer + checkout ----------
  // opts: { slug, business, cart, hours, rush, payNote, kind: 'order'|'booking',
  //         onConfirm(order) -> optional custom confirmation (returns HTML) }
  function mountCart(opts) {
    var c = opts.cart;
    var fab = document.createElement('button');
    fab.type = 'button';
    fab.className = 'hoc-fab fixed right-4 bottom-4 z-[60] hidden items-center gap-3 rounded-full bg-brand text-brand-ink pl-2 pr-5 py-2 font-display text-lg shadow-[4px_4px_0_var(--ink)] border-2 border-ink';
    fab.innerHTML = '<span data-n class="grid place-items-center min-w-9 h-9 px-2 rounded-full bg-paper text-ink text-base"></span><span>Your order</span><span data-t></span>';
    document.body.appendChild(fab);

    var dlg = document.createElement('dialog');
    dlg.className = 'hoc-dialog w-full max-w-lg p-0 rounded-t-3xl sm:rounded-3xl border-2 border-ink bg-surface text-ink backdrop:bg-black/60 mt-auto sm:mt-auto mb-0 sm:mb-auto';
    dlg.setAttribute('aria-label', 'Your order');
    document.body.appendChild(dlg);

    function render() {
      var n = c.count();
      fab.querySelector('[data-n]').textContent = n;
      fab.querySelector('[data-t]').textContent = money(c.subtotal());
      fab.classList.toggle('hidden', n === 0);
      fab.classList.toggle('flex', n > 0);
    }
    c.onChange(render);
    fab.addEventListener('click', openCart);

    function slotOptions() {
      var list = slots(opts.hours, { rush: opts.rush });
      var demo = false;
      if (!list.length) {
        // Shop closed for days (or hours unknown): still let the demo run.
        demo = true;
        list = slots({ Sunday: ['08:00', '17:00'], Monday: ['08:00', '17:00'], Tuesday: ['08:00', '17:00'], Wednesday: ['08:00', '17:00'], Thursday: ['08:00', '17:00'], Friday: ['08:00', '17:00'], Saturday: ['08:00', '17:00'] });
      }
      var groups = {};
      list.forEach(function (s) { (groups[s.day] = groups[s.day] || []).push(s); });
      return Object.keys(groups).map(function (d) {
        return '<optgroup label="' + esc(d) + '">' + groups[d].map(function (s) {
          return '<option value="' + s.ms + '">' + esc(d + ', ' + s.time + (s.busy ? ' (morning rush)' : '') + (demo ? ' (demo)' : '')) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
    }

    function openCart() {
      var lines = c.lines();
      dlg.innerHTML =
        '<div class="p-5 sm:p-6 max-h-[88vh] overflow-y-auto">' +
        '<div class="flex items-center justify-between gap-3 mb-3"><h2 class="font-display text-2xl">Your order</h2>' +
        '<button type="button" data-close class="size-11 rounded-full border-2 border-ink text-2xl leading-none" aria-label="Close">×</button></div>' +
        (lines.length ? '' : '<p class="text-muted py-4">Nothing here yet.</p>') +
        '<ul class="divide-y divide-ink/15">' + lines.map(function (l) {
          return '<li class="py-3 grid grid-cols-[1fr_auto_auto] gap-3 items-center">' +
            '<div><p class="font-semibold leading-tight">' + esc(l.name) + '</p>' +
            (l.details.length ? '<p class="text-sm text-muted leading-snug">' + l.details.map(esc).join(' · ') + '</p>' : '') + '</div>' +
            '<div class="inline-flex items-center rounded-full border-2 border-ink">' +
            '<button type="button" class="size-9 text-xl font-bold" data-dec="' + esc(l.key) + '" aria-label="One fewer">−</button>' +
            '<span class="min-w-6 text-center font-bold">' + l.qty + '</span>' +
            '<button type="button" class="size-9 text-xl font-bold" data-inc="' + esc(l.key) + '" aria-label="One more">+</button></div>' +
            '<p class="font-display text-lg min-w-16 text-right">' + money(l.cents * l.qty) + '</p></li>';
        }).join('') + '</ul>' +
        (lines.length ?
          '<div class="flex justify-between font-display text-xl pt-3"><span>Subtotal</span><span>' + money(c.subtotal()) + '</span></div>' +
          '<p class="text-sm text-muted mt-1 mb-4">' + esc(opts.payNote || 'Pay at the counter when you pick up. No app fees.') + '</p>' +
          '<form data-checkout class="grid gap-3" novalidate>' +
          '<div class="grid grid-cols-2 gap-3">' + field('First name', 'first', 'given-name') + field('Last name', 'last', 'family-name') + '</div>' +
          field('Phone', 'phone', 'tel', 'tel') +
          '<label class="grid gap-1 font-semibold">Pickup time<select name="when" class="hoc-input">' + slotOptions() + '</select></label>' +
          '<label class="grid gap-1 font-semibold">Notes <span class="font-normal text-muted text-sm -mt-1">optional</span><textarea name="notes" rows="2" maxlength="300" class="hoc-input"></textarea></label>' +
          '<p data-err role="alert" class="hidden rounded-xl border-2 border-red-700 bg-red-50 text-red-800 px-3 py-2 font-semibold"></p>' +
          '<button class="rounded-2xl bg-brand text-brand-ink border-2 border-ink font-display text-xl py-3 shadow-[3px_3px_0_var(--ink)]">Place pickup order</button>' +
          '<p class="text-xs text-center text-muted">Demo: no order is sent to ' + esc(opts.business) + '.</p></form>'
          : '') +
        '</div>';
      wire();
      if (!dlg.open) dlg.showModal();
    }

    function field(label, name, auto, type) {
      return '<label class="grid gap-1 font-semibold">' + label +
        '<input name="' + name + '" autocomplete="' + auto + '" ' + (type ? 'type="' + type + '" inputmode="tel"' : '') + ' maxlength="40" class="hoc-input"></label>';
    }

    function wire() {
      dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
      dlg.querySelectorAll('[data-dec]').forEach(function (b) {
        b.addEventListener('click', function () {
          var l = c.lines().find(function (x) { return x.key === b.dataset.dec; });
          c.setQty(b.dataset.dec, l.qty - 1); openCart();
        });
      });
      dlg.querySelectorAll('[data-inc]').forEach(function (b) {
        b.addEventListener('click', function () {
          var l = c.lines().find(function (x) { return x.key === b.dataset.inc; });
          c.setQty(b.dataset.inc, l.qty + 1); openCart();
        });
      });
      var form = dlg.querySelector('[data-checkout]');
      if (form) form.addEventListener('submit', submit);
    }

    function submit(e) {
      e.preventDefault();
      var f = e.target.elements;
      var err = dlg.querySelector('[data-err]');
      var digits = f.phone.value.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
      var problem = !f.first.value.trim() ? 'Please add your first name.'
        : !f.last.value.trim() ? 'Please add your last name.'
        : !/^[2-9]\d{9}$/.test(digits) ? 'Please enter a 10-digit phone number.'
        : '';
      if (problem) { err.textContent = problem; err.classList.remove('hidden'); return; }
      var order = {
        number: 'A' + String(Math.floor(Math.random() * 900) + 100),
        name: f.first.value.trim(),
        phone: '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6),
        when: Number(f.when.value),
        whenLabel: dayLabel(Number(f.when.value)) + ' at ' + timeFmt.format(Number(f.when.value)),
        lines: c.lines().slice(),
        subtotal: c.subtotal(),
        notes: f.notes.value.trim(),
      };
      ledger.add(opts.slug, order.subtotal);
      c.clear();
      dlg.innerHTML =
        '<div class="p-6 grid gap-3">' +
        '<p class="font-display text-3xl">Order ' + esc(order.number) + ' is in!</p>' +
        '<p class="text-lg">Pickup ' + esc(order.whenLabel.charAt(0).toLowerCase() + order.whenLabel.slice(1)) + '. ' + esc(opts.payNote || 'Pay at the counter.') + '</p>' +
        (opts.onConfirm ? opts.onConfirm(order) : '') +
        '<p class="rounded-xl bg-ink/5 px-3 py-2 text-sm">This is a Heart of Columbus demo, so nothing was sent to ' + esc(opts.business) + '. The ' + money(order.subtotal) +
        ' you just “spent” now counts toward the local-savings tracker on the hub.</p>' +
        '<button type="button" data-close class="rounded-2xl bg-ink text-paper font-display text-xl py-3">Done</button></div>';
      dlg.querySelector('[data-close]').addEventListener('click', function () { dlg.close(); });
    }

    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
    return { open: openCart };
  }

  window.HoC = { TZ: TZ, money: money, esc: esc, cart: cart, slots: slots, openNow: openNow, ledger: ledger, toast: toast, mountCart: mountCart, timeFmt: timeFmt, dayLabel: dayLabel, read: read, write: write };
})();

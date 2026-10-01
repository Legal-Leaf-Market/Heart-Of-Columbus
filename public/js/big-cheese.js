// The Big Cheese demo: a step-by-step sub builder, combo add-ons, and a
// daily special that counts down to closing time.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC, $ = function (s) { return document.querySelector(s); };
  var cart = H.cart(D.slug);
  H.mountCart({ slug: D.slug, business: D.business, cart: cart, hours: D.hours, payNote: 'Cash only at the counter when you pick up. No app fees.' });
  var B = D.build;
  var sig = function (id) { return D.signatures.find(function (s) { return s.id === id; }); };

  // ---------- Daily special ----------
  function weekdayParts() {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: H.TZ, weekday: 'short', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    var dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(p.weekday);
    return { dow: dow, secs: (+p.hour % 24) * 3600 + +p.minute * 60 + +p.second };
  }
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function special() {
    var now = weekdayParts();
    var s = D.specials[now.dow] && sig(D.specials[now.dow]);
    var h = D.hours[DAYS[now.dow]];
    var bar = $('[data-special]');
    if (!s || !h) { bar.innerHTML = ''; return; }
    var close = h[1].split(':'), left = (+close[0] * 3600 + +close[1] * 60) - now.secs;
    var open = h[0].split(':'), beforeOpen = now.secs < (+open[0] * 3600 + +open[1] * 60);
    var clock = left <= 0 ? 'Ended for today' : beforeOpen ? 'Starts at open' :
      [Math.floor(left / 3600), Math.floor(left % 3600 / 60), left % 60].map(function (n, i) { return i ? String(n).padStart(2, '0') : n; }).join(':') + ' left';
    bar.innerHTML = '<div class="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">' +
      '<p><span class="font-display text-accent">TODAY’S SPECIAL<span class="sample !text-white/70 !bg-white/15">sample</span></span> ' +
      H.esc(s.name) + ', $1 off: <strong>' + H.money(s.cents - 100) + '</strong></p>' +
      '<div class="flex items-center gap-3"><span class="font-display text-xl tabular-nums" aria-live="off">' + clock + '</span>' +
      (left > 0 ? '<button type="button" data-add-special class="rounded-full bg-accent text-ink px-4 py-1.5 font-bold">Add it</button>' : '') + '</div></div>';
    var b = bar.querySelector('[data-add-special]');
    if (b) b.addEventListener('click', function () {
      cart.add({ key: 'special|' + s.id, name: s.name + ' (daily special)', details: ['$1 off today'], cents: s.cents - 100 });
      H.toast('Special added');
    });
  }
  special();
  setInterval(special, 1000);

  // ---------- Builder ----------
  var state = { bread: B.breads[0], meats: [B.meats[0]], cheeses: [B.cheeses[0]], toppings: ['Lettuce', 'Tomato'], dressings: ['Mayo'], combo: [] };
  var steps = [
    { key: 'bread', title: 'Bread', single: true, options: B.breads },
    { key: 'meats', title: 'Meats', hint: 'First one included, extras +' + H.money(B.extraMeat), options: B.meats },
    { key: 'cheeses', title: 'Cheese', hint: 'First one included, extras +' + H.money(B.extraCheese), options: B.cheeses },
    { key: 'toppings', title: 'Toppings', hint: 'On the house', options: B.toppings },
    { key: 'dressings', title: 'Dressings', options: B.dressings },
    { key: 'combo', title: 'Make it a combo', options: D.combo.map(function (c) { return c.name; }) },
  ];
  var list = $('[data-steps]');
  steps.forEach(function (st, i) {
    var li = document.createElement('li');
    li.innerHTML = '<div class="flex items-baseline gap-3"><span class="grid place-items-center size-10 rounded-full bg-brand text-white font-display text-xl border-2 border-ink">' + (i + 1) + '</span>' +
      '<h3 class="font-display text-3xl">' + H.esc(st.title) + '</h3>' + (st.hint ? '<span class="text-muted text-sm">' + H.esc(st.hint) + '</span>' : '') + '</div>' +
      '<div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2"></div>';
    var grid = li.querySelector('div.grid');
    st.options.forEach(function (o) {
      var combo = st.key === 'combo' ? D.combo.find(function (c) { return c.name === o; }) : null;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.innerHTML = H.esc(o) + (combo ? '<span class="block text-sm text-muted font-normal">+' + H.money(combo.cents) + (combo.sample ? ' (sample)' : '') + '</span>' : '');
      b.addEventListener('click', function () {
        if (st.single) state[st.key] = o;
        else {
          var at = state[st.key].indexOf(o);
          if (at === -1) state[st.key].push(o); else state[st.key].splice(at, 1);
        }
        draw();
      });
      b.dataset.step = st.key; b.dataset.value = o;
      grid.appendChild(b);
    });
    list.appendChild(li);
  });

  function price() {
    var c = B.base + Math.max(0, state.meats.length - 1) * B.extraMeat + Math.max(0, state.cheeses.length - 1) * B.extraCheese;
    state.combo.forEach(function (n) { c += D.combo.find(function (x) { return x.name === n; }).cents; });
    return c;
  }
  function draw() {
    document.querySelectorAll('[data-step]').forEach(function (b) {
      var v = state[b.dataset.step];
      b.setAttribute('aria-pressed', String(Array.isArray(v) ? v.indexOf(b.dataset.value) !== -1 : v === b.dataset.value));
    });
    var ok = state.meats.length || state.cheeses.length;
    var sum = $('[data-summary]');
    var row = function (label, v) { return v.length ? '<li><span class="font-bold">' + label + ':</span> ' + H.esc(v.join(', ')) + '</li>' : ''; };
    sum.innerHTML = '<p class="font-display text-sm text-brand">YOUR SUB</p>' +
      '<ul class="mt-2 grid gap-1 text-[15px]">' + row('Bread', [state.bread]) + row('Meat', state.meats) + row('Cheese', state.cheeses) + row('Toppings', state.toppings) + row('Dressing', state.dressings) + row('Combo', state.combo) + '</ul>' +
      '<p class="mt-4 font-display text-5xl">' + H.money(price()) + '</p>' +
      (ok ? '' : '<p class="mt-2 text-sm font-semibold text-red-700">Pick at least one meat or cheese.</p>') +
      '<button type="button" data-add-sub class="mt-4 w-full rounded-2xl bg-brand text-white font-display text-2xl py-3 border-2 border-ink shadow-[3px_3px_0_var(--ink)] disabled:opacity-40"' + (ok ? '' : ' disabled') + '>Add to order</button>';
    sum.querySelector('[data-add-sub]').addEventListener('click', function () {
      var details = [state.bread].concat(state.meats, state.cheeses, state.toppings, state.dressings, state.combo.map(function (c) { return '+ ' + c; }));
      cart.add({ key: 'build|' + details.join('|'), name: 'Build-your-own sub', details: details, cents: price() });
      H.toast('Sub added');
    });
  }
  draw();

  document.querySelectorAll('[data-sig]').forEach(function (b) {
    b.addEventListener('click', function () {
      var s = sig(b.dataset.sig);
      cart.add({ key: 'sig|' + s.id, name: s.name, details: [], cents: s.cents });
      H.toast(s.name + ' added');
    });
  });
})();

// TaColumbus demo: birria plates and street taco packs with toggles.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC;
  var cart = H.cart(D.slug);
  H.mountCart({ slug: D.slug, business: D.business, cart: cart, hours: D.hours, payNote: 'Pay at the counter when you pick up. No app fees.' });

  // A row of toggle buttons. Returns { el, value() }.
  function toggles(label, options, start) {
    var wrap = document.createElement('fieldset');
    wrap.className = 'grid gap-2';
    wrap.innerHTML = '<legend class="font-display text-sm mb-1">' + H.esc(label) + '</legend><div class="flex flex-wrap gap-2"></div>';
    var row = wrap.querySelector('div');
    var current = start == null ? options[0].value : start;
    options.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'rounded-full border-2 border-ink px-4 py-2 font-bold transition aria-pressed:bg-ink aria-pressed:text-white';
      b.textContent = o.label;
      b.setAttribute('aria-pressed', String(o.value === current));
      b.addEventListener('click', function () {
        current = o.value;
        row.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        wrap.dispatchEvent(new Event('change', { bubbles: true }));
      });
      row.appendChild(b);
    });
    return { el: wrap, value: function () { return current; } };
  }
  var opts = function (list) { return list.map(function (x) { return { label: x, value: x }; }); };
  var HEAT = opts(D.heat);
  var TORT = opts(['Corn', 'Flour']);
  var TOPS = [{ label: 'Cilantro + onion', value: 'both' }, { label: 'Cilantro only', value: 'cilantro' }, { label: 'Onion only', value: 'onion' }, { label: 'Plain', value: 'none' }];
  var topLabel = { both: 'cilantro + onion', cilantro: 'cilantro only', onion: 'onion only', none: 'no cilantro or onion' };
  var heatColor = { Mild: 'bg-green-500', Medium: 'bg-yellow-400', Hot: 'bg-orange-500', Fuego: 'bg-red-600' };

  function addBtn(text) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'w-full rounded-2xl bg-brand text-white font-display text-lg py-3 border-2 border-ink shadow-[3px_3px_0_var(--ink)] active:translate-y-0.5';
    b.textContent = text;
    return b;
  }
  function pop(msg) { H.toast(msg); }

  // ---------- Birria ----------
  var birriaWrap = document.querySelector('[data-birria]');
  D.birria.forEach(function (item) {
    var card = document.createElement('article');
    card.className = 'grid gap-4 rounded-3xl border-4 border-ink p-5 bg-white';
    card.innerHTML = '<div class="flex items-start justify-between gap-3"><div><h3 class="font-display text-2xl leading-none">' + H.esc(item.name) + '</h3><p class="mt-2 text-muted">' + H.esc(item.desc) + '</p></div>' +
      '<p class="shrink-0 -rotate-6 rounded-full bg-accent px-3 py-2 font-display text-lg border-2 border-ink">' + H.money(item.cents) + '</p></div>';
    var tort = toggles('Tortilla', TORT), tops = toggles('Toppings', TOPS), heat = toggles('Salsa heat', HEAT, 'Medium');
    [tort, tops, heat].forEach(function (x) { card.appendChild(x.el); });
    var b = addBtn('Add to order');
    b.addEventListener('click', function () {
      var details = [tort.value() + ' tortillas', topLabel[tops.value()], heat.value() + ' salsa', 'consomé included'];
      cart.add({ key: item.id + '|' + details.join('|'), name: item.name, details: details, cents: item.cents });
      pop(item.name + ' added');
    });
    card.appendChild(b);
    birriaWrap.appendChild(card);
  });

  // ---------- Street taco pack builder ----------
  var builder = document.querySelector('[data-builder]');
  var meat = D.meats[0].id, size = 3;
  var grid = document.createElement('div');
  grid.className = 'grid gap-6 lg:grid-cols-[1fr_320px]';
  var left = document.createElement('div');
  left.className = 'grid gap-5';
  var meatField = document.createElement('fieldset');
  meatField.innerHTML = '<legend class="font-display text-sm mb-2">Meat</legend><div class="grid grid-cols-2 sm:grid-cols-3 gap-2"></div>';
  D.meats.forEach(function (m) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'opt';
    b.setAttribute('aria-pressed', String(m.id === meat));
    b.innerHTML = '<span class="block">' + H.esc(m.name) + (m.sample ? '<span class="sample">sample</span>' : '') + '</span><span class="text-sm text-muted">' + H.money(m.cents) + ' each</span>';
    b.addEventListener('click', function () {
      meat = m.id;
      meatField.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      update();
    });
    meatField.querySelector('div').appendChild(b);
  });
  var sizeT = toggles('How many', D.packs.map(function (n) { return { label: n === 1 ? '1 taco' : n + '-pack', value: n }; }), size);
  var tortT = toggles('Tortilla', TORT), topsT = toggles('Toppings', TOPS), heatT = toggles('Salsa heat', HEAT, 'Medium');
  [meatField, sizeT.el, tortT.el, topsT.el, heatT.el].forEach(function (x) { left.appendChild(x); });

  var summary = document.createElement('aside');
  summary.className = 'self-start rounded-3xl border-4 border-ink bg-paper text-white p-5 grid gap-3 lg:sticky lg:top-4';
  grid.appendChild(left); grid.appendChild(summary);
  builder.appendChild(grid);
  builder.addEventListener('change', update);

  function update() {
    size = sizeT.value();
    var m = D.meats.find(function (x) { return x.id === meat; });
    var heat = heatT.value();
    summary.innerHTML = '<p class="font-display text-accent text-sm">YOUR PACK</p>' +
      '<p class="font-display text-3xl leading-none">' + size + '× ' + H.esc(m.name) + '</p>' +
      '<ul class="text-white/85 text-sm grid gap-1"><li>' + H.esc(tortT.value()) + ' tortillas</li><li>' + H.esc(topLabel[topsT.value()]) + '</li>' +
      '<li class="flex items-center gap-2"><span class="inline-block size-3 rounded-full ' + heatColor[heat] + '"></span>' + H.esc(heat) + ' salsa</li></ul>' +
      '<p class="font-display text-4xl">' + H.money(m.cents * size) + '</p>';
    var b = addBtn('Add pack to order');
    b.addEventListener('click', function () {
      var details = [tortT.value() + ' tortillas', topLabel[topsT.value()], heat + ' salsa'];
      cart.add({ key: 'pack|' + meat + '|' + size + '|' + details.join('|'), name: size + '× ' + m.name + ' street tacos', details: details, cents: m.cents * size });
      pop('Taco pack added');
    });
    summary.appendChild(b);
  }
  update();

  // ---------- Drinks ----------
  var drinks = document.querySelector('[data-drinks]');
  D.drinks.forEach(function (d) {
    var card = document.createElement('article');
    card.className = 'grid gap-4 rounded-3xl border-4 border-ink p-5 bg-white';
    card.innerHTML = '<div class="flex items-start justify-between gap-3"><div><h3 class="font-display text-2xl leading-none">' + H.esc(d.name) + (d.sample ? '<span class="sample">sample</span>' : '') + '</h3><p class="mt-2 text-muted">' + H.esc(d.desc) + '</p></div>' +
      '<p class="shrink-0 rotate-6 rounded-full bg-accent px-3 py-2 font-display text-lg border-2 border-ink">' + H.money(d.cents) + '</p></div>';
    var flavor = d.flavors ? toggles('Flavor', opts(d.flavors)) : null;
    if (flavor) card.appendChild(flavor.el);
    var b = addBtn('Add');
    b.addEventListener('click', function () {
      var details = flavor ? [flavor.value()] : [];
      cart.add({ key: d.id + '|' + details.join('|'), name: d.name, details: details, cents: d.cents });
      pop(d.name + ' added');
    });
    card.appendChild(b);
    drinks.appendChild(card);
  });
})();

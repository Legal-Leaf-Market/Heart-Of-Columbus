// Rohde's demo: a breakfast configurator (eggs your way, meat, potatoes,
// bread, gravy), a skillet builder, the classics, and pickup slots that flag
// the morning rush.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC, $ = function (s) { return document.querySelector(s); };
  var cart = H.cart(D.slug);
  H.mountCart({ slug: D.slug, business: D.business, cart: cart, hours: D.hours, rush: D.rush, payNote: 'Pay at the counter when you pick up. No app fees.' });

  var mode = 'rise';
  var R = D.rise, S = D.skillet;
  var state = {
    rise: { eggs: 'Over medium', meat: R.meats[0].name, potato: R.potatoes[0], bread: R.breads[0], gravy: false },
    skillet: { eggs: 'Scrambled', meats: ['Sausage'], veggies: ['Onion', 'Green pepper'], cheese: 'Cheddar', gravy: false },
  };

  function group(title, opts, isOn, onPick, hint) {
    var f = document.createElement('fieldset');
    f.innerHTML = '<legend class="font-display text-2xl uppercase">' + H.esc(title) + (hint ? ' <span class="font-sans normal-case text-sm text-muted">' + H.esc(hint) + '</span>' : '') + '</legend><div class="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2"></div>';
    opts.forEach(function (o) {
      var label = typeof o === 'string' ? o : o.name;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'opt';
      b.setAttribute('aria-pressed', String(isOn(label)));
      b.innerHTML = H.esc(label) + (o.cents ? '<span class="block text-sm font-normal text-muted">+' + H.money(o.cents) + '</span>' : '') + (o.sample ? '<span class="sample">sample</span>' : '');
      b.addEventListener('click', function () { onPick(label); draw(); });
      f.querySelector('div').appendChild(b);
    });
    return f;
  }

  function priceRise(s) { var m = R.meats.find(function (x) { return x.name === s.meat; }); return R.cents + (m ? m.cents : 0) + (s.gravy ? R.gravy.cents : 0); }
  function priceSkillet(s) { return S.cents + Math.max(0, s.meats.length - 1) * S.extraMeat + (s.gravy ? R.gravy.cents : 0); }

  function draw() {
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === mode)); });
    var b = $('[data-builder]');
    b.innerHTML = '';
    var s = state[mode];
    var toggle = function (arr, v) { var i = arr.indexOf(v); if (i === -1) arr.push(v); else arr.splice(i, 1); };
    b.appendChild(group('Eggs', D.eggs, function (v) { return s.eggs === v; }, function (v) { s.eggs = v; }, 'two eggs'));
    if (mode === 'rise') {
      b.appendChild(group('Meat', R.meats, function (v) { return s.meat === v; }, function (v) { s.meat = v; }));
      b.appendChild(group('Potatoes', R.potatoes, function (v) { return s.potato === v; }, function (v) { s.potato = v; }));
      b.appendChild(group('Bread', R.breads, function (v) { return s.bread === v; }, function (v) { s.bread = v; }));
    } else {
      b.appendChild(group('Meats', S.meats, function (v) { return s.meats.indexOf(v) !== -1; }, function (v) { toggle(s.meats, v); }, 'first included, extras +' + H.money(S.extraMeat)));
      b.appendChild(group('Veggies', S.veggies, function (v) { return s.veggies.indexOf(v) !== -1; }, function (v) { toggle(s.veggies, v); }));
      b.appendChild(group('Cheese', S.cheeses, function (v) { return s.cheese === v; }, function (v) { s.cheese = v; }));
    }
    b.appendChild(group('Smother it', [{ name: 'Sausage gravy on top', cents: R.gravy.cents, sample: true }], function () { return s.gravy; }, function () { s.gravy = !s.gravy; }));

    var price = mode === 'rise' ? priceRise(s) : priceSkillet(s);
    var lines = mode === 'rise'
      ? ['2 eggs ' + s.eggs.toLowerCase(), s.meat, s.potato, s.bread].concat(s.gravy ? ['Sausage gravy on top'] : [])
      : ['2 eggs ' + s.eggs.toLowerCase(), s.meats.join(', ') || 'No meat', s.veggies.join(', ') || 'No veggies', s.cheese].concat(s.gravy ? ['Sausage gravy on top'] : []);
    var name = mode === 'rise' ? 'Rise and Shine' : 'Build-a-Skillet';
    var sum = $('[data-summary]');
    sum.innerHTML = '<p class="font-script text-2xl text-brand">' + name + '</p>' +
      '<ul class="mt-2 grid gap-1">' + lines.map(function (l) { return '<li class="flex gap-2"><span class="text-brand">•</span>' + H.esc(l) + '</li>'; }).join('') + '</ul>' +
      '<p class="mt-4 font-display text-5xl">' + H.money(price) + '</p>' +
      '<button type="button" data-add class="mt-4 w-full rounded-2xl bg-brand text-white font-display text-xl uppercase py-3 border-2 border-ink shadow-[3px_3px_0_var(--ink)]">Add to order</button>';
    sum.querySelector('[data-add]').addEventListener('click', function () {
      cart.add({ key: mode + '|' + lines.join('|'), name: name, details: lines, cents: price });
      H.toast(name + ' added');
    });
  }
  document.querySelectorAll('[data-tab]').forEach(function (t) { t.addEventListener('click', function () { mode = t.dataset.tab; draw(); }); });
  draw();

  // ---------- Classics ----------
  var ul = $('[data-classics]');
  D.classics.forEach(function (c) {
    var li = document.createElement('li');
    li.className = 'flex flex-col gap-3 rounded-[1.6rem] border-2 border-ink bg-surface p-5';
    var pick = c.choice ? c.choice[0] : null, egg = c.eggs ? 'Over medium' : null;
    li.innerHTML = '<div class="flex items-start justify-between gap-3"><h3 class="font-display text-2xl uppercase leading-tight">' + H.esc(c.name) + '</h3><p class="font-display text-2xl">' + H.money(c.cents) + '</p></div><p class="text-muted">' + H.esc(c.desc) + '</p>';
    var sel = function (label, list, onPick, start) {
      var l = document.createElement('label');
      l.className = 'grid gap-1 font-semibold';
      l.innerHTML = label + '<select class="hoc-input">' + list.map(function (o) { return '<option' + (o === start ? ' selected' : '') + '>' + H.esc(o) + '</option>'; }).join('') + '</select>';
      l.querySelector('select').addEventListener('change', function (e) { onPick(e.target.value); });
      return l;
    };
    if (c.choice) li.appendChild(sel('Choose', c.choice, function (v) { pick = v; }, pick));
    if (c.eggs) li.appendChild(sel('Eggs', D.eggs, function (v) { egg = v; }, egg));
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'self-start rounded-full bg-brand text-white px-5 py-2 font-bold border-2 border-ink';
    b.textContent = 'Add';
    b.addEventListener('click', function () {
      var details = [pick, egg && '2 eggs ' + egg.toLowerCase()].filter(Boolean);
      cart.add({ key: c.id + '|' + details.join('|'), name: c.name, details: details, cents: c.cents });
      H.toast(c.name + ' added');
    });
    li.appendChild(b);
    ul.appendChild(li);
  });
})();

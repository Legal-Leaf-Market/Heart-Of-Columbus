// Tasty Express demo: one portion toggle, one tap per dish, and a simulated
// text message confirmation.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC, $ = function (s) { return document.querySelector(s); };
  var cart = H.cart(D.slug);
  var portion = 'lunch';

  H.mountCart({
    slug: D.slug, business: D.business, cart: cart, hours: D.hours,
    payNote: 'Pay at the counter when you pick up. No app fees.',
    onConfirm: function (o) {
      // A phone showing the texts the customer would get. Nothing is sent.
      setTimeout(function () {
        var t = document.querySelector('[data-sms-ready]');
        if (t) { t.classList.remove('hidden'); t.classList.add('animate-pulse'); setTimeout(function () { t.classList.remove('animate-pulse'); }, 1200); }
      }, 3500);
      var bubble = 'max-w-[85%] rounded-2xl rounded-bl-md bg-[#e9e9eb] text-black px-3 py-2 text-[15px] leading-snug';
      return '<div class="mx-auto w-64 rounded-[2.2rem] border-[6px] border-black bg-white p-3 shadow-xl" aria-label="Simulated text messages">' +
        '<p class="text-center text-xs font-semibold text-gray-500">Tasty Express \u00b7 now</p>' +
        '<div class="mt-2 grid gap-2">' +
        '<p class="' + bubble + '">Tasty Express: Thanks ' + H.esc(o.name) + '! Order ' + H.esc(o.number) + ' (' + H.money(o.subtotal) + ') is in. Pickup ' + H.esc(o.whenLabel.toLowerCase()) + ' at ' + H.esc(D.address) + '. Pay at the counter.</p>' +
        '<p data-sms-ready class="hidden ' + bubble + '">Tasty Express: Order ' + H.esc(o.number) + ' is ready!</p>' +
        '</div></div><p class="text-center text-xs text-muted">Simulated texts to ' + H.esc(o.phone) + '. No message was sent.</p>';
    },
  });

  // ---------- Portion toggle ----------
  var pWrap = $('[data-portion]');
  Object.keys(D.portions).forEach(function (k) {
    var p = D.portions[k];
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.p = k;
    b.className = 'rounded-xl px-3 py-2.5 text-left transition aria-checked:bg-accent aria-checked:text-black';
    b.innerHTML = '<span class="block font-display text-lg uppercase leading-none">' + H.esc(p.label) + ' ' + H.money(p.cents) + '</span><span class="block text-xs opacity-80 mt-1">' + H.esc(p.note) + '</span>';
    b.addEventListener('click', function () { portion = k; draw(); });
    pWrap.appendChild(b);
  });

  // ---------- Dishes ----------
  var list = $('[data-dishes]');
  function draw() {
    pWrap.querySelectorAll('[role=radio]').forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.p === portion)); });
    var p = D.portions[portion];
    list.innerHTML = '';
    D.dishes.forEach(function (d) {
      var key = d.id + '|' + portion;
      var inCart = (cart.lines().find(function (l) { return l.key === key; }) || {}).qty || 0;
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'group flex items-center justify-between gap-4 rounded-2xl bg-white text-black px-5 py-4 text-left border-2 ' + (inCart ? 'border-accent' : 'border-transparent') + ' active:scale-[0.99] transition';
      row.innerHTML = '<span class="min-w-0"><span class="block font-display text-xl uppercase leading-tight">' + H.esc(d.name) + (d.hot ? ' <span class="text-brand" title="Spicy">\u25cf</span>' : '') + '</span>' +
        '<span class="block text-sm text-gray-600">' + H.esc(p.label) + ' \u00b7 ' + H.money(p.cents) + '</span></span>' +
        '<span class="shrink-0 grid place-items-center min-w-12 h-12 px-3 rounded-full ' + (inCart ? 'bg-accent text-black' : 'bg-brand text-white') + ' font-display text-2xl">' + (inCart ? '\u00d7' + inCart : '+') + '</span>';
      row.setAttribute('aria-label', 'Add ' + d.name + ', ' + p.label + (inCart ? ', ' + inCart + ' in order' : ''));
      row.addEventListener('click', function () {
        cart.add({ key: key, name: d.name, details: [p.label + (portion === 'combo' ? ' with fried rice and an egg roll' : '')], cents: p.cents });
        draw();
      });
      list.appendChild(row);
    });
    $('[data-sides]').innerHTML = '';
    D.sides.forEach(function (s) {
      var n = (cart.lines().find(function (l) { return l.key === s.id; }) || {}).qty || 0;
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4 text-left font-semibold border-2 ' + (n ? 'border-accent' : 'border-transparent');
      b.innerHTML = '<span>' + H.esc(s.name) + '<span class="block text-sm text-white/70">' + H.money(s.cents) + '</span></span><span class="font-display text-2xl text-accent">' + (n ? '\u00d7' + n : '+') + '</span>';
      b.addEventListener('click', function () { cart.add({ key: s.id, name: s.name, details: [], cents: s.cents }); draw(); });
      $('[data-sides]').appendChild(b);
    });
  }
  cart.onChange(function () { if (list) draw(); });
})();

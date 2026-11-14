// Cookie Paradise demo: their live menu (from their own Shopify store through
// /api/shop), pickup times from their posted hours, and a real Heart of
// Columbus pickup ticket. Demo tickets: Cookie Paradise never sees them and no
// phone number is kept. Pristine and in stock only: no photo, no card.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('page-data').textContent);
  var H = window.HoC, box = document.querySelector('[data-menu]');
  var cart = H.cart(D.slug);
  var items = [];
  H.mountCart({ slug: D.slug, business: D.business, cart: cart, hours: D.hours, payNote: 'Pay Cookie Paradise at the trailer when you pick up. No app fees.' });

  var handle = function (url) { return String(url).split('/products/')[1] || ''; };
  var sized = function (src) { return src + (src.indexOf('?') === -1 ? '?' : '&') + 'width=600'; };
  var qty = function (key) { var l = cart.lines().find(function (x) { return x.key === key; }); return l ? l.qty : 0; };

  function draw() {
    box.innerHTML = items.map(function (it, i) {
      var v = it.variants[it.pick] || it.variants[0];
      var n = qty(it.id + '|' + v.id);
      var note = D.notes[handle(it.url)];
      return '<article class="flex flex-col overflow-hidden rounded-3xl border-2 border-ink bg-surface shadow-[4px_4px_0_var(--ink)]">' +
        '<img src="' + H.esc(sized(it.image)) + '" alt="' + H.esc(it.title) + '" loading="lazy" class="aspect-square w-full object-cover border-b-2 border-ink">' +
        '<div class="flex flex-1 flex-col gap-2 p-4">' +
        '<h3 class="font-display text-xl leading-tight">' + H.esc(it.title) + '</h3>' +
        '<p class="font-bold">' + H.money(Math.round(v.price * 100)) + '</p>' +
        (note ? '<p class="text-sm text-muted leading-snug">' + H.esc(note) + '</p>' : '') +
        (it.variants.length > 1 ? '<select class="hoc-input text-sm" data-pick="' + i + '" aria-label="' + H.esc(it.title) + ' size">' + it.variants.map(function (x, xi) {
          return '<option value="' + xi + '"' + (xi === it.pick ? ' selected' : '') + '>' + H.esc(x.title) + ' · ' + H.money(Math.round(x.price * 100)) + '</option>';
        }).join('') + '</select>' : '') +
        '<button type="button" data-add="' + i + '" class="mt-auto rounded-2xl border-2 border-ink font-display text-lg py-2.5 shadow-[3px_3px_0_var(--ink)] ' + (n ? 'bg-accent text-white' : 'bg-brand text-brand-ink') + '">' + (n ? 'Added ×' + n : 'Add') + '</button>' +
        '</div></article>';
    }).join('') || '<p class="col-span-full text-muted">Everything is sold out right now. Check back soon.</p>';
  }

  box.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    var it = items[Number(b.dataset.add)], v = it.variants[it.pick] || it.variants[0];
    cart.add({ key: it.id + '|' + v.id, name: it.title, details: [v.title, D.notes[handle(it.url)]].filter(Boolean), cents: Math.round(v.price * 100) });
    H.toast(it.title + ' added');
  });
  box.addEventListener('change', function (e) {
    var s = e.target.closest('[data-pick]');
    if (s) { items[Number(s.dataset.pick)].pick = Number(s.value); draw(); }
  });

  fetch('/api/shop?slug=' + encodeURIComponent(D.feed)).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.ok) throw new Error('no feed');
    items = d.items.filter(function (i) { return i.available && i.image; }).map(function (i) {
      return Object.assign({}, i, { pick: 0, variants: i.variants.filter(function (v) { return v.available; }) });
    });
    draw();
    cart.onChange(draw);
  }).catch(function () {
    box.innerHTML = '<p class="col-span-full rounded-2xl border-2 border-ink bg-surface p-4">The live menu did not load. Try again in a minute, or call <a class="underline" href="tel:+18125089675">' + H.esc(D.phone) + '</a>.</p>';
  });
})();

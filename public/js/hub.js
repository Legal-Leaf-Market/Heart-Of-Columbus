// Home page: "Spin" for a random independent, and the Keep it in Columbus estimate.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // ---------- Spin ----------
  var go = $('[data-spin-go]');
  if (go) {
    var lane = '';
    $$('[data-spin]').forEach(function (b) {
      b.addEventListener('click', function () {
        lane = b.dataset.spin;
        $$('[data-spin]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      });
    });
    go.addEventListener('click', function () {
      var wheel = $('[data-wheel]');
      var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (wheel && !reduce) { wheel.classList.remove('spinning'); void wheel.offsetWidth; wheel.classList.add('spinning'); }
      window.HoCDir().then(function (all) { return new Promise(function (res) { setTimeout(function () { res(all); }, wheel && !reduce ? 1100 : 0); }); }).then(function (all) {
        var pool = all.filter(function (b) { return !lane || b.c === lane; });
        var b = pool[Math.floor(Math.random() * pool.length)];
        var c = window.HoCCat[b.c];
        $('[data-spin-out]').innerHTML =
          '<article class="bz"><a class="bz-cover pat-ray" href="/b/' + b.s + '/" style="--c:#1b1a17;--t:' + c[2] + '"><span class="bz-emoji">' + c[1] + '</span></a>' +
          '<button type="button" class="bz-save" data-save="' + b.s + '" aria-pressed="false" aria-label="Save">' +
          '<svg viewBox="0 0 24 24" class="ic" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.6 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.7 3.1 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg></button>' +
          '<div class="bz-body"><h3 class="bz-name"><a href="/b/' + b.s + '/">' + esc(b.n) + '</a></h3><p class="bz-type">' + esc(b.y) + '</p>' +
          (b.a ? '<p class="bz-addr">' + esc(b.a) + '</p>' : '') + '</div></article>';
        if (window.HoCPaintSaved) window.HoCPaintSaved();
      });
    });
  }

  // ---------- Keep it in Columbus ----------
  if (!$('[data-in]')) return;
  var fmt0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var val = function (k) { return Number($('[data-in="' + k + '"]').value); };
  function calc() {
    var weekly = val('orders') * val('avg') * (val('rate') / 100) * val('biz');
    $('[data-out="orders"]').textContent = val('orders');
    $('[data-out="avg"]').textContent = fmt0.format(val('avg'));
    $('[data-out="rate"]').textContent = val('rate') + '%';
    $('[data-out="biz"]').textContent = val('biz');
    $('[data-year]').textContent = fmt0.format(weekly * 52);
    $('[data-week]').textContent = fmt0.format(weekly) + ' a week across ' + val('biz') + (val('biz') === 1 ? ' restaurant' : ' restaurants');
    var total = window.HoC ? window.HoC.ledger.total() : 0;
    var n = window.HoC ? window.HoC.ledger.entries().length : 0;
    $('[data-ledger]').textContent = (window.HoC ? window.HoC.money(total) : '$0.00') + ' ordered';
    $('[data-ledger-kept]').textContent = n
      ? n + (n === 1 ? ' demo order' : ' demo orders') + ': about ' + window.HoC.money(total * val('rate') / 100) + ' that would have gone to app fees at ' + val('rate') + '%.'
      : 'Place an order in any demo storefront and it shows up here.';
  }
  $$('[data-in]').forEach(function (i) { i.addEventListener('input', calc); });
  window.addEventListener('pageshow', calc);
  calc();
})();

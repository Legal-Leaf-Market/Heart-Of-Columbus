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
        $('[data-spin-out]').innerHTML = window.HoCCard(b);
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
    // What a screen reader announces as each slider moves.
    $('[data-in="orders"]').setAttribute('aria-valuetext', val('orders') + ' orders a week');
    $('[data-in="avg"]').setAttribute('aria-valuetext', fmt0.format(val('avg')));
    $('[data-in="rate"]').setAttribute('aria-valuetext', val('rate') + ' percent');
    $('[data-in="biz"]').setAttribute('aria-valuetext', val('biz') + ' restaurants');
    $('[data-year]').textContent = fmt0.format(weekly * 52);
    $('[data-week]').textContent = fmt0.format(weekly) + ' a week across ' + val('biz') + (val('biz') === 1 ? ' restaurant' : ' restaurants');
    var total = window.HoC ? window.HoC.ledger.total() : 0;
    var n = window.HoC ? window.HoC.ledger.entries().length : 0;
    $('[data-ledger]').textContent = (window.HoC ? window.HoC.money(total) : '$0.00') + ' ordered';
    $('[data-ledger-kept]').textContent = n
      ? n + (n === 1 ? ' demo order' : ' demo orders') + ': about ' + window.HoC.money(total * val('rate') / 100) + ' that would have gone to app fees at ' + val('rate') + '%.'
      : 'Place an order in any demo storefront and it shows up here.';
  }
  // A link that opens the calculator with these exact numbers, for sharing
  // ("?orders=60&avg=24&rate=6&biz=10#keep-it-local"). Values outside a
  // slider's own range are ignored, so a shared link can't show other math.
  var KEYS = ['orders', 'avg', 'rate', 'biz'];
  var q = new URLSearchParams(location.search);
  KEYS.forEach(function (k) {
    var el = $('[data-in="' + k + '"]'), v = Number(q.get(k));
    if (el && q.has(k) && v >= Number(el.min) && v <= Number(el.max)) el.value = v;
  });
  var shareBtn = $('[data-keep-share]'), shareMsg = $('[data-keep-msg]');
  if (shareBtn) shareBtn.addEventListener('click', function () {
    var u = new URL(location.href); u.hash = 'keep-it-local';
    KEYS.forEach(function (k) { u.searchParams.set(k, val(k)); });
    var text = 'Ordering direct could keep ' + $('[data-year]').textContent + ' a year in Columbus.';
    if (navigator.share) { navigator.share({ title: 'Keep it in Columbus', text: text, url: u.href }).catch(function () {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(text + ' ' + u.href) : Promise.reject()).then(function () { shareMsg.textContent = ' Link copied.'; }, function () { shareMsg.textContent = ' ' + u.href; });
  });
  $$('[data-in]').forEach(function (i) { i.addEventListener('input', calc); });
  window.addEventListener('pageshow', calc);
  calc();
})();

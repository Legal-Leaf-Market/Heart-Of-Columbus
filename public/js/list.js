// Category pages: filter the cards already on the page by text, type and area.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var bar = $('[data-refine]');
  if (!bar) return;
  window.HoCDir().then(function (all) {
    var by = {};
    all.forEach(function (b) { by[b.s] = b; });
    var cards = $$('[data-grid] .bz').map(function (el) { return { el: el, b: by[el.dataset.slug] }; });
    var st = { q: '', sub: '', area: '', open: false, online: false };
    function apply() {
      var n = 0;
      cards.forEach(function (c) {
        var ok = c.b && (!st.sub || c.b.u === st.sub) && (!st.area || c.b.r === st.area) && (!st.q || window.HoCMatch(c.b, st.q)) &&
          (!st.open || (window.HoCOpen(c.b.t) || {}).open) && (!st.online || c.b.o || c.b.k || c.b.f);
        c.el.hidden = !ok;
        if (ok) n++;
      });
      $('[data-f-count]').textContent = n + (n === 1 ? ' place' : ' places');
      $('[data-f-empty]').hidden = n > 0;
    }
    ['open', 'online'].forEach(function (k) {
      var b = $('[data-f-' + k + ']');
      if (b) b.addEventListener('click', function () { st[k] = !st[k]; b.setAttribute('aria-pressed', String(st[k])); apply(); });
    });
    $('[data-f-q]').addEventListener('input', function (e) { st.q = e.target.value.trim(); apply(); });
    ['sub', 'area'].forEach(function (k) {
      $$('[data-f-' + k + ']').forEach(function (b) {
        b.addEventListener('click', function () {
          st[k] = b.getAttribute('data-f-' + k);
          $$('[data-f-' + k + ']').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          apply();
        });
      });
    });
  });
})();

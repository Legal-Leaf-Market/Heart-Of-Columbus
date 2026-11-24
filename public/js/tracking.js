// The private tracking report (/owners/report/#k=<HOC_ADMIN_KEY>). The key
// comes in the link's #fragment, moves to this tab's session storage, is
// wiped from the address bar and travels only as the x-hoc-key header.
(function () {
  'use strict';
  var root = document.querySelector('[data-track-report]');
  if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return '$' + Number(n || 0).toFixed(2); };
  function adminKey() {
    var h = new URLSearchParams(location.hash.slice(1)).get('k'), k = h || '';
    try { if (k) sessionStorage.setItem('hoc-admin', k); else k = sessionStorage.getItem('hoc-admin') || ''; } catch (e) { /* storage off */ }
    if (h) history.replaceState(null, '', location.pathname);
    return k;
  }
  var key = adminKey();
  var month = $('[data-track-month]');
  month.value = new Date().toISOString().slice(0, 7);
  function load() {
    var q = '?month=' + encodeURIComponent(month.value) + ($('[data-track-slug]').value ? '&key=' + encodeURIComponent($('[data-track-slug]').value.trim()) : '');
    $('[data-track-status]').textContent = 'Loading…';
    fetch('/api/handoff' + q, { cache: 'no-store', headers: { 'x-hoc-key': key } }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { $('[data-track-status]').textContent = j.error || 'Could not load.'; return; }
      var lk = $('[data-track-lookup]');
      lk.hidden = !j.lookup;
      if (j.lookup) lk.innerHTML = 'Shop ID <code>' + esc(j.lookup.slug) + '</code> · key <code>' + esc(j.lookup.key) + '</code>' + (j.lookup.connect ? '<br>WooCommerce one-click link to send them: <code>' + esc(j.lookup.connect) + '</code>' : '');
      $('[data-track-status]').textContent = j.rows.length + ' business' + (j.rows.length === 1 ? '' : 'es') + ' in ' + j.month + '.';
      var visits = function (h) { return ['order', 'book', 'shop', 'website', 'gift', 'product'].reduce(function (a, k) { return a + (h[k] || 0); }, 0); };
      $('[data-track-out]').innerHTML = j.rows.length ? '<div class="tk-table-wrap"><table class="tk-table"><thead><tr><th>Business</th><th>Visits sent</th><th>Carts sent</th><th>Cart value</th><th>Orders placed</th><th>Matched to our cart</th><th>Fulfilled</th><th>Order value</th><th>Key</th></tr></thead><tbody>' +
        j.rows.map(function (r) {
          return '<tr><td><a href="/b/' + esc(r.slug) + '/">' + esc(r.slug) + '</a></td><td>' + visits(r.handoffs) + '</td><td>' + (r.handoffs.cart || 0) + '</td><td>' + money(r.handoffs.cartValue) + '</td><td>' + r.orders + '</td><td>' + (r.matched || 0) + '</td><td>' + (r.fulfilled || 0) + '</td><td>' + money(r.orderValue) + '</td><td><code>' + esc(r.key) + '</code></td></tr>';
        }).join('') + '</tbody></table></div>' : '<p class="muted">Nothing counted yet this month.</p>';
      $('[data-track-out]').innerHTML += (j.woo && j.woo.length ? '<h2>Connected WooCommerce stores</h2><ul>' + j.woo.map(function (w) { return '<li><b>' + esc(w.slug) + '</b>: connected ' + esc(String(w.connected).slice(0, 10)) + (w.lastSync ? ', last read ' + esc(String(w.lastSync).slice(0, 16).replace('T', ' ')) + (w.lastResult ? ' (' + (w.lastResult.ok ? w.lastResult.read + ' orders read, ' + w.lastResult.kept + ' ours' : esc(w.lastResult.error || 'failed')) + ')' : '') : ', not read yet') + '</li>'; }).join('') + '</ul><p><button type="button" class="btn btn-sm" data-track-sync>Read their orders now</button></p>' : '');
    }).catch(function () { $('[data-track-status]').textContent = 'Could not load.'; });
  }
  $('[data-track-form]').addEventListener('submit', function (e) { e.preventDefault(); load(); });
  root.addEventListener('click', function (e) {
    var b = e.target.closest('[data-track-sync]');
    if (!b) return;
    b.disabled = true; b.textContent = 'Reading…';
    fetch('/api/woo-connect?sync=1', { cache: 'no-store', headers: { 'x-hoc-key': key } }).then(function () { load(); }).catch(function () { b.disabled = false; b.textContent = 'Try again'; });
  });
  load();
})();

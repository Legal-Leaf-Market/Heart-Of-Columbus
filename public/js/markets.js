// Markets: fills the board from /api/markets. Quotes are delayed; the
// attribution line under the table is static and always shows.
(function () {
  'use strict';
  var board = document.querySelector('.mk');
  if (!board) return;
  var status = document.querySelector('[data-mk-status]');
  var money = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var when = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  function none(msg) {
    board.querySelectorAll('[data-price]').forEach(function (td) { td.textContent = 'n/a'; });
    status.textContent = msg;
  }
  fetch('/api/markets').then(function (r) { return r.json(); }).then(function (j) {
    if (!j.ok) return none(j.error || 'Quotes are not available right now.');
    var latest = 0;
    j.quotes.forEach(function (q) {
      var tr = board.querySelector('[data-sym="' + q.symbol + '"]');
      if (!tr) return;
      var p = tr.querySelector('[data-price]'), c = tr.querySelector('[data-change]');
      if (q.price == null) { p.textContent = 'n/a'; return; }
      p.textContent = '$' + money.format(q.price);
      if (q.change != null) {
        var up = q.change > 0, down = q.change < 0;
        c.textContent = (up ? '▲ ' : down ? '▼ ' : '') + money.format(Math.abs(q.change)) + (q.pct != null ? ' (' + money.format(Math.abs(q.pct)) + '%)' : '');
        c.className = 'mk-num ' + (up ? 'mk-up' : down ? 'mk-down' : '');
        c.setAttribute('aria-label', (up ? 'up ' : down ? 'down ' : 'unchanged ') + c.textContent);
      }
      if (q.at && Date.parse(q.at) > latest) latest = Date.parse(q.at);
    });
    status.textContent = (latest ? 'As of ' + when.format(new Date(latest)) + ', Columbus time' : 'Delayed quotes') + (j.stale ? '. The source is not answering, so these are the last ones we have.' : '.');
  }).catch(function () { none('Quotes are not available right now.'); });
})();

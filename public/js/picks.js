// An owner's own picks (/api/picks), shown only when real picks arrive. The
// section ships hidden and empty; a failed or empty answer leaves it that way,
// so there is never a placeholder row (owner picks come only from owners).
(function () {
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  Array.prototype.forEach.call(document.querySelectorAll('[data-picks]'), function (sec) {
    var grid = sec.querySelector('.prod-grid');
    if (!grid || !window.fetch) return;
    fetch('/api/picks?s=' + encodeURIComponent(sec.getAttribute('data-picks')))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.items || !d.items.length) return;
        grid.innerHTML = d.items.map(function (it) {
          return '<article class="prod pick"><a class="pick-img" href="' + esc(it.url) + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">' +
            '<img src="' + esc(it.image) + '" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="var s=this.closest(\'[data-picks]\');this.closest(\'.pick\').remove();if(s&&!s.querySelector(\'.pick\'))s.hidden=true"></a>' +
            '<div class="prod-b"><a class="prod-t" href="' + esc(it.url) + '" target="_blank" rel="noopener">' + esc(it.name) + ' ↗</a></div></article>';
        }).join('');
        sec.hidden = false;
      })
      .catch(function () { /* stays hidden */ });
  });
})();

// /help/: filter the resources as you type, and share the page from a phone.
(function () {
  var find = document.querySelector('[data-help-find] input');
  var items = [].slice.call(document.querySelectorAll('[data-help-item]'));
  var groups = [].slice.call(document.querySelectorAll('[data-help-group]'));
  var none = document.querySelector('[data-help-none]');
  var count = document.querySelector('[data-help-count]');
  if (find) find.addEventListener('input', function () {
    var words = find.value.toLowerCase().split(/\s+/).filter(Boolean);
    var shown = 0;
    items.forEach(function (el) {
      var hay = el.getAttribute('data-words');
      var hit = words.every(function (w) { return hay.indexOf(w) !== -1; });
      el.hidden = !hit;
      if (hit) shown++;
    });
    groups.forEach(function (g) { g.hidden = !g.querySelector('[data-help-item]:not([hidden])'); });
    if (none) none.hidden = shown > 0;
    if (count) count.textContent = words.length ? shown + ' of ' + items.length : '';
  });

  // Today's hot meals first.
  var today = document.querySelector('.hp-day[data-day="' + new Date().getDay() + '"]');
  if (today) today.classList.add('is-today');

  var share = document.querySelector('[data-help-share]');
  if (share && navigator.share) {
    share.hidden = false;
    share.addEventListener('click', function () {
      navigator.share({ title: 'Get help in Columbus', url: location.origin + '/help/' }).catch(function () {});
    });
  }
})();

// Reader forms (/ask/, /letters/, /tips/) and the editor's private inbox.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var THANKS = { ask: 'Thanks for asking. A reporter will read your question.', letter: 'Thanks for writing. The editor reads every letter and will contact you before yours runs.', tip: 'Thanks. A reporter will read your tip.' };

  $$('[data-newsroom]').forEach(function (form) {
    var kind = form.getAttribute('data-newsroom');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('[data-err]', form), btn = $('button.btn', form);
      var data = { kind: kind };
      $$('input, textarea', form).forEach(function (el) { if (el.name) data[el.name] = el.value; });
      err.hidden = true;
      btn.disabled = true;
      fetch('/api/newsroom', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'Something went wrong.');
          form.outerHTML = '<div class="pk-done"><p>' + esc(THANKS[kind]) + '</p></div>';
        })
        .catch(function (x) { err.textContent = x.message || 'Could not send. Please try again.'; err.hidden = false; btn.disabled = false; });
    });
  });

  var inbox = $('[data-newsroom-inbox]');
  if (!inbox) return;
  var status = $('[data-inbox-status]'), out = $('[data-inbox-out]');
  var k = new URLSearchParams(location.search).get('k') || '';
  var SHOW = { ask: ['question', 'name', 'email', 'neighborhood'], letter: ['body', 'about', 'name', 'town', 'email', 'phone'], tip: ['tip', 'contact'] };
  function load(kind) {
    $$('[data-kind]', inbox).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-kind') === kind ? 'true' : 'false'); });
    status.textContent = 'Loading…';
    out.innerHTML = '';
    fetch('/api/newsroom?kind=' + kind + '&k=' + encodeURIComponent(k), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { status.textContent = j.error || 'Could not load.'; return; }
      status.textContent = j.items.length + (j.items.length === 1 ? ' item' : ' items');
      out.innerHTML = j.items.map(function (x) {
        return '<article class="np-box np-inbox-item"><p class="muted">' + esc(new Date(x.createdAt).toLocaleString()) + '</p>' +
          SHOW[kind].filter(function (f) { return x[f]; }).map(function (f) { return '<p><strong>' + esc(f) + ':</strong> ' + esc(x[f]) + '</p>'; }).join('') + '</article>';
      }).join('');
    }).catch(function () { status.textContent = 'Could not load.'; });
  }
  inbox.addEventListener('click', function (e) { var b = e.target.closest('[data-kind]'); if (b) load(b.getAttribute('data-kind')); });
  load('ask');
})();

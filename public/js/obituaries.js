// Obituaries: the family form with a live print preview, and the private
// review page. The preview only arranges what the family typed.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function longDate(d) { if (!d) return ''; var p = d.split('-').map(Number); return MONTHS[p[1] - 1] + ' ' + p[2] + ', ' + p[0]; }
  function paras(s) { return String(s || '').split(/\n\s*\n/).filter(function (x) { return x.trim(); }).map(function (x) { return '<p>' + esc(x).replace(/\n/g, '<br>') + '</p>'; }).join(''); }
  // Same layout as noticeHtml in src/pages/paper-pages.mjs.
  function notice(n) {
    var life = [n.born && longDate(n.born), longDate(n.died)].filter(Boolean).join(' to ');
    return '<article class="ob-notice"><h3>' + esc(n.name || 'Full name') + (n.known ? ' <span class="ob-known">(' + esc(n.known) + ')</span>' : '') + '</h3>' +
      '<p class="ob-life">' + esc(life) + (n.town ? ' · ' + esc(n.town) : '') + '</p>' +
      '<div class="ob-text">' + paras(n.text) + '</div>' +
      (n.services ? '<h4>Services</h4><div class="ob-text">' + paras(n.services) + '</div>' : '') +
      (n.memorials ? '<h4>Memorials</h4><div class="ob-text">' + paras(n.memorials) + '</div>' : '') +
      (n.home ? '<p class="ob-home">Arrangements: ' + esc(n.home) + '</p>' : '') + '</article>';
  }
  // Plain text for pasting into a print layout program.
  function plain(n) {
    var life = [n.born && longDate(n.born), longDate(n.died)].filter(Boolean).join(' to ');
    return [n.name + (n.known ? ' (' + n.known + ')' : ''), life + (n.town ? ', ' + n.town : ''), '', n.text,
      n.services ? '\nServices\n' + n.services : '', n.memorials ? '\nMemorials\n' + n.memorials : '', n.home ? '\nArrangements: ' + n.home : ''].join('\n').trim();
  }
  document.querySelectorAll('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  // ---------- Family form ----------
  var form = $('[data-obit]');
  if (form) {
    var preview = $('[data-preview]'), other = $('[data-home-other]');
    function read() {
      var f = form.elements;
      return {
        name: f.name.value.trim(), known: f.known.value.trim(), town: f.town.value.trim(), born: f.born.value, died: f.died.value,
        text: f.text.value.trim(), services: f.services.value.trim(), memorials: f.memorials.value.trim(),
        home: f.home.value === 'other' ? f.homeOther.value.trim() : f.home.value, homeOther: f.homeOther.value,
        fromName: f.fromName.value, relation: f.relation.value, phone: f.phone.value, email: f.email.value,
        consent: f.consent.checked, website: f.website.value,
      };
    }
    form.addEventListener('input', function () {
      other.hidden = form.elements.home.value !== 'other';
      var n = read();
      if (n.name || n.text) preview.innerHTML = notice(n);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('[data-err]', form), btn = $('button.btn', form), n = read();
      if (form.elements.home.value !== 'other') n.homeOther = '';
      err.hidden = true;
      btn.disabled = true;
      fetch('/api/obituary', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(n) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'Something went wrong.');
          form.outerHTML = '<div class="pk-card"><p class="pk-done">Thank you, ' + esc(n.fromName.split(' ')[0]) + '. We have it, and a person will reach out to confirm before anything about ' + esc(n.name) + ' is published.</p></div>';
        })
        .catch(function (x) { err.textContent = x.message || 'Could not send. Please try again.'; err.hidden = false; btn.disabled = false; });
    });
  }

  // The private key arrives in the link's #fragment, which browsers never send
  // to a server. An older ?k= link still works once. Either way it is moved to
  // this tab's session storage and wiped from the address bar, then sent as a
  // header, so it never lands in a log, a referrer or the history.
  function adminKey() {
    var h = new URLSearchParams(location.hash.slice(1)).get('k'), q = new URLSearchParams(location.search).get('k');
    var k = h || q || '';
    try { if (k) sessionStorage.setItem('hoc-admin', k); else k = sessionStorage.getItem('hoc-admin') || ''; } catch (e) { /* storage off */ }
    if (h || q) history.replaceState(null, '', location.pathname);
    return k;
  }

  // ---------- Review page ----------
  var review = $('[data-obit-review]');
  if (review) {
    var status = $('[data-review-status]'), out = $('[data-review-out]');
    fetch('/api/obituary', { cache: 'no-store', headers: { 'x-hoc-key': adminKey() } }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { status.textContent = j.error || 'Could not load.'; return; }
      status.textContent = j.items.length + (j.items.length === 1 ? ' submission' : ' submissions');
      out.innerHTML = j.items.map(function (n, i) {
        var f = n.from || {};
        return '<div class="ob-item">' + notice(n) +
          '<div class="ob-meta"><p><b>From ' + esc(f.name) + '</b>' + (f.relation ? ', ' + esc(f.relation) : '') + ' · ' +
          (f.phone ? '<a href="tel:' + esc(f.phone.replace(/[^0-9+]/g, '')) + '">' + esc(f.phone) + '</a> ' : '') + (f.email ? '<a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a>' : '') + '</p>' +
          '<p class="muted">Received ' + esc(new Date(n.createdAt).toLocaleString()) + ' · ' + esc(n.status) + (n.consent ? ' · family consent checked' : '') + '</p>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-copy="' + i + '">Copy as plain text</button></div></div>';
      }).join('');
      out.addEventListener('click', function (e) {
        var b = e.target.closest('[data-copy]');
        if (!b) return;
        navigator.clipboard.writeText(plain(j.items[Number(b.dataset.copy)])).then(function () { b.textContent = 'Copied'; });
      });
    }).catch(function () { status.textContent = 'Could not load.'; });
  }
})();

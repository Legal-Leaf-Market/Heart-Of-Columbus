// Owners: the claim form (business picker + submit) and the private inbox.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var WANT = { fix: 'Fix listing', link: 'Link ordering', pickup: 'Pickup orders', storefront: 'Storefront', remove: 'REMOVE' };

  // ---------- Claim form ----------
  var form = $('[data-claim]');
  if (form) {
    var pick = $('[data-pick]', form);
    var all = [];
    function choose(b) {
      form.business.value = b.n;
      form.slug.value = b.s;
      pick.innerHTML = '<span class="ow-chosen">' + esc(b.n) + (b.a ? ' · ' + esc(b.a) : '') + '</span>';
    }
    if (window.HoCDir) window.HoCDir().then(function (d) {
      all = d;
      var pre = new URLSearchParams(location.search).get('b');
      var hit = pre && all.find(function (b) { return b.s === pre; });
      if (hit) choose(hit);
    });
    form.business.addEventListener('input', function () {
      form.slug.value = '';
      var q = form.business.value.trim().toLowerCase();
      if (q.length < 2) { pick.innerHTML = ''; return; }
      var hits = all.filter(function (b) { return b.n.toLowerCase().indexOf(q) !== -1; }).slice(0, 6);
      pick.innerHTML = hits.map(function (b, i) { return '<button type="button" class="ow-opt" data-i="' + i + '">' + esc(b.n) + (b.a ? '<small>' + esc(b.a) + '</small>' : '') + '</button>'; }).join('') +
        (hits.length ? '' : '<small class="muted">Not listed yet? That is fine, send it anyway.</small>');
      pick.onclick = function (e) { var o = e.target.closest('[data-i]'); if (o) choose(hits[Number(o.dataset.i)]); };
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = $('[data-err]', form), btn = $('button.btn', form);
      var data = {
        slug: form.slug.value, business: form.business.value, name: form.name.value, role: form.role.value,
        phone: form.phone.value, email: form.email.value, message: form.message.value, website: form.website.value,
        wants: Array.prototype.slice.call(form.querySelectorAll('[name=wants]:checked')).map(function (c) { return c.value; }),
      };
      err.hidden = true;
      btn.disabled = true;
      fetch('/api/claim', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j.ok) throw new Error(j.error || 'Something went wrong.');
          form.outerHTML = '<div class="pk-done"><p>Thanks, ' + esc(data.name.split(' ')[0]) + '. We got it and will reach out soon about ' + esc(data.business) + '.</p></div>';
        })
        .catch(function (x) { err.textContent = x.message || 'Could not send. Please try again.'; err.hidden = false; btn.disabled = false; });
    });
  }

  // ---------- Inbox ----------
  var inbox = $('[data-inbox]');
  if (inbox) {
    var status = $('[data-inbox-status]'), out = $('[data-inbox-out]');
    var k = new URLSearchParams(location.search).get('k') || '';
    fetch('/api/claim?k=' + encodeURIComponent(k), { cache: 'no-store' }).then(function (r) { return r.json(); }).then(function (j) {
      if (!j.ok) { status.textContent = j.error || 'Could not load.'; return; }
      status.textContent = j.leads.length + (j.leads.length === 1 ? ' lead' : ' leads');
      out.innerHTML = j.leads.map(function (l) {
        return '<div class="pk-card"><h2>' + (l.slug ? '<a href="/b/' + esc(l.slug) + '/">' + esc(l.business) + '</a>' : esc(l.business) + ' <small class="muted">(not listed)</small>') + '</h2>' +
          '<p><b>' + esc(l.name) + '</b>' + (l.role ? ', ' + esc(l.role) : '') + ' · ' + (l.phone ? '<a href="tel:' + esc(l.phone.replace(/[^0-9+]/g, '')) + '">' + esc(l.phone) + '</a> ' : '') + (l.email ? '<a href="mailto:' + esc(l.email) + '">' + esc(l.email) + '</a>' : '') + '</p>' +
          '<p>' + l.wants.map(function (w) { return '<span class="tag">' + esc(WANT[w] || w) + '</span>'; }).join(' ') + '</p>' +
          (l.message ? '<p class="pk-notes">' + esc(l.message) + '</p>' : '') + '<p class="muted">' + esc(new Date(l.createdAt).toLocaleString()) + '</p></div>';
      }).join('');
    }).catch(function () { status.textContent = 'Could not load.'; });
  }
})();

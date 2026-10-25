// Pickup tickets: shopper ticket, counter view, partner board.
// Everything comes from /api/pickup; the ticket token in the URL is the key.
(function () {
  'use strict';
  var root = document.querySelector('[data-pickup]');
  if (!root) return;
  var mode = root.getAttribute('data-pickup');
  var out = root.querySelector('[data-pk-out]');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (c) { return '$' + (Math.round(c || 0) / 100).toFixed(2); };
  var q = new URLSearchParams(location.search);
  var token = q.get('t') || '';
  var STEPS = [['sent', 'Sent'], ['ready', 'Ready'], ['collected', 'Picked up']];

  function api(method, body, qs) {
    return fetch('/api/pickup' + (qs ? '?' + qs : ''), method === 'GET' ? { cache: 'no-store' } : {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
    }).then(function (r) { return r.json().then(function (j) { j.status = r.status; return j; }); });
  }

  function items(t) {
    return '<ul class="pk-items">' + t.items.map(function (i) {
      return '<li><span class="pk-q">' + i.qty + '×</span><div><b>' + esc(i.name) + '</b>' + (i.details ? '<small>' + esc(i.details) + '</small>' : '') + '</div><span>' + money(i.cents * i.qty) + '</span></li>';
    }).join('') + '</ul><p class="pk-total">List total <b>' + money(t.listCents) + '</b> <small>before tax. The shop rings up the real total when you collect.</small></p>';
  }
  function steps(t) {
    var at = STEPS.findIndex(function (s) { return s[0] === t.status; });
    return '<ol class="pk-steps">' + STEPS.map(function (s, i) { return '<li class="' + (i <= at ? 'on' : '') + '">' + s[1] + '</li>'; }).join('') + '</ol>';
  }
  function demoNote(t, who) {
    return t.demo ? '<p class="pk-demo"><b>Demo ticket.</b> ' + esc(t.business) + ' never saw this; it is a Heart of Columbus concept demo. ' +
      (who === 'shopper' ? 'Open the <a href="/pickup/counter/?t=' + esc(t.token) + '">counter view</a> to play the shop’s side.' : 'This is what their counter would see.') + '</p>' : '';
  }
  function fail(msg) { out.innerHTML = '<div class="pk-card"><h1 class="pk-h">Hmm.</h1><p>' + esc(msg) + '</p><a class="btn" href="/order/">Order, book and shop direct</a></div>'; }

  // ---------- Shopper ticket ----------
  function renderTicket(t) {
    out.innerHTML = '<div class="pk-card">' + demoNote(t, 'shopper') +
      '<h1 class="pk-h">' + (t.status === 'collected' ? 'Picked up. Thank you!' : t.status === 'ready' ? 'Your order is ready' : t.demo ? 'Demo order for ' + esc(t.business) : 'Order sent to ' + esc(t.business)) + '</h1>' +
      steps(t) +
      '<div class="pk-code" aria-label="Pickup code"><small>Show this at the counter</small><b>' + esc(t.code) + '</b><span>' + esc(t.name) + (t.when ? ' · ' + esc(t.when) : '') + '</span><div class="pk-qr" data-qr></div></div>' +
      items(t) + (t.notes ? '<p class="pk-notes"><b>Notes:</b> ' + esc(t.notes) + '</p>' : '') +
      '<p class="muted">Pay ' + esc(t.business) + ' directly when you pick up. Heart of Columbus never takes payment and adds no fee.</p></div>';
    drawQr(t);
  }

  // The counter can scan this to open the ticket on their own phone or tablet.
  function drawQr(t) {
    var box = out.querySelector('[data-qr]');
    if (!box || t.status === 'collected') return;
    var url = location.origin + '/pickup/counter/?t=' + t.token;
    var go = function () {
      try {
        var q = window.qrcode(0, 'M'); q.addData(url); q.make();
        box.innerHTML = '<img alt="QR code for the counter" src="' + q.createDataURL(5, 2) + '"><small>The counter can scan this</small>';
      } catch (e) { box.remove(); }
    };
    if (window.qrcode) return go();
    var s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js';
    s.onload = go; s.onerror = function () { box.remove(); };
    document.head.appendChild(s);
  }

  // ---------- Counter view (one ticket) ----------
  function renderCounter(t) {
    out.innerHTML = '<div class="pk-card">' + demoNote(t, 'counter') +
      '<h1 class="pk-h">' + esc(t.code) + ' · ' + esc(t.name) + '</h1>' + steps(t) +
      '<p>' + (t.when ? 'Pickup <b>' + esc(t.when) + '</b>. ' : '') + (t.phone ? 'Phone <a href="tel:' + esc(t.phone.replace(/\D/g, '')) + '">' + esc(t.phone) + '</a>' : '') + '</p>' +
      items(t) + (t.notes ? '<p class="pk-notes"><b>Notes:</b> ' + esc(t.notes) + '</p>' : '') +
      (t.status === 'sent' ? '<button type="button" class="btn" data-ready>Mark ready for pickup</button>' : '') +
      (t.status !== 'collected'
        ? '<form class="pk-redeem" data-redeem><label>Total actually rung up<input name="total" inputmode="decimal" placeholder="' + (t.listCents / 100).toFixed(2) + '" required></label><button class="btn">Picked up</button><p class="muted">Type what the customer really paid; things get added at the counter or run out.</p></form>'
        : '<p class="pk-done">Picked up ' + esc(new Date(t.redeemedAt).toLocaleString()) + ' for ' + money(t.finalCents) + '.</p>') +
      '</div>';
    var r = out.querySelector('[data-ready]');
    if (r) r.addEventListener('click', function () { r.disabled = true; api('POST', { action: 'ready', t: token }).then(function (j) { if (j.ok) renderCounter(j.ticket); }); });
    var f = out.querySelector('[data-redeem]');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = Number(String(f.total.value || (t.listCents / 100)).replace(/[^0-9.]/g, ''));
      api('POST', { action: 'redeem', t: token, totalCents: Math.round(v * 100) }).then(function (j) { if (j.ticket) renderCounter(j.ticket); if (!j.ok) alert(j.error); });
    });
  }

  if (mode === 'ticket' || mode === 'counter') {
    if (!/^[a-f0-9]{32}$/.test(token)) return fail('That is not a pickup link. Check the address, or ask for the code again.');
    var draw = mode === 'ticket' ? renderTicket : renderCounter;
    var load = function () { return api('GET', null, 't=' + token).then(function (j) { if (!j.ok) return fail(j.error || 'No pickup with that code.'); draw(j.ticket); return j.ticket; }).catch(function () { fail('Could not reach Heart of Columbus. Try again in a moment.'); }); };
    load().then(function (t) {
      // The shopper's ticket follows the order until it is collected.
      if (mode === 'ticket' && t && t.status !== 'collected') {
        var iv = setInterval(function () { if (!document.hidden) load().then(function (x) { if (x && x.status === 'collected') clearInterval(iv); }); }, 20000);
      }
    });
    return;
  }

  // ---------- Partner board ----------
  var slug = q.get('s') || '', key = q.get('k') || '';
  var status = root.querySelector('[data-pk-status]');
  var seen = null, chime = false, actx = null;
  root.querySelector('[data-pk-sound]').addEventListener('click', function (e) {
    chime = true; actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    e.target.textContent = 'Chime on'; e.target.disabled = true;
  });
  function ding() {
    if (!chime || !actx) return;
    [0, 0.18].forEach(function (d, i) {
      var o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = i ? 1046 : 784; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.2, actx.currentTime + d); g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + d + 0.4);
      o.start(actx.currentTime + d); o.stop(actx.currentTime + d + 0.45);
    });
  }
  function poll() {
    api('GET', null, 'board=' + encodeURIComponent(slug) + '&k=' + encodeURIComponent(key)).then(function (j) {
      if (!j.ok) { status.textContent = j.error || 'Board unavailable.'; return; }
      root.querySelector('[data-pk-title]').textContent = 'Pickups for ' + j.business;
      status.textContent = 'Live. Updated ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.';
      var open = j.tickets.filter(function (t) { return t.status !== 'collected'; });
      var ids = open.map(function (t) { return t.token; });
      if (seen && ids.some(function (id) { return seen.indexOf(id) === -1; })) ding();
      seen = ids;
      out.innerHTML = (open.length ? '' : '<p class="muted">No open pickups.</p>') + open.map(function (t) {
        return '<a class="pk-tile pk-' + t.status + '" href="/pickup/counter/?t=' + t.token + '"><b>' + esc(t.code) + '</b><span>' + esc(t.name) + '</span><small>' + esc(t.when || '') + '</small><small>' + t.items.reduce(function (n, i) { return n + i.qty; }, 0) + ' items · ' + money(t.listCents) + '</small><em>' + (t.status === 'ready' ? 'Ready' : 'New') + '</em></a>';
      }).join('');
    }).catch(function () { status.textContent = 'Offline. Retrying…'; });
  }
  if (!slug || !key) { status.textContent = 'This board needs its private link.'; return; }
  poll();
  setInterval(poll, 15000);
})();

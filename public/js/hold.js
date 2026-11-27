// /newsroom/hold/: holds one scheduled edition. The link is
// /newsroom/hold/#t=<code>&d=<date>&e=<morning|evening>. The code moves to
// this tab's session storage and is sent as the x-hoc-key header; it never
// rides in a query string. Only the button holds (a POST), never the link.
(function () {
  'use strict';
  var root = document.querySelector('[data-hold-page]');
  if (!root) return;
  var status = root.querySelector('[data-hold-status]');
  var go = root.querySelector('[data-hold-go]');
  var q = new URLSearchParams(location.hash.slice(1));
  var saved = {};
  try { saved = JSON.parse(sessionStorage.getItem('hoc-hold') || '{}'); } catch (e) { saved = {}; }
  var t = q.get('t') || saved.t || '', d = q.get('d') || saved.d || '', ed = q.get('e') === 'evening' || (!q.get('e') && saved.e === 'evening') ? 'evening' : 'morning';
  try { sessionStorage.setItem('hoc-hold', JSON.stringify({ t: t, d: d, e: ed })); } catch (e) { /* storage off */ }
  if (location.hash) history.replaceState(null, '', location.pathname);
  var say = function (s) { status.textContent = s; };
  if (!t || !/^\d{4}-\d{2}-\d{2}$/.test(d)) { say('Open this page from the Hold link in the edition\'s note.'); return; }
  var label = (ed === 'evening' ? 'The evening edition' : 'The morning edition') + ' for ' + d;
  function call(method) {
    return fetch('/api/hold' + (method === 'GET' ? '?date=' + d + '&edition=' + ed : ''), {
      method: method, cache: 'no-store', headers: { 'x-hoc-key': t, 'content-type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({ date: d, edition: ed }) : undefined,
    }).then(function (r) { return r.json(); });
  }
  function show(j) {
    if (!j.ok) { say(j.error || 'Something went wrong.'); go.hidden = true; return; }
    if (j.held) { say(label + (j.subject ? ' ("' + j.subject + '")' : '') + ' is held. It is a draft in Resend and will not go out.'); go.hidden = true; return; }
    if (j.scheduled) { say(label + (j.subject ? ' ("' + j.subject + '")' : '') + ' goes out at ' + new Date(j.scheduled).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: 'America/Indiana/Indianapolis' }) + ' Columbus time' + '.'); go.hidden = false; return; }
    say(label + ' is not scheduled, so there is nothing to hold.'); go.hidden = true;
  }
  call('GET').then(show).catch(function () { say('You seem to be offline. Try again in a minute.'); });
  go.addEventListener('click', function () {
    go.disabled = true; say('Holding…');
    call('POST').then(show).catch(function () { say('You seem to be offline. Try again in a minute.'); }).then(function () { go.disabled = false; });
  });
})();

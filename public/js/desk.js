// The writing desk (/newsroom/desk/). Talks only to /api/desk. The private
// key arrives as #k= in the link, moves to this tab's session storage, is
// wiped from the address bar and is sent as the x-hoc-key header (the same
// rule as the owner inbox), so it never lands in a log or the history.
(function () {
  'use strict';
  var root = document.querySelector('[data-desk]');
  if (!root) return;
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  function adminKey() {
    var h = new URLSearchParams(location.hash.slice(1)).get('k');
    var k = h || '';
    try { if (k) sessionStorage.setItem('hoc-admin', k); else k = sessionStorage.getItem('hoc-admin') || ''; } catch (e) { /* storage off */ }
    if (h) history.replaceState(null, '', location.pathname);
    return k;
  }
  var KEY = adminKey();
  var state = { date: '', day: null, voice: null, ideas: [], current: null, ai: false, out: '' };
  var status = $('[data-desk-status]');
  var say = function (t) { status.textContent = t; };

  function api(method, body, query) {
    return fetch('/api/desk' + (query || ''), {
      method: method, cache: 'no-store',
      headers: { 'x-hoc-key': KEY, 'content-type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) { return r.json(); }).then(function (j) { if (!j.ok) throw new Error(j.error || 'Something went wrong.'); return j; });
  }

  // ---------- Tabs ----------
  $$('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-tab');
      $$('[data-tab]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('[data-pane]').forEach(function (p) { p.hidden = p.getAttribute('data-pane') !== t; });
      if (t === 'preview') preview();
    });
  });

  // ---------- Loading a morning ----------
  function load(date) {
    say('Loading…');
    return api('GET', null, date ? '?date=' + date : '').then(function (j) {
      state.date = j.date; state.day = j.day; state.voice = j.voice; state.ideas = j.ideas; state.ai = j.ai;
      $('[data-date]').value = j.date;
      $('[data-plan=subject]').value = j.day.plan.subject || '';
      $('[data-plan=intro]').value = j.day.plan.intro || '';
      $('[data-plan=skip]').checked = !!j.day.plan.skip;
      $('[data-drafted]').textContent = j.drafted ? 'Draft made ' + new Date(j.drafted.at).toLocaleString() + (j.drafted.from ? ' (' + (j.drafted.from === 'desk' ? 'from the desk' : 'automatic') + ')' : '') + '. Open your newsletter service to read it and press send.' : 'No draft yet for this morning.';
      renderPieces(); renderIdeas(); renderVoice();
      openPiece(null);
      say((j.date === j.today ? 'This morning, ' : '') + j.date + (j.ai ? '. Writing help is on (' + j.model + ').' : '. Writing help is off until ANTHROPIC_API_KEY is set in Netlify.'));
    }).catch(function (e) { say(e.message); });
  }
  $('[data-date]').addEventListener('change', function (e) { load(e.target.value); });

  // ---------- The edition plan ----------
  function plan() {
    return { subject: $('[data-plan=subject]').value, intro: $('[data-plan=intro]').value, skip: $('[data-plan=skip]').checked, order: state.day.plan.order };
  }
  function savePlan(order) {
    var p = plan(); if (order) p.order = order;
    return api('POST', { action: 'plan', date: state.date, plan: p }).then(function (j) { state.day = j.day; renderPieces(); say('Plan saved.'); }).catch(function (e) { say(e.message); });
  }
  $('[data-save-plan]').addEventListener('click', function () { savePlan(); });

  function renderPieces() {
    var byId = {}; state.day.pieces.forEach(function (p) { byId[p.id] = p; });
    var list = state.day.plan.order.map(function (id) { return byId[id]; }).filter(Boolean);
    $('[data-pieces]').innerHTML = list.length ? list.map(function (p, i) {
      return '<li><button type="button" class="dk-open" data-open="' + p.id + '">' + esc(p.headline || '(no headline yet)') + '</button><span class="dk-chip" data-s="' + p.status + '">' + p.status + '</span>' +
        '<button type="button" class="pill" data-move="' + i + ':-1" aria-label="Move up">↑</button><button type="button" class="pill" data-move="' + i + ':1" aria-label="Move down">↓</button></li>';
    }).join('') : '<li class="muted">No pieces yet. Start one, or pull one from the idea bank.</li>';
    var ready = list.filter(function (p) { return p.status === 'approved'; }).length;
    $('[data-ready]').textContent = ready + ' approved of ' + list.length + '. Only approved pieces go in the edition, in this order.';
  }
  $('[data-pieces]').addEventListener('click', function (e) {
    var o = e.target.closest('[data-open]'), m = e.target.closest('[data-move]');
    if (o) openPiece(o.getAttribute('data-open'));
    if (m) {
      var parts = m.getAttribute('data-move').split(':'), i = +parts[0], d = +parts[1], order = state.day.plan.order.slice();
      var byId = {}; state.day.pieces.forEach(function (p) { byId[p.id] = p; });
      order = order.filter(function (id) { return byId[id]; });
      var j = i + d; if (j < 0 || j >= order.length) return;
      var t = order[i]; order[i] = order[j]; order[j] = t;
      savePlan(order);
    }
  });

  // ---------- The editor ----------
  var editor = $('[data-editor]');
  function blank() { return { id: '', status: 'idea', shape: 'brief', headline: '', dek: '', angle: '', body: '', sources: [] }; }
  function openPiece(id, seed) {
    var p = id ? state.day.pieces.filter(function (x) { return x.id === id; })[0] : null;
    state.current = p ? JSON.parse(JSON.stringify(p)) : (seed || null);
    editor.hidden = !state.current;
    if (!state.current) return;
    $$('[data-f]').forEach(function (el) { el.value = state.current[el.getAttribute('data-f')] || ''; });
    renderSources(); showOut(''); words(); $('[data-blockers]').textContent = '';
  }
  function collect() {
    var p = state.current;
    $$('[data-f]').forEach(function (el) { p[el.getAttribute('data-f')] = el.value; });
    p.sources = $$('.dk-src', $('[data-sources]')).map(function (row) { return { url: $('[data-s=url]', row).value.trim(), label: $('[data-s=label]', row).value.trim(), note: $('[data-s=note]', row).value }; }).filter(function (s) { return s.url || s.note; });
    return p;
  }
  function renderSources() {
    var src = state.current.sources.length ? state.current.sources : [{ url: '', label: '', note: '' }];
    $('[data-sources]').innerHTML = src.map(function (s) {
      return '<div class="dk-src"><input data-s="url" type="url" placeholder="https://" value="' + esc(s.url) + '"><input data-s="label" placeholder="Who published it (optional)" value="' + esc(s.label) + '"><textarea data-s="note" rows="3" placeholder="The facts you are using from it, in your words or quoted with care">' + esc(s.note) + '</textarea></div>';
    }).join('');
  }
  $('[data-add-source]').addEventListener('click', function () { collect(); state.current.sources.push({ url: '', label: '', note: '' }); renderSources(); });
  function words() { var n = ($('[data-f=body]').value.match(/\S+/g) || []).length; $('[data-wc]').textContent = n + ' words, about ' + Math.max(1, Math.round(n / 230)) + ' min to read'; }
  $('[data-f=body]').addEventListener('input', words);

  $('[data-new]').addEventListener('click', function () { openPiece(null, blank()); $('[data-f=headline]').focus(); });
  function save(status) {
    var p = collect(); if (status) p.status = status;
    return api('POST', { action: 'save', date: state.date, piece: p }).then(function (j) {
      state.day = j.day;
      var saved = j.day.pieces[j.day.pieces.length - 1];
      var mine = j.day.pieces.filter(function (x) { return x.id === p.id; })[0] || saved;
      state.current = JSON.parse(JSON.stringify(mine));
      $('[data-f=status]').value = state.current.status;
      renderPieces(); $('[data-blockers]').textContent = ''; say(status === 'approved' ? 'Approved. It will be in this morning\'s edition.' : 'Saved.');
    }).catch(function (e) { $('[data-blockers]').textContent = e.message; say('Not saved.'); });
  }
  $('[data-save]').addEventListener('click', function () { save(); });
  $('[data-approve]').addEventListener('click', function () { save('approved'); });
  $('[data-remove]').addEventListener('click', function () {
    if (!state.current || !state.current.id) { openPiece(null); return; }
    if (!confirm('Delete this piece?')) return;
    api('POST', { action: 'remove', date: state.date, id: state.current.id }).then(function (j) { state.day = j.day; renderPieces(); openPiece(null); say('Deleted.'); }).catch(function (e) { say(e.message); });
  });

  // ---------- Writing help ----------
  function showOut(text, meta) {
    state.out = text;
    $('[data-out]').hidden = !text;
    var list = /^(headlines|hooks|subject)$/.test(state.lastMode || '');
    $('[data-out-text]').innerHTML = list ? '<ul>' + text.split('\n').filter(function (l) { return l.trim(); }).map(function (l) { return '<li data-pick>' + esc(l.replace(/^[-*\d.\s]+/, '')) + '</li>'; }).join('') + '</ul><p class="muted">Click one to use it.</p>' : esc(text);
    $('[data-out-meta]').textContent = meta || '';
    $$('[data-use=replace], [data-use=append]').forEach(function (b) { b.hidden = list || state.lastMode === 'check' || state.lastMode === 'voice'; });
  }
  $$('[data-assist]').forEach(function (b) {
    b.addEventListener('click', function () {
      var mode = b.getAttribute('data-assist');
      if (!state.ai) { say('Writing help is off until ANTHROPIC_API_KEY is set in Netlify.'); return; }
      var piece = mode === 'subject' ? blank() : collect();
      state.lastMode = mode; b.disabled = true; say('Writing…');
      api('POST', { action: 'assist', date: state.date, mode: mode, piece: piece }).then(function (j) {
        showOut(j.text, (j.truncated ? 'Cut off at the length limit. ' : '') + j.model + ', about $' + j.cost.toFixed(3) + '. Nothing is saved until you press Save.');
        say('Here is a suggestion.');
      }).catch(function (e) { say(e.message); }).then(function () { b.disabled = false; });
    });
  });
  $('[data-out-text]').addEventListener('click', function (e) {
    var li = e.target.closest('[data-pick]'); if (!li) return;
    var t = li.textContent;
    if (state.lastMode === 'headlines') $('[data-f=headline]').value = t;
    else if (state.lastMode === 'subject') $('[data-plan=subject]').value = t;
    else if (state.lastMode === 'hooks') { var body = $('[data-f=body]'); body.value = t + (body.value ? '\n\n' + body.value : ''); words(); }
    showOut('');
  });
  $$('[data-use]').forEach(function (b) {
    b.addEventListener('click', function () {
      var u = b.getAttribute('data-use'), body = $('[data-f=body]');
      if (u === 'replace') body.value = state.out;
      if (u === 'append') body.value = body.value ? body.value + '\n\n' + state.out : state.out;
      if (u !== 'dismiss' && state.current) state.current.ai = true;
      words(); showOut('');
    });
  });

  // ---------- Preview and the draft ----------
  function preview() {
    api('POST', { action: 'preview', date: state.date }).then(function (j) {
      $('[data-preview]').srcdoc = j.html;
      $('[data-preview-note]').textContent = j.count + ' approved piece' + (j.count === 1 ? '' : 's') + '. Save the plan to see a new subject or open here.';
    }).catch(function (e) { say(e.message); });
  }
  $('[data-draft]').addEventListener('click', function () {
    var again = /Draft made/.test($('[data-drafted]').textContent);
    if (again && !confirm('A draft was already made for this morning. Make a new one?')) return;
    savePlan().then(function () { return api('POST', { action: 'draft', date: state.date, force: again }); })
      .then(function (j) { say(j.reason === 'drafted' ? 'Draft made. Open your newsletter service, read it and press send.' : 'Done: ' + j.reason); return load(state.date); })
      .catch(function (e) { say(e.message); });
  });

  // ---------- Idea bank ----------
  function saveIdeas() { return api('POST', { action: 'ideas', ideas: state.ideas }).then(function (j) { state.ideas = j.ideas; renderIdeas(); }).catch(function (e) { say(e.message); }); }
  function renderIdeas() {
    $('[data-ideas]').innerHTML = state.ideas.length ? state.ideas.map(function (i, n) {
      return '<li><span style="flex:1">' + esc(i.text) + (i.url ? ' <a href="' + esc(i.url) + '" target="_blank" rel="noopener noreferrer">link</a>' : '') + '</span><button type="button" class="pill" data-idea-use="' + n + '">Start a piece</button><button type="button" class="pill" data-idea-del="' + n + '" aria-label="Remove">✕</button></li>';
    }).join('') : '<li class="muted">Empty. Add the first one above.</li>';
  }
  $('[data-idea-add]').addEventListener('click', function () {
    var t = $('[data-idea-text]').value.trim(); if (!t) return;
    state.ideas.unshift({ text: t, url: $('[data-idea-url]').value.trim(), added: new Date().toISOString() });
    $('[data-idea-text]').value = ''; $('[data-idea-url]').value = '';
    saveIdeas();
  });
  $('[data-ideas]').addEventListener('click', function (e) {
    var u = e.target.closest('[data-idea-use]'), d = e.target.closest('[data-idea-del]');
    if (d) { state.ideas.splice(+d.getAttribute('data-idea-del'), 1); saveIdeas(); }
    if (u) {
      var i = state.ideas[+u.getAttribute('data-idea-use')], p = blank();
      p.angle = i.text; if (i.url) p.sources = [{ url: i.url, label: '', note: '' }];
      $('[data-tab=today]').click(); openPiece(null, p);
    }
  });

  // ---------- Voice ----------
  function renderVoice() {
    var v = state.voice;
    $('[data-voice=about]').value = v.about || '';
    $('[data-voice=rules]').value = (v.rules || []).join('\n');
    var s = v.samples && v.samples.length ? v.samples : [''];
    $('[data-samples]').innerHTML = s.map(function (t, i) { return '<label>Sample ' + (i + 1) + '<textarea data-sample rows="6">' + esc(t) + '</textarea></label>'; }).join('');
  }
  $('[data-sample-add]').addEventListener('click', function () {
    if ($$('[data-sample]').length >= 6) return;
    var l = document.createElement('label'); l.innerHTML = 'Sample ' + ($$('[data-sample]').length + 1) + '<textarea data-sample rows="6"></textarea>';
    $('[data-samples]').appendChild(l);
  });
  $('[data-voice-save]').addEventListener('click', function () {
    var v = { about: $('[data-voice=about]').value, rules: $('[data-voice=rules]').value.split('\n').map(function (r) { return r.trim(); }).filter(Boolean), samples: $$('[data-sample]').map(function (t) { return t.value; }) };
    api('POST', { action: 'voice', voice: v }).then(function (j) { state.voice = j.voice; renderVoice(); say('Your voice is saved. Every suggestion now reads from it.'); }).catch(function (e) { say(e.message); });
  });

  if (!KEY) { say('Open the desk from your private link (it ends in #k=…).'); return; }
  load();
})();

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
  var state = { date: '', edition: 'morning', day: null, voice: null, ideas: [], leads: null, current: null, ai: false, out: '', drafted: null };
  var status = $('[data-desk-status]');
  var say = function (t) { status.textContent = t; };

  function api(method, body, query, path) {
    if (body && !body.edition) body.edition = state.edition;
    return fetch((path || '/api/desk') + (query || ''), {
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
      if (t === 'deals' && KEY) updateDeals({ action: 'deals' });
    });
  });

  // ---------- Loading a day's edition ----------
  var clock = function (m) { var h = Math.floor(m / 60), mm = m % 60; return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (h < 12 ? ' AM' : ' PM'); };
  var NAME = { morning: 'morning edition', evening: 'evening edition' };
  var RUN = { scheduled: 'scheduled it', late: 'made a draft but did not send it (it ran too late)', drafted: 'made the draft', updated: 'updated the draft', already: 'found the draft already made', skip: 'made none (No edition)', thin: 'made none (nothing but the weather)', 'no-topic': 'made none (this edition’s topic is missing)', 'history-unverified': 'could not check Resend for an existing edition', 'audience-unverified': 'left a draft because Resend could not verify its status or audience', 'already-in-resend': 'found this edition already scheduled or sent in Resend', 'not-scheduled': 'could not schedule it', 'already-scheduled': 'found it already scheduled', refused: 'was refused by the newsletter service', 'no-key': 'is off (no newsletter service set)' };
  function load(date) {
    say('Loading…');
    return api('GET', null, '?edition=' + state.edition + (date ? '&date=' + date : '')).then(function (j) {
      state.date = j.date; state.day = j.day; state.voice = j.voice; state.ideas = j.ideas; state.ai = j.ai; state.leads = j.leads; state.drafted = j.drafted; state.beat = j.beat || { entries: [], banned: [] };
      $('[data-date]').value = j.date;
      $$('[data-edition]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-edition') === state.edition ? 'true' : 'false'); });
      $('[data-clock]').textContent = 'Approve by ' + clock(j.clock.deadline) + '. The draft is made at ' + clock(j.clock.draft) + ' and goes out at ' + clock(j.clock.send) + ' unless you press Hold.' + (state.edition === 'evening' ? ' The evening takes up to two pieces and a one line open.' : '') + (j.service === 'resend' && !j.topic ? ' Set this edition’s Resend topic in Netlify before it can be sent.' : '');
      $('[data-plan=subject]').value = j.day.plan.subject || '';
      $('[data-plan=intro]').value = j.day.plan.intro || '';
      $('[data-plan=skip]').checked = !!j.day.plan.skip;
      var road = j.day.plan.road || {};
      $('[data-road=url]').value = road.url || road.typedUrl || '';
      $('[data-road=headline]').value = road.headline || '';
      $('[data-road=comment]').value = road.comment || '';
      var d = j.drafted;
      $('[data-drafted]').textContent = d ? (d.held ? 'Held ' + new Date(d.held).toLocaleString() + '. It is a draft in Resend and will not go out.' : d.scheduled ? 'Scheduled to go out ' + new Date(d.scheduled).toLocaleString([], { timeZone: 'America/Indiana/Indianapolis', weekday: 'short', hour: 'numeric', minute: '2-digit' }) + ' Columbus time' + '. Press Hold to stop it.' : 'Draft made ' + new Date(d.at).toLocaleString() + '. The ' + clock(j.clock.draft) + ' job updates it from the desk and schedules it.') : 'No draft yet for this ' + NAME[state.edition] + '.';
      $('[data-hold]').hidden = !(d && d.scheduled && !d.held);
      $('[data-run]').textContent = (j.service ? '' : 'No newsletter service is set in Netlify, so nothing can be made or sent. ') + (j.run ? 'The ' + clock(j.clock.draft) + ' job ' + (RUN[j.run.reason] || j.run.reason) + ' at ' + new Date(j.run.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.' + (j.run.held ? ' You held it.' : '') + ((j.run.notes || []).length ? ' ' + j.run.notes.join(' ') : '') : (j.date === j.today ? 'The job runs at ' + clock(j.clock.draft) + ' and uses what you approved by then.' : ''));
      renderPieces(); renderIdeas(); renderVoice(); renderLeads(); renderBeat();
      openPiece(null);
      say((j.date === j.today ? 'Today, ' : '') + j.date + ', the ' + NAME[state.edition] + (j.ai ? '. Writing help is on (' + j.model + ').' : '. Writing help is off until ANTHROPIC_API_KEY is set in Netlify.'));
    }).catch(function (e) { say(e.message); });
  }
  $('[data-date]').addEventListener('change', function (e) { load(e.target.value); });
  $$('[data-edition]').forEach(function (b) {
    b.addEventListener('click', function () { state.edition = b.getAttribute('data-edition'); load(state.date); });
  });

  // ---------- The edition plan ----------
  function plan() {
    return { subject: $('[data-plan=subject]').value, intro: $('[data-plan=intro]').value, skip: $('[data-plan=skip]').checked, order: state.day.plan.order, road: { url: $('[data-road=url]').value.trim(), headline: $('[data-road=headline]').value, comment: $('[data-road=comment]').value } };
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
  // Prose numbers (public/js/prose.js): hints for your edit, never a rule.
  function words() {
    var body = $('[data-f=body]').value;
    if (window.HoCProse) { $('[data-wc]').textContent = window.HoCProse.summary(window.HoCProse.prose(body)); return; }
    var n = (body.match(/\S+/g) || []).length; $('[data-wc]').textContent = n + ' words, about ' + Math.max(1, Math.round(n / 230)) + ' min to read';
  }
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
      renderPieces(); $('[data-blockers]').textContent = ''; say(status === 'approved' ? 'Approved. It will be in the ' + NAME[state.edition] + '.' : 'Saved.');
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
      $('[data-preview]').srcdoc = j.html || '<p style="font-family:Georgia,serif">No edition: this one is marked "No edition".</p>';
      $('[data-preview-note]').textContent = (j.subject ? 'Subject: ' + j.subject + '. ' : '') + j.count + ' approved piece' + (j.count === 1 ? '' : 's') + (j.count ? '' : ', so the automatic edition goes out') + '. ' + (j.notes || []).join(' ') + (j.html && !j.substance ? ' Nothing but the weather yet, so this edition would be skipped.' : '') + ' Save the plan to see a new subject, open or Up the road here.';
    }).catch(function (e) { say(e.message); });
  }
  $('[data-draft]').addEventListener('click', function () {
    savePlan().then(function () { return api('POST', { action: 'draft', date: state.date }); })
      .then(function (j) { say(j.reason === 'drafted' ? 'Draft made in Resend. The scheduled job updates it from the desk and sends it at its time.' : j.reason === 'updated' ? 'The draft in Resend was updated with this one.' : 'Done: ' + j.reason); return load(state.date); })
      .catch(function (e) { say(e.message); });
  });
  $('[data-hold]').addEventListener('click', function () {
    if (!confirm('Hold the ' + NAME[state.edition] + ' for ' + state.date + '? It turns back into a draft in Resend and is not sent.')) return;
    api('POST', { date: state.date, edition: state.edition }, '', '/api/hold').then(function () { say('Held. Nothing will be sent.'); return load(state.date); }).catch(function (e) { say(e.message); });
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

  // ---------- Overnight leads ----------
  function renderLeads() {
    var L = state.leads;
    var bad = L ? L.sources.filter(function (s) { return !s.ok; }) : [];
    $('[data-leads-meta]').textContent = L ? 'Gathered ' + new Date(L.at).toLocaleString([], { weekday: 'short', hour: 'numeric', minute: '2-digit' }) + ' from ' + (L.sources.length - bad.length) + ' of ' + L.sources.length + ' sources.' + (bad.length ? ' Could not read: ' + bad.map(function (s) { return s.name + ' (' + s.error + ')'; }).join('; ') + '.' : '') : 'Nothing gathered for this morning yet. The gathering runs at about 4:15 AM, or press Gather now.';
    var items = L ? L.items : [];
    $('[data-leads]').innerHTML = items.length ? items.map(function (x, n) {
      var when = x.on ? ' · ' + x.on + (x.time ? ' ' + x.time : '') : '';
      return '<li><span style="flex:1">' + (x.new ? '<span class="dk-new">NEW</span>' : '') + '<a href="' + esc(x.url) + '" target="_blank" rel="noopener noreferrer">' + esc(x.title) + '</a><br><span class="dk-src-k">' + esc(x.source) + esc(when) + '</span></span>' +
        '<button type="button" class="pill" data-lead-idea="' + n + '">To ideas</button><button type="button" class="pill" data-lead-use="' + n + '">Start a piece</button></li>';
    }).join('') : (L ? '<li class="muted">Nothing new in the sources this morning.</li>' : '');
  }
  function leadSeed(x) {
    var p = blank();
    p.angle = 'Lead from ' + x.source + ': ' + x.title + (x.on ? ' (' + x.on + (x.time ? ' ' + x.time : '') + ')' : '') + '. Read it at the source first. What does it mean for Columbus, and what do you think?';
    p.sources = [{ url: x.url, label: x.source, note: '' }];
    return p;
  }
  $('[data-leads]').addEventListener('click', function (e) {
    var a = e.target.closest('[data-lead-idea]'), u = e.target.closest('[data-lead-use]');
    if (!a && !u) return;
    var x = state.leads.items[+(a || u).getAttribute(a ? 'data-lead-idea' : 'data-lead-use')];
    if (a) { state.ideas.unshift({ text: x.source + ': ' + x.title, url: x.url, added: new Date().toISOString() }); saveIdeas(); say('Added to your ideas.'); }
    if (u) { $('[data-tab=today]').click(); openPiece(null, leadSeed(x)); }
  });
  $('[data-gather]').addEventListener('click', function (e) {
    var b = e.target; b.disabled = true; say('Gathering…');
    api('POST', { action: 'gather' }).then(function (j) {
      if (j.leads.date === state.date) { state.leads = j.leads; renderLeads(); }
      say('Gathered ' + j.leads.items.length + ' leads for ' + j.leads.date + '.');
    }).catch(function (er) { say(er.message); }).then(function () { b.disabled = false; });
  });

  // ---------- Beat book ----------
  // One name per line: "Name | note | wrong spellings, comma separated".
  function renderBeat() {
    var b = state.beat || { entries: [], banned: [] };
    $('[data-beat=entries]').value = b.entries.map(function (e) { return [e.term, e.note, (e.wrong || []).join(', ')].join(' | ').replace(/( \| )+$/, ''); }).join('\n');
    $('[data-beat=banned]').value = (b.banned || []).join('\n');
    $('[data-beat-count]').textContent = b.entries.length + ' name' + (b.entries.length === 1 ? '' : 's') + ', ' + b.banned.length + ' banned phrase' + (b.banned.length === 1 ? '' : 's') + '.';
  }
  $('[data-beat-save]').addEventListener('click', function () {
    var entries = $('[data-beat=entries]').value.split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var p = l.split('|').map(function (x) { return x.trim(); });
      return { term: p[0] || '', note: p[1] || '', wrong: (p[2] || '').split(',').map(function (w) { return w.trim(); }).filter(Boolean) };
    });
    api('POST', { action: 'beat', beat: { entries: entries, banned: $('[data-beat=banned]').value } }).then(function (j) { state.beat = j.beat; renderBeat(); say('Beat book saved. The writing help and Approve now read it.'); }).catch(function (e) { say(e.message); });
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


  // ---------- Owner deals ----------
  var dealForm = $('[data-deal-form]');
  var dealFields = $('[data-deal-fields]');
  var dealStatus = $('[data-deal-status]');
  var dealList = $('[data-desk-deals]');
  var dealBusy = false;
  var dealBusinesses = new Map(Array.from(dealForm.elements.slug.options, function (option) {
    return [option.value, option.textContent];
  }));

  function renderDeals(deals, today) {
    dealForm.elements.sent.max = today;
    dealForm.elements.ends.min = today;
    dealList.replaceChildren();
    deals.forEach(function (deal) {
      var row = document.createElement('li');
      var summary = document.createElement('span');
      summary.style.flex = '1';
      var title = document.createElement('strong');
      title.textContent = dealBusinesses.get(deal.slug) || deal.slug;
      var copy = document.createElement('span');
      copy.className = 'dk-deal-copy';
      copy.textContent = deal.text;
      var dates = document.createElement('small');
      dates.textContent = (deal.ends < today ? 'Expired ' : 'Ends ') + deal.ends;
      summary.append(title, document.createElement('br'), copy, document.createElement('br'), dates);
      var remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'pill';
      remove.textContent = 'Remove';
      remove.setAttribute('aria-label', 'Remove deal by ' + title.textContent + ' ending ' + deal.ends);
      remove.addEventListener('click', function () {
        if (!dealBusy && window.confirm('Remove this deal from Local deals?')) {
          updateDeals({ action: 'deal-remove', id: deal.id });
        }
      });
      row.append(summary, remove);
      dealList.append(row);
    });
  }

  function updateDeals(body) {
    if (dealBusy) return;
    dealBusy = true;
    dealForm.setAttribute('aria-busy', 'true');
    dealFields.disabled = true;
    $$('button', dealList).forEach(function (button) { button.disabled = true; });
    dealStatus.textContent = 'Working…';
    api('POST', body).then(function (result) {
      if (body.action === 'deal-save') dealForm.reset();
      renderDeals(result.deals, result.today);
      dealStatus.textContent = body.action === 'deal-save' ? 'Deal published.' :
        body.action === 'deal-remove' ? 'Deal removed.' : result.deals.length ? '' : 'No deals added from the desk yet.';
    }).catch(function (error) {
      dealStatus.textContent = error.message;
    }).finally(function () {
      dealBusy = false;
      dealForm.removeAttribute('aria-busy');
      dealFields.disabled = false;
      $$('button', dealList).forEach(function (button) { button.disabled = false; });
    });
  }

  dealForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!KEY || dealBusy) return;
    var data = new FormData(dealForm);
    updateDeals({
      action: 'deal-save', slug: data.get('slug'), text: data.get('text'),
      sent: data.get('sent'), ends: data.get('ends'), confirmed: data.has('confirmed'),
    });
  });

  if (!KEY) { say('Open the desk from your private link (it ends in #k=…).'); return; }
  load();
})();

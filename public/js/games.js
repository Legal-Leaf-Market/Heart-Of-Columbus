// Games: Where in Columbus? (one guess a day) and the weekly news quiz.
// Scores and streaks live in localStorage only, wrapped in try/catch like Saved.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var get = function (k, d) { try { var v = JSON.parse(localStorage.getItem('hoc-game-' + k)); return v == null ? d : v; } catch (e) { return d; } };
  var set = function (k, v) { try { localStorage.setItem('hoc-game-' + k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  var share = function (text) {
    if (navigator.share) return navigator.share({ text: text }).catch(function () {});
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(function () { if (window.HoC && window.HoC.toast) window.HoC.toast('Copied. Paste it anywhere.'); });
  };
  var dataEl = $('#page-data');
  var data = dataEl ? JSON.parse(dataEl.textContent) : {};

  // ---------- Where in Columbus? ----------
  var where = $('[data-where]');
  if (where && data.where && data.where.length >= 4) {
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Indiana/Indianapolis' }).format(new Date());
    var dayNo = Math.floor(Date.parse(p + 'T00:00:00Z') / 86400000);
    var L = data.where, n = L.length;
    var ans = L[dayNo % n];
    // Three other names, picked the same way for everyone today.
    var others = L.filter(function (x) { return x.s !== ans.s; });
    var picks = [ans];
    for (var i = 0; picks.length < 4; i++) { var o = others[(dayNo * 7 + i * 3) % others.length]; if (picks.indexOf(o) === -1) picks.push(o); }
    picks.sort(function (a, b) { return a.n.localeCompare(b.n); });
    var img = $('[data-where-img]', where);
    img.src = ans.src;
    // A different close-up each day of the rotation.
    img.style.objectPosition = (20 + (dayNo * 37) % 60) + '% ' + (20 + (dayNo * 53) % 60) + '%';
    var box = $('[data-where-choices]', where), result = $('[data-where-result]', where);
    var played = get('where-' + p, null);
    function finish(guess, fresh) {
      var ok = guess === ans.s;
      if (fresh) {
        set('where-' + p, guess);
        var st = get('where-streak', { n: 0, last: 0 });
        st.n = ok ? (st.last === dayNo - 1 ? st.n + 1 : 1) : 0;
        st.last = dayNo;
        set('where-streak', st);
      }
      var streak = get('where-streak', { n: 0 }).n;
      img.classList.add('is-done');
      $$('button', box).forEach(function (b) { b.disabled = true; if (b.getAttribute('data-s') === ans.s) b.classList.add('is-right'); else if (b.getAttribute('data-s') === guess) b.classList.add('is-wrong'); });
      result.hidden = false;
      result.innerHTML = '<p><strong>' + (ok ? 'You got it.' : 'Not this time.') + '</strong> It’s <a href="/l/' + esc(ans.s) + '/">' + esc(ans.n) + '</a>.' +
        (streak > 1 ? ' Streak: ' + streak + ' days.' : '') + '</p><p class="fine">Photo: ' + esc(ans.credit) + '</p>' +
        '<p><button type="button" class="btn btn-sm" data-where-share>Share my result</button></p>';
      $('[data-where-share]', result).onclick = function () { share('Where in Columbus? ' + p + ': ' + (ok ? '🏛️ got it' : '❌ missed') + (streak > 1 ? ', ' + streak + ' day streak' : '') + '\n' + location.href); };
    }
    box.innerHTML = picks.map(function (x) { return '<button type="button" class="pill" data-s="' + esc(x.s) + '">' + esc(x.n) + '</button>'; }).join('');
    box.addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b && !b.disabled) finish(b.getAttribute('data-s'), true); });
    if (played) finish(played, false);
  }

  // ---------- Weekly news quiz ----------
  var quiz = $('[data-quiz]');
  if (quiz) {
    var qs = $$('[data-q]', quiz), right = 0, done = 0, marks = [];
    qs.forEach(function (q, i) {
      q.addEventListener('click', function (e) {
        var b = e.target.closest('[data-choice]');
        if (!b || q.classList.contains('is-done')) return;
        var a = Number(q.getAttribute('data-answer')), c = Number(b.getAttribute('data-choice'));
        q.classList.add('is-done');
        $$('[data-choice]', q).forEach(function (x) { x.disabled = true; var k = Number(x.getAttribute('data-choice')); if (k === a) x.classList.add('is-right'); else if (k === c) x.classList.add('is-wrong'); });
        $('.np-q-more', q).hidden = false;
        if (c === a) right++;
        marks[i] = c === a ? '🟩' : '🟥';
        if (++done === qs.length) {
          var r = $('[data-quiz-result]', quiz);
          r.hidden = false;
          r.innerHTML = '<p><strong>' + right + ' of ' + qs.length + '.</strong></p><p><button type="button" class="btn btn-sm" data-quiz-share>Share my score</button></p>';
          $('[data-quiz-share]', r).onclick = function () { share('Columbus news quiz: ' + right + '/' + qs.length + ' ' + marks.join('') + '\n' + location.href); };
        }
      });
    });
  }
})();

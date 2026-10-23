// Hub: directory tabs, category chips, forgiving search, and the
// "Keep it in Columbus" estimate.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---------- Fuzzy search ----------
  var norm = function (s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
      .replace(/['’]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
  };
  // Common ways people type the same place.
  var ALIASES = { street: 'st', avenue: 'ave', road: 'rd', twentyfifth: '25th', '25': '25th', '2nd': '2nd', downtown: 'downtown', nexus: 'nexuspark' };
  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i];
      var best = i;
      for (j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        if (cur[j] < best) best = cur[j];
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }
  function tokenHits(token, words, text) {
    if (text.indexOf(token) !== -1) return true;
    if (/^\d/.test(token) || token.length < 4) return words.some(function (w) { return w.indexOf(token) === 0; });
    var max = token.length >= 7 ? 2 : 1;
    return words.some(function (w) { return lev(token, w.slice(0, token.length + max), max) <= max || lev(token, w, max) <= max; });
  }

  var cards = $$('.biz-card').map(function (el) {
    var text = norm(el.dataset.search);
    return { el: el, vertical: el.dataset.vertical, filters: el.dataset.filters.split(' '), text: text, words: text.split(' ') };
  });

  // Long tabs show a page of cards first; "Show all" reveals the rest.
  var PAGE = 36;
  var state = { tab: 'eat', filter: {}, q: '', all: false };
  var more = $('[data-more]');
  if (more) more.addEventListener('click', function () { state.all = true; apply(); });

  function apply() {
    var tokens = norm(state.q).split(' ').filter(Boolean).map(function (w) { return ALIASES[w] || w; });
    var shown = 0;
    cards.forEach(function (c) {
      var ok = c.vertical === state.tab;
      var f = state.filter[state.tab] || 'all';
      if (ok && f !== 'all') ok = c.filters.indexOf(f) !== -1;
      // A search looks across every tab, so "pizza" on the services tab
      // still finds pizza.
      if (tokens.length) ok = tokens.every(function (tk) { return tokenHits(tk, c.words, c.text); });
      if (ok) shown++;
      c.el.hidden = !ok || (!state.all && shown > PAGE);
    });
    if (more) {
      more.classList.toggle('hidden', state.all || shown <= PAGE);
      more.textContent = 'Show all ' + shown;
    }
    $('[data-empty]').classList.toggle('hidden', shown > 0);
    $('[data-count]').textContent = shown + (shown === 1 ? ' place' : ' places') + (state.q ? ' match “' + state.q + '”' : '');
  }

  function setTab(tab) {
    state.tab = tab;
    state.all = false;
    $$('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === tab)); });
    $$('[data-chips]').forEach(function (g) { g.classList.toggle('hidden', g.dataset.chips !== tab); });
    apply();
  }

  $$('[data-tab]').forEach(function (b) { b.addEventListener('click', function () { setTab(b.dataset.tab); }); });
  $$('[data-jump]').forEach(function (a) { a.addEventListener('click', function () { setTab(a.dataset.jump); }); });
  $$('[data-filter]').forEach(function (b) {
    b.addEventListener('click', function () {
      var v = b.dataset.for;
      state.filter[v] = b.dataset.filter;
      state.all = false;
      $$('[data-for="' + v + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      apply();
    });
  });
  var input = $('[data-search]');
  input.addEventListener('input', function () { state.q = input.value.trim(); state.all = false; apply(); });
  apply();

  // ---------- Keep it in Columbus ----------
  var fmt0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  var val = function (k) { return Number($('[data-in="' + k + '"]').value); };
  function calc() {
    var weekly = val('orders') * val('avg') * (val('rate') / 100) * val('biz');
    $('[data-out="orders"]').textContent = val('orders');
    $('[data-out="avg"]').textContent = fmt0.format(val('avg'));
    $('[data-out="rate"]').textContent = val('rate') + '%';
    $('[data-out="biz"]').textContent = val('biz');
    $('[data-year]').textContent = fmt0.format(weekly * 52);
    $('[data-week]').textContent = fmt0.format(weekly) + ' a week across ' + val('biz') + (val('biz') === 1 ? ' business' : ' businesses');
    var total = window.HoC ? window.HoC.ledger.total() : 0;
    var n = window.HoC ? window.HoC.ledger.entries().length : 0;
    $('[data-ledger]').textContent = (window.HoC ? window.HoC.money(total) : '$0.00') + ' ordered';
    $('[data-ledger-kept]').textContent = n
      ? n + (n === 1 ? ' demo order' : ' demo orders') + ': about ' + window.HoC.money(total * val('rate') / 100) + ' that would have gone to app fees at ' + val('rate') + '%.'
      : 'Place an order in any demo storefront and it shows up here.';
  }
  $$('[data-in]').forEach(function (i) { i.addEventListener('input', calc); });
  window.addEventListener('pageshow', calc);
  calc();
})();

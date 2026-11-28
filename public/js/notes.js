// Paste notes, get ideas: splits a block of the publisher's own notes into
// separate idea bank entries at the writing desk (/newsroom/desk/). No writing
// help and no cost: the publisher's words are kept as written. Blank lines
// separate ideas; a block where every line is a bullet or a number becomes one
// idea per line. The first link in an idea is moved to its link field. Ideas
// already in the bank (same words, any case) are left out. Used by
// public/js/desk.js; tests/desk.test.mjs loads it.
(function (root) {
  'use strict';
  var BULLET = /^\s*(?:[-*•●▪]|\d{1,3}[.)])\s+/;
  var URL_RE = /https?:\/\/[^\s<>"')\]]+/;
  var MAX = 50;

  function key(t) { return String(t || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  function one(raw) {
    var text = raw.replace(BULLET, '').replace(/\s*\n\s*/g, ' ').trim();
    var m = text.match(URL_RE), url = '';
    if (m) {
      url = m[0].replace(/[.,;:!?]+$/, '');
      var rest = text.replace(m[0], ' ').replace(/\s+/g, ' ').replace(/\s*[(:\-]\s*$/, '').trim();
      text = rest || url;
    }
    return { text: text.slice(0, 1000), url: url.slice(0, 500) };
  }

  function split(notes, existing) {
    var blocks = String(notes || '').replace(/\r\n?/g, '\n').split(/\n\s*\n/);
    var parts = [];
    blocks.forEach(function (b) {
      var lines = b.split('\n').filter(function (l) { return l.trim(); });
      if (!lines.length) return;
      if (lines.length > 1 && lines.every(function (l) { return BULLET.test(l); })) parts.push.apply(parts, lines);
      else parts.push(lines.join('\n'));
    });
    var seen = {};
    (existing || []).forEach(function (i) { seen[key(i && i.text)] = 1; });
    var out = [];
    parts.forEach(function (p) {
      var idea = one(p), k = key(idea.text);
      if (!k || seen[k] || out.length >= MAX) return;
      seen[k] = 1; out.push(idea);
    });
    return out;
  }

  var api = { split: split, MAX: MAX };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HoCNotes = api;
})(typeof window !== 'undefined' ? window : this);

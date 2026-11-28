// Tracked changes for the writing desk (/newsroom/desk/). Compares the
// publisher's draft with a suggested revision sentence by sentence and
// returns the changes as separate pieces the publisher accepts or rejects
// one at a time. Nothing is applied until they press Apply, and a change
// left undecided keeps the publisher's own words. Used by public/js/desk.js;
// tests/desk.test.mjs loads it.
(function (root) {
  'use strict';
  // Sentences and line breaks, each keeping its trailing space so joining
  // them gives back the exact text.
  function pieces(text) {
    return String(text || '').match(/[^.!?\n]+(?:[.!?]+["”’')\]]*)?[ \t]*|[.!?]+[ \t]*|\n+/g) || [];
  }
  var norm = function (s) { return s.replace(/\s+/g, ' ').trim(); };

  // Longest common subsequence on sentences, then group the rest into
  // changes: { same } for untouched text, { del, ins } for a change.
  function changes(before, after) {
    var a = pieces(before), b = pieces(after), n = a.length, m = b.length;
    if (n * m > 4000000) return [{ del: String(before || ''), ins: String(after || '') }];
    var na = a.map(norm), nb = b.map(norm), L = [];
    for (var i = 0; i <= n; i++) L.push(new Uint16Array(m + 1));
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = na[i] === nb[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = [], del = '', ins = '';
    function flush() { if (del || ins) { if (norm(del) === norm(ins)) out.push({ same: del }); else out.push({ del: del, ins: ins }); } del = ''; ins = ''; }
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && na[i] === nb[j]) {
        flush();
        if (out.length && out[out.length - 1].same !== undefined) out[out.length - 1].same += a[i]; else out.push({ same: a[i] });
        i++; j++;
      } else if (j < m && (i === n || L[i][j + 1] >= L[i + 1][j])) { ins += b[j++]; }
      else { del += a[i++]; }
    }
    flush();
    return out;
  }

  // Rebuild the text: accepted changes take the suggestion, everything else
  // keeps the original. `accepted` maps a change's index to true.
  function apply(list, accepted) {
    return list.map(function (c, k) { return c.same !== undefined ? c.same : (accepted && accepted[k] ? c.ins : c.del); }).join('');
  }

  var api = { changes: changes, apply: apply, pieces: pieces };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HoCDiff = api;
})(typeof window !== 'undefined' ? window : this);

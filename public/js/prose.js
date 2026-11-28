// Prose numbers for the writing desk (/newsroom/desk/): words, sentences,
// the average and longest sentence, a reading grade, adverbs ending in -ly
// and likely passive voice. Counted in the browser with no writing help and
// no cost. They are hints for the publisher's own edit, never a rule: nothing
// is blocked by them. Markdown links, images and formatting marks are left
// out of the count. Used by public/js/desk.js; tests/desk.test.mjs loads it.
(function (root) {
  'use strict';
  // Syllables, roughly: vowel groups, minus a silent final e, at least one.
  function syllables(word) {
    var w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    if (w.length <= 3) return 1;
    w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    var m = w.match(/[aeiouy]{1,2}/g);
    return Math.max(1, m ? m.length : 1);
  }
  // Common -ly words that are not adverbs worth a second look.
  var NOT_ADVERBS = /^(only|early|family|daily|weekly|monthly|yearly|likely|holy|ugly|friendly|lovely|lonely|reply|supply|apply|rely|july|italy|bully|belly|jelly|silly|hilly|rally|ally|fly|oily|curly|chilly|elderly|assembly|lily|billy|molly|sally|emily|kelly|holly)$/;
  var PASSIVE = /\b(?:is|are|was|were|be|been|being|gets|got|get)\s+(?:\w+ly\s+)?(\w+(?:ed|en)|built|made|held|paid|sold|told|found|given|taken|seen|done|known|shown|said|set|put|kept|left|brought|thought|bought|caught|taught|won|lost|cut|hit|run|begun|chosen|written|driven|broken|spoken|stolen|frozen)\b/gi;

  function clean(md) {
    return String(md || '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/g, ' ')
      .replace(/^#+\s*/gm, '')
      .replace(/^\s*[-*>]\s+/gm, '')
      .replace(/[*_`]/g, '');
  }

  function prose(md) {
    var text = clean(md);
    var words = text.match(/[A-Za-z0-9’']+/g) || [];
    // A sentence ends at . ! ? or a blank line; list items count as their own.
    var sentences = text.split(/(?<=[.!?])\s+|\n\s*\n|\n(?=\s*\d+\.\s)/).map(function (s) { return s.trim(); }).filter(function (s) { return /[A-Za-z]/.test(s); });
    var lens = sentences.map(function (s) { return (s.match(/[A-Za-z0-9’']+/g) || []).length; });
    var syl = words.reduce(function (n, w) { return n + syllables(w); }, 0);
    var n = words.length, s = Math.max(1, sentences.length);
    var grade = n ? Math.max(0, Math.round((0.39 * (n / s) + 11.8 * (syl / n) - 15.59) * 10) / 10) : 0;
    var longest = 0, longestText = '';
    lens.forEach(function (l, i) { if (l > longest) { longest = l; longestText = sentences[i]; } });
    var adverbs = words.filter(function (w) { var x = w.toLowerCase(); return x.length > 4 && /ly$/.test(x) && !NOT_ADVERBS.test(x); });
    var passive = text.match(PASSIVE) || [];
    return {
      words: n, sentences: sentences.length,
      avg: sentences.length ? Math.round((n / sentences.length) * 10) / 10 : 0,
      longest: longest, longestText: longestText.slice(0, 200),
      long: lens.filter(function (l) { return l > 30; }).length,
      grade: grade, adverbs: adverbs, passive: passive,
      minutes: Math.max(1, Math.round(n / 230)),
    };
  }

  // Names the draft uses that the beat book does not list yet: runs of
  // capitalized words ("Mill Race Park"), and single capitalized words that
  // also appear mid-sentence (so a word capitalized only because it starts a
  // sentence is skipped). Days, months and a few common words are left out.
  // Only a suggestion: the publisher decides what goes in the beat book.
  var COMMON = /^(i|i'm|i’m|i've|i’ve|i'll|i’ll|a|an|the|this|that|these|those|it|its|we|our|you|your|he|she|they|but|and|or|so|if|then|when|while|after|before|on|in|at|for|to|of|by|with|from|as|my|his|her|their|there|here|what|who|why|how|monday|tuesday|wednesday|thursday|friday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december|today|tomorrow|tonight|yesterday|am|pm|mr|mrs|ms|dr|st|ave|columbus|indiana|check)$/i;
  var JOIN = /^(of|the|and|&|de)$/i;
  var STARTERS = /^(visit|ask|see|call|meet|try|read|join|head|stop|go|come|find|watch|look|get|take|grab|catch|bring|thank|welcome|tell|follow|order|shop|park|walk|drive|skip|expect|remember|congratulations|happy|merry)$/i;
  function names(md, beat) {
    var text = clean(md).replace(/\[CHECK:[^\]]*\]/g, ' ');
    var known = {};
    ((beat && beat.entries) || []).forEach(function (e) {
      [e.term].concat(e.wrong || []).forEach(function (t) { if (t) known[String(t).toLowerCase()] = 1; });
    });
    var tokens = text.match(/[A-Za-z][A-Za-z’'&-]*|[.!?\n]/g) || [];
    var found = {}, order = [], start = true;
    function add(name, mid) {
      var k = name.toLowerCase();
      if (!found[k]) { found[k] = { name: name, count: 0, mid: false }; order.push(k); }
      found[k].count++; if (mid) found[k].mid = true;
    }
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      if (/^[.!?\n]$/.test(t)) { start = true; continue; }
      var w = t.replace(/[’'](s)?$/, '').replace(/[.]+$/, '');
      if (!/^[A-Z]/.test(w) || COMMON.test(w)) { start = false; continue; }
      var run = [w], j = i + 1;
      while (j < tokens.length) {
        var n = tokens[j].replace(/[’'](s)?$/, '').replace(/[.]+$/, '');
        if (/^[A-Z]/.test(n) && !COMMON.test(n)) { run.push(n); j++; continue; }
        if (JOIN.test(n) && j + 1 < tokens.length && /^[A-Z]/.test(tokens[j + 1]) && !COMMON.test(tokens[j + 1])) { run.push(n); j++; continue; }
        break;
      }
      // A verb that opens a sentence is not part of the name that follows it
      // ("Visit Mill Race Park").
      if (start && run.length > 1 && STARTERS.test(run[0])) { run.shift(); while (run.length && JOIN.test(run[0])) run.shift(); add(run.join(' '), true); start = false; i = j - 1; continue; }
      add(run.join(' '), !start);
      start = false; i = j - 1;
    }
    return order.map(function (k) { return found[k]; })
      .filter(function (f) { return (f.name.indexOf(' ') > 0 || f.mid) && f.name.length > 2 && !known[f.name.toLowerCase()]; })
      .sort(function (a, b) { return b.count - a.count; })
      .slice(0, 8).map(function (f) { return f.name; });
  }

  // One line for the desk, plain words.
  function summary(p) {
    if (!p.words) return '0 words';
    var bits = [p.words + ' words, about ' + p.minutes + ' min to read', p.sentences + ' sentence' + (p.sentences === 1 ? '' : 's') + ', ' + p.avg + ' words each on average', 'reading grade ' + p.grade];
    if (p.long) bits.push(p.long + ' over 30 words (longest ' + p.longest + ')');
    if (p.adverbs.length) bits.push(p.adverbs.length + ' -ly word' + (p.adverbs.length === 1 ? '' : 's') + ': ' + p.adverbs.slice(0, 5).join(', '));
    if (p.passive.length) bits.push(p.passive.length + ' possible passive: ' + p.passive.slice(0, 3).map(function (x) { return '"' + x + '"'; }).join(', '));
    return bits.join('. ') + '.';
  }

  var api = { prose: prose, summary: summary, syllables: syllables, names: names };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HoCProse = api;
})(typeof window !== 'undefined' ? window : this);

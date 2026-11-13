// Columbus passport (/passport/): every trail's stamp card in one place, read
// from the same browser storage the trail pages write ("hoc.trail.<slug>").
// A stamp is a digital discovery on the honor system, never a verified visit
// and never a reward. Nothing is sent anywhere: a copy leaves this browser
// only when the visitor saves a file, and comes back only when they load one.
//
// The core (HoCPassport) is pure so tests/passport.test.mjs can run it.
(function (root) {
  'use strict';
  var FORMAT = 'heart-of-columbus-passport';
  var VERSION = 1;
  var MAX_BYTES = 100000;
  var ID = /^[a-z0-9][a-z0-9:._-]{0,99}$/;

  // trails: { slug: [current stop ids] }. stamps: { slug: [ids] }.
  function exportPassport(stamps, trails, now) {
    var out = {};
    Object.keys(trails).forEach(function (slug) {
      var got = (stamps[slug] || []).filter(function (id) { return typeof id === 'string' && ID.test(id); });
      if (got.length) out[slug] = got;
    });
    return { format: FORMAT, version: VERSION, kind: 'digital-discovery', exported: now, trails: out };
  }

  // Never throws. ok:false carries a sentence for the visitor. On success the
  // file's stamps are merged into the current ones (a load never erases).
  // A stamp for a place no longer on a trail is kept, so a closed shop or a
  // changed trail doesn't wipe someone's history; it just isn't counted.
  function importPassport(text, trails, current) {
    var bad = function (msg) { return { ok: false, error: msg }; };
    if (typeof text === 'string' && text.length > MAX_BYTES) return bad('That file is too big to be a passport.');
    if (typeof text !== 'string' || !text.trim()) return bad('That file is empty.');
    var data;
    try { data = JSON.parse(text); } catch (e) { return bad('That isn’t a Heart of Columbus passport file.'); }
    if (!data || typeof data !== 'object' || Array.isArray(data) || data.format !== FORMAT) return bad('That isn’t a Heart of Columbus passport file.');
    if (typeof data.version !== 'number' || data.version % 1 !== 0 || data.version < 1) return bad('That passport file is damaged.');
    if (data.version > VERSION) return bad('That passport was saved by a newer version of this site. Reload the page and try again.');
    if (!data.trails || typeof data.trails !== 'object' || Array.isArray(data.trails)) return bad('That passport file is damaged.');

    var merged = {}, added = 0, skipped = 0;
    Object.keys(trails).forEach(function (slug) { merged[slug] = (current[slug] || []).slice(); });
    Object.keys(data.trails).forEach(function (slug) {
      var ids = data.trails[slug];
      if (!Object.prototype.hasOwnProperty.call(trails, slug) || !Array.isArray(ids)) { skipped += Array.isArray(ids) ? ids.length : 1; return; }
      ids.forEach(function (id) {
        if (typeof id !== 'string' || !ID.test(id)) { skipped++; return; }
        if (merged[slug].indexOf(id) === -1) { merged[slug].push(id); added++; }
      });
    });
    return { ok: true, stamps: merged, added: added, skipped: skipped };
  }

  // Counted stamps: only stops on the trail as it is today.
  function progress(stamps, trails) {
    var per = {}, done = 0, total = 0;
    Object.keys(trails).forEach(function (slug) {
      var stops = trails[slug], got = stamps[slug] || [];
      var n = stops.filter(function (id) { return got.indexOf(id) !== -1; }).length;
      per[slug] = { n: n, of: stops.length, older: got.filter(function (id) { return stops.indexOf(id) === -1; }).length };
      done += n; total += stops.length;
    });
    return { per: per, done: done, total: total };
  }

  root.HoCPassport = { FORMAT: FORMAT, VERSION: VERSION, exportPassport: exportPassport, importPassport: importPassport, progress: progress };

  // ---- The page ----
  var doc = root.document;
  var holder = doc && doc.querySelector('[data-passport]');
  if (!holder) return;
  var meta = JSON.parse(doc.getElementById('passport-data').textContent);
  var trails = {};
  meta.forEach(function (t) { trails[t.slug] = t.ids; });
  var $ = function (s) { return doc.querySelector(s); };
  var status = $('[data-pp-status]');
  var say = function (msg) { status.textContent = msg; };

  var storage = null;
  try { storage = root.localStorage; storage.setItem('hoc.pp.test', '1'); storage.removeItem('hoc.pp.test'); } catch (e) { storage = null; }
  if (!storage) {
    $('[data-pp-nostore]').hidden = false;
    Array.prototype.forEach.call(doc.querySelectorAll('[data-pp-needs-store]'), function (el) { el.disabled = true; });
  }
  var readAll = function () {
    var out = {};
    Object.keys(trails).forEach(function (slug) {
      var v = [];
      try { v = JSON.parse(storage.getItem('hoc.trail.' + slug) || '[]'); } catch (e) { v = []; }
      out[slug] = Array.isArray(v) ? v.filter(function (id) { return typeof id === 'string'; }) : [];
    });
    return out;
  };
  var writeAll = function (stamps) {
    try {
      Object.keys(stamps).forEach(function (slug) {
        if (stamps[slug].length) storage.setItem('hoc.trail.' + slug, JSON.stringify(stamps[slug]));
        else storage.removeItem('hoc.trail.' + slug);
      });
      return true;
    } catch (e) { return false; }
  };

  function draw() {
    var stamps = storage ? readAll() : {};
    var p = progress(stamps, trails);
    $('[data-pp-total]').textContent = p.done + ' of ' + p.total + ' stops discovered';
    meta.forEach(function (t) {
      var row = p.per[t.slug], card = doc.querySelector('[data-pp-trail="' + t.slug + '"]');
      card.querySelector('[data-pp-n]').textContent = row.n + ' of ' + row.of;
      card.querySelector('[data-pp-bar]').style.width = (row.of ? Math.round(100 * row.n / row.of) : 0) + '%';
      card.classList.toggle('pp-done', row.of > 0 && row.n === row.of);
      var older = card.querySelector('[data-pp-older]');
      older.hidden = !row.older;
      older.textContent = row.older === 1 ? 'Plus 1 stamp from a stop no longer on this trail' : 'Plus ' + row.older + ' stamps from stops no longer on this trail';
    });
    $('[data-pp-save]').disabled = !storage || !p.done;
    $('[data-pp-clear]').hidden = !p.done;
  }

  $('[data-pp-save]').addEventListener('click', function () {
    var file = JSON.stringify(exportPassport(readAll(), trails, new Date().toISOString()), null, 2);
    var a = doc.createElement('a');
    a.href = URL.createObjectURL(new Blob([file], { type: 'application/json' }));
    a.download = 'columbus-passport.json';
    doc.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    say('Saved columbus-passport.json. Load it on another phone or browser to carry your stamps over.');
  });

  $('[data-pp-load]').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (f.size > MAX_BYTES) { say('That file is too big to be a passport.'); return; }
    var r = new FileReader();
    r.onerror = function () { say('That file couldn’t be read.'); };
    r.onload = function () {
      var res = importPassport(String(r.result), trails, readAll());
      if (!res.ok) { say(res.error); return; }
      if (!writeAll(res.stamps)) { say('This browser wouldn’t save the stamps. Private browsing can block it.'); return; }
      draw();
      say((res.added ? 'Added ' + res.added + (res.added === 1 ? ' stamp.' : ' stamps.') : 'Nothing new in that file; you already had those stamps.') +
        (res.skipped ? ' Skipped ' + res.skipped + ' entr' + (res.skipped === 1 ? 'y' : 'ies') + ' this site doesn’t recognize.' : ''));
    };
    r.readAsText(f);
  });

  $('[data-pp-clear]').addEventListener('click', function () {
    if (!root.confirm('Clear every stamp on every trail in this browser? Save a copy first if you want to keep them.')) return;
    var empty = {};
    Object.keys(trails).forEach(function (slug) { empty[slug] = []; });
    writeAll(empty);
    draw();
    say('Passport cleared.');
  });

  if (storage) draw();
})(typeof window !== 'undefined' ? window : globalThis);

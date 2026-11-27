// Plan an event (/plan/<track>/): pick a business for each job, then share or
// print the list. Picks are kept in this browser only (localStorage, wrapped so
// a blocked store just means no memory). A shared link carries the picks in
// ?team=role.slug,role.slug and never overwrites someone's own list unless
// they choose to keep it.
(function () {
  var main = document.querySelector('[data-plan]');
  if (!main) return;
  var track = main.getAttribute('data-plan');
  var focused = main.hasAttribute('data-plan-focused');
  var KEY = 'hoc-plan-' + track;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  var load = function () { try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  var store = function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode: picks last this visit */ } };
  var picks = load();
  var viewing = null; // a shared team being looked at, not yet kept

  var roles = $$('.pl-role').map(function (s) { return { id: s.getAttribute('data-role'), label: s.getAttribute('data-role-label') }; });
  var roleLabel = function (r) { for (var i = 0; i < roles.length; i++) if (roles[i].id === r) return roles[i].label; return r; };
  var nameOf = function (slug) { var el = $('.pl-item[data-slug="' + slug + '"]'); return el ? el.getAttribute('data-name') : slug.replace(/-/g, ' '); };
  var has = function (list, r, s) { return list.some(function (p) { return p.r === r && p.s === s; }); };

  // Shared link
  var q = new URLSearchParams(location.search).get('team');
  if (q) {
    viewing = q.split(',').map(function (x) { var i = x.indexOf('.'); return { r: x.slice(0, i), s: x.slice(i + 1) }; })
      .filter(function (p) { return p.r && /^[a-z0-9-]+$/.test(p.s) && roles.some(function (r) { return r.id === p.r; }); });
    if (!viewing.length) viewing = null;
  }

  // Pick buttons
  $$('.pl-item').forEach(function (item) {
    var btn = $('[data-pick]', item);
    var role = item.closest('.pl-role').getAttribute('data-role');
    var slug = item.getAttribute('data-slug');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      if (has(picks, role, slug)) picks = picks.filter(function (p) { return !(p.r === role && p.s === slug); });
      else picks.push({ r: role, s: slug });
      store(picks);
      render();
    });
  });

  var bar = $('[data-plan-bar]'), dlg = $('[data-plan-team]'), list = $('[data-plan-list]'), none = $('[data-plan-none]');
  var openDlg = function () { if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', ''); };
  var closeDlg = function () { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };

  function render() {
    $$('.pl-item').forEach(function (item) {
      var btn = $('[data-pick]', item);
      var role = item.closest('.pl-role').getAttribute('data-role');
      var on = has(picks, role, item.getAttribute('data-slug'));
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? '✓ Picked' : '+ Pick for ' + roleLabel(role).toLowerCase();
    });
    var shown = viewing || picks;
    $('[data-plan-count]').textContent = String(picks.length);
    bar.hidden = !picks.length;
    $('[data-plan-shared]').hidden = !viewing;
    list.textContent = '';
    roles.forEach(function (r) {
      shown.filter(function (p) { return p.r === r.id; }).forEach(function (p) {
        var li = document.createElement('li');
        var b = document.createElement('strong'); b.textContent = r.label; li.appendChild(b);
        var vendor = focused && $('.pl-item[data-slug="' + p.s + '"] .focus-actions a[href]');
        var a = document.createElement(!focused || vendor ? 'a' : 'span');
        if (!focused) a.href = '/b/' + p.s + '/';
        if (vendor) {
          a.href = vendor.getAttribute('href');
          if (vendor.target === '_blank') { a.target = '_blank'; a.rel = 'noopener'; }
        }
        a.textContent = nameOf(p.s);
        li.appendChild(a);
        if (!viewing) {
          var x = document.createElement('button'); x.type = 'button'; x.className = 'pl-x'; x.textContent = '×';
          x.setAttribute('aria-label', 'Remove ' + nameOf(p.s));
          x.addEventListener('click', function () { picks = picks.filter(function (o) { return !(o.r === p.r && o.s === p.s); }); store(picks); render(); });
          li.appendChild(x);
        }
        list.appendChild(li);
      });
    });
    none.hidden = shown.length > 0;
  }

  $('[data-plan-open]').addEventListener('click', function () { viewing = null; render(); openDlg(); });
  $('[data-plan-close]').addEventListener('click', closeDlg);
  dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDlg(); });
  $('[data-plan-keep]').addEventListener('click', function () {
    picks = viewing; viewing = null; store(picks);
    history.replaceState(null, '', location.pathname);
    render();
  });
  $('[data-plan-clear]').addEventListener('click', function () { picks = []; viewing = null; store(picks); render(); });
  $('[data-plan-share]').addEventListener('click', function () {
    var team = (viewing || picks).map(function (p) { return p.r + '.' + p.s; }).join(',');
    var url = location.origin + location.pathname + (team ? '?team=' + team : '');
    var label = $('[data-plan-share] span');
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { label.textContent = 'Link copied'; setTimeout(function () { label.textContent = 'Share this team'; }, 2500); }, function () { label.textContent = url; });
    else label.textContent = url;
  });
  $('[data-plan-print]').addEventListener('click', function () {
    var sheet = document.createElement('div'); sheet.className = 'pl-print';
    var h = document.createElement('h1'); h.textContent = $('#pl-team-h').textContent; sheet.appendChild(h);
    sheet.appendChild(list.cloneNode(true));
    var f = document.createElement('p'); f.textContent = 'From heartofcolumbus: ' + location.origin + location.pathname; sheet.appendChild(f);
    document.body.appendChild(sheet);
    closeDlg();
    document.body.classList.add('pl-printing');
    setTimeout(function () { window.print(); document.body.classList.remove('pl-printing'); sheet.remove(); }, 50);
  });

  // Only businesses you can order, book or shop with online.
  var filter = $('[data-plan-direct]');
  filter.addEventListener('change', function () {
    main.classList.toggle('pl-direct-only', filter.checked);
    $$('.pl-role').forEach(function (s) {
      var any = $$('.pl-item[data-direct]', s).length > 0;
      var empty = $('.pl-empty', s);
      if (empty) empty.hidden = !filter.checked || any;
    });
  });

  render();
  if (viewing) openDlg();
})();

(function () {
  'use strict';

  var scope = location.pathname.match(/^\/apps\/(news|food|contractors)\//)?.[0];
  if (!scope) return;
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register(scope + 'sw.js', { scope: scope }).catch(function () {});
  }

  var button = document.querySelector('[data-app-install]');
  var hint = document.querySelector('[data-app-install-hint]');
  var inApp = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  var installPrompt;
  if (button && !inApp) {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      button.hidden = false;
    }
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      installPrompt = event;
      button.hidden = false;
      hint.hidden = true;
    });
    button.addEventListener('click', async function () {
      if (!installPrompt) {
        hint.hidden = !hint.hidden;
        button.setAttribute('aria-expanded', String(!hint.hidden));
        return;
      }
      var prompt = installPrompt;
      installPrompt = null;
      button.hidden = true;
      await prompt.prompt();
    });
    window.addEventListener('appinstalled', function () {
      button.hidden = true;
      hint.hidden = true;
    });
  }

  var search = document.querySelector('[data-app-search]');
  if (search) {
    var category = document.querySelector('[data-app-category]');
    var count = document.querySelector('[data-app-count]');
    var empty = document.querySelector('[data-app-empty]');
    var items = Array.from(document.querySelectorAll('[data-app-item]'), function (node) {
      return {
        node: node,
        text: normalize(node.dataset.search),
        categories: node.dataset.category.split(' '),
      };
    });
    function filter() {
      var tokens = normalize(search.value).split(/\s+/).filter(Boolean);
      var visible = 0;
      items.forEach(function (item) {
        var matches = (!category.value || item.categories.includes(category.value))
          && tokens.every(function (token) { return item.text.includes(token); });
        item.node.hidden = !matches;
        if (matches) visible++;
      });
      count.textContent = visible + (visible === 1 ? ' result' : ' results');
      empty.hidden = visible !== 0;
    }
    search.addEventListener('input', filter);
    category.addEventListener('change', filter);
    filter();
  }

  function normalize(value) {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  var dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  document.querySelectorAll('[data-app-menu]').forEach(function (details) {
    var panel = details.querySelector('[data-menu-content]');
    var state = '';
    details.addEventListener('toggle', async function () {
      if (!details.open || state) return;
      state = 'loading';
      panel.textContent = 'Loading menu…';
      try {
        var response = await fetch('/catalogs/' + encodeURIComponent(details.dataset.appMenu) + '.json');
        if (!response.ok) throw new Error('Menu unavailable');
        var menu = await response.json();
        if (!menu.ok || !menu.items?.length) throw new Error('Menu unavailable');

        var groups = new Map();
        menu.items.forEach(function (item) {
          var name = item.type || 'Menu';
          if (!groups.has(name)) groups.set(name, []);
          groups.get(name).push(item);
        });
        var content = document.createDocumentFragment();
        groups.forEach(function (items, name) {
          if (groups.size > 1) {
            var heading = document.createElement('h3');
            heading.textContent = name;
            content.append(heading);
          }
          var list = document.createElement('ul');
          items.forEach(function (item) {
            var row = document.createElement('li');
            var title = document.createElement('span');
            title.textContent = item.title;
            row.append(title);
            if (item.price != null && item.price !== '' && Number.isFinite(Number(item.price))) {
              var price = document.createElement('b');
              price.textContent = dollars.format(Number(item.price));
              row.append(price);
            }
            list.append(row);
          });
          content.append(list);
        });
        panel.replaceChildren(content);
        state = 'loaded';
      } catch {
        panel.textContent = 'Menu unavailable. Close and reopen to retry.';
        state = '';
      }
    });
  });
})();

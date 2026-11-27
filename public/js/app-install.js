(function () {
  'use strict';

  var scope = location.pathname.match(/^\/apps\/[a-z]+\//)?.[0];
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
    var items;
    function indexItems() {
      items = Array.from(document.querySelectorAll('[data-app-item]'), function (node) {
        return {
          node: node,
          text: normalize(node.dataset.search),
          categories: node.dataset.category.split(' '),
        };
      });
      filter();
    }
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
    indexItems();
    var events = document.querySelector('[data-app-events]');
    if (events) refreshEvents(events, category, indexItems);
  }

  function normalize(value) {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  }

  async function refreshEvents(list, category, onRender) {
    var status = document.querySelector('[data-app-event-status]');
    try {
      var response = await fetch('/api/events?days=31', { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Events unavailable');
      var data = await response.json();
      if (!Array.isArray(data.events) || !Array.isArray(data.sources)) throw new Error('Invalid event data');

      var names = new Map(Array.from(category.options, function (option) {
        return [option.value, option.textContent.trim()];
      }));
      var day = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
      var fragment = document.createDocumentFragment();
      data.events.forEach(function (event) {
        var source = names.get(event.src) || 'Events';
        var card = document.createElement('article');
        card.className = 'focus-card';
        card.dataset.appItem = '';
        card.dataset.category = event.src;
        card.dataset.search = [event.title, event.venue, source].filter(Boolean).join(' ');

        var label = document.createElement('p');
        label.className = 'focus-category';
        label.textContent = source;
        var title = document.createElement('h2');
        title.textContent = event.title;
        var when = document.createElement('p');
        when.textContent = day.format(new Date(event.date + 'T00:00:00Z')) + (event.when ? ' · ' + event.when : '');
        card.append(label, title, when);

        if (event.venue) {
          var venue = document.createElement('p');
          venue.className = 'focus-address';
          venue.textContent = event.venue;
          card.append(venue);
        }
        if (/^https?:\/\//i.test(event.url || '')) {
          var actions = document.createElement('div');
          actions.className = 'focus-actions';
          var details = document.createElement('a');
          details.className = 'focus-action focus-primary';
          details.href = event.url;
          details.target = '_blank';
          details.rel = 'noopener';
          details.textContent = 'Event details';
          actions.append(details);
          card.append(actions);
        }
        fragment.append(card);
      });

      list.replaceChildren(fragment);
      status.textContent = data.sources.some(function (source) { return !source.ok; })
        ? 'Some calendars could not be refreshed. Check with the organizer before heading out.'
        : '';
      status.hidden = !status.textContent;
      onRender();
    } catch {
      status.textContent = 'Could not refresh live calendars. Showing listings from the last site update.';
    }
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

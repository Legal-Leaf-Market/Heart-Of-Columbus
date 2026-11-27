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
    var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (ios) hint.textContent = 'In Safari, tap Share, then Add to Home Screen.';
    button.hidden = false;
    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      installPrompt = event;
      hint.hidden = true;
      button.setAttribute('aria-expanded', 'false');
    });
    button.addEventListener('click', async function () {
      if (installPrompt) {
        var prompt = installPrompt;
        installPrompt = null;
        try {
          await prompt.prompt();
          if ((await prompt.userChoice).outcome === 'accepted') button.hidden = true;
          return;
        } catch {
          // Show the browser’s menu instructions when the prompt is unavailable.
        }
      }
      hint.hidden = !hint.hidden;
      button.setAttribute('aria-expanded', String(!hint.hidden));
    });
    window.addEventListener('appinstalled', function () {
      button.hidden = true;
      hint.hidden = true;
    });
  }

  var panel = document.querySelector('[data-app-filters]');
  if (panel) {
    var results = document.querySelector('[data-app-results]');
    var search = panel.querySelector('[data-app-search]');
    var category = panel.querySelector('[data-app-category]');
    var sort = panel.querySelector('[data-app-sort]');
    var clear = panel.querySelector('[data-app-clear]');
    var count = document.querySelector('[data-app-count]');
    var empty = document.querySelector('[data-app-empty]');
    var chips = Array.from(panel.querySelectorAll('[data-app-chip]'));
    var selectedFacets = new Set();
    var track = '';
    var kind = panel.dataset.appFilters;
    var names = new Intl.Collator('en-US', { sensitivity: 'base', numeric: true });
    var items;

    function indexItems() {
      items = Array.from(results.children, function (node, index) {
        return {
          node: node, index: index,
          title: normalize(node.dataset.title || node.querySelector('h2').textContent),
          tags: normalize(node.dataset.tags || ''),
          text: normalize(node.dataset.search || ''),
          categories: (node.dataset.category || '').split(' '),
          tracks: (node.dataset.tracks || '').split(' '),
          facets: new Set((node.dataset.facets || '').split(' ')),
          rank: Number(node.dataset.rank || 0),
          day: node.dataset.date || '',
          until: node.dataset.until || node.dataset.date || '',
        };
      });
      render();
    }

    function browseOrder(a, b, mode) {
      if (mode === 'az' || mode === 'za') return (mode === 'za' ? -1 : 1) * names.compare(a.title, b.title);
      if (kind === 'events') return a.day.localeCompare(b.day) || a.index - b.index;
      if (kind === 'news') return b.day.localeCompare(a.day) || a.index - b.index;
      return b.rank - a.rank || names.compare(a.title, b.title) || a.index - b.index;
    }

    function render() {
      if (kind === 'weddings') {
        Array.from(category.options).forEach(function (option) {
          option.disabled = Boolean(track && option.value && !option.dataset.tracks.split(' ').includes(track));
        });
        if (category.selectedOptions[0]?.disabled) category.value = '';
      }

      var query = normalize(search.value);
      var tokens = query ? query.split(' ') : [];
      var active = Array.from(selectedFacets);
      var calendar = kind === 'events' && (selectedFacets.has('today') || selectedFacets.has('weekend')) ? calendarDates() : null;
      var matching = [];
      items.forEach(function (item) {
        var score = relevance(item, query, tokens);
        var show = score >= 0 && (!track || item.tracks.includes(track))
          && (!category.value || item.categories.includes(category.value))
          && active.every(function (facet) { return matchesFacet(item, facet, calendar); });
        if (item.node.hidden === show) item.node.hidden = !show;
        if (show) matching.push({ item: item, score: score });
      });

      matching.sort(function (a, b) {
        return (sort.value ? 0 : b.score - a.score) || browseOrder(a.item, b.item, sort.value);
      });
      var cursor = results.firstElementChild;
      matching.forEach(function (match) {
        var node = match.item.node;
        while (cursor?.hidden) cursor = cursor.nextElementSibling;
        if (node === cursor) cursor = cursor.nextElementSibling;
        else results.insertBefore(node, cursor);
      });

      chips.forEach(function (chip) {
        var value = chip.dataset.value;
        var type = chip.dataset.appChip;
        var pressed = type === 'facet' ? selectedFacets.has(value) : value === (type === 'track' ? track : category.value);
        chip.setAttribute('aria-pressed', String(pressed));
      });
      clear.hidden = !(search.value || category.value || track || active.length || sort.value);
      count.textContent = matching.length + (matching.length === 1 ? ' result' : ' results');
      empty.hidden = matching.length !== 0;
      if (kind === 'weddings') document.dispatchEvent(new Event('planner:results'));
    }

    search.addEventListener('input', render);
    category.addEventListener('change', render);
    sort.addEventListener('change', render);
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var type = chip.dataset.appChip;
        var value = chip.dataset.value;
        if (type === 'track') track = value;
        else if (type === 'category') category.value = value;
        else if (!selectedFacets.delete(value)) {
          if (value === 'today') selectedFacets.delete('weekend');
          if (value === 'weekend') selectedFacets.delete('today');
          selectedFacets.add(value);
        }
        render();
      });
    });
    clear.addEventListener('click', function () {
      search.value = category.value = sort.value = track = '';
      selectedFacets.clear();
      render();
      search.focus();
    });
    indexItems();
    if (kind === 'events') refreshEvents(results, category, indexItems);
  }

  function normalize(value) {
    return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
      .replace(/[’']/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }

  function relevance(item, query, tokens) {
    if (!query) return 0;
    if (!tokens.every(function (token) { return item.text.includes(token); })) return -1;
    if (item.title === query) return 100;
    if (item.title.startsWith(query)) return 80;
    if (item.title.includes(query)) return 65;
    if (tokens.every(function (token) { return item.title.includes(token); })) return 55;
    if (item.tags.includes(query)) return 35;
    return tokens.reduce(function (score, token) {
      return score + (item.title.includes(token) ? 5 : item.tags.includes(token) ? 2 : 0);
    }, 0);
  }

  function calendarDates() {
    var local = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Indiana/Indianapolis', year: 'numeric', month: '2-digit', day: '2-digit',
    }).formatToParts(new Date());
    var parts = Object.fromEntries(local.map(function (part) { return [part.type, part.value]; }));
    var today = parts.year + '-' + parts.month + '-' + parts.day;
    var day = new Date(today + 'T12:00:00Z');
    var weekday = day.getUTCDay();
    day.setUTCDate(day.getUTCDate() + (weekday === 0 ? -1 : 6 - weekday));
    var saturday = day.toISOString().slice(0, 10);
    day.setUTCDate(day.getUTCDate() + 1);
    return { today: today, saturday: saturday, sunday: day.toISOString().slice(0, 10) };
  }

  function matchesFacet(item, facet, calendar) {
    if (facet === 'today') return item.day <= calendar.today && item.until >= calendar.today;
    if (facet === 'weekend') return item.day <= calendar.sunday && item.until >= calendar.saturday;
    return item.facets.has(facet);
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
        card.dataset.title = event.title;
        card.dataset.tags = source;
        card.dataset.date = event.date;
        card.dataset.until = event.until || event.date;
        if (event.live) card.dataset.facets = 'music';
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
    async function loadMenu() {
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
    }
    details.addEventListener('toggle', loadMenu);
    if (details.open) loadMenu();
  });
})();

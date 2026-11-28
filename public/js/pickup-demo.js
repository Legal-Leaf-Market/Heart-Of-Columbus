(function () {
  'use strict';

  const picker = document.querySelector('[data-pd-picker]');
  if (picker) {
    const search = picker.querySelector('#pd-business-search');
    const sourced = picker.querySelector('[data-pd-sourced]');
    const select = picker.querySelector('select');
    const submit = picker.querySelector('button');
    const status = picker.querySelector('[data-pd-results]');
    const [placeholder, ...choices] = select.options;
    const key = text => text.normalize('NFD').replace(/\p{M}|[’']/gu, '').toLowerCase();
    const indexed = choices.map(option => ({
      option, name: key(option.textContent + ' ' + option.value.replace(/-/g, ' ')),
    }));
    const sourcedCount = choices.filter(option => option.hasAttribute('data-sourced')).length;
    for (const control of picker.querySelectorAll('[data-pd-filter]')) control.hidden = false;

    function filter() {
      const previous = select.value;
      const words = key(search.value).trim().split(/\s+/).filter(Boolean);
      const matches = indexed.filter(({ option, name }) =>
        (!sourced.checked || option.hasAttribute('data-sourced')) && words.every(word => name.includes(word)));
      select.replaceChildren(placeholder, ...matches.map(({ option }) => option));
      select.value = matches.some(({ option }) => option.value === previous) ? previous
        : matches.length === 1 ? matches[0].option.value : '';
      select.disabled = submit.disabled = matches.length === 0;
      status.textContent = !sourced.checked && !words.length ? sourcedCount + ' demos with sourced menus or catalogs.'
        : matches.length === 1 ? '1 business matches.' : matches.length ? matches.length + ' businesses match.' : 'No businesses match.';
    }
    search.addEventListener('input', filter);
    sourced.addEventListener('change', filter);
    picker.addEventListener('submit', event => {
      event.preventDefault();
      if (select.value) location.href = '/pickup/demo/' + encodeURIComponent(select.value) + '/';
    });
    filter();
    return;
  }

  const root = document.querySelector('[data-pd]');
  if (!root) return;
  const menu = JSON.parse(document.getElementById('page-data').textContent);
  const start = root.querySelector('[data-pd-start]');
  const session = root.querySelector('[data-pd-session]');
  const content = root.querySelector('[data-pd-content]');
  const message = root.querySelector('[data-pd-message]');
  const startButton = root.querySelector('[data-action="start"]');
  const copyButton = root.querySelector('[data-action="copy"]');
  const isTablet = new URLSearchParams(location.search).get('view') === 'tablet';
  const base = location.pathname;
  const storageKey = 'hoc-pickup-demo:' + menu.slug;
  const validKey = /^[a-f0-9]{32}$/;
  const labels = { new: 'Waiting for acceptance', accepted: 'Preparing', ready: 'Ready for pickup', collected: 'Picked up', declined: 'Declined' };
  const cart = new Map();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const clock = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Indiana/Indianapolis', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const parts = Object.fromEntries(clock.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  let pickup = [days.indexOf(parts.weekday), Number(parts.hour) * 60 + Number(parts.minute)];
  let coupon = '';
  let room = new URLSearchParams(location.hash.slice(1)).get('session');
  if (!validKey.test(room || '')) room = sessionStorage.getItem(storageKey);
  let submitting = false;
  let pendingId = '';
  let ticketId = '';
  let visibleTickets = '';
  let polling = false;
  let connectionLost = false;
  let timer;
  let wakeLock;
  let audio;

  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const formatPrice = cents => money.format(cents / 100);
  const randomKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
  const ticketCode = ticket => ticket.id.slice(0, 6).toUpperCase();
  const roomLink = tablet => base + (tablet ? '?view=tablet' : '') + '#session=' + room;

  function say(text) { message.textContent = text; }

  async function api(action, qr = '') {
    const request = { headers: { 'x-hoc-demo': room }, cache: 'no-store' };
    if (action) {
      request.method = 'POST';
      request.headers['content-type'] = 'application/json';
      request.body = JSON.stringify(action);
    }
    const response = await fetch('/api/pickup-demo?business=' + encodeURIComponent(menu.slug) + (qr ? '&qr=' + qr : ''), request);
    const data = await response.json();
    if (!response.ok) throw Object.assign(new Error(data.error), { status: response.status });
    return data;
  }

  // Size-indexed prices use the first choice group.
  const optionPrice = (adjustment, choices) => Array.isArray(adjustment) ? (adjustment[choices[0]] ?? adjustment[0]) : adjustment;
  const priceSuffix = cents => cents ? ' (+' + formatPrice(cents) + ')' : '';

  function describe(id, choices = []) {
    const [name, cents, , groups] = menu.items[id] || ['Unavailable demo item', 0];
    const details = [];
    let price = cents;
    (groups || []).forEach(([label, options, showDefault, multiple], i) => {
      const selection = choices[i];
      const indices = multiple ? (Array.isArray(selection) ? selection : []) : [selection ?? 0];
      const names = [];
      for (const index of indices) {
        const option = options[index];
        if (!option) continue;
        price += optionPrice(option[1], choices);
        if (multiple || index || showDefault) names.push(option[0]);
      }
      if (names.length) details.push((label === 'Leave out' ? 'No ' : label + ': ') + names.join(', '));
    });
    return { name, price, details };
  }

  function lineLabel({ name, details }, qty) {
    return '<span>' + qty + ' × ' + escape(name) +
      (details.length ? '<small class="pd-line-detail">' + details.map(detail => '<span>' + escape(detail) + '</span>').join('') + '</small>' : '') + '</span>';
  }

  function orderLines(lines) {
    return lines.map(([id, qty, choices]) => {
      const item = describe(id, choices);
      return '<li>' + lineLabel(item, qty) + '<b>' + formatPrice(qty * item.price) + '</b></li>';
    }).join('');
  }

  const subtotal = lines => lines.reduce((sum, [id, qty, choices]) => sum + describe(id, choices).price * qty, 0);

  const coupons = {
    HOCDEMO10: { minimum: 2000, discount: cents => Math.round(cents / 10) },
    HOCDEMO5: { minimum: 3500, discount: () => 500 },
  };
  const hasSchedule = menu.items.some(item => item[4]);
  const twoDigit = n => String(n).padStart(2, '0');
  const timeValue = minutes => twoDigit(Math.floor(minutes / 60)) + ':' + twoDigit(minutes % 60);

  function isAvailable(id) {
    const schedule = menu.items[id]?.[4];
    return !schedule || (schedule.days.includes(pickup[0]) && pickup[1] >= schedule.start && pickup[1] < schedule.end);
  }

  function priceSummary(lines, code) {
    const before = subtotal(lines);
    const offer = Object.hasOwn(coupons, code) ? coupons[code] : null;
    const discount = offer && before >= offer.minimum ? offer.discount(before) : 0;
    return { before, discount, total: before - discount };
  }

  function ticketSummary(ticket) {
    const { discount, total } = priceSummary(ticket.lines, ticket.coupon);
    const time = ticket.pickup ? 'Demo pickup · ' + days[ticket.pickup[0]] + ' ' + timeValue(ticket.pickup[1]) + ' Columbus time' : '';
    return (time ? '<p>' + escape(time) + '</p>' : '') +
      (discount ? '<p>Sample coupon ' + escape(ticket.coupon) + ' saved ' + formatPrice(discount) + '</p>' : '') +
      '<p class="pd-total">' + (discount ? 'Demo subtotal after discount' : 'Demo subtotal') +
      ' <strong>' + formatPrice(total) + '</strong></p>';
  }

  function drawCart() {
    const lines = [...cart];
    const { before, discount, total } = priceSummary([...cart.values()], coupon);
    const unavailable = lines.some(([, [id]]) => !isAvailable(id));
    const blocked = Boolean(pendingId) || submitting;
    const message = content.querySelector('[data-cart-availability]');
    message.hidden = !unavailable;
    if (menu.demoCoupon) {
      content.querySelector('[data-discount]').hidden = !discount;
      content.querySelector('[data-discount] strong').textContent = formatPrice(discount);
      content.querySelector('[data-total-after]').hidden = !discount;
      content.querySelector('[data-total-after] strong').textContent = formatPrice(total);
      content.querySelector('[data-coupon-status]').textContent = coupon ?
        (discount ? 'Sample coupon applied.' : 'This sample coupon needs a ' + formatPrice(coupons[coupon].minimum) + ' subtotal.') : '';
      content.querySelector('[data-coupon]').disabled = blocked;
      content.querySelector('[data-action="coupon"]').disabled = blocked;
    }
    if (hasSchedule) content.querySelectorAll('[data-pickup-slot]').forEach(control => { control.disabled = blocked; });
    content.querySelector('[data-cart-total]').textContent = formatPrice(before);
    content.querySelector('[data-cart-link]').textContent = 'View cart · ' + formatPrice(total);
    content.querySelector('[data-cart-lines]').innerHTML = lines.length ? lines.map(([key, [id, qty, choices]]) => {
      const item = describe(id, choices);
      return '<li>' + lineLabel(item, qty) + '<button type="button" aria-label="Remove one ' + escape([item.name, ...item.details].join(', ')) +
        '" data-action="remove" data-line="' + escape(key) + '">Remove one</button></li>';
    }).join('') : '<li>Your cart is empty.</li>';
    content.querySelector('[data-action="order"]').disabled = !lines.length || submitting || unavailable;
  }

  function menuRow({ item: [name, , , groups], id }) {
    const details = groups?.length ? '<details class="pd-choices"><summary>Customize ' + escape(name) + '</summary>' +
      groups.map(([label, options, , multiple], group) => {
        if (multiple) return '<fieldset class="pd-choice pd-choice-checks" data-checks="' + group + '"><legend>' + escape(label) + '</legend>' +
          options.map(([option, adjustment], index) => '<label><input type="checkbox" value="' + index + '">' +
            escape(option) + '<span data-option-price>' + priceSuffix(optionPrice(adjustment, [])) + '</span></label>').join('') + '</fieldset>';
        const control = 'pd-choice-' + id + '-' + group;
        return '<div class="pd-choice"><label for="' + control + '">' + escape(label) +
          '</label><select id="' + control + '" data-choice>' +
          options.map(([option, adjustment], index) => '<option value="' + index + '">' + escape(option) +
            priceSuffix(adjustment) + '</option>').join('') + '</select></div>';
      }).join('') + '</details>' : '';
    const availability = menu.items[id][4];
    const timing = availability ? '<small class="pd-line-detail">' + escape(availability.label) +
      '</small><small class="pd-line-detail" data-item-availability></small>' : '';
    return '<li data-menu-item data-id="' + id + '"><div class="pd-item-name"><span>' + escape(name) + '</span>' + timing + details +
      '<small class="pd-line-detail" data-selection>' + escape(describe(id).details.join(' · ')) + '</small></div><b data-item-price>' +
      formatPrice(describe(id).price) + '</b><button type="button" data-action="add" aria-label="Add ' + escape(name) +
      '">Add</button></li>';
  }

  const selections = row => [...row.querySelectorAll('[data-choice], [data-checks]')].map(control =>
    control.matches('select') ? Number(control.value) : [...control.querySelectorAll('input:checked')].map(input => Number(input.value)));

  function pickupControls() {
    if (!hasSchedule) return '';
    return '<fieldset class="pd-slot"><legend>Try a pickup day and time</legend>' +
      '<label>Day <select data-pickup-slot data-day>' +
      days.map((day, i) => '<option value="' + i + '"' + (i === pickup[0] ? ' selected' : '') + '>' + day + '</option>').join('') +
      '</select></label><label>Columbus time <input data-pickup-slot data-time type="time" value="' + timeValue(pickup[1]) +
      '"></label></fieldset>';
  }

  function filterMenu() {
    const search = content.querySelector('#pd-filter').value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const section = content.querySelector('[data-section]').value;
    const customizable = content.querySelector('[data-customizable]').checked;
    const available = content.querySelector('[data-available]')?.checked;
    let count = 0;
    for (const group of content.querySelectorAll('[data-menu-section]')) {
      let matches = 0;
      for (const row of group.querySelectorAll('[data-menu-item]')) {
        const id = Number(row.dataset.id);
        const [name, , category, options, schedule] = menu.items[id];
        const text = [name, category, ...(options || []).flatMap(([label, values]) => [label, ...values.map(([option]) => option)])].join(' ').toLowerCase();
        const eligible = isAvailable(id);
        row.hidden = Boolean((section && category !== section) || (customizable && !options?.length) ||
          (available && !eligible) || !search.every(word => text.includes(word)));
        if (!row.hidden) matches++;
        if (schedule) {
          row.querySelector('[data-action="add"]').disabled = !eligible;
          row.querySelector('[data-item-availability]').textContent = eligible ? 'Available at demo time' : 'Outside selected pickup time';
        }
      }
      group.hidden = !matches;
      count += matches;
    }
    content.querySelector('[data-menu-empty]').hidden = Boolean(count);
    content.querySelector('[data-menu-count]').textContent = count + (count === 1 ? ' item' : ' items');
  }

  function drawMenu() {
    const sections = new Map();
    menu.items.forEach((item, id) => {
      const section = item[2];
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push({ item, id });
    });
    content.innerHTML = '<button type="button" class="pd-cart-link" data-cart-link data-action="view-cart">View cart</button><div class="pd-shop"><section><h2>Shopper menu</h2><p>' + escape(menu.kind) +
      (menu.source ? ' · <a href="' + escape(menu.source) + '" rel="noreferrer">View source</a>' : '') + '</p>' +
      pickupControls() +
      '<div class="pd-filters"><label for="pd-filter">Find an item or option</label><input id="pd-filter" type="search" placeholder="Try a dish or topping">' +
      '<label>Menu section <select data-section><option value="">All sections</option>' +
      [...sections.keys()].map(name => '<option>' + escape(name) + '</option>').join('') + '</select></label>' +
      '<label class="pd-filter-check"><input type="checkbox" data-customizable> Customizable items</label>' +
      (hasSchedule ? '<label class="pd-filter-check"><input type="checkbox" data-available> Available at demo time</label>' : '') +
      '<p data-menu-count role="status"></p></div>' +
      [...sections].map(([name, rows]) => '<section data-menu-section><h3>' + escape(name) + '</h3><ul class="pd-items">' +
        rows.map(menuRow).join('') + '</ul></section>').join('') +
      '<p data-menu-empty hidden>No items match that search.</p></section>' +
      '<aside class="pd-card" id="pd-cart" tabindex="-1"><h2>Your pickup cart</h2><ul data-cart-lines class="pd-items"></ul>' +
      '<p class="pd-total">Demo subtotal <strong data-cart-total></strong></p>' +
      (menu.demoCoupon ? '<div class="pd-coupon"><label for="pd-coupon">Sample coupon</label><div><input data-coupon id="pd-coupon" autocomplete="off" maxlength="20" placeholder="Try HOCDEMO10">' +
        '<button type="button" data-action="coupon">Apply</button></div><p>HOCDEMO10 takes 10% off $20. HOCDEMO5 takes $5 off $35. One sample code per order.</p><p data-coupon-status role="status"></p></div>' +
        '<p class="pd-total" data-discount hidden>Sample discount <strong></strong></p>' +
        '<p class="pd-total" data-total-after hidden>Demo subtotal after discount <strong></strong></p>' : '') +
      '<p data-cart-availability hidden>Change the pickup time or remove items that are unavailable.</p>' +
      '<button type="button" data-action="order" class="pd-primary">Send test order</button><p>Simulated pay at pickup</p>' +
      '<div data-ticket aria-live="polite"></div></aside></div>';
    content.querySelector('#pd-filter').addEventListener('input', filterMenu);
    content.querySelector('.pd-filters').addEventListener('change', filterMenu);
    content.querySelector('.pd-slot')?.addEventListener('change', () => {
      const value = content.querySelector('[data-time]').value;
      if (!value) {
        content.querySelector('[data-time]').value = timeValue(pickup[1]);
        return;
      }
      const [hour, minute] = value.split(':').map(Number);
      pickup = [Number(content.querySelector('[data-day]').value), hour * 60 + minute];
      filterMenu();
      drawCart();
    });
    filterMenu();
    content.addEventListener('change', updateChoice);
    drawCart();
  }

  function updateChoice(event) {
    const row = event.target.closest('[data-menu-item]');
    if (!row) return;
    const id = Number(row.dataset.id);
    const choices = selections(row);
    const item = describe(id, choices);
    row.querySelector('[data-item-price]').textContent = formatPrice(item.price);
    row.querySelector('[data-selection]').textContent = item.details.join(' · ');
    for (const group of row.querySelectorAll('[data-checks]')) {
      const [, options] = menu.items[id][3][Number(group.dataset.checks)];
      group.querySelectorAll('[data-option-price]').forEach((price, index) => {
        price.textContent = priceSuffix(optionPrice(options[index][1], choices));
      });
    }
  }

  function showTicket(ticket) {
    const box = content.querySelector('[data-ticket]');
    if (!box || !ticket) return;
    const text = 'Test order ' + ticketCode(ticket) + ' · ' + labels[ticket.status] +
      (ticket.status === 'accepted' && !ticket.pickup ? ' · Around ' + new Date(ticket.readyAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '');
    if (box.dataset.ticketState === text) return;
    box.dataset.ticketState = text;
    box.innerHTML = '<p>' + escape(text) + '</p><ul class="pd-items">' + orderLines(ticket.lines) +
      '</ul>' + ticketSummary(ticket);
  }

  function ring() {
    if (audio?.state !== 'running') return;
    [784, 1046, 1318].forEach((frequency, i) => {
      const start = audio.currentTime + i * 0.14;
      const tone = audio.createOscillator();
      const volume = audio.createGain();
      tone.frequency.value = frequency;
      volume.gain.setValueAtTime(0.15, start);
      volume.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      tone.connect(volume).connect(audio.destination);
      tone.start(start);
      tone.stop(start + 0.3);
    });
  }

  async function keepAwake() {
    if (navigator.wakeLock && !document.hidden && !wakeLock) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => { wakeLock = null; });
      } catch { /* Screen sleep settings remain available on the tablet. */ }
    }
  }

  function ticketActions(ticket) {
    const button = (status, text) => '<button type="button" data-action="advance" data-status="' + status + '">' + text + '</button>';
    if (ticket.status === 'new') {
      return '<label>Prep time <select data-prep>' + [10, 15, 20, 30, 45].map(minutes =>
        '<option value="' + minutes + '"' + (minutes === 15 ? ' selected' : '') + '>' + minutes + ' min</option>').join('') +
        '</select></label>' + button('accepted', 'Accept') + button('declined', 'Decline');
    }
    if (ticket.status === 'accepted') return button('ready', 'Mark ready') + button('declined', 'Decline');
    if (ticket.status === 'ready') return button('collected', 'Picked up');
    return '';
  }

  function drawQueue(tickets) {
    const queue = content.querySelector('[data-queue]');
    const old = new Map([...queue.querySelectorAll('[data-ticket-id]')].map(card => [card.dataset.ticketId, card]));
    const newTicket = visibleTickets !== '' && tickets.some(ticket => ticket.status === 'new' && !old.has(ticket.id));
    const signature = JSON.stringify(tickets);
    if (visibleTickets === signature) return;
    visibleTickets = signature;
    for (const ticket of tickets) {
      const previous = old.get(ticket.id);
      if (previous?.dataset.state === ticket.status) continue;
      const card = document.createElement('article');
      card.className = 'pd-card';
      card.dataset.ticketId = ticket.id;
      card.dataset.state = ticket.status;
      card.innerHTML = '<p class="pd-state">' + labels[ticket.status] + '</p><h3>Order ' + ticketCode(ticket) + '</h3>' +
        '<ul class="pd-items">' + orderLines(ticket.lines) + '</ul>' + ticketSummary(ticket) + '<div class="pd-ticket-actions">' + ticketActions(ticket) + '</div>';
      if (previous) previous.replaceWith(card);
      else queue.prepend(card);
    }
    content.querySelector('[data-queue-empty]').hidden = Boolean(tickets.length);
    if (newTicket) { say('New test order received.'); ring(); }
  }

  async function refresh() {
    if (polling || !room || session.hidden || submitting) return;
    polling = true;
    try {
      const { tickets } = await api();
      if (isTablet) drawQueue(tickets);
      else showTicket(tickets.find(ticket => ticket.id === ticketId));
      if (connectionLost) say('Demo connection restored.');
      connectionLost = false;
    } catch (error) {
      if (error.status === 410) {
        clearInterval(timer);
        sessionStorage.removeItem(storageKey);
        history.replaceState(null, '', base + location.search);
        room = '';
        cart.clear();
        coupon = '';
        pendingId = '';
        ticketId = '';
        session.hidden = true;
        start.hidden = false;
        startButton.disabled = false;
        say(error.message);
      } else {
        connectionLost = true;
        say('Demo disconnected. Reconnecting…');
      }
    } finally { polling = false; }
  }

  function openSession() {
    sessionStorage.setItem(storageKey, room);
    history.replaceState(null, '', roomLink(isTablet));
    start.hidden = true;
    session.hidden = false;
    root.querySelector('#pd-qr').hidden = true;
    const qrButton = root.querySelector('[data-action="qr"]');
    qrButton.textContent = 'Show QR code';
    qrButton.setAttribute('aria-expanded', 'false');
    const shopper = root.querySelector('[data-pd-shopper]');
    const tablet = root.querySelector('[data-pd-tablet]');
    shopper.href = roomLink(false);
    tablet.href = roomLink(true);
    (isTablet ? tablet : shopper).setAttribute('aria-current', 'page');
    copyButton.textContent = isTablet ? 'Copy shopper link' : 'Copy tablet link';
    if (isTablet) {
      visibleTickets = '';
      content.innerHTML = '<div class="pd-section-head"><h2>Counter queue</h2><button type="button" data-action="sound">Enable order chime</button></div>' +
        '<p data-queue-empty>Waiting for a test order. Open the shopper link on your phone and send a cart.</p><div class="pd-queue" data-queue></div>';
      keepAwake();
    } else {
      ticketId = sessionStorage.getItem('hoc-pickup-ticket:' + room) || '';
      drawMenu();
    }
    refresh();
    clearInterval(timer);
    timer = setInterval(() => { if (!document.hidden) refresh(); }, isTablet ? 3000 : 4000);
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !session.hidden) {
      if (isTablet) keepAwake();
      refresh();
    }
  });

  root.addEventListener('click', async event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'start') {
      button.disabled = true;
      room ||= randomKey();
      try { await api({ action: 'start' }); say(''); openSession(); }
      catch (error) { say(error.message); }
      finally { button.disabled = false; }
      return;
    }
    if (action === 'copy') {
      const link = new URL(roomLink(!isTablet), location.origin).href;
      try { await navigator.clipboard.writeText(link); say('Link copied.'); }
      catch { window.prompt('Copy the demo link', link); }
      return;
    }
    if (action === 'view-cart') {
      root.querySelector('#pd-cart').focus();
      return;
    }
    if (action === 'qr') {
      const panel = root.querySelector('#pd-qr');
      if (!panel.hidden) {
        panel.hidden = true;
        button.textContent = 'Show QR code';
        button.setAttribute('aria-expanded', 'false');
        return;
      }
      button.disabled = true;
      const view = isTablet ? 'shopper' : 'tablet';
      try {
        const { image } = await api(null, view);
        const img = document.createElement('img');
        img.src = image;
        img.width = img.height = 240;
        img.alt = 'QR code for the ' + view + ' view';
        panel.replaceChildren(img);
        panel.hidden = false;
        button.textContent = 'Hide QR code';
        button.setAttribute('aria-expanded', 'true');
      } catch (error) { say(error.message); }
      finally { button.disabled = false; }
      return;
    }
    if (action === 'sound') {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        audio ||= new Audio();
        await audio.resume();
        ring();
        button.textContent = 'Order chime on';
        button.disabled = true;
      } catch { say('Sound is unavailable on this device.'); }
      return;
    }
    if (submitting) return;
    if (action === 'coupon') {
      if (pendingId) return;
      const code = content.querySelector('[data-coupon]').value.trim().toUpperCase();
      coupon = Object.hasOwn(coupons, code) ? code : '';
      drawCart();
      if (code && !coupon) content.querySelector('[data-coupon-status]').textContent = 'Sample code not recognized.';
      return;
    }
    if (action === 'add' || action === 'remove') {
      if (pendingId) { say('Retry the pending test order before changing this cart.'); return; }
      const row = button.closest('[data-menu-item]');
      if (row && !isAvailable(Number(row.dataset.id))) return;
      const choices = row ? selections(row) : [];
      const key = row ? JSON.stringify([row.dataset.id, choices]) : button.dataset.line;
      const previousLine = cart.get(key);
      if (!row && !previousLine) return;
      const [id, previous, picked = []] = previousLine || [Number(row.dataset.id), 0, choices];
      const qty = previous + (action === 'add' ? 1 : -1);
      if (qty > 12 || (!cart.has(key) && cart.size >= 24)) { say('This demo cart has reached its item limit.'); return; }
      if (qty > 0) cart.set(key, picked.length ? [id, qty, picked] : [id, qty]);
      else cart.delete(key);
      drawCart();
      const item = describe(id, picked);
      say(qty > 0 ? qty + ' in cart: ' + [item.name, ...item.details].join(', ') : 'Removed from cart.');
      return;
    }
    if (action !== 'order' && action !== 'advance') return;
    submitting = true;
    button.disabled = true;
    try {
      if (action === 'order') {
        pendingId ||= randomKey();
        const lines = [...cart.values()];
        drawCart();
        const { ticket } = await api({
          action, id: pendingId, lines,
          ...(hasSchedule ? { pickup } : {}),
          ...(priceSummary(lines, coupon).discount ? { coupon } : {}),
        });
        ticketId = ticket.id;
        sessionStorage.setItem('hoc-pickup-ticket:' + room, ticketId);
        pendingId = '';
        cart.clear();
        coupon = '';
        const couponField = content.querySelector('[data-coupon]');
        if (couponField) couponField.value = '';
        showTicket(ticket);
      } else {
        const card = button.closest('[data-ticket-id]');
        await api({ action: 'update', id: card.dataset.ticketId, status: button.dataset.status, minutes: Number(card.querySelector('[data-prep]')?.value) });
      }
      say('');
    } catch (error) {
      if (error.status && error.status < 500) pendingId = '';
      say(error.message);
    } finally {
      submitting = false;
      button.disabled = false;
      if (!isTablet) drawCart();
      refresh();
    }
  });

  if (validKey.test(room || '')) openSession();
})();

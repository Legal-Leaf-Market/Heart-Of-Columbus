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
  const startMessage = root.querySelector('[data-pd-start-message]');
  const startButton = root.querySelector('[data-action="start"]');
  const copyButton = root.querySelector('[data-action="copy"]');
  const view = new URLSearchParams(location.search).get('view');
  const isDriver = view === 'driver' && Boolean(menu.deliveryDemo);
  const isTablet = view === 'tablet' || isDriver;
  if (isTablet) root.dataset.counter = '';
  const base = location.pathname;
  const storageKey = 'hoc-pickup-demo:' + menu.slug;
  const validKey = /^[a-f0-9]{32}$/;
  const labels = { new: 'Waiting for acceptance', accepted: 'Preparing', ready: 'Ready for pickup', collected: 'Picked up', declined: 'Declined' };
  const parcelLabels = {
    assigned: 'Driver assigned', picked_up: 'Out for delivery', handed_off: 'Delivered',
    failed: 'Delivery attempt failed', cancelled: 'Delivery cancelled', rescheduled: 'Delivery rescheduled',
  };
  const ticketStatus = ticket => ticket.delivery?.job?.status || ticket.delivery?.status || ticket.status;
  const ticketLabel = ticket => parcelLabels[ticketStatus(ticket)] ||
    (ticket.delivery && ticket.status === 'ready' ? 'Ready for dispatch' : labels[ticket.status]);
  const cart = new Map();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const deliveryClock = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Indiana/Indianapolis', hour: 'numeric', minute: '2-digit',
  });
  const clock = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Indiana/Indianapolis', weekday: 'long', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  });
  const parts = Object.fromEntries(clock.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  let pickup = [days.indexOf(parts.weekday), Number(parts.hour) * 60 + Number(parts.minute)];
  let coupon = '';
  let dropoff = '';
  const fragment = new URLSearchParams(location.hash.slice(1));
  let room = fragment.get('session');
  if (!validKey.test(room || '')) room = sessionStorage.getItem(storageKey);
  const secretStorage = (session, driver = false) => storageKey + ':' + session + (driver ? ':driver' : ':dispatch');
  let staffKey = fragment.get('staff') || sessionStorage.getItem(secretStorage(room, isDriver));
  if (!validKey.test(staffKey || '')) staffKey = '';
  let driverLinks = {};
  let submitting = false;
  let pendingId = '';
  let ticketId = '';
  let visibleTickets = '';
  let queueView = 'active';
  let cartObserver;
  let feedbackTimer;
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
  const roomLink = (tablet, driver) => base + (driver !== undefined ? '?view=driver' : tablet ? '?view=tablet' : '') +
    '#session=' + room + (driver ? '&staff=' + driver : tablet && !isDriver && staffKey ? '&staff=' + staffKey : '');
  const orderOptions = (options, selected) => Object.entries(options).map(([key, label]) =>
    '<option value="' + escape(key) + '"' + (key === selected ? ' selected' : '') + '>' + escape(label) + '</option>').join('');
  const draftKey = () => storageKey + ':draft:' + room;

  function saveCart() {
    sessionStorage.setItem(draftKey(), JSON.stringify({ lines: [...cart], coupon, pickup, pendingId, dropoff }));
  }

  function say(text) {
    clearTimeout(feedbackTimer);
    message.textContent = text;
    if (text.startsWith('Removed') || / in cart:|Link copied|New test order received/.test(text)) {
      feedbackTimer = setTimeout(() => { message.textContent = ''; }, 2800);
    }
  }

  async function api(action, qr = '') {
    const request = { headers: { 'x-hoc-demo': room }, cache: 'no-store', signal: AbortSignal.timeout(10000) };
    if (staffKey && (isTablet || action?.action === 'start' || qr === 'tablet')) request.headers['x-hoc-demo-staff'] = staffKey;
    if (action) {
      request.method = 'POST';
      request.headers['content-type'] = 'application/json';
      request.body = JSON.stringify(action);
    }
    const response = await fetch('/api/pickup-demo?business=' + encodeURIComponent(menu.slug) + (qr ? '&qr=' + qr : ''), request);
    const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    if (!response.ok || !data) {
      throw Object.assign(new Error(data?.error || 'The demo service is unavailable. Try again in a moment.'), { status: response.status });
    }
    return data;
  }

  // Size-indexed prices use the first choice group.
  const optionPrice = (adjustment, choices) => Array.isArray(adjustment) ? (adjustment[choices[0]] ?? adjustment[0]) : adjustment;
  const priceSuffix = cents => cents ? ' (+' + formatPrice(cents) + ')' : '';

  const partsOfPizza = ['', 'Whole', 'Half 1', 'Half 2'];
  const toppingPositions = ['None', ...partsOfPizza.slice(1)];
  const pizzaId = menu.items.findIndex(item => item[0] === 'Build Your Own Pizza' &&
    item[3]?.some(group => group[3] === 'placement'));

  function chosenOptions(mode, selection) {
    const list = Array.isArray(selection) ? selection : [];
    if (mode === 'placement') return list.map(code => [Math.floor(code / 4), 1, partsOfPizza[code % 4]]);
    if (mode === 'count') return list.map(code => [Math.floor(code / 16), code % 16, '']);
    return mode ? list.map(index => [index, 1, '']) : [[selection ?? 0, 1, '']];
  }

  function describe(id, choices = []) {
    const [name, cents, , groups] = menu.items[id] || ['Unavailable demo item', 0];
    const details = [];
    let twicePrice = cents * 2;
    (groups || []).forEach(([label, options, showDefault, mode], i) => {
      const names = new Map();
      for (const [index, qty, part] of chosenOptions(mode, choices[i])) {
        const option = options[index];
        if (!option) continue;
        const half = part === 'Half 1' || part === 'Half 2';
        twicePrice += optionPrice(option[1], choices) * qty * (half ? 1 : 2);
        if (mode || index || showDefault) {
          if (!names.has(part)) names.set(part, []);
          names.get(part).push(qty > 1 ? qty + ' × ' + option[0] : option[0]);
        }
      }
      for (const [part, values] of names) {
        const heading = part ? part + ' · ' + label.toLowerCase() + ': ' : label === 'Leave out' ? 'No ' : label + ': ';
        details.push(heading + values.join(', '));
      }
    });
    return { name, price: Math.round(twicePrice / 2), details };
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
  const hasSchedule = menu.items.some(item => item[4] || item[3]?.some(group => group[4]?.schedule));
  const twoDigit = n => String(n).padStart(2, '0');
  const timeValue = minutes => twoDigit(Math.floor(minutes / 60)) + ':' + twoDigit(minutes % 60);
  const within = schedule => !schedule || (schedule.days.includes(pickup[0]) && pickup[1] >= schedule.start && pickup[1] < schedule.end);
  const isAvailable = id => within(menu.items[id]?.[4]);

  function itemProblem(id, choices) {
    if (!isAvailable(id)) return 'Outside selected pickup time.';
    for (const [i, [label, , , mode, rule]] of (menu.items[id]?.[3] || []).entries()) {
      if (rule?.schedule && choices[i] && !within(rule.schedule)) return label + ' is available ' + rule.schedule.label + '.';
      if (mode === 'count') {
        const target = rule.counts[choices[0]] ?? rule.counts[0];
        const count = chosenOptions(mode, choices[i]).reduce((sum, [, qty]) => sum + qty, 0);
        if (count !== target) return count + ' of ' + target + ' selected. ' +
          (count > target ? 'Remove ' + (count - target) + ' to fit the box.' : 'Fill the box to add it.');
      }
    }
    return '';
  }

  function priceSummary(lines, code) {
    const before = subtotal(lines);
    const offer = Object.hasOwn(coupons, code) ? coupons[code] : null;
    const discount = offer && before >= offer.minimum ? offer.discount(before) : 0;
    return { before, discount, total: before - discount };
  }

  function ticketSummary(ticket) {
    const { discount, total } = priceSummary(ticket.lines, ticket.coupon);
    const time = ticket.pickup ? (ticket.delivery ? 'Demo order time · ' : 'Demo pickup · ') + days[ticket.pickup[0]] + ' ' + timeValue(ticket.pickup[1]) + ' Columbus time' : '';
    return (ticket.delivery ? '<p><strong>Staff delivery</strong> · ' + escape(menu.deliveryDemo.dropoffs[ticket.delivery.dropoff]) + '</p>' : '') +
      (time ? '<p>' + escape(time) + '</p>' : '') +
      (discount ? '<p>Sample coupon ' + escape(ticket.coupon) + ' saved ' + formatPrice(discount) + '</p>' : '') +
      '<p class="pd-total">' + (discount ? 'Demo subtotal after discount' : 'Demo subtotal') +
      ' <strong>' + formatPrice(total) + '</strong></p>';
  }

  function drawCart() {
    saveCart();
    const lines = [...cart];
    const { before, discount, total } = priceSummary([...cart.values()], coupon);
    const unavailable = lines.some(([, [id, , choices = []]]) => itemProblem(id, choices));
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
    if (menu.deliveryDemo) {
      content.querySelector('[data-fulfillment]').disabled = blocked;
      content.querySelector('[data-delivery-address]').hidden = !dropoff;
      content.querySelector('[data-dropoff]').disabled = blocked;
      content.querySelector('[data-checkout-note]').textContent = dropoff ? 'Sample address and staff delivery. No payment is collected.' : 'Simulated pay at pickup';
      content.querySelector('[data-action="order"]').textContent = dropoff ? 'Send test delivery order' : 'Send test order';
    }
    if (hasSchedule) content.querySelectorAll('[data-pickup-slot]').forEach(control => { control.disabled = blocked; });
    content.querySelector('[data-cart-total]').textContent = formatPrice(before);
    const units = lines.reduce((sum, [, [, qty]]) => sum + qty, 0);
    const cartLink = content.querySelector('[data-cart-link]');
    cartLink.hidden = units === 0;
    cartLink.querySelector('span').textContent = 'View cart · ' + units + (units === 1 ? ' item' : ' items');
    cartLink.querySelector('strong').textContent = formatPrice(total);
    content.querySelector('[data-cart-lines]').innerHTML = lines.length ? lines.map(([key, [id, qty, choices]]) => {
      const item = describe(id, choices);
      const label = escape([item.name, ...item.details].join(', '));
      const lineKey = escape(key);
      return '<li>' + lineLabel(item, qty) + '<div class="pd-quantity">' +
        '<button type="button" aria-label="Remove one ' + label + '" data-action="remove" data-line="' + lineKey + '">−</button>' +
        '<button type="button" aria-label="Add one ' + label + '" data-action="increase" data-line="' + lineKey + '"' +
        (qty >= 12 ? ' disabled' : '') + '>+</button></div></li>';
    }).join('') : '<li>Your cart is empty.</li>';
    content.querySelector('[data-action="order"]').disabled = !lines.length || submitting || unavailable;
  }

  function menuRow({ item: [name, , , groups], id }) {
    const splitPizza = groups?.some(group => group[3] === 'placement');
    const details = groups?.length ? '<details class="pd-choices"><summary>' + (splitPizza ? 'Size, crust &amp; half toppings<span class="sr-only"> for ' + escape(name) + '</span>' : 'Customize ' + escape(name)) + '</summary>' +
      (splitPizza ? '<p class="pd-choice-policy">' + (id === pizzaId ? '' : 'Extra toppings go over the original recipe. ') +
        'Choose Whole, Half 1 or Half 2 for each topping. Demo pricing uses half the posted topping rate for one side.</p>' : '') +
      groups.map(([label, options, , mode, rule], group) => {
        if (mode === 'placement') {
          return '<div class="pd-choice pd-placement" role="group" aria-label="' + escape(label) + '" data-complex="' + group + '" data-mode="placement">' +
            '<strong>' + escape(label) + '</strong>' + options.map(([option, amount], index) => {
              const control = 'pd-place-' + id + '-' + group + '-' + index;
              return '<fieldset class="pd-topping" data-placement-row><legend>' + escape(option) +
                '<small data-option-price>' + priceSuffix(optionPrice(amount, [])) + ' whole</small></legend><div class="pd-placements">' +
                toppingPositions.map((part, value) => '<label><input type="radio" name="' + control + '" value="' + value + '"' +
                  (value === 0 ? ' checked' : '') + ' aria-label="' + escape(option + ' · ' + part) + '"><span>' + part + '</span></label>').join('') +
                '</div></fieldset>';
            }).join('') + '</div>';
        }
        if (mode === 'count') {
          return '<fieldset class="pd-choice pd-choice-parts" data-complex="' + group + '" data-mode="count"><legend>' + escape(label) + '</legend>' +
            options.map(([option, adjustment], index) => {
              const control = 'pd-part-' + id + '-' + group + '-' + index;
              return '<label for="' + control + '"><span>' + escape(option) + '<small data-option-price>' +
                priceSuffix(optionPrice(adjustment, [])) + (adjustment ? ' each' : '') + '</small></span><select id="' + control + '">' +
                Array.from({ length: 13 }, (_, qty) => '<option value="' + qty + '">' + qty + '</option>').join('') + '</select></label>';
            }).join('') + '</fieldset>';
        }
        if (mode) return '<fieldset class="pd-choice pd-choice-checks" data-checks="' + group + '"><legend>' + escape(label) + '</legend>' +
          options.map(([option, adjustment], index) => '<label><input type="checkbox" value="' + index + '">' +
            escape(option) + '<span data-option-price>' + priceSuffix(optionPrice(adjustment, [])) + '</span></label>').join('') + '</fieldset>';
        const control = 'pd-choice-' + id + '-' + group;
        return '<div class="pd-choice"><label for="' + control + '">' + escape(label) +
          '</label>' + (rule?.schedule ? '<small>' + escape(rule.schedule.label) + '</small>' : '') + '<select id="' + control + '" data-choice>' +
          options.map(([option, adjustment], index) => '<option value="' + index + '">' + escape(option) +
            priceSuffix(adjustment) + '</option>').join('') + '</select></div>';
      }).join('') + '</details>' : '';
    const availability = menu.items[id][4];
    const timing = availability ? '<small class="pd-line-detail">' + escape(availability.label) +
      '</small><small class="pd-line-detail" data-item-availability></small>' : '';
    return '<li data-menu-item data-id="' + id + '"><div class="pd-item-name"><span>' + escape(name) + '</span>' + timing +
      '<small class="pd-line-detail" data-selection>' + escape(describe(id).details.join(' · ')) + '</small></div><b data-item-price>' +
      formatPrice(describe(id).price) + '</b><button type="button" data-action="add" aria-label="Add ' + escape(name) +
      '">Add</button>' + details + '<small class="pd-line-detail pd-item-problem" data-item-problem></small></li>';
  }

  function selections(row) {
    return [...row.querySelectorAll('[data-choice], [data-checks], [data-complex]')].map(control => {
      if (control.matches('select')) return Number(control.value);
      if (control.hasAttribute('data-checks')) return [...control.querySelectorAll('input:checked')].map(input => Number(input.value));
      const placement = control.dataset.mode === 'placement';
      const base = placement ? 4 : 16;
      const selected = control.querySelectorAll(placement ? 'input:checked' : 'select');
      return [...selected].flatMap((field, i) => {
        const choice = Number(field.value);
        return choice ? [i * base + choice] : [];
      });
    });
  }

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
        if (schedule) row.querySelector('[data-item-availability]').textContent = eligible ? '' : 'Outside selected pickup time';
        updateItem(row);
      }
      group.hidden = !matches;
      count += matches;
    }
    content.querySelector('[data-menu-empty]').hidden = Boolean(count);
    content.querySelector('[data-menu-count]').textContent = count + (count === 1 ? ' item' : ' items');
    const active = Number(customizable) + Number(Boolean(available));
    const summary = content.querySelector('[data-filter-summary]');
    summary.textContent = active ? 'Filters · ' + active : 'Filters';
    content.querySelector('[data-action="clear-filters"]').hidden = !search.length && !section && !active;
    for (const chip of content.querySelectorAll('[data-section-chip]')) chip.setAttribute('aria-pressed', String(chip.dataset.sectionChip === section));
  }

  function drawMenu() {
    const sections = new Map();
    menu.items.forEach((item, id) => {
      const section = item[2];
      if (!sections.has(section)) sections.set(section, []);
      sections.get(section).push({ item, id });
    });
    content.innerHTML = '<button type="button" class="pd-cart-link" data-cart-link data-action="view-cart" hidden><span>View cart</span><strong></strong></button><div class="pd-shop"><section id="pd-menu" tabindex="-1"><h2>Menu</h2><p class="pd-source">' + escape(menu.kind) +
      (menu.source ? ' · <a href="' + escape(menu.source) + '" rel="noreferrer">View source</a>' : '') + '</p>' +
      (pizzaId >= 0 ? '<button type="button" class="pd-pizza-jump" data-action="pizza">Build a half-and-half pizza</button>' : '') +
      '<div class="pd-filters"><label class="sr-only" for="pd-filter">Find an item or option</label><input id="pd-filter" type="search" placeholder="Search dishes and toppings">' +
      '<select data-section hidden aria-label="Menu section"><option value="">All sections</option>' +
      [...sections.keys()].map(name => '<option>' + escape(name) + '</option>').join('') + '</select>' +
      '<div class="pd-sections" role="group" aria-label="Menu sections"><button type="button" data-action="section" data-section-chip="">All</button>' +
      [...sections.keys()].map(name => '<button type="button" data-action="section" data-section-chip="' + escape(name) + '">' + escape(name) + '</button>').join('') + '</div>' +
      '<details class="pd-refine"><summary data-filter-summary>Filters</summary>' +
      '<label class="pd-filter-check"><input type="checkbox" data-customizable> Customizable items</label>' +
      (hasSchedule ? '<label class="pd-filter-check"><input type="checkbox" data-available> Available at demo time</label>' : '') +
      '</details><div class="pd-results"><p data-menu-count role="status"></p><button type="button" data-action="clear-filters" hidden>Clear filters</button></div></div>' +
      (hasSchedule ? '<details class="pd-pickup-time"><summary>Pickup time · <span data-slot-summary></span></summary>' + pickupControls() + '</details>' : '') +
      [...sections].map(([name, rows]) => '<section data-menu-section><h3>' + escape(name) + '</h3><ul class="pd-items">' +
        rows.map(menuRow).join('') + '</ul></section>').join('') +
      '<p data-menu-empty hidden>No items match that search.</p></section>' +
      '<aside class="pd-card" id="pd-cart" tabindex="-1"><div class="pd-section-head"><h2>Your cart</h2><button type="button" data-action="back-menu">Back to menu</button></div><ul data-cart-lines class="pd-items"></ul>' +
      '<p class="pd-total">Demo subtotal <strong data-cart-total></strong></p>' +
      (menu.demoCoupon ? '<details class="pd-coupon"><summary>Sample coupon</summary><label class="sr-only"  for="pd-coupon">Sample coupon</label><div><input data-coupon id="pd-coupon" autocomplete="off" maxlength="20" placeholder="Try HOCDEMO10">' +
        '<button type="button" data-action="coupon">Apply</button></div><p>HOCDEMO10 takes 10% off $20. HOCDEMO5 takes $5 off $35. One sample code per order.</p><p data-coupon-status role="status"></p></details>' +
        '<p class="pd-total" data-discount hidden>Sample discount <strong></strong></p>' +
        '<p class="pd-total" data-total-after hidden>Demo subtotal after discount <strong></strong></p>' : '') +
      '<p data-cart-availability hidden>Change the pickup time or remove the items with a time restriction.</p>' +
      (menu.deliveryDemo ? '<label class="pd-delivery-field">How are you getting your order?<select data-fulfillment>' +
        orderOptions({ pickup: 'Pick up at the counter', delivery: 'Delivery by restaurant staff' }, dropoff ? 'delivery' : 'pickup') +
        '</select></label><label class="pd-delivery-field" data-delivery-address hidden>Sample delivery address<select data-dropoff>' +
        orderOptions(menu.deliveryDemo.dropoffs, dropoff) + '</select></label>' : '') +
      '<button type="button" data-action="order" class="pd-primary">Send test order</button><p data-checkout-note>Simulated pay at pickup</p>' +
      '<div data-ticket tabindex="-1" aria-live="polite"></div></aside></div>';
    const couponField = content.querySelector('[data-coupon]');
    if (couponField) couponField.value = coupon;
    content.querySelector('[data-fulfillment]')?.addEventListener('change', event => {
      dropoff = event.target.value === 'delivery' ? content.querySelector('[data-dropoff]').value : '';
      drawCart();
    });
    content.querySelector('[data-dropoff]')?.addEventListener('change', event => {
      dropoff = event.target.value;
      drawCart();
    });
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
      updateSlotSummary();
      filterMenu();
      drawCart();
    });
    if (hasSchedule) updateSlotSummary();
    filterMenu();
    if ('IntersectionObserver' in window) {
      cartObserver?.disconnect();
      const link = content.querySelector('[data-cart-link]');
      cartObserver = new IntersectionObserver(([entry]) => link.toggleAttribute('data-at-cart', entry.isIntersecting));
      cartObserver.observe(content.querySelector('#pd-cart h2'));
    }
    content.addEventListener('change', updateChoice);
    drawCart();
  }

  function updateSlotSummary() {
    const [day, minutes] = pickup;
    const hour = Math.floor(minutes / 60);
    content.querySelector('[data-slot-summary]').textContent =
      days[day] + ' ' + (hour % 12 || 12) + ':' + twoDigit(minutes % 60) + (hour >= 12 ? ' PM' : ' AM');
  }

  function updateChoice(event) {
    const row = event.target.closest('[data-menu-item]');
    if (row) updateItem(row);
  }

  function updateItem(row) {
    const id = Number(row.dataset.id);
    const choices = selections(row);
    const item = describe(id, choices);
    row.querySelector('[data-item-price]').textContent = formatPrice(item.price);
    row.querySelector('[data-selection]').textContent = item.details.join(' · ');
    const problem = itemProblem(id, choices);
    row.querySelector('[data-action="add"]').disabled = Boolean(problem);
    row.querySelector('[data-item-problem]').textContent = isAvailable(id) ? problem : '';
    for (const group of row.querySelectorAll('[data-checks], [data-complex]')) {
      const [, options] = menu.items[id][3][Number(group.dataset.checks ?? group.dataset.complex)];
      group.querySelectorAll('[data-option-price]').forEach((price, index) => {
        const amount = optionPrice(options[index][1], choices);
        price.textContent = priceSuffix(amount) + (group.dataset.mode === 'placement' ? ' whole' : group.dataset.mode === 'count' && amount ? ' each' : '');
      });
    }
  }

  function showTicket(ticket) {
    const box = content.querySelector('[data-ticket]');
    if (!box || !ticket) return;
    const text = 'Test order ' + ticketCode(ticket) + ' · ' + ticketLabel(ticket) +
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
    if (ticket.status === 'ready') return ticket.delivery ? parcelActions(ticket) : button('collected', 'Picked up');
    return '';
  }

  function parcelActions(ticket) {
    const { job } = ticket.delivery;
    const { drivers, windows, reasons } = menu.deliveryDemo;
    const action = (event, text) => '<button type="button" data-action="parcel" data-event="' + event + '">' + text + '</button>';
    const select = (name, label, options, selected) => '<label class="pd-delivery-field">' + label +
      '<select data-' + name + '>' + orderOptions(options, selected) + '</select></label>';

    let controls = '';
    if (!isDriver && (!job || ['assigned', 'failed'].includes(job.status))) {
      controls = select('driver', 'Staff driver', drivers, job?.driver) +
        select('window', 'Delivery window', windows, job?.window) +
        (job ? action('rescheduled', 'Reschedule or reassign') + action('cancelled', 'Cancel delivery') : action('assigned', 'Assign delivery'));
    }
    if (isDriver && job?.status === 'assigned') controls = action('picked_up', 'Record pickup');
    if (isDriver && job?.status === 'picked_up') {
      controls = action('handed_off', 'Confirm handoff') + select('reason', 'Failed attempt reason', reasons) +
        action('failed', 'Record failed attempt');
    }

    if (!job) return '<div class="pd-parcel"><h4>NDA Parcel dispatch demo</h4>' + controls + '</div>';
    const timeline = job.events.map(({ attempt, outcome, reason, at }) =>
      '<li><strong>' + escape(parcelLabels[outcome]) + '</strong>' +
      (reason ? ' · ' + escape(reasons[reason]) : '') +
      ' <small>Attempt ' + attempt + ' · ' + escape(deliveryClock.format(new Date(at))) +
      ' Columbus time</small></li>').join('');
    const driverLink = !isDriver && driverLinks[job.driver] ?
      '<a href="' + escape(roomLink(false, driverLinks[job.driver])) + '" target="_blank" rel="noopener">Open ' + escape(drivers[job.driver]) + '’s driver view</a>' : '';
    return '<div class="pd-parcel" data-job="' + escape(job.id) + '" data-attempt="' + job.attempt + '"><h4>NDA Parcel job ' +
      escape(job.id.slice(0, 8).toUpperCase()) + '</h4><p>' + escape(drivers[job.driver]) + ' · ' + escape(windows[job.window]) +
      '</p>' + driverLink + '<details><summary>Custody history</summary><ol>' + timeline + '</ol></details>' + controls + '</div>';
  }

  function drawQueue(tickets) {
    const queue = content.querySelector('[data-queue]');
    const old = new Map([...queue.querySelectorAll('[data-ticket-id]')].map(card => [card.dataset.ticketId, card]));
    const ids = new Set(tickets.map(ticket => ticket.id));
    for (const [id, card] of old) if (!ids.has(id)) card.remove();
    const newTicket = !isDriver && visibleTickets !== '' && tickets.some(ticket => ticket.status === 'new' && !old.has(ticket.id));
    const signature = JSON.stringify([tickets, driverLinks]);
    if (visibleTickets === signature) return;
    visibleTickets = signature;
    for (const ticket of tickets) {
      const previous = old.get(ticket.id);
      const version = JSON.stringify(ticket);
      if (previous?.dataset.version === version) continue;
      const card = document.createElement('article');
      card.className = 'pd-card';
      card.dataset.ticketId = ticket.id;
      card.dataset.state = ticketStatus(ticket);
      card.dataset.version = version;
      card.innerHTML = '<p class="pd-state">' + ticketLabel(ticket) + '</p><h3>Order ' + ticketCode(ticket) + '</h3>' +
        (isDriver ? '<p>Pickup · Restaurant counter</p><p>Drop-off · ' + escape(menu.deliveryDemo.dropoffs[ticket.delivery.dropoff]) + '</p>' :
          '<ul class="pd-items">' + orderLines(ticket.lines) + '</ul>' + ticketSummary(ticket)) +
        '<div class="pd-ticket-actions">' + ticketActions(ticket) + '</div>';
      if (previous) previous.replaceWith(card);
      else queue.prepend(card);
    }
    updateQueueView();
    if (newTicket) { say('New test order received.'); ring(); }
  }

  function updateQueueView() {
    let active = 0;
    let history = 0;
    for (const card of content.querySelectorAll('[data-ticket-id]')) {
      const done = ['collected', 'declined', 'handed_off', 'cancelled'].includes(card.dataset.state);
      if (done) history++;
      else active++;
      card.hidden = done !== (queueView === 'history');
    }
    const empty = content.querySelector('[data-queue-empty]');
    empty.hidden = Boolean(queueView === 'history' ? history : active);
    empty.textContent = queueView === 'history' ? 'No completed or declined orders.' : 'Waiting for a test order. Use the shopper menu to send one.';
    if (isDriver) empty.textContent = queueView === 'history' ? 'No completed runs.' : 'No assigned runs. Dispatch assigns jobs from the counter tablet.';
    for (const button of content.querySelectorAll('[data-queue-view]')) {
      const isHistory = button.dataset.queueView === 'history';
      button.textContent = (isHistory ? 'History' : 'Active') + ' · ' + (isHistory ? history : active);
      button.setAttribute('aria-pressed', String(button.dataset.queueView === queueView));
    }
  }

  async function refresh() {
    if (polling || !room || session.hidden || submitting) return;
    polling = true;
    try {
      const { tickets, drivers } = await api();
      driverLinks = drivers || {};
      if (isDriver) drawQueue(staffKey && !drivers ? tickets.filter(ticket => ticket.delivery?.job) : []);
      else if (isTablet) drawQueue(tickets);
      else showTicket(tickets.find(ticket => ticket.id === ticketId));
      if (connectionLost) say('Demo connection restored.');
      connectionLost = false;
    } catch (error) {
      if (error.status === 410) {
        clearInterval(timer);
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(draftKey());
        sessionStorage.removeItem(secretStorage(room, isDriver));
        history.replaceState(null, '', base + location.search);
        room = '';
        staffKey = '';
        dropoff = '';
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

  function openPizza() {
    if (isTablet || pizzaId < 0) return;
    content.querySelector('#pd-filter').value = '';
    content.querySelector('[data-section]').value = menu.items[pizzaId][2];
    filterMenu();
    const details = content.querySelector('[data-menu-item][data-id="' + pizzaId + '"] details');
    details.open = true;
    details.querySelector('summary').focus();
  }

  function openSession() {
    sessionStorage.setItem(storageKey, room);
    if (isTablet && staffKey) sessionStorage.setItem(secretStorage(room, isDriver), staffKey);
    history.replaceState(null, '', roomLink(isTablet, isDriver ? staffKey : undefined));
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
    if (!isDriver) (isTablet ? tablet : shopper).setAttribute('aria-current', 'page');
    tablet.hidden = isDriver;
    root.querySelector('.pd-share').hidden = isDriver;
    copyButton.textContent = isTablet ? 'Copy shopper link' : 'Copy tablet link';
    if (isTablet) {
      visibleTickets = '';
      queueView = 'active';
      content.innerHTML = '<div class="pd-section-head"><h2>' + (isDriver ? 'Driver runs' : 'Counter queue') + '</h2>' +
        (isDriver ? '<span>Demo staff only</span>' : '<button type="button" data-action="sound">Enable order chime</button>') + '</div>' +
        '<div class="pd-sections" role="group" aria-label="Order queue"><button type="button" data-action="queue-view" data-queue-view="active">Active · 0</button>' +
        '<button type="button" data-action="queue-view" data-queue-view="history">History · 0</button></div>' +
        '<p data-queue-empty></p><div class="pd-queue" data-queue></div>';
      updateQueueView();
      keepAwake();
    } else {
      ticketId = sessionStorage.getItem('hoc-pickup-ticket:' + room) || '';
      let draft;
      try { draft = JSON.parse(sessionStorage.getItem(draftKey()) || 'null'); }
      catch { sessionStorage.removeItem(draftKey()); }
      if (draft) {
        for (const [key, line] of draft.lines) cart.set(key, line);
        ({ coupon, pickup, pendingId, dropoff } = draft);
      }
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
    if (action === 'pizza' && !session.hidden) { openPizza(); return; }
    if (action === 'start' || action === 'pizza') {
      if (startButton.disabled) return;
      start.querySelectorAll('button').forEach(control => { control.disabled = true; });
      startMessage.hidden = false;
      startMessage.textContent = 'Opening the demo…';
      try {
        room ||= randomKey();
        if (menu.deliveryDemo && !isDriver) staffKey ||= randomKey();
        await api({ action: 'start' });
        if (staffKey && !isDriver) sessionStorage.setItem(secretStorage(room), staffKey);
        say('');
        openSession();
        if (action === 'pizza') openPizza();
      } catch {
        startMessage.textContent = 'The demo could not open. Try again in a moment.';
      } finally {
        start.querySelectorAll('button').forEach(control => { control.disabled = false; });
      }
      return;
    }
    if (action === 'copy') {
      const link = new URL(roomLink(!isTablet), location.origin).href;
      try { await navigator.clipboard.writeText(link); say('Link copied.'); }
      catch { window.prompt('Copy the demo link', link); }
      return;
    }
    if (action === 'section' || action === 'clear-filters') {
      content.querySelector('[data-section]').value = button.dataset.sectionChip || '';
      if (action === 'clear-filters') {
        content.querySelector('#pd-filter').value = '';
        for (const check of content.querySelectorAll('.pd-filters input[type="checkbox"]')) check.checked = false;
        content.querySelector('#pd-filter').focus();
      }
      filterMenu();
      return;
    }
    if (action === 'queue-view') {
      queueView = button.dataset.queueView;
      updateQueueView();
      return;
    }
    if (action === 'view-cart' || action === 'back-menu') {
      root.querySelector(action === 'view-cart' ? '#pd-cart' : '#pd-menu').focus();
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
    if (['add', 'remove', 'increase'].includes(action)) {
      if (pendingId) { say('Retry the pending test order before changing this cart.'); return; }
      const row = button.closest('[data-menu-item]');
      if (row && itemProblem(Number(row.dataset.id), selections(row))) return;
      const choices = row ? selections(row) : [];
      const key = row ? JSON.stringify([row.dataset.id, choices]) : button.dataset.line;
      const previousLine = cart.get(key);
      if (!row && !previousLine) return;
      const [id, previous, picked = []] = previousLine || [Number(row.dataset.id), 0, choices];
      const qty = previous + (action === 'remove' ? -1 : 1);
      if (qty > 12 || (!cart.has(key) && cart.size >= 24)) { say('This demo cart has reached its item limit.'); return; }
      if (qty > 0) cart.set(key, picked.length ? [id, qty, picked] : [id, qty]);
      else cart.delete(key);
      drawCart();
      if (action !== 'add') {
        const next = [...content.querySelectorAll('[data-line]')].find(control =>
          control.dataset.line === key && control.dataset.action === action && !control.disabled);
        (next || content.querySelector('[data-line]:enabled') || content.querySelector('#pd-cart')).focus();
      }
      const item = describe(id, picked);
      say(qty > 0 ? qty + ' in cart: ' + [item.name, ...item.details].join(', ') : 'Removed from cart.');
      return;
    }
    if (!['order', 'advance', 'parcel'].includes(action)) return;
    submitting = true;
    button.disabled = true;
    try {
      if (action === 'order') {
        pendingId ||= randomKey();
        const lines = [...cart.values()];
        drawCart();
        const { ticket } = await api({
          action, id: pendingId, lines,
          ...(dropoff ? { dropoff } : {}),
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
        content.querySelector('[data-ticket]').focus();
      } else if (action === 'parcel') {
        const card = button.closest('[data-ticket-id]');
        const parcel = button.closest('.pd-parcel');
        await api({
          action, id: card.dataset.ticketId, event: button.dataset.event,
          handoffConfirmed: button.dataset.event === 'handed_off',
          job: parcel.dataset.job, attempt: Number(parcel.dataset.attempt),
          driver: parcel.querySelector('[data-driver]')?.value,
          window: parcel.querySelector('[data-window]')?.value,
          reason: parcel.querySelector('[data-reason]')?.value,
        });
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

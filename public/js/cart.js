// Shop local online, pick up around town: live catalogs from Columbus shops
// that sell on their own Shopify, WooCommerce or Squarespace stores, one cart
// across all of them, and a handoff to each shop's own checkout. Heart of
// Columbus never takes payment or an order: every shop checks the shopper out
// on its own site. Pattern ported from KawaiiKatz and Herbal Leaf Market.
//
// How each engine is handed the cart (mirrors src/commerce-core.mjs):
//   Shopify      one cart permalink carries every line, plus `note` (the
//                order note, "Pickup, please" when the shopper picks up) and
//                `ref` (Shopify's own conversion tracking).
//   WooCommerce  ?add-to-cart= takes ONE line per request. One tap opens a
//                tab on their store and walks it through every line, then
//                leaves it on their store with the cart filled. The links
//                stay listed in case a slow page skipped one.
//   Squarespace  no cart link exists, so its lines are a shopping list:
//                checkout opens each product page on their site.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return '$' + Number(n || 0).toFixed(2); };
  var KEY = 'hoc.cart', PICK = 'hoc.pickup';
  var load = function (k, d) { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  var save = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  var read = function () { return load(KEY, []); };
  var write = function (v) { save(KEY, v); paint(); };
  var REF = 'heartofcolumbus';
  var WOO_STEP_MS = 4000;

  // ---------- Handoff URLs ----------
  function shopifyUrl(origin, lines, pickup) {
    var parts = lines.filter(function (l) { return l.available !== false && l.variantId; }).map(function (l) { return encodeURIComponent(l.variantId) + ':' + l.qty; });
    var q = (pickup ? 'note=' + encodeURIComponent('Pickup, please. Sent from Heart of Columbus.') + '&' : '') + 'ref=' + REF;
    return (parts.length ? origin + '/cart/' + parts.join(',') : origin + '/cart') + '?' + q;
  }
  function wooUrls(origin, lines) {
    return lines.filter(function (l) { return l.available !== false && l.productId && !l.pick; }).map(function (l) {
      return l.add ? origin + '/?' + l.add + '&quantity=' + l.qty : origin + '/?add-to-cart=' + encodeURIComponent(l.variantId || l.productId) + '&quantity=' + l.qty;
    });
  }
  // One tab, walked through every add link. A tab we opened may be sent to
  // another address by us; each step is a normal visit to their store, so
  // their cart cookie is theirs and stays with the shopper.
  function fillWoo(urls, onStep, onDone) {
    var w = window.open(urls[0], '_blank');
    if (!w) { onDone(false); return; }
    var i = 0;
    onStep(0);
    (function next() {
      i++;
      if (i >= urls.length) { setTimeout(function () { onDone(true); }, WOO_STEP_MS); return; }
      setTimeout(function () {
        try { w.location.href = urls[i]; onStep(i); next(); } catch (e) { onDone(false); }
      }, WOO_STEP_MS);
    })();
  }
  // Every pickup stop, in cart order, as one Google Maps route (no key needed).
  function routeUrl(stops) {
    var a = stops.map(function (s) { return s + ', Columbus, IN'; });
    if (!a.length) return '';
    var u = 'https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=' + encodeURIComponent(a[a.length - 1]);
    if (a.length > 1) u += '&waypoints=' + encodeURIComponent(a.slice(0, -1).join('|'));
    return u;
  }

  // ---------- Drawer ----------
  var drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-label', 'Your local cart');
  drawer.hidden = true;
  document.body.appendChild(drawer);
  var fab = document.createElement('button');
  fab.type = 'button';
  fab.className = 'cart-fab';
  fab.hidden = true;
  fab.innerHTML = '<span aria-hidden="true">🛍️</span> Cart <b data-cart-n>0</b>';
  fab.addEventListener('click', function () { drawer.hidden = false; renderDrawer(); });
  document.body.appendChild(fab);

  function groups(cart) {
    var g = {}, order = [];
    cart.forEach(function (l) { if (!g[l.slug]) { g[l.slug] = []; order.push(l.slug); } g[l.slug].push(l); });
    return { by: g, order: order };
  }
  function pickupOn(slug, first) {
    var p = load(PICK, {});
    return slug in p ? !!p[slug] : !!first.address;
  }
  function openLabel(first) {
    if (!first.hours || !window.HoCOpen) return '';
    var st = window.HoCOpen(first.hours);
    return st ? '<em class="' + (st.open ? 'ta-open' : 'ta-closed') + '">' + esc(st.label) + '</em>' : '';
  }
  function checkoutLabel(first, n) {
    if (first.buyOnSite) return n > 1 ? 'Open their product pages ↗' : 'Buy it on their site ↗';
    if (first.platform === 'woocommerce' && n > 1) return 'Fill their cart and check out ↗';
    return 'Check out at ' + esc(first.store) + ' ↗';
  }
  function renderDrawer() {
    var cart = read();
    var G = groups(cart);
    var stops = [];
    var html = '<div class="cd-head"><h2>Your local cart</h2><button type="button" class="cd-x" data-cd-close aria-label="Close">✕</button></div>';
    if (!cart.length) html += '<p class="cd-empty">Your cart is empty. Look for “Shop online” on a business page.</p>';
    else {
      var items = cart.reduce(function (a, l) { return a + l.qty; }, 0);
      html += '<p class="cd-summary"><b>' + items + '</b> item' + (items === 1 ? '' : 's') + ' from <b>' + G.order.length + '</b> local shop' + (G.order.length === 1 ? '' : 's') + '. Each shop checks you out on its own site.</p>';
    }
    G.order.forEach(function (slug) {
      var lines = G.by[slug], first = lines[0];
      var sub = lines.reduce(function (a, l) { return a + l.price * l.qty; }, 0);
      var pick = pickupOn(slug, first);
      if (pick && first.address) stops.push(first.address);
      html += '<section class="cd-store"><div class="cd-store-h"><h3>' + esc(first.store) + '</h3>' + openLabel(first) + '</div>';
      if (first.address) {
        html += '<label class="cd-pick"><input type="checkbox" data-pick="' + esc(slug) + '"' + (pick ? ' checked' : '') + '> <span>Pick up at <b>' + esc(first.address) + '</b></span></label>';
      }
      html += lines.map(function (l, i) {
        return '<div class="cd-line">' + (l.image ? '<img src="' + esc(l.image) + '" alt="" loading="lazy">' : '<span class="cd-ph">🛍️</span>') +
          '<div><strong>' + esc(l.title) + '</strong>' + (l.variant ? '<small>' + esc(l.variant) + '</small>' : '') + '<small>' + money(l.price) + '</small></div>' +
          '<div class="cd-qty"><button type="button" data-q="-1" data-slug="' + esc(slug) + '" data-i="' + i + '" aria-label="One less">−</button><span>' + l.qty + '</span><button type="button" data-q="1" data-slug="' + esc(slug) + '" data-i="' + i + '" aria-label="One more">+</button></div></div>';
      }).join('') +
        '<p class="cd-sub">Subtotal at ' + esc(first.store) + ': <b>' + money(sub) + '</b> <small>before their tax and fees</small></p>' +
        '<button type="button" class="btn cd-go" data-checkout="' + esc(slug) + '">' + checkoutLabel(first, lines.length) + '</button>' +
        (first.buyOnSite ? '<p class="cd-note">This shop’s website has no cart link, so your list opens their product pages to buy there.</p>'
          : pick ? '<p class="cd-note">Choose in-store pickup at their checkout' + (first.platform === 'shopify' ? '; your order note asks for pickup.' : '.') + '</p>' : '') +
        (first.platform === 'woocommerce' && lines.length > 1 ? '<p class="cd-note">Their store adds one item per visit, so one tap opens their store and adds each item in turn. Keep that tab open until it finishes.</p>' : '') +
        '<div class="cd-status" data-status="' + esc(slug) + '" aria-live="polite"></div><div class="cd-more" data-more="' + esc(slug) + '"></div>' +
        '</section>';
    });
    if (stops.length) {
      html += '<a class="btn btn-ghost cd-route" href="' + esc(routeUrl(stops)) + '" target="_blank" rel="noopener">📍 Route my pickups (' + stops.length + ' stop' + (stops.length === 1 ? '' : 's') + ') ↗</a>';
    }
    if (cart.length) html += '<p class="cd-fine">You pay each shop directly on its own website, with no app fee and no markup. Heart of Columbus never sees your payment. Prices are the shop’s own and can change.</p><button type="button" class="cd-clear" data-cd-clear>Clear cart</button>';
    drawer.innerHTML = '<div class="cd-panel">' + html + '</div>';
  }
  drawer.addEventListener('change', function (e) {
    var p = e.target.closest('[data-pick]');
    if (!p) return;
    var m = load(PICK, {});
    m[p.getAttribute('data-pick')] = p.checked;
    save(PICK, m);
    renderDrawer();
  });
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer || e.target.closest('[data-cd-close]')) { drawer.hidden = true; return; }
    if (e.target.closest('[data-cd-clear]')) { write([]); renderDrawer(); return; }
    var q = e.target.closest('[data-q]');
    if (q) {
      var cart = read(), lines = groups(cart).by[q.dataset.slug], l = lines[Number(q.dataset.i)];
      l.qty += Number(q.dataset.q);
      write(cart.filter(function (x) { return x.qty > 0; }));
      renderDrawer();
      return;
    }
    var co = e.target.closest('[data-checkout]');
    if (!co) return;
    var slug = co.dataset.checkout, ls = groups(read()).by[slug], first = ls[0];
    var status = $('[data-status="' + slug + '"]', drawer), more = $('[data-more="' + slug + '"]', drawer);
    if (first.buyOnSite) {
      window.open(first.url, '_blank', 'noopener');
      more.innerHTML = ls.slice(1).map(function (l) { return '<a class="pill" href="' + esc(l.url) + '" target="_blank" rel="noopener">Open ' + esc(l.title) + ' ↗</a>'; }).join('');
      return;
    }
    if (first.platform === 'shopify') { window.open(shopifyUrl(first.origin, ls, pickupOn(slug, first)), '_blank', 'noopener'); return; }
    var urls = wooUrls(first.origin, ls);
    var listed = function () {
      more.innerHTML = urls.map(function (u, i) { return '<a class="pill" href="' + esc(u) + '" target="_blank" rel="noopener">Add ' + esc(ls[i].title) + (ls[i].variant ? ' (' + esc(ls[i].variant) + ')' : '') + ' ↗</a>'; }).join('');
    };
    if (urls.length < 2) { window.open(urls[0], '_blank', 'noopener'); return; }
    co.disabled = true;
    fillWoo(urls, function (i) {
      status.textContent = 'Adding ' + (i + 1) + ' of ' + urls.length + ' to their cart…';
    }, function (ok) {
      co.disabled = false;
      status.textContent = ok ? 'Done. Their tab has your items: open their cart there to check out. If one is missing, add it below.'
        : 'Your browser blocked the new tab. Add each item below instead.';
      listed();
    });
  });
  function paint() {
    var n = read().reduce(function (a, l) { return a + l.qty; }, 0);
    fab.hidden = !n;
    $('[data-cart-n]', fab).textContent = n;
  }
  paint();

  // ---------- Live catalog on a business page / the order page ----------
  function firstLive(item) { return Math.max(0, item.variants.findIndex(function (v) { return v.available; })); }
  function add(store, item, vi) {
    var v = item.variants[vi] || item.variants[0];
    var cart = read();
    var key = store.slug + '|' + item.id + '|' + v.id;
    var hit = cart.find(function (l) { return l.key === key; });
    if (hit) hit.qty++;
    else cart.push({
      key: key, slug: store.slug, store: store.name, platform: store.platform, origin: store.origin,
      address: store.address, hours: store.hours, buyOnSite: !!item.buyOnSite, url: item.url,
      productId: item.id.slice(1), variantId: v.id, add: v.add || '', title: item.title, variant: v.title,
      price: v.price, image: item.image, available: v.available, qty: 1,
    });
    write(cart);
  }
  $$('[data-shop]').forEach(function (box) {
    var slug = box.dataset.shop, name = box.dataset.name, limit = Number(box.dataset.limit || 48);
    var hours = null;
    try { hours = JSON.parse(box.dataset.hours || 'null'); } catch (e) { hours = null; }
    fetch('/api/shop?slug=' + encodeURIComponent(slug)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ok) { box.innerHTML = '<p class="muted">' + esc(d.error || 'Their store did not answer.') + '</p>'; return; }
      var store = { slug: slug, name: name, platform: d.platform, origin: d.origin, address: box.dataset.address || '', hours: hours };
      // Pristine and in stock only (owner's rule): a product that is sold out or
      // has no photo in the shop's own catalog stays off the grid. The link
      // below still reaches every item on the shop's own site.
      var items = d.items.filter(function (i) { return i.available && i.image; });
      var stock = d.items.filter(function (i) { return i.available; });
      var unseen = stock.length - items.length;
      box.innerHTML = '<p class="shop-count">' + stock.length + ' items in stock at ' + esc(name) + '’s own store</p><div class="prod-grid">' + items.slice(0, limit).map(function (it, idx) {
        var fl = firstLive(it);
        return '<article class="prod"><img src="' + esc(it.image) + '" alt="" loading="lazy">' +
          '<div class="prod-b"><a href="' + esc(it.url) + '" target="_blank" rel="noopener" class="prod-t">' + esc(it.title) + '</a><p class="prod-p">' + money(it.price) + '</p>' +
          (it.variants.length > 1 ? '<select data-v="' + idx + '" aria-label="Option">' + it.variants.map(function (v, vi) { return '<option value="' + vi + '"' + (v.available ? (vi === fl ? ' selected' : '') : ' disabled') + '>' + esc(v.title || 'Option ' + (vi + 1)) + (v.available ? '' : ' (sold out)') + ' · ' + money(v.price) + '</option>'; }).join('') + '</select>' : '') +
          // A variable product whose options we could not read is chosen on
          // their site: an add link without the options adds nothing there.
          (it.pick ? '<a class="btn btn-sm btn-ghost" href="' + esc(it.url) + '" target="_blank" rel="noopener">Choose options ↗</a>'
            : '<button type="button" class="btn btn-sm" data-add="' + idx + '">' + (it.buyOnSite ? 'Add to my list' : 'Add to cart') + '</button>') + '</div></article>';
      }).join('') + '</div>' + (items.length > limit || unseen ? '<a class="btn btn-ghost" href="' + esc(d.origin) + '" target="_blank" rel="noopener">See all ' + stock.length + ' on their site ↗</a>' : '');
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-add]');
        if (!b) return;
        var i = Number(b.dataset.add), sel = $('[data-v="' + i + '"]', box), it = items[i];
        add(store, it, sel ? Number(sel.value) : firstLive(it));
        var label = b.textContent;
        b.textContent = 'Added ✓';
        setTimeout(function () { b.textContent = label; }, 1400);
      });
    }).catch(function () { box.innerHTML = '<p class="muted">Their store did not answer. Try their website.</p>'; });
  });
})();

// Shop local online: live catalogs from Columbus shops that already sell on
// their own Shopify or WooCommerce stores, one cart across all of them, and a
// handoff to each shop's own checkout with the items already in the cart.
// Heart of Columbus never takes payment. Pattern ported from KawaiiKatz and
// Herbal Leaf Market.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return '$' + Number(n || 0).toFixed(2); };
  var KEY = 'hoc.cart';
  var read = function () { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } };
  var write = function (v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } paint(); };
  var STORES = {};
  try { STORES = JSON.parse(($('#commerce-data') || {}).textContent || '{}'); } catch (e) { STORES = {}; }

  // ---------- Handoff URLs (mirror src/commerce-core.mjs) ----------
  function shopifyUrl(origin, lines) {
    var parts = lines.filter(function (l) { return l.available !== false && l.variantId; }).map(function (l) { return encodeURIComponent(l.variantId) + ':' + l.qty; });
    return parts.length ? origin + '/cart/' + parts.join(',') : origin + '/cart';
  }
  function wooUrls(origin, lines) {
    return lines.map(function (l) { return origin + '/?add-to-cart=' + encodeURIComponent(l.variantId || l.productId) + '&quantity=' + l.qty; });
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
    var g = {};
    cart.forEach(function (l) { (g[l.slug] = g[l.slug] || []).push(l); });
    return g;
  }
  function renderDrawer() {
    var cart = read();
    var g = groups(cart);
    var html = '<div class="cd-head"><h2>Your local cart</h2><button type="button" class="cd-x" data-cd-close aria-label="Close">✕</button></div>';
    if (!cart.length) html += '<p class="cd-empty">Your cart is empty. Look for “Shop online” on a business page.</p>';
    Object.keys(g).forEach(function (slug) {
      var lines = g[slug], s = STORES[slug] || lines[0];
      var sub = lines.reduce(function (a, l) { return a + l.price * l.qty; }, 0);
      html += '<section class="cd-store"><h3>' + esc(lines[0].store) + '</h3>' + lines.map(function (l, i) {
        return '<div class="cd-line">' + (l.image ? '<img src="' + esc(l.image) + '" alt="" loading="lazy">' : '<span class="cd-ph">🛍️</span>') +
          '<div><strong>' + esc(l.title) + '</strong>' + (l.variant ? '<small>' + esc(l.variant) + '</small>' : '') + '<small>' + money(l.price) + '</small></div>' +
          '<div class="cd-qty"><button type="button" data-q="-1" data-slug="' + slug + '" data-i="' + i + '" aria-label="One less">−</button><span>' + l.qty + '</span><button type="button" data-q="1" data-slug="' + slug + '" data-i="' + i + '" aria-label="One more">+</button></div></div>';
      }).join('') +
        '<p class="cd-sub">Subtotal at ' + esc(lines[0].store) + ': <b>' + money(sub) + '</b> <small>before their tax and fees</small></p>' +
        '<button type="button" class="btn cd-go" data-checkout="' + slug + '">Check out at ' + esc(lines[0].store) + ' ↗</button>' +
        (lines[0].platform === 'woocommerce' && lines.length > 1 ? '<p class="cd-note">This shop’s cart takes one item per link. The first opens now; tap the rest below to add them.</p><div class="cd-more" data-more="' + slug + '"></div>' : '') +
        '</section>';
    });
    if (cart.length) html += '<p class="cd-fine">Each shop runs its own checkout on its own website, so you pay them directly, with no app fee. Choose in-store pickup there if they offer it. Prices are the shop’s own and can change.</p><button type="button" class="cd-clear" data-cd-clear>Clear cart</button>';
    drawer.innerHTML = '<div class="cd-panel">' + html + '</div>';
  }
  drawer.addEventListener('click', function (e) {
    if (e.target === drawer || e.target.closest('[data-cd-close]')) { drawer.hidden = true; return; }
    if (e.target.closest('[data-cd-clear]')) { write([]); renderDrawer(); return; }
    var q = e.target.closest('[data-q]');
    if (q) {
      var cart = read(), lines = groups(cart)[q.dataset.slug], l = lines[Number(q.dataset.i)];
      l.qty += Number(q.dataset.q);
      write(cart.filter(function (x) { return x.qty > 0; }));
      renderDrawer();
      return;
    }
    var co = e.target.closest('[data-checkout]');
    if (co) {
      var slug = co.dataset.checkout, ls = groups(read())[slug], first = ls[0];
      if (first.platform === 'shopify') window.open(shopifyUrl(first.origin, ls), '_blank', 'noopener');
      else {
        var urls = wooUrls(first.origin, ls);
        window.open(urls[0], '_blank', 'noopener');
        var box = $('[data-more="' + slug + '"]', drawer);
        if (box) box.innerHTML = urls.slice(1).map(function (u, i) { return '<a class="pill" href="' + esc(u) + '" target="_blank" rel="noopener">Add ' + esc(ls[i + 1].title) + ' ↗</a>'; }).join('');
      }
    }
  });
  function paint() {
    var n = read().reduce(function (a, l) { return a + l.qty; }, 0);
    fab.hidden = !n;
    $('[data-cart-n]', fab).textContent = n;
  }
  paint();

  // ---------- Live catalog on a business page / shop page ----------
  function add(store, item, vi) {
    var v = item.variants[vi] || item.variants[0];
    var cart = read();
    var key = store.slug + '|' + v.id;
    var hit = cart.find(function (l) { return l.key === key; });
    if (hit) hit.qty++;
    else cart.push({ key: key, slug: store.slug, store: store.name, platform: store.platform, origin: store.origin, productId: item.id.slice(1), variantId: v.id, title: item.title, variant: v.title, price: v.price, image: item.image, available: v.available, qty: 1 });
    write(cart);
  }
  $$('[data-shop]').forEach(function (box) {
    var slug = box.dataset.shop, name = box.dataset.name, limit = Number(box.dataset.limit || 48);
    fetch('/api/shop?slug=' + encodeURIComponent(slug)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ok) { box.innerHTML = '<p class="muted">' + esc(d.error || 'Their store did not answer.') + '</p>'; return; }
      var store = { slug: slug, name: name, platform: d.platform, origin: d.origin };
      var items = d.items.filter(function (i) { return i.available; });
      box.innerHTML = '<p class="shop-count">' + items.length + ' items in stock at ' + esc(name) + '’s own store</p><div class="prod-grid">' + items.slice(0, limit).map(function (it, idx) {
        return '<article class="prod">' + (it.image ? '<img src="' + esc(it.image) + '" alt="" loading="lazy">' : '<div class="prod-ph">🛍️</div>') +
          '<div class="prod-b"><a href="' + esc(it.url) + '" target="_blank" rel="noopener" class="prod-t">' + esc(it.title) + '</a><p class="prod-p">' + money(it.price) + '</p>' +
          (it.variants.length > 1 ? '<select data-v="' + idx + '" aria-label="Option">' + it.variants.map(function (v, vi) { return '<option value="' + vi + '"' + (v.available ? '' : ' disabled') + '>' + esc(v.title) + (v.available ? '' : ' (sold out)') + ' · ' + money(v.price) + '</option>'; }).join('') + '</select>' : '') +
          '<button type="button" class="btn btn-sm" data-add="' + idx + '">Add to cart</button></div></article>';
      }).join('') + '</div>' + (items.length > limit ? '<a class="btn btn-ghost" href="' + esc(d.origin) + '" target="_blank" rel="noopener">See all ' + items.length + ' on their site ↗</a>' : '');
      box.addEventListener('click', function (e) {
        var b = e.target.closest('[data-add]');
        if (!b) return;
        var i = Number(b.dataset.add), sel = $('[data-v="' + i + '"]', box);
        add(store, items[i], sel ? Number(sel.value) : 0);
        b.textContent = 'Added ✓';
        setTimeout(function () { b.textContent = 'Add to cart'; }, 1400);
      });
    }).catch(function () { box.innerHTML = '<p class="muted">Their store did not answer. Try their website.</p>'; });
  });
})();

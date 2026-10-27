// Trail stamp card: honor-system stamps kept in this browser only
// (localStorage "hoc.trail.<slug>"). Nothing is sent anywhere.
(function () {
  'use strict';
  var list = document.querySelector('[data-trail]');
  if (!list) return;
  var key = 'hoc.trail.' + list.getAttribute('data-trail');
  var btns = Array.prototype.slice.call(list.querySelectorAll('[data-stamp]'));
  var count = document.querySelector('[data-trail-count]');
  var reset = document.querySelector('[data-trail-reset]');
  var read = function () { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } };
  var write = function (v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* private mode */ } };
  var got = read();

  function draw() {
    btns.forEach(function (b) {
      var on = got.indexOf(b.getAttribute('data-stamp')) !== -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.classList.toggle('tl-on', on);
      b.querySelector('[data-stamp-label]').textContent = on ? 'Visited' : 'Mark visited';
    });
    var n = btns.filter(function (b) { return got.indexOf(b.getAttribute('data-stamp')) !== -1; }).length;
    if (count) count.textContent = n ? n + ' of ' + btns.length + ' stamped' + (n === btns.length ? '. Trail done!' : '') : btns.length + ' stops';
    if (reset) reset.hidden = !n;
  }

  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var id = b.getAttribute('data-stamp'), i = got.indexOf(id);
      if (i === -1) got.push(id); else got.splice(i, 1);
      write(got);
      draw();
    });
  });
  if (reset) reset.addEventListener('click', function () { got = []; write(got); draw(); });
  var print = document.querySelector('[data-trail-print]');
  if (print) print.addEventListener('click', function () { window.print(); });
  draw();
})();

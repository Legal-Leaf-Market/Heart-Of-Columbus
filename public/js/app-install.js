// A separate install prompt and service worker for each Columbus app.
(function () {
  'use strict';
  var news = location.pathname.startsWith('/news/');
  var root = news ? '/news/' : '/order/';
  if (!news && !location.pathname.startsWith('/order/')) return;
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register(root + 'sw.js', { scope: root }).catch(function () {});
    });
  }
  if (location.pathname !== root) return;
  var hero = document.querySelector(news ? '.np' : '.order-hero .wrap');
  if (!hero) return;
  var box = document.createElement('p');
  box.className = 'wrap';
  box.style.cssText = 'margin:1rem auto;font-size:.9rem';
  box.textContent = news ? 'Read the morning paper from your home screen. ' : 'Keep local pickup and booking on your home screen. ';
  var button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn-sm';
  button.textContent = 'Install app';
  button.hidden = true;
  box.appendChild(button);
  box.appendChild(document.createTextNode(' On iPhone: Safari → Share → Add to Home Screen.'));
  hero.appendChild(box);
  var prompt;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault(); prompt = e; button.hidden = false;
  });
  button.addEventListener('click', function () {
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then(function () { prompt = null; button.hidden = true; });
  });
  window.addEventListener('appinstalled', function () { button.hidden = true; });
})();

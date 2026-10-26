// The newspaper's front page: today's date in Columbus on the masthead.
(function () {
  'use strict';
  var el = document.querySelector('[data-np-today]');
  if (el) el.textContent = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Indiana/Indianapolis', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());
})();

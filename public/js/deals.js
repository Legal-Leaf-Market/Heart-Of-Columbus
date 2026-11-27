(function () {
  'use strict';
  var list = document.querySelector('[data-public-deals]');
  if (!list) return;
  var status = document.querySelector('[data-deals-status]');
  var dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });

  function render(deal) {
    var item = document.createElement('li');
    var link = document.createElement('a');
    link.className = 'hol-name';
    link.href = '/b/' + encodeURIComponent(deal.slug) + '/';
    link.textContent = deal.name + (deal.adult ? ' (21+)' : '');
    var terms = document.createElement('p');
    terms.className = 'deals-terms';
    terms.textContent = deal.text;
    var ends = document.createElement('span');
    ends.textContent = 'Ends ' + dateFormat.format(new Date(deal.ends + 'T12:00:00Z'));
    item.append(link, terms, ends);
    deal.disclosures.forEach(function (text) {
      var note = document.createElement('small');
      note.textContent = text;
      item.append(note);
    });
    return item;
  }

  status.textContent = 'Loading offers…';
  fetch('/api/deals').then(function (response) {
    return response.json();
  }).then(function (result) {
    list.replaceChildren(...result.deals.map(render));
    status.textContent = result.ok ? (result.deals.length ? '' : 'There are no current offers listed.') :
      'Some offers could not be loaded. Try refreshing in a moment.';
  }).catch(function () {
    status.textContent = 'Offers could not be loaded. Try refreshing in a moment.';
  });
})();

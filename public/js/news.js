// The newspaper's front page: today's date on the masthead, and the weather
// and river box. Weather and alerts come from the National Weather Service
// (api.weather.gov, public domain), the river from the USGS gauge on the
// East Fork White River at Columbus. Each reading is kept in localStorage,
// so when a service is down the box shows the last good one with its time.
(function () {
  'use strict';
  var TZ = 'America/Indiana/Indianapolis';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var when = function (iso) { return new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(iso)); };

  var today = $('[data-np-today]');
  if (today) today.textContent = new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(new Date());

  // The evening edition of the open rail: after 5 PM it's "Open tonight".
  var hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', hourCycle: 'h23' }).format(new Date()));
  var openRail = $('#open-now');
  if (openRail && hour >= 17) {
    var h2 = $('h2', openRail), kick = $('.kicker', openRail);
    if (h2) h2.textContent = 'Open tonight';
    if (kick) kick.textContent = 'Dinner, drinks and dessert';
  }

  var box = $('[data-np-wx]');
  if (!box) return;

  function save(k, v) { try { localStorage.setItem('hoc-np-' + k, JSON.stringify({ at: Date.now(), v: v })); } catch (e) { /* private mode */ } }
  function load(k) { try { return JSON.parse(localStorage.getItem('hoc-np-' + k) || 'null'); } catch (e) { return null; } }
  function getJSON(url) {
    return fetch(url, { headers: { accept: 'application/geo+json, application/json' } }).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }
  // Fresh data when we can get it; otherwise the last good copy, marked as such.
  function withCache(key, get, paint, fail) {
    return get().then(function (v) { save(key, v); paint(v, Date.now(), false); }).catch(function () {
      var c = load(key);
      if (c) paint(c.v, c.at, true); else fail();
    });
  }
  var stamp = function (at, old, src) { return '<p class="np-wx-when">' + (old ? 'Could not refresh. Last updated ' : 'Updated ') + esc(when(at)) + ', from ' + src + '.</p>'; };

  var lat = box.getAttribute('data-lat'), lon = box.getAttribute('data-lon'), gauge = box.getAttribute('data-gauge');
  var NWS = 'https://api.weather.gov';

  withCache('wx', function () {
    return getJSON(NWS + '/points/' + lat + ',' + lon).then(function (p) { return getJSON(p.properties.forecast); }).then(function (f) {
      return f.properties.periods.slice(0, 3).map(function (x) { return { n: x.name, t: x.temperature, u: x.temperatureUnit, s: x.shortForecast, w: (x.windSpeed || '') + ' ' + (x.windDirection || '') }; });
    });
  }, function (periods, at, old) {
    $('[data-np-wx-now]', box).innerHTML = '<ul class="np-wx-list">' + periods.map(function (x) {
      return '<li><strong>' + esc(x.n) + '</strong> <span class="np-wx-t">' + esc(x.t) + '°' + esc(x.u) + '</span> <span>' + esc(x.s) + '</span></li>';
    }).join('') + '</ul>' + stamp(at, old, 'NWS');
  }, function () {
    $('[data-np-wx-now]', box).innerHTML = '<p class="muted">The forecast didn’t load. Use the National Weather Service link below.</p>';
  });

  // Active watches and warnings for this point. Never cached: an old warning is worse than none.
  getJSON(NWS + '/alerts/active?point=' + lat + ',' + lon).then(function (a) {
    var list = (a.features || []).map(function (f) { return f.properties; }).filter(function (p) { return !p.expires || Date.parse(p.expires) > Date.now(); });
    if (!list.length) return;
    $('[data-np-wx-alerts]', box).innerHTML = list.slice(0, 3).map(function (p) {
      return '<p class="np-wx-alert"><strong>' + esc(p.event) + '</strong> ' + (p.expires ? 'until ' + esc(when(p.expires)) : '') + '</p>';
    }).join('');
  }).catch(function () { /* the forecast link covers it */ });

  // River stage (feet) and flow (cubic feet per second): the newer USGS API first, then the classic one.
  function river() {
    var ogc = 'https://api.waterdata.usgs.gov/ogcapi/v0/collections/latest-continuous/items?f=json&monitoring_location_id=USGS-' + gauge;
    var iv = 'https://waterservices.usgs.gov/nwis/iv/?format=json&siteStatus=all&parameterCd=00065,00060&sites=' + gauge;
    return getJSON(ogc).then(function (d) {
      var out = {};
      (d.features || []).forEach(function (f) {
        var p = f.properties;
        if (p.parameter_code === '00065') out.stage = { v: Number(p.value), at: p.time };
        if (p.parameter_code === '00060') out.flow = { v: Number(p.value), at: p.time };
      });
      if (!out.stage && !out.flow) throw new Error('empty');
      return out;
    }).catch(function () {
      return getJSON(iv).then(function (d) {
        var out = {};
        d.value.timeSeries.forEach(function (ts) {
          var code = ts.variable.variableCode[0].value, vals = ts.values[0].value, last = vals[vals.length - 1];
          if (!last) return;
          if (code === '00065') out.stage = { v: Number(last.value), at: last.dateTime };
          if (code === '00060') out.flow = { v: Number(last.value), at: last.dateTime };
        });
        if (!out.stage && !out.flow) throw new Error('empty');
        return out;
      });
    });
  }
  withCache('river', river, function (r, at, old) {
    var read = r.stage || r.flow;
    $('[data-np-river]', box).innerHTML = '<p><strong>East Fork White River</strong> ' +
      (r.stage ? '<span class="np-wx-t">' + esc(r.stage.v.toFixed(1)) + ' ft</span> ' : '') +
      (r.flow ? '<span>' + esc(Math.round(r.flow.v).toLocaleString('en-US')) + ' cubic feet per second</span>' : '') + '</p>' +
      stamp(read.at || at, old, 'USGS');
  }, function () {
    $('[data-np-river]', box).innerHTML = '<p class="muted">The river gauge didn’t load. Use the USGS link below.</p>';
  });
})();

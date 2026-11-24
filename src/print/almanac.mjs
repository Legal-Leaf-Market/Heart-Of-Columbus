// The front page almanac: sunrise, sunset and the solstice for downtown
// Columbus, computed with the NOAA solar position equations (the ones behind
// NOAA's solar calculator spreadsheet). Nothing here is looked up or guessed.
// Times are Eastern Standard Time, which Columbus keeps all December.

const LAT = 39.2014, LON = -85.9214, TZ = -5;
const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
const jdOf = (ms) => ms / 86400000 + 2440587.5;

function sun(jd) {
  const jc = (jd - 2451545) / 36525;
  const L = (280.46646 + jc * (36000.76983 + jc * 0.0003032)) % 360;
  const M = 357.52911 + jc * (35999.05029 - 0.0001537 * jc);
  const e = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);
  const C = Math.sin(rad(M)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) + Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * jc) + Math.sin(rad(3 * M)) * 0.000289;
  const omega = 125.04 - 1934.136 * jc;
  const app = L + C - 0.00569 - 0.00478 * Math.sin(rad(omega));
  const obl = 23 + (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60 + 0.00256 * Math.cos(rad(omega));
  const decl = deg(Math.asin(Math.sin(rad(obl)) * Math.sin(rad(app))));
  const y = Math.tan(rad(obl / 2)) ** 2;
  const eq = 4 * deg(y * Math.sin(2 * rad(L)) - 2 * e * Math.sin(rad(M)) + 4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L)) - 0.5 * y * y * Math.sin(4 * rad(L)) - 1.25 * e * e * Math.sin(2 * rad(M)));
  return { app: ((app % 360) + 360) % 360, decl, eq };
}

// Minutes after local midnight.
function riseSet(date) {
  const [Y, Mo, D] = date.split('-').map(Number);
  const noonUtc = Date.UTC(Y, Mo - 1, D, 12 - TZ);
  const { decl, eq } = sun(jdOf(noonUtc));
  const ha = deg(Math.acos(Math.cos(rad(90.833)) / (Math.cos(rad(LAT)) * Math.cos(rad(decl))) - Math.tan(rad(LAT)) * Math.tan(rad(decl))));
  const noon = 720 - 4 * LON - eq + TZ * 60;
  return { rise: noon - 4 * ha, set: noon + 4 * ha, len: 8 * ha };
}

const clock = (m) => {
  const r = Math.round(m), h = Math.floor(r / 60), mi = r % 60;
  return `${((h + 11) % 12) + 1}:${String(mi).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};
const hm = (m) => { const r = Math.round(m); return `${Math.floor(r / 60)} hours, ${r % 60} minutes`; };

// The moment the sun's apparent longitude reaches 270 degrees.
function solstice(year) {
  let a = Date.UTC(year, 11, 19), b = Date.UTC(year, 11, 24);
  for (let i = 0; i < 60; i++) {
    const mid = (a + b) / 2;
    if (sun(jdOf(mid)).app < 270) a = mid; else b = mid;
  }
  return new Date((a + b) / 2);
}

export function almanac(year = 2026) {
  const days = Array.from({ length: 31 }, (_, i) => `${year}-12-${String(i + 1).padStart(2, '0')}`);
  const all = days.map((d) => ({ date: d, ...riseSet(d) }));
  const earliest = all.reduce((a, b) => (b.set < a.set ? b : a));
  const s = solstice(year);
  const local = new Date(s.getTime() + TZ * 3600000);
  const sday = `${year}-12-${String(local.getUTCDate()).padStart(2, '0')}`;
  const pick = (d) => all.find((x) => x.date === d);
  return {
    rows: [`${year}-12-01`, sday, `${year}-12-31`].map((d) => ({ date: d, rise: clock(pick(d).rise), set: clock(pick(d).set), len: hm(pick(d).len) })),
    earliestSunset: { date: earliest.date, set: clock(earliest.set) },
    solstice: { date: sday, time: clock(local.getUTCHours() * 60 + local.getUTCMinutes()) },
    shortest: { date: sday, len: hm(pick(sday).len) },
  };
}

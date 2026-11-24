// The puzzle page: a Columbus crossword and a word search, built at build
// time so the grid and the answer key can never disagree. Every clue is a
// fact from our own approved history articles or landmark data (the source
// is noted beside it), so a puzzle never teaches something we haven't checked.
// The layout is deterministic: the same words give the same grid every build.

export const CROSSWORD = [
  ['SAARINEN', 'Eliel and Eero, father and son architects of First Christian and North Christian', 'landmarks'],
  ['TINGUELY', 'Jean ___, the artist who built Chaos I', 'landmarks'],
  ['BIRKERTS', 'Gunnar ___, architect of Lincoln Elementary', '1960s/lincoln-elementary-and-lady-bird'],
  ['KOGONADA', 'Writer and director of the 2017 film Columbus', '2010s/columbus-the-movie'],
  ['SENTINELS', 'Columbus hockey team, the Indiana ___', '2020s/indiana-sentinels'],
  ['REPUBLIC', 'The town’s daily paper since 1872, The ___', 'papers/the-republican-arrives'],
  ['FLATROCK', 'River along the west edge of the Miller House grounds', '1950s/miller-house-and-garden'],
  ['BULLDOGS', 'Columbus North team that plays in Memorial Gym', '1950s/memorial-gym'],
  ['CUMMINS', 'Engine company founded in Columbus in 1919', '2010s/cummins-turns-100'],
  ['BAKALAR', 'Air base renamed in 1954 for Lt. John ___', '1970s/air-base-becomes-airport'],
  ['VENTURI', 'Robert ___, an architect of Fire Station 4', 'landmarks'],
  ['COMMONS', 'Downtown’s indoor gathering place, The ___', '2010s/new-commons'],
  ['MILLER', 'J. Irwin ___, longtime leader of Cummins', '1950s/miller-house-and-garden'],
  ['ATTERBURY', 'Camp ___, the Army post north of town', '1940s/camp-atterbury-is-built'],
  ['ARVIN', 'Car heater brand that became a Columbus company’s name', '1930s/arvin-radios'],
  ['CRUMP', 'Third Street theatre with a vertical neon sign', '2010s/crump-endangered'],
  ['CHAOS', '___ I, the moving sculpture at The Commons', 'landmarks'],
  ['MOORE', 'Henry ___, sculptor of the Large Arch', 'landmarks'],
  ['XENIA', '___ Miller, who dedicated the Visitors Center in 1995', '1990s/visitors-center-chandelier'],
  ['WEESE', 'Harry ___, architect of First Baptist Church', '1960s/first-baptist-church'],
  ['ROCHE', 'Kevin ___, architect of the post office', '1970s/kevin-roche-post-office'],
  ['KILEY', 'Dan ___, who laid out the Miller House garden', '1950s/miller-house-and-garden'],
  ['PELLI', 'Cesar ___, architect of the first Commons', '2010s/new-commons'],
  ['OTTER', '___ Creek, the golf course Cummins gave the city', '1960s/otter-creek-golf-course'],
  ['ARCH', 'Henry Moore’s Large ___', 'landmarks'],
  ['RACE', 'Mill ___ Park, on the river', '1990s/mill-race-park'],
  ['LEX', 'The ___, North Christian’s new name', '1960s/north-christian-church-dedicated'],
  ['HAW', '___ Creek, which flooded the hospital in 2008', '2000s/flood-of-2008'],
  ['PEI', 'I. M. ___, architect of the Cleo Rogers Memorial Library', 'landmarks'],
  ['NTN', 'Japanese driveshaft maker in Walesboro', '1980s/ntn-comes-to-walesboro'],
];

export const WORDSEARCH = {
  title: 'Find the architects (and two artists)',
  words: ['SAARINEN', 'PEI', 'MOORE', 'TINGUELY', 'VENTURI', 'WEESE', 'ROCHE', 'KILEY', 'PELLI', 'BIRKERTS', 'BASSETT', 'HODGSON', 'GIRARD', 'EAMES'],
  note: 'Names from our landmark and history pages: churches, a library, a fire station, City Hall, the courthouse and the Miller House.',
};

// A small seeded random number generator (mulberry32) so the puzzles are the
// same on every build.
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Greedy crossword fill: longest words first, each placed where it crosses
// the most letters already down, never touching a word side by side.
function fillOnce(list, size, order) {
  const g = Array.from({ length: size }, () => Array(size).fill(''));
  const placed = [];
  const at = (r, c) => (r >= 0 && c >= 0 && r < size && c < size ? g[r][c] : null);
  const fits = (w, r, c, dr, dc) => {
    let cross = 0;
    if (at(r - dr, c - dc)) return -1;
    if (at(r + dr * w.length, c + dc * w.length)) return -1;
    for (let i = 0; i < w.length; i++) {
      const rr = r + dr * i, cc = c + dc * i, cur = at(rr, cc);
      if (cur === null) return -1;
      if (cur) { if (cur !== w[i]) return -1; cross++; continue; }
      // An empty cell must not have neighbors across the word's direction.
      if (at(rr + dc, cc + dr) || at(rr - dc, cc - dr)) return -1;
    }
    return cross;
  };
  const words = order;
  const [first, ...rest] = words;
  const r0 = Math.floor(size / 2), c0 = Math.floor((size - first[0].length) / 2);
  const put = (w, r, c, dr, dc) => { for (let i = 0; i < w.length; i++) g[r + dr * i][c + dc * i] = w[i]; };
  put(first[0], r0, c0, 0, 1);
  placed.push({ word: first[0], clue: first[1], src: first[2], r: r0, c: c0, dir: 'across' });
  let pending = rest;
  for (let pass = 0; pass < 3 && pending.length; pass++) {
    const left = [];
    for (const [w, clue, src] of pending) {
      let best = null;
      for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) for (const [dr, dc, dir] of [[0, 1, 'across'], [1, 0, 'down']]) {
        const x = fits(w, r, c, dr, dc);
        if (x < 1) continue;
        // Prefer more crossings, then a placement near the middle.
        const score = x * 100 - Math.abs(r - size / 2) - Math.abs(c - size / 2);
        if (!best || score > best.score) best = { r, c, dr, dc, dir, score };
      }
      if (best) { put(w, best.r, best.c, best.dr, best.dc); placed.push({ word: w, clue, src, r: best.r, c: best.c, dir: best.dir }); }
      else left.push([w, clue, src]);
    }
    pending = left;
  }
  return { g, placed, pending };
}

// Many seeded tries with different word orders; keep the one that places the
// most words, then the one with the most crossings. Same answer every build.
export function buildCrossword(list = CROSSWORD, size = 15, tries = 600) {
  const rand = rng(1221);
  let best = null;
  for (let t = 0; t < tries; t++) {
    const order = t === 0 ? [...list].sort((a, b) => b[0].length - a[0].length)
      : [...list].map((x) => [rand() + (t % 2 ? x[0].length / 20 : 0), x]).sort((a, b) => b[0] - a[0]).map((x) => x[1]);
    const res = fillOnce(list, size, order);
    const cells = res.g.flat().filter(Boolean).length;
    const letters = res.placed.reduce((n, p) => n + p.word.length, 0);
    const score = res.placed.length * 1000 + (letters - cells);
    if (!best || score > best.score) best = { ...res, score };
  }
  const { g, placed, pending } = best;
  // Crop to the used area and number the starts, top to bottom, left to right.
  const rows = placed.flatMap((p) => [p.r, p.dir === 'down' ? p.r + p.word.length - 1 : p.r]);
  const cols = placed.flatMap((p) => [p.c, p.dir === 'across' ? p.c + p.word.length - 1 : p.c]);
  const top = Math.min(...rows), bottom = Math.max(...rows), leftC = Math.min(...cols), right = Math.max(...cols);
  const grid = g.slice(top, bottom + 1).map((row) => row.slice(leftC, right + 1));
  for (const p of placed) { p.r -= top; p.c -= leftC; }
  const starts = [...new Set(placed.map((p) => `${p.r},${p.c}`))]
    .map((k) => k.split(',').map(Number)).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const num = new Map(starts.map(([r, c], i) => [`${r},${c}`, i + 1]));
  for (const p of placed) p.n = num.get(`${p.r},${p.c}`);
  const byN = (a, b) => a.n - b.n;
  return {
    grid, numbers: num,
    across: placed.filter((p) => p.dir === 'across').sort(byN),
    down: placed.filter((p) => p.dir === 'down').sort(byN),
    unused: pending.map(([w]) => w),
  };
}

const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
export function buildWordSearch({ words } = WORDSEARCH, size = 15, seed = 2026) {
  const rand = rng(seed);
  const g = Array.from({ length: size }, () => Array(size).fill(''));
  const where = [];
  for (const w of [...words].sort((a, b) => b.length - a.length)) {
    let done = false;
    for (let tries = 0; tries < 2000 && !done; tries++) {
      const [dr, dc] = DIRS[Math.floor(rand() * DIRS.length)];
      const r = Math.floor(rand() * size), c = Math.floor(rand() * size);
      const er = r + dr * (w.length - 1), ec = c + dc * (w.length - 1);
      if (er < 0 || ec < 0 || er >= size || ec >= size) continue;
      let ok = true;
      for (let i = 0; i < w.length && ok; i++) { const v = g[r + dr * i][c + dc * i]; if (v && v !== w[i]) ok = false; }
      if (!ok) continue;
      for (let i = 0; i < w.length; i++) g[r + dr * i][c + dc * i] = w[i];
      where.push({ word: w, r, c, dr, dc });
      done = true;
    }
    if (!done) throw new Error(`word search: could not place ${w}`);
  }
  const AZ = 'ABCDEFGHIJKLMNOPRSTUVWY';
  const filled = g.map((row) => row.map((v) => v || AZ[Math.floor(rand() * AZ.length)]));
  return { grid: filled, where, size };
}

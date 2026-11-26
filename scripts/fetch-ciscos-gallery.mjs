// Downloads the portfolio photos from Cisco's own site (www.ciscos.site) at
// up to 1600px so the gallery can be cropped and graded locally. Run by the
// "Fetch Cisco's gallery" workflow, because this sandbox cannot reach
// static.wixstatic.com. Output: <outdir>/<code><n>.jpg plus index.json.
// The raw files never go on main: the workflow keeps them on the
// checks/ciscos-gallery-raw branch.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const out = process.argv[2] || 'ciscos-gallery-raw';
const src = JSON.parse(readFileSync('scripts/data/ciscos-gallery-sources.json', 'utf8'));
mkdirSync(out, { recursive: true });
const index = [];
for (const [code, b] of Object.entries(src.barbers)) {
  for (const [i, entry] of b.ids.entries()) {
    const [id, own] = entry.split('.');
    const ext = own || b.ext;
    const url = `${src.base}${id}~mv2.${ext}/v1/fit/w_1600,h_1600,q_92/x.jpg`;
    const name = `${code}${i + 1}.jpg`;
    try {
      const r = await fetch(url, { headers: { 'user-agent': 'HeartOfColumbus-gallery/1.0' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      writeFileSync(`${out}/${name}`, Buffer.from(await r.arrayBuffer()));
      index.push({ name, barber: b.name, page: b.page, id, ok: true });
      console.log('saved', name);
    } catch (e) {
      index.push({ name, barber: b.name, page: b.page, id, ok: false, error: String(e) });
      console.log('FAILED', name, String(e));
    }
  }
}
writeFileSync(`${out}/index.json`, JSON.stringify(index, null, 2));
console.log(index.filter(x => x.ok).length, 'of', index.length, 'saved');

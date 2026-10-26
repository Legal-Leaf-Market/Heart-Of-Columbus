// Optimize only local assets at build time; keep source artwork untouched.
import { readdir, mkdir, writeFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

export async function prepareImages(root, out) {
  const manifest = new Map();
  await mkdir(new URL('assets/images/', out), { recursive: true });
  let files = (await readdir(new URL('public/', root), { recursive: true }))
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
  // A PNG with a WebP beside it would write the same resized files; pages load the WebP.
  const have = new Set(files);
  files = files.filter((f) => !(/\.png$/i.test(f) && have.has(f.replace(/\.png$/i, '.webp'))));
  // Limit simultaneous encoders to keep Netlify builds within memory limits.
  for (let i = 0; i < files.length; i += 4) {
    await Promise.all(files.slice(i, i + 4).map(async (file) => {
      const input = await readFile(new URL(`public/${file}`, root));
      const { width, height } = await sharp(input).metadata();
      const variants = [];
      for (const size of [...new Set([320, 640, 960, width].filter((w) => w <= width))]) {
        const buffer = await sharp(input).resize({ width: size, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
        // Never make a page download a larger replacement at full resolution.
        if (buffer.length >= input.length && size === width) continue;
        // /assets/ is cached for a year, so the URL carries the content hash.
        const path = `/assets/images/${file.replace(/\.[^.]+$/, '').replaceAll('/', '-')}-${size}.webp`;
        await writeFile(new URL('.' + path, out), buffer);
        const url = `${path}?v=${createHash('sha256').update(buffer).digest('hex').slice(0, 10)}`;
        variants.push({ url, width: size, bytes: buffer.length });
      }
      manifest.set('/' + file, { width, height, variants, bytes: input.length });
    }));
  }
  await writeFile(new URL('assets/images/manifest.json', out), JSON.stringify(Object.fromEntries(manifest)));
  return manifest;
}

export function responsiveImages(html, manifest) {
  return html.replace(/<img\b[^>]*>/g, (tag) => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    const image = manifest.get(src);
    if (!image) return tag; // Remote photo sizes must be measured, not guessed.
    // Existing width/height attributes may be display sizes; retain the intended
    // width but use the measured source ratio to avoid distortion and layout shift.
    const width = Number(tag.match(/\bwidth="(\d+)"/)?.[1]) || image.width;
    tag = tag.replace(/\s(?:width|height)="[^"]*"/g, '');
    tag = tag.replace('<img', `<img width="${width}" height="${Math.round(width * image.height / image.width)}"`);
    if (!/\bdecoding=/.test(tag)) tag = tag.replace('<img', '<img decoding="async"');
    if (!image.variants.length || /\bsrcset=/.test(tag)) return tag;
    const sizes = /\bbz-art\b/.test(tag) ? '(max-width: 600px) 76vw, 320px'
      : /\bcat-|\barea-badge\b|\bfl fl-/.test(tag) ? '160px' : '(max-width: 768px) 100vw, 960px';
    const fallback = image.variants.find((v) => v.width >= 640) || image.variants.at(-1);
    return tag.replace(`src="${src}"`, `src="${fallback.url}" srcset="${image.variants.map((v) => `${v.url} ${v.width}w`).join(', ')}"${/\bsizes=/.test(tag) ? '' : ` sizes="${sizes}"`}`);
  });
}

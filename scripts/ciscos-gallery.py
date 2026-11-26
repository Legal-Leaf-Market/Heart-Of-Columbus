"""Crops and grades the Prior cuts gallery for sites/ciscos-barber-shop.

  python3 scripts/ciscos-gallery.py <raw-dir> [--preview out.jpg]

<raw-dir> holds the downloads from the checks/ciscos-gallery-raw branch
(git archive origin/checks/ciscos-gallery-raw | tar -x -C <raw-dir>).
Writes img/gallery/<id>.webp (1080 square) and <id>-s.webp (480 square), and
the gallery markup between the GALLERY markers in index.html.
Every photo gets the same crop shape and the same light grade, so the grid
reads as one feed.
"""
import html, json, os, re, sys
from PIL import Image, ImageEnhance, ImageFilter, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'sites', 'ciscos-barber-shop')
OUT = os.path.join(SITE, 'img', 'gallery')
DATA = json.load(open(os.path.join(ROOT, 'scripts', 'data', 'ciscos-gallery.json')))


def crop(im, cx, cy, s):
    w, h = im.size
    # Letterboxed video stills: trim black bars before cropping.
    gray = im.convert('L')
    top, bottom = 0, h
    while top < h // 4 and gray.crop((0, top, w, top + 1)).getextrema()[1] < 24:
        top += 1
    while bottom > h * 3 // 4 and gray.crop((0, bottom - 1, w, bottom)).getextrema()[1] < 24:
        bottom -= 1
    im = im.crop((0, top, w, bottom))
    w, h = im.size
    side = round(min(w, h) * s)
    x = min(max(round(cx * w - side / 2), 0), w - side)
    y = min(max(round(cy * h - side / 2), 0), h - side)
    return im.crop((x, y, x + side, y + side))


def grade(im):
    im = ImageOps.autocontrast(im, cutoff=0.5)
    im = ImageEnhance.Contrast(im).enhance(1.06)
    im = ImageEnhance.Color(im).enhance(1.08)
    r, g, b = im.split()
    r = r.point(lambda v: min(255, round(v * 1.025)))
    b = b.point(lambda v: round(v * 0.975))
    im = Image.merge('RGB', (r, g, b))
    return im.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=2))


def slug(t):
    return re.sub(r'[^a-z0-9]+', '-', t.lower()).strip('-')


def main():
    raw = sys.argv[1]
    preview = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    os.makedirs(OUT, exist_ok=True)
    tiles, items = [], []
    for post in DATA['posts']:
        files = []
        for name, cx, cy, s in post['photos']:
            im = ImageOps.exif_transpose(Image.open(os.path.join(raw, name + '.jpg'))).convert('RGB')
            im = grade(crop(im, cx, cy, s))
            big = im.resize((1080, 1080), Image.LANCZOS) if im.width >= 1080 else im.resize((min(im.width, 1080),) * 2, Image.LANCZOS)
            pid = name.lower()
            if not preview:
                big.save(os.path.join(OUT, pid + '.webp'), 'WEBP', quality=80, method=6)
                im.resize((480, 480), Image.LANCZOS).save(os.path.join(OUT, pid + '-s.webp'), 'WEBP', quality=76, method=6)
            tiles.append((post, name, im.resize((240, 240), Image.LANCZOS)))
            files.append(pid)
        items.append((post, files))
    if preview:
        from PIL import ImageDraw
        cols = 8
        rows = (len(tiles) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * 240, rows * 256), '#222')
        d = ImageDraw.Draw(sheet)
        for i, (post, name, t) in enumerate(tiles):
            x, y = (i % cols) * 240, (i // cols) * 256
            sheet.paste(t, (x, y + 16))
            d.text((x + 3, y + 2), name + ' ' + post['style'][:30], fill='#ff5')
        sheet.save(preview, quality=82)
        return
    write_html(items)


def write_html(items):
    out = []
    for i, (post, files) in enumerate(items):
        style = html.escape(post['style'])
        barber = html.escape(post['barber'])
        n = len(files)
        multi = ' data-multi' if n > 1 else ''
        alt = f"{style}, by {barber}"
        out.append(
            f'        <li class="post" data-barber="{barber}"{multi}>'
            f'<button type="button" data-post="{i}" data-photos="{" ".join(files)}" '
            f'aria-label="{style} by {barber}{f", {n} photos" if n > 1 else ""}">'
            f'<img src="img/gallery/{files[0]}-s.webp" width="480" height="480" loading="lazy" decoding="async" alt="{alt}">'
            f'<span class="post-cap" aria-hidden="true"><b>{style}</b>{barber}</span>'
            + ('<svg class="post-multi" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h11a2 2 0 0 1 2 2v11M4 7h11a2 2 0 0 1 2 2v11H6a2 2 0 0 1-2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>' if n > 1 else '')
            + '</button></li>')
    path = os.path.join(SITE, 'index.html')
    page = open(path, encoding='utf-8').read()
    block = '<!--GALLERY-->\n' + '\n'.join(out) + '\n        <!--/GALLERY-->'
    page, k = re.subn(r'<!--GALLERY-->.*?<!--/GALLERY-->', lambda m: block, page, flags=re.S)
    if k != 1:
        sys.exit('index.html has no <!--GALLERY--> markers')
    open(path, 'w', encoding='utf-8').write(page)
    print(len(items), 'posts written')


if __name__ == '__main__':
    main()

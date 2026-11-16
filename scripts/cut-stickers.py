# Cut the 6x6 sticker atlas into one transparent PNG per sticker.
# Gutters are found per row/column band (lowest alpha near each nominal cell
# edge); inside each cell only the largest solid shape is kept, so a sliver
# of a neighbour never rides along.
import sys, json
from PIL import Image, ImageFilter
src, mapf, outdir = sys.argv[1:4]
im = Image.open(src).convert('RGBA'); W, H = im.size
ids = [d['id'] for d in sorted(json.load(open(mapf)), key=lambda d: (d['row'], d['column']))]
a = im.getchannel('A').load()
step = W / 6
def gutter(axis, nominal, lo, hi):
  best = None
  for p in range(int(nominal - 45), int(nominal + 45)):
    s = sum(a[p, q] if axis == 'x' else a[q, p] for q in range(lo, hi))
    if best is None or s < best[0]: best = (s, p)
  return best[1]
rows = [0] + [gutter('y', step*i, 0, W) for i in range(1, 6)] + [H]
cols = {}
for r in range(6):
  cols[r] = [0] + [gutter('x', step*i, rows[r], rows[r+1]) for i in range(1, 6)] + [W]
def largest(cell):
  w, h = cell.size; al = cell.getchannel('A').load()
  seen = [[False]*w for _ in range(h)]; best = []
  for y in range(h):
    for x in range(w):
      if al[x, y] >= 160 and not seen[y][x]:
        seen[y][x] = True; st = [(x, y)]; px = []
        while st:
          cx, cy = st.pop(); px.append((cx, cy))
          for nx, ny in ((cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)):
            if 0 <= nx < w and 0 <= ny < h and not seen[ny][nx] and al[nx, ny] >= 160:
              seen[ny][nx] = True; st.append((nx, ny))
        if len(px) > len(best): best = px
  return best
for i, sid in enumerate(ids):
  r, c = divmod(i, 6)
  box = (cols[r][c], rows[r], cols[r][c+1], rows[r+1])
  cell = im.crop(box); px = largest(cell)
  m = Image.new('L', cell.size, 0); mp = m.load()
  for (x, y) in px: mp[x, y] = 255
  m = m.filter(ImageFilter.MaxFilter(5))
  # fill holes: anything enclosed counts (cheap: use the shape's own alpha inside bbox)
  xs = [p[0] for p in px]; ys = [p[1] for p in px]
  bb = (min(xs)-3, min(ys)-3, max(xs)+4, max(ys)+4)
  cell.putalpha(Image.composite(cell.getchannel('A'), Image.new('L', cell.size, 0), m))
  piece = cell.crop(bb); w, h = piece.size
  side = int(max(w, h) * 1.08) + 1
  canvas = Image.new('RGBA', (side, side), (0, 0, 0, 0)); canvas.paste(piece, ((side-w)//2, (side-h)//2))
  canvas.resize((320, 320), Image.LANCZOS).save(f'{outdir}/sticker-{sid}.png', optimize=True)
  print(sid, box, len(px))

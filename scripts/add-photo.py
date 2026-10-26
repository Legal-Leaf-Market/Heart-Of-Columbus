#!/usr/bin/env python3
"""Add a photo a business OWNER sent us, ready for src/data/media.mjs.

    python3 scripts/add-photo.py <slug> <cover|logo|gallery> <image> --alt "What it shows"

Writes public/business-media/<slug>/<name>.webp (at most 1600 px wide; logos
keep their transparency) and prints the entry to paste into MEDIA. It never
fills in permission: that line is yours to write from the owner's actual
reply (who said yes, how, and when). A file with no manifest entry fails
tests/media.test.mjs, so nothing goes live by accident.

Only for photos the business gave us or a license we can cite. A picture on
their website is not permission.
"""
import argparse, os, sys
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument('slug'); ap.add_argument('role', choices=['cover', 'logo', 'gallery']); ap.add_argument('image')
ap.add_argument('--alt', required=True); ap.add_argument('--name')
a = ap.parse_args()

root = os.path.join(os.path.dirname(__file__), '..', 'public', 'business-media', a.slug)
os.makedirs(root, exist_ok=True)
name = a.name or (a.role if a.role != 'gallery' else f'gallery-{len([f for f in os.listdir(root) if f.startswith("gallery-")]) + 1}')
im = Image.open(a.image)
im = im.convert('RGBA' if a.role == 'logo' or im.mode in ('RGBA', 'LA', 'P') else 'RGB')
if im.width > 1600:
    im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
out = os.path.join(root, name + '.webp')
im.save(out, 'WEBP', quality=82, method=6)
entry = f"{{ file: '{name}.webp', width: {im.width}, height: {im.height}, alt: {a.alt!r} }}"
print(f'wrote {os.path.relpath(out)}', file=sys.stderr)
print(f"  {a.role}: {entry}," if a.role != 'gallery' else f"  gallery: [{entry}],")
print("  // and on the entry: sourceUrl, permission (who said yes, how, when), credit, checked")

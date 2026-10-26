#!/usr/bin/env python3
"""Write a .webp beside every .png in public/art/ (quality 82, alpha kept).

The pages load the WebP; the PNG stays as the exported master (see
art-source/README.md) and for the few places that need PNG (app icons).
Run after exporting new art:  python3 scripts/art-webp.py
tests/art.test.mjs fails if a page points at a .webp that is missing or
older than its PNG.
"""
import os
from PIL import Image

ART = os.path.join(os.path.dirname(__file__), '..', 'public', 'art')
for name in sorted(os.listdir(ART)):
    if not name.endswith('.png') or name.startswith('sports-app-icon'):
        continue
    png = os.path.join(ART, name)
    out = png[:-4] + '.webp'
    if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(png):
        continue
    Image.open(png).save(out, 'WEBP', quality=82, method=6)
    print('wrote', os.path.relpath(out))

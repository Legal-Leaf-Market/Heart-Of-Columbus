#!/usr/bin/env python3
"""Draws the Columbus app icons that had none: contractors, churches,
nonprofits, weddings and events (src/pages/app-pages.mjs names them).

Same style as the news and order icons: a rounded square in the app's theme
color with one flat cream and gold drawing on it. Our own art, made from
shapes; nothing traced. App icons stay PNG (phones read PNG for home screen
icons), so tests/art.test.mjs and scripts/art-webp.py skip every *-app-icon.

  python3 scripts/app-icons.py            # writes public/art/<name>-app-icon-{180,192,512}.png
"""
from pathlib import Path
from PIL import Image, ImageDraw

ART = Path(__file__).resolve().parent.parent / 'public' / 'art'
S = 1024  # drawn large, then scaled down for smooth edges
CREAM = (248, 238, 223, 255)
GOLD = (201, 152, 79, 255)

APPS = {
    'contractors': (43, 69, 57),
    'churches': (81, 64, 95),
    'nonprofits': (121, 59, 75),
    'weddings': (103, 55, 77),
    'events': (48, 81, 106),
}


def base(color):
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=color + (255,))
    return im, d


def contractors(d, bg):
    # A claw hammer, head across the top of the handle.
    d.rounded_rectangle([462, 330, 562, 840], radius=40, fill=GOLD)
    d.rounded_rectangle([250, 200, 560, 350], radius=28, fill=CREAM)
    d.polygon([(540, 210), (780, 160), (800, 220), (560, 330)], fill=CREAM)
    d.polygon([(560, 300), (800, 360), (770, 410), (545, 345)], fill=CREAM)
    d.rounded_rectangle([250, 200, 330, 350], radius=20, fill=CREAM)


def churches(d, bg):
    # A church with a steeple and a cross.
    d.rectangle([497, 150, 527, 290], fill=GOLD)
    d.rectangle([452, 190, 572, 220], fill=GOLD)
    d.polygon([(512, 260), (620, 420), (404, 420)], fill=CREAM)
    d.rectangle([404, 420, 620, 520], fill=CREAM)
    d.polygon([(250, 520), (512, 400), (774, 520)], fill=CREAM)
    d.rectangle([280, 520, 744, 840], fill=CREAM)
    d.rounded_rectangle([462, 660, 562, 840], radius=50, fill=bg + (255,))
    d.rectangle([462, 710, 562, 840], fill=bg + (255,))
    for x in (340, 624):
        d.rounded_rectangle([x, 590, x + 60, 690], radius=30, fill=GOLD)
    d.ellipse([482, 450, 542, 510], fill=GOLD)


def nonprofits(d, bg):
    # A heart, with a smaller heart inside it.
    def heart(cx, cy, r, fill):
        d.ellipse([cx - 2 * r, cy - r, cx, cy + r], fill=fill)
        d.ellipse([cx, cy - r, cx + 2 * r, cy + r], fill=fill)
        d.polygon([(cx - 2 * r + r * 0.12, cy + r * 0.45), (cx + 2 * r - r * 0.12, cy + r * 0.45), (cx, cy + 2.6 * r)], fill=fill)
    heart(512, 380, 175, CREAM)
    heart(512, 430, 80, GOLD)


def weddings(d, bg):
    # Two linked rings and a small diamond.
    w = 64
    d.ellipse([220, 360, 600, 740], outline=CREAM, width=w)
    d.ellipse([424, 360, 804, 740], outline=GOLD, width=w)
    d.arc([220, 360, 600, 740], start=-40, end=40, fill=CREAM, width=w)
    d.polygon([(512, 180), (580, 250), (512, 330), (444, 250)], fill=CREAM)


def events(d, bg):
    # A calendar page with one day marked.
    d.rounded_rectangle([200, 240, 824, 830], radius=60, fill=CREAM)
    d.rounded_rectangle([200, 240, 824, 400], radius=60, fill=GOLD)
    d.rectangle([200, 340, 824, 400], fill=GOLD)
    for x in (340, 652):
        d.rounded_rectangle([x, 170, x + 40, 300], radius=20, fill=CREAM)
        d.rounded_rectangle([x + 8, 178, x + 32, 292], radius=12, fill=bg + (255,))
    for row in range(3):
        for col in range(4):
            x0 = 270 + col * 130
            y0 = 460 + row * 115
            fill = GOLD if (row, col) == (1, 2) else bg + (255,)
            d.rounded_rectangle([x0, y0, x0 + 90, y0 + 80], radius=14, fill=fill)


DRAW = {'contractors': contractors, 'churches': churches, 'nonprofits': nonprofits, 'weddings': weddings, 'events': events}

if __name__ == '__main__':
    for name, color in APPS.items():
        im, d = base(color)
        DRAW[name](d, color)
        for size in (180, 192, 512):
            out = ART / f'{name}-app-icon-{size}.png'
            im.resize((size, size), Image.LANCZOS).save(out, optimize=True)
            print('wrote', out.relative_to(ART.parent.parent))

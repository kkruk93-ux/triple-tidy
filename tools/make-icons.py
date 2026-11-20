#!/usr/bin/env python3
"""Render PWA icons from a simple original mark."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)

def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Rounded cream background
    pad = int(size * 0.06)
    d.rounded_rectangle(
        [pad, pad, size - pad, size - pad],
        radius=int(size * 0.22),
        fill=(255, 244, 229, 255),
    )
    # Three stacked tiles
    def tile(cx, cy, s, rot_unused, fill, outline, icon=None):
        r = int(s * 0.22)
        box = [cx - s // 2, cy - s // 2, cx + s // 2, cy + s // 2]
        d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=max(2, size // 64))

    cream = (255, 251, 245, 255)
    line = (232, 213, 196, 255)
    teal = (31, 138, 122, 255)
    gold = (230, 176, 23, 255)
    s = int(size * 0.38)
    # back-left
    tile(int(size * 0.40), int(size * 0.52), s, -14, cream, line)
    # back-right
    tile(int(size * 0.62), int(size * 0.44), s, 10, cream, line)
    # front
    tile(int(size * 0.50), int(size * 0.56), int(size * 0.42), 0, cream, teal)
    # star on the front tile
    cx, cy = int(size * 0.50), int(size * 0.56)
    r = int(size * 0.13)
    pts = []
    import math
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        rad = r if i % 2 == 0 else r * 0.42
        pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
    d.polygon(pts, fill=gold)
    return img

for size in (192, 512):
    im = draw_icon(size)
    path = OUT / f"icon-{size}.png"
    im.save(path, "PNG")
    print(f"wrote {path} {im.size}")

# favicon-sized
draw_icon(64).resize((32, 32), Image.Resampling.LANCZOS).save(OUT / "favicon-32.png", "PNG")
print("done")

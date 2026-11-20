#!/usr/bin/env python3
"""Original Meadow Pile icons and Play feature graphic, drawn in code."""
from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "icons"
OUT.mkdir(exist_ok=True)

CREAM = (255, 251, 245, 255)
BG = (255, 244, 229, 255)
LINE = (232, 213, 196, 255)
TEAL = (31, 138, 122, 255)
GOLD = (230, 176, 23, 255)
LEAF = (47, 158, 107, 255)
LEAF_DARK = (30, 122, 82, 255)
INK = (44, 36, 28, 255)
CORAL = (232, 93, 76, 255)
CITRUS = (240, 162, 2, 255)
BERRY = (91, 111, 214, 255)
PEACH = (255, 215, 176, 255)


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def draw_leaf(draw, cx, cy, s):
    # Simple leaf blob + vein
    r = int(s * 0.42)
    # Approximate a leaf with overlapping ellipses via a polygon
    pts = []
    for i in range(16):
        ang = -math.pi / 2 + i * math.pi / 8
        rx = r * (0.55 if i % 2 else 1.0)
        ry = r
        # teardrop-ish by shrinking the bottom
        stretch = 1.15 if math.sin(ang) > 0 else 0.9
        x = cx + rx * 0.7 * math.cos(ang)
        y = cy + ry * stretch * math.sin(ang)
        pts.append((x, y))
    # Use a custom path: pointed top, rounded bottom
    leaf = [
        (cx, cy - r),
        (cx + r * 0.55, cy - r * 0.25),
        (cx + r * 0.7, cy + r * 0.35),
        (cx, cy + r * 0.95),
        (cx - r * 0.7, cy + r * 0.35),
        (cx - r * 0.55, cy - r * 0.25),
    ]
    draw.polygon(leaf, fill=LEAF)
    draw.line([(cx, cy - r * 0.7), (cx, cy + r * 0.7)], fill=LEAF_DARK, width=max(2, s // 28))
    draw.line([(cx, cy), (cx + r * 0.35, cy + r * 0.2)], fill=(166, 227, 196, 255), width=max(1, s // 40))
    draw.line([(cx, cy + r * 0.25), (cx - r * 0.3, cy + r * 0.4)], fill=(166, 227, 196, 255), width=max(1, s // 40))


def draw_tile(img, cx, cy, size, outline, icon="leaf", shadow=True):
    d = ImageDraw.Draw(img)
    half = size // 2
    box = [cx - half, cy - half, cx + half, cy + half]
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sbox = [box[0] + size * 0.04, box[1] + size * 0.06, box[2] + size * 0.04, box[3] + size * 0.08]
        sd.rounded_rectangle(sbox, radius=int(size * 0.22), fill=(80, 40, 20, 50))
        sh = sh.filter(ImageFilter.GaussianBlur(radius=max(1, size // 28)))
        img.alpha_composite(sh)
        d = ImageDraw.Draw(img)
    rounded_rect(d, box, int(size * 0.22), CREAM, outline, width=max(2, size // 28))
    if icon == "leaf":
        draw_leaf(d, cx, cy + int(size * 0.02), size)
    elif icon == "star":
        r = size * 0.28
        pts = []
        for i in range(10):
            ang = -math.pi / 2 + i * math.pi / 5
            rad = r if i % 2 == 0 else r * 0.42
            pts.append((cx + rad * math.cos(ang), cy + rad * math.sin(ang)))
        d.polygon(pts, fill=GOLD)
    elif icon == "apple":
        r = int(size * 0.22)
        d.ellipse([cx - r, cy - r * 0.7, cx + r, cy + r * 1.15], fill=CORAL)
        d.rectangle([cx - size * 0.03, cy - r * 1.15, cx + size * 0.03, cy - r * 0.4], fill=(107, 68, 35, 255))
        d.polygon(
            [(cx + size * 0.02, cy - r * 0.85), (cx + r * 0.9, cy - r * 1.15), (cx + r * 0.45, cy - r * 0.5)],
            fill=LEAF,
        )
    elif icon == "citrus":
        r = int(size * 0.24)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=CITRUS)
        d.ellipse([cx - r * 0.6, cy - r * 0.6, cx + r * 0.6, cy + r * 0.6], outline=(255, 211, 106, 255), width=max(1, size // 40))
    elif icon == "berry":
        r = int(size * 0.14)
        d.ellipse([cx - r * 1.6, cy - r * 0.2, cx - r * 0.1, cy + r * 1.4], fill=BERRY)
        d.ellipse([cx + r * 0.1, cy - r * 0.2, cx + r * 1.6, cy + r * 1.4], fill=(74, 92, 196, 255))
        d.ellipse([cx - r * 0.8, cy - r * 1.3, cx + r * 0.8, cy + r * 0.3], fill=(110, 128, 234, 255))


def icon_any(size: int, padded=False) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    pad = int(size * (0.08 if padded else 0.0))
    # Soft rounded background for the "any" icon (filled, for launchers that don't mask)
    inset = pad
    d.rounded_rectangle(
        [inset, inset, size - inset, size - inset],
        radius=int(size * 0.22),
        fill=BG,
    )
    # Three stacked tiles + leaf on front
    s = int(size * 0.36)
    draw_tile(img, int(size * 0.38), int(size * 0.50), s, LINE, "citrus")
    draw_tile(img, int(size * 0.64), int(size * 0.42), s, LINE, "apple")
    draw_tile(img, int(size * 0.50), int(size * 0.58), int(size * 0.40), TEAL, "leaf")
    return img


def icon_maskable(size: int) -> Image.Image:
    """Full-bleed background; artwork stays inside the 66% safe zone."""
    img = Image.new("RGBA", (size, size), BG)
    # Safe zone radius ~33% of size from center
    s = int(size * 0.28)
    draw_tile(img, int(size * 0.40), int(size * 0.50), s, LINE, "citrus")
    draw_tile(img, int(size * 0.62), int(size * 0.44), s, LINE, "apple")
    draw_tile(img, int(size * 0.50), int(size * 0.56), int(size * 0.32), TEAL, "leaf")
    return img


def font(size, bold=True):
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf" if bold else "/usr/share/fonts/truetype/freefont/FreeSans.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def feature_graphic() -> Image.Image:
    w, h = 1024, 500
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # Warm gradient
    for y in range(h):
        t = y / (h - 1)
        r = int(255 * (1 - t) + 255 * t)
        g = int(244 * (1 - t) + 215 * t)
        b = int(229 * (1 - t) + 176 * t)
        d.line([(0, y), (w, y)], fill=(r, g, b, 255))
    # Soft sun
    sun = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(sun)
    sd.ellipse([720, -80, 1120, 320], fill=(255, 211, 150, 90))
    img.alpha_composite(sun)

    # Pile of tiles on the right
    pile = [
        (800, 310, 150, LINE, "citrus"),
        (920, 260, 150, LINE, "apple"),
        (780, 200, 140, LINE, "berry"),
        (870, 210, 155, TEAL, "leaf"),
        (940, 350, 130, LINE, "star"),
        (720, 340, 130, LINE, "apple"),
    ]
    for cx, cy, s, outline, icon in pile:
        draw_tile(img, cx, cy, s, outline, icon)

    title = font(76, bold=True)
    tag = font(28, bold=False)
    d = ImageDraw.Draw(img)
    d.text((56, 148), "Meadow Pile", font=title, fill=INK)
    d.text((56, 248), "Match three. Clear the tray.", font=tag, fill=(107, 94, 82, 255))
    d.text((56, 290), "Tidy the pile.", font=tag, fill=(107, 94, 82, 255))
    return img


def main():
    for size in (192, 512):
        icon_any(size).save(OUT / f"icon-{size}.png", "PNG")
        icon_maskable(size).save(OUT / f"icon-{size}-maskable.png", "PNG")
        print("wrote", OUT / f"icon-{size}.png")
        print("wrote", OUT / f"icon-{size}-maskable.png")
    icon_any(64).resize((32, 32), Image.Resampling.LANCZOS).save(OUT / "favicon-32.png", "PNG")
    feat = feature_graphic()
    feat.convert("RGB").save(OUT / "feature-1024x500.png", "PNG")
    print("wrote", OUT / "feature-1024x500.png", feat.size)


if __name__ == "__main__":
    main()

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "assets" / "desktop"
OUT_DIR.mkdir(parents=True, exist_ok=True)

SIZE = 1024
img = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)


def lerp(a, b, t):
    return round(a + (b - a) * t)


for y in range(SIZE):
    t = y / (SIZE - 1)
    color = (
        lerp(245, 73, t),
        lerp(216, 25, t),
        lerp(170, 14, t),
        255,
    )
    draw.line([(0, y), (SIZE, y)], fill=color)

glow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
glow_draw = ImageDraw.Draw(glow)
glow_draw.ellipse((110, 70, 914, 874), fill=(255, 217, 126, 70))
glow = glow.filter(ImageFilter.GaussianBlur(60))
img.alpha_composite(glow)
draw = ImageDraw.Draw(img)

draw.rounded_rectangle((92, 92, 932, 932), radius=220, outline=(255, 236, 214, 90), width=8)

shadow = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
shadow_draw = ImageDraw.Draw(shadow)
shadow_draw.ellipse((240, 610, 804, 900), fill=(40, 13, 5, 150))
shadow = shadow.filter(ImageFilter.GaussianBlur(24))
img.alpha_composite(shadow)
draw = ImageDraw.Draw(img)

body_box = (240, 188, 772, 794)
draw.ellipse(body_box, fill=(199, 142, 81, 255), outline=(112, 58, 28, 255), width=18)
draw.ellipse((292, 246, 724, 734), fill=(224, 170, 106, 120))

draw.ellipse((320, 278, 400, 358), fill=(69, 31, 17, 230))
draw.ellipse((545, 278, 625, 358), fill=(69, 31, 17, 230))
draw.ellipse((349, 307, 377, 335), fill=(255, 246, 233, 220))
draw.ellipse((574, 307, 602, 335), fill=(255, 246, 233, 220))

draw.arc((385, 362, 560, 470), start=18, end=165, fill=(103, 47, 26, 255), width=14)
draw.arc((355, 404, 610, 560), start=15, end=165, fill=(103, 47, 26, 230), width=10)

for points in (
    [(460, 166), (420, 110), (486, 146)],
    [(568, 174), (620, 120), (596, 182)],
):
    draw.polygon(points, fill=(191, 132, 76, 255), outline=(112, 58, 28, 255))

draw.rounded_rectangle((628, 432, 890, 512), radius=32, fill=(84, 39, 25, 255), outline=(255, 214, 156, 120), width=8)
draw.rounded_rectangle((704, 458, 934, 500), radius=20, fill=(132, 74, 39, 255))
draw.rectangle((728, 430, 778, 458), fill=(66, 31, 21, 255))
draw.rectangle((654, 502, 716, 620), fill=(66, 31, 21, 255))
draw.rounded_rectangle((628, 506, 758, 566), radius=22, fill=(103, 52, 31, 255))
draw.ellipse((606, 446, 702, 542), fill=(255, 214, 156, 80))

draw.line((634, 510, 556, 604), fill=(84, 39, 25, 255), width=26)
draw.line((558, 604, 486, 720), fill=(84, 39, 25, 255), width=22)
draw.line((388, 580, 334, 738), fill=(84, 39, 25, 255), width=26)
draw.line((598, 742, 542, 920), fill=(84, 39, 25, 255), width=28)
draw.line((420, 742, 358, 920), fill=(84, 39, 25, 255), width=28)

for x1, y1, x2, y2, x3, y3 in (
    (258, 520, 206, 486, 194, 548),
    (796, 272, 860, 222, 848, 306),
    (188, 668, 128, 648, 146, 714),
):
    draw.line((x1, y1, x2, y2), fill=(248, 208, 138, 220), width=12)
    draw.line((x1, y1, x3, y3), fill=(248, 208, 138, 180), width=10)

img.save(OUT_DIR / "app-icon.png")
img.resize((256, 256), Image.LANCZOS).save(OUT_DIR / "app-icon-256.png")
img.resize((64, 64), Image.LANCZOS).save(OUT_DIR / "app-icon-64.png")
img.save(
    OUT_DIR / "app-icon.ico",
    sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)],
)

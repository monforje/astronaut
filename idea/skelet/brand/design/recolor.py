# /// script
# requires-python = ">=3.12"
# dependencies = ["numpy", "pillow"]
# ///
"""Перекраска бренда: сдвигает цвета SVG и пиксели PNG со старой палитры на новую.

Каждый цвет переводится в OKLab и сдвигается на взвешенную сумму сдвигов фирменных цветов. Вес —
обратное расстояние до старого фирменного цвета в четвёртой степени, поэтому чистые фирменные
цвета переходят точно, а сглаженные края, оттенки трассировки и полутени — плавно, без ступенек.
Альфа PNG не меняется. ICO собираются заново из перекрашенных PNG с теми же размерами.

    uv run idea/skelet/brand/design/recolor.py \\
        --from 041A31,00C4C0,F88030,F4ECE0,FDFDFD --to 082F53,00D4D0,FF9455,FBF5EB,FFFFFF \\
        --exclude design/specimen.png idea/skelet/brand

Запускать один раз на смену палитры: повторный прогон сдвинет цвета ещё раз. Симлинки
(`public/`) пропускаются — они указывают на уже обработанные файлы. Текстовые файлы с hex
(tokens.css, theme.ts, README) правятся руками: там цвета подписаны словами.
"""

import argparse
import re
from pathlib import Path

import numpy as np
from PIL import Image

HEX6 = re.compile(r"#([0-9a-fA-F]{6})\b")


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


M1 = np.array(
    [
        [0.4122214708, 0.5363325363, 0.0514459929],
        [0.2119034982, 0.6806995451, 0.1073969566],
        [0.0883024619, 0.2817188376, 0.6299787005],
    ]
)
M2 = np.array(
    [
        [0.2104542553, 0.7936177850, -0.0040720468],
        [1.9779984951, -2.4285922050, 0.4505937099],
        [0.0259040371, 0.7827717662, -0.8086757660],
    ]
)


def rgb_to_oklab(rgb: np.ndarray) -> np.ndarray:
    """rgb: (..., 3) в 0..1 → OKLab."""
    lms = srgb_to_linear(rgb) @ M1.T
    return np.cbrt(lms) @ M2.T


def oklab_to_rgb(lab: np.ndarray) -> np.ndarray:
    lms = (lab @ np.linalg.inv(M2).T) ** 3
    return linear_to_srgb(lms @ np.linalg.inv(M1).T)


def hex_to_rgb(h: str) -> np.ndarray:
    h = h.lstrip("#")
    return np.array([int(h[i : i + 2], 16) for i in (0, 2, 4)], dtype=float) / 255


class Recolor:
    def __init__(self, old: list[str], new: list[str]):
        self.old = rgb_to_oklab(np.stack([hex_to_rgb(h) for h in old]))
        self.delta = rgb_to_oklab(np.stack([hex_to_rgb(h) for h in new])) - self.old

    def lab(self, lab: np.ndarray) -> np.ndarray:
        """Сдвиг массива OKLab (N, 3)."""
        d2 = ((lab[:, None, :] - self.old[None, :, :]) ** 2).sum(-1)
        w = 1 / (d2**2 + 1e-12)
        w /= w.sum(1, keepdims=True)
        return lab + w @ self.delta

    def rgb8(self, rgb: np.ndarray) -> np.ndarray:
        """Цвета (N, 3) uint8 → uint8."""
        out = oklab_to_rgb(self.lab(rgb_to_oklab(rgb.astype(float) / 255)))
        return np.clip(np.rint(out * 255), 0, 255).astype(np.uint8)


def recolor_svg(path: Path, rc: Recolor) -> int:
    text = path.read_text(encoding="utf-8")
    found = sorted({m.group(1) for m in HEX6.finditer(text)})
    if not found:
        return 0
    rgb = np.array([[int(h[i : i + 2], 16) for i in (0, 2, 4)] for h in found], dtype=np.uint8)
    mapped = rc.rgb8(rgb)
    table = {}
    for h, (r, g, b) in zip(found, mapped):
        new = f"{r:02x}{g:02x}{b:02x}"
        table[h] = new.upper() if h.isupper() or h.isdigit() else new
    path.write_text(HEX6.sub(lambda m: "#" + table[m.group(1)], text), encoding="utf-8")
    return len(found)


def recolor_png(path: Path, rc: Recolor) -> int:
    img = Image.open(path)
    mode = img.mode
    rgba = np.array(img.convert("RGBA"))
    flat = rgba[..., :3].reshape(-1, 3)
    colors, inverse = np.unique(flat, axis=0, return_inverse=True)
    rgba[..., :3] = rc.rgb8(colors)[inverse.reshape(-1)].reshape(rgba.shape[:2] + (3,))
    out = Image.fromarray(rgba, "RGBA")
    if mode == "RGB":
        out = out.convert("RGB")
    out.save(path, optimize=True)
    return len(colors)


def rebuild_ico(path: Path) -> list[tuple[int, int]]:
    """ICO из PNG с тем же именем (favicon.ico ← favicon.png) с прежними размерами."""
    source = path.with_suffix(".png")
    sizes = sorted(Image.open(path).info.get("sizes") or {(32, 32)})
    Image.open(source).convert("RGBA").save(path, sizes=sizes)
    return sizes


def main() -> None:
    parser = argparse.ArgumentParser(description=(__doc__ or "").splitlines()[0])
    parser.add_argument("--from", dest="old", required=True, help="старые hex через запятую")
    parser.add_argument("--to", dest="new", required=True, help="новые hex в том же порядке")
    parser.add_argument("--exclude", action="append", default=[], help="путь от корня, пропустить")
    parser.add_argument("root", type=Path)
    args = parser.parse_args()

    old, new = args.old.split(","), args.new.split(",")
    if len(old) != len(new):
        parser.error("--from и --to разной длины")
    rc = Recolor(old, new)
    skip = {(args.root / e).resolve() for e in args.exclude}

    files = [
        p
        for p in sorted(args.root.rglob("*"))
        if p.is_file() and not p.is_symlink() and p.resolve() not in skip
    ]
    for p in files:
        if p.suffix == ".svg":
            print(f"svg {p.relative_to(args.root)}: {recolor_svg(p, rc)} цветов")
        elif p.suffix == ".png":
            print(f"png {p.relative_to(args.root)}: {recolor_png(p, rc)} цветов")
    for p in files:
        if p.suffix == ".ico" and p.with_suffix(".png").exists():
            print(f"ico {p.relative_to(args.root)}: {rebuild_ico(p)}")


if __name__ == "__main__":
    main()

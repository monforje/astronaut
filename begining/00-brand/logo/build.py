# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools>=4.50", "uharfbuzz>=0.39", "pillow>=10"]
# ///
"""Astronaut logo kit: SVG, PNG, animated SVG/APNG/GIF/WebM/MP4.

Run: `uv run 00-brand/logo/build.py`. Needs rsvg-convert and ffmpeg on PATH.

Construction: a helmet-planet with a glint, an orbit whose back half passes behind it and
front half in front of it (with a clearance gap), and the orange message riding the orbit.
"""
import math
import shutil
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image

HERE = Path(__file__).resolve().parent
FONT = HERE.parent / ".fonts" / "Unbounded.ttf"
OUT_SVG, OUT_PNG, OUT_ANIM = HERE / "svg", HERE / "png", HERE / "animated"

INK, SUIT, PORCELAIN, WHITE = "#13203A", "#E8541C", "#EEF1F5", "#FFFFFF"
C = 32.0  # everything is drawn on a 64×64 grid around (32, 32)


@dataclass(frozen=True)
class Spec:
    r: float        # planet / helmet
    rx: float       # orbit
    ry: float
    tilt: float     # degrees
    stroke: float
    dot: float
    gap: float      # clearance around the front orbit and the message
    dot_t: float    # resting angle of the message on the orbit
    glint: bool


FULL = Spec(r=16.5, rx=27.2, ry=8.8, tilt=-21, stroke=3.2, dot=4.8, gap=2.0, dot_t=24, glint=True)
# 16–48 px: rounder, heavier, no glint; clearance stays visible at a few pixels.
SMALL = Spec(r=19.5, rx=27, ry=11, tilt=-24, stroke=5.2, dot=6.8, gap=2.8, dot_t=34, glint=False)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def orbit_pt(s, t_deg):
    t, a = math.radians(t_deg), math.radians(s.tilt)
    x, y = s.rx * math.cos(t), s.ry * math.sin(t)
    return C + x * math.cos(a) - y * math.sin(a), C + x * math.sin(a) + y * math.cos(a)


def is_front(t_deg):
    return math.sin(math.radians(t_deg)) >= 0


def glint_path(s, color):
    a0, a1, gr = math.radians(200), math.radians(248), s.r - 5
    p0 = (C + gr * math.cos(a0), C + gr * math.sin(a0))
    p1 = (C + gr * math.cos(a1), C + gr * math.sin(a1))
    return (f'<path d="M{f(p0[0])} {f(p0[1])}A{f(gr)} {f(gr)} 0 0 1 {f(p1[0])} {f(p1[1])}" '
            f'fill="none" stroke="{color}" stroke-width="2.6" stroke-linecap="round"/>')


def mark_body(theme, s, uid, t=None, tail=0.0):
    """SVG body of the mark with the message at angle `t` (default: resting pose).

    `tail` lights up that many degrees of orbit behind the message, fading orbit → message
    colour in solid steps (no alpha, so nothing muddies over the ink).
    """
    planet, orbit, dot, glint = theme
    t = s.dot_t if t is None else t
    rot = f"rotate({f(s.tilt)} {f(C)} {f(C)})"
    ell = f'<ellipse cx="{f(C)}" cy="{f(C)}" rx="{f(s.rx)}" ry="{f(s.ry)}" transform="{rot}"/>'
    front = f'<path d="M{f(C - s.rx)} {f(C)}A{f(s.rx)} {f(s.ry)} 0 0 0 {f(C + s.rx)} {f(C)}" transform="{rot}"/>'
    front_clip = f'<rect x="-40" y="{f(C)}" width="160" height="80" transform="{rot}"/>'

    x, y = orbit_pt(s, t)
    r = s.dot * (1 + 0.1 * math.sin(math.radians(t)))  # nearer = slightly bigger
    msg = f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{dot}"/>'
    behind, ahead = ("", msg) if is_front(t) else (msg, "")
    hole = f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r + s.gap)}"/>'
    # The planet is bitten only when the message passes in front of it.
    planet_hole = hole if is_front(t) else ""

    # Tail: pure message colour riding the orbit, tapering to nothing. Solid fills only.
    steps = 30
    lit = ""
    for j in range(steps if tail else 0):
        k0, k1 = j / steps, (j + 1) / steps
        a0, a1 = t - tail * (1 - k0), t - tail * (1 - k1) + 0.5
        pts = [orbit_pt(s, a0 + (a1 - a0) * q / 3) for q in range(4)]
        lit += (f'<path d="M{" L".join(f"{f(px)} {f(py)}" for px, py in pts)}" '
                f'stroke="{dot}" stroke-width="{f(s.stroke * k1 ** 1.3)}"/>')

    sw = f(s.stroke)
    return f"""<defs>
<mask id="{uid}-p" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><g fill="none" stroke="#000" stroke-width="{f(s.stroke + 2 * s.gap)}" stroke-linecap="round">{front}</g><g fill="#000">{planet_hole}</g></mask>
<mask id="{uid}-o" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><g fill="#000">{hole}</g></mask>
<mask id="{uid}-b" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><circle cx="{f(C)}" cy="{f(C)}" r="{f(s.r + s.gap)}"/></mask>
<clipPath id="{uid}-f">{front_clip}</clipPath>
</defs>
<g mask="url(#{uid}-b)"><g mask="url(#{uid}-o)" fill="none" stroke="{orbit}" stroke-width="{sw}">{ell}{lit}</g>{behind}</g>
<g mask="url(#{uid}-p)"><circle cx="{f(C)}" cy="{f(C)}" r="{f(s.r)}" fill="{planet}"/>{glint_path(s, glint) if s.glint else ""}</g>
<g clip-path="url(#{uid}-f)"><g mask="url(#{uid}-o)" fill="none" stroke="{orbit}" stroke-width="{sw}">{ell}{lit}</g></g>
{ahead}"""


THEMES = {  # planet, orbit, message, glint
    "color": (INK, INK, SUIT, WHITE),
    "inverse": (WHITE, WHITE, SUIT, INK),
    "mono-ink": (INK, INK, INK, WHITE),
    "mono-white": (WHITE, WHITE, WHITE, INK),
}


def svg(w, h, body, label="Astronaut"):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {f(w)} {f(h)}" width="{f(w)}" height="{f(h)}" '
            f'role="img" aria-label="{label}">{body}</svg>\n')


# ---------- Wordmark: Unbounded SemiBold, outlined, kerned by HarfBuzz ----------
def wordmark(text="Astronaut", wght=600, cap=19.0):
    """(path d, width, cap) with the baseline at y=0 and cap height == `cap` units."""
    font = instantiateVariableFont(TTFont(FONT), {"wght": wght})
    s = cap / font["OS/2"].sCapHeight
    with tempfile.NamedTemporaryFile(suffix=".ttf") as tmp:
        font.save(tmp.name)
        hbfont = hb.Font(hb.Face(hb.Blob.from_file_path(tmp.name)))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True})
    gs, order = font.getGlyphSet(), font.getGlyphOrder()
    pen = SVGPathPen(gs, ntos=f)
    x = 0.0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        gs[order[info.codepoint]].draw(TransformPen(pen, (s, 0, 0, -s, (x + pos.x_offset) * s, 0)))
        x += pos.x_advance
    return pen.getCommands(), x * s, cap


GAP_H = 13  # mark → wordmark


def horizontal(word, mark, text_color):
    d, ww, cap = word
    return 64 + GAP_H + ww, 64, mark + f'<path transform="translate({64 + GAP_H} {f(C + cap / 2)})" fill="{text_color}" d="{d}"/>'


def stacked(word, mark, text_color):
    d, ww, cap = word
    k = 1.6
    w = max(64 * k, ww) + 4
    h = 64 * k + 14 + cap
    return w, h, (f'<g transform="translate({f((w - 64 * k) / 2)} 0) scale({k})">{mark}</g>'
                  f'<path transform="translate({f((w - ww) / 2)} {f(h)})" fill="{text_color}" d="{d}"/>')


def app_icon(bg, theme, uid):
    return (f'<rect width="64" height="64" rx="14" fill="{bg}"/>'
            f'<g transform="translate(32 33) scale(.72) translate(-32 -32)">{mark_body(theme, SMALL, uid)}</g>')


def rsvg(src, dst, w=None, h=None):
    cmd = ["rsvg-convert", str(src), "-o", str(dst)]
    cmd += ["-w", str(w)] if w else []
    cmd += ["-h", str(h)] if h else []
    subprocess.run(cmd, check=True)


# ---------- Animation ----------
FPS, SECONDS = 30, 3.2
TAIL = 75  # degrees of lit orbit behind the moving message


def anim_t(i, n):
    # Faster behind the planet, slower in front: reads as perspective and keeps the message on stage.
    p = i / n
    return (90 + 360 * p - 30 * math.sin(2 * math.pi * p)) % 360  # slowest at 90° = front centre


def animated_svg(word=None, theme=THEMES["color"], text_color=INK):
    """SMIL loop with no JS: the message rides the orbit and hides behind the planet."""
    s = FULL
    planet, orbit, dot, glint = theme
    rot = f"rotate({f(s.tilt)} {f(C)} {f(C)})"
    ell = f'<ellipse cx="{f(C)}" cy="{f(C)}" rx="{f(s.rx)}" ry="{f(s.ry)}" transform="{rot}"/>'
    front = f'<path d="M{f(C - s.rx)} {f(C)}A{f(s.rx)} {f(s.ry)} 0 0 0 {f(C + s.rx)} {f(C)}" transform="{rot}"/>'
    path = "M" + "L".join(f"{f(x)} {f(y)}" for x, y in (orbit_pt(s, s.dot_t + k * 3) for k in range(121))) + "Z"

    def mover(r, fill="#000"):
        return (f'<circle r="{f(r)}" fill="{fill}"><animateMotion dur="{SECONDS}s" repeatCount="indefinite" '
                f'path="{path}"/></circle>')

    dots = mover(s.dot, dot)
    hole = mover(s.dot + s.gap)
    # The planet's clearance hole is clipped to the front half, so it never opens while the message is behind.
    body = f"""<defs>
<clipPath id="a-f"><rect x="-40" y="{f(C)}" width="160" height="80" transform="{rot}"/></clipPath>
<mask id="a-p" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><g fill="none" stroke="#000" stroke-width="{f(s.stroke + 2 * s.gap)}" stroke-linecap="round">{front}</g><g clip-path="url(#a-f)">{hole}</g></mask>
<mask id="a-o" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>{hole}</mask>
<mask id="a-b" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/><circle cx="{f(C)}" cy="{f(C)}" r="{f(s.r + s.gap)}"/></mask>
</defs>
<g mask="url(#a-b)"><g mask="url(#a-o)" fill="none" stroke="{orbit}" stroke-width="{f(s.stroke)}">{ell}</g>{dots}</g>
<g mask="url(#a-p)"><circle cx="{f(C)}" cy="{f(C)}" r="{f(s.r)}" fill="{planet}"/>{glint_path(s, glint)}</g>
<g clip-path="url(#a-f)"><g mask="url(#a-o)" fill="none" stroke="{orbit}" stroke-width="{f(s.stroke)}">{ell}</g>{dots}</g>"""
    if word is None:
        return svg(64, 64, body)
    return svg(*horizontal(word, body, text_color))


def render_animation(name, frame_svg, size, bg):
    """Frames via rsvg → GIF and MP4 on `bg`; WebM and APNG keep alpha."""
    n = int(FPS * SECONDS)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for i in range(n):
            (tmp / "f.svg").write_text(frame_svg(i, n))
            rsvg(tmp / "f.svg", tmp / f"{i:04d}.png", w=size[0], h=size[1])
        ff = ["ffmpeg", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%04d.png")]
        on_bg = ["-f", "lavfi", "-i", f"color=c={bg}:s={size[0]}x{size[1]}:r={FPS}", "-filter_complex"]
        subprocess.run(ff + on_bg + [
            "[1][0]overlay=shortest=1,split[a][b];[a]palettegen=stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a",
            "-loop", "0", str(OUT_ANIM / f"{name}.gif")], check=True)
        subprocess.run(ff + on_bg + ["[1][0]overlay=shortest=1,format=yuv420p", "-c:v", "libx264", "-crf", "16",
                                     "-movflags", "+faststart", str(OUT_ANIM / f"{name}.mp4")], check=True)
        subprocess.run(ff + ["-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24",
                             "-auto-alt-ref", "0", str(OUT_ANIM / f"{name}.webm")], check=True)
        subprocess.run(ff + ["-plays", "0", "-f", "apng", str(OUT_ANIM / f"{name}.apng")], check=True)


def check_fits(s, animated, margin=1.0):
    """Orbit and message (at every angle if animated, else at rest) must stay inside the 64-unit canvas."""
    for t in range(0, 360, 2):
        x, y = orbit_pt(s, t)
        moving = animated or abs((t - s.dot_t + 180) % 360 - 180) < 2
        ext = s.dot * (1 + 0.1 * math.sin(math.radians(t))) if moving else s.stroke / 2
        assert margin <= x - ext and x + ext <= 64 - margin and margin <= y - ext and y + ext <= 64 - margin, (s, t)


def main():
    check_fits(FULL, animated=True)
    check_fits(SMALL, animated=False)
    for d in (OUT_SVG, OUT_PNG, OUT_ANIM):
        shutil.rmtree(d, ignore_errors=True)
        d.mkdir(parents=True)
    word = wordmark()
    d, ww, cap = word

    files = {}
    for name, theme in THEMES.items():
        text = WHITE if theme[0] == WHITE else INK
        files[f"mark-{name}"] = (64, 64, mark_body(theme, FULL, f"m-{name}"))
        files[f"mark-small-{name}"] = (64, 64, mark_body(theme, SMALL, f"ms-{name}"))
        files[f"logo-horizontal-{name}"] = horizontal(word, mark_body(theme, FULL, f"h-{name}"), text)
        files[f"logo-stacked-{name}"] = stacked(word, mark_body(theme, FULL, f"s-{name}"), text)
    files["app-icon"] = (64, 64, app_icon(INK, THEMES["inverse"], "ai"))
    files["app-icon-light"] = (64, 64, app_icon(PORCELAIN, THEMES["color"], "al"))
    for color, hexv in (("ink", INK), ("white", WHITE)):
        files[f"wordmark-{color}"] = (ww, cap + 0.5, f'<path transform="translate(0 {f(cap)})" fill="{hexv}" d="{d}"/>')
    for name, (w, h, body) in files.items():
        (OUT_SVG / f"{name}.svg").write_text(svg(w, h, body))

    # Favicon: small mark, flips to white in dark browser chrome.
    fav = mark_body(("var(--p)", "var(--p)", SUIT, WHITE), SMALL, "fv")
    (OUT_SVG / "favicon.svg").write_text(svg(64, 64,
        "<style>:root{--p:#13203A}@media (prefers-color-scheme:dark){:root{--p:#FFFFFF}}</style>" + fav))

    for theme in THEMES:
        for px in (16, 24, 32, 48):
            rsvg(OUT_SVG / f"mark-small-{theme}.svg", OUT_PNG / f"mark-{theme}-{px}.png", w=px)
        for px in (64, 128, 256, 512, 1024):
            rsvg(OUT_SVG / f"mark-{theme}.svg", OUT_PNG / f"mark-{theme}-{px}.png", w=px)
        for kind in ("horizontal", "stacked"):
            for px in (64, 128, 256, 512):
                rsvg(OUT_SVG / f"logo-{kind}-{theme}.svg", OUT_PNG / f"logo-{kind}-{theme}-{px}h.png", h=px)
    for px in (180, 192, 512, 1024):
        rsvg(OUT_SVG / "app-icon.svg", OUT_PNG / f"app-icon-{px}.png", w=px)
        rsvg(OUT_SVG / "app-icon-light.svg", OUT_PNG / f"app-icon-light-{px}.png", w=px)
    rsvg(OUT_SVG / "mark-small-color.svg", OUT_PNG / "_ico.png", w=256)
    Image.open(OUT_PNG / "_ico.png").save(OUT_PNG / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    (OUT_PNG / "_ico.png").unlink()

    # Social card 1200×630.
    lw, lh, lbody = horizontal(word, mark_body(THEMES["inverse"], FULL, "og"), WHITE)
    k = 640 / lw
    stars = "".join(f'<circle cx="{(i * 397) % 1200}" cy="{(i * 211 + 37) % 630}" r="{f(.8 + (i % 3) * .5)}"/>'
                    for i in range(1, 70))
    og = (f'<rect width="1200" height="630" fill="{INK}"/><g fill="{WHITE}" opacity=".35">{stars}</g>'
          f'<g transform="translate({f(600 - lw * k / 2)} {f(315 - lh * k / 2)}) scale({f(k)})">{lbody}</g>')
    (OUT_SVG / "og-image.svg").write_text(svg(1200, 630, og))
    rsvg(OUT_SVG / "og-image.svg", OUT_PNG / "og-image.png")

    # Animations.
    (OUT_ANIM / "mark-animated.svg").write_text(animated_svg())
    (OUT_ANIM / "mark-animated-inverse.svg").write_text(animated_svg(theme=THEMES["inverse"]))
    (OUT_ANIM / "logo-horizontal-animated.svg").write_text(animated_svg(word))
    (OUT_ANIM / "logo-horizontal-animated-inverse.svg").write_text(
        animated_svg(word, THEMES["inverse"], WHITE))
    for theme, bg in (("color", WHITE), ("inverse", INK)):
        sfx = "" if theme == "color" else "-inverse"
        text = INK if theme == "color" else WHITE
        render_animation(f"mark-animated{sfx}",
                         lambda i, n, t=theme: svg(64, 64, mark_body(THEMES[t], FULL, "a", anim_t(i, n), TAIL)),
                         (512, 512), bg)
        w, _, _ = horizontal(word, "", text)
        render_animation(f"logo-horizontal-animated{sfx}",
                         lambda i, n, t=theme, c=text: svg(*horizontal(word, mark_body(THEMES[t], FULL, "a", anim_t(i, n), TAIL), c)),
                         (round(w * 4 / 2) * 2, 256), bg)
    print("done:", sum(1 for p in HERE.rglob("*") if p.is_file()), "files")


if __name__ == "__main__":
    main()

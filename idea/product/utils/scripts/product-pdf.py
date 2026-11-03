#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["weasyprint>=62"]
# ///
"""Собирает папку idea/product/ в один PDF: idea/product/product.pdf.

Запуск из любого места:  uv run idea/product/utils/scripts/product-pdf.py
Нужен pandoc в системе (apt install pandoc).
Порядок — по номерам файлов; README идёт первым, CLAUDE.md (симлинк на README) пропускаем.
"""

import html
import re
import subprocess
from pathlib import Path

from weasyprint import HTML

REPO = Path(__file__).resolve().parents[4]
IDEA = REPO / "idea/product"
OUT = IDEA / "product.pdf"

ORDER = [("README.md", "Обзор")]
README_DROP = ()

FONTS = REPO / "idea/skelet/brand/design/fonts"
LOGO = REPO / "idea/skelet/brand/logo-mark.svg"


def included(rel: str) -> bool:
    return rel.endswith(".md") and rel != "CLAUDE.md"


ALL = {str(p.relative_to(IDEA)) for p in IDEA.rglob("*.md")}
DOCS = [r for r in ALL if included(r)]
ORDER = [(f, g) for f, g in ORDER if f in DOCS] + [(f, None) for f in sorted(set(DOCS) - {f for f, _ in ORDER})]


def slug(rel: str) -> str:
    return "d-" + re.sub(r"[^a-z0-9]+", "-", rel.lower()).strip("-")


def title_of(rel: str) -> str:
    m = re.search(r"^#\s+(.+)$", (IDEA / rel).read_text(), re.M)
    return m.group(1).strip() if m else rel


TITLES = {r: title_of(r) for r in DOCS}


def clean_md(rel: str, text: str) -> str:
    # строка навигации по файлам под заголовком: "> [← Карта папки](../README.md) · ..."
    text = re.sub(r"^>\s*\[←.*\n", "", text, flags=re.M)
    if rel == "README.md":
        for sec in README_DROP:
            text = re.sub(rf"^## {sec}\n.*?(?=^## |\Z)", "", text, flags=re.M | re.S)
    return text


def resolve(rel: str, url: str):
    """Ссылка из rel → (target_rel | None, fragment)."""
    path, _, frag = url.partition("#")
    if not path:
        return rel, frag
    target = (IDEA / rel).parent.joinpath(path).resolve()
    if target.is_dir():
        target = target / "README.md"
    try:
        return str(target.relative_to(IDEA)), frag
    except ValueError:
        return None, frag


FILENAME_TEXT = re.compile(r"^[\w./-]+(\.md|/)$")
MD_NAME = re.compile(r"[\w./-]+\.md\b")


def doc_html(rel: str) -> str:
    out = subprocess.run(
        ["pandoc", "-f", "gfm", "-t", "html5", "--wrap=none", f"--id-prefix={slug(rel)}--"],
        input=clean_md(rel, (IDEA / rel).read_text()), capture_output=True, text=True, check=True,
    ).stdout

    def link(m):
        url, text = html.unescape(m.group(1)), m.group(2)
        if re.match(r"^[a-z]+:", url):
            return m.group(0)
        target, frag = resolve(rel, url)
        frag = frag.removeprefix(f"{slug(rel)}--")  # pandoc уже добавил префикс к #якорям внутри файла
        if target not in DOCS:  # ссылка на то, чего нет в PDF — оставляем текстом
            return text
        if FILENAME_TEXT.match(re.sub(r"<[^>]+>", "", text)):  # текст ссылки = имя файла
            text = html.escape(TITLES[target])
        else:  # имя файла внутри текста: «layers.md, слой 4»
            text = MD_NAME.sub(lambda _: html.escape(TITLES[target]), text)
        href = f"#{slug(target)}--{frag}" if frag else f"#{slug(target)}"
        return f'<a href="{href}">{text}</a>'

    def code_name(m):  # `../product/layers.md` в тексте → название раздела
        target, _ = resolve(rel, html.unescape(m.group(1)))
        return html.escape(TITLES[target]) if target in DOCS else m.group(0)

    out = re.sub(r'<a href="([^"]*)"[^>]*>(.*?)</a>', link, out, flags=re.S)
    out = re.sub(r"<code>([\w./-]+\.md)</code>", code_name, out)
    # чек-листы: чекбокс → значок в строку
    out = out.replace("<input type=\"checkbox\" checked=\"\" />", "<span class=\"cb\">☑</span>")
    out = out.replace("<input type=\"checkbox\" />", "<span class=\"cb\">☐</span>")
    # таблицы с 6+ колонками — мельче
    out = re.sub(r"<table>(\s*<colgroup>.*?</colgroup>)?\s*<thead>(.*?)</thead>",
                 lambda m: m.group(0).replace("<table>", "<div class=\"land\"><table class=\"wide\">", 1)
                 if m.group(2).count("<th") >= 6 else m.group(0), out, flags=re.S)
    out = re.sub(r"(<table class=\"wide\">.*?</table>)", r"\1</div>", out, flags=re.S)
    # первый h1 файла — заголовок раздела
    return re.sub(r"<h1[^>]*>", f'<h1 class="doc-title" id="{slug(rel)}">', out, count=1)


CSS = """
@font-face { font-family: Onest; src: url("%(onest)s"); font-weight: 100 900; }
@font-face { font-family: JBM; src: url("%(mono)s"); font-weight: 100 800; }
@page { size: A4; margin: 22mm 20mm 20mm 20mm;
  @bottom-center { content: counter(page); font: 9pt Onest; color: #8a94a0; } }
@page :first { @bottom-center { content: none; } }
html { font-family: Onest, sans-serif; font-size: 10.5pt; line-height: 1.55; color: #12202f; }
body { margin: 0; }
p, li { orphans: 3; widows: 3; }
a { color: #007f7c; text-decoration: none; }
code, pre { font-family: JBM, monospace; font-size: 0.85em; }
code { background: #f2eee7; padding: 0 0.2em; border-radius: 2px; }
pre { background: #f6f3ee; padding: 8px 10px; white-space: pre-wrap; }
h1, h2, h3, h4 { color: #041a31; line-height: 1.25; page-break-after: avoid; bookmark-level: none; }
h1.doc-title { font-size: 22pt; font-weight: 800; margin: 0 0 14pt; page-break-before: always; bookmark-level: 1; }
h1:not(.doc-title) { font-size: 16pt; }
h2 { font-size: 14pt; font-weight: 700; margin: 20pt 0 6pt; bookmark-level: 2; }
h3 { font-size: 11.5pt; font-weight: 700; margin: 14pt 0 4pt; }
h4 { font-size: 10.5pt; margin: 10pt 0 4pt; }
blockquote { margin: 10pt 0; padding: 2pt 12pt; border-left: 3px solid #f88030; color: #34414f; }
table { border-collapse: collapse; width: 100%%; margin: 10pt 0; font-size: 9pt; line-height: 1.4; }
th, td { border-bottom: 1px solid #e2ddd4; padding: 4pt 6pt; vertical-align: top; text-align: left; }
th { border-bottom: 2px solid #041a31; font-weight: 700; }
tr { page-break-inside: avoid; }
td, th { hyphens: auto; }
td a, td code { overflow-wrap: anywhere; }
@page land { size: A4 landscape; margin: 15mm 15mm 15mm 15mm; }
.land { page: land; }
table.wide { font-size: 8pt; }
table.wide th, table.wide td { padding: 3pt 3pt; }
img { max-width: 100%%; }
ul.task-list { list-style: none; padding-left: 0; }
ul.task-list li { padding-left: 1.5em; text-indent: -1.5em; }
.cb { font-family: "DejaVu Sans Mono", monospace; display: inline-block; width: 1.5em; text-indent: 0; color: #007f7c; }
hr { border: 0; border-top: 1px solid #e2ddd4; margin: 16pt 0; }

.cover { height: 230mm; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
.cover img { width: 55mm; margin-bottom: 12mm; }
.cover h1 { font-size: 40pt; font-weight: 900; margin: 0; bookmark-level: none; }
.cover .sub { font-size: 14pt; font-weight: 600; color: #007f7c; margin: 6pt 0; }
.cover .date { color: #8a94a0; }

.toc { page-break-before: always; }
.toc h1 { font-size: 22pt; font-weight: 800; bookmark-level: 1; }
.toc ul { list-style: none; padding: 0; margin: 0; }
.toc .grp { font-weight: 700; margin: 14pt 0 4pt; color: #f88030; text-transform: uppercase; font-size: 9pt; letter-spacing: 0.06em; }
.toc li a { display: block; color: #12202f; padding: 2pt 0; }
.toc li a::after { content: leader(".") target-counter(attr(href), page); color: #8a94a0; }
"""


def main():
    toc, body = [], []
    for rel, group in ORDER:
        if group:
            toc.append(f'<li class="grp">{html.escape(group)}</li>')
        toc.append(f'<li><a href="#{slug(rel)}">{html.escape(TITLES[rel])}</a></li>')
        body.append(f"<section>{doc_html(rel)}</section>")

    css = CSS % {"onest": (FONTS / "Onest[wght].ttf").as_uri(), "mono": (FONTS / "JetBrainsMono[wght].ttf").as_uri()}
    page = f"""<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Astronaut — продукт простым языком</title><style>{css}</style></head><body>
<section class="cover"><img src="{LOGO.as_uri()}"><h1>Astronaut</h1>
<p class="sub">Продукт простым языком</p><p class="date">{subprocess.run(["date", "+%Y-%m-%d"], capture_output=True, text=True).stdout.strip()}</p></section>
<section class="toc"><h1>Содержание</h1><ul>{''.join(toc)}</ul></section>
{''.join(body)}
</body></html>"""
    HTML(string=page, base_url=str(IDEA)).write_pdf(OUT)
    print(f"{OUT.relative_to(REPO)}: {len(ORDER)} разделов")


if __name__ == "__main__":
    main()

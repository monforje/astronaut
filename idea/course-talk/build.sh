#!/usr/bin/env bash
# Собирает PDF доклада:
#   slides.html   → slides.pdf   (презентация, 13 слайдов 16:9, 1920×1080)
#   handout.html  → handout.pdf  (раздатка, 1 страница A4)
#   plan.md + speech.md → text.pdf (план и текст для чтения, A4)
# Запуск из любого места: bash idea/course-talk/build.sh
# Превью слайдов в PNG: PREVIEW=1 bash idea/course-talk/build.sh (кладёт в preview/, в git не нужно)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

chrome() {
  google-chrome --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
    --virtual-time-budget=5000 --print-to-pdf="$2" "file://$1" 2>/dev/null
  echo "$(basename "$2"): $(pdfinfo "$2" | grep -E '^Pages' | tr -s ' ')"
}

# текст: plan.md и speech.md → text.html (с шапкой стилей) → PDF
pandoc "$here/plan.md" "$here/speech.md" -f gfm -t html5 --wrap=none -o "$here/.text-body.html"
{
  cat "$here/text-head.html"
  cat "$here/.text-body.html"
  echo "</body></html>"
} > "$here/.text.html"
rm "$here/.text-body.html"

chrome "$here/slides.html" "$here/slides.pdf"
chrome "$here/handout.html" "$here/handout.pdf"
chrome "$here/.text.html" "$here/text.pdf"
rm "$here/.text.html"

if [[ "${PREVIEW:-}" == 1 ]]; then
  mkdir -p "$here/preview"
  pdftoppm -png -r 48 "$here/slides.pdf" "$here/preview/slide"
  pdftoppm -png -r 70 "$here/handout.pdf" "$here/preview/handout"
fi

#!/usr/bin/env bash
# Собирает питч-дек для пилотов и отдельный слайд с ценами (16:9, 1920×1080):
#   deck.html  → ../astronaut-pilot-deck.pdf
#   money.html → ../astronaut-pilot-prices.pdf (в дек не входит)
# Запуск из любого места: bash idea/accelerator/pilot-deck/build.sh
# Превью страниц в PNG: PREVIEW=1 bash idea/accelerator/pilot-deck/build.sh (кладёт в pilot-deck/preview/, в git не нужно)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"

build() {
  local src="$1" out="$2"
  google-chrome --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
    --virtual-time-budget=5000 --print-to-pdf="$out" "file://$here/$src" 2>/dev/null
  echo "$(basename "$out"): $(pdfinfo "$out" | grep -E '^Pages' | tr -s ' ')"
  if [[ "${PREVIEW:-}" == 1 ]]; then
    mkdir -p "$here/preview"
    pdftoppm -png -r 48 "$out" "$here/preview/$(basename "$out" .pdf)"
  fi
}

build deck.html  "$here/../astronaut-pilot-deck.pdf"
build money.html "$here/../astronaut-pilot-prices.pdf"

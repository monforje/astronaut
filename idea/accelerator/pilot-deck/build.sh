#!/usr/bin/env bash
# Собирает питч-дек для пилотов: deck.html → ../astronaut-pilot-deck.pdf (16:9, 1920×1080).
# Запуск из любого места: bash idea/accelerator/pilot-deck/build.sh
# Превью страниц в PNG: PREVIEW=1 bash idea/accelerator/pilot-deck/build.sh (кладёт в pilot-deck/preview/, в git не нужно)
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../astronaut-pilot-deck.pdf"

google-chrome --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
  --virtual-time-budget=5000 --print-to-pdf="$out" "file://$here/deck.html" 2>/dev/null

pdfinfo "$out" | grep -E 'Pages|Page size'

if [[ "${PREVIEW:-}" == 1 ]]; then
  mkdir -p "$here/preview"
  pdftoppm -png -r 48 "$out" "$here/preview/slide"
fi

#!/usr/bin/env bash
# Пересобирает ddd-images/*.png из mermaid-блоков в ddd-contexts.md (порядок блоков = номера картинок).
# Нужны node и google-chrome. Запуск: bash idea/mvp/utils/build-diagrams.sh
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
awk -v d="$tmp" '/^```mermaid/{n++; f=d"/d"n".mmd"; next} /^```/{f=""} f{print > f}' ddd-contexts.md
names=(1-karta-oblastey 2-svyazi-oblastey 3-put-konteynera 4-glavnye-obekty)
for i in 1 2 3 4; do
  npx -y @mermaid-js/mermaid-cli@11 -i "$tmp/d$i.mmd" -o "ddd-images/${names[$((i-1))]}.png" \
    -s 3 -b white -p utils/mermaid-puppeteer.json -c utils/mermaid-config.json -C utils/mermaid-brand.css
done

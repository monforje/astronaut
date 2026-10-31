#!/usr/bin/env bash
# Снимает скриншоты прототипа для презентации: ./make-screens.sh
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
UI="file://$DIR/../05-mvp-ui/index.html"
OUT="$DIR/screens"
mkdir -p "$OUT"

shot() { # имя, query, hash, [высота]
  google-chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size=1440,"${4:-900}" --virtual-time-budget=6000 \
    --screenshot="$OUT/$1.png" "$UI$2#$3" >/dev/null 2>&1
  echo "screens/$1.png"
}

shot overview      ""                 /overview
shot flow-visual   "?shot=visual"     /flows/f1
shot flow-ai       "?shot=ai-map"     /flows/f1
shot flow-tf       "?shot=tf"         /flows/f1
shot flow-code     "?shot=code"       /flows/f1
shot connections   ""                 /connections   1100
shot wizard        "?shot=wizard2"    /connections/new
shot monitoring    ""                 /monitoring
shot message       "?shot=explain"    /monitoring/m-8f31c2 1000
shot mdm           ""                 /mdm           1100
shot mdm-match     ""                 /mdm/match/q1  1000
shot mdm-rules     ""                 /mdm/rules
shot settings      ""                 /settings      1000

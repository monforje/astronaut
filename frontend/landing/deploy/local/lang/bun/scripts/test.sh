#!/bin/sh
set -eu

layers='shared entities features widgets pages app'
default_exclude='\.d\.ts$|/index\.(ts|js)$|\.config\.'

run_tests() {
  if ls vitest.config.* >/dev/null 2>&1; then
    bun x vitest run "$@"
  else
    bun test "$@"
  fi
}

layer() {
  dir=src/$1
  if [ ! -d "$dir" ]; then
    echo "$1: каталога нет, пропуск"
    return 0
  fi
  if [ -z "$(find "$dir" \( -name '*.test.*' -o -name '*.spec.*' \) | head -n 1)" ]; then
    echo "$1: тестов нет, пропуск (непокрытый код ловит cover)"
    return 0
  fi
  echo "== слой $1"
  run_tests "./$dir"
}

root_tests() {
  files=$(find src -maxdepth 1 -type f \( -name '*.test.*' -o -name '*.spec.*' \) | sed 's#^#./#')
  [ -n "$files" ] || return 0
  echo "== src (вне слоёв)"
  # shellcheck disable=SC2086
  run_tests $files
}

cover_vitest() {
  bun x vitest run --coverage --coverage.reporter=text \
    --coverage.thresholds.lines="$1" --coverage.thresholds.functions="$1" \
    --coverage.thresholds.statements="$1" --coverage.thresholds.branches="$1"
}

cover_bun() {
  min=$1
  exclude=$2
  dir=$(mktemp -d)
  trap 'rm -rf "$dir"' EXIT INT TERM

  find src -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' \) \
    ! -name '*.test.*' ! -name '*.spec.*' | grep -Ev "$exclude" | sort >"$dir/src.txt" || true

  if [ -z "$(find src \( -name '*.test.*' -o -name '*.spec.*' \) | head -n 1)" ]; then
    if [ -s "$dir/src.txt" ]; then
      echo "тестов нет, исходники без единого теста:"
      sed 's/^/  /' "$dir/src.txt"
      exit 1
    fi
    echo "тестов и TS/JS-исходников нет — покрывать нечего"
    exit 0
  fi

  rc=0
  bun test --coverage --coverage-reporter=text --coverage-reporter=lcov --coverage-dir="$dir" >"$dir/out.txt" 2>&1 || rc=$?
  cat "$dir/out.txt"
  [ "$rc" -eq 0 ] || exit "$rc"

  # shellcheck disable=SC2046
  set -- $(awk -F'|' '/^All files/ { gsub(/ /, "", $2); gsub(/ /, "", $3); print $2, $3 }' "$dir/out.txt")
  funcs=${1:-0}
  lines=${2:-0}
  echo "покрытие: функции ${funcs}%, строки ${lines}% (порог ${min}%)"

  sed -n 's/^SF://p' "$dir/lcov.info" | sed 's#^\./##' | sort >"$dir/cov.txt"
  comm -23 "$dir/src.txt" "$dir/cov.txt" >"$dir/missing.txt"

  fail=0
  if ! awk -v f="$funcs" -v l="$lines" -v m="$min" 'BEGIN { exit !(f + 0 >= m + 0 && l + 0 >= m + 0) }'; then
    fail=1
  fi
  if [ -s "$dir/missing.txt" ]; then
    echo "исходники без единого теста:"
    sed 's/^/  /' "$dir/missing.txt"
    fail=1
  fi
  exit "$fail"
}

case "${1:-}" in
  layer)
    layer "${2:?слой}"
    ;;
  layers)
    rc=0
    for l in $layers; do
      layer "$l" || rc=1
    done
    root_tests || rc=1
    exit "$rc"
    ;;
  cover)
    min=${2:-70}
    if ls vitest.config.* >/dev/null 2>&1; then
      cover_vitest "$min"
    else
      cover_bun "$min" "${3:-$default_exclude}"
    fi
    ;;
  *)
    echo "usage: test.sh layer <слой> | layers | cover <мин. %> [regexp]" >&2
    exit 2
    ;;
esac

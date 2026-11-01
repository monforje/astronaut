#!/bin/sh
set -eu

min=${1:-70}
exclude=${2:-'\.pb\.go:|\.gen\.go:|_gen\.go:|/mock_[^/]*\.go:|_mock\.go:'}

dir=$(mktemp -d)
trap 'rm -rf "$dir"' EXIT INT TERM

# shellcheck disable=SC2046
go test -coverpkg=./... -coverprofile="$dir/all.out" $(go list ./... | grep -v /testing/)
grep -Ev "$exclude" "$dir/all.out" >"$dir/cover.out"

total=$(go tool cover -func="$dir/cover.out" | awk '/^total:/ {sub("%", "", $NF); print $NF}')
echo "покрытие: ${total}% (порог ${min}%)"

if ! awk -v total="$total" -v min="$min" 'BEGIN { exit !(total + 0 >= min + 0) }'; then
  echo "ниже порога:"
  go tool cover -func="$dir/cover.out" |
    awk -v min="$min" '$1 != "total:" && $NF + 0 < min + 0 { print "  " $0 }' | head -n 30
  exit 1
fi

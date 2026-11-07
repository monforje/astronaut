#!/bin/sh
# Схема и конфиг в .sqlc/, затем sqlc <команда> (generate, compile, vet).
set -eu

here=$(dirname "$0")
mkdir -p .sqlc
sh "$here/schema.sh" > .sqlc/schema.sql
sh "$here/config.sh" > .sqlc/sqlc.yaml

sqlc "${1:-generate}" -f .sqlc/sqlc.yaml

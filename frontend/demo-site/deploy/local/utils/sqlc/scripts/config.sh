#!/bin/sh
# sqlc.yaml по каталогам с запросами: каждый <SQLC_QUERIES_DIR>/<домен> с *.sql → <домен>/gen.
# Подмены типов — overrides.yaml рядом и SQLC_OVERRIDES проекта (столбцы-перечисления и т. п.).
set -eu

here=$(dirname "$0")
root=${SQLC_QUERIES_DIR:-internal/repository/db}
project=${SQLC_OVERRIDES:-sqlc.overrides.yaml}

dirs=$(find "$root" -name '*.sql' ! -path '*/gen/*' -exec dirname {} \; | sort -u)
[ -n "$dirs" ] || { echo "sqlc: нет запросов в $root/<домен>/*.sql" >&2; exit 1; }

overrides() {
  cat "$here/../overrides.yaml"
  [ ! -f "$project" ] || cat "$project"
}

echo '# Собирается task gen-sqlc (deploy/local/utils/sqlc), руками не правится.'
echo 'version: "2"'
echo 'sql:'
anchor=1
for d in $dirs; do
  cat <<YAML
  - engine: postgresql
    schema: schema.sql
    queries: ../$d
    gen:
      go:
        package: gen
        out: ../$d/gen
        sql_package: pgx/v5
        emit_empty_slices: true
        omit_unused_structs: true
YAML
  if [ "$anchor" = 1 ]; then
    echo '        overrides: &overrides'
    overrides | sed '/^[[:space:]]*#/d; /^[[:space:]]*$/d; s/^/          /'
    anchor=0
  else
    echo '        overrides: *overrides'
  fi
done

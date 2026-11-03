#!/bin/sh
# Схема для sqlc: миграции SQLC_SCHEMA_DIR подряд, без NONCONCURRENTLY — sqlc его не разбирает (YugabyteDB).
set -eu

dir=${SQLC_SCHEMA_DIR:-migrations/yugabyte}
ls "$dir"/*.sql >/dev/null 2>&1 || { echo "sqlc: нет миграций в $dir" >&2; exit 1; }

sed 's/ NONCONCURRENTLY//' "$dir"/*.sql

#!/bin/sh
# Заготовка репозитория по таблице из миграций: task sqlc-new -- <таблица> [домен].
# Без аргументов — таблицы и файлы запросов, где они уже встречаются.
set -eu

here=$(dirname "$0")
root=${SQLC_QUERIES_DIR:-internal/repository/db}
table=${1:-}
domain=${2:-}

mkdir -p .sqlc
sh "$here/schema.sh" > .sqlc/schema.sql

if [ -t 1 ]; then
  b=$(printf '\033[1m'); d=$(printf '\033[2m'); g=$(printf '\033[32m'); y=$(printf '\033[33m'); r=$(printf '\033[31m'); n=$(printf '\033[0m')
else
  b=; d=; g=; y=; r=; n=
fi

singular() {
  echo "$1" | sed -E 's/ies$/y/; t; s/(ss|x|z|ch|sh)es$/\1/; t; s/ss$/ss/; t; s/s$//'
}

camel() {
  echo "$1" | awk -F_ '{
    for (i = 1; i <= NF; i++) {
      w = $i
      if (w == "id" || w == "url" || w == "uri" || w == "api" || w == "ip") printf "%s", toupper(w)
      else printf "%s%s", toupper(substr(w, 1, 1)), substr(w, 2)
    }
  }'
}

uses() {
  [ -d "$root" ] || return 0
  find "$root" -name '*.sql' ! -path '*/gen/*' -exec grep -liE "(from|into|update|join)[[:space:]]+(\"?public\"?\.)?\"?$1\"?([[:space:]]|;|\)|\$)" {} + 2>/dev/null || true
}

if [ -z "$table" ]; then
  echo "${b}Таблицы в ${SQLC_SCHEMA_DIR:-migrations/yugabyte}${n}"
  echo
  awk -f "$here/columns.awk" .sqlc/schema.sql | while read -r t; do
    files=$(uses "$t" | tr '\n' ' ')
    if [ -n "$files" ]; then
      printf "  ${g}✓${n} %-24s ${d}%s${n}\n" "$t" "$files"
    else
      printf "  ${y}+${n} %-24s ${d}task sqlc-new -- %s${n}\n" "$t" "$t"
    fi
  done
  echo
  exit 0
fi

cols=$(awk -v table="$table" -f "$here/columns.awk" .sqlc/schema.sql) || {
  echo "${r}✗${n} таблицы ${b}$table${n} нет в миграциях ${SQLC_SCHEMA_DIR:-migrations/yugabyte}" >&2
  echo "  опиши её в schema/yugabyte/schema.hcl и сгенерируй миграцию: task db-migrate-diff -- add_$table" >&2
  exit 1
}

one=$(singular "$table")
entity=$(camel "$one")
plural=$(camel "$table")
[ -n "$domain" ] || domain=$one
name=${one#"${domain}_"}
dir=$root/$domain
file=$dir/$name.sql
pkg=$(echo "${domain##*/}" | tr -d '_-')db

if [ -e "$file" ]; then
  echo "${r}✗${n} ${b}$file${n} уже есть: дописывай запросы в него или выбери другой домен — task sqlc-new -- $table <домен>" >&2
  exit 1
fi

mkdir -p "$dir"
echo "$cols" | awk -v table="$table" -v entity="$entity" -v plural="$plural" -f "$here/render.awk" > "$file"
echo "${g}✓${n} $file"

if ! ls "$dir"/*.go >/dev/null 2>&1; then
  module=$(awk '$1 == "module" { print $2; exit }' go.mod)
  cat > "$dir/${domain##*/}.go" <<GO
package $pkg

import "$module/$dir/gen"

type Repo struct {
	q *gen.Queries
}

func New(db gen.DBTX) *Repo {
	return &Repo{q: gen.New(db)}
}
GO
  echo "${g}✓${n} $dir/${domain##*/}.go"
fi

echo
echo "${d}столбцы $table:${n}"
echo "$cols" | awk -F'|' -v d="$d" -v n="$n" '{ printf "  %-22s %s%s%s%s\n", $1, $2, ($3 ? "" : " null"), ($4 ? " default" : ""), ($5 ? d "  ключ" n : "") }'
echo

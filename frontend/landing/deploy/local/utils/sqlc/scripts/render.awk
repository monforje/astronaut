# Заготовка запросов sqlc по столбцам из columns.awk (имя|тип|not null|default|pk).
# -v table, entity (Order), plural (Orders).

BEGIN { FS = "|" }

{
  n++; col[n] = $1; typ[n] = $2; def[n] = $4; ispk[n] = $5
  if ($5) pks[++npk] = n
  if ($1 == "updated_at") touched = 1
}

function camel(s,    parts, k, i, out, w) {
  k = split(s, parts, "_"); out = ""
  for (i = 1; i <= k; i++) {
    w = parts[i]
    if (w == "id" || w == "url" || w == "uri" || w == "api" || w == "ip") out = out toupper(w)
    else out = out toupper(substr(w, 1, 1)) substr(w, 2)
  }
  return out
}

function list(kind, sep, pre, post,    i, out, ok) {
  out = ""
  for (i = 1; i <= n; i++) {
    if (kind == "all") ok = 1
    else if (kind == "insert") ok = !def[i] || ispk[i]
    else if (kind == "update") ok = !ispk[i] && col[i] != "created_at" && col[i] != "updated_at"
    else if (kind == "upsert") ok = (!def[i] || ispk[i]) && !ispk[i] && col[i] != "created_at" && col[i] != "updated_at"
    if (!ok) continue
    out = out (out == "" ? "" : sep) pre col[i] post
  }
  return out
}

function key(    i, out, c) {
  out = ""
  for (i = 1; i <= npk; i++) { c = col[pks[i]]; out = out (out == "" ? "" : " AND ") c " = @" c }
  return out
}

function pklist(    i, out) {
  out = ""
  for (i = 1; i <= npk; i++) out = out (out == "" ? "" : ", ") col[pks[i]]
  return out
}

function params(cols,    parts, k, i, out) {
  k = split(cols, parts, ", "); out = ""
  for (i = 1; i <= k; i++) out = out (out == "" ? "" : ", ") "@" parts[i]
  return out
}

function sets(cols, fmt,    parts, k, i, out) {
  k = split(cols, parts, ", "); out = ""
  for (i = 1; i <= k; i++) out = out (out == "" ? "" : ",\n    ") sprintf(fmt, parts[i], parts[i], parts[i])
  if (touched) out = out (out == "" ? "" : ",\n    ") "updated_at = now()"
  return out
}

function q(name, kind) { printf "\n-- name: %s :%s\n", name, kind }

END {
  all = list("all", ", ")
  ins = list("insert", ", ")
  upd = list("update", ", ")
  ups = list("upsert", ", ")
  where = key()
  first = npk ? col[pks[1]] : ""

  printf "-- Заготовка task sqlc-new по таблице %s: оставь нужное и допиши под сценарии домена.\n", table
  printf "-- YugabyteDB шардирует строки по хешу первого столбца ключа (%s): запросы по ключу идут в один\n", npk ? first : "ключа нет"
  printf "-- tablet, а выборка по диапазону ключа обходит все tablet-ы — для больших списков нужен ASC-индекс.\n"

  if (npk) {
    q("Get" entity, "one")
    printf "SELECT %s\nFROM %s\nWHERE %s;\n", all, table, where

    q("Get" entity "ForUpdate", "one")
    printf "SELECT %s\nFROM %s\nWHERE %s\nFOR UPDATE;\n", all, table, where
  }

  if (npk == 1) {
    q("List" plural, "many")
    printf "SELECT %s\nFROM %s\nWHERE sqlc.narg('after_%s')::%s IS NULL OR %s > sqlc.narg('after_%s')::%s\nORDER BY %s\nLIMIT @page_size;\n", \
      all, table, first, typ[pks[1]], first, first, typ[pks[1]], first
  } else if (npk > 1) {
    rest = pklist(); sub(/^[^,]*, /, "", rest)
    q("List" plural "By" camel(first), "many")
    printf "SELECT %s\nFROM %s\nWHERE %s = @%s\nORDER BY %s;\n", all, table, first, first, rest
  } else {
    q("List" plural, "many")
    printf "SELECT %s\nFROM %s\nLIMIT @page_size;\n", all, table
  }

  q("Create" entity, "one")
  if (ins == "") printf "INSERT INTO %s DEFAULT VALUES\nRETURNING %s;\n", table, all
  else printf "INSERT INTO %s (%s)\nVALUES (%s)\nRETURNING %s;\n", table, ins, params(ins), all

  if (ins != "") {
    q("Create" (plural == entity ? entity "Batch" : plural), "copyfrom")
    printf "INSERT INTO %s (%s)\nVALUES (%s);\n", table, ins, params(ins)
  }

  if (npk) {
    q("Upsert" entity, "exec")
    printf "INSERT INTO %s (%s)\nVALUES (%s)\nON CONFLICT (%s) ", table, ins, params(ins), pklist()
    if (ups == "" && !touched) printf "DO NOTHING;\n"
    else printf "DO UPDATE\nSET %s;\n", sets(ups, "%s = EXCLUDED.%s")
  }

  if (npk && (upd != "" || touched)) {
    q("Update" entity, "execrows")
    printf "UPDATE %s\nSET %s\nWHERE %s;\n", table, sets(upd, "%s = coalesce(sqlc.narg('%s'), %s)"), where
  }

  if (npk) {
    q("Delete" entity, "execrows")
    printf "DELETE FROM %s\nWHERE %s;\n", table, where
  }
}

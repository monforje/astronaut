# Таблицы и столбцы из миграций: CREATE TABLE, ALTER TABLE ADD/DROP/ALTER/RENAME COLUMN, DROP TABLE.
# Без -v table печатает имена таблиц, с -v table=<имя> — столбцы: имя|тип|not null|default|pk.
# Таблицы нет — код выхода 2.

function trim(s) { sub(/^[ \t]+/, "", s); sub(/[ \t]+$/, "", s); return s }
function unq(s) { gsub(/"/, "", s); return s }
function tname(ref) { ref = unq(trim(ref)); sub(/^.*\./, "", ref); return ref }

function splitTop(s, parts,    n, i, c, depth, q, cur) {
  n = 0; depth = 0; q = 0; cur = ""
  for (i = 1; i <= length(s); i++) {
    c = substr(s, i, 1)
    if (c == "'") q = !q
    if (!q && c == "(") depth++
    if (!q && c == ")") depth--
    if (!q && depth == 0 && c == ",") { parts[++n] = trim(cur); cur = ""; continue }
    cur = cur c
  }
  if (trim(cur) != "") parts[++n] = trim(cur)
  return n
}

function inner(s, p,    i, c, depth, q) {
  depth = 0; q = 0
  for (i = p; i <= length(s); i++) {
    c = substr(s, i, 1)
    if (c == "'") q = !q
    if (q) continue
    if (c == "(") depth++
    if (c == ")" && --depth == 0) return substr(s, p + 1, i - p - 1)
  }
  return substr(s, p + 1)
}

function ident(s) {
  if (match(s, /^"[^"]+"/)) { RREST = substr(s, RLENGTH + 1); return substr(s, 2, RLENGTH - 2) }
  match(s, /^[^ \t]+/); RREST = substr(s, RLENGTH + 1); return substr(s, 1, RLENGTH)
}

function find(name,    i) { for (i = 1; i <= ncol; i++) if (cname[i] == name) return i; return 0 }

function setpk(list,    parts, n, i) {
  n = splitTop(list, parts)
  for (i = 1; i <= n; i++) pk[unq(parts[i])] = 1
}

function addcol(def,    name, rest, u, ty, head) {
  name = ident(def); rest = trim(RREST); u = toupper(rest)
  head = u
  if (match(head, / CHECK[ (]/)) head = substr(head, 1, RSTART - 1)
  ty = rest
  if (match(u, / (NOT NULL|NULL|DEFAULT|PRIMARY KEY|REFERENCES|UNIQUE|CHECK|COLLATE|GENERATED|CONSTRAINT)( |\(|$)/)) ty = substr(rest, 1, RSTART - 1)
  ncol++
  cname[ncol] = name
  ctype[ncol] = tolower(trim(ty))
  cnn[ncol] = (head ~ /NOT NULL/ || head ~ /PRIMARY KEY/) ? 1 : 0
  cdf[ncol] = (head ~ /DEFAULT|GENERATED/) ? 1 : 0
  if (head ~ /PRIMARY KEY/) pk[name] = 1
}

function create(stmt,    rest, p, t, body, parts, n, i, u) {
  rest = substr(stmt, RLENGTH + 1)
  p = index(rest, "(")
  t = tname(substr(rest, 1, p - 1))
  if (table == "") { if (!(t in seen)) { seen[t] = 1; order[++ntab] = t }; return }
  if (t != table) return
  found = 1; ncol = 0; split("", pk)
  body = inner(rest, p)
  n = splitTop(body, parts)
  for (i = 1; i <= n; i++) {
    u = toupper(parts[i])
    if (u ~ /^(CONSTRAINT .* )?PRIMARY KEY/) { setpk(inner(parts[i], index(parts[i], "("))); continue }
    if (u ~ /^(CONSTRAINT|UNIQUE|CHECK|FOREIGN KEY|EXCLUDE|LIKE) /) continue
    addcol(parts[i])
  }
}

function alter(stmt,    rest, t, acts, parts, n, i, u, part, name, c, to) {
  rest = substr(stmt, RLENGTH + 1)
  match(rest, /^[^ \t]+/)
  t = tname(substr(rest, 1, RLENGTH))
  if (table == "" || t != table) return
  acts = substr(rest, RLENGTH + 1)
  n = splitTop(acts, parts)
  for (i = 1; i <= n; i++) {
    part = parts[i]; u = toupper(part)
    if (match(u, /^ADD (COLUMN )?(IF NOT EXISTS )?/) && u !~ /^ADD (CONSTRAINT|PRIMARY|UNIQUE|CHECK|FOREIGN)/) { addcol(substr(part, RLENGTH + 1)); continue }
    if (u ~ /^ADD (CONSTRAINT .* )?PRIMARY KEY/) { split("", pk); setpk(inner(part, index(part, "("))); continue }
    if (match(u, /^DROP (COLUMN )?(IF EXISTS )?/) && u !~ /^DROP CONSTRAINT/) {
      c = find(ident(substr(part, RLENGTH + 1)))
      if (c) cname[c] = ""
      continue
    }
    if (match(u, /^RENAME (COLUMN )?/) && u !~ /^RENAME TO/) {
      name = ident(substr(part, RLENGTH + 1)); to = trim(RREST); sub(/^[Tt][Oo][ \t]+/, "", to)
      c = find(name)
      if (c) cname[c] = ident(to)
      continue
    }
    if (match(u, /^ALTER (COLUMN )?/)) {
      c = find(ident(substr(part, RLENGTH + 1)))
      if (!c) continue
      u = toupper(trim(RREST))
      if (u ~ /^SET NOT NULL/) cnn[c] = 1
      else if (u ~ /^DROP NOT NULL/) cnn[c] = 0
      else if (u ~ /^SET DEFAULT/) cdf[c] = 1
      else if (u ~ /^DROP DEFAULT/) cdf[c] = 0
      else if (match(u, /^(SET DATA )?TYPE /)) { to = substr(trim(RREST), RLENGTH + 1); sub(/ USING .*$/, "", to); ctype[c] = tolower(trim(to)) }
    }
  }
}

function statement(stmt,    u) {
  u = toupper(stmt)
  if (match(u, /^CREATE (UNLOGGED )?TABLE (IF NOT EXISTS )?/)) create(stmt)
  else if (match(u, /^ALTER TABLE (ONLY )?(IF EXISTS )?/)) alter(stmt)
  else if (table != "" && match(u, /^DROP TABLE (IF EXISTS )?/) && tname(substr(stmt, RLENGTH + 1)) == table) { found = 0; ncol = 0 }
}

/^[ \t]*--/ { next }

{
  buf = buf " " $0
  if ($0 !~ /;[ \t]*$/) next
  sub(/;[ \t]*$/, "", buf)
  statement(trim(buf))
  buf = ""
}

END {
  if (table == "") { for (i = 1; i <= ntab; i++) print order[i]; exit 0 }
  if (!found) exit 2
  for (i = 1; i <= ncol; i++)
    if (cname[i] != "") print cname[i] "|" ctype[i] "|" cnn[i] "|" cdf[i] "|" (cname[i] in pk ? 1 : 0)
}

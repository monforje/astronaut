#!/bin/sh
# Новый проект из шаблона: <kind>/example → <kind>/<имя>.
#   sh new.sh backend  <имя>
#   sh new.sh frontend <имя> [бэкенд]
# Запускается из корня репозитория (task new-backend / task new-frontend).
# NEW_DEST=<каталог> — отрисовать шаблон туда, не регистрируя проект (так docs/codestyle/mirror.sh
# сравнивает проекты с шаблоном).
# Пишется на POSIX sh + sed -E + git: одинаково работает на Linux (GNU) и macOS (BSD).
set -eu

die() {
  echo "new: $*" >&2
  exit 1
}

kind=${1:-}
name=${2:-}
backend=${3:-}

case "$kind" in
  backend | frontend) ;;
  *) die "вид проекта: backend или frontend" ;;
esac

[ -n "$name" ] || die "имя не задано: task new-$kind -- <имя>"
echo "$name" | grep -Eq '^[a-z][a-z0-9]*(-[a-z0-9]+)*$' ||
  die "имя «$name»: строчные латинские буквы, цифры и дефисы (uptime-checker)"
[ "$name" != example ] || die "example — это сам шаблон"

src=$kind/example
dst=${NEW_DEST:-$kind/$name}

[ -d "$src" ] || die "нет шаблона $src (запускайте из корня репозитория)"
[ ! -e "$dst" ] || die "$dst уже существует"

if [ "$kind" = frontend ]; then
  if [ -z "$backend" ]; then
    [ -d "backend/$name" ] || die "укажите бэкенд: task new-frontend -- $name <бэкенд> (каталог в backend/)"
    backend=$name
  fi
  [ -f "backend/$backend/schema/openapi/openapi.yaml" ] ||
    die "у backend/$backend нет контракта schema/openapi/openapi.yaml"
fi

# Только то, что в git или не игнорируется: node_modules, tmp, .env и прочие артефакты не копируются.
# Удалённые, но ещё не закоммиченные файлы git ls-files --cached тоже выдаёт — их вычитаем.
mkdir -p "$dst"
list=$(mktemp)
(
  cd "$src"
  git ls-files --cached --others --exclude-standard -- . | sort -u >"$list.all"
  git ls-files --deleted -- . | sort -u >"$list.del"
  comm -23 "$list.all" "$list.del" >"$list"
)
(cd "$src" && tar -cf - -T "$list") | tar -xf - -C "$dst"
rm -f "$list" "$list.all" "$list.del"

snake=$(echo "$name" | sed 's/-/_/g')

# Шаблон называет всё словом example: модуль Go, контейнеры, домены, базы, стрим NATS.
# .env.example и example.com — не имя проекта, их прячем на время замены.
protect='s/\.env\.example/@@ENV_EXAMPLE@@/g; s/example\.(com|org|net)/@@EXAMPLE_\1@@/g'
restore='s/@@ENV_EXAMPLE@@/.env.example/g; s/@@EXAMPLE_(com|org|net)@@/example.\1/g'
token='(^|[^[:alnum:]_])example([^[:alnum:]_]|$)'

if [ "$kind" = backend ]; then
  # Имена баз и dev-баз zeus — с подчёркиванием: дефис в имени базы требует кавычек.
  rules="$protect
s/example_zeus_dev/${snake}_zeus_dev/g
s/(_DB=)example([^[:alnum:]_]|\$)/\1${snake}\2/g
s/(Database = \")example\"/\1${snake}\"/g
s/(schema \")example\"/\1${snake}\"/g
s/$token/\1${name}\2/g
s/$token/\1${name}\2/g
$restore"
else
  # Ссылки на бэкенд перечислены явно (BACKEND, контракт, прокси, хост), остальное example — сам фронт.
  rules="$protect
s/(BACKEND=)example([^[:alnum:]_-]|\$)/\1${backend}\2/g
s/(BACKEND:-)example\}/\1${backend}}/g
s/(BACKEND [|] default \")example\"/\1${backend}\"/g
s|backend/example/|backend/${backend}/|g
s/example-http/${backend}-http/g
s/example\.anyhost\.local/${backend}.anyhost.local/g
s/$token/\1${name}\2/g
s/$token/\1${name}\2/g
$restore"
fi

# Текстовые файлы, кроме зависимостей, контрольных сумм, клиента фронта (его перегенерирует gen-api),
# документации (в ней example — имя шаблона) и deploy/local: он у всех проектов одинаковый.
grep -rIl example "$dst" \
  --exclude-dir=vendor --exclude-dir=node_modules --exclude-dir=generated \
  --exclude='*.md' --exclude=go.sum --exclude=zeus.sum |
  grep -v "^$dst/deploy/local/" |
  while IFS= read -r f; do
    sed -E "$rules" "$f" >"$f.new"
    cat "$f.new" >"$f"
    rm -f "$f.new"
  done

[ -z "${NEW_DEST:-}" ] || exit 0

# Регистрация в корневом Taskfile.yml (PROJECTS группы): бэкенды раньше фронтендов — фронт берёт их контракт.
if [ -f Taskfile.yml ] && grep -Eq '^[[:space:]]+PROJECTS:' Taskfile.yml; then
  awk -v kind="$kind" -v p="$dst" '
    /^[[:space:]]+PROJECTS:/ && index($0, " " p) == 0 {
      match($0, /^[[:space:]]+PROJECTS:/)
      head = substr($0, 1, RLENGTH)
      n = split(substr($0, RLENGTH + 1), list, " ")
      out = ""
      done = 0
      for (i = 1; i <= n; i++) {
        if (kind == "backend" && !done && list[i] ~ /^frontend\//) { out = out " " p; done = 1 }
        out = out " " list[i]
      }
      if (!done) out = out " " p
      $0 = head out
    }
    { print }
  ' Taskfile.yml >Taskfile.yml.new
  cat Taskfile.yml.new >Taskfile.yml
  rm -f Taskfile.yml.new
fi

echo
echo "Готово: $dst (из $src)"
if [ "$kind" = backend ]; then
  echo "  контракт:  $dst/typespec → task -d $dst gen-api"
  echo "  порядок:   $dst/docs/codestyle/README.md, раздел «Новая функциональность»"
  echo "  запуск:    task -d $dst deploy"
else
  echo "  бэкенд:    backend/$backend (BACKEND в $dst/.env.example, хост $backend.anyhost.local)"
  echo "  клиент:    task -d $dst gen-api"
  echo "  запуск:    task -d $dst deploy"
fi

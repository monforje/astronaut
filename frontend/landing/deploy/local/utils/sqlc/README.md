# sqlc

Код репозиториев по SQL-запросам. Образ собирается из `Dockerfile` при первом вызове, версия — `SQLC_VERSION` в `Taskfile.yml`.

Конфиг руками не пишется: `task gen-sqlc` собирает `.sqlc/sqlc.yaml` сам — каждый каталог `<SQLC_QUERIES_DIR>/<домен>` с `*.sql` даёт пакет `<домен>/gen`.
Схема — миграции `SQLC_SCHEMA_DIR` подряд без `NONCONCURRENTLY` (YugabyteDB, sqlc его не разбирает).
Подмены типов — общие `overrides.yaml` + `sqlc.overrides.yaml` проекта (столбцы-перечисления).

| Команда | Описание |
|---|---|
| task gen-sqlc | Сгенерировать код всех репозиториев |
| task sqlc-check | Проверить запросы по схеме без генерации (`sqlc compile`) |
| task sqlc-new | Таблицы из миграций: у каких уже есть запросы и в каких файлах |
| task sqlc-new -- orders | Репозиторий по таблице: `order/order.sql`, `order/order.go` (`Repo`, `New`), сразу `gen/` |
| task sqlc-new -- order_items order | Таблица в существующий домен: `order/item.sql` |
| task sqlc -- args | Команда sqlc как есть |

Заготовка запросов строится по столбцам и ключу таблицы из миграций (CREATE/ALTER TABLE, без живой базы):
`Get`, `GetForUpdate`, `List` (keyset по ключу через `sqlc.narg`, у составного ключа — по первому столбцу),
`Create` (`RETURNING`), пакетная вставка `:copyfrom` (COPY), `Upsert` (`ON CONFLICT`), частичный `Update`
(`coalesce(sqlc.narg(...))`, `updated_at = now()`), `Delete`. Лишнее удаляется, остальное правится под домен.
Существующий файл не перезаписывается.

| Переменная | По умолчанию |
|---|---|
| SQLC_SCHEMA_DIR | migrations/yugabyte |
| SQLC_QUERIES_DIR | internal/repository/db |
| SQLC_OVERRIDES | sqlc.overrides.yaml |

# infra

Общая инфраструктура для локальной разработки: s3 с веб-админкой s3-ui, nats (JetStream), smtp (Mailpit), yugabytedb, clickhouse, redis. Базы проекта создают задачи infra-yugabyte-up и infra-clickhouse-up.

## Команды

```bash
task infra-up
task infra-stop
task infra-down
```

Инфра общая для всех проектов на машине - запускается в единственном compose-проекте shared.

## Часть инфры

Для запуска отдельных сервисов есть internal задачи: infra-s3-up (s3 и s3-ui), infra-nats-up, infra-smtp-up, infra-yugabyte-up, infra-clickhouse-up, infra-redis-up.

```yaml
includes:
  base:
    taskfile: ./deploy/local/Taskfile.yml
    flatten: true
    excludes: [infra-up]

tasks:
  infra-up:
    cmds:
      - task: infra-yugabyte-up
      - task: infra-nats-up
```

## Переменные

Настройки сервисов лежат в env/*.env, переопределяются в .env проекта. Пример - .env.example.

## S3

`s3` - adobe/s3mock 5.2, API во внутренней сети на `http://s3:9090`, бакет создаётся при старте из `S3_BUCKET` проекта (`COM_ADOBE_TESTING_S3MOCK_STORE_INITIAL_BUCKETS` в `compose.infra.yml`). Веб-админка `s3-ui` (cloudlena/s3manager) на `https://s3.astronaut.localhost`: бакеты, объекты, загрузка, удаление. Хост - `S3_UI_HOSTNAME`, версия - `S3_UI_VERSION`, настройки - `env/s3-ui.env`.

## YugabyteDB

`yugabytedb` - 2026.1.2.0 (`YUGABYTE_VERSION`), один узел `yugabyted`, без аутентификации, YSQL во внутренней сети на `yugabytedb:5433`, пользователь `yugabyte` без пароля. Данные - в volume `yugabyte-data`; контейнер работает от root, потому что новый volume принадлежит root. `infra-yugabyte-up` поднимает его и создаёт базы из `YUGABYTE_DATABASES` проекта (тех, которых ещё нет), `infra-yugabyte-drop` их удаляет (`DROP DATABASE ... WITH (FORCE)`).

Сервер запущен с `ysql_yb_ddl_transaction_block_enabled=true`: без этого флага YugabyteDB не откатывает DDL вместе с транзакцией, и упавшая миграция осталась бы наполовину применённой. YSQL и веб-интерфейсы слушают все интерфейсы контейнера (`pgsql_proxy_bind_address`, `webserver_interface`), иначе traefik из своей сети до консоли не достучится.

Миграции yugabyte выполняет zeus (`utils/zeus`), образ `downtimesu/zeus:local` собирается `task build` проекта (`zeus-build` в `lang/go` вызывает его сам) при первом запуске и при изменении исходников. К yugabyte он ходит по `yugabyte://` (драйвер `sql/yugabyte`): он понимает индексы `lsm`/`ybgin` и откажется применять миграции в транзакции, если на сервере выключен транзакционный DDL.

## ClickHouse

`clickhouse` - 26.9 (`CLICKHOUSE_VERSION`), во внутренней сети на `clickhouse:9000` (native) и `clickhouse:8123` (HTTP), пользователь `default` без пароля (`env/clickhouse.env`). Веб-консоль - `https://clickhouse.astronaut.localhost/play`. `infra-clickhouse-up` поднимает его и создаёт базы из `CLICKHOUSE_DATABASES` проекта (`CREATE DATABASE IF NOT EXISTS`), `infra-clickhouse-drop` их удаляет.

Схему ClickHouse мигрирует zeus (`utils/zeus`, драйвер `clickhouse`), так же как yugabyte: желаемая схема - `schema/clickhouse/schema.hcl`, миграции - `migrations/clickhouse` (`task ch-migrate-diff -- <name>`, `task ch-migrate-lint`, накат - `task db-migrate-up`). Таблица ревизий - `zeus_schema_revisions` в базе проекта. dev-база для `ch-migrate-diff` - `ZEUS_CH_DEV_URL` (в `backend/green-basket` это `example_zeus_dev`, её создаёт `infra-clickhouse-up` из `CLICKHOUSE_DATABASES`); она должна быть пустой и той же версии, что сервер. Пример - `backend/green-basket`.

Транзакций у ClickHouse для DDL нет: `--tx-mode` для него по умолчанию `none`, `file` и `all` - ошибка. Миграция, упавшая на середине файла, оставляет в ревизиях точку остановки: исправленный файл продолжается с упавшего statement.

### Переход с golang-migrate

База, накатанная golang-migrate, переводится на zeus без повторного выполнения миграций, таблицы не трогаются:

```bash
# 1. Файлы golang-migrate -> каталог zeus (только *.up.sql, версия остаётся в имени)
zeus migrate import --from file://migrations/clickhouse --to file://migrations/clickhouse-zeus --dir-format golang-migrate
# 2. Служебная таблица golang-migrate больше не нужна
clickhouse-client -q 'DROP TABLE IF EXISTS example.schema_migrations SYNC'
# 3. Версии до 000001 включительно помечаются применёнными, ничего не выполняется
zeus migrate apply --dir file://migrations/clickhouse --url "$ZEUS_CH_URL" --baseline 000001
```

Новый стенд (`task deploy`) этого не требует: всё накатывается с нуля.

## NATS

`nats` - 2.15 (`NATS_VERSION`) с JetStream (`-js`, данные в томе `nats-data`), клиенты во внутренней сети на `nats://nats:4222`, мониторинг `nats:8222`. Стримы и consumer'ы сервис создаёт сам при старте.

## SMTP

`smtp` - Mailpit: SMTP без авторизации и TLS на `smtp:1025` во внутренней сети, веб-интерфейс с пойманными письмами на `https://smtp.astronaut.localhost` (`SMTP_HOSTNAME`). Письма наружу не уходят.

## Веб-интерфейсы

Имена `*.astronaut.localhost` резолвятся сами (браузеры, curl, systemd-resolved) — /etc/hosts не нужен. https для них — сертификат traefik по умолчанию (`*.astronaut.localhost`, `infra/traefik`).

| Сервис | Адрес | Что |
|---|---|---|
| S3 | `https://s3.astronaut.localhost` | s3-ui: бакеты и объекты |
| YugabyteDB | `https://yugabyte.astronaut.localhost` | встроенная консоль |
| ClickHouse | `https://clickhouse.astronaut.localhost/play` | встроенная play-консоль |
| NATS | `https://nats.astronaut.localhost` | nats-ui (nui): в первом запуске добавить соединение `nats://nats:4222` |
| Redis | `https://redis.astronaut.localhost` | redis-ui (redis-commander) |
| SMTP | `https://smtp.astronaut.localhost` | Mailpit: пойманные письма |

Хосты переопределяются `*_HOSTNAME`, версии образов — `NATS_UI_VERSION`, `REDIS_UI_VERSION`.

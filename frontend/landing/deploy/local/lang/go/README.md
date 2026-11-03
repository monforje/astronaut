# go

Команды для Go-сервиса. go, golangci-lint, zeus и node (typespec) запускаются в одноразовых
контейнерах — на хосте их ставить не нужно.

## Подключение

```yaml
includes:
  go:
    taskfile: ./deploy/local/lang/go/Taskfile.yml
    flatten: true
```

Переменные — `backend/example/Taskfile.yml`.

## Команды

| Команда | Описание |
|---|---|
| task go -- args | Команда go |
| task lint | golangci-lint run по `.golangci.yml` проекта |
| task fmt | golangci-lint fmt + автоисправление пустых строк (wsl_v5, nlreturn, whitespace) |
| task codestyle | lint + тесты правил `go test ./docs/codestyle/...` |
| task gen-check | gen-api, gen-sqlc, gen-mocks и `git diff --exit-code` |
| task test | Юнит-тесты |
| task test-e2e | E2E-тесты (testcontainers); без `tests/e2e` — пропуск |
| task test-cover | Юнит-тесты с покрытием, порог `COVERAGE_MIN` (70) |
| task sec | gosec (SAST), только продакшн-код, конфиг `golangci-sec.yml` |
| task vuln | govulncheck: уязвимости зависимостей и stdlib |
| task tidy | go mod tidy + vendor |
| task bench | Бенчмарки `pkg/` на инфре проекта: нужна поднятая инфра; адреса берутся из `TEST_DOCKER_ARGS`, аргументы после `--` идут в `go test` |
| task gen-api | Контракт: `typespec/` → `schema/openapi/openapi.yaml` (+ `scripts/postprocess-openapi.mjs`, если есть) → ogen в `OGEN_TARGET` по `ogen.yml` (проекта или общему `utils/ogen/ogen.yml`) |
| task gen-mocks | Моки: `go generate ./...`, директивы `//go:generate` лежат рядом с интерфейсами |
| task zeus -- args | Команда zeus (образ `downtimesu/zeus:local` собирается из `utils/zeus`, `ZEUS_SRC_DIR` / `DOCKER_ZEUS_IMAGE_NAME` переопределяют) |
| task db-migrate-up | Накатить миграции yugabyte, и clickhouse, если задан `ZEUS_CH_URL` (обе через zeus) |
| task db-migrate-diff -- name | Сгенерировать миграцию из schema/yugabyte/schema.hcl |
| task db-migrate-lint | Проверить последнюю миграцию yugabyte |
| task ch-migrate-diff -- name | Сгенерировать миграцию из schema/clickhouse/schema.hcl (`ZEUS_CH_DEV_URL` - пустая dev-база того же сервера) |
| task ch-migrate-lint | Проверить последнюю миграцию clickhouse (`CH301`-`CH303`, общие проверки) |

```bash
task go -- build ./cmd/auth
task test
task db-migrate-diff -- add_users_table
```

## Хуки

`.pre-commit-config.yaml` подключается `PRE_COMMIT_CONFIG`, каждый хук зовёт `task`.

| Стадия | Хуки |
|---|---|
| commit | гигиена файлов, `fmt`, `go vet`, `lint`, `sec`, `tidy` |
| pre-push | `test`, `test-cover`, `vuln` |

Покрытие считается по всему модулю (`-coverpkg=./...`) без `tests/e2e`, сгенерированные
файлы (`*.pb.go`, `*_gen.go`, `mock_*.go`) исключены. Порог и исключения проект задаёт сам:

```yaml
env:
  COVERAGE_MIN: "90"
  COVERAGE_EXCLUDE: '/cmd/|/internal/app/'
```

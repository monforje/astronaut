# bun

Команды для фронтенда. bun запускается в одноразовом контейнере `DOCKER_BUN_IMAGE_NAME`.

## Подключение

```yaml
includes:
  bun:
    taskfile: ./deploy/local/lang/bun/Taskfile.yml
    flatten: true
```

## Команды

| Команда | Описание |
|---|---|
| task bun -- args | Команда bun |
| task bunx -- args | Команда bun x |
| task format / lint / check | Скрипты `format`, `lint`, `check` проекта; нет скрипта — пропуск |
| task lint-fsd | Скрипт `lint:fsd` проекта (steiger) |
| task test | Тесты по слоям FSD снизу вверх: shared, entities, features, widgets, pages, app, затем `src/*.test.*` |
| task test-layer -- shared | Тесты одного слоя |
| task test-cover | Покрытие, порог `COVERAGE_MIN` (70); исходник без единого теста — ошибка |
| task audit | `bun audit`, порог `AUDIT_LEVEL` (high) |
| task test-e2e | Playwright в контейнере; без `@playwright/test` и `playwright.config.*` — пропуск |

Раннер выбирается по проекту: есть `vitest.config.*` — vitest, иначе `bun test`.
`bun test` считает покрытие только загруженных файлов, поэтому непокрытые исходники ищутся
сравнением lcov со списком `src/`; исключения — `COVERAGE_EXCLUDE` (regexp).
У vitest пороги задаются флагами, исключения — в его конфиге.

```bash
task bun -- install
task bun -- run build
task bunx -- shadcn-svelte@latest add button
task test-layer -- features
```

## Хуки

`.pre-commit-config.yaml` подключается `PRE_COMMIT_CONFIG`, каждый хук зовёт `task`.

| Стадия | Хуки |
|---|---|
| commit | гигиена файлов, format, lint, check, FSD, тесты затронутого слоя |
| pre-push | все слои, покрытие, audit |

## E2E

В prek не входит (долго) — запускается вручную: `task test-e2e`.

Образ Playwright берётся по версии `@playwright/test` из `node_modules`
(`mcr.microsoft.com/playwright:v<версия>-noble`), переопределяется `DOCKER_PLAYWRIGHT_IMAGE_NAME`.
Контейнер идёт в сети хоста с его `/etc/hosts`, адрес стенда — `E2E_BASE_URL`. Запуск не от root,
поэтому в `playwright.config` для chromium нужен `--no-sandbox`.

## Dev-сервер

Dev-сервер описывается сервисом в compose проекта с лейблами traefik —
пример в `infra/traefik/README.md`. Слушать надо `0.0.0.0`.

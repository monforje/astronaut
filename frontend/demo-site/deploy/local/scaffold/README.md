# scaffold

Новые проекты из шаблонов. `backend/example` и `frontend/example` — самодостаточные каркасы без
предметной области (инфраструктура, Taskfile, линтеры, гайды, проверки); команда копирует шаблон и
переименовывает его.

| Команда | Что делает |
|---|---|
| `task new-backend -- uptime` | `backend/example` → `backend/uptime` |
| `task new-frontend -- uptime` | `frontend/example` → `frontend/uptime` к `backend/uptime` + `gen-api` |
| `task new-frontend -- admin uptime` | фронтенд `admin` к бэкенду `backend/uptime` |
| `task new-frontend NO_DOCKER=true -- admin uptime` | без генерации клиента в контейнере (нет docker) |
| `NEW_DEST=/tmp/x sh backend/example/deploy/local/scaffold/new.sh backend uptime` | отрисовать шаблон в каталог, не регистрируя проект (так работает `docs/codestyle/mirror.sh`) |

Имя — строчные латинские буквы, цифры и дефисы (`uptime-checker`).

## Что переименовывается

Копируются только файлы из git и неигнорируемые (`node_modules`, `tmp`, `.env` не попадают). Слово
`example` в шаблоне — имя проекта, а у фронтенда — ещё и ссылки на бэкенд:

| Где | Бэкенд `uptime-checker` | Фронтенд `admin` к бэкенду `uptime` |
|---|---|---|
| модуль Go и импорты | `module uptime-checker`, `"uptime-checker/internal/…"` | — |
| compose, контейнеры, traefik | `uptime-checker-http` | `admin-front` |
| имя приложения | `Bootstrap(ctx, "uptime-checker-http")`, `@service(#{ title: "uptime-checker" })` | `APP_NAME = "admin"`, `<title>admin</title>`, пакет `admin-frontend` |
| домен | `uptime-checker.anyhost.local` | `uptime.anyhost.local` (хост бэкенда) |
| базы, dev-база zeus | `uptime_checker`, `uptime_checker_zeus_dev` | — |
| стрим и subject NATS, бакет S3 | `uptime-checker`, `uptime-checker.events` | — |
| контракт и прокси API | — | `BACKEND=uptime`: `backend/uptime/schema/openapi/openapi.yaml`, `uptime-http:8080` |

Не трогаются: `*.md` (в гайдах `example` — имя шаблона), `vendor/`, `go.sum`, `zeus.sum`,
сгенерированный клиент фронта (его перегенерирует `gen-api`), `.env.example` как имя файла, адреса
`example.com`, `deploy/local` (он у всех проектов одинаковый).

Импорты модуля Go стоят отдельной группой (`gci`), поэтому переименование модуля не меняет
форматирования: проект сразу проходит `task codestyle`.

Проект добавляется в `PROJECTS` корневого `Taskfile.yml` (бэкенды раньше фронтендов) — `task deploy`,
`task gen`, `task test`, `task codestyle` в корне подхватывают его сразу.

## Каркас и синхронизация

Файлы из `docs/codestyle/skeleton.txt` шаблона — каркас: у проекта они остаются такими же, как в
шаблоне. `task codestyle` в корне отрисовывает шаблон под имя каждого проекта и сравнивает каркас
(`docs/codestyle/mirror.sh`). Улучшили каркас в шаблоне — перенесите в проекты; своё у проекта —
новыми файлами рядом, а не правкой каркаса.

## После создания

```bash
task -d backend/uptime deploy        # бэкенд: инфра, миграции, запуск
task -d frontend/uptime deploy       # фронт на том же хосте
task where                           # адреса стенда
```

Дальше — `docs/codestyle/README.md` проекта: структура, команды и порядок добавления функциональности.

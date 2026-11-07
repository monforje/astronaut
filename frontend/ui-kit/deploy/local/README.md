# deploy/local

Шаблоны Taskfile для локального запуска проектов. Каталог у всех проектов одинаковый (каркас
`docs/codestyle/skeleton.txt`, сверка — `task codestyle` в корне репозитория): правка — в шаблоне
`backend/example`, затем та же копия во все проекты. Корневой `Taskfile.yml` берёт `group` и `scaffold`
у `backend/example`.

- infra - общая инфраструктура и traefik
- lang - команды по языкам
- utils - обёртки над утилитами
- group - команды всему стенду (подключается корнем репозитория)
- scaffold - новые проекты из шаблонов backend/example и frontend/example

## Подключение

Taskfile.yml сервиса подключает Taskfile.yml шаблонов и нужный lang, пример - backend/example/Taskfile.yml.

```yaml
includes:
  base:
    taskfile: ./deploy/local/Taskfile.yml
    flatten: true
    excludes: [default]
  go:
    taskfile: ./deploy/local/lang/go/Taskfile.yml
    flatten: true
```

## Команды

| Команда | Описание |
|---|---|
| task deploy | Развернуть проект с нуля |
| task build | Собрать образы проекта |
| task cicd-build | Собрать cicd образ |
| task start | Запустить контейнеры проекта |
| task stop | Остановить контейнеры проекта вместе с воркерами |
| task start-workers | Запустить воркеры (compose профиль workers) |
| task start-all | traefik + инфра + контейнеры проекта |
| task stop-all | Остановить контейнеры проекта, инфру и traefik |
| task destroy | Удалить контейнеры проекта вместе с данными |
| task containers -- args | Команда docker compose |
| task command -- args | Команда в контейнере приложения |
| task trust | Локальный CA (ao) и сертификат на домены `ao.toml`; `AO_HOSTS=true` — ещё и /etc/hosts |
| task untrust | Удалить сертификат проекта |
| task ca-install | Доверие к локальному CA в системе и браузерах |
| task ca-uninstall | Снять доверие к CA — сломает https всех стендов на машине |
| task proxy-start | Запустить traefik |
| task proxy-stop | Остановить traefik |
| task proxy-down | Удалить traefik |
| task proxy-certs | Сертификаты traefik и срок их действия |
| task infra-up | Запустить инфру |
| task infra-stop | Остановить инфру |
| task infra-down | Удалить инфру |
| task init-hooks | Установить pre-commit хуки |
| task update-submodule | Обновить сабмодули |
| task ao -- args | Команда ao (`task ao -- doctor`) |
| task prek -- args | Команда prek |
| task gomplate -- args | Команда gomplate |
| task ogen -- args | Команда ogen в контейнере |
| task gen-sqlc | Код репозиториев sqlc, конфиг собирается сам (utils/sqlc) |
| task sqlc-new -- table [домен] | Заготовка репозитория по таблице из миграций |
| task sqlc-check | Проверить запросы sqlc без генерации |
| task sqlc -- args | Команда sqlc в контейнере |


```bash
task deploy
task start -- -d
task containers -- logs -f http
task containers -- restart http
task command -- ls -la
task start-workers -- worker-emails
task infra-up TLS=true
```

Все переменные задаются в Taskfile.yml сервиса - см. backend/example/Taskfile.yml.
Любую переменную можно переопределить разово из командной строки: task test DOCKER_GO_IMAGE_NAME=golang:1.27.1-alpine3.23.

## Воркеры

Воркеры описываются в compose проекта с profiles: [workers]. task start их не запускает, task start-workers запускает, task stop останавливает.

## Весь стенд

`group/Taskfile.yml` раздаёт команды списку проектов (`PROJECTS`, по умолчанию — подкаталоги с `Taskfile.yml`): корневой `Taskfile.yml` подключает его с `backend/green-basket frontend/green-basket`.
Проекту уходят только те команды, которые у него есть; traefik и инфру поднимает первый проект, один раз.

| Команда | Описание |
|---|---|
| task deploy | Домены, traefik, инфра, затем все проекты параллельно |
| task start / stop / destroy / build | То же для запуска, остановки, сноса и сборки |
| task test / lint | Тесты и линтеры всех проектов |
| task gen | Кодоген по очереди: бэкенд (gen-api, gen-sqlc, gen-mocks), затем фронт (gen-api по контракту бэкенда) |
| task migrate | Миграции всех проектов |
| task codestyle | Сверка каркаса проектов с шаблонами (docs/codestyle/mirror.sh) и `task codestyle` каждого проекта |
| task gen-check | Сгенерированное всех проектов совпадает с источниками |
| task api-check | Клиенты API фронтендов совпадают с контрактами бэкендов |
| task where | Адреса из файлов hosts проектов |

## Новые проекты

`scaffold/Taskfile.yml` (подключён в корне): `task new-backend -- <имя>` и
`task new-frontend -- <имя> [бэкенд]` копируют `backend/example` / `frontend/example`, переименовывают
и добавляют проект в `PROJECTS`. Подробно — `scaffold/README.md`.

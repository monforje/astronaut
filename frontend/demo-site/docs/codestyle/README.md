# docs/codestyle

Как устроен и как пишется фронтенд: привязка к бэкенду, команды, правила и их проверки. Папка — часть каркаса шаблона: у всех
проектов из него она одинаковая (`skeleton.txt`, сверка — `task codestyle` в корне репозитория).

| Файл                | Что                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fsd.md`            | слои, слайсы, сегменты, публичный API                                                                                                                                                                                                                                                                                         |
| `codestyle.md`      | TypeScript, React, имена, данные и ошибки, стили                                                                                                                                                                                                                                                                              |
| `testing.md`        | vitest и Playwright                                                                                                                                                                                                                                                                                                           |
| `skeleton.txt`      | файлы каркаса: у проекта из шаблона они совпадают с шаблоном                                                                                                                                                                                                                                                                  |
| `codestyle.test.ts` | правила, которых нет в линтерах: модуль — папка с `index.ts` и файлом по её имени, папки в kebab-case, имена файлов и слайсов, README слоёв, тесты рядом с кодом, `import.meta.env`/`fetch`/`localStorage` только в своих сегментах, сгенерированные хуки не из страниц, инлайн-стили, тексты для всех кодов ошибок контракта |

Конфиги линтеров — `oxlint.config.ts`, `steiger.config.js`, `oxfmt.config.ts` — лежат в корне проекта:
там их ищут инструменты и плагины редакторов, а пути в правилах считаются от корня. Здесь — правила
словами и проверки, которых в линтерах нет.

```bash
task codestyle               # всё: tsc + oxlint + steiger + codestyle.test.ts + oxfmt --check
task lint                    # oxlint + steiger + codestyle.test.ts
task bun -- run lint:style   # только codestyle.test.ts
```

Правило поменялось — правится и текст, и проверка: сначала в шаблоне, затем в проектах из него, одним PR.

## Бэкенд и контракт

Фронт привязан к одному бэкенду — `BACKEND` в `.env.example` (каталог в `backend/`):

| Что                            | Откуда                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| контракт для `task gen-api`    | `backend/${BACKEND}/schema/openapi/openapi.yaml` (`API_CONTRACT`); пока его нет — `contract/openapi.yaml` |
| ответы API без бэкенда         | мок-бэкенд `mocks/` (MSW), `VITE_API_MOCK=true` по умолчанию — `mocks/README.md`                          |
| прокси `/api/v1` в dev-сервере | `http://${BACKEND}-http:8080` (`API_PROXY_TARGET` в `compose.yml`)                                        |
| хост стенда                    | `APP_HOSTNAME` = хост бэкенда: traefik отдаёт `/api/v1` бэкенду, остальное — фронту                       |

```bash
task gen-api      # клиент из контракта бэкенда в src/shared/api/generated
task api-check    # клиент не отстал от контракта (перегенерация + git diff)
```

Подробно — `docs/codestyle/contracts.md` в корне репозитория.

## Бренд

Источник правды — `idea/skelet/brand/` в корне монорепо. Фронт ничего из бренда не копирует: нужные файлы
подключены **симлинками** с именами по структуре фронта. Дизайнер меняет файл в `idea/skelet/brand` — dev-сервер
сразу подхватывает правку (стили и тема — горячей заменой, картинки — при обновлении страницы).

| Во фронте                      | Ссылка на                                                     |
| ------------------------------ | ------------------------------------------------------------- |
| `public/` (вся папка целиком)  | `idea/skelet/brand/public/` — внутри симлинки на файлы бренда |
| `src/app/styles/brand.css`     | `idea/skelet/brand/design/tokens.css` — палитра, `@font-face` |
| `src/app/styles/fonts/`        | `idea/skelet/brand/design/fonts/`                             |
| `src/shared/ui/theme/theme.ts` | `idea/skelet/brand/design/theme.ts` — тема Mantine            |

- Ссылки относительные и хранятся в git как симлинки. Для них включены `preserveSymlinks` (vite, tsconfig)
  и `server.fs.allow`; в Docker `idea/skelet/brand` монтируется в `/idea/skelet/brand` (`compose.yml`).
- Переименовали или удалили файл в `idea/skelet/brand` — падает `codestyle.test.ts` («ссылки на бренд целы»):
  поправьте ссылку (`ln -sfn <путь> <ссылка>`).
- Нужен новый файл бренда — новая ссылка с именем по структуре фронта, а не копия. Картинка по URL
  (`/brand/…`) — ссылкой в `idea/skelet/brand/public/`, в самом фронте ничего не трогаем: порядок шагов —
  `idea/skelet/brand/README.md`. `codestyle.test.ts` проверяет, что в `public/` только ссылки на файлы
  бренда и что каждый `/brand/…` из кода там есть.
- Во фронте поверх бренда — только роли (`app/styles/tokens.css`), своих цветов и шрифтов нет.

## Команды

```bash
task deploy                    # домены, зависимости, traefik, контейнер dev-сервера
task codestyle                 # tsc + oxlint + steiger + codestyle.test.ts + oxfmt --check
task test / task test-cover    # vitest по слоям / с порогом покрытия
task test-e2e                  # Playwright против поднятого стенда
```

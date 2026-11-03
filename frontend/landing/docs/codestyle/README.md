# docs/codestyle

Как устроен и как пишется лендинг: стек, команды, правила и их проверки. Папка — часть каркаса: файлы
`fsd.md`, `codestyle.md`, `testing.md` и `codestyle.test.ts` по структуре те же, что у `frontend/demo-site`
(`skeleton.txt`), но под Astro вместо React.

| Файл                | Что                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fsd.md`            | слои, слайсы, сегменты, публичный API; как FSD уживается с маршрутами Astro                                                                                                                                                                                                                                                               |
| `codestyle.md`      | TypeScript, `.astro`, имена, стили Tailwind                                                                                                                                                                                                                                                                                               |
| `testing.md`        | vitest + Container API Astro и Playwright                                                                                                                                                                                                                                                                                                 |
| `skeleton.txt`      | файлы каркаса, общие с другими фронтами                                                                                                                                                                                                                                                                                                   |
| `codestyle.test.ts` | правила, которых нет в линтерах: модуль — папка с `index.ts` и файлом по её имени, папки в kebab-case, README слоёв, тесты рядом с кодом, тонкие маршруты, `import.meta.env`/`fetch`/`localStorage` только в своих сегментах, без HEX-цветов, `client:*` только в features, нигде нет `calc()` с `%` и `min()`/`max()` в классах Tailwind |

Конфиги — `oxlint.config.ts`, `steiger.config.js`, `oxfmt.config.ts`, `prettier.config.mjs`, `astro.config.ts` — в корне проекта.

## Стек

| Что             | Чем                                                                                                                                           |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Фреймворк       | **Astro** — статическая сборка (`output: "static"`), два маленьких `<script>` без фреймворка (появление, магнит), острова `client:*` по нужде |
| Стили           | **Tailwind CSS 4** (`@tailwindcss/vite`), токены — `app/styles/tokens.css` поверх бренда                                                      |
| SEO             | `@astrojs/sitemap`, `robots.txt` (эндпойнт), `SeoHead` (title, description, canonical, Open Graph)                                            |
| Типы            | TypeScript 6 + `astro check` (`@astrojs/check`; TypeScript 7 пока не поддерживается)                                                          |
| Линт и формат   | oxlint, steiger (FSD), oxfmt для `.ts/.css/.md`, **prettier + prettier-plugin-astro** для `.astro`                                            |
| Тесты           | vitest (`getViteConfig` из Astro), Container API; Playwright для E2E                                                                          |
| Пакеты и запуск | bun в контейнере `oven/bun` через go-task: `task bun -- run <скрипт>`, на хосте bun не запускаем                                              |

Скрипты вызывают Astro через `bun --bun`: системный Node может быть старше, чем требует Astro.
Бэкенда у лендинга нет, API-клиента, контракта и моков тоже.

```bash
task codestyle               # astro check + oxlint + steiger + codestyle.test.ts + форматирование
task lint                    # oxlint + steiger + codestyle.test.ts
task bun -- run lint:style   # только codestyle.test.ts
```

Правило поменялось — правится и текст, и проверка.

## Бренд

Источник правды — `idea/skelet/brand/` в корне монорепо. Лендинг ничего из бренда не копирует: нужные
файлы подключены **симлинками**. Дизайнер меняет файл в `idea/skelet/brand` — dev-сервер подхватывает правку.

| В лендинге                    | Ссылка на                                                        |
| ----------------------------- | ---------------------------------------------------------------- |
| `public/` (вся папка целиком) | `idea/skelet/brand/public/` — внутри симлинки на файлы бренда    |
| `src/shared/brand/<имя>.png`  | `idea/skelet/brand/<имя>.png` — растр через `astro:assets`       |
| `src/shared/brand/doc-*.jpg`  | `idea/skelet/brand/documents/*.jpg` — листы веера документов     |
| `src/shared/brand/photos/`    | `idea/skelet/brand/photos/` (вся папка) — фото блоков, `photo()` |
| `src/app/styles/brand.css`    | `idea/skelet/brand/design/tokens.css` — палитра, `@font-face`    |
| `src/app/styles/roles.css`    | `idea/skelet/brand/design/roles.css` — роли: цвет, тени, радиусы |
| `src/app/styles/fonts/`       | `idea/skelet/brand/design/fonts/`                                |

- Ссылки относительные и хранятся в git как симлинки. Включены `preserveSymlinks` и `server.fs.allow`
  (`astro.config.ts`); в Docker `idea/skelet/brand` монтируется в `/idea/skelet/brand` (`compose.yml`).
- Переименовали или удалили файл бренда — падает `codestyle.test.ts` («ссылки на бренд целы»):
  поправьте ссылку (`ln -sfn <путь> <ссылка>`).
- Новый файл бренда — новая ссылка, а не копия. Картинка по URL (`/brand/…`) — ссылкой в
  `idea/skelet/brand/public/`, в самом лендинге ничего не трогаем: порядок шагов —
  `idea/skelet/brand/README.md`. `codestyle.test.ts` проверяет, что в `public/` только ссылки на файлы
  бренда и что каждый `/brand/…` из кода там есть.
- Фото блоков: снимок кладут в `idea/skelet/brand/photos/` под именем места (`trucks.jpg`), и он сам
  попадает в `photo("trucks")` (`import.meta.glob` по ссылке `src/shared/brand/photos`). Новое место —
  имя в `PHOTO_SLOTS` (`src/shared/brand/index.ts`) и строка в `idea/skelet/brand/photos/README.md`.
- Своих цветов и шрифтов поверх бренда нет — только роли.
- Тексты (слоганы, CTA, голос) — из `idea/skelet/brand/messaging`; чего там нет, остаётся `[TODO]`.

## Команды

```bash
task deploy                    # домены, зависимости, traefik, контейнер dev-сервера (landing.astronaut.localhost)
task codestyle                 # проверка стиля и типов
task test / task test-cover    # vitest по слоям / с порогом покрытия
task test-e2e                  # Playwright против поднятого стенда
task build-site                # статика в dist/
```

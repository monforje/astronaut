# FSD в этом проекте

Код в `src/` разложен по Feature-Sliced Design. Файл — правила словами и то, чем они проверяются:
`oxlint.config.ts` (быстрые границы слоёв), `steiger.config.js` (полный FSD-линт), `codestyle.test.ts`
(имена и расположение) — и ревью там, где инструмент не видит. Конфиг и текст расходятся — прав конфиг.

```bash
task lint                # oxlint + steiger + codestyle.test.ts
task lint-fsd            # только steiger
task bun -- run verify   # типы + lint + формат + тесты
```

## Слои

Зависимости — **только вниз**:

```
app → pages → widgets → features → entities → shared
```

| Слой       | Что лежит                                                            | Здесь                                      |
| ---------- | -------------------------------------------------------------------- | ------------------------------------------ |
| `app`      | маршруты Astro, общий `Layout`, глобальные стили; без слайсов        | `app/pages/`, `app/layout/`, `app/styles/` |
| `pages`    | содержимое экрана: секции, собранные из нижних слоёв                 | `pages/home`, `pages/not-found`            |
| `widgets`  | самостоятельный блок, который вставляют целиком                      | `widgets/header`, `widgets/footer`         |
| `features` | действие пользователя со своим UI и логикой (заявка, подписка)       | пока пусто                                 |
| `entities` | предметная сущность: данные лендинга (пакеты, вопросы) и «глупый» UI | пока пусто                                 |
| `shared`   | код без предметной области: конфиг, утилиты, UI-примитивы            | `shared/config`, `shared/lib`, `shared/ui` |

Соседи по слою друг друга не импортируют (`features/a` ✗ `features/b`): общее уезжает слоем ниже, а
два блока склеивает страница.

## Astro и слой `pages`

Маршруты Astro обязаны лежать в `<srcDir>/pages`, а `src/pages` — слой FSD. Поэтому в `astro.config.ts`
`srcDir: "./src/app"`: маршруты — **тонкие файлы** `src/app/pages/*.astro` в слое `app`:

```astro
---
import { Layout } from "@/app";
import { HomePage } from "@/pages/home";
---
<Layout title="…"><HomePage /></Layout>
```

Маршрут — три строки: страница из `@/pages/*` в `Layout`; своей разметки в нём нет (проверяет
`codestyle.test.ts`). Эндпойнты (`robots.txt.ts`) тоже живут здесь. Новый экран = слайс в `pages/` +
файл маршрута.

## Слайсы и публичная точка

В слайс заходят **только через его `index.ts`**:

```ts
import { SiteHeader } from "@/widgets/header"; // ✓
import SiteHeader from "@/widgets/header/ui/site-header/SiteHeader.astro"; // ✗
```

В `index.ts` — явный `export { … }` того, что нужно снаружи. `.astro` реэкспортируется так:
`export { default as SiteHeader } from "./SiteHeader.astro";`. Внутри слайса — относительные импорты,
между слайсами — только `@/…`.

## Сегменты

| Сегмент  | Что                             | Пример                                           |
| -------- | ------------------------------- | ------------------------------------------------ |
| `ui/`    | `.astro`-компоненты             | `widgets/header/ui/site-header/SiteHeader.astro` |
| `model/` | типы, константы, чистые функции | `entities/package/model/packages/packages.ts`    |

Внутри сегмента каждый модуль — своя папка с `index.ts` (компонент и тест вместе):
`ui/site-header/{SiteHeader.astro, SiteHeader.test.ts, index.ts}`. Правило и имена — `codestyle.md`.
Сегмента `api/` нет: бэкенда нет. `shared` режется на сегменты (`config`, `lib`, `ui`) и импортируется
через `index.ts` сегмента: `@/shared/ui`. Названия сегментов — по назначению (`components`, `types`
steiger не принимает).

## Что проверяет oxlint

`oxlint.config.ts`, правило `no-restricted-imports`, по пути файла (`src/<слой>/**`): запрет импорта
слоёв выше себя и захода вглубь слайса. Тесты могут заходить вглубь слайса, но не в слои выше себя.
Oxlint видит `.ts`; импорты внутри `.astro` проверяют steiger и ревью.

## Что проверяет steiger

Рекомендованный набор `@feature-sliced/steiger-plugin`. Отключено: `fsd/insignificant-slice` и для
`src/app/**` — `fsd/public-api`, `fsd/no-segmentless-slices` (`app` не слайсится).

## Куда класть новый код

Вопрос один — **кто это импортирует**:

1. Запускается один раз на весь сайт (маршруты, раскладка, стили) → `app`.
2. Не знает предметной области (кнопка, контейнер, SEO-теги) → `shared/<сегмент>`.
3. Содержимое экрана (секции) → `pages/<экран>`.
4. Действие пользователя, глагол (оставить заявку) → `features/<действие>`.
5. Предметное существительное (пакет, вопрос, кейс) → `entities/<сущность>`.
6. Блок из нескольких фич/сущностей, вставляемый целиком (шапка, подвал) → `widgets/<блок>`.

Секция, нужная одной странице, остаётся в `pages/<экран>/ui/`. Слайсы в `kebab-case`, в `entities` —
единственное число, компоненты — `PascalCase`.

## Чего линт не видит

- Относительный путь в чужой слайс (`../../../entities/x/model/y`).
- Смысл разбиения: слайс режется по потребителю, а не по теме.
- Предметные слова в `shared`.

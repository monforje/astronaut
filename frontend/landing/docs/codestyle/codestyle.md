# Код-стайл лендинга

Правила кода. Архитектура слоёв — `fsd.md`. Форматирование — oxfmt и prettier (`task format`), линт —
oxlint + steiger (`task lint`), типы — `astro check` (`task check`).

## TypeScript

- `strict` (`astro/tsconfigs/strict`), без `any`: неизвестное — `unknown` и сужение.
- `interface Props` — пропсы компонента; `type` — объединения и выводы.
- Константы-справочники — `as const`, типы выводятся из них.
- Только именованные экспорты; `export default` — лишь в конфигах инструментов. `.astro`-компонент
  реэкспортируется баррелем: `export { default as X } from "./X.astro"`.
- Импорт типов — `import type { … }`.

## Модуль — папка

Файлы в сегменте россыпью не лежат: каждый модуль — своя папка с баррелем `index.ts`. Рядом с кодом —
его тест, наружу — только через `index.ts`.

```
ui/site-header/
  SiteHeader.astro
  SiteHeader.test.ts
  index.ts                 export { default as SiteHeader } from "./SiteHeader.astro";
lib/page-title/
  pageTitle.ts
  pageTitle.test.ts
  index.ts
```

- Папка — `kebab-case`, файл — имя папки в своём регистре: компонент `PascalCase.astro`, остальное
  `camelCase.ts`. Проверка: `kebab(имя файла) === имя папки`.
- Без папок: `src/env.d.ts`, глобальные стили `app/styles/`, маршруты Astro `app/pages/`.

## Имена

| Что                  | Как                                         | Пример                                      |
| -------------------- | ------------------------------------------- | ------------------------------------------- |
| Слайс                | `kebab-case`, сущность — единственное число | `entities/package`, `features/request-demo` |
| Папка модуля         | `kebab-case`, по имени модуля               | `ui/site-header`, `lib/page-title`          |
| Компонент и его файл | `PascalCase.astro`                          | `ui/site-header/SiteHeader.astro`           |
| Прочие модули        | `camelCase.ts`                              | `lib/page-title/pageTitle.ts`               |
| Тест                 | в папке модуля, `.test.ts`                  | `ui/site-header/SiteHeader.test.ts`         |
| Константы            | `UPPER_SNAKE`                               | `APP_NAME`, `APP_SLOGAN`                    |

## Astro

- Компонент — `.astro`: frontmatter (`---`) с логикой и типом `interface Props`, ниже — разметка.
  Значения по умолчанию — в деструктуризации `Astro.props`.
- По умолчанию **JS на клиент не уходит**. Интерактивность — остров (`client:visible`, `client:idle`),
  заводится только в `features/` и обосновывается; сначала проверьте, хватит ли CSS и `<details>`.
  Фреймворк для островов (React, Preact) добавляется вместе с первым островом, не заранее.
- Статическая страница — один HTML: данные берутся при сборке, в рантайме запросов нет.
- Доступность — часть кода: один `h1` на страницу, иерархия заголовков, `alt` у картинок (декоративным —
  `alt=""`), `aria-label` у ссылок-иконок, ссылка «К содержимому». Тесты ищут элементы по ролям и тексту.
- SEO: `title`, `description`, canonical, Open Graph — только через `SeoHead` (`Layout` принимает
  `title`, `description`, `noindex`). Страницы без индексации (404) — `noindex`.
- Картинки статикой — из `public/`; растровые с оптимизацией — `astro:assets` (`<Image />`), с заданными
  `width`/`height` против сдвигов вёрстки.
- Тексты — по-русски, прямо в разметке. Чего нет в `idea/` — `[TODO]`, а не выдумка.
- Окружение — только через `env` из `@/shared/config` (`PUBLIC_*`, значения уходят в HTML).

## Стили

- **Tailwind CSS 4**: оформление — утилиты в разметке; склейка условных классов — `cn(a, cond && b)`.
- Цвета и шрифты — только роли темы (`bg-accent`, `text-text`, `text-muted`, `border-line`,
  `bg-surface`, `font-mono`), заданные в `app/styles/tokens.css` поверх бренда. HEX и `bg-[#…]` в
  разметке запрещены (проверяет `codestyle.test.ts`); исключение — `theme-color` в `Layout`.
- Вариации компонента — пропсами с литеральными типами (`variant`, `size`), не передачей сырых классов.
- Своё CSS, которого нет в утилитах, — `<style>` в самом `.astro` (scoped) или `app/styles/global.css`
  для базы. Постоянное оформление инлайн-`style` не пишется.
- Адаптив — mobile first: базовые классы для телефона, `md:`/`lg:` для широких экранов.
- Уважаем `prefers-reduced-motion` (глобально в `global.css`).

## Комментарии

JSDoc `/** … */` по-русски над экспортом, когда нужно объяснить **почему** (бизнес-правило, особенность
сборки). Очевидное не комментируется.

## Тесты

- Vitest, имена `it("…")` — по-русски, описывают поведение: `it("закрывает от индексации только по noindex")`.
- Компонент рендерится через `renderAstro` из `@/shared/lib/test-utils`. Подробно — `testing.md`.

## Порядок импортов

Внешние пакеты → другие слои через `@/…` → относительные внутри слайса → стили.

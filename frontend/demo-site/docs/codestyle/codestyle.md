# Код-стайл фронтенда

Правила фронтенд-кода. Архитектура слоёв — `fsd.md`. В примерах `item` — условная сущность. Форматирование —
oxfmt (`task format`), линт — oxlint + steiger (`task lint`), типы — `task check`.

## TypeScript

- `strict`, без `any`: неизвестное — `unknown` и сужение (`e instanceof ApiError`).
- Типы API — только из `@/shared/api` (сгенерированы из контракта), свои дубли не заводятся.
  Узкий тип — через `Pick<Item, "id" | "name">`.
- `interface` — для объектов-контрактов (пропсы с несколькими полями, хранилища), `type` — для
  объединений и выводов (`type SortKey = (typeof SORTS)[number]["key"]`).
- Константы-справочники — `as const`, типы выводятся из них.
- Только именованные экспорты; `export default` — лишь в конфигах инструментов.
- Импорт типов — `import type { … }` или `type` в списке: `import { ApiError, type Item }`.

## Модуль — папка

Файлы в сегменте россыпью не лежат: каждый модуль — своя папка с баррелем `index.ts`. Рядом с кодом —
его тест и стили, наружу — только через `index.ts`.

```
ui/archive-button/
  ArchiveButton.tsx
  ArchiveButton.module.css
  ArchiveButton.test.tsx
  index.ts                 export { ArchiveButton } from "./ArchiveButton";
lib/http-client/
  httpClient.ts
  httpClient.test.ts
  index.ts
```

- Папка — `kebab-case`, файл — имя папки в своём регистре: компонент `PascalCase`, хук `useXxx`,
  остальное `camelCase`. Проверка: `kebab(имя файла) === имя папки` (`ArchiveButton` → `archive-button`).
- Внутри слайса импорт — через баррель модуля: `../../api/use-item`, не `../../api/use-item/useItem`.
- Без папок: `src/main.tsx`, `*.d.ts`, глобальные стили `app/styles/`, сгенерированный клиент.
- Всё это проверяет `codestyle.test.ts` (раздел «структура»).

## Имена

| Что                  | Как                                         | Пример                                          |
| -------------------- | ------------------------------------------- | ----------------------------------------------- |
| Слайс                | `kebab-case`, сущность — единственное число | `entities/item`, `features/archive-item`        |
| Папка модуля         | `kebab-case`, по имени модуля               | `ui/archive-button`, `api/use-item`             |
| Компонент и его файл | `PascalCase`                                | `ui/archive-button/ArchiveButton.tsx`           |
| Стили компонента     | CSS Module в папке компонента               | `ui/archive-button/ArchiveButton.module.css`    |
| Хук и его файл       | `useXxx`                                    | `model/use-archive-item/useArchiveItem.ts`      |
| Прочие модули        | `camelCase`                                 | `api/http-client/httpClient.ts`, `lib/cn/cn.ts` |
| Тест                 | в папке модуля, `.test.ts(x)`               | `ui/archive-button/ArchiveButton.test.tsx`      |
| Константы            | `UPPER_SNAKE`                               | `MAX_PER_ITEM`, `CATEGORIES`                    |
| Классы CSS           | `camelCase`                                 | `styles.lineName`                               |

## React

- Готового UI-кита нет (от Mantine отказались 04.11.2026), свой напишем позже в `shared/ui`. Пока —
  обычный HTML и временные глобальные классы `.button`, `.skeleton` (`shared/ui/README.md`). Сторонний
  UI-кит не подключаем.
- Компоненты — функции `export function Name(props) {}`; пропсы — деструктуризация с типом в
  сигнатуре; значения по умолчанию — в деструктуризации (`size = "md"`).
- Маленький вспомогательный компонент, нужный одному файлу, живёт в этом файле без экспорта
  (`Row` в `ItemsPage.tsx`).
- Логика — в хуках сегмента `model/` (`useArchiveItem`), разметка — в `ui/`. Компонент страницы
  собирает, а не считает.
- Состояния «загрузка / ошибка / пусто» показываются явно: заглушка `.skeleton` с `aria-busy`, `ErrorState` с
  повтором, `EmptyState` из `@/shared/ui`.
- Формы — проверка схемой **valibot**, схема лежит в `model/` фичи; ошибки бэкенда под полем —
  `fieldError(e, "email")`. Состояние формы и уведомления решим вместе со своим UI-китом.
- Доступность — часть кода: кнопки с `aria-label`, группы с подписью, `role="alert"` для ошибок.
  Тесты ищут элементы по ролям — если не находят, это баг доступности.
- Тексты интерфейса — по-русски, прямо в JSX; склонения — `plural`, цены — `formatPrice`.

## Данные

- Серверное состояние — только TanStack Query. Сгенерированные функции и ключи (`itemGet`,
  `getItemGetQueryKey`) оборачиваются хуком сущности в `entities/<x>/api` — там же `staleTime`,
  `enabled`, перевод «нет данных» в `null`.
- Мутации — в `features/<x>/model` через `useMutation`; после успеха — точечное обновление кэша
  (`setItemCache`) или `invalidate…` из orval.
- Ошибки запросов всегда `ApiError` (`status`, `code` из `ErrorCode` контракта, `fieldErrors`,
  `retryAfter`). Ветвление — по `code`, текст пользователю — `errorMessage(e)` из `@/shared/lib`
  (словарь по кодам), под полем формы — `fieldError(e, "email")`.
- Клиентское состояние, которое делят несколько компонентов (фильтры, выбранное, черновик), — стор
  **zustand** в `model/` слайса. Локальное для одного компонента — `useState`. Серверные данные в
  zustand не копируются — они в TanStack Query.
- Локальное долговременное состояние (настройки вида, черновики) — через модуль `shared/lib`, не
  `localStorage` напрямую (проверяет `codestyle.test.ts`).
- Окружение — только через `env` из `@/shared/config` (`VITE_*`).
- Бэкенда пока нет: контракт — `contract/openapi.yaml`, ответы — мок-бэкенд `mocks/` (MSW,
  `VITE_API_MOCK`). Код приложения про моки не знает. Как писать моки — `mocks/README.md`.
- Zod не используется: проверка данных — valibot.

## Стили

- Цвета, шрифты, радиусы в CSS — роли из `app/styles/roles.css` (симлинк на бренд, общие с лендингом):
  `var(--text-muted)`, `var(--line)`, `var(--radius-card)`. Шкалы цветов и умолчания компонентов для
  своего UI-кита — тема `shared/ui/theme` (симлинк на `idea/skelet/brand/design/theme.ts`).
- CSS Modules на компонент — для раскладки; глобально — только `app/styles/` (`index.css` — вход,
  `tokens.css`, `global.css`).
- Без инлайн-стилей и магических цветов: цвет и отступы — тема и токены.
- Склейка классов — `cn(a, cond && b)`.

## Комментарии

- JSDoc `/** … */` по-русски над экспортом, когда нужно объяснить **почему** (бизнес-правило,
  особенность бэкенда, гонка). Очевидное не комментируется.

## Тесты

- Vitest + Testing Library, имена `it("…")` — по-русски, описывают поведение:
  `it("архивирует элемент и убирает его из списка")`.
- Сеть мокается на границе `fetch` (`mockApi` из `@/shared/lib/test-utils`), сгенерированный код и
  TanStack Query работают настоящие. Подробно — `testing.md`.

## Порядок импортов

Внешние пакеты → `@/shared/api` и другие слои через `@/…` → относительные внутри слайса → стили.
Внутри слайса — относительные пути, между слайсами — только `@/<слой>/<слайс>`.

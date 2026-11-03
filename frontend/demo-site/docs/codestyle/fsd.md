# FSD в этом проекте

В примерах `item` — условная сущность.

Код в `src/` разложен по Feature-Sliced Design. Этот файл — правила словами и
то, чем они проверяются: `oxlint.config.ts` (быстрые границы слоёв) и `steiger.config.js`
(полный FSD-линт) в корне проекта, `codestyle.test.ts` (имена и расположение) рядом с этим
файлом — и ревью там, где инструмент не видит.
Если правило здесь и в конфиге расходятся — прав конфиг, а этот файл надо
поправить.

```bash
task lint                # oxlint + steiger (bun run lint)
task lint-fsd            # только steiger
task bun -- run verify   # типы + lint + формат + тесты
```

## Слои

Зависимости — **только вниз**:

```
app → pages → widgets → features → entities → shared
```

| Слой       | Что лежит                                                                                        | Здесь                                                    |
| ---------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `app`      | корневой компонент, провайдеры (`QueryProvider`, `ErrorBoundary`), глобальные стили; без слайсов | `app/app/App.tsx`, `app/query-provider/`                 |
| `pages`    | экран: раскладка и сборка из нижних слоёв                                                        | `pages/items`, `pages/item`                              |
| `widgets`  | самостоятельный блок из нескольких фич/сущностей                                                 | `widgets/header`, `widgets/item-table`                   |
| `features` | действие пользователя со своим UI и мутацией API                                                 | `features/auth`, `features/archive-item`                 |
| `entities` | предметная сущность: типы, запросы (поверх сгенерированных хуков), мелкий UI                     | `entities/item`, `entities/viewer`                       |
| `shared`   | код без предметной области: API-клиент, конфиг, утилиты, UI-примитивы                            | `shared/api`, `shared/config`, `shared/lib`, `shared/ui` |

Слой `widgets` — составные блоки (шапка, таблица элементов, подвал); заводите новый, когда появится блок,
собирающий несколько фич, который вставляют в страницы целиком.

Импорт слоя выше себя — ошибка oxlint:

```
Слой shared не импортирует слои выше себя (порядок: app → pages → widgets → features → entities → shared).
```

Соседи по слою друг друга не импортируют (`features/a` ✗ `features/b`):
общее уезжает слоем ниже, а две фичи склеивает страница.

## Слайсы и публичная точка

Слой делится на слайсы (`entities/item`, `features/create-item`,
`pages/items`). В слайс заходят **только через его `index.ts`**:

```ts
import { ItemList, useItems } from "@/entities/item"; // ✓
import { useItems } from "@/entities/item/api/use-items"; // ✗
```

```
Импорт в обход публичной точки слайса: берите из index.ts слайса.
```

В `index.ts` — явный `export { … }` только того, что нужно снаружи сегодня.
Внутри слайса — относительные импорты (`../model/types`), между слайсами —
только `@/…`: oxlint смотрит на алиас, а относительный путь в чужой слайс его
обходит.

## Сегменты

| Сегмент  | Что                                                    | Пример                                      |
| -------- | ------------------------------------------------------ | ------------------------------------------- |
| `ui/`    | компоненты                                             | `entities/item/ui/item-list/ItemList.tsx`   |
| `model/` | типы, чистые функции, состояние (zustand)              | `entities/item/model/item-sort/itemSort.ts` |
| `api/`   | запросы к серверу — единственное место запросов слайса | `entities/item/api/use-items/useItems.ts`   |

Внутри сегмента каждый модуль — своя папка с `index.ts` (компонент, его стили и тест — вместе):
`ui/item-list/{ItemList.tsx, ItemList.module.css, ItemList.test.tsx, index.ts}`. Правило и имена —
`codestyle.md`, раздел «Модуль — папка»; проверяет `codestyle.test.ts`. Публичная точка слайса
собирает баррели модулей: `export { ItemList } from "./ui/item-list";`.

Если нужны `lib/` (вспомогательное) или `config/` (константы) — добавляйте в
слайс по месту. `shared` режется на сегменты, а не на слайсы, и импортируется
через `index.ts` сегмента: `@/shared/api`, `@/shared/ui`, `@/shared/lib`,
`@/shared/config`. Названия сегментов — по назначению, не по содержимому
(`providers`, `components`, `types` steiger не принимает), поэтому провайдеры
`app` лежат прямо в `app/`.

## API-клиент: orval

Клиент генерируется из контракта бэкенда
(`../../backend/${BACKEND}/schema/openapi/openapi.yaml`, `BACKEND` — в `.env.example`) конфигом
`orval.config.ts`. Пока бэкенда нет — из `contract/openapi.yaml` во фронте, а отвечает мок-бэкенд
`mocks/` (`mocks/README.md`):

```bash
task gen-api             # orval в контейнере (монтируется корень монорепо)
```

- Результат — `src/shared/api/generated/`: `items/items.ts` (хуки TanStack Query:
  `useItemsList`, `useItemsCreate`, `invalidateItemsList`, …) и
  `model/` (типы схем). Он **коммитится** и **руками не правится** — после
  изменения контракта перегенерируйте. Из oxlint, oxfmt и steiger он исключён.
- Запросы идут через мутатор `shared/api/http-client/httpClient.ts` (`customFetch`): базовый
  URL из `shared/config` (`VITE_API_BASE_URL`), ошибки бэкенда `{code, message}`
  приходят как `ApiError`.
- Наружу `shared/api` отдаёт и сгенерированное, и `ApiError`. Слайс не вызывает
  сгенерированные хуки где попало: сущность оборачивает запросы
  (`entities/item/api/use-items`), фича берёт мутацию и сбрасывает кэш списка
  через `invalidateItems`.

## Что проверяет oxlint

`oxlint.config.ts`, правило `no-restricted-imports`, по пути файла (`src/<слой>/**`):

- запрет импорта слоёв выше себя;
- запрет захода вглубь слайса `pages`, `widgets`, `features`, `entities`
  (любой путь глубже `@/<слой>/<слайс>`).

Тесты (`*.test.ts`, `*.test.tsx`) могут заходить вглубь слайса, но не в слои
выше себя. Остальное в конфиге — обычные правила (`import/no-cycle` и пр.).

## Что проверяет steiger

`steiger.config.js`, рекомендованный набор `@feature-sliced/steiger-plugin`:
публичный API слайса (`no-public-api-sidestep` — в том числе в тестах),
сегменты, импорты соседей по слою, пустые слайсы и др. Отключено:

- `fsd/insignificant-slice` — шаблон показывает слой `features`, даже когда
  фичей пользуется одна страница;
- для `src/app/**` — `fsd/public-api` и `fsd/no-segmentless-slices`: `app`
  не слайсится.

Если oxlint и steiger расходятся — прав steiger, конфиг oxlint чинится.

## Куда класть новый код

Вопрос один — **кто это импортирует**:

1. Запускается один раз на всё приложение (провайдеры, стили) → `app`.
2. Не знает предметной области (HTTP-клиент, кнопка, форматирование) → `shared/<сегмент>`.
3. Экран целиком (раскладка и сборка) → `pages/<экран>`.
4. Действие пользователя, глагол (создать, удалить) → `features/<действие>`.
5. Предметное существительное: типы, запросы, «глупый» UI → `entities/<сущность>`.
6. Блок из нескольких фич/сущностей, вставляемый целиком → `widgets/<блок>`.

Именование: слайсы в `kebab-case` (`create-item`), в `entities` — в
единственном числе, в `pages` — по экрану; компоненты — `PascalCase`.

## Чего линт не видит

- Относительный путь в чужой слайс (`../../../entities/item/model/types`).
- Смысл разбиения: слайс режется по потребителю, а не по теме; если у двух
  половин слайса разные потребители — это два слайса.
- Предметные слова в `shared`.
- Правку `shared/api/generated` руками — её перезатрёт следующий `gen-api`.

Состояния списка (загрузка / ошибка / пусто) живут в UI сущности
(`ui/item-list/ItemList.tsx`), страница только собирает форму и список.

## Проверка

```bash
task lint                      # oxlint + steiger
task check                     # tsc
task bun -- run format:check   # oxfmt
task test                      # vitest по слоям (запросы мокаются на границе fetch)
task bun -- run verify         # всё сразу: check + lint + format:check + test
```

`task bun -- run <скрипт>` запускает скрипт из `package.json` в контейнере
`oven/bun`; на хосте bun не запускаем.

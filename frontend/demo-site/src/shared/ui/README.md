# shared/ui

UI без предметной области. Базовые элементы — из UI-кита `@astronaut/ui-kit` (`frontend/ui-kit`; Button, Card,
Alert, Skeleton, Badge, Sheet, toast…): во фронте его не копируют и не переписывают. Здесь живут только составные
блоки, которых в ките нет, и только из его компонентов и токенов.

```
ui/
  empty-state/      EmptyState — пустое состояние по центру: значок кита, заголовок, пояснение, одно действие
                    (отдельной записи в ките нет, раскладка на его токенах)
  error-state/      ErrorState — ошибка загрузки плашкой Alert кита с «Повторить», role="alert"
  index.ts          наружу: EmptyState, ErrorState
```

Каждый модуль — папка со своим `index.ts`: компонент, его CSS Module и тест лежат вместе
(`empty-state/EmptyState.tsx`, `EmptyState.module.css`, `EmptyState.test.tsx`, `index.ts`).

## Правила

- **Свой компонент** — когда он нужен в нескольких слайсах. Компонент одного слайса живёт в слайсе.
- **Цвет и шрифты — из кита.** В CSS — роли `var(--text)`, `var(--surface)`, `var(--fs-heading)` из
  `@astronaut/ui-kit/styles.css`; токены не копируются и не переопределяются. HEX-цветов нет.
- **Стили** — CSS Module рядом с компонентом. Инлайн-стиль — только для вычисляемых значений.
- **Без предметных слов.** «Подключение», «отправление» — это `entities`/`features`, не `shared/ui`.
- **Тесты** рендерят обычным `render` из Testing Library; компонент с запросами — `renderWithClient`
  из `@/shared/lib/test-utils`.
- Новый модуль — папка `kebab-case` + строка в `index.ts`.

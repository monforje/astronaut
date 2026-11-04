# shared/ui

UI без предметной области. Готового UI-кита нет: от Mantine отказались (04.11.2026), свой кит пишем
позже — он поселится здесь. Пока базовые элементы — обычный HTML (`<button>`, `<input>`) с глобальными
классами из `app/styles/global.css` (`.button`, `.button-outline`, `.skeleton`) — это временно.

```
ui/
  theme/            тема бренда без фреймворка: шкалы цветов, шрифты, радиусы, тени, умолчания компонентов
                    (theme.ts — симлинк на idea/skelet/brand/design/theme.ts: правится в бренде)
  empty-state/      EmptyState — пустое состояние: заголовок, пояснение, действие
  error-state/      ErrorState — ошибка загрузки с повтором, role="alert"
  index.ts          наружу: EmptyState, ErrorState, theme
```

Каждый модуль — папка со своим `index.ts`: компонент, его CSS Module и тест лежат вместе
(`empty-state/EmptyState.tsx`, `EmptyState.module.css`, `EmptyState.test.tsx`, `index.ts`).

## Правила

- **Свой компонент** — когда он нужен в нескольких слайсах. Компонент одного слайса живёт в слайсе.
- **Цвет и шрифты — из бренда.** В CSS — роли `var(--…)` из `roles.css` (общие с лендингом); шкалы и
  умолчания — `theme` отсюда. HEX-цветов в компонентах нет.
- **Стили** — CSS Module рядом с компонентом. Инлайн-стиль — только для вычисляемых значений.
- **Без предметных слов.** «Подключение», «отправление» — это `entities`/`features`, не `shared/ui`.
- **Тесты** рендерят обычным `render` из Testing Library; компонент с запросами — `renderWithClient`
  из `@/shared/lib/test-utils`.
- Новый модуль — папка `kebab-case` + строка в `index.ts`.

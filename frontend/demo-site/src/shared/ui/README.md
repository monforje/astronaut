# shared/ui

UI без предметной области. Базовые компоненты — **[Mantine](https://mantine.dev)** (`Button`, `TextInput`,
`Skeleton`, `Modal`, `Table`…): их берут прямо из `@mantine/core`, своих кнопок и полей здесь нет.

Сюда попадает только то, чего в Mantine нет или что у нас повторяется одинаково по всему приложению:
тема и составные блоки поверх Mantine с нашими текстами и правилами доступности.

```
ui/
  theme/            тема Mantine (theme.ts — симлинк на idea/skelet/brand/design/theme.ts: правится в бренде)
  empty-state/      EmptyState — пустое состояние: заголовок, пояснение, действие
  error-state/      ErrorState — ошибка загрузки с повтором, role="alert"
  index.ts          наружу: EmptyState, ErrorState, theme
```

Каждый модуль — папка со своим `index.ts`: компонент, его CSS Module и тест лежат вместе
(`empty-state/EmptyState.tsx`, `EmptyState.module.css`, `EmptyState.test.tsx`, `index.ts`).

## Правила

- **Сначала Mantine.** Нужен компонент — ищите в Mantine; оборачивать его «на всякий случай» не нужно.
  Свой компонент — когда он собирает несколько компонентов Mantine с нашим поведением (тексты, роли,
  состояния) и нужен в нескольких слайсах.
- **Цвет и шрифты — из темы.** Пропсы Mantine (`c="dimmed"`, `color="accent"`, `variant="light"`) или
  токены `var(--…)` из `app/styles/tokens.css`; HEX-цветов в компонентах нет.
- **Стили** — пропсы Mantine для мелочей (`gap`, `size`), CSS Module для раскладки. Инлайн-стиль — только для
  вычисляемых значений.
- **Без предметных слов.** «Подключение», «отправление» — это `entities`/`features`, не `shared/ui`.
- **Тесты** рендерят через `renderWithTheme` из `@/shared/lib/test-utils`: компонентам Mantine нужен
  `MantineProvider`.
- Новый модуль — папка `kebab-case` + строка в `index.ts`.

# AGENTS.md

Словарь дизайн-системы Astronaut: сайт-спецификация компонентов (https://ui-kit.astronaut.localhost). Подробные правила проекта, структура и схема `doc.tsx` — в `CLAUDE.md` рядом; здесь только то, что нужно агенту сразу.

## Как читать компонент

1. `llms.txt` — список компонентов по группам со ссылками; `llms-full.txt` — общие правила и все README подряд.
2. Перед правкой компонента прочитайте `src/entries/<id>/README.md` (в dev также `/entries/<id>.md`): когда использовать, анатомия, варианты, состояния, токены, доступность, хореография, открытые вопросы (`[TODO]`).
3. Часть README между `gen:start` и `gen:end` генерируется из `doc.tsx` — не правьте её руками, меняйте `doc.tsx` и запускайте `task bun -- run docs`. Раздел «Как использовать» (между `manual:start` и `manual:end`) пишется руками.

MCP-сервер `astronaut-ui-kit` (`task mcp`, подключён в `.mcp.json` корня) отдаёт то же инструментами `search`, `get_component`, `get_tokens`, `get_design_rules`; подробности в `CLAUDE.md`.

## Проверка

Команды только через task из этой папки (bun и vite на хосте не запускать):

```bash
task bun -- run docs      # перегенерировать README и llms
task bun -- run verify    # tsc + oxlint + oxfmt --check + vitest
```

## Правила дизайна (коротко)

- Цвета только ролями из `styles/tokens.css`, без HEX; длительности токенами `--dur-f/--dur/--dur-s`.
- Нет левых акцентных линий; цифры без моно (Onest с `tabular-nums`), Fira Code только для кода и логов.
- Пара кнопок 50/50, главная слева; Dialog без крестика; без 3D и градиентов на аватарах.
- Анимации бренда только готовые из `brand/animated`.
- Классы и `@keyframes` с префиксом компонента (`ds-btn`); в `.ts/.tsx/.css` первой строкой лицензия и никаких комментариев.
- Не выдумывать факты: неизвестное — `[TODO]`.

Полный список: `src/docgen/design-rules.md`.

© 2026 Komarov Zhiznev Group. Все права защищены. См. LICENSE

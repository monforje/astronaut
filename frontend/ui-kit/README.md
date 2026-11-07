# Словарь дизайн-системы Astronaut

Сайт-спецификация: слева компоненты по группам (поиск Ctrl K), справа страница компонента с вариантами, состояниями, анатомией, правилами, доступностью, токенами и разделом «Хореография» с живым «Проиграть». Адрес стенда: https://ui-kit.astronaut.localhost (`task deploy`). Работа с проектом, команды и правила: `CLAUDE.md`.

## MCP-сервер и скилл для агентов

`task mcp` запускает MCP-сервер `astronaut-ui-kit` (stdio, Docker, только чтение): `list_components`, `get_component`, `get_component_source`, `search`, `get_tokens`, `get_design_rules`, `get_choreography` и ресурсы `uikit://llms.txt`, `uikit://llms-full.txt`, `uikit://component/<id>`. В Claude Code он подключён через `.mcp.json` в корне репозитория; рядом проектный скилл `ui-kit` (`.claude/skills/ui-kit/SKILL.md`). Подробности и проверка: `CLAUDE.md`, раздел «MCP-сервер и скилл».

## Пакет @astronaut/ui-kit

Кит собирается в пакет для соседних фронтов (в реестры не публикуется, лицензия проприетарная). `task lib-build` собирает `dist-lib/` (`index.js`, `.d.ts`, `styles.css`, `tokens.css`, `assets/`), `task pack` кладёт tarball в `dist-pack/`, `task lib-check` проверяет содержимое и собирает смоук-потребитель.

Подключение в соседний фронт: `"@astronaut/ui-kit": "file:../ui-kit"` (после `task -d ../ui-kit lib-build`) либо tarball `file:../ui-kit/dist-pack/astronaut-ui-kit-<версия>.tgz`; нужны `react` и `react-dom` 19.x, один раз `import "@astronaut/ui-kit/styles.css"` и `data-theme="light" | "dark"` на `<html>`. Импорт компонентов: `import { Button } from "@astronaut/ui-kit"` (внутри кита тот же API из `@/ui`). Подробности (ресурсы и шрифты, `exports`, обновление): `CLAUDE.md`, раздел «Пакет».

## Вкладки страницы

У каждой записи две вкладки: «Хореография» (спецификация: анатомия, варианты, состояния, правила, токены и сворачиваемый README) и «Компонент» (импорт, живые примеры с кодом и кнопкой «Копировать», пропсы и доступность из раздела «Как использовать» в README.md). Адреса: `#/button` и `#/button/states` — спецификация, `#/button/component` и `#/button/component/props` — компонент. Для записей основ (цвета, типографика) вкладка «Компонент» скрыта. Подробности: `CLAUDE.md`, раздел «Вкладки страницы компонента и CodeBlock».

## Шаблон новой записи

`src/entries/<kebab-id>/doc.tsx` (рядом `demo.tsx` и `<имя>.css`; классы в css начинаются с `cssPrefix`):

Каждый `.ts`, `.tsx` и `.css` начинается строкой `/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */` (в css `/* … */`), других комментариев в исходниках нет; текстовые поля страницы принимают строку с `` `кодом` `` или JSX.

```tsx
/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Callout } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoX } from "./demo";

export default defineDoc({
  id: "x", // = имя папки
  title: "X",
  group: "actions", // base | actions | fields | tables | navigation | feedback | overlays | people | time | data
  cssPrefix: "ds-x",
  summary: "Что это и зачем, одна-две фразы.",
  purpose: "Назначение подробнее (необязательно).",
  anatomy: {
    demo: (
      <Callout n={1}>
        <DemoX />
      </Callout>
    ),
    parts: [{ name: "Контейнер", description: "…" }],
  },
  variants: [{ id: "primary", title: "Primary", description: "…", when: "…", demo: <DemoX /> }],
  sizes: [],
  states: [
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "слой 4 %",
      forced: true,
      demo: <DemoX force="hover" />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "почему не применимо",
      notApplicable: true,
    },
  ],
  rules: { use: ["…"], avoid: ["…"] },
  a11y: [{ kind: "key", title: "Enter", text: "…" }],
  tokens: [{ name: "--primary", value: "#00d4d0", usage: "…", kind: "color" }],
  choreography: [
    {
      id: "hover",
      title: "Наведение",
      trigger: "курсор входит",
      origin: "mockup", // или "proposal", если решение не из макета
      steps: [{ at: 0, dur: 125, what: "…", prop: "background", easing: "ease" }],
      focus: "что с фокусом",
      reducedMotion: "что при prefers-reduced-motion",
      neighbours: "как реагируют соседи",
      demo: (
        <Playback
          initial={{ f: undefined }}
          script={[{ at: 400, set: { f: "hover" } }]}
          render={(s) => <DemoX force={s.f} />}
        />
      ),
    },
  ],
  examples: [{ id: "basic", title: "Базовый", demo: <DemoX />, code: "<X />" }],
});
```

Эталон полной записи — `src/entries/button/`.

## Широкие демо и метки анатомии

`wide: true` у варианта/состояния и `wideDemos: { variants, states }` у страницы — карточки на всю ширину (остальные карточки укладываются колонками без пустот); `Playback` принимает `rest` — что показывать в покое; метки анатомии: `<Callout n side anchor block>` и `<Marks items block>` (`side`: `tl tr bl br t b l r`, `anchor` — CSS-селектор части). Подробно — в `CLAUDE.md`, раздел «Широкие демо и метки анатомии».

© 2026 Komarov Zhiznev Group. Все права защищены. См. LICENSE

# CLAUDE.md

Короткая памятка для агента (как читать README компонента, проверка, правила дизайна) — в `AGENTS.md`.

Словарь дизайн-системы Astronaut: React-сайт, где у каждого компонента есть страница-спецификация (варианты, состояния, анатомия, правила, доступность, токены и «Хореография» — как компонент двигается). Реализация компонентов живёт в этом же проекте (`src/ui`, `src/entries/<id>/`): готовы Button, Badge, Avatar, остальное пока демо-разметка. Корневой `/CLAUDE.md` (Docker/go-task, бренд симлинками) действует и здесь; ниже только то, что специфично для словаря.

Источник состава и значений — макет `temp/design-system/astronaut-ds.html` (в git не лежит, `/temp/` в .gitignore). Бренд — `idea/skelet/brand`. Не выдумывать факты: чего нет в макете, помечать `[TODO]` и `origin: "proposal"`.

## Команды (из этой папки; bun/vite на хосте не запускать)

```bash
task deploy                        # trust + deps + общий traefik + dev-сервер → https://ui-kit.astronaut.localhost
task start -- -d / task stop       # контейнер dev-сервера
task containers -- logs -f frontend
task bun -- run verify             # tsc + oxlint + oxfmt --check + vitest (entries.test.ts и тесты компонентов)
task bun -- run docs               # README компонентов + src/generated/llms*.txt из doc.tsx
task format                        # oxfmt --write .
task bun -- x vitest run -t "имя"
task bun -- run build              # статика в dist/ (hash-роутер, любой статический сервер)
task mcp                           # MCP-сервер кита по stdio (см. «MCP-сервер и скилл»)
task lib-build                     # пакет @astronaut/ui-kit в dist-lib/ (см. «Пакет»)
task pack                          # lib-build + tarball dist-pack/astronaut-ui-kit-<версия>.tgz
task lib-check                     # pack + проверка содержимого + смоук-потребитель (Vite, tsc, vitest)
```

`deploy/local/` — тот же шаблон, что у `demo-site` и `landing` (менять сразу во всех копиях). Хост — в `ao.toml` и `.env.example` (`ui-kit.astronaut.localhost`). Бренд: `public/` → `idea/skelet/brand/public`, `src/styles/brand.css` и `src/styles/fonts` → `idea/skelet/brand/design/*`; папка бренда смонтирована в `compose.yml` и `DOCKER_BUN_RUN_ARGS` (Taskfile). `src/ui/assets/ai-logo-1.png` — копия из temp, [TODO] перенести в brand после выбора варианта логотипа агента.

## Структура

```
src/
  main.tsx, app/          оболочка: роутер (HashRouter: статика без fallback на index.html, `#/button/states`), Shell, Sidebar (поиск Ctrl K, группы; первый Esc чистит поиск, второй закрывает меню), страницы Home/«скоро»/404
  engine/                 движок страницы: DocPage (шапка, вкладки), SpecTab, ComponentTab, Tabs, route, readme, CodeBlock + highlight, Markdown + markdown, blocks/*, Playback («Проиграть»), Toc, Callout (Marks), Rich, Icon, registry, types, engine.css, entry.css (вкладки, код, markdown)
                          Section: якорь `s-<id>`, прокрутка учитывает липкую шапку (scroll-padding в base.css); theme.ts: начальную тему ставит скрипт в index.html (без вспышки)
  entries/<kebab-id>/     ОДИН компонент = одна папка: doc.tsx + <имя>.css + demo.tsx (+ Name.tsx, index.ts, Name.test.tsx у реализованных)
  ui/                     публичная точка входа кита (index.ts), internal/ (общий внутренний слой), assets (знак агента PNG и симлинки на brand/animated), test-setup
  index.ts, tokens.ts     входы пакета: index.ts = стили + `export * from "./ui"`, tokens.ts = только brand.css и tokens.css (см. «Пакет»)
  entries/_planned.ts     список «скоро» (строки скрываются сами, когда появляется doc.tsx с тем же id)
  styles/                 brand.css (симлинк), tokens.css (роли из макета, светлая и тёмная), base.css
  entries.test.ts         проверяет схему всех doc.tsx, префиксы классов в css, README и llms
  docgen/                 генератор README/llms (render.ts, files.ts) и design-rules.md
  generated/              llms.txt, llms-full.txt (в git, генерируются)
tests/consumer/           фикстура смоук-теста пакета: Vite + React + vitest, импортирует кит из tarball
vite.lib.config.ts, tsconfig.lib.json   сборка пакета; scripts/{lib-finish,check-lib,smoke-consumer}.ts
mcp/                      MCP-сервер кита: main.ts (stdio), server.ts (инструменты и ресурсы), tools.ts (ответы), kit.ts (чтение файлов), server.test.ts
```

Каждый `entries/*/doc.tsx` попадает в словарь сам (`import.meta.glob` в `engine/registry.ts`). **Общие файлы для нового компонента править не нужно** — это позволяет нескольким агентам добавлять компоненты параллельно. Не трогать: `engine/`, `styles/`, `_planned.ts`, чужие папки `entries/`.

## Широкие демо и метки анатомии (движок)

- Сетки «Варианты» (колонка от 340 px) и «Состояния» (от 320 px) — CSS columns (мозаика без дыр): карточки не рвутся (`break-inside: avoid`) и стоят в порядке чтения сверху вниз по колонкам. Демо шире колонки: `wide: true` у варианта или состояния — карточка на всю ширину (`column-span: all`, колонки до и после неё балансируются отдельно); `wideDemos: { variants?: true, states?: true }` у `DocSpec` — весь раздел в одну колонку. Содержимое карточки сжимается (`min-width: 0`), горизонтальная прокрутка внутри карточки — последний случай. Состояние `notApplicable` рисуется компактной плашкой.
- `<Callout n side? anchor? block?>` и `<Marks items={[{ n, anchor?, side? }]} block?>` (`@/engine/Callout`). `anchor` — CSS-селектор части внутри демо (`".ds-dialog__header"`): метка ставится у неё; если часть не найдена, метка встаёт у всего демо и в dev-консоли `console.warn`. `side`: угловые `tl tr bl br` (кружок у угла, по умолчанию `tr`) и боковые `t b l r` (по умолчанию `l` при `anchor`): кружок в поле 28 px с этой стороны демо (поле только там, где стоит метка), от него линия-выноска до ближайшего к метке края части, на конце точка. `block` — обёртка на всю ширину для демо с `width: 100%` (диалог, панель, таблица); если демо схлопнулось, обёртка сама станет блочной. Несколько частей одного демо — один `<Marks>`. Позиции пересчитываются сами: `ResizeObserver` (обёртка, демо, части), `MutationObserver` (часть появилась позже, поменялся масштаб Fit), окно и загрузка шрифтов; таймеров нет.
- Текстовые поля `DocSpec` (`description`, `when`, `note`, `what`, `trigger`, `focus`, `reducedMotion`, `neighbours`, `usage`, `text`, `purpose`, правила `use`/`avoid`, пояснения примеров) имеют тип `RichText` (= `ReactNode`): строка с `` `кодом` `` в обратных кавычках рисуется с `<code>`, JSX проходит как есть. Хелпер `rich(text)` и компонент `<Rich>` — в `@/engine/Rich`. `summary` остаётся строкой (идёт в поиск и на главную).
- `<Playback initial rest? script render tail? hint?>`: «Проиграть» сбрасывает состояние в `initial`, шаги `script` по таймеру меняют его, в покое (до запуска и после конца) показывается `rest ?? initial`. `rest` нужен, когда сцена в начале сценария пустая (закрытый диалог, панель за экраном), а в покое должно быть видно компонент. Замедление ставит `--slow` на блок: токены `--dur-f/--dur/--dur-s` растягиваются вместе со временем шагов; свои `@keyframes` — через `calc(0.8s * var(--slow, 1))`.
- Токены: образец (swatch) строится по имени. Список `--a / --b` — полосы цветов, `--shadow-*` — карточка с тенью, `--r-*` — скругление; нет образца — пустая ячейка.
- `entries.test.ts`: меток не больше частей и номера в диапазоне (ошибка); предупреждения (не ошибки) — размечена одна часть из ≥3, меток меньше частей, повтор номера, нет `keywords`. Классы css: свой префикс или префикс другого документированного компонента (ссылка на него); `@keyframes` — только свой.
- Поиск (Ctrl K): без учёта регистра и «ё/е», слова запроса — начала слов в названии, id, описании, `keywords`; при пустой выдаче запрос укорачивается на 1-2 последние буквы (основа от 3 символов): «чипы» находит «чип».

## Вкладки страницы компонента и CodeBlock

- Две вкладки (`role="tablist"`, стрелки/Home/End, активация при фокусе). **«Хореография»** (подтекст «Спецификация») — вся спецификация из `doc.tsx` и в конце сворачиваемый раздел «README» (генерируемая часть README.md). **«Компонент»** (подтекст «Код и примеры») — установка (строка `import … from "@/ui"` из «Как использовать», иначе из экспортов `index.ts`), живые примеры (`examples` из `doc.tsx` с кодом под каждым; нет `examples` — демо вариантов), пропсы и использование и «Доступность» (ручной раздел README между `manual`-маркерами; абзац или заголовок «Доступность» начинает второй раздел). Нет `index.ts` — заглушка «Компонент ещё не реализован» и демо словаря; у `foundation: true` без `index.ts` вкладки нет вообще.
- Маршруты (HashRouter, `:id/*`, разбор в `engine/route.ts`): `#/button` и `#/button/<секция>` — «Хореография» (старые ссылки `#/button/states` работают), `#/button/component` и `#/button/component/<секция>` — «Компонент» (`install`, `demo`, `props`, `a11y`; у «Компонента» нет секции с id `component`). Оглавление справа строится по активной вкладке. Последняя вкладка пишется в `localStorage` (`ds-entry-tab`) и влияет только на ссылки в сайдбаре и Enter в поиске; прямая ссылка `#/button` всегда открывает «Хореографию».
- README читается лениво (`import.meta.glob(..., { query: "?raw" })` в `engine/readme.ts`), поэтому секции «Компонента» из README появляются после загрузки; прокрутка к якорю ждёт её.
- `<CodeBlock lang? title? lineNumbers? wrap?>{код}</CodeBlock>` (`@/engine/CodeBlock`): `lang` — `tsx` (по умолчанию), `ts`, `css`, `bash`, `json`, `text`; заголовок показывает `title` или название языка; «Копировать» (clipboard API, запасной путь `execCommand`, при отказе код выделяется и показывается ошибка), подтверждение «Скопировано» 1,5 с (`COPIED_MS`) через `role="status"`; номера строк — счётчиком CSS (не копируются), `wrap` включает перенос вместо горизонтальной прокрутки; блок прокручивается и фокусируется с клавиатуры. Моно (Fira Code) только в коде. Подсветка — собственный токенизатор `engine/highlight.ts` (`tokenize(code, lang)`, `tokenizeLines`, `langOf`), токены дают те же символы, что и вход; цвета `--tok-*` в `entry.css` смешаны из ролей словаря, контраст на `--surface-muted` не ниже 4,5:1 в обеих темах. Все `code:` в примерах и блоки кода в README рисует он же.
- `<Markdown>{текст}</Markdown>` или `<Markdown blocks={…}/>` (`@/engine/Markdown`), разбор в `engine/markdown.ts` (`parseMarkdown`, `parseInline`, `safeHref`): заголовки, абзацы, списки (один уровень), таблицы (в прокручиваемой области), цитаты, `---`, fenced-код (через CodeBlock), inline `код`, **жирный**, _курсив_, ссылки. Всё строится React-элементами, сырой HTML выводится текстом; ссылки только `http(s)`, `mailto`, `/`, `#`, относительные; внешние с `rel="noopener noreferrer"`. `headingOffset` (по умолчанию 1): `##` становится `<h3>`.

## Код: лицензия и комментарии

- Первая строка каждого `.ts`, `.tsx`, `.css` в `src/` (кроме `*.d.ts`, симлинков `brand.css` и `fonts`) — заголовок: `/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */` (в css — `/* … */`). Текст лицензии — `LICENSE` в корне проекта.
- Других комментариев в исходниках нет: ни JSDoc, ни `//`, ни `/* */`. Исключение — директивы (`oxlint-disable…`, `@ts-expect-error`, `/// <reference`). Смысл, который хотелось пояснить комментарием, выражается именем, типом или записывается здесь. Тест `entries.test.ts` проверяет и заголовок, и отсутствие комментариев (TS — через парсер, css — сканером со строками).

## README компонента и llms.txt

- `src/entries/<id>/README.md` — **единственный** Markdown на компонент. Его читает агент рядом с кодом; он же пойдёт на вкладку «Хореография» и в MCP. Других `.md` в папке компонента нет.
- **Порядок работы агента: перед правкой компонента прочитать его `README.md`** (варианты, состояния, токены, хореография, открытые вопросы), после правки `doc.tsx` перегенерировать.
- Структура файла: между `<!-- gen:start -->` и `<!-- gen:end -->` — генерируемая часть из `doc.tsx` (заголовок, мета, правила, анатомия, варианты, состояния, размеры и токены, доступность, хореография, примеры, связанные, открытые вопросы из `[TODO]`). **Руками не править**: следующий прогон перезапишет. Ниже раздел «Как использовать» с ручным содержимым между `<!-- manual:start -->` и `<!-- manual:end -->` — генератор его сохраняет; у нового файла там заглушка `[TODO]`. В конце файла строка лицензии.
- `task bun -- run docs` (`scripts/gen-docs.ts`: Vite в режиме middleware грузит все `doc.tsx`, логика в `src/docgen/`) пишет README всех записей, `src/generated/llms.txt` и `src/generated/llms-full.txt`. Идемпотентно: второй прогон — «Без изменений». Общие правила дизайн-системы для `llms-full.txt` лежат в `src/docgen/design-rules.md` (правятся руками).
- `entries.test.ts` падает с подсказкой `task bun -- run docs`, если README нет, маркеры не в единственном числе или генерируемая часть и llms устарели. Меняете `doc.tsx` или `design-rules.md` — запускайте `docs` до `verify`.
- Раздача: плагин `agentDocs` в `vite.config.ts` отдаёт `/llms.txt`, `/llms-full.txt` и `/entries/<id>.md` (README) в dev и копирует их в `dist/` при сборке. `public/` — симлинк на бренд, туда генерируемое не пишем. Ссылки в `llms.txt` — пути от корня хоста (`/entries/<id>.md`). Плагин подхватывается только при старте dev-сервера: после его правки `task stop && task start -- -d`.
- Новый компонент: после `doc.tsx` запустить `docs`, README создастся сам; закоммитить его вместе с `src/generated/`.

## MCP-сервер и скилл

Агенты, которые пишут интерфейс (например `frontend/demo-site`), берут компоненты из кита через MCP-сервер `astronaut-ui-kit` и проектный скилл `ui-kit` (`/.claude/skills/ui-kit/SKILL.md`: сначала найти, прочитать, импортировать, не изобретать).

- Сервер: `mcp/` (TypeScript, `@modelcontextprotocol/sdk`, аргументы проверяет zod из зависимостей SDK). Только чтение с диска, dev-сервер не нужен: `src/entries/<id>/` (README, исходники), `src/generated/llms*.txt`, `src/styles/tokens.css`, `src/docgen/design-rules.md`, `src/entries/_planned.ts`. Данные читаются при каждом вызове, перезапуск после `task bun -- run docs` не нужен.
- Запуск: `task mcp` (из этой папки) или `task -d frontend/ui-kit mcp` (из корня). Это `docker run -i --rm` с образом `oven/bun`, репозиторий смонтирован только для чтения; в stdout только JSON-RPC, логи в stderr. Подключение к Claude Code: `.mcp.json` в корне репозитория, сервер `astronaut-ui-kit` (`command: task`, `args: ["-d", "frontend/ui-kit", "mcp"]`).
- Инструменты (все только читают):

| Инструмент             | Аргументы                                                                                                                        | Что возвращает                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `list_components`      | `group?` (id или название), `query?`                                                                                             | записи по группам: id, название, статус, описание, `import { X } from "@/ui"`                                |
| `get_component`        | `id`, `sections?` (`usage` `props` `variants` `anatomy` `rules` `states` `tokens` `a11y` `choreography` `examples` `open` `all`) | части README; по умолчанию `usage`, `props`, `a11y`                                                          |
| `get_component_source` | `id`, `file?`                                                                                                                    | `Name.tsx`, `name.css`, `index.ts` и соседние файлы; без тестов, demo, doc и force-css (`file` — любой один) |
| `search`               | `query`, `limit?` (1-30, по умолчанию 8)                                                                                         | совпадения по названию, ключевым словам, описанию и README; русские окончания, ё/е                           |
| `get_tokens`           | `kind?` (`colors` `typography` `radii` `sizes` `state-layers` `shadows` `motion` `all`)                                          | таблицы токенов из `tokens.css`: светлая и тёмная тема, назначение со страниц «Основа»                       |
| `get_design_rules`     | `topic?`                                                                                                                         | `design-rules.md` целиком или разделы и пункты по слову                                                      |
| `get_choreography`     | `id`, `scenario?`                                                                                                                | сценарии движения: триггер, шаги (at, dur, easing), фокус, reduced motion, соседи                            |

Ресурсы: `uikit://llms.txt`, `uikit://llms-full.txt`, `uikit://component/<id>` (README). Неизвестный id, группа, файл или тема дают ответ с `isError: true` и подсказкой.

- Статус записи: `реализован` (есть `index.ts`), `основа` (страница токенов), `только спецификация` (есть README, нет `index.ts`), `запланирован` (только `_planned.ts`). Группы и порядок берутся из `engine/types.ts` и `llms.txt`.
- Разбор README: «Как использовать» делится на `usage`, `props` (таблица с заголовком «Проп» и абзац перед ней со словом «пропс») и `a11y` (с абзаца, начинающегося с «Доступность»). Пишите ручной раздел README в этой форме, иначе пропсы и доступность окажутся внутри `usage`.
- Как проверить: `task bun -- run verify` (tsc охватывает `mcp/`; `mcp/server.test.ts` поднимает сервер с клиентом SDK по in-memory транспорту, проверяет все инструменты и ресурсы, а для каждой реализованной записи, то есть с `index.ts`, что `get_component` отдаёт непустой README и исходники находятся). Живой процесс: `printf '%s\n' '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"t","version":"0"}}}' | task mcp`.
- Правила кода те же: лицензия первой строкой, без комментариев, логи только в `process.stderr`.
- Добавили компонент: серверу ничего менять не нужно (читает папки). Новый вид данных или инструмент — `mcp/tools.ts` и `mcp/server.ts`, тест, строка в этой таблице.

## Пакет @astronaut/ui-kit

Кит собирается в пакет, который подключают соседние фронты (прежде всего `frontend/demo-site`). Пакет **не публикуется** ни в npm, ни в другие реестры: репозиторий публичный, лицензия проприетарная (файл `LICENSE`, `"license": "UNLICENSED"`), поэтому `"private": true` в `package.json` остаётся и пакет потребляется по пути внутри монорепо.

### Сборка

```bash
task lib-build     # → dist-lib/
task pack          # lib-build + bun pm pack → dist-pack/astronaut-ui-kit-<версия>.tgz (dist-lib и dist-pack в .gitignore)
task lib-check     # pack + scripts/check-lib.ts + scripts/smoke-consumer.ts: зелёный = пакет годен к подключению
```

`lib:build` (скрипт `package.json`) делает четыре шага: `vite build -c vite.lib.config.ts` (js + `styles.css`), тот же конфиг с `--mode tokens` (`tokens.css`), `tsc -p tsconfig.lib.json` (только `.d.ts`), `scripts/lib-finish.ts` (убирает служебный `_tokens.js`, проверяет наличие файлов).

### Что в пакете

```
dist-lib/
  index.js, index.d.ts       публичный API: ровно то, что экспортирует src/ui/index.ts (146 имён: компоненты, Icon, хуки, toast, типы)
  ui/…, entries/…            модули кита один в один (preserveModules): tree-shaking у потребителя, d.ts рядом
  styles.css                 brand.css (@font-face) + tokens.css + base.css + стили всех компонентов, один файл
  tokens.css                 только @font-face, палитра и роли (светлая и тёмная), без компонентных стилей и без base.css
  assets/                    Onest-VF-<hash>.ttf, FiraCode-VF-<hash>.ttf, ai-logo-1.png, loader.svg, logo-mark.svg
```

В пакет не попадают `engine/`, `app/`, `docgen/`, `generated/`, `demo.tsx`, `doc.tsx`, `*.force.css`, тесты, README записей, `mcp/`: `files: ["dist-lib", "LICENSE"]` (README.md корня кита npm/bun добавляют сами), а `scripts/check-lib.ts` ищет утечки в `dist-lib` и в tarball (пути, `@/…`, `/engine/`, `/demo`, `react-router`, `@modelcontextprotocol`). Публичный API совпадает с `@/ui`: `src/ui/exports.test.ts` сверяет экспорты с `index.ts` записей, MCP (`list_components`) и README.

`exports` в `package.json`:

| Путь             | Файл                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `.`              | `dist-lib/index.js` (+ `types` → `dist-lib/index.d.ts`); `main`, `module`, `types` продублированы для старых инструментов |
| `./styles.css`   | `dist-lib/styles.css`                                                                                                     |
| `./tokens.css`   | `dist-lib/tokens.css`                                                                                                     |
| `./assets/*`     | `dist-lib/assets/*` (файлы, на которые ссылаются css и js)                                                                |
| `./package.json` | сам манифест                                                                                                              |

`sideEffects: ["**/*.css"]`. `dependencies` у пакета нет (иначе tarball притащил бы второй React): `react` и `react-dom` — `peerDependencies` (`^19.0.0`, в коде `ref` как обычный проп) и external при сборке вместе с `react/jsx-runtime`; всё остальное (`@modelcontextprotocol/sdk`, `react-router`, тестовые инструменты) — `devDependencies` словаря.

### Ресурсы и шрифты (решение)

Режим библиотеки Vite всегда встраивает ресурсы в js и css base64 (шрифты дали бы 600 КБ css, знак агента 205 КБ js), поэтому конфиг это обходит (`vite.lib.config.ts`):

- **Шрифты** (Onest, Fira Code): `url(./assets/…ttf)` в `styles.css` и `tokens.css` (плагин добавляет `?no-inline` к `url()` в `brand.css`). Потребитель на Vite получает их из своей сборки с хешами; css обрабатывает его Vite и в dev, и в build.
- **PNG и SVG из js** (`Avatar`/`AgentTab`/`AgentBubble`, `Loader`, `PageLoader`, `BusyOverlay`): плагин `lib-external-assets` не встраивает их, а копирует в `dist-lib/assets/<имя>` и оставляет в js обычный импорт `import logo from "../../assets/ai-logo-1.png"`. Бандлер потребителя сам кладёт файл в сборку с хешем (в dev prebundle Vite даёт `?import`), в vitest то же. Конструкция `new URL(…, import.meta.url)` не используется: после prebundle в dev она ломается.
- `LOADER_SRC` и `MARK_SRC` (экспорт `Loader`) теперь хешированные URL ресурсов, а не `/brand/animated/…`: потребителю не нужно копировать brand в `public/`. Исходники лежат симлинками `src/ui/assets/{loader,logo-mark}.svg` на `idea/skelet/brand/animated/`; в Docker для `task bun` нужен смонтированный brand (уже есть в `DOCKER_BUN_RUN_ARGS`).
- Те же файлы доступны по `@astronaut/ui-kit/assets/<имя>`, если нужен URL вне компонентов.

Смоук `tests/consumer` проверяет это на настоящей сборке потребителя: `vite build` кладёт в `dist/assets` оба шрифта, `ai-logo-1`, `loader` и css; vitest рендерит приложение из пакета.

### Подключение в соседний фронт

1. Зависимость в `package.json` потребителя:
   - рядом в монорепо: `"@astronaut/ui-kit": "file:../ui-kit"` (нужен собранный `dist-lib`: `task -d ../ui-kit lib-build`; после пересборки кита проверьте, что `node_modules/@astronaut/ui-kit` свежий, иначе переустановите). Эта форма смоуком не проверялась: смоук ставит tarball; либо
   - tarball: `"@astronaut/ui-kit": "file:../ui-kit/dist-pack/astronaut-ui-kit-0.1.0.tgz"` (`task -d ../ui-kit pack`).
   - В Docker (`task bun`, `compose.yml`) папка `frontend/ui-kit` должна быть смонтирована в тот же относительный путь (как `idea/skelet/brand`), иначе `file:` не найдётся.
2. Peer-зависимости: потребителю нужны `react` и `react-dom` 19.x (один экземпляр: пакет их не тянет). TypeScript: `moduleResolution: "Bundler"` (в `.d.ts` относительные пути без расширений), `skipLibCheck` не обязателен.
3. Один раз в точке входа: `import "@astronaut/ui-kit/styles.css";` (токены, шрифты, база и стили компонентов; нужен только `tokens.css` — когда стили компонентов подключены иначе). Тему задаёт атрибут `data-theme="light" | "dark"` на `<html>` (скрипт без вспышки — в `index.html` словаря).
4. Импорт: `import { Button, Select, Dialog, toast, Toaster } from "@astronaut/ui-kit";`. В vitest потребителя пакет из `node_modules` (tarball) работает без дополнительных настроек: проверено смоуком (Vitest 4, happy-dom).
5. `styles.css` содержит `base.css` кита (reset `margin: 0`, `box-sizing`, фон и шрифт `body`, фокус-кольцо): для приложения на ките это нужная база; если нужны только токены, берите `tokens.css` и добавьте `.ds-icon`/`.ds-agent-mark` вручную.

### Как обновлять

Изменили компонент или токены: `task bun -- run docs` (README и `llms*.txt`), `task bun -- run verify`, `task lib-check`. Повышайте `version` в `package.json` по смыслу (патч: правки без смены API; минор: новые компоненты и пропсы; до `1.0` ломающие правки тоже в минор) и меняйте путь tarball у потребителей. Новый экспорт появляется сам: пакет собирается из `src/ui/index.ts`. Новый ресурс (png/svg) импортируйте из `src/ui/assets` относительным путём, `@/` в `src/entries` и `src/ui` не использовать (проверит `check-lib`).

Известные ограничения: `src/entries/*/*.css` попадают в `styles.css` целиком (нет разбиения по компонентам); знак агента `ai-logo-1.png` весит 154 КБ (грузится только вместе с Avatar-агентом, AgentTab, AgentBubble).

## Реализация компонентов

Эталон — `button`, `badge`, `avatar` (смотрите их папки). Реализованная запись = словарь + настоящий компонент в одной папке; ещё не реализованные записи остаются демо-разметкой в `demo.tsx` (проверки реализации их пропускают).

Папка записи `src/entries/<id>/`:

```
Name.tsx            публичный компонент (по файлу на компонент: Button.tsx, ButtonGroup.tsx)
name.css            стили компонента, все классы с префиксом cssPrefix, подключается из Name.tsx
name.force.css      только для словаря: принудительные состояния [data-force], вспомогательные демо-элементы; подключается из demo.tsx
index.ts            публичный экспорт: компоненты и типы пропсов
Name.test.tsx       vitest + @testing-library/react (happy-dom), названия по-русски
demo.tsx            демо-обвязка словаря: оборачивает публичный компонент (force, IconName, tip) и держит демо-хелперы
doc.tsx, README.md  как раньше
```

- **Публичный API — `src/ui/index.ts`**: `export * from "../entries/<id>"`. Приложение импортирует `import { Button } from "@/ui"`. Записи не импортируют `@/ui` и берут общие примитивы из внутреннего слоя относительным путём `../../ui/internal` (см. «Внутренний слой»), а демо — компонент из своей папки (`./index`), иначе цикл. Ни компонент, ни `src/ui` не зависят от `engine/` (иконки — `Icon` из внутреннего слоя или `ReactNode` от вызывающего, ресурсы (знак агента, `loader.svg`, `logo-mark.svg`) лежат в `src/ui/assets` и подключаются относительным путём `../../ui/assets/…`, без алиаса `@/`: пакет собирается без переписывания путей); наоборот, `engine/Icon` реэкспортирует `Icon` кита.
- **Пропсы**: `interface NameProps extends ComponentPropsWithRef<"button" | "span" | …>` плюс свои (`variant`, `size`, `loading`, `icon: ReactNode`, …). `ref` — обычный проп (React 19), без `forwardRef`. Нативные атрибуты (`aria-*`, `data-*`, `onClick`, `disabled`, `type`) приходят через `...rest` и ставятся на корневой элемент; свои классы добавляются к классам компонента через `cx` из `../../ui/internal`. Значения по умолчанию — в деструктуризации. Варианты и размеры — союзы строк, выражаются классами `ds-<имя>--<значение>`; состояния — атрибутами (`aria-busy`, `aria-pressed`, `data-status`).
- **Доступность в компоненте**: `loading` → `aria-busy`, клик гасится (`preventDefault`, без `onClick`), кнопка не `disabled`; `disabled` — нативный; декоративное (значки, точки, спиннер) — `aria-hidden`; у `role="img"` подпись из `aria-label` или имени.
- **`force` только в демо**: в `Name.tsx` и `name.css` нет `force` и `data-force`. Демо-обёртка (`DemoButton`) принимает `force` и ставит `data-force` на корень (компонент пробрасывает `data-*`); правила `[data-force]` — в `name.force.css`. Чтобы порядок каскада не менялся, у force-правил в `:not()` исключены состояния, которые в исходнике побеждали по порядку (`:disabled`, `[aria-pressed="true"]`). Тест `entries.test.ts` это проверяет.
- Обёртки `Demo*` и экспортируемые хелперы остаются в `demo.tsx` с прежними именами: их импортируют демо других записей. Типы они реэкспортируют из `./index`.
- Тесты: рендер и значения по умолчанию, варианты (классы), `disabled`/`loading` и клик, aria, проброс `ref`, `className` и атрибутов, отсутствие `data-force` по умолчанию.
- `entries.test.ts` для каждой записи с `index.ts`: есть `doc.tsx`, экспортируется хотя бы один компонент (имя с заглавной, функция), он же реэкспортирован из `src/ui/index.ts`; `data-force` нет в `Name.tsx` и в css, кроме `*.force.css`.

## Внутренний слой (`src/ui/internal/`)

Общие примитивы кита лежат в одном месте; запись берёт их из `../../ui/internal` (barrel `index.ts`), а не из `@/ui` (иначе цикл) и не копирует к себе. **Новые мини-копии запрещены**: нужна иконка, ref, слой, фокус-ловушка, управляемое значение — берите готовое или расширяйте примитив здесь. Тест `entries.test.ts` («кит: внутренний слой») ловит файлы `Glyph*.tsx`, самодельные svg с классом `ds-icon`, импорты `@/ui`, локальные копии примитивов и зависимость слоя от `entries/` и `engine/`.

| Файл                                       | Что даёт                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cx.ts`                                    | `cx(...parts)`: склейка классов, пустое отбрасывается                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `Icon.tsx`, `icon-paths.ts`                | `<Icon name size? className? ...svg>`: единый набор иконок (имена `IconName` из `ICONS`), `size` = `xs` `sm` `md` `xl` (16 px по умолчанию), по умолчанию `aria-hidden`, с `aria-label` становится `role="img"`. Новая иконка = новая строка в `ICONS` (пути 24×24, штрих `currentColor`). Словарь: `engine/Icon` реэкспортирует `Icon`; публично `Icon` экспортирует и `src/ui/index.ts`                                                                                                                                                                                                                                                                                                                                    |
| `refs.ts`                                  | `assignRef(ref, node)`, `mergeRefs(...refs)` (с очисткой React 19), `useMergedRefs(a, b)` (стабильная функция: ссылку на якорь слоя склеивайте только ею, иначе при каждом рендере ссылка отцепляется и цепляется заново после эффектов потомка)                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `useControlled.ts`                         | `useControlled(value, defaultValue, onChange)` → `[значение, set]`: управляемый или собственный стейт                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `usePrefersReducedMotion.ts`               | `usePrefersReducedMotion()`: настройка системы, подписка, SSR-безопасно                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `ids.ts`                                   | `useIds(["label", "error"])` → `{ label, error }` от одного `useId`; `useStableId(explicit?)`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `layers.ts`                                | `useLayer(active)` → `isTop()`: стек открытых слоёв (диалог, панель, поповер, меню); по Esc и клику мимо реагирует только верхний                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `focus.ts`                                 | `getFocusable(root)`, `trapTab(event, root)`, `pickInitialFocus(panel, fallback)` (ищет `[data-autofocus]`, поле в `[data-ds-modal-main]`, главную кнопку), `FOCUSABLE_SELECTOR`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `modal.ts`, `presence.ts`                  | `useModal({open, panelRef, overlayRef, host, busy, onClose, lockScroll, focusFallback})`: фокус, ловушка Tab, Esc, `inert` фона, блокировка прокрутки; `usePresence(open, exitMs)` → `{mounted, closing}` для анимации выхода                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `position.ts`                              | `placeFloating({anchor, size, side, align, gap, viewport, margin?, flip?})`: чистая функция, flip на противоположную сторону, сдвиг внутрь окна с отступом 8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `useFloating.ts`                           | `useFloating({open, anchorRef, floatingRef, side, align, gap, flip})` → `{placement, style}` (`position: fixed`, пересчёт при resize, scroll, ResizeObserver; скрывает слой, если якорь вне окна)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Portal.tsx`, `useDismiss.ts`, `Layer.tsx` | `<Portal host?>`: в `document.body` или в ближайший `<PortalHost>`; `<PortalHost ...div>`: контейнер для слоёв демо словаря (слой лежит в карточке и уходит под липкую шапку; контейнеру задают `position: relative; z-index: 5` в `*.force.css`). `useDismiss({open, inside, onDismiss(reason), escape?, outside?, scroll?, exclusive?, returnFocusRef?})`: клик мимо, Esc (фокус обратно в `returnFocusRef`), прокрутка страницы, «одно открытое за раз»; реагирует только верхний слой. `<Layer open anchorRef onDismiss side? align? gap? flip? scroll? exclusive? returnFocusRef? ...div>`: портал в body + `position: fixed`, `z-index: 900`, `data-side`/`data-align`, пересчёт позиции и закрытие в одном компоненте |

Всплывающее (список, меню, подсказка) строится на `Layer` или `useFloating`, а не на `position: absolute` внутри обёртки: предок с `overflow: hidden` или `transform` обрежет или сдвинет слой. Слой лежит вне обёртки записи, поэтому его стили (`.ds-menu`, `.ds-select__pop`) не зависят от позиции; позицию задаёт слой. Демо «Варианты» и «Примеры» показывают настоящий компонент (открытый по умолчанию, `flow`: Esc и выбор закрывают, клик по кнопке открывает снова), обёрнутый в `PortalHost`; только карточки «Состояния» с принудительно открытым списком остаются статичной разметкой (`isStatic`). Слой с `open` в `PortalHost` скрывается, когда якорь вне окна, поэтому на полностраничном скриншоте такие слои видны только в кадре.

### Добавить реализацию записи (шаги)

1. Прочитать `README.md` записи и её `demo.tsx`/`name.css`.
2. `Name.tsx`: вынести разметку из демо-компонента в публичный компонент по правилам выше; иконки — `Icon` из `../../ui/internal` (имена из `icon-paths.ts`) или `ReactNode` от вызывающего, `engine/` не импортировать. `index.ts` с компонентами и типами.
3. `name.css`: оставить публичные стили; все `[data-force="…"]` перенести в `name.force.css` (правила для force, учесть каскад); общие демо-элементы, не принадлежащие компоненту (подсказка, группа до появления её записи), — туда же.
4. `demo.tsx`: обёртки над публичным компонентом (`force` → `data-force`, `IconName` → `<Icon>`), реэкспорт типов и хелперов; `import "./name.force.css"`.
5. Строку `export * from "../entries/<id>"` — в `src/ui/index.ts`.
6. `Name.test.tsx`.
7. В `doc.tsx` поправить строки `code:` под настоящий API.
8. README: заполнить «Как использовать» (импорт из `@/ui`, таблица пропсов, 2-3 примера, a11y), `task bun -- run docs`, `task bun -- x oxfmt <путь>`, `task bun -- run verify`, сравнить скриншоты страницы до и после (светлая и тёмная, 1440) — анимации (спиннеры, пульс) дают разницу в кадре, остальное должно совпасть.

## Как добавить компонент

1. Создать `src/entries/<id>/` (`id` — kebab-case, как в `_planned.ts`, например `toggle-group`).
2. `demo.tsx`: минимальная демо-разметка с классами компонента, `import "./<имя>.css"`. Принудительные состояния — через `data-force="hover|active|focus"`. Когда запись реализуют — по разделу «Реализация компонентов».
3. `<имя>.css`: **все** классы и `@keyframes` с префиксом компонента (`ds-btn`, `ds-badge`, `ds-avatar`…), методология как BEM: `ds-btn--primary`, `ds-btn__spin`. Короткие общие имена (`.n`, `.cur`, `.tm`, `.rd`, `.btn`) запрещены: в макете из-за них были конфликты. Состояние — атрибут (`aria-*`, `data-force`, `data-status`), а не общий класс `.is-*`. Цвета только ролями из `styles/tokens.css` (`var(--text)`), никаких HEX (исключение — шкалы, у которых HEX и есть токен, как тона Avatar). Длительности — токенами `--dur-f/--dur/--dur-s` или `calc(0.8s * var(--slow, 1))`, чтобы «замедление ¼×» в Playback их растягивало. Обязателен блок `@media (prefers-reduced-motion: reduce)`.
4. `doc.tsx`: `export default defineDoc({...})`, схема ниже; `cssPrefix` совпадает с префиксом css.
5. В каждом `.ts/.tsx/.css` — заголовок с лицензией первой строкой и никаких комментариев (раздел «Код: лицензия и комментарии» ниже).
6. `task bun -- run verify` (тест проверит id = имя папки, непустые секции, префиксы классов, корректность шагов хореографии, заголовки и отсутствие комментариев), затем открыть страницу в браузере.
7. Удалить строку из `_planned.ts` (по желанию).

Классы словаря (оболочка, блоки) — с префиксом `dx-`; префикс `ds-` только у документируемых компонентов и общих `.ds-icon`/`.ds-agent-mark` из `base.css`.

## Схема doc.tsx (`engine/types.ts`, `DocSpec`)

| Поле                                                          | Что                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `id`, `title`, `group`, `summary`, `purpose?`                 | группа — один из `GROUPS` (base, actions, fields, tables, navigation, feedback, overlays, people, time, data)                                                                                                                                                                        |
| `cssPrefix`, `order?`, `keywords?`, `related?`, `foundation?` | `foundation: true` — страница «Основы»: анатомия и состояния могут быть пустыми                                                                                                                                                                                                      |
| `anatomy`                                                     | `{ demo?, parts[{name, description, optional?}] }`; метки в демо — `<Callout n={1}>` (номер = позиция части)                                                                                                                                                                         |
| `variants[]`, `sizes?[]`, `extra?[]`                          | варианты с живым демо и «когда выбирать»; размеры; произвольные секции                                                                                                                                                                                                               |
| `states[]`, `stateMatrix?`                                    | карточки состояний (`kind`, `forced`, `notApplicable` с причиной) и матрица «вариант × состояние». Показать нужно все: default, hover, active, focus, disabled, loading, error, empty — неприменимые помечаются, а не пропускаются                                                   |
| `rules`                                                       | `{ use[], avoid[] }`                                                                                                                                                                                                                                                                 |
| `a11y[]`                                                      | `{ kind: key/aria/focus/contrast/motion/note, title, text }`; коэффициенты контраста считать, не оценивать на глаз                                                                                                                                                                   |
| `tokens[]`                                                    | `{ name, value, usage, kind }`                                                                                                                                                                                                                                                       |
| `choreography[]`                                              | `{ id, title, trigger, steps[{at, dur, what, prop?, easing?}], focus, reducedMotion, neighbours, origin: "mockup"\|"proposal", demo? }`. Шаги — по времени (мс от триггера), `dur: 0` — мгновенно. Демо — `<Playback initial script render>` (кнопка «Проиграть», скорость 1× ½× ¼×) |
| `examples[]`                                                  | `{ title, demo, code? }`; `code` — предполагаемый API ui-kit                                                                                                                                                                                                                         |

`origin: "mockup"` — поведение проверено по макету; `"proposal"` — предложено при написании словаря, пользователь подтверждает. Сомнительное — `[TODO]` в тексте.

## Что сделано / что дальше

Готово: Основа (Цвета, Типографика, Радиусы и размеры, Слои состояний), Button, Badge, Avatar (словарь и реализация). Остальное — «скоро» (`_planned.ts`, состав взят из макета и стиля snabli-ui-kit). Контраст белого на `--danger` решён токеном (`#d03538`, 4,9:1; hover и active темнее); `[TODO]` про idle-solid и info-solid в тёмной теме остаются на страницах Badge и Цвета.

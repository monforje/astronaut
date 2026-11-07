/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoToggle, type ToggleForce } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function PressDemo() {
  return (
    <Playback<{ f?: ToggleForce; on: boolean }>
      initial={{ on: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1100, set: { f: "active" } },
        { at: 1250, set: { f: "hover", on: true } },
        { at: 2300, set: { f: "active" } },
        { at: 2450, set: { f: "hover", on: false } },
        { at: 3200, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <>
          <DemoToggle variant="chip" icon="star" pressed={s.on} force={s.f}>
            Избранное
          </DemoToggle>
          <DemoToggle
            variant="ghost"
            size="md"
            square
            icon="bold"
            label="Жирный"
            pressed={s.on}
            force={s.f}
          />
        </>
      )}
    />
  );
}

function KeyDemo() {
  return (
    <Playback<{ f?: ToggleForce; on: boolean }>
      initial={{ on: false }}
      script={[
        { at: 400, set: { f: "focus" } },
        { at: 1300, set: { on: true } },
        { at: 2300, set: { on: false } },
      ]}
      tail={700}
      hint="Фокус пришёл с Tab; Space или Enter переключают, фокус остаётся на кнопке."
      render={(s) => (
        <DemoToggle variant="chip" size="md" icon="pin" pressed={s.on} force={s.f}>
          Закрепить
        </DemoToggle>
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Выключен",
    note: "aria-pressed=false. Фон прозрачный, текст --text-2; у chip кольцо 1px --border.",
    demo: <DemoToggle variant="chip">Закрепить</DemoToggle>,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Слой --layer-2 и текст --text.",
    forced: true,
    demo: (
      <DemoToggle variant="chip" force="hover">
        Закрепить
      </DemoToggle>
    ),
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Слой --layer-3 и сжатие до 0,96 на время нажатия.",
    forced: true,
    demo: (
      <DemoToggle variant="chip" force="active">
        Закрепить
      </DemoToggle>
    ),
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus вплотную (outline-offset 0), только от клавиатуры.",
    forced: true,
    demo: (
      <DemoToggle variant="chip" force="focus">
        Закрепить
      </DemoToggle>
    ),
  },
  {
    id: "selected",
    kind: "selected",
    title: "Включён",
    note: "aria-pressed=true. Фон --selected, текст --link-strong; у chip кольцо --border-selected; значок повёрнут на −8°.",
    demo: (
      <DemoToggle variant="chip" icon="star" defaultPressed>
        Избранное
      </DemoToggle>
    ),
  },
  {
    id: "selected-hover",
    kind: "hover",
    title: "Hover включённого",
    note: "К --selected добавляется 8,8 % ink: фон темнеет, текст остаётся --link-strong.",
    forced: true,
    demo: (
      <DemoToggle variant="chip" icon="star" defaultPressed force="hover">
        Избранное
      </DemoToggle>
    ),
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Текст --text-ph, без кольца и фона, курсор default. Свои цвета, не прозрачность.",
    demo: (
      <DemoToggle variant="chip" disabled>
        Недоступно
      </DemoToggle>
    ),
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете. Toggle применяется сразу; если действие долгое — это Button с aria-busy. [TODO] решить, нужен ли «ожидающий» Toggle.",
  ),
  NA(
    "error",
    "error",
    "Error",
    "Нет. Ошибку применения показывает Toast, а Toggle возвращается в прежнее положение.",
  ),
  NA("empty", "empty", "Empty", "Нет: у Toggle всегда есть подпись или aria-label."),
];

export default defineDoc({
  id: "toggle",
  title: "Toggle",
  group: "actions",
  cssPrefix: "ds-toggle",
  order: 40,
  keywords: [
    "переключатель",
    "тоггл",
    "toggle button",
    "кнопка-переключатель",
    "chip",
    "фильтр",
    "избранное",
    "aria-pressed",
    "кнопка-флажок",
  ],
  summary:
    "Кнопка с двумя положениями: включена и выключена. Нажатие сразу применяет выбор, подпись не меняется.",
  purpose:
    "Toggle держит один независимый флажок рядом с содержимым: фильтр «Мои», «Избранное», «Жирный» в панели форматирования. Он не сохраняется кнопкой и не меняет текст: состояние читается цветом и значком. Если нужен выбор одного из нескольких, берите ToggleGroup; если параметр в настройках, Switch.",
  related: ["toggle-group", "switch", "button", "checkbox"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, side: "t" },
          { n: 2, anchor: ".ds-icon", side: "b" },
          { n: 3, anchor: ".ds-toggle__label", side: "b" },
        ]}
      >
        <DemoToggle variant="chip" size="md" icon="star" defaultPressed>
          Избранное
        </DemoToggle>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "Кнопка 24 px (28 в md), радиус pill (4 у ghost), padding 0 10 0 8. Кольцо 1px у chip; фон и цвет меняет aria-pressed.",
      },
      {
        name: "Значок",
        description:
          "14 px слева от подписи. У включённого поворачивается на −8° за 200 мс. У квадратной кнопки значок единственный и нужен aria-label.",
        optional: true,
      },
      {
        name: "Подпись",
        description: "Onest 600, 12 px. Одна и та же в обоих положениях: меняется цвет, не слова.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "chip",
      title: "Chip",
      description: "С кольцом 1px. Включённый получает кольцо --border-selected и подложку.",
      when: "фильтры над списком и таблицей, быстрые метки: «Мои», «С расхождениями».",
      demo: (
        <>
          <DemoToggle variant="chip" icon="star" defaultPressed>
            Избранное
          </DemoToggle>
          <DemoToggle variant="chip" icon="pin">
            Закрепить
          </DemoToggle>
          <DemoToggle variant="chip" size="md">
            С расхождениями
          </DemoToggle>
          <DemoToggle variant="chip" size="md" defaultPressed>
            Мои
          </DemoToggle>
        </>
      ),
    },
    {
      id: "pill",
      title: "Pill без кольца",
      description: "Тот же Toggle без кольца: в выключенном виде это текст, на hover — слой.",
      when: "плотные панели, где кольцо у каждой метки даёт шум.",
      demo: (
        <>
          <DemoToggle variant="pill" icon="star">
            Избранное
          </DemoToggle>
          <DemoToggle variant="pill" icon="pin" defaultPressed>
            Закрепить
          </DemoToggle>
        </>
      ),
    },
    {
      id: "ghost",
      title: "Ghost",
      description: "Радиус 4, как у кнопки ghost в тулбаре. Живёт рядом с другими кнопками панели.",
      when: "панель инструментов: «Группировать», «Показать архив».",
      demo: (
        <>
          <DemoToggle variant="ghost" size="md">
            Группировать
          </DemoToggle>
          <DemoToggle variant="ghost" size="md" defaultPressed>
            Показать архив
          </DemoToggle>
        </>
      ),
    },
    {
      id: "square",
      title: "Квадратный",
      description: "Только значок, сторона 28. Имя задаёт aria-label.",
      when: "форматирование текста: жирный, курсив, список. Группами по три-четыре.",
      demo: (
        <>
          <DemoToggle variant="ghost" size="md" square icon="bold" label="Жирный" defaultPressed />
          <DemoToggle variant="ghost" size="md" square icon="italic" label="Курсив" />
          <DemoToggle variant="ghost" size="md" square icon="list" label="Список" />
        </>
      ),
    },
  ],
  sizes: [
    {
      id: "sm",
      title: "sm",
      value: "24 px",
      note: "по умолчанию; padding 0 10 0 8",
      demo: (
        <DemoToggle variant="chip" icon="star" defaultPressed>
          Избранное
        </DemoToggle>
      ),
    },
    {
      id: "md",
      title: "md",
      value: "28 px",
      note: "padding 0 12 0 10; высота кнопки sm",
      demo: (
        <DemoToggle variant="chip" size="md" icon="star" defaultPressed>
          Избранное
        </DemoToggle>
      ),
    },
  ],
  states,
  stateMatrix: {
    columns: ["Выключен", "Hover", "Включён", "Hover включённого", "Disabled"],
    rows: (["chip", "pill", "ghost"] as const).map((v) => ({
      label: v,
      cells: [
        <DemoToggle key="a" variant={v}>
          Мои
        </DemoToggle>,
        <DemoToggle key="b" variant={v} force="hover">
          Мои
        </DemoToggle>,
        <DemoToggle key="c" variant={v} defaultPressed>
          Мои
        </DemoToggle>,
        <DemoToggle key="d" variant={v} defaultPressed force="hover">
          Мои
        </DemoToggle>,
        <DemoToggle key="e" variant={v} disabled>
          Мои
        </DemoToggle>,
      ],
    })),
  },
  choreography: [
    {
      id: "press",
      title: "Нажатие и переключение",
      trigger: "клик или тап по Toggle",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: слой --layer-2, текст становится --text.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Нажатие (кнопка мыши вниз): слой --layer-3 и сжатие до 0,96.",
          prop: "background, scale",
          easing: "ease",
        },
        {
          at: 850,
          dur: 125,
          what: "Отпускание: aria-pressed меняется, фон идёт к --selected, текст к --link-strong, кольцо chip к --border-selected.",
          prop: "background, color, box-shadow, scale",
          easing: "ease",
        },
        {
          at: 850,
          dur: 200,
          what: "Значок поворачивается на −8° (при выключении возвращается назад за те же 200 мс).",
          prop: "rotate",
          easing: "ease",
        },
      ],
      focus:
        "Остаётся на Toggle: клик по кнопке не уводит фокус, нажатие мышью кольцо не рисует (focus-visible).",
      reducedMotion:
        "Переходы цвета и поворот значка отключены, сжатие 0,96 убрано; фон и цвет меняются мгновенно.",
      neighbours:
        "Не двигаются: размеры Toggle не зависят от положения. Соседние Toggle в ряду не меняются, это независимые флажки.",
      demo: <PressDemo />,
    },
    {
      id: "keyboard",
      title: "Клавиатура",
      trigger: "Tab до кнопки, затем Space или Enter",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab ставит фокус: кольцо 2px --focus появляется сразу.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 125,
          what: "Space или Enter: тот же переход цвета, что при клике. Кнопка по Space срабатывает при отпускании клавиши.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 900,
          dur: 200,
          what: "Значок поворачивается на −8°.",
          prop: "rotate",
          easing: "ease",
        },
      ],
      focus:
        "Кольцо остаётся на кнопке после переключения; Tab идёт к следующему Toggle, стрелки не нужны.",
      reducedMotion: "Цвет и поворот меняются мгновенно, кольцо фокуса остаётся.",
      neighbours:
        "Каждый Toggle в ряду — отдельная остановка Tab; roving tabindex не нужен (это не группа выбора).",
      demo: <KeyDemo />,
    },
  ],
  rules: {
    use: [
      "Независимый флажок, который применяется сразу: фильтр, закрепление, избранное.",
      "Подпись одна и та же в обоих положениях: «Мои», а не «Мои / Все».",
      "Значок усиливает смысл (звезда, булавка) и поворачивается при включении.",
      "Для квадратных всегда ставьте aria-label.",
      "Фильтры над таблицей: chip, один ряд, не больше пяти.",
    ],
    avoid: [
      "Выбор одного из нескольких: это ToggleGroup, а не ряд Toggle.",
      "Настройка, которая сохраняется в профиле: это Switch в строке настроек.",
      "Действие «один раз» (Скачать, Отправить): это Button.",
      "Менять подпись по состоянию («Включить» / «Выключить»): читателю экрана непонятно, что сейчас.",
      "Передавать состояние одним цветом: включённый Toggle должен отличаться и кольцом или значком.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "aria-pressed",
      text: 'Нативная <button type="button" aria-pressed="true|false">. Не role="switch" и не checkbox: у Toggle нет «значения формы».',
    },
    {
      kind: "key",
      title: "Space / Enter",
      text: "Переключают. Tab и Shift+Tab ходят по Toggle по одному.",
    },
    {
      kind: "aria",
      title: "aria-label у квадратной",
      text: "Название действия («Жирный»), а не состояния: состояние озвучит aria-pressed.",
    },
    {
      kind: "focus",
      title: "Кольцо фокуса",
      text: "2px --focus, outline-offset 0, только :focus-visible. Контраст кольца с белым 3,65:1 (светлая), 9,34:1 (тёмная).",
    },
    {
      kind: "contrast",
      title: "Текст",
      text: "Выключен: --text-2 на белом 8,2:1, на тёмном 11,3:1. Включён: --link-strong на подложке --selected 6,1:1 (светлая), 6,8:1 (тёмная); на hover включённого 5,1:1 и 5,2:1. Disabled: --text-ph 3,2:1 — по правилам WCAG недоступные элементы не нормируются.",
    },
    {
      kind: "contrast",
      title: "Кольцо chip",
      text: "Кольцо --border на белом 1,6:1, --border-selected 1,5:1: ниже 3:1 для границ компонентов. Состояние читается текстом и подложкой (6,1:1), а не кольцом. [TODO] решить, усиливать ли кольцо.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Отключаются переходы, поворот значка и сжатие при нажатии.",
    },
  ],
  tokens: [
    { name: "--h-xs / --h-sm", value: "24 / 28 px", usage: "Высота sm и md", kind: "size" },
    {
      name: "--r-pill / --r-control",
      value: "999 / 4 px",
      usage: "Радиус pill и ghost",
      kind: "radius",
    },
    { name: "--fs-control", value: "12 px, вес 600", usage: "Подпись", kind: "font" },
    {
      name: "--text-2 / --text",
      value: "#44505d / #15202b",
      usage: "Текст выключенного / на hover",
      kind: "color",
    },
    {
      name: "--selected",
      value: "teal 15 % на --surface (тёмная 16 %)",
      usage: "Подложка включённого",
      kind: "color",
    },
    {
      name: "--link-strong",
      value: "#006662 (тёмная #00d4d0)",
      usage: "Текст и значок включённого",
      kind: "color",
    },
    {
      name: "--border / --border-selected",
      value: "#c6cdd6 / teal 60 %",
      usage: "Кольцо chip: выключен / включён",
      kind: "color",
    },
    {
      name: "--layer-2 / --layer-3",
      value: "ink 9 % / 12 %",
      usage: "Hover и active",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0", usage: "Disabled", kind: "color" },
    {
      name: "--focus",
      value: "#00968f (тёмная #00d4d0)",
      usage: "Кольцо фокуса 2px",
      kind: "color",
    },
    { name: "--dur-f", value: "125 мс", usage: "Цвет, фон, кольцо, сжатие", kind: "time" },
    { name: "--dur", value: "200 мс", usage: "Поворот значка (−8°)", kind: "time" },
  ],
  examples: [
    {
      id: "filters",
      title: "Фильтры над списком грузов",
      demo: (
        <>
          <DemoToggle variant="chip" size="md" defaultPressed>
            Мои
          </DemoToggle>
          <DemoToggle variant="chip" size="md">
            С расхождениями
          </DemoToggle>
          <DemoToggle variant="chip" size="md" icon="pin">
            Закреплённые
          </DemoToggle>
        </>
      ),
      code: `<Toggle variant="chip" size="md" pressed={mine} onPressedChange={setMine}>Мои</Toggle>`,
    },
    {
      id: "format",
      title: "Панель форматирования",
      demo: (
        <>
          <DemoToggle variant="ghost" size="md" square icon="bold" label="Жирный" defaultPressed />
          <DemoToggle variant="ghost" size="md" square icon="italic" label="Курсив" />
          <DemoToggle variant="ghost" size="md" square icon="list" label="Список" />
        </>
      ),
      code: `<Toggle variant="ghost" size="md" square icon={<BoldIcon />} aria-label="Жирный" />`,
    },
  ],
});

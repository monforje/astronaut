/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoCheckbox,
  DemoCheckCards,
  DemoCheckGroup,
  DemoCheckOption,
  type CheckForce,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function CheckDemo() {
  return (
    <Playback<{ f?: CheckForce; on: boolean }>
      initial={{ on: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1100, set: { on: true } },
        { at: 2200, set: { on: false } },
        { at: 3000, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => <DemoCheckOption title="Сверять вес" checked={s.on} force={s.f} />}
    />
  );
}

function GroupDemo() {
  return (
    <Playback<{ v: boolean[] }>
      initial={{ v: [false, false, false, false] }}
      script={[
        { at: 500, set: { v: [true, false, false, false] } },
        { at: 1300, set: { v: [true, true, false, false] } },
        { at: 2100, set: { v: [true, true, true, true] } },
        { at: 3000, set: { v: [false, false, false, false] } },
      ]}
      tail={800}
      hint="Родитель: пусто, неполное (тире), выбрано всё. Клик по родителю в неполном состоянии выбирает все."
      render={(s) => <DemoCheckGroup value={s.v} />}
    />
  );
}

function ErrorDemo() {
  return (
    <Playback<{ err: boolean; on: boolean }>
      initial={{ err: false, on: false }}
      script={[
        { at: 600, set: { err: true } },
        { at: 1800, set: { on: true, err: false } },
      ]}
      tail={900}
      hint="Предложение: ошибка появляется при попытке отправить форму и уходит, когда флажок поставлен."
      render={(s) => (
        <DemoCheckOption
          title="Я подтверждаю данные декларации"
          hint={s.err ? "Нужно подтвердить, чтобы отправить" : undefined}
          checked={s.on}
          invalid={s.err}
        />
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Обычный",
    note: "Рамка 1,5px --text-3, фон --field.",
    demo: <DemoCheckbox label="Обычный" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Рамка темнеет до --text.",
    forced: true,
    demo: <DemoCheckbox force="hover" label="Hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Отдельного вида нет: нажатие сразу меняет значение. [TODO] решить, нужен ли слой на время нажатия.",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus с отступом 2px, только от клавиатуры. У карточки кольцо вокруг всей карточки.",
    forced: true,
    demo: <DemoCheckbox force="focus" label="Focus" />,
  },
  {
    id: "checked",
    kind: "selected",
    title: "Выбран",
    note: "Заливка и рамка --primary, галочка --on-primary 8×4.",
    demo: <DemoCheckbox defaultChecked label="Выбран" />,
  },
  {
    id: "indeterminate",
    kind: "other",
    title: "Неполный",
    note: "Тире 8×2 вместо галочки. Состояние только у родителя группы, ставится через свойство indeterminate.",
    demo: <DemoCheckbox indeterminate label="Неполный" />,
  },
  {
    id: "error",
    kind: "error",
    title: "Ошибка",
    note: "aria-invalid=true: рамка --danger; у выбранного заливка --danger. Текст ошибки — под подписью, --err-text.",
    demo: <DemoCheckbox invalid label="Ошибка" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Фон --tone, рамка --divider; подпись --text-ph.",
    demo: <DemoCheckbox disabled label="Disabled" />,
  },
  {
    id: "disabled-checked",
    kind: "disabled",
    title: "Disabled выбранный",
    note: "Фон --tone, метка --text-ph. [TODO] в макете метка navy на сером (в тёмной теме не видна); здесь как у Radio, подтвердить.",
    demo: <DemoCheckbox disabled defaultChecked label="Disabled выбранный" />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет: флажок в форме не ходит на сервер. Если выбор применяется сразу и долго, нужен Switch с оптимистичным обновлением. [TODO] подтвердить.",
  ),
  NA(
    "empty",
    "empty",
    "Empty",
    "Нет: флажок всегда в одном из состояний «пусто / выбрано / неполный». «Пустой» — это обычный.",
  ),
];

export default defineDoc({
  id: "checkbox",
  title: "Checkbox",
  group: "fields",
  cssPrefix: "ds-check",
  order: 40,
  keywords: [
    "флажок",
    "галочка",
    "чекбокс",
    "чекбокс-карточка",
    "выбрать все",
    "indeterminate",
    "неполный",
    "checkbox",
    "check",
    "tick",
    "карточки",
  ],
  summary:
    "Флажок для выбора нескольких вариантов, с неполным состоянием для групп и карточками-флажками.",
  purpose:
    "Checkbox отвечает «да / нет» в форме или выбирает несколько пунктов из списка. Значение применяется после отправки формы, а не сразу. Для настройки, которая действует сразу, берите Switch; для одного варианта из нескольких Radio.",
  related: ["switch", "radio", "toggle", "dropdown"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, side: "t" },
          { n: 2, anchor: ".ds-check", side: "l" },
          { n: 3, anchor: ".ds-check__text", side: "b" },
        ]}
      >
        <label className="ds-check__opt">
          <input type="checkbox" className="ds-check" defaultChecked aria-label="Сверять вес" />
          <span className="ds-check__text">
            <span>Сверять вес</span>
            <small>Накладная, декларация и инвойс</small>
          </span>
        </label>
      </Marks>
    ),
    parts: [
      {
        name: "Пункт",
        description:
          "Строка из флажка и подписи, зазор 10. Нажимается вся строка (label), не только квадрат.",
      },
      {
        name: "Флажок",
        description:
          "16×16 px, рамка 1,5px, радиус 4. Выбран: заливка --primary и галочка 8×4; неполный: тире 8×2. Выравнен по первой строке подписи (отступ сверху 2px).",
      },
      {
        name: "Подпись и пояснение",
        description:
          "Подпись 13 px; пояснение 11 px --text-3 в строку ниже. При ошибке пояснение — текст ошибки, --err-text.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "single",
      title: "Один флажок",
      description: "Флажок с подписью. Пояснение и ошибка — под подписью.",
      when: "согласие, «запомнить», один параметр формы.",
      demo: (
        <div className="ds-check__list">
          <DemoCheckOption
            title="Сверять вес"
            hint="Накладная, декларация и инвойс"
            defaultChecked
          />
          <DemoCheckOption title="Сверять код ТН ВЭД" />
          <DemoCheckOption title="Сверять стоимость" hint="Недоступно в вашем тарифе" disabled />
        </div>
      ),
    },
    {
      id: "group",
      title: "Группа с «выбрать все»",
      description:
        "Родитель отражает вложенные: пусто, неполный, выбрано всё. Вложенные сдвинуты на 26 px.",
      when: "список документов, колонок, получателей, где часто нужно взять все сразу.",
      demo: <DemoCheckGroup />,
    },
    {
      id: "cards",
      title: "Карточки-флажки",
      description:
        "Каждый вариант в карточке с заголовком и пояснением. Выбранная получает подложку --selected и кольцо --border-selected.",
      when: "несколько каналов или тарифных опций, где вариантам нужно описание.",
      wide: true,
      demo: <DemoCheckCards />,
    },
    {
      id: "error",
      title: "С ошибкой",
      description: "Рамка --danger и текст ошибки под подписью.",
      when: "обязательное подтверждение, которое не поставили при отправке.",
      demo: (
        <DemoCheckOption
          title="Я подтверждаю данные декларации"
          hint="Нужно подтвердить, чтобы отправить"
          invalid
        />
      ),
    },
  ],
  sizes: [
    {
      id: "box",
      title: "Флажок",
      value: "16×16 px",
      note: "единственный размер; рамка 1,5 px, радиус 4",
      demo: <DemoCheckbox defaultChecked label="16 px" />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Обычный", "Hover", "Focus", "Ошибка", "Disabled"],
    rows: [
      {
        label: "пусто",
        cells: [
          <DemoCheckbox key="a" label="пусто" />,
          <DemoCheckbox key="b" force="hover" label="пусто hover" />,
          <DemoCheckbox key="c" force="focus" label="пусто focus" />,
          <DemoCheckbox key="d" invalid label="пусто ошибка" />,
          <DemoCheckbox key="e" disabled label="пусто disabled" />,
        ],
      },
      {
        label: "выбран",
        cells: [
          <DemoCheckbox key="a" defaultChecked label="выбран" />,
          <DemoCheckbox key="b" defaultChecked force="hover" label="выбран hover" />,
          <DemoCheckbox key="c" defaultChecked force="focus" label="выбран focus" />,
          <DemoCheckbox key="d" defaultChecked invalid label="выбран ошибка" />,
          <DemoCheckbox key="e" defaultChecked disabled label="выбран disabled" />,
        ],
      },
      {
        label: "неполный",
        cells: [
          <DemoCheckbox key="a" indeterminate label="неполный" />,
          <DemoCheckbox key="b" indeterminate force="hover" label="неполный hover" />,
          <DemoCheckbox key="c" indeterminate force="focus" label="неполный focus" />,
          <DemoCheckbox key="d" indeterminate invalid label="неполный ошибка" />,
          <DemoCheckbox key="e" indeterminate disabled label="неполный disabled" />,
        ],
      },
    ],
  },
  choreography: [
    {
      id: "check",
      title: "Установка флажка",
      trigger: "клик по флажку или подписи",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: рамка --text-3 → --text.",
          prop: "border-color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Клик: заливка и рамка идут к --primary.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 0,
          what: "Галочка (псевдоэлемент ::after) появляется сразу, без прорисовки: в макете у неё нет перехода. Снятие флажка — обратный порядок: заливка уходит за 125 мс, галочка исчезает сразу.",
          prop: "content",
        },
      ],
      focus: "Остаётся на флажке. Клик по подписи ставит фокус на input.",
      reducedMotion: "Переход цвета отключён; заливка и галочка появляются мгновенно.",
      neighbours: "Размер флажка не меняется, соседние пункты не затрагиваются.",
      demo: <CheckDemo />,
    },
    {
      id: "group",
      title: "«Выбрать все» и неполное состояние",
      trigger: "клик по вложенному пункту или по родителю",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Клик по вложенному: его флажок заливается; родитель получает indeterminate (тире) и счётчик «Выбрано N из M» обновляется текстом.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 800,
          dur: 125,
          what: "Выбраны все вложенные: родитель переходит из тире в галочку.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 1600,
          dur: 125,
          what: "Клик по родителю: выбираются или снимаются все вложенные одним действием; из неполного состояния клик выбирает все.",
          prop: "background, border-color",
          easing: "ease",
        },
      ],
      focus: "Остаётся на нажатом флажке; Tab идёт по пунктам по порядку, родитель первый.",
      reducedMotion: "Переходы цвета отключены, значки меняются мгновенно.",
      neighbours:
        "Строка счётчика меняет только текст, высота остаётся. Список вложенных не сворачивается и не двигается.",
      demo: <GroupDemo />,
    },
    {
      id: "error",
      title: "Ошибка обязательного флажка",
      trigger: "попытка отправить форму без обязательного флажка",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Рамка идёт к --danger, aria-invalid=true.",
          prop: "border-color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Под подписью появляется текст ошибки --err-text (без анимации высоты: место под пояснение зарезервировано).",
          prop: "—",
        },
        {
          at: 1200,
          dur: 125,
          what: "Флажок поставлен: рамка и заливка уходят к --primary, ошибка исчезает.",
          prop: "background, border-color",
          easing: "ease",
        },
      ],
      focus:
        "При отправке фокус переходит к первому полю с ошибкой; для флажка это сам флажок. Текст ошибки связан через aria-describedby. [TODO] в макете сценария отправки нет.",
      reducedMotion: "Рамка меняет цвет мгновенно.",
      neighbours:
        "Если текст ошибки добавляется без резерва места, форма ниже сдвигается на строку; решение (резерв или сдвиг) нужно подтвердить.",
      demo: <ErrorDemo />,
    },
  ],
  rules: {
    use: [
      "Несколько независимых вариантов в форме, значения применяются после отправки.",
      "Группа с «выбрать все» из пяти и более пунктов.",
      "Подпись всегда рядом и нажимается: вся строка — label.",
      "Пояснение мелким текстом — когда подписи недостаточно.",
      "Карточки-флажки, если у каждого варианта есть описание.",
    ],
    avoid: [
      "Настройка, которая действует сразу: это Switch.",
      "Один вариант из нескольких: это Radio или ToggleGroup.",
      "Флажок без подписи (кроме строки таблицы с aria-label).",
      "Неполное состояние у одиночного флажка: оно только у родителя группы.",
      "Отрицательные формулировки: «Не отправлять уведомления» запутывает.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Нативный checkbox",
      text: "<input type=checkbox> с label. Для неполного состояния ставится свойство indeterminate (aria-checked=mixed браузер выставит сам); атрибутом оно не задаётся.",
    },
    {
      kind: "key",
      title: "Space",
      text: "Переключает флажок. Tab и Shift+Tab ходят по флажкам; стрелки не нужны (это не группа выбора).",
    },
    {
      kind: "aria",
      title: "Ошибка",
      text: 'aria-invalid="true" на input и aria-describedby на элемент с текстом ошибки; одного цвета рамки недостаточно.',
    },
    {
      kind: "aria",
      title: "Группа",
      text: 'Контейнер role="group" с aria-label или fieldset/legend; у родителя «выбрать все» собственное имя.',
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2px --focus, отступ 2px (3,65:1 на белом, 9,34:1 в тёмной). [TODO] в макете у настоящего :focus-visible отступ 0 (общее правило), у принудительного is-focus 2px; здесь везде 2px.",
    },
    {
      kind: "contrast",
      title: "Рамка и заливка",
      text: "Рамка --text-3 на --field: 4,9:1 (светлая), 8,1:1 (тёмная). Галочка navy на teal 7,4:1. Рамка ошибки --danger на белом 4,9:1. Disabled-рамка --divider: вне нормы для недоступных.",
    },
    {
      kind: "contrast",
      title: "Подпись и пояснение",
      text: "Подпись --text 16,5:1; пояснение --text-3 4,9:1 (светлая) и 7,6:1 (тёмная); текст ошибки --err-text 5,5:1 и 7,8:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы цвета флажка и карточки отключаются.",
    },
  ],
  tokens: [
    { name: "размер", value: "16×16 px, рамка 1,5 px", usage: "Флажок", kind: "size" },
    { name: "--r-control", value: "4 px", usage: "Радиус флажка", kind: "radius" },
    {
      name: "--text-3 / --text",
      value: "#66727f / #15202b",
      usage: "Рамка: обычная / hover",
      kind: "color",
    },
    { name: "--field", value: "#fff (тёмная #0f141b)", usage: "Фон пустого флажка", kind: "color" },
    {
      name: "--primary / --on-primary",
      value: "#00d4d0 / navy",
      usage: "Заливка и галочка выбранного",
      kind: "color",
    },
    {
      name: "--danger",
      value: "#d03538 (тёмная #ff6b6b)",
      usage: "Рамка и заливка при ошибке",
      kind: "color",
    },
    {
      name: "--tone / --divider / --text-ph",
      value: "ink 7 % / #e0e4e9 / #8792a0",
      usage: "Disabled: фон, рамка, метка и подпись",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / teal 60 %",
      usage: "Карточка выбранного",
      kind: "color",
    },
    { name: "--layer-1", value: "ink 4 %", usage: "Hover карточки", kind: "color" },
    { name: "--r-card", value: "10 px", usage: "Радиус карточки", kind: "radius" },
    {
      name: "--focus",
      value: "#00968f (тёмная #00d4d0)",
      usage: "Кольцо 2px, отступ 2px",
      kind: "color",
    },
    { name: "--dur-f", value: "125 мс", usage: "Заливка, рамка, карточка", kind: "time" },
  ],
  examples: [
    {
      id: "options",
      title: "Параметры сверки",
      demo: (
        <div className="ds-check__list">
          <DemoCheckOption
            title="Сверять вес"
            hint="Накладная, декларация и инвойс"
            defaultChecked
          />
          <DemoCheckOption title="Сверять код ТН ВЭД" />
        </div>
      ),
      code: `<Checkbox checked={weight} onCheckedChange={setWeight} hint="Накладная, декларация и инвойс">Сверять вес</Checkbox>`,
    },
    {
      id: "all",
      title: "Выбрать все документы",
      demo: <DemoCheckGroup />,
      code: `<CheckboxGroup label="Документы для сверки" value={docs} onValueChange={setDocs} selectAll>…</CheckboxGroup>`,
    },
  ],
});

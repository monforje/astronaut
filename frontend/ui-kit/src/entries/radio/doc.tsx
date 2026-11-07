/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoRadio, DemoRadioGroup, PERIOD, PLANS, TRANSPORT, type RadioForce } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function PickDemo() {
  return (
    <Playback<{ v: string; f?: RadioForce; fid?: string }>
      initial={{ v: "sea" }}
      script={[
        { at: 400, set: { f: "hover", fid: "rail" } },
        { at: 1100, set: { v: "rail" } },
        { at: 2200, set: { v: "sea", f: undefined, fid: undefined } },
      ]}
      tail={700}
      render={(s) => (
        <DemoRadioGroup
          items={TRANSPORT}
          label="Тип перевозки"
          value={s.v}
          forceId={s.fid}
          force={s.f}
        />
      )}
    />
  );
}

function ArrowDemo() {
  return (
    <Playback<{ v: string; f?: RadioForce; fid?: string }>
      initial={{ v: "sea" }}
      script={[
        { at: 400, set: { f: "focus", fid: "sea" } },
        { at: 1300, set: { v: "rail", fid: "rail" } },
        { at: 2100, set: { v: "sea", fid: "sea" } },
      ]}
      tail={700}
      hint="↓ выбирает следующий (Авиа disabled пропущен), ↑ возвращает. Фокус и выбор идут вместе."
      render={(s) => (
        <DemoRadioGroup
          items={TRANSPORT}
          label="Тип перевозки"
          value={s.v}
          forceId={s.fid}
          force={s.f}
        />
      )}
    />
  );
}

function CardsDemo() {
  return (
    <Playback<{ v: string; f?: RadioForce; fid?: string }>
      initial={{ v: "std" }}
      script={[
        { at: 400, set: { f: "hover", fid: "ext" } },
        { at: 1100, set: { v: "ext" } },
        { at: 2200, set: { v: "std", f: undefined, fid: undefined } },
      ]}
      tail={700}
      render={(s) => (
        <DemoRadioGroup
          kind="cards"
          items={PLANS}
          label="Тариф"
          value={s.v}
          forceId={s.fid}
          force={s.f}
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
    note: "Круг 16 px, рамка 1,5px --text-3, фон --field.",
    demo: <DemoRadio name="d-default" label="Обычный" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Рамка темнеет до --text.",
    forced: true,
    demo: <DemoRadio name="d-hover" force="hover" label="Hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Отдельного вида нет: нажатие сразу выбирает вариант. [TODO] решить, нужен ли слой на время нажатия.",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus с отступом 2px, только от клавиатуры. У карточки — вокруг всей карточки.",
    forced: true,
    demo: <DemoRadio name="d-focus" force="focus" label="Focus" />,
  },
  {
    id: "checked",
    kind: "selected",
    title: "Выбран",
    note: "Заливка и рамка --primary, точка 6 px --on-primary.",
    demo: <DemoRadio name="d-checked" checked label="Выбран" />,
  },
  {
    id: "checked-hover",
    kind: "hover",
    title: "Hover выбранного",
    note: "Заливка темнеет на 9 % (смешение с чёрным в oklch).",
    forced: true,
    demo: <DemoRadio name="d-checked-hover" checked force="hover" label="Hover выбранного" />,
  },
  {
    id: "error",
    kind: "error",
    title: "Ошибка",
    note: "data-invalid: рамка --danger (aria-invalid=true стоит на группе). Текст ошибки — под группой, --err-text. Выбранный с ошибкой не бывает: ошибка «не выбрано».",
    demo: <DemoRadio name="d-error" invalid label="Ошибка" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Фон --tone, рамка --divider; подпись --text-ph.",
    demo: <DemoRadio name="d-disabled" disabled label="Disabled" />,
  },
  {
    id: "disabled-checked",
    kind: "disabled",
    title: "Disabled выбранный",
    note: "Фон --tone, точка --text-ph.",
    demo: <DemoRadio name="d-disabled-checked" checked disabled label="Disabled выбранный" />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет: Radio не ходит на сервер сам. Варианты, которые ещё грузятся, показывают Skeleton на месте группы.",
  ),
  NA(
    "empty",
    "empty",
    "Empty",
    "Нет у самого Radio. «Ничего не выбрано» — обычное начальное состояние группы; после выбора вернуть его нельзя (для этого нужен Checkbox или вариант «Не задано»).",
  ),
];

export default defineDoc({
  id: "radio",
  title: "Radio",
  group: "fields",
  cssPrefix: "ds-radio",
  order: 50,
  keywords: [
    "радио",
    "радиокнопка",
    "переключатель выбора",
    "радио-кнопка",
    "radio",
    "radio button",
    "один вариант",
    "выбор одного",
    "radiogroup",
    "карточки-варианты",
    "choice cards",
  ],
  summary: "Один вариант из группы: вертикально с пояснениями, в строку и карточками-вариантами.",
  purpose:
    "Radio выбирает ровно один вариант из 2-5, когда все варианты нужно видеть сразу и подтвердить выбор вместе с формой. Когда выбор применяется сразу и вариантов мало, лучше ToggleGroup; когда вариантов много, Select.",
  related: ["checkbox", "toggle-group", "select", "switch"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, side: "t" },
          { n: 2, anchor: ".ds-radio", side: "l" },
          { n: 3, anchor: ".ds-radio__text", side: "r" },
        ]}
      >
        <div className="ds-radio__group" role="radiogroup" aria-label="Тип перевозки">
          <label className="ds-radio__opt" aria-label="Морской импорт">
            <input type="radio" name="an" className="ds-radio" defaultChecked />
            <span className="ds-radio__text">
              <span>Морской импорт</span>
              <small>Контейнеры из Китая</small>
            </span>
          </label>
          <label className="ds-radio__opt" aria-label="Железная дорога">
            <input type="radio" name="an" className="ds-radio" />
            <span className="ds-radio__text">
              <span>Железная дорога</span>
            </span>
          </label>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Группа",
        description:
          'role="radiogroup" с aria-label; вертикально с зазором 10 или в строку с зазором 20. Один name на всю группу.',
      },
      {
        name: "Кружок",
        description:
          "16 px, рамка 1,5px. Выбран: заливка --primary и точка 6 px. Выравнен по первой строке подписи (отступ сверху 2px).",
      },
      {
        name: "Подпись и пояснение",
        description: "Подпись 13 px; пояснение 11 px --text-3 ниже. Нажимается вся строка (label).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "list",
      title: "Вертикальная с пояснениями",
      description:
        "Основной вид формы: подпись и пояснение, недоступный вариант остаётся в списке.",
      when: "тип перевозки, способ доставки, 2-5 вариантов с описанием.",
      demo: <DemoRadioGroup items={TRANSPORT} label="Тип перевозки" defaultValue="sea" />,
    },
    {
      id: "row",
      title: "В строку",
      description: "Короткие подписи без пояснений, зазор 20.",
      when: "период, единица измерения: «День / Неделя / Месяц».",
      demo: <DemoRadioGroup kind="row" items={PERIOD} label="Период" defaultValue="week" />,
    },
    {
      id: "cards",
      title: "Карточки-варианты",
      description:
        "Вариант в карточке с заголовком 600 и пояснением. Выбранная: подложка --selected и кольцо --border-selected.",
      when: "тарифы, режимы, где у каждого варианта есть описание и нужен крупный клик.",
      wide: true,
      demo: <DemoRadioGroup kind="cards" items={PLANS} label="Тариф" defaultValue="std" />,
    },
    {
      id: "error",
      title: "С ошибкой",
      description: "Рамка --danger у всех кружков и текст ошибки под группой.",
      when: "обязательный выбор, который не сделан при отправке формы.",
      demo: (
        <DemoRadioGroup
          items={TRANSPORT}
          label="Тип перевозки"
          invalid
          error="Выберите тип перевозки"
        />
      ),
    },
  ],
  sizes: [
    {
      id: "dot",
      title: "Кружок",
      value: "16 px",
      note: "единственный размер; точка 6 px, рамка 1,5 px",
      demo: <DemoRadio name="d-size" checked label="16 px" />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Обычный", "Hover", "Focus", "Ошибка", "Disabled"],
    rows: [
      {
        label: "не выбран",
        cells: [
          <DemoRadio key="a" name="m-a" label="не выбран" />,
          <DemoRadio key="b" name="m-b" force="hover" label="не выбран hover" />,
          <DemoRadio key="c" name="m-c" force="focus" label="не выбран focus" />,
          <DemoRadio key="d" name="m-d" invalid label="не выбран ошибка" />,
          <DemoRadio key="e" name="m-e" disabled label="не выбран disabled" />,
        ],
      },
      {
        label: "выбран",
        cells: [
          <DemoRadio key="a" name="m-f" checked label="выбран" />,
          <DemoRadio key="b" name="m-g" checked force="hover" label="выбран hover" />,
          <DemoRadio key="c" name="m-h" checked force="focus" label="выбран focus" />,
          <span key="d" className="dx-sr">
            не бывает
          </span>,
          <DemoRadio key="e" name="m-i" checked disabled label="выбран disabled" />,
        ],
      },
    ],
  },
  choreography: [
    {
      id: "pick",
      title: "Выбор варианта",
      trigger: "клик по кружку или подписи другого варианта",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение на невыбранный: рамка --text-3 → --text.",
          prop: "border-color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Клик: у нового кружок заливается --primary, рамка идёт к --primary.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Одновременно у прежнего заливка уходит к --field, рамка к --text-3.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 0,
          what: "Точка 6 px появляется у нового и исчезает у старого сразу (у неё нет перехода).",
          prop: "content",
        },
      ],
      focus: "Остаётся на выбранном кружке; клик по подписи ставит фокус на её input.",
      reducedMotion: "Переходы цвета отключены; кружки меняются мгновенно.",
      neighbours:
        "Размеры не меняются, остальные варианты не двигаются. У карточки подложка и кольцо меняются тем же переходом 125 мс.",
      demo: <PickDemo />,
    },
    {
      id: "arrows",
      title: "Стрелки внутри группы",
      trigger: "Tab в группу, затем ↑ ↓ ← →",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: фокус на выбранном варианте (если выбора нет, на первом доступном); кольцо 2px --focus.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 125,
          what: "↓ или →: фокус и выбор переходят на следующий доступный; disabled пропускается. Заливка переезжает как при клике.",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 1700,
          dur: 125,
          what: "↑ или ←: назад. С последнего вперёд замыкается на первый.",
          prop: "background, border-color",
          easing: "ease",
        },
      ],
      focus:
        "Поведение нативное: roving tabindex даёт браузер для input[type=radio] с одним name. Tab проходит группу одним остановом; Space выбирает сфокусированный, если выбора нет.",
      reducedMotion: "Переходы цвета отключены, кольцо фокуса остаётся.",
      neighbours: "Соседние варианты не двигаются, группа не меняет высоты.",
      demo: <ArrowDemo />,
    },
    {
      id: "cards",
      title: "Карточки-варианты",
      trigger: "наведение и клик по карточке",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: подложка --layer-1, кольцо карточки --border → --text-3.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Выбор: подложка --selected, кольцо --border-selected; у прежней карточки возврат к обычной.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Кружок заливается внутри карточки (как у обычного Radio).",
          prop: "background, border-color",
          easing: "ease",
        },
      ],
      focus:
        "Кольцо 2px --focus с отступом 2px рисуется вокруг всей карточки (:has(:focus-visible)).",
      reducedMotion: "Подложка и кольцо меняются мгновенно.",
      neighbours: "Карточки в сетке не двигаются; высота строки сетки — по самой высокой.",
      demo: <CardsDemo />,
    },
  ],
  rules: {
    use: [
      "Один вариант из 2-5, которые нужно видеть сразу.",
      "Выбор по умолчанию задавайте, если есть разумный; иначе делайте ошибку «не выбрано» понятной.",
      "Пояснение мелким текстом, когда подписи мало; недоступный вариант оставляйте с причиной.",
      "Группе всегда давайте имя (aria-label или legend).",
      "Карточки-варианты для тарифов и режимов с описанием.",
    ],
    avoid: [
      "Больше пяти вариантов в столбик: нужен Select.",
      "Выбор, который применяется сразу в панели: ToggleGroup быстрее и компактнее.",
      "Radio для «да / нет»: это Checkbox или Switch.",
      "Один Radio без группы: вернуть пустое значение нельзя.",
      "Менять вид группы (список ↔ строка) в одном продукте без причины.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "radiogroup",
      text: 'Контейнер role="radiogroup" с aria-label или fieldset/legend; внутри нативные <input type=radio> с общим name и label.',
    },
    {
      kind: "key",
      title: "Tab",
      text: "Входит в группу одним остановом: на выбранном варианте, а без выбора — на первом. Дальше Tab уходит из группы.",
    },
    {
      kind: "key",
      title: "← → ↑ ↓",
      text: "Переносят фокус и сразу выбирают следующий/предыдущий вариант, пропуская disabled, с замыканием по краям. Space выбирает сфокусированный.",
    },
    {
      kind: "aria",
      title: "Ошибка",
      text: 'aria-invalid="true" на группе и aria-describedby на текст ошибки; цвета рамки недостаточно.',
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2px --focus, отступ 2px: 3,65:1 на белом, 9,34:1 в тёмной.",
    },
    {
      kind: "contrast",
      title: "Кружок",
      text: "Рамка --text-3 на --field 4,9:1 (светлая), 8,1:1 (тёмная). Точка navy на teal 7,4:1. Рамка ошибки --danger на белом 4,9:1. Disabled вне нормы.",
    },
    {
      kind: "contrast",
      title: "Текст",
      text: "Подпись --text 16,5:1; пояснение --text-3 4,9:1 и 7,6:1; текст ошибки --err-text 5,5:1 и 7,8:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы цвета кружка и карточки отключаются.",
    },
  ],
  tokens: [
    { name: "размер", value: "16 px, рамка 1,5 px, точка 6 px", usage: "Кружок", kind: "size" },
    {
      name: "--text-3 / --text",
      value: "#66727f / #15202b",
      usage: "Рамка: обычная / hover",
      kind: "color",
    },
    { name: "--field", value: "#fff (тёмная #0f141b)", usage: "Фон кружка", kind: "color" },
    {
      name: "--primary / --on-primary",
      value: "#00d4d0 / navy",
      usage: "Заливка и точка выбранного; hover заливки: смесь с чёрным 9 %",
      kind: "color",
    },
    {
      name: "--danger",
      value: "#d03538 (тёмная #ff6b6b)",
      usage: "Рамка при ошибке",
      kind: "color",
    },
    {
      name: "--tone / --divider / --text-ph",
      value: "ink 7 % / #e0e4e9 / #8792a0",
      usage: "Disabled",
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
      id: "transport",
      title: "Тип перевозки",
      demo: <DemoRadioGroup items={TRANSPORT} label="Тип перевозки" defaultValue="sea" />,
      code: `<RadioGroup value={type} onValueChange={setType} label="Тип перевозки">
  <Radio value="sea" hint="Контейнеры из Китая во Владивосток">Морской импорт</Radio>
  <Radio value="rail">Железная дорога</Radio>
  <Radio value="air" disabled>Авиа</Radio>
</RadioGroup>`,
    },
    {
      id: "plans",
      title: "Тариф карточками",
      demo: <DemoRadioGroup kind="cards" items={PLANS} label="Тариф" defaultValue="ext" />,
      code: `<RadioGroup variant="cards" value={plan} onValueChange={setPlan}>…</RadioGroup>`,
    },
  ],
});

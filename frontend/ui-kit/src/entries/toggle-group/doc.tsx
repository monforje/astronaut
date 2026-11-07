/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon } from "@/engine/Icon";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  DemoToggleGroup,
  ICON_OPTIONS,
  PERIOD_OPTIONS,
  STATUS_OPTIONS,
  VIEW_OPTIONS,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function SlideDemo() {
  return (
    <Playback<{ v: string; f?: "hover" | "active"; fid?: string }>
      initial={{ v: "list" }}
      script={[
        { at: 400, set: { f: "hover", fid: "tree" } },
        { at: 1100, set: { f: "active" } },
        { at: 1250, set: { v: "tree", f: undefined, fid: undefined } },
        { at: 2400, set: { v: "table" } },
        { at: 3500, set: { v: "list" } },
      ]}
      tail={800}
      hint="Плашка едет под выбранный пункт 200 мс; ширина подстраивается под подпись."
      render={(s) => (
        <DemoToggleGroup options={VIEW_OPTIONS} value={s.v} forceId={s.fid} force={s.f} />
      )}
    />
  );
}

function KeysDemo() {
  return (
    <Playback<{ v: string; f?: "focus"; fid?: string }>
      initial={{ v: "day" }}
      script={[
        { at: 400, set: { f: "focus", fid: "day" } },
        { at: 1300, set: { v: "week", fid: "week" } },
        { at: 2100, set: { v: "month", fid: "month" } },
        { at: 2900, set: { v: "day", fid: "day" } },
      ]}
      tail={700}
      hint="Предложение: стрелки переключают и сразу выбирают, как в радиогруппе; по краям список замыкается."
      render={(s) => (
        <DemoToggleGroup
          size="sm"
          options={PERIOD_OPTIONS}
          label="Период"
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
    title: "Пункт не выбран",
    note: "aria-checked=false. Текст --text-2 на фоне трека --surface-muted.",
    demo: <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="list" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "У невыбранного пункта текст темнеет до --text. У выбранного ничего не меняется.",
    forced: true,
    demo: (
      <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="list" forceId="table" force="hover" />
    ),
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Слой --layer-1p на невыбранном пункте, пока кнопка нажата. На выбранном слоя нет.",
    forced: true,
    demo: (
      <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="list" forceId="table" force="active" />
    ),
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо 2px --focus вплотную вокруг пункта (outline-offset 0), только от клавиатуры.",
    forced: true,
    demo: (
      <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="list" forceId="list" force="focus" />
    ),
  },
  {
    id: "selected",
    kind: "selected",
    title: "Выбран",
    note: "aria-checked=true. Под пунктом плашка --surface с тенью --shadow-panel и кольцом --border; текст --text.",
    demo: <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="table" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled-пункт",
    note: "Недоступен один вариант, остальные работают. Текст --text-ph, плашка на него не переезжает.",
    demo: <DemoToggleGroup options={ICON_OPTIONS} defaultValue="list" />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете. Переключение мгновенно и локально; если вид грузится с сервера, Skeleton ставят на контент, а группа остаётся доступной.",
  ),
  NA(
    "error",
    "error",
    "Error",
    "Нет: выбрать «неправильный» сегмент нельзя. Ошибку выбора показывает поле формы, а не группа.",
  ),
  NA(
    "empty",
    "empty",
    "Empty",
    "Нет: всегда выбран один пункт, пустой группы не бывает. Значение по умолчанию обязательно.",
  ),
];

export default defineDoc({
  id: "toggle-group",
  title: "ToggleGroup",
  group: "actions",
  cssPrefix: "ds-tgroup",
  order: 50,
  keywords: [
    "сегменты",
    "сегментированный переключатель",
    "группа переключателей",
    "toggle group",
    "button group",
    "segmented control",
    "переключатель вида",
    "segmented",
    "переключатель вида",
    "radiogroup",
    "плашка",
    "thumb",
  ],
  summary:
    "Сегментированный выбор одного варианта из нескольких. Плашка под выбранным пунктом переезжает при смене.",
  purpose:
    "ToggleGroup меняет вид или фильтр одной строкой: «Список / Таблица / Дерево», «День / Неделя / Месяц», «Все / Сверено / Расхождения». Выбор применяется сразу и всегда один. Для двух независимых флажков берите Toggle, для длинного списка (больше пяти) Select.",
  related: ["toggle", "radio", "select", "tabs"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, side: "t" },
          { n: 2, anchor: ".ds-tgroup__opt--thumb", side: "b" },
          { n: 3, anchor: ".ds-tgroup__opt:not(.ds-tgroup__opt--thumb)", side: "b" },
          { n: 4, anchor: ".ds-icon", side: "t" },
        ]}
      >
        <div className="ds-tgroup" role="radiogroup" aria-label="Вид">
          <button
            type="button"
            role="radio"
            aria-checked="true"
            className="ds-tgroup__opt ds-tgroup__opt--thumb"
          >
            <Icon name="list" size="sm" />
            Список
          </button>
          <button type="button" role="radio" aria-checked="false" className="ds-tgroup__opt">
            Таблица
          </button>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Трек",
        description:
          "Подложка --surface-muted, радиус 8, кольцо 1px --divider, внутренний отступ 2px, зазор между пунктами 2px. Строчный по ширине содержимого или block на всю ширину.",
      },
      {
        name: "Плашка (thumb)",
        description:
          "Абсолютный слой под выбранным пунктом: --surface, тень --shadow-panel, кольцо --border, радиус 6. Положение и ширина задаются translate и width, и анимируются.",
      },
      {
        name: "Пункт",
        description:
          "Кнопка role=radio высотой 26 px (22 в sm), padding 0 12, подпись 600, 12 px. Выбранный — --text, остальные — --text-2.",
      },
      {
        name: "Значок",
        description: "14 px перед подписью, зазор 6; необязателен.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "md",
      title: "По содержимому",
      description: "Ширина по подписям, высота пункта 26 px. Основной вид.",
      when: "переключатель вида над списком; два-четыре коротких слова.",
      demo: <DemoToggleGroup options={VIEW_OPTIONS} defaultValue="list" />,
    },
    {
      id: "sm",
      title: "Компактный",
      description: "Высота пункта 22 px, padding 0 8, подпись 11 px.",
      when: "заголовок карточки или график: «День / Неделя / Месяц».",
      demo: (
        <DemoToggleGroup size="sm" options={PERIOD_OPTIONS} defaultValue="week" label="Период" />
      ),
    },
    {
      id: "block",
      title: "На всю ширину",
      description: "Трек растягивается, пункты делят ширину поровну.",
      when: "фильтр статусов над таблицей на всю ширину панели, мобильный вид.",
      demo: (
        <div style={{ width: "100%" }}>
          <DemoToggleGroup block options={STATUS_OPTIONS} defaultValue="all" label="Статус" />
        </div>
      ),
    },
    {
      id: "icons",
      title: "Со значками",
      description: "Значок 14 px слева от подписи; недоступный вариант остаётся в ряду.",
      when: "режимы показа: список, плитки, карта.",
      demo: <DemoToggleGroup options={ICON_OPTIONS} defaultValue="list" label="Показ" />,
    },
  ],
  sizes: [
    {
      id: "md",
      title: "md",
      value: "28 px трек, пункт 26",
      note: "padding 0 12, подпись 12 px",
      demo: <DemoToggleGroup options={PERIOD_OPTIONS} defaultValue="week" label="Период md" />,
    },
    {
      id: "sm",
      title: "sm",
      value: "24 px трек, пункт 22",
      note: "padding 0 8, подпись 11 px",
      demo: (
        <DemoToggleGroup size="sm" options={PERIOD_OPTIONS} defaultValue="week" label="Период sm" />
      ),
    },
  ],
  states,
  choreography: [
    {
      id: "slide",
      title: "Смена выбора: плашка переезжает",
      trigger: "клик или тап по другому пункту",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение на невыбранный пункт: текст --text-2 → --text.",
          prop: "color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 125,
          what: "Нажатие: слой --layer-1p на нажатом пункте.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 850,
          dur: 200,
          what: "Плашка едет к новому пункту; одновременно меняется её ширина под подпись.",
          prop: "translate, width",
          easing: "var(--ease) = cubic-bezier(.6,0,.05,.95)",
        },
        {
          at: 850,
          dur: 125,
          what: "aria-checked переходит на новый пункт: у прежнего текст --text → --text-2, у нового --text-2 → --text.",
          prop: "color",
          easing: "ease",
        },
      ],
      focus:
        "Остаётся на нажатом пункте (клик по кнопке). Фокус не едет вместе с плашкой, плашка едет за выбором.",
      reducedMotion: "Переход плашки и цвета отключён: плашка появляется под новым пунктом сразу.",
      neighbours:
        "Пункты не двигаются: трек не меняет размера, меняется только положение плашки. Первая расстановка плашки при показе идёт без перехода (иначе она «выезжает» с нуля).",
      demo: <SlideDemo />,
    },
    {
      id: "keys",
      title: "Стрелки и фокус",
      trigger: "Tab в группу, затем ← → ↑ ↓",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: фокус на выбранном пункте (единственная остановка Tab, у остальных tabindex=-1). Кольцо 2px --focus.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 200,
          what: "→ или ↓: выбор и фокус на следующем доступном пункте; плашка едет. Disabled-пункты пропускаются.",
          prop: "translate, width",
          easing: "var(--ease)",
        },
        {
          at: 1700,
          dur: 200,
          what: "На последнем пункте → замыкается на первый; ← на первом уходит на последний.",
          prop: "translate, width",
          easing: "var(--ease)",
        },
      ],
      focus:
        "Roving tabindex: фокус всегда на выбранном пункте и едет вместе с выбором. Space и Enter ничего не меняют (выбор уже сделан стрелкой). [TODO] подтвердить: в макете стрелки не обработаны, только клик.",
      reducedMotion: "Плашка перескакивает без перехода, кольцо фокуса остаётся.",
      neighbours: "Стрелки не должны прокручивать страницу: у обработчика preventDefault.",
      demo: <KeysDemo />,
    },
  ],
  rules: {
    use: [
      "Один вариант из двух-пяти, когда все видны сразу и выбор применяется сразу.",
      "Короткие подписи, одно слово: «Список», «Неделя».",
      "Всегда выбран ровно один пункт; значение по умолчанию задавайте явно.",
      "Недоступный вариант оставляйте в ряду (disabled), а не прячьте.",
      "block — когда группа лежит в узкой панели.",
    ],
    avoid: [
      "Несколько вариантов одновременно: это ряд Toggle или Checkbox.",
      "Длинный список или длинные подписи: это Select.",
      "Переход между страницами: это Tabs, у вкладок другая семантика и индикатор.",
      "Выбор, который нужно подтвердить кнопкой: в форме берите Radio.",
      "Больше пяти пунктов в ряд: трек не помещается, горизонтального скролла у него нет.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "radiogroup + radio",
      text: 'Трек — role="radiogroup" с aria-label («Вид», «Период»); пункт — <button role="radio" aria-checked>. Вкладками (tablist) группа не является.',
    },
    {
      kind: "key",
      title: "Tab",
      text: "Входит в группу одним остановом на выбранном пункте; остальные tabindex=-1. [TODO] в макете tabindex не расставлен: каждый пункт отдельная остановка Tab.",
    },
    {
      kind: "key",
      title: "← → ↑ ↓",
      text: "Предложение: переключают выбор и фокус, пропуская disabled, замыкаясь по краям. Home и End — на первый и последний.",
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2px --focus вплотную вокруг пункта (3,65:1 на белом, 9,34:1 в тёмной).",
    },
    {
      kind: "contrast",
      title: "Текст пунктов",
      text: "--text-2 на --surface-muted: 7,1:1 (светлая), 9,7:1 (тёмная); выбранный --text на --surface: 16,5:1 и 16,4:1. Недоступный --text-ph — вне нормы WCAG для disabled.",
    },
    {
      kind: "contrast",
      title: "Плашка",
      text: "Плашка отличается от трека не цветом, а тенью и кольцом: фон --surface и --surface-muted дают 1,1:1 в светлой. Выбранный пункт ещё и темнее по тексту (16,5:1 против 7,1:1). [TODO] проверить различимость в тёмной теме.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Плашка переезжает мгновенно, цвет текста меняется без перехода.",
    },
  ],
  tokens: [
    { name: "--surface-muted", value: "#eceef2 (тёмная #1f2833)", usage: "Трек", kind: "color" },
    { name: "--divider", value: "#e0e4e9", usage: "Кольцо трека 1px", kind: "color" },
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6",
      usage: "Плашка и её кольцо",
      kind: "color",
    },
    {
      name: "--shadow-panel",
      value: "0 1px 3px rgba(14,20,28,.18)",
      usage: "Тень плашки",
      kind: "shadow",
    },
    {
      name: "--r-item",
      value: "8 px (плашка и пункт 6)",
      usage: "Радиус трека; пункт и плашка = 8 − 2",
      kind: "radius",
    },
    {
      name: "--h-sm / --h-xs",
      value: "28 / 24 px",
      usage: "Высота трека md / sm (пункт на 2 меньше)",
      kind: "size",
    },
    {
      name: "--text-2 / --text / --text-ph",
      value: "#44505d / #15202b / #8792a0",
      usage: "Пункт: обычный / выбранный / недоступный",
      kind: "color",
    },
    { name: "--layer-1p", value: "ink 7 %", usage: "Active невыбранного пункта", kind: "color" },
    { name: "--focus", value: "#00968f (тёмная #00d4d0)", usage: "Кольцо фокуса", kind: "color" },
    { name: "--dur", value: "200 мс", usage: "Переезд плашки (translate, width)", kind: "time" },
    {
      name: "--ease",
      value: "cubic-bezier(.6,0,.05,.95)",
      usage: "Кривая переезда плашки",
      kind: "ease",
    },
    { name: "--dur-f", value: "125 мс, ease", usage: "Цвет текста и слой active", kind: "time" },
  ],
  examples: [
    {
      id: "view",
      title: "Вид списка грузов",
      demo: <DemoToggleGroup options={ICON_OPTIONS} defaultValue="list" label="Показ" />,
      code: `<ToggleGroup value={view} onValueChange={setView} aria-label="Показ">
  <ToggleGroup.Item value="list" icon="list">Список</ToggleGroup.Item>
  <ToggleGroup.Item value="grid" icon="grid">Плитки</ToggleGroup.Item>
  <ToggleGroup.Item value="map" disabled>Карта</ToggleGroup.Item>
</ToggleGroup>`,
    },
    {
      id: "status",
      title: "Фильтр статусов на всю ширину",
      demo: (
        <div style={{ width: "100%" }}>
          <DemoToggleGroup block options={STATUS_OPTIONS} defaultValue="err" label="Статус" />
        </div>
      ),
      code: `<ToggleGroup block value={status} onValueChange={setStatus} aria-label="Статус">…</ToggleGroup>`,
    },
  ],
});

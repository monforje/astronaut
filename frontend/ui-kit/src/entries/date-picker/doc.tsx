/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { ArrivalDateExample, DemoDateField, DemoDatePicker } from "./demo";
import { TODAY, addD, dayKey } from "../calendar/demo";

const d18 = new Date(2026, 10, 18);
const STAGE = {
  minHeight: 430,
  display: "grid",
  alignItems: "start",
  justifyItems: "start",
} as const;

function OpenDemo() {
  type S = { open: boolean; f?: "focus"; hov?: boolean; val: Date | null };
  return (
    <Playback<S>
      initial={{ open: false, val: addD(TODAY, 2) }}
      script={[
        { at: 400, set: { f: "focus" } },
        { at: 600, set: { open: true } },
        { at: 1700, set: { hov: true } },
        { at: 2400, set: { val: d18, open: false, hov: false } },
      ]}
      tail={900}
      hint="Фокус в поле или клик по иконке открывает календарь; выбор дня закрывает его и пишет дату."
      render={(s) => (
        <div style={STAGE}>
          <DemoDateField
            value={s.val}
            open={s.open}
            force={s.f}
            hint="Можно вписать: 14.11.2026"
            calendar={{ force: s.hov ? { [dayKey(d18)]: "hover" } : {} }}
          />
        </div>
      )}
    />
  );
}

function TypeDemo() {
  const full = "17.11.2026";
  type S = { n: number; done: boolean };
  return (
    <Playback<S>
      initial={{ n: 0, done: false }}
      script={[
        ...Array.from({ length: full.length }, (_, i) => ({
          at: 500 + i * 130,
          set: { n: i + 1 } as Partial<S>,
        })),
        { at: 2200, set: { done: true } },
      ]}
      tail={900}
      hint="Дата вписывается руками; по Enter или уходу из поля она разбирается и месяц в календаре переключается."
      render={(s) => (
        <div style={STAGE}>
          <DemoDateField
            text={s.done ? "17.11.2026" : full.slice(0, s.n)}
            value={s.done ? new Date(2026, 10, 17) : null}
            open
            force={s.done ? undefined : "focus"}
            hint="Можно вписать: 14.11.2026"
            calendar={{ a: s.done ? new Date(2026, 10, 17) : null }}
          />
        </div>
      )}
    />
  );
}

function ErrorDemo() {
  type S = { bad: boolean };
  return (
    <Playback<S>
      initial={{ bad: false }}
      script={[{ at: 900, set: { bad: true } }]}
      tail={1400}
      hint="Дата раньше сегодняшней отклоняется: рамка краснеет за 125 мс, под полем текст причины."
      render={(s) => (
        <DemoDateField
          text="09.11.2026"
          value={addD(TODAY, -3)}
          force={s.bad ? undefined : "focus"}
          invalid={s.bad}
          error={s.bad ? "Дата раньше сегодняшней" : undefined}
          clearVisible
        />
      )}
    />
  );
}

export default defineDoc({
  id: "date-picker",
  title: "DatePicker",
  group: "time",
  cssPrefix: "ds-datepicker",
  order: 20,
  keywords: [
    "дата",
    "даты",
    "поле даты",
    "выбор даты",
    "календарь",
    "ввод даты",
    "дата прибытия",
    "срок",
    "date picker",
    "datepicker",
    "date field",
    "date input",
    "calendar",
    "dropdown calendar",
  ],
  summary:
    "Поле одной даты: вписать «14.11.2026» руками или выбрать в календаре во всплывающей панели с кнопками «Сегодня» и «Очистить».",
  purpose:
    "DatePicker сочетает быстрый ввод с клавиатуры и выбор мышью. Ввод разбирается строго по шаблону дд.мм.гггг; календарь внутри панели — компонент Calendar. Для периода есть RangePicker. Поле, подпись, подсказка и панель этого компонента используют и TimePicker с RangePicker.",
  related: ["calendar", "range-picker", "time-picker", "popover", "input"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-datepicker__label", side: "t" },
          { n: 2, anchor: ".ds-datepicker__lead", side: "l" },
          { n: 3, anchor: ".ds-datepicker__input", side: "t" },
          { n: 4, anchor: ".ds-datepicker__x", side: "r" },
          { n: 5, anchor: ".ds-datepicker__hint", side: "b" },
        ]}
      >
        <div style={{ width: 240 }}>
          <DemoDateField hint="Можно вписать: 14.11.2026" />
        </div>
      </Marks>
    ),
    parts: [
      { name: "Подпись", description: "Над полем, 12 px, 600: «Дата прибытия». Всегда есть." },
      {
        name: "Иконка календаря",
        description: "Кнопка слева: открывает и закрывает панель. Цвет --text-3, в фокусе --link.",
      },
      { name: "Ввод", description: "Текстовое поле с шаблоном «дд.мм.гггг», цифры tabular-nums." },
      {
        name: "Очистить",
        description:
          "Крестик справа, виден только когда дата есть; в поле 20 px, выступает за отступ на 6 px.",
        optional: true,
      },
      {
        name: "Подсказка или ошибка",
        description:
          "Под полем: «Можно вписать: 14.11.2026» или причина отказа красным (--err-text). Ошибка заменяет подсказку.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "default",
      title: "Поле с календарём",
      description:
        "Клик по иконке или фокус в поле открывает календарь под полем: сегодняшняя дата в кольце, точки событий, прошлые дни недоступны.",
      when: "одна дата в форме или фильтре.",
      demo: (
        <div
          style={{
            minHeight: 440,
            width: "100%",
            display: "grid",
            justifyItems: "start",
            alignItems: "start",
          }}
        >
          <DemoDatePicker />
        </div>
      ),
    },
    {
      id: "open",
      title: "Панель открыта",
      description:
        "Панель шириной от 280 px; сверху календарь, снизу «Сегодня» слева и «Очистить» справа.",
      demo: (
        <div
          style={{
            minHeight: 440,
            width: "100%",
            display: "grid",
            justifyItems: "start",
            alignItems: "start",
          }}
        >
          <DemoDateField open force="focus" hint="Можно вписать: 14.11.2026" />
        </div>
      ),
    },
    {
      id: "empty",
      title: "Пустое",
      description: "Placeholder «дд.мм.гггг», крестика нет.",
      demo: <DemoDateField empty />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Рамка --border, фон --field. Дата записана «14.11.2026».",
      demo: <DemoDateField label="Дата" />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Рамка темнеет до --text-3.",
      forced: true,
      demo: <DemoDateField label="Дата" force="hover" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Рамка --focus и кольцо 3 px --selected; иконка становится --link. Так же выглядит поле, пока панель открыта.",
      forced: true,
      demo: <DemoDateField label="Дата" force="focus" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет отдельного вида: нажатие превращается в фокус и открытие панели. Нажатие на «Сегодня» и крестик — слои кнопок.",
      notApplicable: true,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Фон прозрачный, рамка --divider, текст --text-ph; иконка не нажимается, панель не открывается.",
      demo: <DemoDateField label="Недоступно" disabled />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: значение подгружается, вместо даты серая заглушка; поле не редактируется.",
      demo: <DemoDateField label="Дата" loading />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Рамка --danger, aria-invalid, под полем причина: «Дата раньше сегодняшней» или «Формат: дд.мм.гггг».",
      demo: (
        <DemoDateField
          label="Ошибка"
          value={addD(TODAY, -3)}
          invalid
          error="Дата раньше сегодняшней"
        />
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Placeholder --text-ph «дд.мм.гггг», крестика нет.",
      demo: <DemoDateField label="Дата" empty />,
    },
  ],
  choreography: [
    {
      id: "open",
      title: "Открыть и выбрать",
      trigger: "фокус в поле, клик по иконке, клик по дню",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Поле получает фокус: рамка и кольцо 3 px переходят на цвета фокуса.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Панель с календарём всплывает под полем на 6 px: прозрачность 0→1, масштаб .96→1, сдвиг 4 px сверху вниз.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 1100,
          dur: 125,
          what: "Наведение на день: слой 9 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1800,
          dur: 0,
          what: "Клик по дню: дата сразу пишется в поле «18.11.2026», панель исчезает мгновенно, без обратной анимации; появляется крестик «Очистить».",
        },
      ],
      focus:
        "При открытии фокус остаётся в поле, чтобы можно было печатать. ↓ переводит его в календарь [TODO] в макете нет. После выбора фокус в поле, Esc закрывает панель.",
      reducedMotion: "Панель появляется без масштаба и сдвига; рамка меняется мгновенно.",
      neighbours:
        "Панель лежит поверх контента и не двигает его. Нет места снизу — открывается над полем (proposal).",
      demo: <OpenDemo />,
    },
    {
      id: "type",
      title: "Ввод руками",
      trigger: "набор цифр, Enter или уход из поля",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Цифры и точки вписываются как есть; маски нет, календарь не меняется во время набора.",
          prop: "value",
        },
        {
          at: 1700,
          dur: 0,
          what: "Enter или blur: строка разбирается дд.мм.гггг. Дата верна и не раньше границы — записывается, календарь переходит на месяц этой даты.",
        },
        {
          at: 1700,
          dur: 0,
          what: "Строка не разобралась: в макете значение молча откатывается к прежнему. [TODO] В словаре предложена явная ошибка (см. «Ошибка ввода»).",
        },
      ],
      focus: "Фокус остаётся в поле; Enter не отправляет форму, пока панель открыта.",
      reducedMotion: "Анимации нет.",
      neighbours: "Подсказка под полем не меняется до ошибки.",
      demo: <TypeDemo />,
    },
    {
      id: "error",
      title: "Ошибка ввода",
      trigger: "уход из поля с неверной датой",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Рамка переходит на --danger; фокус-кольцо на 22 % --danger.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Подсказка под полем заменяется причиной, и она объявляется скринридером (role=alert).",
        },
      ],
      focus:
        "Фокус остаётся в поле, а не уходит на соседа; Tab пропускает дальше только после правки или очистки.",
      reducedMotion: "Рамка меняется мгновенно.",
      neighbours:
        "Высота поля не меняется; под ним на строку выше сдвигаются нижние элементы формы — резервировать место под текст ошибки. [TODO]",
      demo: <ErrorDemo />,
    },
  ],
  rules: {
    use: [
      "Подпись «Дата прибытия», а не «Дата»: что именно за дата.",
      "Рядом с полем подсказка формата, пока пользователь не освоился.",
      "Границу min задавать календарём и проверять при вводе: одно правило в обоих местах.",
      "Крестик «Очистить» только у необязательной даты.",
    ],
    avoid: [
      "Ввод по маске с автоподстановкой точек: он ломает исправление в середине.",
      "Открывать панель по наведению.",
      "Хранить дату как строку «14.11.2026»: наружу отдаётся дата, формат — только на экране.",
      "Показывать ошибку красным цветом без текста.",
      "DatePicker для периода: возьмите RangePicker.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "aria-label и подпись",
      text: 'Поле связано с подписью (for / aria-labelledby). Иконка — кнопка с aria-label «Открыть календарь», aria-haspopup="dialog", aria-expanded.',
    },
    {
      kind: "aria",
      title: "aria-invalid + role=alert",
      text: 'При ошибке aria-invalid="true", текст причины связан через aria-describedby и объявляется (role=alert).',
    },
    {
      kind: "aria",
      title: "Панель",
      text: 'role="dialog" с aria-label «Выбор даты»; внутри календарь role=grid (см. Calendar).',
    },
    {
      kind: "key",
      title: "Enter / ↓ / Esc",
      text: "Enter разбирает введённую дату. ↓ из поля — в календарь [TODO]. Esc закрывает панель и оставляет фокус в поле.",
    },
    {
      kind: "focus",
      title: "Порядок Tab",
      text: "Поле → иконка → (панель: календарь, «Сегодня», «Очистить») → крестик → дальше. Панель не ловит фокус: закрывается по уходу из неё.",
    },
    {
      kind: "contrast",
      title: "Текст ошибки",
      text: "Макет красит текст ошибки --danger (#d03538, на белом 4,9:1). В словаре --err-text (#c92a2a, 5,5:1). [TODO] подтвердить.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Панель без анимации, переходы рамки отключены.",
    },
  ],
  tokens: [
    {
      name: "height",
      value: "--h-md 32 px",
      usage: "Высота поля; отступ 0 12 px, зазор 8",
      kind: "size",
    },
    { name: "--r-item", value: "8px", usage: "Радиус поля", kind: "radius" },
    {
      name: "--field / --border",
      value: "#fff / #c6cdd6",
      usage: "Фон и рамка 1 px",
      kind: "color",
    },
    {
      name: "--focus / --selected",
      value: "#00968f / teal 15 %",
      usage: "Рамка и кольцо 3 px в фокусе",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a",
      usage: "Рамка и текст ошибки",
      kind: "color",
    },
    { name: "--r-popover", value: "12px", usage: "Радиус панели", kind: "radius" },
    { name: "--shadow-pop", value: "0 6px 20px …", usage: "Тень панели", kind: "shadow" },
    {
      name: "--dur-f / --ease",
      value: "125 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Рамка и появление панели",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "arrival",
      title: "Дата прибытия",
      stageMinHeight: 400,
      demo: <ArrivalDateExample />,
      code: `const [date, setDate] = useState<Date | null>(inTwoDays);

<DatePicker
  label="Дата прибытия"
  hint="Можно вписать: 14.11.2026"
  value={date}
  onChange={setDate}
  min={today}
  events={shipmentDates}
/>`,
    },
  ],
});

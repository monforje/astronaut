/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import {
  CalendarNote,
  CalendarView,
  DemoCalendar,
  DemoCalendarOut,
  DemoDay,
  EVENTS,
  TODAY,
  addD,
  dayKey,
  fL,
  type DayForce,
} from "./demo";

const NOV = new Date(2026, 10, 1);
const DEC = new Date(2026, 11, 1);
const d = (n: number) => new Date(2026, 10, n);

function RangeDemo() {
  type S = { a: Date | null; b: Date | null; hover: Date | null };
  const caption = (s: S) => {
    const end = s.b ?? s.hover;
    if (!s.a) return "Выберите начало периода";
    if (!end) return "Выберите конец периода";
    const [x, y] = s.a < end ? [s.a, end] : [end, s.a];
    return `${fL(x)} – ${fL(y)} · ${Math.round((y.getTime() - x.getTime()) / 864e5) + 1} дн.`;
  };
  return (
    <Playback<S>
      initial={{ a: null, b: null, hover: null }}
      script={[
        { at: 500, set: { a: d(16) } },
        { at: 900, set: { hover: d(17) } },
        { at: 1150, set: { hover: d(18) } },
        { at: 1400, set: { hover: d(19) } },
        { at: 1650, set: { hover: d(20) } },
        { at: 2100, set: { b: d(20), hover: null } },
      ]}
      tail={1200}
      hint="Клик по началу, наведение подсвечивает полосу, второй клик фиксирует конец."
      render={(s) => (
        <div className="ds-cal-wrap">
          <CalendarView
            view={NOV}
            mode="range"
            a={s.a}
            b={s.b}
            hover={s.hover}
            events={EVENTS}
            force={s.a && !s.b && s.hover ? { [dayKey(s.hover)]: "hover" } : {}}
          />
          <div className="ds-cal-out">{caption(s)}</div>
        </div>
      )}
    />
  );
}

function MonthDemo() {
  return (
    <Playback<{ view: Date; dir?: "next" | "prev" }>
      initial={{ view: NOV }}
      script={[
        { at: 600, set: { view: DEC, dir: "next" } },
        { at: 1800, set: { view: NOV, dir: "prev" } },
      ]}
      tail={900}
      hint="Сетка въезжает на 12 px со стороны направления и проявляется; заголовок меняется сразу."
      render={(s) => <CalendarView view={s.view} dir={s.dir} events={EVENTS} a={TODAY} />}
    />
  );
}

function PickDemo() {
  type S = { a: Date | null; f?: DayForce };
  return (
    <Playback<S>
      initial={{ a: TODAY }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 900, set: { f: "active" } },
        { at: 1100, set: { a: d(18), f: "hover" } },
        { at: 1900, set: { f: undefined } },
      ]}
      tail={700}
      render={(s) => (
        <CalendarView
          view={NOV}
          a={s.a}
          events={EVENTS}
          force={s.f ? { [dayKey(d(18))]: s.f } : {}}
        />
      )}
    />
  );
}

function KeyDemo() {
  type S = { f: Date; view: Date; dir?: "next" | "prev" };
  const seq: [number, S][] = [
    [500, { f: d(13), view: NOV }],
    [1000, { f: d(20), view: NOV }],
    [1500, { f: d(27), view: NOV }],
    [2000, { f: new Date(2026, 11, 4), view: DEC, dir: "next" }],
  ];
  return (
    <Playback<S>
      initial={{ f: TODAY, view: NOV }}
      script={seq.map(([at, set]) => ({ at, set }))}
      tail={900}
      hint="→  ↓  ↓  ↓: фокус идёт по неделям; через край месяца календарь листается сам."
      render={(s) => (
        <CalendarView
          view={s.view}
          dir={s.dir}
          a={TODAY}
          events={EVENTS}
          focusDate={s.f}
          force={{ [dayKey(s.f)]: "focus" }}
        />
      )}
    />
  );
}

export default defineDoc({
  id: "calendar",
  title: "Calendar",
  group: "time",
  cssPrefix: "ds-cal",
  order: 10,
  keywords: [
    "календарь",
    "даты",
    "дата",
    "период",
    "диапазон",
    "месяц",
    "неделя",
    "выбор даты",
    "день",
    "calendar",
    "date",
    "dates",
    "range",
    "month",
    "grid",
    "day picker",
    "schedule",
  ],
  summary:
    "Сетка месяца 7 × 6 с неделей с понедельника: одна дата или период, точки событий, недоступные дни. Основа DatePicker и RangePicker.",
  purpose:
    "Календарь показывает месяц целиком и даёт выбрать день (single) или два конца периода (range). Сам по себе он лежит на карточке; в полях его открывают DatePicker и RangePicker. Выбор не сопровождается подтверждением: клик — это выбор, подтверждение добавляет контейнер.",
  related: ["date-picker", "range-picker", "week-agenda", "time-picker"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-cal__head", side: "l" },
          { n: 2, anchor: ".ds-cal__grid > .ds-cal__row:first-child", side: "l" },
          { n: 3, anchor: ".ds-cal__d[data-sel]", side: "r" },
          { n: 4, anchor: ".ds-cal__row:nth-child(5) .ds-cal__ev", side: "r" },
        ]}
      >
        <DemoCalendar initial={d(15)} />
      </Marks>
    ),
    parts: [
      {
        name: "Шапка: стрелки и месяц",
        description:
          "Две кнопки-стрелки 28 px и «Ноябрь 2026» Onest 700 по центру. Заголовок — aria-live=polite: смена месяца озвучивается.",
      },
      {
        name: "Дни недели",
        description: "Пн–Вс, 11 px, 600, цвет --text-3. Неделя начинается с понедельника.",
      },
      {
        name: "День",
        description:
          "Кнопка 34 px высотой, радиус 8, цифры tabular-nums. Соседние месяцы показаны блёклым цветом и тоже выбираются.",
      },
      {
        name: "Точки событий",
        description:
          "До трёх точек 4 px --orange под числом в самом низу ячейки. На выбранном дне — цвет --on-primary.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "single",
      title: "Одна дата",
      description:
        "Выбранный день — заливка --primary, цифра жирная. Клик по дню соседнего месяца переключает месяц.",
      when: "дата прибытия, срок, дата документа.",
      demo: <DemoCalendarOut />,
    },
    {
      id: "range",
      title: "Период",
      description:
        "Первый клик — начало, при наведении подсвечивается полоса до курсора, второй клик — конец. Третий клик начинает период заново. Края перепутаны? Они меняются местами.",
      when: "отчёты, фильтр по дате, окно прибытия.",
      demo: <DemoCalendarOut mode="range" />,
    },
    {
      id: "events",
      title: "С событиями",
      description:
        "Точки на днях с событиями (в макете у single-календаря: +1, +3, +3, +8, +12 дней от сегодня).",
      demo: <DemoCalendar initial={TODAY} events={EVENTS} />,
    },
    {
      id: "limits",
      title: "С границами",
      description:
        "min/max: дни вне границ недоступны, но остаются в сетке, чтобы месяц не «прыгал».",
      when: "дата не может быть раньше сегодняшней.",
      demo: <DemoCalendar initial={addD(TODAY, 2)} min={TODAY} events={[]} />,
    },
  ],
  sizes: [
    {
      id: "size",
      title: "Размеры",
      value: "288 px · день 34 px",
      note: "ширина 288 при отступе 12; кнопки шапки 28 (в макете 20 px) [TODO] подтвердить",
      demo: <DemoCalendar initial={TODAY} events={[]} />,
    },
  ],
  extra: [
    {
      id: "day-kinds",
      title: "Состояния дня",
      content: (
        <div className="dx-grid dx-grid--states">
          {[
            ["Обычный", <DemoDay key="a" />],
            ["Сегодня", <DemoDay key="b" kind="today" />],
            ["Выбран", <DemoDay key="c" kind="selected" />],
            ["Сегодня и выбран", <DemoDay key="d" kind="today-selected" />],
            ["В периоде", <DemoDay key="e" kind="range" />],
            ["Начало периода", <DemoDay key="f" kind="start" />],
            ["Конец периода", <DemoDay key="g" kind="end" />],
            ["Соседний месяц", <DemoDay key="h" kind="out" />],
            ["Недоступен", <DemoDay key="i" kind="disabled" />],
            ["С событиями", <DemoDay key="j" kind="event" />],
          ].map(([t, demo]) => (
            <article className="dx-state" key={String(t)}>
              <div className="dx-canvas">{demo}</div>
              <div className="dx-state__cap">
                <b>{t}</b>
              </div>
            </article>
          ))}
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Обычный день",
      note: "Без фона, цифра --text.",
      demo: <DemoDay />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Слой 9 % (--layer-2). У выбранного дня заливка темнеет на 12 % navy.",
      forced: true,
      demo: <DemoDay force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 12 % (--layer-3).",
      forced: true,
      demo: <DemoDay force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо --focus 2 px внутрь ячейки (offset −2), чтобы не обрезалось соседями.",
      forced: true,
      demo: <DemoDay force="focus" />,
    },
    {
      id: "selected",
      kind: "selected",
      title: "Selected",
      note: "Заливка --primary, цифра --on-primary, жирная; aria-selected=true.",
      demo: <DemoDay kind="selected" />,
    },
    {
      id: "today",
      kind: "other",
      title: "Today",
      note: "Кольцо 1,5 px --text-3 внутрь и жирная цифра; aria-current=date. У выбранного кольцо убирается.",
      demo: <DemoDay kind="today" />,
    },
    {
      id: "in-range",
      kind: "selected",
      title: "In-range",
      note: "Подложка --selected без скругления; края периода — заливка с радиусом 8 с одной стороны.",
      demo: <DemoDay kind="range" />,
    },
    {
      id: "outside",
      kind: "other",
      title: "Outside",
      note: "День соседнего месяца: цифра затухает до 75 % --text-3 (3,3:1 в светлой, около 5:1 в тёмной). Клик выбирает его и переключает месяц.",
      demo: <DemoDay kind="out" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Цифра --text-ph, прозрачность 60 %, без hover. aria-disabled, а не disabled: клавиатура проходит через такие дни.",
      demo: <DemoDay kind="disabled" />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: события месяца ещё грузятся. Дни — серые кружки-заглушки; выбор заблокирован. В макете нет.",
      demo: (
        <div className="ds-cal ds-cal--loading" style={{ width: 132, padding: 0 }} aria-busy="true">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)" }}>
            {[1, 2, 3].map((n) => (
              <span className="ds-cal__d" key={n}>
                {n}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: не загрузились события месяца — календарь работает без точек, сверху строка «События не загрузились» с кнопкой «Повторить». Ошибка выбора — в поле (DatePicker).",
      demo: <CalendarNote title="События не загрузились" text="Даты выбирать можно" />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: в месяце нет событий — точек нет, под календарём «Событий нет». Сам календарь пустым не бывает.",
      demo: <CalendarNote title="Событий нет" text="Ноябрь 2026" />,
    },
  ],
  choreography: [
    {
      id: "range",
      title: "Выбор периода с подсветкой",
      trigger: "клик по первому дню, наведение, клик по второму",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Клик по началу: день заливается --primary, у него левое скругление; подпись «Выберите конец периода».",
          prop: "background",
          easing: "ease",
        },
        {
          at: 400,
          dur: 125,
          what: "Курсор идёт по дням: между началом и курсором встаёт полоса --selected; день под курсором — заливка края. Полоса следует за курсором, назад — тоже.",
          prop: "background, border-radius",
          easing: "ease",
        },
        {
          at: 1600,
          dur: 125,
          what: "Клик по концу: полоса остаётся, подпись «16 ноября – 20 ноября · 5 дн.». Если конец раньше начала, края меняются местами.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 2400,
          dur: 0,
          what: "Третий клик: полоса исчезает мгновенно, новый день — начало.",
        },
      ],
      focus:
        "Фокус остаётся на нажатом дне. [TODO] В макете календарь перерисовывается целиком при каждом наведении, и фокус теряется, а плавных переходов полосы нет: переход 125 мс и сохранение фокуса — решение словаря.",
      reducedMotion: "Переходы фона отключены: полоса меняется мгновенно.",
      neighbours:
        "Сетка не двигается; меняется только фон дней. Месяц не листается, пока курсор в пределах сетки.",
      demo: <RangeDemo />,
    },
    {
      id: "pick",
      title: "Выбор одной даты",
      trigger: "наведение, нажатие, отпускание на дне",
      origin: "mockup",
      steps: [
        { at: 0, dur: 125, what: "Hover: фон дня — слой 9 %.", prop: "background", easing: "ease" },
        { at: 500, dur: 125, what: "Active: слой 12 %.", prop: "background", easing: "ease" },
        {
          at: 700,
          dur: 125,
          what: "Выбор: день заливается --primary, цифра становится жирной; прежний выбранный день теряет заливку в тот же момент.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 0,
          what: "Подпись под календарём обновляется («Выбрано: 18 ноября 2026»), объявляется aria-live.",
        },
      ],
      focus: "Фокус остаётся на выбранном дне (roving tabindex переходит на него).",
      reducedMotion: "Фон меняется без перехода.",
      neighbours:
        "Соседние дни не реагируют. День другого месяца: после клика сетка сменяется (см. «Смена месяца»).",
      demo: <PickDemo />,
    },
    {
      id: "month",
      title: "Смена месяца",
      trigger: "стрелка шапки, PageUp / PageDown, клик по дню соседнего месяца",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Заголовок и aria-live меняются сразу: «Декабрь 2026».",
        },
        {
          at: 0,
          dur: 200,
          what: "Новая сетка входит со стороны направления: сдвиг 12 px → 0 и прозрачность 0 → 1. Старой сетки на экране нет: без перекрёстного затухания, чтобы высота не прыгала.",
          prop: "translate, opacity",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус не теряется: при листании мышью остаётся на стрелке, при листании с клавиатуры идёт на тот же номер дня нового месяца.",
      reducedMotion: "Сетка меняется без сдвига и затухания.",
      neighbours:
        "Размер календаря не меняется: всегда 6 недель (42 дня), высота постоянна. В макете смена мгновенная. [TODO] подтвердить анимацию.",
      demo: <MonthDemo />,
    },
    {
      id: "keys",
      title: "Клавиатура и фокус",
      trigger: "Tab в сетку, стрелки, Home / End, PageUp / PageDown",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: фокус входит в сетку одним стопом на выбранный день (или на сегодня): roving tabindex.",
          prop: "outline",
        },
        {
          at: 500,
          dur: 0,
          what: "← → ±1 день, ↑ ↓ ±7 дней: кольцо фокуса переезжает сразу, без анимации.",
        },
        {
          at: 2000,
          dur: 200,
          what: "Выход за край месяца: календарь листается, фокус стоит на нужном дне нового месяца.",
          prop: "translate, opacity",
          easing: "--ease",
        },
        {
          at: 2400,
          dur: 0,
          what: "Enter / Space выбирает день. Home / End — начало и конец недели, Shift+PageUp/PageDown — год.",
        },
      ],
      focus:
        "Один стоп в Tab; внутри сетки — стрелки. Недоступные дни фокусируются, но не выбираются.",
      reducedMotion: "Листание без анимации; кольцо и так не анимируется.",
      neighbours:
        "Другие дни не меняются. [TODO] В макете клавиатуры нет: всё поведение предложено по ARIA Authoring Practices (date picker dialog).",
      demo: <KeyDemo />,
    },
  ],
  rules: {
    use: [
      "Недели с понедельника, названия месяцев по-русски: «Ноябрь 2026».",
      "Всегда 6 недель: высота календаря не меняется от месяца к месяцу.",
      "Для периода показывать длину под календарём («5 дн.») и подсказку, пока конец не выбран.",
      "Недоступные дни оставлять в сетке: так понятно, почему выбрать нельзя.",
      "Точки событий дополнять текстом в aria-label дня («событий: 2»).",
    ],
    avoid: [
      "Рисовать календарь без сегодняшнего дня: ориентир нужен всегда.",
      "Прятать недоступные дни или переносить числа: сетка не должна смещаться.",
      "Подтверждать выбор одной даты отдельной кнопкой: подтверждает контейнер, если нужно.",
      "Кодировать событие только цветом точки: у неё контраст ниже 3:1 на светлом фоне.",
      "Использовать календарь вместо поля ввода даты, если дату проще напечатать («14.11.2026»).",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="grid"',
      text: 'Сетка — role="grid" с aria-label «Календарь, Ноябрь 2026»; строки role="row", ячейки role="gridcell" с aria-selected, заголовки дней role="columnheader". У периода aria-multiselectable.',
    },
    {
      kind: "aria",
      title: "Подпись дня",
      text: 'У каждой кнопки aria-label: «четверг, 12 ноября 2026 г., сегодня, событий: 2». Сегодняшний день — aria-current="date". Недоступный — aria-disabled="true".',
    },
    {
      kind: "aria",
      title: "aria-live",
      text: 'Название месяца в шапке — aria-live="polite": смена месяца и подпись «Выбрано…» озвучиваются.',
    },
    {
      kind: "key",
      title: "← → ↑ ↓",
      text: "Фокус на ±1 день и ±7 дней. Выход за границу месяца листает календарь.",
    },
    {
      kind: "key",
      title: "Home / End",
      text: "К понедельнику и воскресенью текущей недели.",
    },
    {
      kind: "key",
      title: "PageUp / PageDown",
      text: "Предыдущий и следующий месяц, тот же номер дня (или последний день). С Shift — год.",
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "Выбрать день. В режиме периода первое нажатие — начало, второе — конец.",
    },
    {
      kind: "focus",
      title: "Roving tabindex",
      text: "Из сетки в Tab входит один день: выбранный, иначе сегодняшний, иначе 1-е число. Стрелки шапки — отдельные стопы до сетки.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Цифра --text на --surface 16,5:1; выбранный день: navy на teal 7,4:1. Соседний месяц: 75 % --text-3 на --surface, 3,3:1 в светлой теме и около 5:1 в тёмной — затухание осознанное: день вне месяца второстепенен, но остаётся читаемым (не ниже 3:1); текст выбранного, сегодняшнего и обычных дней — от 4,5:1. Точка события orange на белом 2,5:1 — меньше 3:1 для значков, поэтому дублируется в aria-label.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Листание месяцев и переходы фона отключаются, смена мгновенная.",
    },
  ],
  tokens: [
    { name: "width / padding", value: "288 / 12 px", usage: "Размер календаря", kind: "size" },
    {
      name: "day",
      value: "34 px · --r-item 8px",
      usage: "Высота дня; радиус края периода тот же",
      kind: "size",
    },
    {
      name: "--primary / --on-primary",
      value: "teal / navy",
      usage: "Выбранный день и края периода",
      kind: "color",
    },
    { name: "--selected", value: "teal 15 % на --surface", usage: "Полоса периода", kind: "color" },
    {
      name: "--layer-2 / --layer-3",
      value: "ink 9 % / 12 %",
      usage: "Hover и active дня",
      kind: "color",
    },
    {
      name: "--text-3",
      value: "#66727f / #a0adbb",
      usage: "Кольцо «сегодня», дни недели",
      kind: "color",
    },
    {
      name: "--text-ph",
      value: "#8792a0 / #7f8c9b",
      usage: "Недоступные дни",
      kind: "color",
    },
    { name: "--orange", value: "#f08a24", usage: "Точки событий 4 px", kind: "color" },
    { name: "--focus", value: "#00968f / teal", usage: "Кольцо фокуса 2 px внутрь", kind: "color" },
    {
      name: "--dur-f / --dur",
      value: "125 / 200 мс",
      usage: "Фон дня · смена месяца",
      kind: "time",
    },
    { name: "--ease", value: "cubic-bezier(.6,0,.05,.95)", usage: "Смена месяца", kind: "ease" },
  ],
  examples: [
    {
      id: "single",
      title: "Одна дата",
      demo: <DemoCalendarOut />,
      code: `<Calendar value={date} onChange={setDate} events={eventDates} />`,
    },
    {
      id: "range",
      title: "Период",
      demo: <DemoCalendarOut mode="range" />,
      code: `<Calendar mode="range" value={range} onChange={setRange} min={today} />`,
    },
  ],
});

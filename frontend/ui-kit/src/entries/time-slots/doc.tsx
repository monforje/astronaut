/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { ALL, DemoSlot, DemoSlots, DemoSlotsLive } from "./demo";

function PickDemo() {
  type S = { sel: string | null; f?: "hover" | "active" };
  return (
    <Playback<S>
      initial={{ sel: "11:30" }}
      script={[
        { at: 500, set: { f: "hover" } },
        { at: 1000, set: { f: "active" } },
        { at: 1200, set: { sel: "14:00", f: "hover" } },
        { at: 2000, set: { f: undefined } },
      ]}
      tail={800}
      hint="Выбор переносит подсветку на другой слот и обновляет подпись «Выбрано»."
      render={(s) => <DemoSlots selected={s.sel} force={s.f ? { "14:00": s.f } : {}} />}
    />
  );
}

function LoadDemo() {
  type S = { st: "loading" | "ready"; enter?: boolean };
  return (
    <Playback<S>
      initial={{ st: "loading" }}
      script={[{ at: 1200, set: { st: "ready", enter: true } }]}
      tail={1500}
      hint="Предложение: слоты проявляются слева направо с шагом 18 мс; выбранного нет."
      render={(s) => <DemoSlots state={s.st} enter={s.enter} selected={null} />}
    />
  );
}

export default defineDoc({
  id: "time-slots",
  title: "Слоты времени",
  group: "time",
  cssPrefix: "ds-slots",
  order: 50,
  keywords: [
    "слоты",
    "слот",
    "время",
    "запись",
    "окно",
    "окно приёмки",
    "приёмка",
    "бронирование",
    "свободное время",
    "занято",
    "slots",
    "time slots",
    "timeslot",
    "booking",
    "appointment",
    "availability",
  ],
  summary:
    "Сетка кнопок-слотов 4 в ряд: выберите одно время из свободных, занятые перечёркнуты. Под сеткой строка «Выбрано: 11:30».",
  purpose:
    "Слоты показывают, какое время уже занято, поэтому подходят для записи на приёмку и окон терминала. Если время произвольное, берите TimePicker. Слот — одна кнопка-переключатель; выбрать можно только один. Шаг в макете 30 минут, с 09:00 до 16:30.",
  related: ["time-picker", "date-picker", "week-agenda", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-slots__slot:first-child", side: "t" },
          { n: 2, anchor: ".ds-slots__slot:disabled", side: "t" },
          { n: 3, anchor: ".ds-slots__out", side: "b" },
        ]}
      >
        <DemoSlots />
      </Marks>
    ),
    parts: [
      {
        name: "Слот",
        description:
          "Кнопка 32 px, радиус 8, рамка 1 px, время Onest 600 tabular-nums. Сетка 4 колонки, зазор 8.",
      },
      {
        name: "Занятый слот",
        description:
          "disabled: рамка --divider, текст --text-ph, время перечёркнуто, фона нет. Остаётся в сетке, чтобы было видно, что занято.",
      },
      {
        name: "Подпись выбора",
        description: "Под сеткой «Выбрано: 11:30» или «Время не выбрано», --text-3, aria-live.",
      },
    ],
  },
  variants: [
    {
      id: "default",
      title: "Четыре в ряд",
      description:
        "16 слотов с 09:00 до 16:30 через 30 минут; занятые: 10:00, 10:30, 13:00, 15:30.",
      when: "один день, до 24 слотов.",
      demo: <DemoSlotsLive />,
    },
    {
      id: "cols3",
      title: "Три в ряд",
      description:
        "Предложение: узкая колонка (карточка шириной до 260 px) — три слота в ряд, всё остальное то же.",
      demo: (
        <DemoSlots cols={3} slots={ALL.slice(0, 9)} selected="10:00" taken={["10:30", "12:00"]} />
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Свободный слот: белая поверхность, рамка --border.",
      demo: <DemoSlot />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Слой 4 % и рамка --text-3.",
      forced: true,
      demo: <DemoSlot force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 7 %.",
      forced: true,
      demo: <DemoSlot force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо --focus 2 px с отступом 1 px.",
      forced: true,
      demo: <DemoSlot force="focus" />,
    },
    {
      id: "selected",
      kind: "selected",
      title: "Selected",
      note: "aria-pressed=true: фон --selected, рамка --border-selected, текст --link-strong.",
      demo: <DemoSlot selected />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled · занят",
      note: "Перечёркнутое время, рамка --divider, текст --text-ph. Нажатие и hover не действуют.",
      demo: <DemoSlot disabled />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: восемь серых плиток 32 px с мерцанием; выбор заблокирован. В макете слоты готовы сразу.",
      demo: (
        <div style={{ width: 180 }}>
          <DemoSlots state="loading" cols={3} />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: серая плашка «Слоты не загрузились» и кнопка «Повторить». role=alert.",
      demo: (
        <div style={{ width: 200 }}>
          <DemoSlots state="error" />
        </div>
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: все слоты заняты — плашка «Свободных слотов нет» и совет выбрать другую дату.",
      demo: (
        <div style={{ width: 200 }}>
          <DemoSlots state="empty" />
        </div>
      ),
    },
  ],
  choreography: [
    {
      id: "pick",
      title: "Выбор слота",
      trigger: "наведение, нажатие, отпускание",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: слой 4 %, рамка темнеет до --text-3.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        { at: 500, dur: 125, what: "Active: слой 7 %.", prop: "background", easing: "ease" },
        {
          at: 700,
          dur: 125,
          what: "Выбор: слот заливается --selected с рамкой; прежний слот в тот же момент возвращается к обычному виду.",
          prop: "background, box-shadow, color",
          easing: "ease",
        },
        {
          at: 700,
          dur: 0,
          what: "Подпись под сеткой меняется мгновенно: «Выбрано: 14:00»; объявляется aria-live.",
        },
      ],
      focus: "Фокус остаётся на нажатом слоте. Занятые слоты фокус не получают (disabled).",
      reducedMotion: "Фон и рамка меняются без перехода.",
      neighbours:
        "Сетка не двигается, остальные слоты не реагируют. Повторный клик по выбранному не снимает выбор [TODO] подтвердить: в макете так.",
      demo: <PickDemo />,
    },
    {
      id: "load",
      title: "Слоты загрузились",
      trigger: "смена даты или первая загрузка",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "На месте сетки восемь заглушек, мерцание 1,4 с; подпись «Время не выбрано».",
        },
        {
          at: 1200,
          dur: 200,
          what: "Слоты проявляются слева направо с задержкой 18 мс на слот: прозрачность 0→1, сдвиг 4 px снизу.",
          prop: "opacity, translate",
          easing: "--ease",
        },
        { at: 1200, dur: 0, what: "Выбор сброшен: при смене даты прежнее время недействительно." },
      ],
      focus:
        "Фокус остаётся на элементе, из которого запрошена загрузка (поле даты), не переходит на слоты.",
      reducedMotion: "Слоты появляются сразу, без сдвига; заглушки не мерцают.",
      neighbours: "Высота сетки резервируется (две строки), чтобы подпись не прыгала.",
      demo: <LoadDemo />,
    },
  ],
  rules: {
    use: [
      "Показывать занятые слоты перечёркнутыми: видно, что время было, но уже занято.",
      "Время в слотах — в часовом поясе терминала, и подписать его рядом с датой [TODO] нет в макете.",
      "Один день на один набор слотов; смена даты сбрасывает выбор.",
      "Подпись «Выбрано: …» оставить: на слотах без неё выбор виден только цветом.",
    ],
    avoid: [
      "Скрывать занятые слоты: сетка меняется от дня к дню и сбивает привычку.",
      "Больше 24 слотов в одной сетке: берите TimePicker или разбейте на периоды дня.",
      "Мультивыбор: слоты выбирают по одному; для интервалов — пара TimePicker.",
      "Показывать слот как disabled без причины, если занят он другим человеком — добавьте подсказку.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "aria-pressed",
      text: 'В макете слот — кнопка-переключатель с aria-pressed. [TODO] Предложение: для выбора одного значения точнее role="radiogroup" с role="radio" и aria-checked, стрелками между слотами и одним стопом в Tab.',
    },
    {
      kind: "aria",
      title: "Группа",
      text: 'Сетка — role="group" с aria-label («Время приёмки»); aria-busy при загрузке. Подпись выбора — aria-live="polite".',
    },
    {
      kind: "aria",
      title: "Занятый слот",
      text: "disabled, и причина текстом: например title/aria-label «10:00, занято». Перечёркивание цвет не заменяет.",
    },
    {
      kind: "key",
      title: "Tab / Enter / Space",
      text: "Каждый свободный слот — стоп в Tab; Enter и Space выбирают. В radiogroup (предложение) — стрелки.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Выбранный: --link-strong на --selected не ниже 5,5:1 [TODO] проверить расчётом. Занятый --text-ph на белом 3,2:1: допустимо для недоступного, но причина дублируется текстом.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы фона и проявление слотов отключаются, заглушки не мерцают.",
    },
  ],
  tokens: [
    {
      name: "slot",
      value: "32 px · --r-item 8px",
      usage: "Высота и радиус слота; зазор 8, сетка 4 колонки",
      kind: "size",
    },
    {
      name: "--border / --divider",
      value: "#c6cdd6 / #e0e4e9",
      usage: "Рамка свободного и занятого",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % · teal 60 %",
      usage: "Выбранный слот",
      kind: "color",
    },
    {
      name: "--link-strong",
      value: "#006662 / teal",
      usage: "Время выбранного слота",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0 / #7f8c9b", usage: "Занятый слот", kind: "color" },
    {
      name: "--layer-1 / --layer-1p",
      value: "ink 4 % / 7 %",
      usage: "Hover и active",
      kind: "color",
    },
    { name: "--dur-f", value: "125 мс", usage: "Смена фона и рамки", kind: "time" },
  ],
  examples: [
    {
      id: "booking",
      title: "Запись на приёмку",
      demo: (
        <div style={{ display: "grid", gap: 8, width: 320 }}>
          <b>Выберите время приёмки</b>
          <DemoSlotsLive />
        </div>
      ),
      code: `<TimeSlots slots={slots} taken={taken} value={time} onChange={setTime} />`,
    },
  ],
});

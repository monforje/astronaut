/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoTimeField, DemoTimePanel, DemoTimePicker, TerminalWindowExample } from "./demo";

const Stage = ({ children }: { children: ReactNode }) => (
  <div className="ds-timepicker__stage">{children}</div>
);

function ArrowsDemo() {
  type S = { h: number; m: number; seg?: "h" | "m" };
  return (
    <Playback<S>
      initial={{ h: 9, m: 30 }}
      script={[
        { at: 400, set: { seg: "h" } },
        { at: 800, set: { h: 10 } },
        { at: 1100, set: { h: 11 } },
        { at: 1500, set: { seg: "m" } },
        { at: 1800, set: { m: 35 } },
        { at: 2100, set: { m: 40 } },
        { at: 2500, set: { seg: undefined } },
      ]}
      tail={600}
      hint="↑ ↓ в часах: ±1. В минутах: ±5 (шаг step). Значение меняется сразу."
      render={(s) => (
        <DemoTimeField h={s.h} m={s.m} force={s.seg ? "focus" : undefined} segFocus={s.seg} />
      )}
    />
  );
}

function ListDemo() {
  type S = { open: boolean; h: number; m: number; hh?: number; hm?: number };
  return (
    <Playback<S>
      initial={{ open: false, h: 9, m: 30 }}
      script={[
        { at: 400, set: { open: true } },
        { at: 1200, set: { hm: 45 } },
        { at: 1600, set: { m: 45, hm: undefined } },
        { at: 2100, set: { hh: 14 } },
        { at: 2500, set: { h: 14, hh: undefined } },
        { at: 3300, set: { open: false } },
      ]}
      tail={800}
      hint="Выбор в столбце сразу пишется в поле; панель остаётся открытой до «Готово»."
      render={(s) => (
        <Stage>
          <div className="ds-datepicker__anchor" style={{ width: 170 }}>
            <DemoTimeField h={s.h} m={s.m} open={s.open} force={s.open ? "focus" : undefined} />
            <div className="ds-timepicker__drop" data-open={s.open}>
              <DemoTimePanel isStatic h={s.h} m={s.m} hoverH={s.hh} hoverM={s.hm} />
            </div>
          </div>
        </Stage>
      )}
    />
  );
}

function ClampDemo() {
  type S = { v: string; ok: boolean };
  return (
    <Playback<S>
      initial={{ v: "09", ok: false }}
      script={[
        { at: 500, set: { v: "7" } },
        { at: 900, set: { v: "75" } },
        { at: 1500, set: { v: "23", ok: true } },
      ]}
      tail={900}
      hint="Введено 75: при уходе из сегмента значение прижимается к 23 (часы) или 59 (минуты)."
      render={(s) => (
        <DemoTimeField
          h={s.ok ? 23 : 9}
          m={30}
          force="focus"
          segFocus="h"
          label={s.ok ? "Прижато к 23" : `Набрано: ${s.v}`}
        />
      )}
    />
  );
}

export default defineDoc({
  id: "time-picker",
  title: "TimePicker",
  group: "time",
  cssPrefix: "ds-timepicker",
  order: 40,
  keywords: [
    "время",
    "часы",
    "минуты",
    "поле времени",
    "ввод времени",
    "выбор времени",
    "начало приёмки",
    "режим работы",
    "time",
    "time picker",
    "timepicker",
    "time input",
    "clock",
    "hours",
    "minutes",
  ],
  summary:
    "Поле времени «09:30» из двух сегментов: стрелки ↑↓ меняют часы и минуты (шаг 5), иконка часов открывает два столбца со списками.",
  purpose:
    "TimePicker нужен для точного времени: окно работы, приёмка, начало смены. Для выбора из готовых вариантов (занятые слоты) берите «Слоты времени». Время всегда 24-часовое, часы и минуты вводятся и листаются независимо. Пара полей «С» и «До» — две отдельные копии, связь между ними — забота формы.",
  related: ["date-picker", "time-slots", "calendar", "input"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-datepicker__label", side: "t" },
          { n: 2, anchor: ".ds-datepicker__lead", side: "l" },
          { n: 3, anchor: ".ds-timepicker__num", side: "t" },
          { n: 4, anchor: ".ds-timepicker__num:last-of-type", side: "b" },
        ]}
      >
        <div style={{ width: 140 }}>
          <DemoTimeField />
        </div>
      </Marks>
    ),
    parts: [
      { name: "Подпись", description: "«С», «До», «Начало приёмки» — 12 px, 600, над полем." },
      {
        name: "Иконка часов",
        description: "Кнопка слева, открывает список. Цвет --text-3, в фокусе --link.",
      },
      {
        name: "Сегмент часов",
        description:
          "Поле шириной 2 символа, цифры tabular-nums по центру. В фокусе подсвечивается --selected.",
      },
      { name: "Сегмент минут", description: "Как часы; двоеточие между ними не фокусируется." },
    ],
  },
  variants: [
    {
      id: "default",
      title: "Одно время",
      description: "Поле 09:30. Шаг минут по умолчанию 5.",
      demo: (
        <div style={{ width: 140 }}>
          <DemoTimeField label="Начало приёмки" />
        </div>
      ),
    },
    {
      id: "pair",
      title: "Пара «С — До»",
      description: "Два поля рядом в сетке 1:1: окно работы 09:00–19:00.",
      when: "интервал внутри одного дня.",
      demo: (
        <div className="ds-timepicker__pair">
          <DemoTimeField label="С" h={9} m={0} />
          <DemoTimeField label="До" h={19} m={0} />
        </div>
      ),
    },
    {
      id: "live",
      title: "Живой",
      description: "Печатайте, листайте стрелками или откройте список.",
      demo: (
        <Stage>
          <div style={{ width: 170 }}>
            <DemoTimePicker defaultOpen />
          </div>
        </Stage>
      ),
    },
    {
      id: "open",
      title: "Список",
      description:
        "Два столбца: 24 часа и 12 значений минут (шаг 5). Выбранное — заливка --primary, список прокручен так, чтобы оно стояло на третьей строке.",
      demo: (
        <div style={{ display: "grid", justifyItems: "start", width: 150 }}>
          <DemoTimePanel h={9} m={30} isStatic />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Рамка --border, фон --field, время --text.",
      demo: <DemoTimeField label="С" />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Рамка --text-3. Hover на пункте списка — слой 9 %.",
      forced: true,
      demo: <DemoTimeField label="С" force="hover" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Рамка --focus, кольцо 3 px --selected, сегмент в фокусе залит --selected.",
      forced: true,
      demo: <DemoTimeField label="С" force="focus" segFocus="h" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет отдельного вида: нажатие на иконку открывает список. У пункта списка — слой 12 %.",
      notApplicable: true,
    },
    {
      id: "open",
      kind: "selected",
      title: "Open",
      note: "Рамка фокуса, aria-expanded у иконки; под полем панель со столбцами.",
      demo: (
        <Stage>
          <div style={{ width: 170 }}>
            <DemoTimeField label="С" open force="focus" />
            <div className="ds-timepicker__drop">
              <DemoTimePanel isStatic h={9} m={30} />
            </div>
          </div>
        </Stage>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Фон прозрачный, рамка --divider, текст --text-ph; сегменты и иконка недоступны.",
      demo: <DemoTimeField label="Недоступно" disabled />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: серая заглушка вместо времени.",
      demo: <DemoTimeField label="С" loading />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: рамка --danger и причина («Конец раньше начала»). В макете у времени ошибок нет.",
      demo: <DemoTimeField label="До" h={8} m={0} invalid error="Конец раньше начала" />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: «––:––» цветом --text-ph. В макете у поля всегда есть значение.",
      demo: <DemoTimeField label="С" empty />,
    },
  ],
  choreography: [
    {
      id: "arrows",
      title: "Стрелки в сегменте",
      trigger: "фокус в сегмент, ↑ или ↓",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Фокус в сегмент: цифры выделяются целиком, сегмент заливается --selected.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 400,
          dur: 0,
          what: "↑ в часах: +1, после 23 идёт 00 (по кругу). ↓ — наоборот. Значение меняется сразу, без анимации счёта.",
        },
        {
          at: 1100,
          dur: 0,
          what: "В минутах ±5, после 55 идёт 00. [TODO] В макете минуты не переносят час; если нужен перенос, это решение формы.",
        },
      ],
      focus:
        "Фокус остаётся в сегменте; Tab переходит часы → минуты → иконка. Фокус в сегмент выделяет его цифры.",
      reducedMotion: "Подсветка сегмента без перехода.",
      neighbours: "Соседнее поле пары («До») не пересчитывается.",
      demo: <ArrowsDemo />,
    },
    {
      id: "list",
      title: "Список времени",
      trigger: "клик по иконке часов, клик по пункту, «Готово»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Панель всплывает под полем: прозрачность 0→1, масштаб .96→1, сдвиг 4 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Столбцы прокручены так, чтобы выбранное стояло на третьей строке (scrollTop = смещение − 80 px). В макете мгновенно.",
        },
        {
          at: 800,
          dur: 125,
          what: "Наведение на пункт: слой 9 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1200,
          dur: 125,
          what: "Клик по пункту: заливка --primary переезжает, поле меняется сразу. Панель остаётся открытой, можно выбрать минуты.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 2900,
          dur: 0,
          what: "«Готово»: панель исчезает мгновенно. «Сейчас» ставит текущее время (минуты округлены к шагу) и закрывает панель.",
        },
      ],
      focus:
        "Фокус остаётся на поле; панель управляется мышью. [TODO] Клавиатура внутри списка в макете не описана: предложение — ↑↓ по пунктам столбца, ←→ между столбцами, Enter выбирает.",
      reducedMotion: "Панель без анимации; прокрутка к выбранному мгновенная.",
      neighbours: "Панель лежит поверх, ширина по столбцам (около 150 px). Поле остаётся открытым.",
      demo: <ListDemo />,
    },
    {
      id: "clamp",
      title: "Ввод и прижим значения",
      trigger: "набор цифр, уход из сегмента",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Набор разрешён любой, не больше двух символов; ничего не пересчитывается.",
        },
        {
          at: 1000,
          dur: 0,
          what: "change: значение прижимается к диапазону (часы 0–23, минуты 0–59); нецифры и пустая строка дают 00.",
        },
      ],
      focus: "Фокус остаётся в сегменте до Tab.",
      reducedMotion: "Анимации нет.",
      neighbours:
        "Другой сегмент не меняется. [TODO] Предложение: вместо тихого прижима показывать ошибку «Часы 0–23»; в макете этого нет.",
      demo: <ClampDemo />,
    },
  ],
  rules: {
    use: [
      "24-часовой формат: «09:30», «18:00».",
      "Шаг минут задавать под задачу (5 для приёмки, 15 для смен).",
      "Для пары «С — До» добавлять проверку: конец не раньше начала.",
      "Список — удобство, ввод руками остаётся главным способом.",
    ],
    avoid: [
      "AM/PM и 12-часовой формат.",
      "Секунды в этом поле: для них нужен другой компонент.",
      "Использовать для выбора из занятых окон: берите «Слоты времени».",
      "Тихо менять введённое значение без объяснения.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Подписи сегментов",
      text: "Часы — aria-label «Часы», минуты — «Минуты»; поле целиком связано с подписью («С»). Двоеточие скрыто от скринридера.",
    },
    {
      kind: "key",
      title: "↑ / ↓",
      text: "В фокусе сегмента меняют значение: часы ±1, минуты ±шаг, по кругу.",
    },
    {
      kind: "key",
      title: "Tab",
      text: "Часы → минуты → иконка часов → дальше. Список по Tab не обходится: он закрывается по уходу из панели.",
    },
    {
      kind: "aria",
      title: "Список",
      text: 'Панель — role="dialog", столбцы role="listbox" с пунктами role="option" и aria-selected. [TODO] Клавиатура внутри — предложение.',
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "У сегментов кольца нет, фокус виден по заливке --selected и рамке всего поля (контраст рамки --focus на --field 3,2:1 [TODO] проверить расчётом).",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Панель без анимации, прокрутка к выбранному мгновенная.",
    },
  ],
  tokens: [
    {
      name: "height",
      value: "--h-md 32 px",
      usage: "Высота поля, радиус --r-item 8px",
      kind: "size",
    },
    { name: "segment", value: "2ch", usage: "Ширина сегмента часов и минут", kind: "size" },
    {
      name: "--selected",
      value: "teal 15 % на --surface",
      usage: "Сегмент в фокусе",
      kind: "color",
    },
    {
      name: "list item",
      value: "32 px · колонка 62 × 208",
      usage: "Пункт и столбец списка",
      kind: "size",
    },
    {
      name: "--primary / --on-primary",
      value: "teal / navy",
      usage: "Выбранный пункт списка, «Готово»",
      kind: "color",
    },
    {
      name: "--text-3",
      value: "#66727f / #a0adbb",
      usage: "Иконка и двоеточие между столбцами",
      kind: "color",
    },
    { name: "step", value: "5 мин", usage: "Шаг минут (параметр)", kind: "other" },
    { name: "--dur-f / --ease", value: "125 мс", usage: "Панель и подсветка", kind: "time" },
  ],
  examples: [
    {
      id: "window",
      title: "Окно работы терминала",
      demo: <TerminalWindowExample />,
      code: `const [from, setFrom] = useState("09:00");
const [to, setTo] = useState("19:00");

<TimePicker label="С" value={from} onChange={setFrom} step={5} />
<TimePicker label="До" value={to} onChange={setTo} step={5} />`,
    },
  ],
});

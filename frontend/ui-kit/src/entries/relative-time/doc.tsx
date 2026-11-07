/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoRelRows, DemoRelTime, NOW, ago } from "./demo";

const at = (s: number) => new Date(NOW.getTime() + s * 1000);
const Pad = ({ children }: { children: ReactNode }) => (
  <span style={{ display: "inline-flex", padding: "40px 40px 4px" }}>{children}</span>
);

function TipDemo() {
  return (
    <Playback<{ tip: boolean }>
      initial={{ tip: false }}
      script={[
        { at: 400, set: { tip: true } },
        { at: 1900, set: { tip: false } },
      ]}
      tail={500}
      hint="Подсказка появляется сразу, без задержки; уходит мгновенно."
      render={(s) => (
        <Pad>
          <DemoRelTime date={ago(12 * 60e3)} tip={s.tip} force={s.tip ? "hover" : undefined} />
        </Pad>
      )}
    />
  );
}

function TickDemo() {
  const created = ago(20e3);
  return (
    <Playback<{ s: number }>
      initial={{ s: 0 }}
      script={[
        { at: 700, set: { s: 30 } },
        { at: 1400, set: { s: 60 } },
        { at: 2100, set: { s: 150 } },
        { at: 2800, set: { s: 3600 } },
      ]}
      tail={700}
      hint="Время идёт ускоренно: подпись пересчитывается на границах и меняется мгновенно."
      render={(s) => (
        <span style={{ fontSize: "var(--fs-body)" }}>
          Агент нашёл расхождение · <DemoRelTime date={created} now={at(s.s)} muted />
        </span>
      )}
    />
  );
}

export default defineDoc({
  id: "relative-time",
  title: "Относительное время",
  group: "time",
  cssPrefix: "ds-reltime",
  order: 60,
  keywords: [
    "5 мин назад",
    "только что",
    "вчера",
    "время",
    "относительное время",
    "назад",
    "давность",
    "метка времени",
    "лента",
    "ago",
    "relative",
    "relative time",
    "time ago",
    "timestamp",
    "fromNow",
  ],
  summary:
    "Подпись «5 мин назад» вместо точного времени: только что, минуты, часы, «вчера, 08:15», дальше обычная дата. Полная дата и время — в подсказке.",
  purpose:
    "В ленте событий и в чате важно, насколько свежее событие, а не точная секунда. Относительное время читается быстрее, а точное лежит под рукой в подсказке. Подчёркивание точками сообщает, что у подписи есть подсказка. После двух суток подпись превращается в дату: «7 ноября».",
  related: ["thread", "tooltip", "countdown", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: "time.ds-reltime", side: "b" },
          { n: 2, anchor: ".ds-reltime-stage__tip", side: "t" },
        ]}
      >
        <Pad>
          <DemoRelTime tip />
        </Pad>
      </Marks>
    ),
    parts: [
      {
        name: "Подпись",
        description:
          "Элемент <time> с datetime в ISO. Табулярные цифры, пунктирное подчёркивание 1 px --text-3, курсор help.",
      },
      {
        name: "Подсказка",
        description:
          "«12 ноября 2026, 10:03»: полная дата и время. Появляется по наведению и фокусу.",
      },
    ],
  },
  variants: [
    {
      id: "scale",
      title: "Шкала подписей",
      description:
        "<45 с «только что»; до часа «N мин назад»; до суток «N ч назад»; до двух суток «вчера, чч:мм»; дальше «7 ноября» (год — только если не текущий).",
      demo: (
        <>
          <DemoRelTime date={ago(20e3)} />
          <DemoRelTime date={ago(12 * 60e3)} />
          <DemoRelTime date={ago(3 * 3600e3)} />
          <DemoRelTime date={ago(27 * 3600e3)} />
          <DemoRelTime date={ago(5 * 864e5)} />
        </>
      ),
    },
    {
      id: "feed",
      title: "В ленте",
      description: "Событие слева, время справа цветом --text-3, 12 px.",
      when: "лента событий, список документов.",
      demo: <DemoRelRows />,
    },
    {
      id: "plain",
      title: "Без подсказки",
      description:
        "Предложение: когда полная дата уже рядом (например, в строке сообщения чата), подчёркивания и подсказки нет, тип остаётся <time>.",
      demo: <DemoRelTime date={ago(12 * 60e3)} plain muted />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Текст в цвет окружения, пунктирное подчёркивание --text-3.",
      demo: <DemoRelTime />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Подчёркивание темнеет до --text, над подписью подсказка с полной датой.",
      forced: true,
      demo: (
        <Pad>
          <DemoRelTime tip force="hover" />
        </Pad>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Предложение: подпись фокусируется (tabindex=0), кольцо --focus 2 px, подсказка показывается как при hover.",
      forced: true,
      demo: (
        <Pad>
          <DemoRelTime tip force="focus" />
        </Pad>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Не нажимается. Для перехода к событию кнопкой служит строка, а не время.",
      notApplicable: true,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Нет: время читается всегда. Устаревшее событие — серый цвет (muted).",
      notApplicable: true,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: серая заглушка 64 × 10 px, пока даты нет.",
      demo: <DemoRelTime loading />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: дата не разобралась — «Дата неизвестна» цветом --err-text. В макете нет.",
      demo: <DemoRelTime invalid />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: даты нет — длинное тире «—» цветом --text-ph.",
      demo: <DemoRelTime date={null} />,
    },
  ],
  choreography: [
    {
      id: "tip",
      title: "Подсказка с полной датой",
      trigger: "курсор над подписью или фокус",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подсказка над подписью: прозрачность 0→1, масштаб .96→1, сдвиг 4 px. Пунктир темнеет до --text.",
          prop: "opacity, scale, translate, border-color",
          easing: "--ease",
        },
        {
          at: 1500,
          dur: 0,
          what: "Курсор ушёл, нажатие или прокрутка: подсказка исчезает мгновенно.",
        },
      ],
      focus:
        "Предложение: подпись в Tab (tabindex=0), подсказка от клавиатуры показывается так же; Esc убирает её. В макете подсказка — общая data-tip, от фокуса её нет.",
      reducedMotion: "Подсказка появляется без масштаба и сдвига.",
      neighbours: "Подсказка лежит поверх соседей и ничего не сдвигает.",
      demo: <TipDemo />,
    },
    {
      id: "tick",
      title: "Обновление подписи",
      trigger: "время идёт: граница 45 с, 1 мин, 1 ч, 24 ч",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Подпись пересчитывается по таймеру: раз в 30 с, пока младше часа, раз в минуту до суток, потом раз в час. Текст заменяется мгновенно, без анимации.",
        },
        {
          at: 0,
          dur: 0,
          what: "Скринридеру смена не озвучивается (нет aria-live): датой управляет datetime и aria-label с полной датой.",
        },
      ],
      focus: "Не затрагивается: смена текста не отнимает фокус и не перечитывается.",
      reducedMotion: "Совпадает с обычным поведением: анимации нет.",
      neighbours:
        "Строка может стать на несколько символов длиннее («только что» → «12 мин назад»); справа выровненное время, поэтому слева ничего не сдвигается. В макете подпись не обновляется. [TODO] подтвердить частоты.",
      demo: <TickDemo />,
    },
  ],
  rules: {
    use: [
      "Относительное время для лент и чатов, где важна свежесть; точное время в подсказке.",
      "Использовать <time datetime=…>: дата остаётся машиночитаемой.",
      "После двух суток писать дату: «7 ноября». Год добавлять, только если он не текущий.",
      "Одну и ту же подпись показывать одинаково на всех экранах: «3 ч назад», а не «3 часа назад».",
    ],
    avoid: [
      "Относительное время в документах и таблицах, где дата — часть записи (дата накладной, срок): там точная дата.",
      "Писать «1 мин назад» для 20 секунд: до 45 с — «только что».",
      "Подчёркивание без подсказки: пунктир обещает подсказку.",
      "Обновлять подпись анимацией: цифры не крутить и не мигать.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "<time> и aria-label",
      text: 'Элемент <time datetime="2026-11-12T10:03">. Для скринридера aria-label содержит подпись и полную дату: «12 мин назад, 12 ноября 2026, 10:03».',
    },
    {
      kind: "focus",
      title: "Фокус и подсказка",
      text: "Подпись с подсказкой в Tab (tabindex=0), подсказка по фокусу тоже; Esc убирает её. У подписи без подсказки tabindex нет.",
    },
    {
      kind: "aria",
      title: "Без aria-live",
      text: "Обновление подписи не объявляется: иначе чат шумит каждую минуту.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "В ленте --text-3 на --surface: #66727f на белом 4,9:1; в тёмной #a0adbb на #151b23 7,6:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Подсказка без анимации; мерцание заглушки отключено.",
    },
  ],
  tokens: [
    {
      name: "border-bottom",
      value: "1px dotted --text-3",
      usage: "Подчёркивание, обещающее подсказку",
      kind: "other",
    },
    { name: "--text-3", value: "#66727f / #a0adbb", usage: "Время в строке ленты", kind: "color" },
    { name: "--fs-control", value: "12px", usage: "Размер времени в ленте", kind: "font" },
    { name: "--shadow-pop", value: "0 6px 20px …", usage: "Подсказка", kind: "shadow" },
    { name: "--dur-f / --ease", value: "125 мс", usage: "Появление подсказки", kind: "time" },
    {
      name: "thresholds",
      value: "45 с · 60 мин · 24 ч · 48 ч",
      usage: "Границы подписей",
      kind: "other",
    },
  ],
  examples: [
    {
      id: "feed",
      title: "Лента событий",
      demo: <DemoRelRows />,
      code: `<RelativeTime date={event.createdAt} />`,
    },
    {
      id: "inline",
      title: "В тексте",
      demo: (
        <span style={{ fontSize: "var(--fs-body)" }}>
          Накладная загружена <DemoRelTime date={ago(3 * 3600e3)} />, проверена агентом.
        </span>
      ),
    },
  ],
});

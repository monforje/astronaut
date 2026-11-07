/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoSla, DemoSlaRow } from "./demo";

const Pad = ({ children }: { children: ReactNode }) => (
  <span style={{ display: "inline-flex", padding: "44px 70px 4px" }}>{children}</span>
);

function ThresholdDemo() {
  return (
    <Playback<{ min: number }>
      initial={{ min: 125 }}
      script={[
        { at: 600, set: { min: 120 } },
        { at: 1300, set: { min: 119 } },
        { at: 2300, set: { min: 1 } },
        { at: 3000, set: { min: 0 } },
        { at: 3700, set: { min: -1 } },
      ]}
      tail={900}
      hint="Время идёт ускоренно: на порогах 2 ч и 0 цвет сменяется за 125 мс, текст — сразу."
      render={(s) => <DemoSla min={s.min} />}
    />
  );
}

function PauseDemo() {
  return (
    <Playback<{ p: boolean }>
      initial={{ p: false }}
      script={[
        { at: 700, set: { p: true } },
        { at: 2200, set: { p: false } },
      ]}
      tail={800}
      hint="Предложение: пауза (ждём клиента) делает чип нейтральным и останавливает счёт."
      render={(s) => <DemoSla min={95} paused={s.p} />}
    />
  );
}

function TipDemo() {
  return (
    <Playback<{ tip: boolean }>
      initial={{ tip: false }}
      script={[
        { at: 500, set: { tip: true } },
        { at: 1900, set: { tip: false } },
      ]}
      tail={600}
      render={(s) => (
        <Pad>
          <DemoSla min={65} tip={s.tip} force={s.tip ? "focus" : undefined} />
        </Pad>
      )}
    />
  );
}

export default defineDoc({
  id: "sla-chip",
  title: "SLA-чип",
  group: "time",
  cssPrefix: "ds-sla",
  order: 100,
  keywords: [
    "sla",
    "срок",
    "дедлайн",
    "deadline",
    "просрочено",
    "overdue",
    "осталось",
    "остаток времени",
    "таймер срока",
    "timer",
    "countdown",
    "время на выполнение",
    "срок выполнения",
    "часы",
    "clock",
  ],
  summary:
    "Бейдж с часами и остатком до срока: «6 ч 20 м» (запас), «1 ч 05 м» (мало времени), «−45 м» (просрочено). Цвет — тоны Badge.",
  purpose:
    "SLA-чип отвечает в строке таблицы на один вопрос: успеваем ли. Он не показывает дату срока (она в подсказке) и не заменяет обратный отсчёт на карточке. Цвет дублируется числом и знаком: красный чип всегда с минусом. Границу между «запасом» и «мало времени» макет не задаёт: в словаре предложено «меньше 2 часов» [TODO] согласовать с договором.",
  related: ["badge", "countdown", "voyage", "relative-time", "data-table"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-badge", side: "t" },
          { n: 2, anchor: ".ds-badge__icon svg", side: "b" },
          { n: 3, anchor: ".ds-badge__label", side: "r" },
        ]}
      >
        <DemoSla />
      </Marks>
    ),
    parts: [
      {
        name: "Бейдж",
        description: "Badge без точки, высота 20 px (sm — 16), цвет по остатку: ok, warn, err.",
      },
      {
        name: "Иконка часов",
        description:
          "12 px слева, цвет тона. Единственное, что отличает SLA-чип от обычного бейджа.",
      },
      {
        name: "Остаток",
        description:
          "«6 ч 20 м», минуты с нулём впереди после часов; меньше часа «45 м»; просрочка с минусом U+2212: «−45 м». Цифры tabular-nums.",
      },
    ],
  },
  variants: [
    {
      id: "tones",
      title: "Запас · мало · просрочено",
      description: "Три значения из макета: 6 ч 20 м — teal, 1 ч 05 м — orange, −45 м — красный.",
      when: "колонка «Срок» таблицы, карточка груза.",
      demo: (
        <>
          <DemoSla min={380} />
          <DemoSla min={65} />
          <DemoSla min={-45} />
        </>
      ),
    },
    {
      id: "days",
      title: "Больше суток",
      description: "Предложение: от 24 часов считаем днями — «2 д 4 ч», секунды и минуты не нужны.",
      demo: <DemoSla min={2 * 1440 + 4 * 60 + 15} />,
    },
    {
      id: "label",
      title: "С подписью",
      description: "Предложение: «SLA 6 ч 20 м», когда колонка без заголовка (карточка, лента).",
      demo: <DemoSla label="SLA" />,
    },
    {
      id: "sm",
      title: "Мелкий",
      description: "Высота 16 px, как Badge sm: внутри плотных строк.",
      demo: (
        <>
          <DemoSla size="sm" min={380} />
          <DemoSla size="sm" min={65} />
          <DemoSla size="sm" min={-45} />
        </>
      ),
    },
    {
      id: "paused",
      title: "На паузе",
      description: "Предложение: нейтральный чип «Пауза», когда срок не идёт.",
      demo: <DemoSla paused />,
    },
  ],
  states: [
    {
      id: "ok",
      kind: "default",
      title: "Запас · ok",
      note: "Teal-подложка, текст --ok-text. Осталось не меньше 2 ч.",
      demo: <DemoSla min={380} />,
    },
    {
      id: "warn",
      kind: "other",
      title: "Мало · warn",
      note: "Orange-подложка, текст --warn-text. Меньше 2 ч.",
      demo: <DemoSla min={65} />,
    },
    {
      id: "err",
      kind: "error",
      title: "Просрочено · err",
      note: "Красная подложка, текст --err-text, перед числом минус.",
      demo: <DemoSla min={-45} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Предложение: подсказка «Срок: сегодня, 18:00». Сам чип не меняется.",
      forced: true,
      demo: (
        <Pad>
          <DemoSla min={65} tip />
        </Pad>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Предложение: чип в Tab, кольцо --focus 2 px с отступом 2 px, подсказка как при hover.",
      forced: true,
      demo: (
        <Pad>
          <DemoSla min={65} tip force="focus" />
        </Pad>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Не нажимается. Переход к задаче — по строке или кнопке рядом.",
      notApplicable: true,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Пауза",
      note: "Предложение: «Пауза», тон idle; счёт стоит. Это единственная форма «неактивного» SLA.",
      demo: <DemoSla paused />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: серая пилюля 64 × 20 px с мерцанием.",
      demo: <DemoSla state="loading" />,
    },
    {
      id: "error-data",
      kind: "error",
      title: "Нет срока",
      note: "Предложение: данных о сроке нет — idle-бейдж «Нет срока» со значком предупреждения.",
      demo: <DemoSla state="error" />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: SLA для задачи не задан — длинное тире «—» цветом --text-3 (не ниже 4,5:1).",
      demo: <DemoSla state="empty" />,
    },
  ],
  choreography: [
    {
      id: "threshold",
      title: "Переход через порог",
      trigger: "остаток пересёк 2 часа или ноль",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Минута проходит: число меняется мгновенно («2 ч 00 м» → «1 ч 59 м»), анимации счёта нет. В макете чип статичен, пересчёт предложен.",
        },
        {
          at: 600,
          dur: 125,
          what: "Порог 2 ч: подложка и текст переходят с teal на orange.",
          prop: "background, color, box-shadow",
          easing: "ease",
        },
        {
          at: 2300,
          dur: 125,
          what: "Остаток 0: чип краснеет, число начинает отсчёт вниз со знаком минус: «−1 м».",
          prop: "background, color, box-shadow",
          easing: "ease",
        },
      ],
      focus:
        "Не затрагивается: смена текста не отнимает фокус. Переход в красный объявляется один раз через aria-live рядом (не самим чипом).",
      reducedMotion: "Цвета меняются мгновенно.",
      neighbours:
        "Чип меняет ширину на несколько пикселей (tabular-nums сводит это к минимуму), соседние колонки таблицы не двигаются: ширина колонки фиксирована. Переход цвета у Badge в макете задан (125 мс).",
      demo: <ThresholdDemo />,
    },
    {
      id: "pause",
      title: "Пауза и возобновление",
      trigger: "срок поставлен на паузу или снят",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Чип переходит в idle, текст «Пауза».",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 1500,
          dur: 125,
          what: "Возобновление: тон по остатку, число продолжает счёт с прежнего значения.",
          prop: "background, color",
          easing: "ease",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Мгновенно.",
      neighbours: "Колонка фиксированной ширины: соседние ячейки не двигаются.",
      demo: <PauseDemo />,
    },
    {
      id: "tip",
      title: "Подсказка со сроком",
      trigger: "курсор или фокус на чипе",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подсказка над чипом: прозрачность 0→1, масштаб .96→1, сдвиг 4 px.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        { at: 1400, dur: 0, what: "Уход курсора или Esc: подсказка исчезает мгновенно." },
      ],
      focus: "Чип в Tab (tabindex=0), подсказка по фокусу.",
      reducedMotion: "Подсказка без анимации.",
      neighbours: "Лежит поверх, раскладку не двигает.",
      demo: <TipDemo />,
    },
  ],
  rules: {
    use: [
      "Минус и цифры для просрочки: красный чип обязан содержать «−».",
      "Минуты после часов — с нулём: «1 ч 05 м».",
      "Один порог warn на всю систему, согласованный с договором.",
      "Точное время срока — в подсказке и в карточке.",
      "В строке таблицы фиксированная ширина колонки: чип не должен её двигать.",
    ],
    avoid: [
      "Красный чип без минуса: цвет не единственный носитель смысла.",
      "Секунды в SLA-чипе: для них есть обратный отсчёт.",
      "Свой цвет и формат на разных экранах.",
      "Чип без иконки часов: он станет обычным статусом.",
      "Совмещать с точкой статуса Badge: иконка часов её заменяет.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Скрытый текст",
      text: "Видимое «6 ч 20 м» скрывается от скринридера, а вместо него читается «До срока SLA осталось 6 ч 20 м» (или «SLA просрочен на 45 м»). Сам чип — aria-hidden.",
    },
    {
      kind: "focus",
      title: "Фокус и подсказка",
      text: "Предложение: чип в Tab, подсказка «Срок: сегодня, 18:00» по фокусу; Esc её убирает.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Тона Badge: --ok-text, --warn-text и --err-text смешаны с --text 75 / 25 на подложках 16 %: ok 5,9:1, warn 6,2:1, err 6,1:1 (светлая тема, расчёт на странице Badge). Знак минус и слова в скрытом тексте дублируют цвет.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переход цвета и подсказка без анимации; заглушки не мерцают.",
    },
  ],
  tokens: [
    {
      name: "badge tones",
      value: "ok · warn · err · idle",
      usage: "Тон по остатку (см. Badge)",
      kind: "color",
    },
    {
      name: "height",
      value: "20 px (sm 16)",
      usage: "Высота чипа, иконка часов 12 px",
      kind: "size",
    },
    {
      name: "threshold",
      value: "< 2 ч → warn, ≤ 0 → err",
      usage: "Пороги тонов [TODO] согласовать",
      kind: "other",
    },
    {
      name: "format",
      value: "«6 ч 20 м» · «45 м» · «−45 м» · «2 д 4 ч»",
      usage: "Формат остатка, минус U+2212",
      kind: "other",
    },
    { name: "--dur-f", value: "125 мс", usage: "Переход цвета; подсказка", kind: "time" },
    { name: "--shadow-pop", value: "0 6px 20px …", usage: "Подсказка", kind: "shadow" },
  ],
  examples: [
    {
      id: "table",
      title: "Колонка «Срок»",
      demo: (
        <div style={{ width: "100%", maxWidth: 360 }}>
          <DemoSlaRow name="MSKU4821907" min={380} />
          <DemoSlaRow name="TGHU6620118" min={65} />
          <DemoSlaRow name="CAIU3390275" min={-45} />
        </div>
      ),
      code: `<SlaChip minutes={65} deadline="сегодня, 18:00" />`,
    },
  ],
});

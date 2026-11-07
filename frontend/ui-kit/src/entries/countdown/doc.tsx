/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import {
  ARRIVAL_SECONDS,
  DemoCountdown,
  DemoCountdownBadge,
  DemoCountdownLive,
  DemoCountdownText,
} from "./demo";

function TickDemo() {
  return (
    <Playback<{ left: number }>
      initial={{ left: ARRIVAL_SECONDS }}
      script={[1, 2, 3, 4, 5].map((i) => ({ at: i * 700, set: { left: ARRIVAL_SECONDS - i } }))}
      tail={700}
      hint="Секунды уходят по одной; цифры заменяются мгновенно."
      render={(s) => <DemoCountdown left={s.left} />}
    />
  );
}

function ThresholdDemo() {
  const t0 = 3603;
  return (
    <Playback<{ left: number }>
      initial={{ left: t0 }}
      script={[1, 2, 3, 4, 5].map((i) => ({ at: i * 700, set: { left: t0 - i } }))}
      tail={900}
      hint="Остаток меньше часа: час уходит из счёта, подложка переходит на orange за 200 мс."
      render={(s) => <DemoCountdown left={s.left} hideDays />}
    />
  );
}

function ExpireDemo() {
  return (
    <Playback<{ left: number }>
      initial={{ left: 3 }}
      script={[
        { at: 700, set: { left: 2 } },
        { at: 1400, set: { left: 1 } },
        { at: 2100, set: { left: 0 } },
      ]}
      tail={1400}
      hint="На нуле счёт останавливается, подложка краснеет, отрицательных чисел нет."
      render={(s) => (
        <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          <DemoCountdown left={s.left} hideDays />
          <DemoCountdownBadge left={s.left} />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "countdown",
  title: "Обратный отсчёт",
  group: "time",
  cssPrefix: "ds-countdown",
  order: 70,
  keywords: [
    "таймер",
    "отсчёт",
    "обратный отсчёт",
    "до прибытия",
    "осталось",
    "срок",
    "дедлайн",
    "время до",
    "прибытие судна",
    "timer",
    "countdown",
    "deadline",
    "time left",
    "eta",
    "remaining",
  ],
  summary:
    "Четыре блока «дн · ч · мин · сек» с живым отсчётом до события: прибытие судна, срок документа. Компактный вариант — бейдж «до прибытия 2 д 4 ч».",
  purpose:
    "Отсчёт отвечает на вопрос «сколько осталось» и не заменяет дату: рядом пишут саму дату события. Секунды идут реально, остальное пересчитывается на границах. Пороговые цвета (orange меньше часа, красный на нуле) в макете не заданы: это предложение, границы [TODO] согласовать с SLA-чипом.",
  related: ["sla-chip", "voyage", "relative-time", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-countdown__cell:first-child", side: "t" },
          { n: 2, anchor: ".ds-countdown__cell:nth-child(2) .ds-countdown__num", side: "t" },
          { n: 3, anchor: ".ds-countdown__cell:nth-child(3) .ds-countdown__unit", side: "b" },
        ]}
      >
        <DemoCountdown />
      </Marks>
    ),
    parts: [
      {
        name: "Блок",
        description:
          "Плашка минимум 60 px шириной, padding 8 6, радиус --r-card, подложка --surface-muted, рамка --divider.",
      },
      {
        name: "Число",
        description:
          "Onest 700 22 px, tabular-nums: ширина не прыгает. Часы, минуты, секунды с нулём впереди; дни без нуля.",
      },
      {
        name: "Подпись единицы",
        description: "«дн», «ч», «мин», «сек» — 10 px, 600, капсом, --text-3.",
      },
    ],
  },
  variants: [
    {
      id: "full",
      title: "Четыре блока",
      description: "Живой: идёт реальное время от «2 дн 4 ч 15 мин 30 сек».",
      when: "главное число на странице рейса или груза.",
      demo: <DemoCountdownLive />,
    },
    {
      id: "hours",
      title: "Без дней",
      description: "Предложение: когда дней ноль, блок «дн» скрывается — три блока вместо четырёх.",
      demo: <DemoCountdown left={5 * 3600 + 20 * 60 + 8} hideDays />,
    },
    {
      id: "badge",
      title: "Компактный",
      description:
        "Бейдж с часами «до прибытия 2 д 4 ч», teal. Меньше часа — orange, срок вышел — красный (предложение).",
      when: "строка таблицы, карточка рейса.",
      demo: (
        <>
          <DemoCountdownBadge />
          <DemoCountdownBadge left={55 * 60} />
          <DemoCountdownBadge left={0} />
        </>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Идёт",
      note: "Серые блоки, числа --text. Секунды меняются раз в секунду.",
      demo: <DemoCountdown left={ARRIVAL_SECONDS} hideDays />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Не интерактивен: не нажимается, hover не меняет вид. Подсказку с точной датой даёт обёртка.",
      notApplicable: true,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет: компонент только показывает значение.",
      notApplicable: true,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Не в порядке Tab. Если нужна подсказка с датой — оборачивать в Tooltip с фокусируемым триггером.",
      notApplicable: true,
    },
    {
      id: "warn",
      kind: "other",
      title: "Мало времени",
      note: "Предложение: меньше часа. Подложка orange 14 %, числа --warn-text.",
      demo: <DemoCountdown left={42 * 60 + 10} hideDays />,
    },
    {
      id: "err",
      kind: "error",
      title: "Срок вышел",
      note: "Предложение: на нуле. Подложка красная 12 %, числа --err-text, блоки 00.",
      demo: <DemoCountdown left={0} hideDays />,
    },
    {
      id: "paused",
      kind: "disabled",
      title: "Пауза",
      note: "Предложение: отсчёт остановлен (ждём ответа). Числа --text-3, секунды стоят.",
      demo: <DemoCountdown left={2 * 3600 + 5 * 60 + 12} hideDays paused />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: в блоках серые заглушки вместо чисел; подписи на месте.",
      demo: <DemoCountdown left={ARRIVAL_SECONDS} loading hideDays />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: срок не удалось получить — плашка «Срок не загрузился» красным, без блоков.",
      demo: (
        <DemoCountdownText tone="err" title="Срок не загрузился" text="Повторим автоматически" />
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Предложение: срока нет — плашка «Срок не задан» серым.",
      demo: <DemoCountdownText title="Срок не задан" text="судно ещё не назначено" />,
    },
  ],
  choreography: [
    {
      id: "tick",
      title: "Ход секунд",
      trigger: "каждую секунду",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Блок «сек» получает новое число мгновенно. В макете весь отсчёт перерисовывается раз в секунду, без анимации.",
        },
        {
          at: 700,
          dur: 0,
          what: "На границе минуты число «мин» уменьшается тут же, секунды идут с 59. То же для часов и дней.",
        },
      ],
      focus: "Не затрагивается: отсчёт не фокусируется и не отбирает фокус при обновлении.",
      reducedMotion:
        'Блок «сек» не показывается, значение обновляется раз в минуту (showSeconds возвращает секунды). Анимации переходов нет; скринридеру секунды не объявляются: role="timer" по умолчанию не live. Скрытая вкладка останавливает таймер, при возврате значение пересчитывается сразу.',
      neighbours:
        "Ширина блоков не меняется (tabular-nums, min-width 60 px), соседний текст не двигается.",
      demo: <TickDemo />,
    },
    {
      id: "threshold",
      title: "Переход через порог",
      trigger: "остаток стал меньше часа",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Блок «ч» исчезает при нуле часов, остальные блоки сдвигаются к центру. [TODO] решить, не скрывать ли его вовсе.",
        },
        {
          at: 0,
          dur: 200,
          what: "Подложка переходит на orange 14 %, числа — на --warn-text.",
          prop: "background, box-shadow, color",
          easing: "ease",
        },
      ],
      focus:
        "Не затрагивается. Переход озвучивается один раз текстом рядом («Мало времени»), а не отсчётом.",
      reducedMotion: "Цвета меняются мгновенно.",
      neighbours:
        "Компоновка рядом не меняется: вокруг отсчёта резервируется ширина четырёх блоков.",
      demo: <ThresholdDemo />,
    },
    {
      id: "expire",
      title: "Срок вышел",
      trigger: "остаток достиг нуля",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Счёт останавливается на 00:00 и не уходит в минус: просрочку показывает SLA-чип («−45 м»).",
        },
        {
          at: 0,
          dur: 200,
          what: "Подложка переходит на красную 12 %, числа — на --err-text; бейдж рядом меняет текст на «срок вышел».",
          prop: "background, color",
          easing: "ease",
        },
      ],
      focus:
        "Не затрагивается. Событие «срок вышел» объявляется один раз (aria-live=polite у соседнего текста).",
      reducedMotion: "Цвета меняются мгновенно.",
      neighbours: "Размеры блоков те же. [TODO] что показывать вместо нулей спустя минуту.",
      demo: <ExpireDemo />,
    },
  ],
  rules: {
    use: [
      "Рядом с отсчётом писать саму дату события: «прибытие 16.11, 14:00».",
      "Секунды показывать только там, где счёт важен: на карточке рейса, а не в таблице.",
      "В строке таблицы брать компактный бейдж.",
      "Остаток больше суток — дни без нуля, меньше — часы и минуты.",
    ],
    avoid: [
      "Отсчёт без даты: он не говорит, к чему.",
      "Уходить в минус: на нуле счёт стоит, просрочка — это SLA-чип.",
      "Мигание и пульс: цвета меняются один раз на пороге.",
      "Моноширинный шрифт для цифр: ширину держит tabular-nums.",
      "Объявлять скринридеру каждую секунду.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'role="timer"',
      text: 'role="timer" с aria-label «До прибытия MSC Aurora». У timer неявно aria-live="off": секунды не читаются. Важные пороги объявляет отдельная строка aria-live="polite".',
    },
    {
      kind: "aria",
      title: "Текст вместо блоков",
      text: "Для скринридера значение лучше дать одной строкой: «осталось 2 дня 4 часа 15 минут» в aria-label или в скрытом тексте, обновляемом раз в минуту. [TODO] проверить с NVDA.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "--text на --surface-muted: 14,2:1 (светлая). Числа в тоне warn: --warn-text #b45309 на подложке orange 14 % около 4,4:1: ниже 4,5:1 для 22 px жирного это крупный текст (порог 3:1), но [TODO] проверить расчётом.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы цвета отключены. Само изменение чисел анимации и так не имеет.",
    },
  ],
  tokens: [
    {
      name: "cell",
      value: "min 60 px · padding 8 6",
      usage: "Блок отсчёта; зазор 8",
      kind: "size",
    },
    { name: "--r-card", value: "10px", usage: "Радиус блока", kind: "radius" },
    {
      name: "--surface-muted / --divider",
      value: "#eceef2 / #e0e4e9",
      usage: "Подложка и рамка блока",
      kind: "color",
    },
    {
      name: "number",
      value: "22 px / 700",
      usage: "Число, tabular-nums; подпись 10 px / 600 капсом",
      kind: "font",
    },
    {
      name: "--warn-text / --orange",
      value: "#b45309 / #f08a24",
      usage: "Мало времени (предложение)",
      kind: "color",
    },
    {
      name: "--err-text / --danger",
      value: "#c92a2a / #d03538",
      usage: "Срок вышел (предложение)",
      kind: "color",
    },
    { name: "--dur", value: "200 мс", usage: "Смена цвета на пороге", kind: "time" },
  ],
  examples: [
    {
      id: "vessel",
      title: "Прибытие судна",
      demo: (
        <div style={{ display: "grid", gap: 8, justifyItems: "start" }}>
          <span style={{ color: "var(--text-2)" }}>Прибытие судна MSC Aurora, 16 ноября</span>
          <DemoCountdownLive />
        </div>
      ),
      code: `<Countdown to={arrival} label="До прибытия MSC Aurora" />`,
    },
  ],
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoAgendaDay, DemoAgendaEvent, DemoWeekAgenda, DemoWeekAgendaLive } from "./demo";

function SelectDemo() {
  type S = { sel: number; h?: number; f?: "hover" | "active" };
  return (
    <Playback<S>
      initial={{ sel: 3 }}
      script={[
        { at: 500, set: { h: 4, f: "hover" } },
        { at: 1000, set: { f: "active" } },
        { at: 1200, set: { sel: 4, f: undefined, h: undefined } },
        { at: 2400, set: { h: 2, f: "hover" } },
        { at: 2900, set: { sel: 2, f: undefined, h: undefined } },
      ]}
      tail={1200}
      hint="Выбор дня: кнопка подсвечивается, список событий сменяется. Среда — свободный день."
      render={(s) => (
        <DemoWeekAgenda
          sel={s.sel}
          dayForce={s.f && s.h !== undefined ? { index: s.h, force: s.f } : undefined}
        />
      )}
    />
  );
}

function EventDemo() {
  type S = { f?: "hover" | "focus" };
  return (
    <Playback<S>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1500, set: { f: "focus" } },
        { at: 2600, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => <DemoAgendaEvent force={s.f} />}
    />
  );
}

function NowDemo() {
  return (
    <Playback<{ phase: number }>
      initial={{ phase: 0 }}
      script={[{ at: 900, set: { phase: 1 } }]}
      tail={1400}
      hint="Предложение: линия «Сейчас» переезжает между событиями по таймеру раз в минуту, без анимации."
      render={(s) => <NowRows phase={s.phase} />}
    />
  );
}

function NowRows({ phase }: { phase: number }) {
  const rows = [
    ["09:00", "Сверка по Дальснабу"],
    ["11:00", "Приёмка MSC Aurora"],
    ["15:30", "Звонок с брокером"],
  ];
  const at = phase === 0 ? 1 : 2;
  return (
    <div className="ds-agenda" style={{ gap: 8 }}>
      {rows.flatMap(([t, n], i) => {
        const out = [];
        if (i === at)
          out.push(
            <div className="ds-agenda__now" key="now">
              Сейчас {phase === 0 ? "10:15" : "12:05"}
            </div>,
          );
        out.push(
          <div className="ds-agenda__ev" key={t} style={{ opacity: i < at ? 0.55 : 1 }}>
            <span className="ds-agenda__time">{t}</span>
            <span className="ds-agenda__tx">
              <b>{n}</b>
            </span>
            <span />
          </div>,
        );
        return out;
      })}
    </div>
  );
}

export default defineDoc({
  id: "week-agenda",
  title: "Недельная повестка",
  group: "time",
  cssPrefix: "ds-agenda",
  order: 90,
  keywords: [
    "неделя",
    "недельная повестка",
    "повестка",
    "расписание",
    "события",
    "план дня",
    "график",
    "встречи",
    "день недели",
    "agenda",
    "week",
    "weekly",
    "schedule",
    "timeline",
    "events",
    "day list",
  ],
  summary:
    "Полоса из семи дней с точками событий и список событий выбранного дня: время, название, кто, длительность. Для сегодняшнего дня есть красная линия «Сейчас».",
  purpose:
    "Повестка отвечает на вопрос «что у меня на этой неделе»: сверху видно, в какие дни есть события, ниже — подробности одного дня. Это не календарь для выбора даты (для этого есть Calendar) и не сетка с часами: события идут списком. Недели листать в макете нельзя [TODO] решить, нужны ли стрелки «прошлая / следующая неделя».",
  related: ["calendar", "time-slots", "badge", "relative-time"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-agenda__week", side: "t" },
          { n: 2, anchor: ".ds-agenda__day:first-child .ds-agenda__dots u", side: "l" },
          { n: 3, anchor: ".ds-agenda__list .ds-agenda__ev", side: "l" },
          { n: 4, anchor: ".ds-agenda__now", side: "l" },
          { n: 5, anchor: ".ds-agenda__note", side: "r" },
        ]}
      >
        <div style={{ display: "grid", gap: 8, width: "100%", maxWidth: 560 }}>
          <DemoWeekAgenda />
          <div className="ds-agenda__note">
            <b>Свободный день</b>
            <span>Ср, 11 ноября — событий нет</span>
          </div>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Полоса недели",
        description:
          "Семь кнопок-дней в сетке: день недели (10 px капсом), число 18 px, под ними точки событий. Неделя с понедельника.",
      },
      {
        name: "Точки событий",
        description:
          "По одной точке 4 px --orange на событие. Нет событий — место под точки остаётся пустым.",
      },
      {
        name: "Событие",
        description:
          "Строка из трёх колонок: время (начало жирным, конец серым), название с цветной точкой и кто, длительность бейджем «30 мин».",
      },
      {
        name: "Линия «Сейчас»",
        description:
          "Красная точка, подпись «Сейчас 10:15» и линия до края; встаёт перед первым событием, которое ещё не началось. Только у сегодняшнего дня.",
      },
      { name: "Свободный день", description: "Плашка «Свободный день» с датой, если событий нет." },
    ],
  },
  variants: [
    {
      id: "live",
      title: "Неделя и повестка",
      description:
        "Живой: выбирайте день. Сегодня — четверг 12 ноября, у него три события и линия «Сейчас».",
      when: "главная страница, карточка исполнителя.",
      demo: <DemoWeekAgendaLive />,
    },
    {
      id: "free",
      title: "Свободный день",
      description: "Среда без событий: точек нет, в списке плашка.",
      demo: <DemoWeekAgenda sel={2} />,
    },
    {
      id: "other-day",
      title: "Другой день",
      description: "Пятница: события без линии «Сейчас», она есть только у сегодняшнего дня.",
      demo: <DemoWeekAgenda sel={4} />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "День",
      note: "Белая поверхность, рамка --border, число --text.",
      demo: <DemoAgendaDay i={4} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "День · hover",
      note: "Слой 4 % поверх поверхности. У события — подложка цвета события 14 % вместо 8 %.",
      forced: true,
      demo: <DemoAgendaDay i={4} force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "День · active",
      note: "Слой 7 %.",
      forced: true,
      demo: <DemoAgendaDay i={4} force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "День · focus",
      note: "Кольцо --focus 2 px, отступ 1 px.",
      forced: true,
      demo: <DemoAgendaDay i={4} force="focus" />,
    },
    {
      id: "selected",
      kind: "selected",
      title: "День · выбран",
      note: "aria-pressed=true: фон --selected, рамка --border-selected.",
      demo: <DemoAgendaDay i={4} pressed />,
    },
    {
      id: "today",
      kind: "other",
      title: "День · сегодня",
      note: "День недели окрашивается в --link. Остальное как у обычного дня; можно быть выбранным.",
      demo: <DemoAgendaDay i={3} />,
    },
    {
      id: "free",
      kind: "empty",
      title: "День · без событий",
      note: "Точек нет, высота остаётся.",
      demo: <DemoAgendaDay i={2} empty />,
    },
    {
      id: "event-hover",
      kind: "hover",
      title: "Событие · hover",
      note: "Подложка 14 % цвета события, рамка цвета 24 % от события.",
      forced: true,
      demo: <DemoAgendaEvent force="hover" />,
    },
    {
      id: "event-focus",
      kind: "focus",
      title: "Событие · focus",
      note: "Событие в Tab (tabindex=0); кольцо --focus 2 px, отступ 1 px.",
      forced: true,
      demo: <DemoAgendaEvent force="focus" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Нет: дни и события или доступны, или их нет. Прошедшие события приглушаем прозрачностью 55 % (предложение).",
      notApplicable: true,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Предложение: в списке две серые плашки 54 px с мерцанием, точки на днях скрыты.",
      demo: (
        <div style={{ width: "100%", maxWidth: 280 }}>
          <DemoWeekAgenda state="loading" />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Предложение: плашка «Календарь недоступен». Полоса дней остаётся.",
      demo: (
        <div style={{ width: "100%", maxWidth: 280 }}>
          <DemoWeekAgenda state="error" />
        </div>
      ),
    },
  ],
  choreography: [
    {
      id: "select",
      title: "Выбор дня",
      trigger: "наведение, клик по дню недели",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: слой 4 % на кнопке дня.",
          prop: "background",
          easing: "ease",
        },
        { at: 500, dur: 125, what: "Active: слой 7 %.", prop: "background", easing: "ease" },
        {
          at: 700,
          dur: 125,
          what: "Выбор: день заливается --selected с рамкой, прежний теряет подсветку.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 700,
          dur: 200,
          what: "Список под полосой заменяется списком выбранного дня: новый появляется с прозрачностью 0→1 и сдвигом снизу 4 px. В макете замена мгновенная [TODO] подтвердить 200 мс.",
          prop: "opacity, translate",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус остаётся на нажатой кнопке дня; список — aria-live=polite, озвучивает «Свободный день» или события.",
      reducedMotion: "Подсветка и замена списка без анимации.",
      neighbours:
        "Полоса дней не двигается; высота списка меняется, и всё, что ниже, сдвигается. Для стабильной раскладки резервируйте высоту трёх событий [TODO].",
      demo: <SelectDemo />,
    },
    {
      id: "event",
      title: "Событие: наведение и фокус",
      trigger: "курсор на событии, Tab",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: подложка события растёт с 8 % до 14 % его цвета.",
          prop: "background",
          easing: "ease",
        },
        { at: 1100, dur: 0, what: "Focus: кольцо 2 px появляется сразу." },
      ],
      focus:
        "События в порядке Tab (tabindex=0); кольцо рисует :focus-visible. [TODO] что даёт Enter: открыть событие — в макете не описано.",
      reducedMotion: "Подложка меняется без перехода.",
      neighbours: "Соседние события не реагируют, размеры не меняются.",
      demo: <EventDemo />,
    },
    {
      id: "now",
      title: "Линия «Сейчас»",
      trigger: "прошла минута",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Раз в минуту линия пересчитывает место: перед первым событием, которое ещё не началось; подпись «Сейчас 12:05».",
        },
        {
          at: 0,
          dur: 0,
          what: "Прошедшие события приглушаются прозрачностью 55 %. Анимации перемещения нет.",
        },
      ],
      focus: "Не затрагивается; линия не фокусируется и не озвучивается.",
      reducedMotion: "Совпадает с обычным поведением.",
      neighbours:
        "Строки событий не двигаются: линия вставляется между ними, добавляя её высоту. В макете линия считается один раз при отрисовке. [TODO] подтвердить обновление раз в минуту и приглушение.",
      demo: <NowDemo />,
    },
  ],
  rules: {
    use: [
      "Неделя с понедельника, число и день недели в каждой кнопке.",
      "Точки на днях — по числу событий, но не больше семи [TODO] решить предел.",
      "Тип события — цвет точки и текст «кто» рядом: цвет не единственный носитель.",
      "Сегодняшний день отмечать цветом дня недели; «Сейчас» — только в нём.",
      "Свободный день — плашкой с датой, а не пустым местом.",
    ],
    avoid: [
      "Использовать как выбор даты: для даты есть Calendar и DatePicker.",
      "Красить события красным: красный — только линия «Сейчас».",
      "Показывать час-сетку: повестка — это список, а не расписание по часам.",
      "Прятать длительность: «30 мин» помогает планировать.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Дни как кнопки",
      text: "Каждый день — button с aria-pressed и aria-label: «Пт, 13 ноября, событий: 2». Сегодняшний добавляет «, сегодня». Полоса — role=group «Дни недели».",
    },
    {
      kind: "aria",
      title: "Список и aria-live",
      text: 'Контейнер списка — aria-live="polite": смена дня озвучивается («Свободный день» или список). Для сложных повесток лучше список <ul> [TODO].',
    },
    {
      kind: "key",
      title: "Tab / Enter / Space",
      text: "Дни и события — стопы в Tab. Enter и Space выбирают день. [TODO] ← → между днями как в toolbar.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Макет красил подпись «Сейчас» в --danger (#d03538, на белом 4,9:1). В словаре --err-text (5,5:1). Точки --orange на белом 2,5:1: смысл дублируется в aria-label.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Замена списка и переходы фона отключаются.",
    },
  ],
  tokens: [
    {
      name: "day",
      value: "1fr × 7 · gap 6",
      usage: "Кнопки дней; число 18 px / 700, день недели 10 px капсом",
      kind: "size",
    },
    {
      name: "--r-card / --r-item",
      value: "10px / 8px",
      usage: "Радиус дня · радиус события",
      kind: "radius",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % · teal 60 %",
      usage: "Выбранный день",
      kind: "color",
    },
    {
      name: "--ec",
      value: "--teal · --info · --orange · --text-3",
      usage: "Цвет события: подложка 8 %, рамка 24 %, точка. Hover 14 %",
      kind: "color",
    },
    { name: "--orange", value: "#f08a24", usage: "Точки событий на днях", kind: "color" },
    {
      name: "--err-text / --danger",
      value: "#c92a2a / #d03538",
      usage: "Подпись и линия «Сейчас»",
      kind: "color",
    },
    {
      name: "--dur-f / --dur / --ease",
      value: "125 / 200 мс",
      usage: "Подсветка · смена списка",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "week",
      title: "Неделя оформления",
      demo: <DemoWeekAgendaLive />,
      code: `<WeekAgenda events={events} week={monday} value={day} onChange={setDay} />`,
    },
  ],
});

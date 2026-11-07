/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  Delta,
  Donut,
  HBar,
  LineChart,
  SERIES,
  SlaChip,
  Sparkline,
  TOP_CLIENTS,
  WEEKS,
} from "./demo";

const SP_UP = [22, 24, 23, 27, 26, 30, 29, 33, 31, 36, 35, 40, 38, 44];
const SP_BAD = [12, 14, 13, 15, 14, 18, 17, 19, 22, 21, 25, 27, 30, 33];
const SP_ORG = [6, 6, 5, 7, 6, 5, 6, 4, 5, 4, 5, 4, 4, 4];

function Tile({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ds-chart__tile">
      <span className="ds-chart__tile-lbl">{label}</span>
      <span className="ds-chart__tile-val">{value}</span>
      {children}
    </div>
  );
}

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Default",
    note: "Линии, сетка, подписи осей; подсказки нет.",
    demo: (
      <div className="ds-chart__wide">
        <LineChart />
      </div>
    ),
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover · подсказка",
    note: "Пунктирная вертикаль, кружки на линиях, карточка со значениями. Принудительно через hoverIndex.",
    forced: true,
    demo: (
      <div className="ds-chart__wide">
        <LineChart hoverIndex={6} />
      </div>
    ),
  },
  {
    id: "donut-hover",
    kind: "hover",
    title: "Hover · сегмент кольца",
    note: "Сегмент толще (16 → 20), остальные 35 %, в центре — число и имя сегмента.",
    forced: true,
    demo: <Donut active={1} />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active · серия выключена",
    note: "Нажатие на пункт легенды гасит серию: маркер становится серым, линия уходит, шкала пересчитывается. Последнюю серию выключить нельзя.",
    forced: true,
    demo: (
      <div className="ds-chart__wide">
        <LineChart hidden={["С расхождениями"]} />
      </div>
    ),
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus · клавиатура",
    note: "Предложение: график входит в Tab, контур 2px, стрелки двигают вертикаль и подсказку. В макете график только для мыши.",
    forced: true,
    demo: (
      <div className="ds-chart__wide">
        <LineChart forceFocus hoverIndex={3} />
      </div>
    ),
  },
  {
    id: "loading",
    kind: "loading",
    title: "Loading",
    note: "Пока данных нет — Skeleton по форме графика (столбики), а не пустые оси.",
    demo: (
      <div className="ds-chart__skel" aria-busy="true">
        {[40, 62, 48, 80, 66, 92, 74, 58, 84, 70, 96, 60].map((h) => (
          <i key={h} style={{ height: `${h}%` }} />
        ))}
      </div>
    ),
  },
  {
    id: "empty",
    kind: "empty",
    title: "Empty",
    note: "Оси остаются, поверх — «Данных за период нет». Серии в легенде видны. [TODO] текст и действие («Выбрать другой период») подтвердить.",
    demo: (
      <div className="ds-chart__wide">
        <LineChart empty />
      </div>
    ),
  },
  {
    id: "error",
    kind: "error",
    title: "Error",
    note: "Ошибка загрузки графика в макете не показана. Предложение: Alert inline в карточке графика с «Повторить», сам график не рисуется. [TODO]",
    notApplicable: true,
  },
  NA(
    "disabled",
    "disabled",
    "Disabled",
    "Нет: график не отключают. Недоступный период — disabled у ToggleGroup периода, не у графика.",
  ),
];

function AppearDemo() {
  return (
    <Playback<{ on: boolean }>
      initial={{ on: false }}
      script={[{ at: 300, set: { on: true } }]}
      tail={1700}
      hint="Предложение: в макете линии появляются сразу."
      render={(s) => (
        <div className="ds-chart__wide" style={{ minHeight: 280 }}>
          {s.on ? <LineChart animate /> : null}
        </div>
      )}
    />
  );
}

function TooltipDemo() {
  return (
    <Playback<{ i?: number }>
      initial={{ i: undefined }}
      script={[
        { at: 400, set: { i: 1 } },
        { at: 900, set: { i: 4 } },
        { at: 1400, set: { i: 8 } },
        { at: 1900, set: { i: 11 } },
        { at: 2600, set: { i: undefined } },
      ]}
      tail={500}
      render={(s) => (
        <div className="ds-chart__wide">
          <LineChart hoverIndex={s.i} />
        </div>
      )}
    />
  );
}

function LegendDemo() {
  return (
    <Playback<{ hid: string[] }>
      initial={{ hid: [] }}
      script={[
        { at: 600, set: { hid: ["С расхождениями"] } },
        { at: 1800, set: { hid: [] } },
      ]}
      tail={600}
      hint="Предложение: плавная перерисовка шкалы. В макете график перерисовывается сразу."
      render={(s) => (
        <div className="ds-chart__wide">
          <LineChart hidden={s.hid} />
        </div>
      )}
    />
  );
}

function DonutDemo() {
  return (
    <Playback<{ a: number | null }>
      initial={{ a: null }}
      script={[
        { at: 400, set: { a: 0 } },
        { at: 1100, set: { a: 1 } },
        { at: 1800, set: { a: 2 } },
        { at: 2500, set: { a: null } },
      ]}
      tail={500}
      render={(s) => <Donut active={s.a} />}
    />
  );
}

function DonutAppearDemo() {
  return (
    <Playback<{ on: boolean }>
      initial={{ on: false }}
      script={[{ at: 300, set: { on: true } }]}
      tail={1500}
      hint="Предложение: сегменты вырастают по очереди."
      render={(s) => (s.on ? <Donut animate /> : <div style={{ height: 160 }} />)}
    />
  );
}

function HBarDemo() {
  return (
    <Playback<{ g: boolean }>
      initial={{ g: false }}
      script={[{ at: 250, set: { g: true } }]}
      tail={900}
      render={(s) => (
        <div style={{ width: "min(360px, 100%)" }}>
          <HBar grown={s.g} />
        </div>
      )}
    />
  );
}

function SparkDemo() {
  return (
    <Playback<{ on: boolean }>
      initial={{ on: false }}
      script={[{ at: 300, set: { on: true } }]}
      tail={1000}
      hint="Предложение: контур рисуется слева направо."
      render={(s) => (
        <Tile label="Грузов за месяц" value="412">
          {s.on ? <Sparkline data={SP_UP} animate /> : <div style={{ height: 34 }} />}
          <Delta tone="good" dir="up">
            +8,4% к октябрю
          </Delta>
        </Tile>
      )}
    />
  );
}

export default defineDoc({
  id: "chart",
  title: "Chart",
  group: "data",
  cssPrefix: "ds-chart",
  order: 30,
  keywords: [
    "график",
    "chart",
    "graph",
    "диаграмма",
    "line",
    "линейный график",
    "donut",
    "пончик",
    "кольцо",
    "круговая диаграмма",
    "pie",
    "sparkline",
    "спарклайн",
    "delta",
    "дельта",
    "hbar",
    "bar",
    "столбцы",
    "полосы",
    "sla",
    "легенда",
    "legend",
    "подсказка",
    "tooltip",
    "аналитика",
    "dataviz",
  ],
  summary:
    "Графики для сводки: линия по периодам, кольцо долей, Sparkline с Delta в KPI, горизонтальные полосы и SLA-чип.",
  purpose:
    "График отвечает на один вопрос: сколько и куда движется. Всё рисуется на токенах палитры, подписи и числа в Onest с tabular-nums, интерактивность одинакова: наведение подсвечивает, легенда включает и выключает. Цвет сам по себе смысл не передаёт: у каждой серии есть подпись в легенде и в подсказке.",
  related: ["card", "badge", "skeleton", "data-table"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-chart__svg", side: "l" },
          { n: 2, anchor: ".ds-chart__grid", side: "r" },
          { n: 3, anchor: ".ds-chart__path", side: "r" },
          { n: 4, anchor: ".ds-chart__cross", side: "t" },
          { n: 5, anchor: ".ds-chart__tip", side: "r" },
          { n: 6, anchor: ".ds-chart__legend", side: "b" },
        ]}
      >
        <div className="ds-chart__wide">
          <LineChart hoverIndex={7} />
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Область графика",
        description:
          "Окно 640 × 240, ширина подстраивается под контейнер (в макете минимум 320; демо словаря сжимается до 200 для узких карточек, [TODO] решить минимум). Отступы: слева 34 под числа, снизу 24 под подписи.",
      },
      {
        name: "Сетка и оси",
        description:
          "Пять горизонтальных линий цветом --divider, числа слева округлены до десятков. Подписи периода — не чаще шести.",
      },
      {
        name: "Линии серий",
        description:
          "Обводка 2,5 px со скруглёнными стыками; под первой серией — заливка 13 %. Цвета: teal, orange, danger, info, text-3.",
      },
      {
        name: "Вертикаль и точки",
        description:
          "Пунктир --text-3 и кружки 4,5 px с обводкой цвета серии на наведённой неделе.",
        optional: true,
      },
      {
        name: "Подсказка",
        description:
          "Карточка на --surface с кольцом и тенью: период жирным, строки «цвет · серия · значение». Не выходит за края (70 px от краёв).",
        optional: true,
      },
      {
        name: "Легенда",
        description:
          "Кнопки 24 px: квадрат 10 px цвета серии и название. Клик включает и выключает серию.",
      },
    ],
  },
  variants: [
    {
      id: "line",
      title: "LineChart",
      description:
        "Несколько серий по периоду (неделя, месяц). Переключатель периода — ToggleGroup в шапке карточки: 4 · 12 · 26.",
      when: "динамика: грузы по неделям, расхождения по дням.",
      demo: (
        <div className="ds-chart__wide">
          <LineChart />
        </div>
      ),
    },
    {
      id: "donut",
      title: "Donut",
      description:
        "Кольцо долей 160 × 160, обводка 16. В центре сумма, под кольцом легенда с процентами. Сегменты разделены зазором 2 px.",
      when: "структура целого: статусы грузов. Не более пяти сегментов.",
      demo: <Donut />,
    },
    {
      id: "spark",
      title: "Sparkline + Delta",
      description:
        "Линия 34 px высотой без осей и подсказок внутри KPI-карточки; рядом Delta: «+8,4%» с стрелкой тренда.",
      when: "тренд числа в плитке. Точные значения Sparkline не показывает.",
      demo: (
        <>
          <Tile label="Рост" value="412">
            <Sparkline data={SP_UP} />
            <Delta tone="good" dir="up">
              +8,4% к октябрю
            </Delta>
          </Tile>
          <Tile label="Плохо растёт" value="37">
            <Sparkline data={SP_BAD} color="danger" />
            <Delta tone="bad" dir="up">
              +5 за неделю
            </Delta>
          </Tile>
        </>
      ),
    },
    {
      id: "delta",
      title: "Delta",
      description:
        "Тон — хорошо или плохо, а не вверх или вниз: рост расхождений красный, падение времени сверки teal. Направление — стрелкой.",
      when: "изменение к прошлому периоду рядом с числом.",
      demo: (
        <>
          <Delta tone="good" dir="up">
            +8,4%
          </Delta>
          <Delta tone="bad" dir="up">
            +5
          </Delta>
          <Delta tone="good" dir="down">
            −1,1 мин
          </Delta>
          <Delta tone="flat">0%</Delta>
        </>
      ),
    },
    {
      id: "hbar",
      title: "HBar",
      description:
        "Рейтинг: имя слева, значение справа, под ними полоска 6 px. Ширина — доля от максимума, а не от суммы.",
      when: "топ клиентов, топ маршрутов, 3–7 строк.",
      demo: (
        <div style={{ width: "min(360px, 100%)" }}>
          <HBar />
        </div>
      ),
    },
    {
      id: "sla",
      title: "SLA-чип",
      description:
        "Бейдж со значком часов: запас времени (ok), мало (warn), просрочено (err, с минусом). Тон — по запасу, а не по величине.",
      when: "срок реакции в строке таблицы или карточке расхождения.",
      demo: (
        <>
          <SlaChip tone="ok">6 ч 20 м</SlaChip>
          <SlaChip tone="warn">1 ч 05 м</SlaChip>
          <SlaChip tone="err">−45 м</SlaChip>
        </>
      ),
    },
  ],
  sizes: [
    {
      id: "line-h",
      title: "Высота линии",
      value: "240 px",
      note: "ширина — 100 %, минимум в макете 320",
      demo: (
        <div className="ds-chart__wide">
          <LineChart />
        </div>
      ),
    },
    {
      id: "donut-d",
      title: "Диаметр кольца",
      value: "160 · обводка 16",
      note: "при наведении сегмент 20",
      demo: <Donut />,
    },
    {
      id: "spark-h",
      title: "Sparkline",
      value: "34 px",
      note: "14 точек, линия 2 px",
      demo: (
        <div className="ds-chart__stack">
          <Sparkline data={SP_ORG} color="orange" />
        </div>
      ),
    },
  ],
  states,
  stateMatrix: {
    columns: ["Default", "Hover", "Выключена серия"],
    rows: [
      {
        label: "LineChart",
        cells: ["линии", "вертикаль, точки, подсказка", "серия серая в легенде, линия уходит"],
      },
      {
        label: "Donut",
        cells: ["кольцо", "сегмент 20, остальные 35 %", "—"],
      },
      {
        label: "HBar",
        cells: ["полоски", "подложка 4 % под строкой", "—"],
      },
    ],
  },
  choreography: [
    {
      id: "tooltip",
      title: "Подсказка на наведении",
      trigger: "указатель движется над графиком; стрелки клавиатуры на сфокусированном графике",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Вертикаль и кружки ставятся на ближайшую неделю: перескакивают дискретно, без плавного скольжения.",
          prop: "x1/x2, cx/cy",
        },
        {
          at: 0,
          dur: 100,
          what: "Подсказка проявляется; её положение следует за неделей, зажато 70 px от краёв.",
          prop: "opacity",
          easing: "linear",
        },
        {
          at: 600,
          dur: 0,
          what: "Указатель на другой неделе: значения в подсказке меняются сразу.",
          prop: "text",
        },
        {
          at: 1600,
          dur: 100,
          what: "Указатель ушёл с графика: подсказка гаснет, вертикаль и кружки исчезают.",
          prop: "opacity",
          easing: "linear",
        },
      ],
      focus:
        "Мышь фокус не берёт. Клавиатура: Tab ставит контур 2px, ←/→ двигают неделю, Home/End — край, Esc или уход фокуса убирает подсказку (предложение).",
      reducedMotion: "Переход прозрачности подсказки отключается: появляется и исчезает сразу.",
      neighbours:
        "Подсказка лежит поверх графика (z-index 3), pointer-events: none, соседние блоки карточки не сдвигаются.",
      demo: <TooltipDemo />,
    },
    {
      id: "legend",
      title: "Включение и выключение серии",
      trigger: "клик по пункту легенды (Enter / Space на фокусе)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Пункт легенды: подложка hover, затем маркер становится серым (--tone), подпись — --text-3.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Серия исчезает, шкала Y пересчитывается по оставшимся: график перерисовывается целиком.",
          prop: "d (path)",
        },
        {
          at: 1200,
          dur: 0,
          what: "Повторный клик возвращает серию. Выключить последнюю нельзя: клик игнорируется.",
          prop: "—",
        },
      ],
      focus: "Фокус остаётся на кнопке легенды; aria-pressed меняется сразу.",
      reducedMotion: "Нет анимации, только мгновенная перерисовка; настройка ничего не меняет.",
      neighbours: "Высота графика не меняется: соседи не прыгают. Подписи оси Y могут смениться.",
      demo: <LegendDemo />,
    },
    {
      id: "donut-hover",
      title: "Наведение на сегмент кольца или легенду",
      trigger: "указатель или фокус на сегменте или пункте легенды",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 150,
          what: "Остальные сегменты тускнеют до 35 %, выбранный остаётся 100 % и утолщается 16 → 20.",
          prop: "opacity, stroke-width",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "В центре число сегмента (доля от суммы) и его имя вместо «в работе».",
          prop: "text",
        },
        {
          at: 0,
          dur: 125,
          what: "Пункт легенды получает подложку 9 %: связь сегмент ⇄ легенда работает в обе стороны.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1800,
          dur: 150,
          what: "Указатель ушёл: всё возвращается, в центре снова общая сумма.",
          prop: "opacity, stroke-width",
          easing: "ease",
        },
      ],
      focus:
        "Фокус на пункте легенды делает то же, что наведение (предложение); у кольца отдельной точки Tab нет — оно дублируется легендой.",
      reducedMotion: "Переходы отключаются, выделение мгновенное.",
      neighbours: "Кольцо растёт на обводку 4 px, но внутри окна 160 px: легенда не сдвигается.",
      demo: <DonutDemo />,
    },
    {
      id: "hbar-grow",
      title: "Рост полос HBar",
      trigger: "блок появился на экране (данные получены)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Полоски нулевой ширины, значения справа уже видны.",
          prop: "width",
        },
        {
          at: 250,
          dur: 700,
          what: "Все полоски растут до своей доли одновременно.",
          prop: "width",
          easing: "--ease (cubic-bezier(.6,0,.05,.95))",
        },
        {
          at: 950,
          dur: 125,
          what: "Наведение на строку: подложка 4 % под всей строкой.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus: "Строки не в Tab: это отчёт, не список действий.",
      reducedMotion: "Рост заменяется мгновенной шириной (transition: none).",
      neighbours: "Размеры блока заданы заранее, строки не сдвигаются.",
      demo: <HBarDemo />,
    },
    {
      id: "line-appear",
      title: "Появление линий",
      trigger: "график первый раз попал в карточку или период переключён",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 900,
          what: "Контуры рисуются слева направо (stroke-dashoffset 1 → 0 при pathLength 1).",
          prop: "stroke-dashoffset",
          easing: "--ease",
        },
        {
          at: 400,
          dur: 500,
          what: "Заливка под первой серией проявляется (0 → 13 %).",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 1000,
          dur: 0,
          what: "Подсказка работает сразу, не дожидаясь конца рисования.",
          prop: "—",
        },
      ],
      focus: "Фокус и подсказка доступны во время анимации.",
      reducedMotion: "Линии и заливка появляются сразу, без рисования.",
      neighbours:
        "Анимируется только содержимое окна; оси и сетка стоят на месте, карточка не меняет высоту.",
      demo: <AppearDemo />,
    },
    {
      id: "donut-appear",
      title: "Появление кольца",
      trigger: "кольцо впервые отрисовано",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 600,
          what: "Сегмент «Сверено» вырастает от нуля по окружности.",
          prop: "stroke-dasharray",
          easing: "--ease",
        },
        {
          at: 120,
          dur: 600,
          what: "Следующий сегмент стартует со сдвигом 120 мс.",
          prop: "stroke-dasharray",
          easing: "--ease",
        },
        {
          at: 360,
          dur: 600,
          what: "Последний сегмент закрывает круг к ~960 мс.",
          prop: "stroke-dasharray",
          easing: "--ease",
        },
      ],
      focus: "Легенда и подсказки работают сразу.",
      reducedMotion: "Кольцо рисуется целиком, без роста.",
      neighbours: "Числа в легенде и в центре показаны сразу, до конца роста.",
      demo: <DonutAppearDemo />,
    },
    {
      id: "spark-appear",
      title: "Sparkline в KPI",
      trigger: "KPI-карточка загрузилась (после Skeleton)",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 700,
          what: "Контур рисуется слева направо.",
          prop: "stroke-dashoffset",
          easing: "--ease",
        },
        { at: 300, dur: 400, what: "Заливка 14 % проявляется.", prop: "opacity", easing: "ease" },
      ],
      focus: "Не фокусируется: у sparkline нет интерактива.",
      reducedMotion: "Рисуется сразу целиком.",
      neighbours: "Число и Delta стоят на месте и видны сразу.",
      demo: <SparkDemo />,
    },
  ],
  rules: {
    use: [
      "Цвета серий только из токенов: teal, orange, danger, info, text-3. Первая серия — teal.",
      "Подпись у каждой серии: в легенде и в подсказке, не только цветом.",
      "Delta красит по смыслу (хорошо/плохо), стрелка показывает направление.",
      "Числа и подписи Onest tabular-nums; Fira Code в графиках не нужен.",
      "Для даты и срока — SLA-чип с минусом у просрочки, а не красный кружок.",
      "Состояние загрузки — Skeleton по форме графика, пустой период — оси и подпись.",
    ],
    avoid: [
      "Более пяти сегментов в кольце и более четырёх линий: сгруппируйте хвост в «Прочее».",
      "Свои HEX-цвета и градиенты в сериях.",
      "Моноширинные цифры в осях, подсказках и легендах.",
      "Левые цветные акцентные полосы на плитках KPI: тон выражается значком и Delta.",
      "3D, тени у линий и столбцов, эффекты «взрыва» сегментов.",
      "Передавать смысл только красным против зелёным: рядом всегда слово или знак (+, −, стрелка).",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role и подписи",
      text: 'Контейнер линии: role="group" и aria-label со списком серий; кольцо и Sparkline — role="img" с текстом («Статусы: Сверено 52 %, …»). Таблица значений для скринридера — [TODO] (предложение: скрытая таблица с теми же числами).',
    },
    {
      kind: "key",
      title: "← / → / Home / End",
      text: "На сфокусированном LineChart двигают выбранную неделю и подсказку. Esc снимает. Предложение: в макете график только для мыши.",
    },
    {
      kind: "key",
      title: "Tab, Enter / Space",
      text: "Легенда — обычные кнопки с aria-pressed; пункты кольца дублируют сегменты и получают фокус.",
    },
    {
      kind: "aria",
      title: "aria-live у подсказки",
      text: 'Подсказка с role="status" озвучивает выбранную неделю при работе с клавиатуры. У мыши не нужна.',
    },
    {
      kind: "contrast",
      title: "Линии на светлой теме: ниже нормы",
      text: "Нетекстовые элементы должны быть ≥ 3:1. На белом --surface: teal 1,85:1, orange 2,18:1 — не проходят; danger 4,94:1, info 5,17:1, text-3 4,91:1 проходят. На тёмной (#151b23): teal 9,3:1, orange 7,9:1, danger 6,2:1. [TODO] для светлой темы подобрать тёмные варианты линий (как --ok-text для текста) или добавить маркеры и подписи на концах линий.",
    },
    {
      kind: "contrast",
      title: "Delta",
      text: "Текст на подложке 15 %: светлая — good 4,3:1, bad 4,4:1 (при нужных 4,5:1 для 11px); flat 6,8:1. Тёмная: от 6,3:1. [TODO] затемнить --ok-text/--err-text для Delta или поднять размер.",
    },
    {
      kind: "note",
      title: "Не только цвет",
      text: "Серии отличаются подписью в легенде и подсказке; для различия без цвета [TODO] решить: пунктир второй линии или маркеры.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Рисование линий, рост сегментов и полос, затухание подсказки отключаются; значения и интерактив те же.",
    },
  ],
  tokens: [
    {
      name: "--teal / --orange",
      value: "#00d4d0 / #ff9455",
      usage: "Серии 1 и 2, градиент HBar (начало)",
      kind: "color",
    },
    {
      name: "--danger / --info",
      value: "#d03538 / #2563eb (тёмная #ff6b6b / #7ab0ff)",
      usage: "Серии 3 и 4, тон Delta bad",
      kind: "color",
    },
    {
      name: "--text-3 / --tone",
      value: "#66727f / ink 7 %",
      usage: "Серия «прочее», подписи осей, дорожка кольца и полос",
      kind: "color",
    },
    {
      name: "--divider",
      value: "#e0e4e9 (тёмная #323e4b)",
      usage: "Горизонтальная сетка",
      kind: "color",
    },
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6",
      usage: "Подсказка и кружки точек",
      kind: "color",
    },
    {
      name: "--ok-text / --err-text",
      value: "#00807a / #c92a2a",
      usage: "Текст Delta good и bad",
      kind: "color",
    },
    {
      name: "--layer-1 / --layer-2",
      value: "ink 4 % / 9 %",
      usage: "Hover строки HBar · hover пункта легенды",
      kind: "color",
    },
    { name: "line", value: "2,5 px (spark 2 px)", usage: "Толщина линии", kind: "size" },
    {
      name: "plot",
      value: "240 px · поля 34 / 24 / 10 / 8",
      usage: "Окно LineChart",
      kind: "size",
    },
    { name: "donut", value: "160 px, обводка 16/20, зазор 2", usage: "Кольцо", kind: "size" },
    {
      name: "--r-card / --r-item",
      value: "10 / 8 px",
      usage: "Подсказка · пункт легенды и строка HBar",
      kind: "radius",
    },
    { name: "--shadow-pop", value: "0 6px 20px …", usage: "Тень подсказки", kind: "shadow" },
    { name: "tooltip fade", value: "100 мс linear", usage: "Появление подсказки", kind: "time" },
    {
      name: "donut hover",
      value: "150 мс ease",
      usage: "Толщина и прозрачность сегментов",
      kind: "time",
    },
    { name: "hbar grow", value: "700 мс --ease", usage: "Рост полос", kind: "time" },
    {
      name: "--ease",
      value: "cubic-bezier(.6,0,.05,.95)",
      usage: "Рост полос, рисование линий (предложение)",
      kind: "ease",
    },
  ],
  examples: [
    {
      id: "kpi",
      title: "KPI-плитка со Sparkline",
      demo: (
        <Tile label="Расхождения" value="37">
          <Sparkline data={SP_BAD} color="danger" />
          <Delta tone="bad" dir="up">
            +5 за неделю
          </Delta>
        </Tile>
      ),
      code: `<Sparkline data={weekly} color="danger" />
<Delta tone="bad" dir="up">+5 за неделю</Delta>`,
    },
    {
      id: "line",
      title: "Линия по неделям",
      demo: (
        <div className="ds-chart__wide">
          <LineChart labels={WEEKS} series={SERIES} />
        </div>
      ),
      code: `<LineChart labels={weeks} series={[{ name: "Все грузы", color: "teal", data }]} />`,
    },
    {
      id: "top",
      title: "Топ клиентов",
      demo: (
        <div style={{ width: "min(360px, 100%)" }}>
          <HBar rows={TOP_CLIENTS} />
        </div>
      ),
      code: `<HBar rows={[{ label: "ООО «Дальснаб»", value: 312 }, …]} />`,
    },
  ],
});

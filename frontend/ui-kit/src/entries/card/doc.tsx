/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoButton } from "../button/demo";
import { Sk, SkGroup } from "../skeleton/demo";
import {
  CardFoot,
  CardH,
  CardHead,
  DemoCard,
  KpiCard,
  TwoButtonCard,
  type CardForce,
} from "./demo";

const SP_UP = [22, 24, 23, 27, 26, 30, 29, 33, 31, 36, 35, 40, 38, 44];
const SP_BAD = [12, 14, 13, 15, 14, 18, 17, 19, 22, 21, 25, 27, 30, 33];

function Basic({
  variant,
  title,
  text,
}: {
  variant: "outline" | "elevated" | "filled" | "ghost" | "solid";
  title: string;
  text: string;
}) {
  return (
    <div className="ds-card__cell">
      <DemoCard variant={variant}>
        <CardHead icon="doc">{title}</CardHead>
        <div className="ds-card__value">342</div>
        <div className="ds-card__muted">{text}</div>
      </DemoCard>
    </div>
  );
}

function LinkCard({
  force,
  selected,
  disabled,
  title = "Кликабельная",
  text = "Переход в раздел.",
}: {
  force?: CardForce;
  selected?: boolean;
  disabled?: boolean;
  title?: string;
  text?: string;
}) {
  return (
    <div className="ds-card__cell">
      <DemoCard size="sm" link selected={selected} disabled={disabled} force={force}>
        <CardHead
          icon={selected ? "check" : "box"}
          action={<span className="ds-card__muted">›</span>}
        >
          {title}
        </CardHead>
        <div className="ds-card__muted">{text}</div>
      </DemoCard>
    </div>
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Default",
    note: "Кольцо 1px --border, фон --surface.",
    demo: <LinkCard />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Слой ink 4 % и кольцо темнее (--text-3). Только у кликабельной.",
    forced: true,
    demo: <LinkCard force="hover" title="Hover" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Слой 7 % и сдвиг вниз на 1 px.",
    forced: true,
    demo: <LinkCard force="active" title="Active" />,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Контур 2px --focus с отступом 2px: кольцо карточки остаётся видно.",
    forced: true,
    demo: <LinkCard force="focus" title="Focus" />,
  },
  {
    id: "selected",
    kind: "selected",
    title: "Selected",
    note: "Подложка --selected и кольцо --border-selected; значок-галочка. aria-current.",
    demo: <LinkCard selected title="Выбрана" text="Подложка «выбрано» и кольцо акцента." />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Предложение: фон --surface-muted, текст --text-ph, без hover; свои цвета, не прозрачность. В макете не показано. [TODO]",
    demo: <LinkCard disabled title="Недоступна" text="Нет прав на раздел." />,
  },
  {
    id: "loading",
    kind: "loading",
    title: "Loading",
    note: "Сохраняется оболочка и кнопки подвала; содержимое — Skeleton тех же размеров.",
    demo: (
      <div className="ds-card__cell">
        <DemoCard size="sm">
          <SkGroup>
            <Sk w="45%" h={14} />
            <Sk h={11} />
            <Sk w="92%" h={11} />
            <Sk w="60%" h={11} />
            <div className="ds-skel-btns">
              <Sk h={28} shape="item" />
              <Sk h={28} shape="item" />
            </div>
          </SkGroup>
        </DemoCard>
      </div>
    ),
  },
  {
    id: "empty",
    kind: "empty",
    title: "Empty",
    note: "Предложение: заголовок остаётся, в теле одна строка «Данных пока нет» и действие. [TODO] тексты.",
    demo: (
      <div className="ds-card__cell">
        <DemoCard size="sm">
          <CardHead icon="inbox">Расхождения</CardHead>
          <div className="ds-card__muted">Расхождений нет. Агент проверит новые грузы сам.</div>
        </DemoCard>
      </div>
    ),
  },
  {
    id: "error",
    kind: "error",
    title: "Error",
    note: "Тон err значка заголовка: «Тон значка: ошибка». Заливки тоном нет, только solid.",
    demo: (
      <div className="ds-card__cell">
        <DemoCard size="sm" tone="err">
          <CardHead icon="alert">Не удалось загрузить</CardHead>
          <div className="ds-card__muted">ПО таможни не отвечает. Данные не потеряны.</div>
          <CardFoot>
            <DemoButton variant="outline" size="sm">
              Повторить
            </DemoButton>
          </CardFoot>
        </DemoCard>
      </div>
    ),
  },
];

function HoverDemo() {
  return (
    <Playback<{ f?: CardForce }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1400, set: { f: "active" } },
        { at: 1700, set: { f: "hover" } },
        { at: 2500, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => <LinkCard force={s.f} title="Сверка документов" text="Открыть раздел." />}
    />
  );
}

function SelectDemo() {
  return (
    <Playback<{ sel: boolean; f?: CardForce }>
      initial={{ sel: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1100, set: { f: "active" } },
        { at: 1400, set: { sel: true, f: "hover" } },
        { at: 2400, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <LinkCard
          selected={s.sel}
          force={s.f}
          title={s.sel ? "Выбрана" : "Тариф «Старт»"}
          text="Подложка и кольцо меняются переходом 125 мс."
        />
      )}
    />
  );
}

function KpiLoadDemo() {
  return (
    <Playback<{ loaded: boolean }>
      initial={{ loaded: false }}
      script={[{ at: 1300, set: { loaded: true } }]}
      tail={1000}
      hint="Предложение: данные проявляются за 200 мс; в макете KPI заполняются сразу."
      render={(s) => (
        <div className="ds-card__cell">
          {s.loaded ? (
            <div className="ds-skel-reveal">
              <KpiCard
                icon="box"
                label="Грузов за месяц"
                value="412"
                delta="+8,4%"
                data={SP_UP}
                note="к октябрю: 380"
              />
            </div>
          ) : (
            <DemoCard size="sm">
              <SkGroup>
                <Sk w="55%" h={14} />
                <Sk w="40%" h={22} />
                <Sk h={34} shape="item" />
                <Sk w="45%" h={11} />
              </SkGroup>
            </DemoCard>
          )}
        </div>
      )}
    />
  );
}

function KpiHoverDemo() {
  return (
    <Playback<{ f?: CardForce }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1600, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <div className="ds-card__cell">
          <KpiCard
            icon="warn"
            tone="err"
            label="Расхождения"
            value="37"
            delta="+5"
            deltaTone="bad"
            data={SP_BAD}
            sparkColor="danger"
            note="за неделю"
            force={s.f}
          />
        </div>
      )}
    />
  );
}

function TwoButtonDemo() {
  return (
    <Playback<{ f?: "hover" | "active" }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1200, set: { f: "active" } },
        { at: 1500, set: { f: "hover" } },
        { at: 2200, set: { f: undefined } },
      ]}
      tail={500}
      render={(s) => (
        <div className="ds-card__cell">
          <TwoButtonCard force={s.f} />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "card",
  title: "Card",
  group: "data",
  cssPrefix: "ds-card",
  order: 10,
  keywords: [
    "карточка",
    "card",
    "kpi",
    "плитка",
    "tile",
    "panel",
    "панель",
    "surface",
    "поверхность",
    "контейнер",
    "виджет",
    "widget",
    "сводка",
    "показатель",
    "кликабельная карточка",
    "elevated",
    "outline",
    "flush",
  ],
  summary:
    "Поверхность для группы связанного содержимого: заголовок, значение или текст, подвал с кнопками. Пять видов, два размера, кликабельная и выбранная.",
  purpose:
    "Карточка собирает один смысл: плитку KPI, расхождение, раздел. Граница — кольцо 1px поверх содержимого, поэтому она видна по бокам в обеих темах. Тон выражается значком в заголовке, а не цветной полосой слева. Две кнопки в подвале всегда делят ширину пополам.",
  related: ["service-card", "chart", "skeleton", "button", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-card", side: "r" },
          { n: 2, anchor: ".ds-card__title", side: "t" },
          { n: 3, anchor: ".ds-card__head .ds-btn", side: "r" },
          { n: 4, anchor: ".ds-card__value", side: "l" },
          { n: 5, anchor: ".ds-card__foot", side: "r" },
        ]}
      >
        <div className="ds-card__cell">
          <DemoCard>
            <CardHead
              icon="doc"
              action={<DemoButton variant="ghost" size="xs" square icon="more" label="Меню" />}
            >
              Outline
            </CardHead>
            <div className="ds-card__value">342</div>
            <div className="ds-card__muted">Кольцо 1px, без тени. Поле 24, радиус 14.</div>
            <CardFoot>
              <DemoButton variant="outline" size="sm">
                Открыть
              </DemoButton>
              <span className="ds-card__muted">обновлено 10:42</span>
            </CardFoot>
          </DemoCard>
        </div>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "Поле 24 (16 в sm), радиус 14 (10 в sm), gap 16 (12). Кольцо рисует ::after со z-index 3, поверх фона и потомков.",
      },
      {
        name: "Заголовок",
        description:
          "Значок 16 цветом тона, название 15/700 (13 в sm), справа действия. Тон значка: ok · warn · err.",
        optional: true,
      },
      {
        name: "Действие в шапке",
        description: "Ghost-кнопка 24 «⋯» или Delta (в KPI).",
        optional: true,
      },
      {
        name: "Значение",
        description: "30/700 (22 в sm), Onest tabular-nums; не Fira Code.",
        optional: true,
      },
      {
        name: "Подвал",
        description:
          "Линия --divider сверху, отступ 12. Одна кнопка — по размеру; две — 50/50, главная слева.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "outline",
      title: "Outline",
      description: "Основная карточка: кольцо 1px, без тени, поле 24, радиус 14.",
      when: "по умолчанию: блоки страницы, плитки, панели.",
      demo: <Basic variant="outline" title="Outline" text="Кольцо 1px, без тени." />,
    },
    {
      id: "elevated",
      title: "Elevated",
      description: "Кольцо и лёгкая тень --shadow-panel.",
      when: "плавающие блоки поверх подложки.",
      demo: <Basic variant="elevated" title="Elevated" text="Кольцо и лёгкая тень." />,
    },
    {
      id: "filled",
      title: "Filled",
      description: "Подложка --surface-muted без кольца.",
      when: "плитки внутри другой карточки (например KPI в Sparkline-блоке).",
      demo: <Basic variant="filled" title="Filled" text="Без кольца, фон muted." />,
    },
    {
      id: "ghost",
      title: "Ghost",
      description: "Без подложки и кольца: только раскладка карточки.",
      when: "группировка внутри карточки или на странице.",
      demo: <Basic variant="ghost" title="Ghost" text="Без подложки и кольца." />,
    },
    {
      id: "solid",
      title: "Solid",
      description: "Заливка --primary, текст navy. Одна на экран, как главная кнопка.",
      when: "один главный итог страницы: «5 из 6 программ подключено».",
      demo: (
        <div className="ds-card__cell">
          <DemoCard variant="solid" size="sm">
            <CardHead icon="link">Solid</CardHead>
            <div className="ds-card__value">5 из 6</div>
            <div className="ds-card__muted">Одна на экран.</div>
          </DemoCard>
        </div>
      ),
    },
    {
      id: "link",
      title: "Кликабельная",
      description:
        "Вся карточка — переход: курсор pointer, tabindex 0, значок «›» справа. Есть hover, active, focus.",
      when: "переход в раздел или объект без отдельной кнопки.",
      demo: <LinkCard />,
    },
    {
      id: "selected",
      title: "Выбрана",
      description: "Подложка --selected, кольцо --border-selected, значок-галочка.",
      when: "выбор одного из нескольких: тариф, шаблон.",
      demo: <LinkCard selected title="Выбрана" text="Подложка и кольцо акцента." />,
    },
    {
      id: "flush",
      title: "Без полей (flush)",
      description: "Padding 0, overflow clip; шапка 44 + тело 14. Для таблиц, списков и графиков.",
      when: "DataTable, список, график: содержимое доходит до кромки, кольцо остаётся поверх.",
      demo: (
        <div className="ds-card__cell">
          <DemoCard flush>
            <CardH sub="128 строк">DataTable</CardH>
            <div className="ds-card__b">
              <span className="ds-card__lbl">Тело</span>
              <span className="ds-card__muted">Таблица или график без внутренних полей.</span>
            </div>
          </DemoCard>
        </div>
      ),
    },
    {
      id: "kpi",
      title: "KPI-карточка",
      description:
        "Sm: значок, подпись (500, text-2), Delta справа; число 22/700; Sparkline 34; пояснение. Hover — подъём на 1 px.",
      when: "сводка в начале экрана: 4 плитки в ряд.",
      demo: (
        <>
          <div className="ds-card__cell">
            <KpiCard
              icon="box"
              label="Грузов за месяц"
              value="412"
              delta="+8,4%"
              data={SP_UP}
              note="к октябрю: 380"
            />
          </div>
          <div className="ds-card__cell">
            <KpiCard
              icon="warn"
              tone="err"
              label="Расхождения"
              value="37"
              delta="+5"
              deltaTone="bad"
              data={SP_BAD}
              sparkColor="danger"
              note="за неделю"
            />
          </div>
        </>
      ),
    },
    {
      id: "two-buttons",
      title: "С двумя кнопками",
      description:
        "Подвал: главная и вторая 50/50 по ширине, главная слева. Тон err у значка заголовка.",
      when: "решение по объекту: «Исправить» и «Позже».",
      demo: (
        <div className="ds-card__cell">
          <TwoButtonCard />
        </div>
      ),
    },
  ],
  sizes: [
    {
      id: "md",
      title: "Обычная",
      value: "поле 24 · радиус 14",
      demo: <Basic variant="outline" title="Обычная" text="Заголовок 15, значение 30." />,
    },
    {
      id: "sm",
      title: "Sm",
      value: "поле 16 · радиус 10",
      demo: <LinkCard title="Sm" text="Заголовок 13, значение 22." />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Default", "Hover", "Active", "Focus"],
    rows: [
      {
        label: "outline · link",
        cells: [
          "кольцо --border",
          "слой 4 %, кольцо --text-3",
          "слой 7 %, сдвиг 1px",
          "контур 2px, отступ 2px",
        ],
      },
      {
        label: "solid · link",
        cells: ["--primary", "темнее на 6 %", "темнее на 12 %, сдвиг 1px", "контур 2px"],
      },
      {
        label: "selected · link",
        cells: ["--selected + кольцо акцента", "слой 4 %", "слой 7 %", "контур 2px"],
      },
      {
        label: "не кликабельная",
        cells: ["без реакции", "без реакции", "без реакции", "не в Tab"],
      },
    ],
  },
  choreography: [
    {
      id: "hover-press",
      title: "Наведение и нажатие кликабельной карточки",
      trigger: "указатель входит и нажимает; Enter на фокусе",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: фон темнеет на 4 %, кольцо переходит от --border к --text-3.",
          prop: "background, box-shadow (::after)",
          easing: "ease",
        },
        {
          at: 1000,
          dur: 125,
          what: "Нажатие: фон 7 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1000,
          dur: 200,
          what: "Карточка опускается на 1 px.",
          prop: "translate",
          easing: "ease",
        },
        {
          at: 1300,
          dur: 200,
          what: "Отпускание: возврат в hover, затем действие (переход).",
          prop: "translate, background",
          easing: "ease",
        },
        {
          at: 2100,
          dur: 125,
          what: "Указатель ушёл: слой и кольцо возвращаются.",
          prop: "background, box-shadow",
          easing: "ease",
        },
      ],
      focus:
        "Фокус клавиатурой даёт контур 2px --focus с отступом 2px; кольцо карточки остаётся. Enter ведёт себя как клик.",
      reducedMotion:
        "Переходы 125 мс и сдвиг 1px отключаются: слои меняются мгновенно, сдвига нет.",
      neighbours:
        "Сдвиг 1px — собственный (translate), соседи не двигаются: место в сетке не меняется.",
      demo: <HoverDemo />,
    },
    {
      id: "select",
      title: "Выбор карточки",
      trigger: "клик или Enter / Space по карточке-варианту",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Фон и кольцо идут к --selected и --border-selected, как у выбранной строки таблицы.",
          prop: "background, box-shadow",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Значок заменяется галочкой, aria-current=true. У предыдущей выбранной карточки обратный переход.",
          prop: "icon",
        },
      ],
      focus: "Фокус остаётся на карточке.",
      reducedMotion: "Цвета меняются мгновенно.",
      neighbours: "Размеры не меняются: рамка одинаковой толщины, содержимое не прыгает.",
      demo: <SelectDemo />,
    },
    {
      id: "kpi-load",
      title: "KPI: заглушка → данные",
      trigger: "данные плитки пришли",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 1300,
          what: "Skeleton с теми же габаритами: подпись, число, график, пояснение. Волна 1,4 с.",
          prop: "translate (::after)",
          easing: "ease-in-out",
        },
        {
          at: 1300,
          dur: 200,
          what: "Содержимое проявляется на месте заглушки, без сдвига высоты.",
          prop: "opacity",
          easing: "ease",
        },
        {
          at: 1300,
          dur: 700,
          what: "Sparkline рисуется слева направо (см. Chart).",
          prop: "stroke-dashoffset",
          easing: "--ease",
        },
      ],
      focus: "Фокус не теряется: у KPI-плитки интерактивных элементов нет.",
      reducedMotion: "Волна выключена (статичная заглушка), данные появляются без проявления.",
      neighbours: "Размеры плитки заданы заранее: соседние плитки не прыгают.",
      demo: <KpiLoadDemo />,
    },
    {
      id: "kpi-hover",
      title: "Подъём KPI-плитки",
      trigger: "указатель над KPI-плиткой",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Плитка поднимается на 1 px.",
          prop: "translate",
          easing: "ease",
        },
        {
          at: 1200,
          dur: 200,
          what: "Указатель ушёл: возврат на место.",
          prop: "translate",
          easing: "ease",
        },
      ],
      focus: "У плитки нет фокуса. Если она кликабельная, действуют правила кликабельной карточки.",
      reducedMotion: "Подъём отключён.",
      neighbours: "translate не меняет раскладку: соседние плитки на месте.",
      demo: <KpiHoverDemo />,
    },
    {
      id: "two-buttons",
      title: "Две кнопки в подвале",
      trigger: "наведение и нажатие на кнопку подвала",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover главной кнопки: слой по правилам Button. Ширина обеих кнопок равна, ничего не меняется.",
          prop: "background (кнопки)",
          easing: "ease",
        },
        {
          at: 800,
          dur: 125,
          what: "Нажатие: слой active.",
          prop: "background (кнопки)",
          easing: "ease",
        },
      ],
      focus: "Tab идёт слева направо: главная, вторая. Контур 2px у кнопки, не у карточки.",
      reducedMotion: "Переходы слоя кнопок отключаются.",
      neighbours:
        "Карточка не реагирует: она не кликабельная; у кликабельной карточки кнопки внутри не ставят.",
      demo: <TwoButtonDemo />,
    },
  ],
  rules: {
    use: [
      "Граница — кольцо ::after на всю длину: видно по бокам в светлой и тёмной теме.",
      "Тон — значок заголовка (ok, warn, err); заливку тоном даёт только solid.",
      "Две кнопки в карточке: 50/50 по ширине, главная слева. Одна — по размеру содержимого.",
      "Числа и ID в Onest с tabular-nums.",
      "Кликабельная — вся карточка, без вложенных кнопок.",
      "Filled — для плиток внутри карточки, где кольцо дало бы двойную рамку.",
    ],
    avoid: [
      "Цветная полоса слева или сверху как акцент.",
      "Моноширинный шрифт у цифр и номеров контейнеров.",
      "Кнопки в кликабельной карточке: два действия на одну область.",
      "Больше одной solid-карточки на экран.",
      "Тень вместо кольца: тема тёмная, тень не видна.",
      "Прозрачность для disabled: свои цвета (--surface-muted, --text-ph).",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Кликабельная карточка",
      text: 'Переход — настоящая ссылка внутри карточки с растянутой областью клика либо role="link" на контейнере; в демо role="link", tabindex=0. Название — из заголовка (aria-label, если заголовка нет).',
    },
    {
      kind: "key",
      title: "Enter",
      text: "Активирует кликабельную карточку. Space у ссылки не работает; для карточки-выбора (aria-current) допустим Space.",
    },
    {
      kind: "aria",
      title: "aria-current / aria-disabled",
      text: "Выбранная — aria-current=true; недоступная — aria-disabled=true и выходит из Tab.",
    },
    {
      kind: "focus",
      title: "Контур 2px с отступом 2px",
      text: "Контур вне кольца: кольцо 1px остаётся читаемым. Цвет --focus: светлая #00968f, тёмная teal.",
    },
    {
      kind: "contrast",
      title: "Кольцо",
      text: "--border на --surface: светлая 1,6:1, тёмная 2,5:1 — ниже 3:1 для границы компонента. Граница выручает за счёт того, что карточка ещё и отличается фоном от --page. [TODO] решить: поднять --border или принять как есть (в макете «контраст линий поднят» уже сделан).",
    },
    {
      kind: "contrast",
      title: "Solid",
      text: "Navy на teal ≈ 8,9:1. Приглушённая подпись (navy 75 %) ≈ 4,3:1 — ниже 4,5:1 для 13px. [TODO] использовать полный navy для подписей solid-карточки.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Сдвиг на 1px при active, подъём KPI и переходы слоёв отключаются; волна Skeleton гаснет.",
    },
  ],
  tokens: [
    {
      name: "--surface / --surface-muted",
      value: "#fff / #eceef2 (тёмная #151b23 / #1f2833)",
      usage: "Фон outline · filled",
      kind: "color",
    },
    {
      name: "--border / --text-3",
      value: "#c6cdd6 / #66727f",
      usage: "Кольцо покоя · кольцо hover",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % на surface / teal 60 %",
      usage: "Выбранная",
      kind: "color",
    },
    { name: "--primary / --on-primary", value: "#00d4d0 / navy", usage: "Solid", kind: "color" },
    { name: "--divider", value: "#e0e4e9", usage: "Линия подвала и шапки flush", kind: "color" },
    {
      name: "--link / --warn-text / --danger",
      value: "#007f7a / #b45309 / #d03538",
      usage: "Тон значка ok · warn · err",
      kind: "color",
    },
    {
      name: "--ink 4 % / 7 %",
      value: "слои hover · active",
      usage: "Фон кликабельной",
      kind: "color",
    },
    {
      name: "--r-panel / --r-card",
      value: "14 / 10 px",
      usage: "Радиус обычной · sm",
      kind: "radius",
    },
    { name: "pad", value: "24 / 16 px", usage: "Поле обычной · sm", kind: "size" },
    {
      name: "--shadow-panel",
      value: "0 1px 3px rgba(14,20,28,.18)",
      usage: "Elevated",
      kind: "shadow",
    },
    {
      name: "--fs-qty / --fs-body / --fs-title",
      value: "15 / 13 / 22 px",
      usage: "Заголовок · заголовок sm · значение sm (обычная — 30)",
      kind: "font",
    },
    { name: "--dur-f", value: "125 мс", usage: "Фон и кольцо", kind: "time" },
    { name: "--dur", value: "200 мс", usage: "Сдвиг translate", kind: "time" },
  ],
  examples: [
    {
      id: "kpi",
      title: "KPI-плитка",
      demo: (
        <div className="ds-card__cell">
          <KpiCard
            icon="box"
            label="Грузов за месяц"
            value="412"
            delta="+8,4%"
            data={SP_UP}
            note="к октябрю: 380"
          />
        </div>
      ),
      code: `<KpiCard
  icon={<Icon name="box" />} label="Грузов за месяц" value="412"
  delta="+8,4%" deltaDir="up" data={weekly} note="к октябрю: 380"
/>`,
    },
    {
      id: "decision",
      title: "Решение по расхождению",
      demo: (
        <div className="ds-card__cell">
          <TwoButtonCard />
        </div>
      ),
      code: `<Card size="sm" tone="err">
  <CardHeader icon={<Icon name="warn" />}>Расхождение по весу</CardHeader>
  <CardFooter two>
    <Button size="sm">Исправить</Button>
    <Button size="sm" variant="outline">Позже</Button>
  </CardFooter>
</Card>`,
    },
  ],
});

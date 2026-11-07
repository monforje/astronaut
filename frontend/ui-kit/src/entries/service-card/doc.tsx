/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { byId, DemoServiceCard, SERVICES, type SvcForce, type SvcStatus } from "./demo";

const c1 = byId("1c");
const alta = byId("alta");
const port = byId("port");
const mdm = byId("mdm");

const Cell = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-svc-cell">{children}</div>
);

function HoverDemo() {
  return (
    <Playback<{ f?: SvcForce }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1800, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <Cell>
          <DemoServiceCard svc={c1} force={s.f} />
        </Cell>
      )}
    />
  );
}

function TestDemo() {
  return (
    <Playback<{ busy: boolean }>
      initial={{ busy: false }}
      script={[
        { at: 500, set: { busy: true } },
        { at: 1400, set: { busy: false } },
      ]}
      tail={1200}
      hint="Результат («Подключение работает · ответ за 128 мс») — Toast, см. его страницу."
      render={(s) => (
        <Cell>
          <DemoServiceCard svc={c1} busy={s.busy} />
        </Cell>
      )}
    />
  );
}

function ConnectDemo() {
  return (
    <Playback<{ st: SvcStatus; pct: number }>
      initial={{ st: "off", pct: 0 }}
      script={[
        { at: 500, set: { st: "syncing", pct: 12 } },
        { at: 1100, set: { pct: 41 } },
        { at: 1700, set: { pct: 78 } },
        { at: 2300, set: { st: "ok", pct: 100 } },
      ]}
      tail={1400}
      hint="Предложение: проценты растут по ответу API; в макете полоса неопределённая, число статично. [TODO]"
      render={(s) => (
        <Cell>
          <DemoServiceCard svc={mdm} status={s.st} progress={s.pct} />
        </Cell>
      )}
    />
  );
}

function KeyDemo() {
  return (
    <Playback<{ st: SvcStatus; busy: boolean }>
      initial={{ st: "err", busy: false }}
      script={[
        { at: 500, set: { busy: true } },
        { at: 1400, set: { st: "ok", busy: false } },
      ]}
      tail={1600}
      render={(s) => (
        <Cell>
          <DemoServiceCard svc={port} status={s.st} busy={s.busy} />
        </Cell>
      )}
    />
  );
}

function SwitchDemo() {
  return (
    <Playback<{ st: SvcStatus }>
      initial={{ st: "ok" }}
      script={[
        { at: 600, set: { st: "off" } },
        { at: 2200, set: { st: "ok" } },
      ]}
      tail={900}
      hint="Предложение для проверки: после выключения Toast «Отменить» живёт 5 с (в макете так). Здесь отмена показана вторым шагом."
      render={(s) => (
        <Cell>
          <DemoServiceCard svc={c1} status={s.st} />
        </Cell>
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Подключён · «Работает»",
    note: "Teal-бейдж, переключатель включён, метрики и график активности цветом программы.",
    demo: (
      <Cell>
        <DemoServiceCard svc={c1} />
      </Cell>
    ),
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Кольцо цвета программы (75 %) и мягкая тень того же цвета снизу.",
    forced: true,
    demo: (
      <Cell>
        <DemoServiceCard svc={byId("b24")} force="hover" />
      </Cell>
    ),
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Не применимо: карточка не нажимается целиком, нажимаются кнопки и переключатель (у них свои active).",
    notApplicable: true,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Контур 2px у кнопки и переключателя; на самой карточке фокуса нет. Принудительно показан на «Настроить» и переключателе.",
    forced: true,
    demo: (
      <Cell>
        <DemoServiceCard svc={byId("kontur")} force="focus" />
      </Cell>
    ),
  },
  {
    id: "loading",
    kind: "loading",
    title: "Loading · синхронизация",
    note: "Синий бейдж со спиннером, бегущая полоса цветом программы и подпись «Загружаем данные… 64 %».",
    demo: (
      <Cell>
        <DemoServiceCard svc={alta} />
      </Cell>
    ),
  },
  {
    id: "busy",
    kind: "loading",
    title: "Loading · проверка",
    note: "Кнопка «Проверить» в aria-busy: спиннер, подпись «Проверяем», повторные клики игнорируются.",
    demo: (
      <Cell>
        <DemoServiceCard svc={c1} busy />
      </Cell>
    ),
  },
  {
    id: "error",
    kind: "error",
    title: "Error",
    note: "Красный бейдж, кольцо danger 55 %, панель с причиной, красные последние столбики; главная кнопка — «Обновить ключ».",
    demo: (
      <Cell>
        <DemoServiceCard svc={port} />
      </Cell>
    ),
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Выключено",
    note: "Серый бейдж «Выключено», переключатель выкл., полоса и плитка в сером; главная кнопка — «Подключить».",
    demo: (
      <Cell>
        <DemoServiceCard svc={mdm} />
      </Cell>
    ),
  },
  {
    id: "unset",
    kind: "empty",
    title: "Не настроено",
    note: "Предложение: программа выбрана, но нет ключа или адреса. Серый бейдж «Не настроено», главная кнопка «Настроить». В макете состояния нет, есть только «Выключено». [TODO] подтвердить различие.",
    demo: (
      <Cell>
        <DemoServiceCard svc={mdm} status="unset" />
      </Cell>
    ),
  },
];

export default defineDoc({
  id: "service-card",
  title: "ServiceCard",
  group: "data",
  cssPrefix: "ds-svc",
  order: 20,
  keywords: [
    "сервис",
    "service",
    "подключение",
    "connection",
    "интеграция",
    "integration",
    "1с",
    "1c",
    "crm",
    "битрикс",
    "портал",
    "portal",
    "эдо",
    "edo",
    "программа",
    "connector",
    "коннектор",
    "источник данных",
    "статус синхронизации",
    "sync",
    "переключатель",
    "mdm",
    "таможня",
    "порт",
  ],
  summary:
    "Карточка программы, из которой Astronaut берёт данные: 1С, CRM, портал, ЭДО. Статус, метрики, активность и действия.",
  purpose:
    "У каждой программы своя индивидуальность: цвет, глиф и форма плитки. Остальное — единое: полоса со статусом, метрики (записи, задержка, аптайм), график активности за 24 часа, возможности и две кнопки 50/50. Состояние видно по бейджу, а не по цвету бренда: цвет программы остаётся при ошибке.",
  related: ["card", "badge", "button", "chart", "skeleton"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-svc", side: "t" },
          { n: 2, anchor: ".ds-svc__band", side: "r" },
          { n: 3, anchor: ".ds-svc__tile", side: "l" },
          { n: 4, anchor: ".ds-svc__head", side: "r" },
          { n: 5, anchor: ".ds-svc__metrics", side: "l" },
          { n: 6, anchor: ".ds-svc__caps", side: "r" },
          { n: 7, anchor: ".ds-card__foot", side: "l" },
        ]}
      >
        <Cell>
          <DemoServiceCard svc={c1} />
        </Cell>
      </Marks>
    ),
    parts: [
      {
        name: "Карточка",
        description:
          "ds-card без полей (flush), радиус 14, кольцо ::after. Hover — кольцо и тень цвета программы.",
      },
      {
        name: "Полоса",
        description:
          "Высота 64, градиент 135° от цвета программы 28 % к 6 % и точечная сетка 12 px. Справа вверху — бейдж статуса.",
      },
      {
        name: "Плитка",
        description:
          "52 × 52, на полосе (поднята на 26 px), обводка 3px цвета поверхности. Форма и глиф уникальны: скругление 16, круг, «капля», овал.",
      },
      {
        name: "Название и переключатель",
        description:
          "Название 15/700, под ним категория · время синхронизации; справа переключатель включено/выключено.",
      },
      {
        name: "Метрики и активность",
        description:
          "Три ячейки (число 700 tabular-nums), затем 24 столбика активности за сутки; ошибочные — danger, выключено — серые.",
      },
      {
        name: "Возможности",
        description: "Чипы 20 px: что берётся из программы. Фон 14 % цвета программы.",
        optional: true,
      },
      {
        name: "Подвал",
        description:
          "Две кнопки 50/50: главная по состоянию слева, «Настроить» или «Подробнее» справа.",
      },
    ],
  },
  variants: SERVICES.map((s) => ({
    id: s.id,
    title: s.name,
    description: `${s.cat}. Плитка: ${s.glyph ? `глиф «${s.glyph}»` : "значок"}, форма ${s.shape}. Состояние — ${
      {
        ok: "работает",
        syncing: "синхронизация",
        err: "ошибка",
        off: "выключено",
        unset: "не настроено",
      }[s.status]
    }.`,
    when:
      s.id === "1c"
        ? "бухгалтерия клиента: контрагенты, накладные, проводки."
        : s.id === "b24"
          ? "CRM: заявки, клиенты и сделки."
          : s.id === "alta"
            ? "таможенное ПО: декларации и ТН ВЭД."
            : s.id === "kontur"
              ? "оператор ЭДО: накладные, счета-фактуры, акты."
              : s.id === "port"
                ? "терминал или порт: суда и контейнеры."
                : "справочники клиентов и контрагентов (MDM).",
    demo: (
      <Cell>
        <DemoServiceCard svc={s} />
      </Cell>
    ),
  })),
  sizes: [
    {
      id: "width",
      title: "Ширина в сетке",
      value: "3 колонки · 2 · 1",
      note: "≥ 1280 px три, до 1280 две, до 900 одна; gap 16",
      demo: (
        <div className="ds-svc-grid ds-svc-grid--pair">
          <DemoServiceCard svc={byId("kontur")} />
          <DemoServiceCard svc={alta} />
        </div>
      ),
    },
  ],
  states,
  stateMatrix: {
    columns: ["Бейдж", "Кольцо", "Главная кнопка", "Переключатель"],
    rows: [
      { label: "ok", cells: ["Работает (ok)", "--border", "Настроить / Проверить", "вкл."] },
      {
        label: "syncing",
        cells: ["Синхронизация (info)", "--border", "Настроить / Остановить", "вкл."],
      },
      { label: "err", cells: ["Ошибка (err)", "danger 55 %", "Обновить ключ", "вкл."] },
      { label: "off", cells: ["Выключено (idle)", "--border", "Подключить", "выкл."] },
      {
        label: "unset (предложение)",
        cells: ["Не настроено (idle)", "--border", "Настроить", "выкл."],
      },
    ],
  },
  choreography: [
    {
      id: "hover",
      title: "Наведение на карточку",
      trigger: "указатель входит в карточку",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кольцо переходит от --border к 75 % цвета программы; ::after меняет box-shadow.",
          prop: "box-shadow (::after)",
          easing: "ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Под карточкой проявляется тень: сдвиг 8px, размытие 24px, 55 % цвета программы.",
          prop: "box-shadow",
          easing: "ease",
        },
        {
          at: 1400,
          dur: 125,
          what: "Указатель ушёл: кольцо и тень возвращаются.",
          prop: "box-shadow",
          easing: "ease",
        },
      ],
      focus:
        "Hover не зависит от фокуса. Фокус у кнопок и переключателя внутри — контур 2px, карточка не меняется.",
      reducedMotion: "Переход 125 мс отключается: кольцо и тень меняются мгновенно.",
      neighbours:
        "Карточка не сдвигается (translate нет), соседи в сетке на месте; тень выступает на 8px вниз и перекрывает зазор.",
      demo: <HoverDemo />,
    },
    {
      id: "test",
      title: "«Проверить» подключение",
      trigger: "нажатие «Проверить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка получает слой active, затем занята: aria-busy, спиннер, подпись «Проверяем». Повторные клики игнорируются.",
          prop: "background, content",
          easing: "ease",
        },
        { at: 0, dur: 900, what: "Запрос идёт 0,9 с (в макете — имитация).", prop: "—" },
        {
          at: 900,
          dur: 0,
          what: "Кнопка возвращается в обычное состояние, карточка перерисована; Toast «Подключение работает · ответ за 128 мс».",
          prop: "content",
        },
      ],
      focus:
        "Фокус остаётся на кнопке («занята» — не disabled, фокус не теряется). Результат озвучивает Toast (role=status).",
      reducedMotion: "Спиннер замедляется до 3 с, остальное без анимации.",
      neighbours:
        "Ширина кнопок 50/50 неизменна; подпись «Проверяем» короче «Проверить»: кнопка не прыгает.",
      demo: <TestDemo />,
    },
    {
      id: "connect",
      title: "Подключение: выключено → синхронизация → работает",
      trigger: "нажатие «Подключить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Бейдж «Выключено» → «Синхронизация» со спиннером; серый фильтр у полосы, плитки и графика снимается; переключатель включается.",
          prop: "content, filter, background",
        },
        {
          at: 0,
          dur: 1200,
          what: "Под метриками бежит полоса 40 % ширины слева направо, бесконечно (translate −100 % → 250 %).",
          prop: "translate",
          easing: "ease-in-out",
        },
        {
          at: 1800,
          dur: 0,
          what: "«Работает», подпись «только что», Toast «Программа подключена». В макете весь переход — 1,8 с.",
          prop: "content",
        },
      ],
      focus:
        "Фокус был на «Подключить»: кнопка меняется на «Настроить» / «Остановить», фокус возвращается на первую кнопку подвала. [TODO] проверить в макете: перерисовка карточки целиком сбрасывает фокус.",
      reducedMotion: "Бегущая полоса заменяется статичной (полупрозрачная), спиннер замедляется.",
      neighbours:
        "Высота меняется на строку подписи прогресса; при перерисовке соседние карточки сетки (одной высоты по строке) могут растянуться. Заранее резервировать место — [TODO].",
      demo: <ConnectDemo />,
    },
    {
      id: "key",
      title: "Ошибка → «Обновить ключ» → работает",
      trigger: "нажатие «Обновить ключ»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Главная кнопка занята (спиннер, «Проверяем»).",
          prop: "content",
        },
        {
          at: 900,
          dur: 0,
          what: "Панель ошибки исчезает, красные столбики и кольцо danger возвращаются к цвету программы, бейдж «Работает».",
          prop: "content, box-shadow",
        },
        {
          at: 900,
          dur: 0,
          what: "Toast «Ключ обновлён · Программа снова работает».",
          prop: "—",
        },
      ],
      focus:
        "Фокус остаётся на карточке: главная кнопка меняется на «Проверить». [TODO] закрепить, куда уходит фокус.",
      reducedMotion: "Перекрашивание без перехода (в макете и так мгновенное).",
      neighbours:
        "Панель ошибки исчезает и карточка укорачивается на 40–60 px: соседи в ряду сетки выравниваются по высоте.",
      demo: <KeyDemo />,
    },
    {
      id: "switch",
      title: "Переключатель программы",
      trigger: "клик по переключателю (Space на фокусе)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Бегунок переезжает на 14 px, фон с --text-3 на --link-strong.",
          prop: "translate, background",
          easing: "--ease, ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Состояние программы меняется (ok ⇄ off), карточка перерисована, Toast «Включено/Выключено · Отменить» на 5 с.",
          prop: "content",
        },
        {
          at: 1600,
          dur: 0,
          what: "«Отменить» возвращает прежнее состояние.",
          prop: "content",
        },
      ],
      focus:
        "Контур 2px вокруг переключателя; после перерисовки фокус надо вернуть на переключатель [TODO].",
      reducedMotion: "Бегунок и фон переключаются мгновенно.",
      neighbours:
        "Размеры блока не меняются; выключенная карточка серится (filter + opacity .65 только у декоративных частей, текст остаётся читаемым).",
      demo: <SwitchDemo />,
    },
  ],
  rules: {
    use: [
      "У каждой программы своя плитка: цвет, форма и глиф или значок. Не повторять форму у соседних.",
      "Статус выражать бейджем и кольцом, а цвет бренда оставлять: «красный» значит ошибку, а не программу.",
      "Две кнопки подвала 50/50, главная слева: «Обновить ключ», «Подключить» или «Настроить».",
      "Метрики — Onest tabular-nums; прочерк «—», если данных нет.",
      "Причина ошибки — одной строкой с действием («Обновите ключ доступа»).",
    ],
    avoid: [
      "Левые цветные полосы на карточке: цвет программы только в полосе-шапке, плитке и чипах.",
      "Моноширинный шрифт у метрик и номеров.",
      "Красить всю карточку в красный при ошибке: достаточно кольца, бейджа и панели.",
      "Прозрачность текста для «выключено»: серятся полоса, плитка, график и чипы, текст не трогаем.",
      "Показывать больше трёх метрик и больше четырёх чипов возможностей.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Карточка",
      text: "article с aria-label «Название: статус». Бейдж статуса — текст, цвет не единственный носитель смысла.",
    },
    {
      kind: "aria",
      title: "Переключатель",
      text: 'input type=checkbox role="switch" с aria-label названием программы; Space переключает. Перерисовка карточки не должна сбрасывать фокус [TODO].',
    },
    {
      kind: "aria",
      title: "Ошибка и синхронизация",
      text: 'Панель ошибки role="alert"; полоса синхронизации role="progressbar" с aria-valuetext «выполняется» (неопределённая) либо aria-valuenow при процентах. График активности — role="img" с текстом.',
    },
    {
      kind: "key",
      title: "Tab",
      text: "Порядок: переключатель, главная кнопка, вторая кнопка. Сама карточка не фокусируется.",
    },
    {
      kind: "contrast",
      title: "Глиф на плитке",
      text: "Белый на цвете программы: Битрикс24 2,7:1, Контур 3,1:1, Портал 3,2:1, Альта 4,4:1, MDM 4,1:1; тёмно-коричневый на жёлтом 1С 7,7:1. Глиф 20px/900 считается крупным (порог 3:1): Битрикс24 не проходит (у него значок, а не текст). [TODO] проверить цвета при добавлении программ.",
    },
    {
      kind: "contrast",
      title: "Чипы возможностей",
      text: "Текст цвета программы 62 % + text на фоне 14 %: светлая тема — от 3,6:1 (1С) до 6,2:1 (Альта); 1С и Битрикс24 ниже 4,5:1 для 11px. Тёмная — от 6,1:1. [TODO] затемнить текст чипов у светлых цветов.",
    },
    {
      kind: "contrast",
      title: "Подписи метрик",
      text: "--text-3 на --surface-muted: светлая 4,2:1 (ниже 4,5:1 для 10,5px). [TODO] перейти на --text-2 (7,1:1).",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Бегущая полоса заменяется статичной, спиннер замедляется до 3 с, переходы hover и переключателя отключаются.",
    },
  ],
  tokens: [
    {
      name: "--ds-svc-c",
      value:
        "HEX программы (1С #F5B400, Битрикс24 #1FA7F2, Альта #7C5CFF, Контур #13A86B, Портал #F0614A, MDM #D6409F)",
      usage:
        "Цвет программы: полоса, плитка, столбики, чипы. Живёт в данных, не в токенах словаря.",
      kind: "color",
    },
    {
      name: "--ds-svc-on",
      value: "#fff (1С #3a2800)",
      usage: "Цвет глифа на плитке",
      kind: "color",
    },
    {
      name: "--ds-svc-shape",
      value: "16px · 50% · 50% 14px · 38% · «капля» · 12px",
      usage: "border-radius плитки: у каждой программы своя",
      kind: "radius",
    },
    {
      name: "--danger",
      value: "#d03538 (тёмная #ff6b6b)",
      usage: "Кольцо 55 % и панель ошибки, ошибочные столбики",
      kind: "color",
    },
    {
      name: "--surface-muted / --divider",
      value: "#eceef2 / #e0e4e9",
      usage: "Ячейки метрик и их кольцо",
      kind: "color",
    },
    {
      name: "--link-strong / --text-3",
      value: "#006662 / #66727f",
      usage: "Переключатель вкл. / выкл.",
      kind: "color",
    },
    {
      name: "--tone",
      value: "ink 7 %",
      usage: "Дорожка синхронизации, серые столбики",
      kind: "color",
    },
    { name: "band", value: "64 px", usage: "Высота полосы", kind: "size" },
    { name: "tile", value: "52 px, подъём 26, обводка 3", usage: "Плитка", kind: "size" },
    { name: "bars", value: "24 шт., высота 30 px", usage: "Активность за сутки", kind: "size" },
    {
      name: "--r-panel / --r-item",
      value: "14 / 8 px",
      usage: "Карточка · ячейка метрики",
      kind: "radius",
    },
    { name: "--dur-f", value: "125 мс", usage: "Hover кольца и тени", kind: "time" },
    {
      name: "ind",
      value: "1,2 с ease-in-out, бесконечно",
      usage: "Бегущая полоса синхронизации",
      kind: "time",
    },
    { name: "switch", value: "200 мс --ease", usage: "Бегунок переключателя", kind: "time" },
  ],
  examples: [
    {
      id: "pair",
      title: "Две программы в сетке",
      demo: (
        <div className="ds-svc-grid ds-svc-grid--pair">
          <DemoServiceCard svc={c1} />
          <DemoServiceCard svc={port} />
        </div>
      ),
      code: `<ServiceCard
  name="1С:Предприятие" category="Бухгалтерия" status="ok"
  brand={{ color: "#F5B400", onColor: "#3a2800", glyph: "1С" }}
  metrics={[{ label: "Записей", value: "12 480" }, …]}
  onEnabledChange={…}
  actions={<><Button size="sm" variant="outline">Настроить</Button>…</>}
/>`,
    },
    {
      id: "connect",
      title: "Подключить программу",
      demo: (
        <Cell>
          <DemoServiceCard svc={mdm} />
        </Cell>
      ),
      code: `<ServiceCard
  name="MDM-справочник" status="off" brand={{ color: "#D6409F", icon: <Icon name="db" /> }}
  actions={<Button size="sm">Подключить</Button>}
/>`,
    },
  ],
});

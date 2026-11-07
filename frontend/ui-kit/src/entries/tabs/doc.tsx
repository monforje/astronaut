/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { CARGO_TABS, DemoTabs, PANELS, type DemoTab, type TabForce } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const SHORT: DemoTab[] = [
  { id: "ov", label: "Обзор" },
  { id: "doc", label: "Документы", count: 12 },
  { id: "hist", label: "История" },
];
const MANY: DemoTab[] = [
  "Все",
  "С расхождениями",
  "Ждут документов",
  "Черновики",
  "Мои",
  "Срочные",
  "Нинбо",
  "Шанхай",
  "Циндао",
].map((label, i) => ({ id: `m${i}`, label }));

function SwitchDemo() {
  return (
    <Playback<{ v: string; f?: Record<string, TabForce> }>
      initial={{ v: "all" }}
      script={[
        { at: 500, set: { f: { wait: "hover" } } },
        { at: 1000, set: { f: { wait: "active" } } },
        { at: 1150, set: { v: "wait", f: undefined } },
        { at: 2300, set: { f: { err: "hover" } } },
        { at: 2800, set: { v: "err", f: undefined } },
      ]}
      tail={900}
      render={(s) => <DemoTabs value={s.v} force={s.f} panels={PANELS} />}
    />
  );
}

function KeyboardDemo() {
  return (
    <Playback<{ v: string }>
      initial={{ v: "ov" }}
      script={[
        { at: 600, set: { v: "doc" } },
        { at: 1300, set: { v: "hist" } },
        { at: 2000, set: { v: "ov" } },
      ]}
      tail={800}
      hint="Стрелка вправо ×2, затем Home. Фокус идёт вместе с выбором."
      render={(s) => (
        <DemoTabs
          tabs={SHORT}
          value={s.v}
          force={{ [s.v]: "focus" }}
          panels={{ ov: "Сводка по грузу.", doc: "12 документов.", hist: "Журнал изменений." }}
        />
      )}
    />
  );
}

function FirstPaintDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[{ at: 200, set: { n: 1 } }]}
      tail={1200}
      hint="Нажмите «Проиграть»: подчёркивание сразу стоит под выбранной вкладкой и не выезжает из нуля."
      render={(s) => <DemoTabs key={s.n} defaultValue="wait" />}
    />
  );
}

export default defineDoc({
  id: "tabs",
  title: "Tabs",
  group: "navigation",
  cssPrefix: "ds-tabs",
  order: 10,
  wideDemos: { states: true },
  keywords: [
    "вкладки",
    "табы",
    "таб",
    "tabs",
    "tab",
    "tablist",
    "tab bar",
    "переключатель представлений",
    "сегменты",
    "счётчик",
    "подчёркивание",
    "ink",
  ],
  summary:
    "Вкладки: переключают представления одного экрана. Подчёркивание переезжает к выбранной вкладке, на вкладке может быть счётчик.",
  purpose:
    "Вкладки делят один объект или один список на равноправные представления: «Все / С расхождениями / Ждут документов» над таблицей грузов, «Обзор / Обсуждение / История» в карточке расхождения. Выбранная вкладка заметна весом и подчёркиванием, а не цветом бренда: навигация держится на нейтральном графите. Вкладка не ведёт на другую страницу: для этого — крошки и сайдбар.",
  related: ["breadcrumb", "stepper", "sidebar", "scroll-area", "badge"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-tabs__list", side: "tl" },
          { n: 2, anchor: ".ds-tabs__tab:nth-child(3) .ds-tabs__in", side: "t" },
          { n: 3, anchor: ".ds-tabs__cn", side: "t" },
          { n: 4, anchor: ".ds-tabs__ink", side: "l" },
          { n: 5, anchor: ".ds-tabs__panel", side: "r" },
        ]}
      >
        <DemoTabs tabs={SHORT} defaultValue="ov" panels={{ ov: "Содержимое выбранной вкладки" }} />
      </Marks>
    ),
    parts: [
      {
        name: "Список вкладок (tablist)",
        description:
          "Строка с линией-разделителем снизу (--divider), отступ 6 px по краям, зазор 2 px. Роль tablist и aria-label.",
      },
      {
        name: "Вкладка (tab)",
        description:
          "Кнопка высотой 44 px (36 у sm). Внутри подложка 4×8 px с радиусом 4: на ней рисуются hover, active и кольцо фокуса, а не на всей высоте кнопки. Подпись Onest 500, у выбранной 600.",
      },
      {
        name: "Счётчик",
        description:
          "Число в капсуле: 11 px, 600, --tone. У выбранной вкладки капсула teal-подложка с кольцом и текстом --link-strong.",
        optional: true,
      },
      {
        name: "Подчёркивание (ink)",
        description:
          "Полоса 2 px --text под выбранной вкладкой, ширина по подложке (без отступов по краям линии). Одна на весь список, переезжает.",
      },
      {
        name: "Панель (tabpanel)",
        description:
          "Содержимое вкладки; связана с вкладкой через aria-controls и aria-labelledby. В макете панели свои у каждого экрана; здесь показана одна.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "line",
      title: "С подчёркиванием",
      description: "Основной вид: подпись, бегущая линия, линия-разделитель под списком.",
      when: "представления одного объекта: «Обзор / Обсуждение / История».",
      demo: (
        <div style={{ width: "100%", maxWidth: 380 }}>
          <DemoTabs tabs={SHORT.map((t) => ({ ...t, count: undefined }))} defaultValue="ov" />
        </div>
      ),
    },
    {
      id: "counts",
      title: "Со счётчиками",
      description:
        "Счётчик показывает, сколько объектов в представлении. Недоступная вкладка («Архив») без счётчика и серая.",
      when: "фильтры над таблицей: сколько грузов в каждом срезе.",
      demo: (
        <div style={{ width: "100%", maxWidth: 560 }}>
          <DemoTabs defaultValue="all" scroll />
        </div>
      ),
    },
    {
      id: "overflow",
      title: "Много вкладок",
      description:
        "Не помещаются: список прокручивается по горизонтали, правый край затухает; полоса прокрутки скрыта. Выбранную вкладку прокручивают в зону видимости. [TODO] макет такого случая не показывает.",
      when: "от 7–8 вкладок или узкая панель. Если вкладок больше 9 — это уже фильтр, берите Select.",
      demo: (
        <div style={{ width: "100%", maxWidth: 380 }}>
          <DemoTabs tabs={MANY} defaultValue="m0" scroll />
        </div>
      ),
    },
    {
      id: "error",
      title: "С пометкой ошибки",
      description:
        "Красная точка 6 px после подписи: во вкладке есть то, что нужно исправить (форма настроек с невалидным полем). [TODO] в макете нет; предложение.",
      when: "формы, разбитые на вкладки: пользователь не должен искать ошибку по всем вкладкам.",
      demo: (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <DemoTabs
            tabs={[
              { id: "a", label: "Основное" },
              { id: "b", label: "Доступ", error: true },
              { id: "c", label: "Расписание" },
            ]}
            defaultValue="a"
          />
        </div>
      ),
    },
  ],
  sizes: [
    {
      id: "md",
      title: "md",
      value: "44 px",
      note: "по умолчанию; шапка карточки, над таблицей",
      demo: (
        <div style={{ width: 300 }}>
          <DemoTabs tabs={SHORT} defaultValue="ov" />
        </div>
      ),
    },
    {
      id: "sm",
      title: "sm",
      value: "36 px",
      note: "[TODO] предложение, в макете один размер; для узких панелей и диалогов",
      demo: (
        <div style={{ width: 300 }}>
          <DemoTabs tabs={SHORT} defaultValue="ov" size="sm" />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Подпись --text-2, 500. Без подложки.",
      demo: <DemoTabs tabs={SHORT} defaultValue="ov" />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Подложка 4×8 слоем 6 % (--layer-2), текст --text.",
      forced: true,
      demo: <DemoTabs tabs={SHORT} defaultValue="ov" force={{ doc: "hover" }} />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 12 % (--layer-3) на подложке, пока кнопка нажата.",
      forced: true,
      demo: <DemoTabs tabs={SHORT} defaultValue="ov" force={{ doc: "active" }} />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus по подложке (не по всей высоте). Только с клавиатуры.",
      forced: true,
      demo: <DemoTabs tabs={SHORT} defaultValue="ov" force={{ hist: "focus" }} />,
    },
    {
      id: "selected",
      kind: "selected",
      title: "Selected",
      note: "aria-selected=true: текст --text, 600, под вкладкой подчёркивание, счётчик с teal-подложкой.",
      demo: <DemoTabs tabs={SHORT} defaultValue="doc" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Текст --text-ph, без hover, из порядка Tab выпадает. Пример: «Архив» без прав.",
      demo: <DemoTabs tabs={CARGO_TABS.slice(2)} defaultValue="wait" />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Счётчик ещё считается: капсула-заглушка пульсирует (1,1 с). Сама вкладка активна. [TODO] предложение.",
      demo: (
        <DemoTabs
          tabs={[
            { id: "a", label: "Все", count: "loading" },
            { id: "b", label: "С расхождениями", count: "loading" },
          ]}
          defaultValue="a"
        />
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Красная точка после подписи: во вкладке нужно что-то исправить. [TODO] предложение.",
      demo: (
        <DemoTabs
          tabs={[
            { id: "a", label: "Основное" },
            { id: "b", label: "Доступ", error: true },
          ]}
          defaultValue="a"
        />
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Срез пуст: счётчик «0» бледнее (--text-3), вкладка остаётся. Панель показывает пустое состояние, вкладку не скрывают.",
      demo: (
        <DemoTabs
          tabs={[
            { id: "a", label: "Все", count: 128 },
            { id: "b", label: "С расхождениями", count: 0 },
          ]}
          defaultValue="b"
        />
      ),
    },
    NA("pressed", "other", "Toggle / pressed", "Вкладка не «нажата и удержана»: это selected."),
  ],
  rules: {
    use: [
      "Равноправные представления одного объекта или списка; одно выбрано всегда.",
      "Подпись — одно-два слова; счётчик — когда число помогает выбрать («С расхождениями 8»).",
      "Первая вкладка выбрана по умолчанию; выбор запоминается в адресе (?tab=err) для ссылки и «Назад».",
      "Недоступную вкладку оставляйте на месте серой: так раздел не «пропадает» у коллег с другими правами.",
      "Подчёркивание — нейтральный графит; акцентный цвет отдан выбранной строке и кнопкам действия.",
    ],
    avoid: [
      "Вкладки для шагов процесса: порядок важен — это Stepper.",
      "Вкладки-ссылки на другие страницы: это сайдбар или крошки.",
      "Вложенные вкладки: второй ряд ломает иерархию — берите ToggleGroup или секции.",
      "Закрываемые вкладки в этом словаре: они не нужны ни одному экрану макета.",
      "Больше 8–9 вкладок: заменяйте фильтром или меню.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "tablist / tab / tabpanel",
      text: "Контейнер role=tablist с aria-label; каждая вкладка role=tab, aria-selected, aria-controls на панель; панель role=tabpanel с aria-labelledby на вкладку. Связи панелей ставит сам компонент (id и aria-controls/aria-labelledby от useId).",
    },
    {
      kind: "key",
      title: "← / →",
      text: "Двигают фокус на соседнюю доступную вкладку по кругу и сразу выбирают её (автоматическая активация, панели лёгкие). Roving tabindex: в Tab входит только выбранная вкладка. [TODO] предложение: макет стрелок не умеет.",
    },
    {
      kind: "key",
      title: "Home / End",
      text: "Первая и последняя доступная вкладка. Disabled пропускаются.",
    },
    {
      kind: "key",
      title: "Tab",
      text: "Из списка фокус идёт в панель (у панели tabindex=0, если в ней нет своих фокусируемых элементов).",
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2 px --focus по подложке 4×8; контраст --focus (#00968f) на белом 3,6:1, в тёмной teal на графите выше 7:1.",
    },
    {
      kind: "contrast",
      title: "Текст вкладок",
      text: "Обычная --text-2 на --surface 8,2:1 (светлая); --text-ph у disabled около 3:1 — это допустимо для недоступного, но не для читаемого. Счётчик выбранной: --link-strong на teal 15 % ≈ 6:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Подчёркивание встаёт на место мгновенно, переход подложки hover отключается.",
    },
    {
      kind: "note",
      title: "Счётчик",
      text: "Читается вместе с подписью («С расхождениями, 8»). Если число критично, добавляйте скрытое «грузов» (aria-label на вкладке).",
    },
  ],
  tokens: [
    { name: "height", value: "44 / 36 px", usage: "Вкладка md / sm", kind: "size" },
    { name: "--divider", value: "#e0e4e9 / #323e4b", usage: "Линия под списком", kind: "color" },
    {
      name: "--text",
      value: "#15202b / #f7f9fb",
      usage: "Выбранная вкладка и подчёркивание",
      kind: "color",
    },
    {
      name: "--text-2 / --text-3",
      value: "#44505d / #66727f",
      usage: "Обычная вкладка · нулевой счётчик",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0", usage: "Disabled", kind: "color" },
    {
      name: "--layer-2 / --layer-3",
      value: "9 % / 12 % ink",
      usage: "Hover и active подложки",
      kind: "color",
    },
    { name: "--tone", value: "7 % ink", usage: "Капсула счётчика", kind: "color" },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / 60 %",
      usage: "Капсула счётчика выбранной",
      kind: "color",
    },
    { name: "--focus", value: "#00968f / teal", usage: "Кольцо фокуса", kind: "color" },
    {
      name: "--r-control",
      value: "4 px",
      usage: "Подложка вкладки, радиус кольца",
      kind: "radius",
    },
    { name: "--dur-f", value: "125 мс", usage: "Подложка hover/active", kind: "time" },
    {
      name: "--dur · --ease",
      value: "200 мс · cubic-bezier(.6,0,.05,.95)",
      usage: "Движение подчёркивания: translate и width",
      kind: "ease",
    },
  ],
  choreography: [
    {
      id: "switch",
      title: "Переключение вкладки",
      trigger: "клик (или Enter/Space, стрелка) по вкладке",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: подложка вкладки заливается слоем hover.",
          prop: "background",
          easing: "ease",
        },
        { at: 400, dur: 0, what: "Нажатие: слой active (12 %).", prop: "background" },
        {
          at: 550,
          dur: 0,
          what: "Выбор: aria-selected переходит на новую вкладку, у прежней вес 600→500 и цвет --text-2, у новой наоборот.",
          prop: "font-weight, color",
        },
        {
          at: 550,
          dur: 200,
          what: "Подчёркивание едет: сдвиг по X и смена ширины идут одновременно к подложке новой вкладки.",
          prop: "translate, width",
          easing: "--ease",
        },
        {
          at: 550,
          dur: 0,
          what: "Содержимое панели меняется сразу, без перехода. [TODO] макет не анимирует панель; затухание панели 125 мс — только предложение.",
          prop: "—",
        },
      ],
      focus:
        "Остаётся на нажатой вкладке (при клике мышью) или переезжает на новую (стрелки). В панель не уходит.",
      reducedMotion: "Подчёркивание появляется под новой вкладкой мгновенно.",
      neighbours:
        "Соседние вкладки не сдвигаются: подпись держит ширину жирного начертания (пустой ::after в 600), поэтому смена веса не толкает остальные. В макете ширина прыгает на 2–4 px: [TODO] подтвердить решение.",
      demo: <SwitchDemo />,
    },
    {
      id: "keyboard",
      title: "Стрелки, Home и End",
      trigger: "→ ← Home End при фокусе на вкладке",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Фокус и выбор переходят на следующую доступную вкладку; disabled пропускается.",
          prop: "tabindex, aria-selected",
        },
        {
          at: 0,
          dur: 200,
          what: "Подчёркивание едет тем же движением, что при клике.",
          prop: "translate, width",
          easing: "--ease",
        },
        {
          at: 700,
          dur: 0,
          what: "Дальше — следующий шаг; за последней вкладкой фокус возвращается к первой.",
          prop: "—",
        },
      ],
      focus:
        "Roving tabindex: tabindex=0 только у выбранной, у остальных −1; кольцо фокуса на подложке выбранной.",
      reducedMotion: "Как в «Переключении»: линия без движения.",
      neighbours:
        "Панель сменяется сразу; прокрутка страницы не двигается (preventDefault у стрелок).",
      demo: <KeyboardDemo />,
    },
    {
      id: "first-paint",
      title: "Первая отрисовка и смена ширины",
      trigger: "вкладки появились на экране или контейнер изменил ширину",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Подчёркивание рассчитывается по выбранной вкладке без перехода (transition включается после первого кадра).",
          prop: "translate, width",
        },
        {
          at: 16,
          dur: 0,
          what: "Флаг готовности: дальше любые смены идут с переходом 200 мс.",
          prop: "transition",
        },
        {
          at: 16,
          dur: 0,
          what: "ResizeObserver пересчитывает положение при смене ширины: линия не отстаёт от вкладки.",
          prop: "translate",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Переходов нет в любом случае.",
      neighbours:
        "В макете положение считается при смене страницы (requestAnimationFrame); без этого линия при первом показе выезжала бы из нуля. [TODO] в макете нет пересчёта при resize.",
      demo: <FirstPaintDemo />,
    },
  ],
  examples: [
    {
      id: "cargo",
      title: "Фильтр над таблицей грузов",
      demo: (
        <div style={{ width: "100%", maxWidth: 680 }}>
          <DemoTabs defaultValue="err" panels={PANELS} scroll />
        </div>
      ),
      code: `<Tabs value={tab} onValueChange={setTab}>
  <TabList aria-label="Фильтр грузов">
    <Tab value="all" count={128}>Все</Tab>
    <Tab value="err" count={8}>С расхождениями</Tab>
    <Tab value="archive" disabled>Архив</Tab>
  </TabList>
</Tabs>`,
    },
    {
      id: "card",
      title: "Представления карточки",
      demo: (
        <div style={{ width: "100%", maxWidth: 420 }}>
          <DemoTabs
            tabs={[
              { id: "ov", label: "Обзор" },
              { id: "chat", label: "Обсуждение", count: 8 },
              { id: "hist", label: "История" },
            ]}
            defaultValue="chat"
            panels={{ ov: "Сравнение документов.", chat: "8 сообщений.", hist: "Журнал." }}
          />
        </div>
      ),
      code: `<Tabs defaultValue="ov">
  <TabList aria-label="Представления">
    <Tab value="ov">Обзор</Tab>
    <Tab value="chat" count={8}>Обсуждение</Tab>
  </TabList>
  <TabPanel value="ov">…</TabPanel>
  <TabPanel value="chat">…</TabPanel>
</Tabs>`,
    },
  ],
});

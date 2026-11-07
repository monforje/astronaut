/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  ANATOMY_PATH,
  CARGO_PATH,
  DemoBreadcrumb,
  LONG_PATH,
  Resizable,
  SWITCH_PATH,
  type CrumbForce,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function HoverDemo() {
  return (
    <Playback<{ f?: Record<number, CrumbForce> }>
      initial={{}}
      script={[
        { at: 400, set: { f: { 1: "hover" } } },
        { at: 1200, set: { f: { 1: "active" } } },
        { at: 1500, set: { f: { 1: "hover" } } },
        { at: 2200, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <Resizable width={380}>
          <DemoBreadcrumb items={CARGO_PATH} force={s.f} />
        </Resizable>
      )}
    />
  );
}

function ShrinkDemo() {
  return (
    <Playback<{ w: number }>
      initial={{ w: 520 }}
      script={[
        { at: 400, set: { w: 400 } },
        { at: 1200, set: { w: 300 } },
        { at: 2000, set: { w: 220 } },
        { at: 2800, set: { w: 520 } },
      ]}
      tail={800}
      hint="Ширина рамки задаётся сценарием; руками её можно менять ползунком в варианте «Длинный путь»."
      render={(s) => (
        <Resizable width={s.w}>
          <DemoBreadcrumb items={LONG_PATH} max={6} />
        </Resizable>
      )}
    />
  );
}

function MenuDemo() {
  return (
    <Playback<{ o?: "ell" }>
      initial={{}}
      script={[
        { at: 500, set: { o: "ell" } },
        { at: 2600, set: { o: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <Resizable width={460}>
          <DemoBreadcrumb items={LONG_PATH} openMenu={s.o} />
        </Resizable>
      )}
    />
  );
}

export default defineDoc({
  id: "breadcrumb",
  title: "Breadcrumb",
  group: "navigation",
  cssPrefix: "ds-bc",
  order: 20,
  keywords: [
    "хлебные крошки",
    "крошки",
    "путь",
    "навигация",
    "заголовок страницы",
    "breadcrumb",
    "breadcrumbs",
    "navigation path",
    "trail",
    "иерархия",
    "уровень выше",
    "многоточие",
  ],
  summary:
    "Хлебные крошки: путь до текущей страницы. Заменяют заголовок страницы, сжимаются в узкой шапке и прячут середину длинной цепочки под «…».",
  purpose:
    "Крошки показывают, где пользователь находится и как вернуться на уровень выше: «Грузы / Морской импорт / MSKU4821907». Правило системы: когда крошки есть, у страницы нет отдельного заголовка, их последний пункт и есть заголовок. На корневой странице без вложенности крошек нет, там остаётся обычный заголовок.",
  related: ["topbar", "sidebar", "tabs", "app-shell"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-bc", side: "l" },
          { n: 2, anchor: ".ds-bc__a .ds-bc__t", side: "b" },
          { n: 3, anchor: ".ds-bc__sep", side: "t" },
          { n: 4, anchor: ".ds-bc__li[data-last]", side: "b" },
          { n: 5, anchor: ".ds-bc__wrap button:not([aria-label])", side: "t" },
          { n: 6, anchor: ".ds-bc__wrap button[aria-label]", side: "b" },
          { n: 7, anchor: ".ds-bc__a .ds-icon", side: "t" },
        ]}
      >
        <Resizable>
          <DemoBreadcrumb items={ANATOMY_PATH} />
        </Resizable>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер nav > ol",
        description:
          "nav с aria-label «Хлебные крошки», внутри упорядоченный список. Flex без переноса, зазор 4 px, 13 px (12 у sm), цвет --text-2.",
      },
      {
        name: "Пункт-ссылка",
        description:
          "Ссылка на раздел выше. Подложка 2×4 px с радиусом 4 уходит в минус по краям (margin −4), поэтому текст стоит ровно по сетке. Максимум 200 px, дальше многоточие.",
      },
      {
        name: "Разделитель",
        description:
          "Шеврон 12 px цвета --text-ph, aria-hidden. Тот же шеврон стоит и в Topbar (в макете там был «/», сведено к одному виду).",
      },
      {
        name: "Текущая страница",
        description:
          'Последний пункт: --text, 600, без ссылки, aria-current="page". Сжимается медленнее остальных (flex-shrink 1 против 5 у остальных, мин. 48 px).',
      },
      {
        name: "Переключатель на уровне",
        description:
          "Кнопка с шевроном: открывает список соседних разделов (aria-haspopup=menu). Выбор меняет пункт.",
        optional: true,
      },
      {
        name: "Многоточие «…»",
        description:
          "Кнопка 28 px: прячет средние пункты, когда их больше max (по умолчанию 4). Открывает меню скрытых разделов.",
        optional: true,
      },
      {
        name: "Значок",
        description: "14 px перед подписью: у корня («Главная») или раздела («Подключения»).",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "plain",
      title: "Обычный · md",
      description: "Две-три ссылки и текущая страница. 13 px.",
      when: "шапка страницы и топбар; основной вид.",
      demo: (
        <Resizable>
          <DemoBreadcrumb items={CARGO_PATH} />
        </Resizable>
      ),
    },
    {
      id: "long",
      title: "Длинный путь",
      description:
        "Больше четырёх уровней: остаётся первый и два последних, середина — под «…». Дополнительно пункты сжимаются по ширине с многоточием.",
      when: "договоры, вложенные папки, любые деревья глубже трёх уровней.",
      demo: (
        <Resizable control>
          <DemoBreadcrumb items={LONG_PATH} />
        </Resizable>
      ),
    },
    {
      id: "switch",
      title: "С переключателем и значком · sm",
      description: "Средний пункт — кнопка со списком соседей; 12 px. Значок у первого пункта.",
      when: "экраны «внутри подключения»: переход между 1С, Битрикс24 и другими без возврата назад.",
      demo: (
        <Resizable>
          <DemoBreadcrumb items={SWITCH_PATH} size="sm" />
        </Resizable>
      ),
    },
  ],
  sizes: [
    {
      id: "md",
      title: "md",
      value: "13 px / 400",
      note: "по умолчанию",
      demo: <DemoBreadcrumb items={CARGO_PATH} />,
    },
    {
      id: "sm",
      title: "sm",
      value: "12 px / 400",
      note: "карточки и боковые панели",
      demo: <DemoBreadcrumb items={CARGO_PATH} size="sm" />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Ссылки --text-2, 400; текущая --text, 600.",
      demo: <DemoBreadcrumb items={CARGO_PATH} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Подложка 2×4 слоем 9 % (--layer-2), текст --text.",
      forced: true,
      demo: <DemoBreadcrumb items={CARGO_PATH} force={{ 1: "hover" }} />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 12 % (--layer-3).",
      forced: true,
      demo: <DemoBreadcrumb items={CARGO_PATH} force={{ 1: "active" }} />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus по подложке.",
      forced: true,
      demo: <DemoBreadcrumb items={CARGO_PATH} force={{ 0: "focus" }} />,
    },
    {
      id: "current",
      kind: "selected",
      title: "Current page",
      note: 'aria-current="page": жирный, без ссылки, курсор по умолчанию, hover нет.',
      demo: <DemoBreadcrumb items={CARGO_PATH.slice(0, 2)} />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Раздел выше недоступен по правам: --text-ph, aria-disabled, не ссылка. [TODO] предложение, в макете нет.",
      demo: (
        <DemoBreadcrumb
          items={[{ t: "Администрирование", disabled: true }, { t: "Роли" }, { t: "Бухгалтер" }]}
        />
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Название объекта ещё грузится: заглушка 72×12 на месте текущего пункта. Уровни выше известны сразу. [TODO] предложение.",
      demo: (
        <DemoBreadcrumb
          items={[{ t: "Грузы" }, { t: "Морской импорт" }, { t: "", loading: true }]}
        />
      ),
    },
    {
      id: "expanded",
      kind: "other",
      title: "Меню открыто",
      note: "У переключателя или «…» aria-expanded=true и подложка hover остаётся, пока меню открыто.",
      wide: true,
      demo: (
        <div style={{ minHeight: 150, width: "100%" }}>
          <DemoBreadcrumb items={SWITCH_PATH} size="sm" openMenu={1} />
        </div>
      ),
    },
    NA(
      "error",
      "error",
      "Error",
      "Ошибка маршрута — это страница «не найдено», а не состояние крошек.",
    ),
    NA(
      "empty",
      "empty",
      "Empty",
      "На корневой странице крошек нет, остаётся заголовок страницы. Пустую строку-nav не рисуют.",
    ),
  ],
  rules: {
    use: [
      "Вместо заголовка страницы: последний пункт и есть название страницы.",
      "Каждый пункт кроме последнего — реальная ссылка на раздел выше.",
      "Подписи совпадают с названиями в сайдбаре и заголовками этих страниц.",
      "Длинный путь: первый + «…» + два последних; ссылки в «…» остаются доступными по клику.",
      "Переключатель на уровне — когда пользователь часто ходит между соседями (1С ↔ Битрикс24).",
    ],
    avoid: [
      "Крошки и заголовок страницы одновременно: дублирование.",
      "История посещений вместо иерархии: крошки — это место в структуре, не «Назад».",
      "Последний пункт-ссылка на саму себя.",
      "Пункты длиннее 200 px без многоточия или с переносом на вторую строку.",
      "Крошки на корневых страницах («Главная» одна): нет смысла.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'nav aria-label="Хлебные крошки"',
      text: "Ориентир навигации. Внутри ol/li: скринридер читает «список из 3 элементов».",
    },
    {
      kind: "aria",
      title: 'aria-current="page"',
      text: "У последнего пункта; ссылкой он не является.",
    },
    {
      kind: "aria",
      title: "Разделитель aria-hidden",
      text: "Шевроны и «/» декоративны и не читаются.",
    },
    {
      kind: "aria",
      title: "«…» и переключатель",
      text: 'aria-haspopup="menu", aria-expanded; у «…» aria-label «Скрытые разделы»; пункты меню role=menuitem.',
    },
    {
      kind: "key",
      title: "Tab, Enter",
      text: "Каждая ссылка и кнопка — в порядке Tab; меню открывается Enter/Space/↓, закрывается Esc с возвратом фокуса на кнопку. [TODO] макет не описывает клавиатуру меню, это предложение.",
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2 px --focus по подложке пункта.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "--text-2 на --surface 8,2:1; текущий --text 15:1; разделитель --text-ph (≈3:1) декоративный.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Меню появляется без сдвига и затухания; hover без перехода.",
    },
  ],
  tokens: [
    {
      name: "--text-2 / --text",
      value: "#44505d / #15202b",
      usage: "Ссылка · текущий пункт",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0", usage: "Разделитель; недоступный пункт", kind: "color" },
    {
      name: "--layer-2 / --layer-3",
      value: "9 % / 12 % ink",
      usage: "Hover и active подложки",
      kind: "color",
    },
    { name: "--fs-body / --fs-control", value: "13 / 12 px", usage: "md / sm", kind: "font" },
    { name: "gap", value: "4 px", usage: "Между пунктом и разделителем", kind: "size" },
    {
      name: "max-width · min-width",
      value: "200 px · 28 px (текущий 48)",
      usage: "Предел ссылки · предел сжатия",
      kind: "size",
    },
    { name: "--r-control", value: "4 px", usage: "Радиус подложки", kind: "radius" },
    { name: "--dur-f", value: "125 мс", usage: "Подложка hover/active", kind: "time" },
    {
      name: "--shadow-pop · --r-popover",
      value: "см. Цвета · 12 px",
      usage: "Меню «…» и переключателя",
      kind: "shadow",
    },
  ],
  choreography: [
    {
      id: "hover",
      title: "Наведение и нажатие",
      trigger: "указатель на пункте, затем нажатие",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подложка 2×4 заливается слоем hover (9 %), цвет текста уходит к --text.",
          prop: "background, color",
          easing: "ease",
        },
        { at: 800, dur: 125, what: "Нажатие: слой 12 %.", prop: "background", easing: "ease" },
        {
          at: 1100,
          dur: 125,
          what: "Отпускание: возврат к hover.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus:
        "Нажатие мышью оставляет фокус на ссылке (без кольца); переход на другую страницу сбрасывает его в начало.",
      reducedMotion: "Переход подложки отключается.",
      neighbours:
        "Соседние пункты не сдвигаются: подложка выходит за текст на отрицательном отступе.",
      demo: <HoverDemo />,
    },
    {
      id: "shrink",
      title: "Сжатие при уменьшении ширины",
      trigger: "контейнер сузился (ресайз окна, сворачивание панели, узкий экран)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Сначала сжимаются промежуточные пункты: каждый до min-width 28 px, обрезка с многоточием.",
          prop: "width",
          easing: "linear",
        },
        {
          at: 0,
          dur: 0,
          what: "Последний пункт сжимается в пять раз медленнее (flex-shrink 1 против 5) и держит минимум 48 px.",
          prop: "width",
        },
        { at: 0, dur: 0, what: "Разделители и «…» не сжимаются никогда.", prop: "—" },
      ],
      focus: "Не меняется; обрезанный текст виден целиком в title/подсказке [TODO] у ссылки.",
      reducedMotion: "Анимации нет: сжатие следует за шириной непрерывно.",
      neighbours:
        "В топбаре крошки уступают место поиску и правой группе: grid minmax(0,1fr) · minmax(0,420px) · minmax(max-content,1fr), левая колонка сжимается первой.",
      demo: <ShrinkDemo />,
    },
    {
      id: "menu",
      title: "Меню «…»",
      trigger: "клик по «…» или по переключателю на уровне",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Кнопка получает aria-expanded=true и держит подложку hover.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Меню выезжает: прозрачность 0→1, масштаб .96→1, сдвиг −4 px→0 (как у всех popover).",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 2100,
          dur: 0,
          what: "Выбор пункта или Esc: меню закрывается мгновенно, фокус возвращается на кнопку.",
          prop: "—",
        },
      ],
      focus: "Внутрь меню — на первый пункт (стрелки ↑↓); по закрытию — обратно на «…».",
      reducedMotion: "Меню появляется без масштаба и сдвига.",
      neighbours:
        "Меню лежит поверх страницы, соседей не двигает. [TODO] в макете время появления берётся у общего popover (125 мс), отдельно не задано.",
      demo: <MenuDemo />,
    },
  ],
  examples: [
    {
      id: "cargo",
      title: "Шапка страницы груза",
      demo: (
        <Resizable>
          <DemoBreadcrumb items={CARGO_PATH} />
        </Resizable>
      ),
      code: `<Breadcrumb
  items={[
    { label: "Грузы", href: "/cargo" },
    { label: "Морской импорт", href: "/cargo/sea" },
    { label: "MSKU4821907" },
  ]}
/>`,
    },
    {
      id: "switch",
      title: "С переключателем",
      demo: (
        <Resizable>
          <DemoBreadcrumb items={SWITCH_PATH} size="sm" />
        </Resizable>
      ),
      code: `<Breadcrumb size="sm" max={4} items={[
  { label: "Подключения", icon: <LinkIcon /> },
  { label: "1С:Предприятие", menu: ["1С:Предприятие", "Битрикс24"] },
  { label: "Журнал синхронизации" },
]} />`,
    },
  ],
});

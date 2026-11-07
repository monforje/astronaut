/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoActions, DemoTopbar, Fit, type Part, type TopForce } from "./demo";

const WIDE = { width: "100%" } as const;
const ACT_W = { padding: "0 4px" } as const;
type F = Partial<Record<Part, TopForce>>;

function SearchDemo() {
  return (
    <Playback<{ f?: F; v?: string }>
      initial={{}}
      script={[
        { at: 400, set: { f: { search: "hover" } } },
        { at: 1100, set: { f: { search: "focus" } } },
        { at: 1500, set: { v: "MSKU48" } },
        { at: 2800, set: { f: undefined, v: undefined } },
      ]}
      tail={700}
      hint="Ctrl K переводит фокус в поле из любого места страницы."
      render={(s) => (
        <div style={WIDE}>
          <DemoTopbar force={s.f} searchValue={s.v} key={s.v ?? "none"} />
        </div>
      )}
    />
  );
}

function ThemeDemo() {
  return (
    <Playback<{ d: boolean; f?: F }>
      initial={{ d: false }}
      script={[
        { at: 400, set: { f: { theme: "hover" } } },
        { at: 900, set: { f: { theme: "active" } } },
        { at: 1000, set: { d: true, f: { theme: "hover" } } },
        { at: 2200, set: { d: false } },
        { at: 2800, set: { f: undefined } },
      ]}
      tail={700}
      hint="Здесь меняется только значок; тему страницы переключает переключатель в оболочке словаря."
      render={(s) => (
        <div style={ACT_W}>
          <DemoActions force={s.f} dark={s.d} unread={3} />
        </div>
      )}
    />
  );
}

function ProfileDemo() {
  return (
    <Playback<{ m: boolean; f?: F }>
      initial={{ m: false }}
      script={[
        { at: 400, set: { f: { prof: "hover" } } },
        { at: 1000, set: { m: true, f: undefined } },
        { at: 3000, set: { m: false } },
      ]}
      tail={700}
      render={(s) => (
        <div style={WIDE}>
          <DemoTopbar menu={s.m} force={s.f} unread={3} reserve />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "topbar",
  title: "Topbar",
  group: "navigation",
  cssPrefix: "ds-top",
  order: 80,
  keywords: [
    "шапка",
    "header",
    "верхняя панель",
    "поиск",
    "ctrl k",
    "профиль",
    "уведомления",
    "тема",
    "topbar",
    "navbar",
    "навбар",
    "верхнее меню",
    "хедер",
    "шапка страницы",
    "глобальный поиск",
    "global search",
    "search",
    "крошки",
    "breadcrumbs",
    "notifications",
    "колокол",
    "profile",
    "аватар",
    "theme toggle",
    "тёмная тема",
    "dark mode",
  ],
  summary:
    "Верхняя панель экрана: крошки слева, глобальный поиск по Ctrl K по центру, тема, уведомления и профиль справа.",
  purpose:
    "Топбар общий для всех страниц. Крошки слева заменяют заголовок страницы, поиск по центру всегда под рукой (Ctrl K), справа — то, что нужно человеку, а не странице: смена темы, уведомления, профиль с меню. Высота равна высоте бренда в сайдбаре (56 px), поэтому две панели образуют одну линию. Топбар липкий и не прокручивается с контентом.",
  wideDemos: { variants: true, states: true },
  related: ["breadcrumb", "sidebar", "app-shell", "avatar"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-top", side: "l" },
          { n: 2, anchor: ".ds-top__crumbs", side: "b" },
          { n: 3, anchor: ".ds-top__search", side: "t" },
          { n: 4, anchor: ".ds-top__end > .ds-top__ib:nth-child(1)", side: "t" },
          { n: 5, anchor: ".ds-top__end > .ds-top__ib:nth-child(2)", side: "b" },
          { n: 6, anchor: ".ds-top__prof", side: "t" },
        ]}
      >
        <Fit>
          <DemoTopbar unread={3} crumbs={["Грузы", "MSKU4821907"]} />
        </Fit>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер header",
        description:
          "Липкий, высота 56 px (--h-bar), фон --surface, линия --divider снизу, поля 16 px. Сетка из трёх колонок: minmax(0,1fr) · minmax(0,420px) · minmax(max-content,1fr), зазор 12: крошки сжимаются, действия всегда целиком.",
      },
      {
        name: "Крошки",
        description:
          "nav слева: ссылки --text-2, текущая --text 600. Разделитель — шеврон, как в Breadcrumb (в макете был «/»: сведено к одному). Левая колонка сжимается первой: промежуточные пункты усекаются с многоточием, последний держится дольше.",
      },
      {
        name: "Поиск",
        description:
          "Поле 28 px с радиусом 8: значок, подсказка «Поиск по грузам, клиентам, документам», метка «Ctrl K». Ширина до 420 px, по центру страницы.",
      },
      {
        name: "Смена темы",
        description: "Квадратная ghost-кнопка 32 px: луна в светлой теме, солнце в тёмной.",
      },
      {
        name: "Уведомления",
        description:
          "Квадратная ghost-кнопка с колоколом; число непрочитанного — красная капсула в углу. [TODO] открытие панели уведомлений в макете не показано.",
      },
      {
        name: "Профиль",
        description:
          "Кнопка-капсула: аватар 24 px + шеврон, открывает меню (aria-haspopup=menu): имя и роль, «Профиль», «Настройки», «Выйти».",
      },
    ],
  },
  variants: [
    {
      id: "full",
      title: "Полный",
      description: "Все три зоны: крошки, поиск, действия. Для экрана от ~900 px шириной.",
      when: "обычные страницы приложения.",
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} />
        </div>
      ),
    },
    {
      id: "narrow",
      title: "Узкий (мобильный)",
      description:
        "Поиск скрыт, колонки minmax(0,1fr) и auto. В макете (≤ 760 px) пропадает и сайдбар. [TODO] кнопка поиска-значка вместо поля и мобильное меню в макете не нарисованы.",
      when: "экраны уже 760 px (в словаре — контейнер уже 720 px).",
      demo: (
        <div style={{ width: "100%", maxWidth: 520 }}>
          <DemoTopbar unread={3} crumbs={["Грузы", "MSKU4821907"]} />
        </div>
      ),
    },
    {
      id: "no-crumbs",
      title: "Корневая страница",
      description:
        "Крошек нет (раздел верхнего уровня): слева остаётся название страницы текстом, остальное то же. [TODO] предложение; в макете даже у корня две крошки.",
      when: "«Главная», дашборд: страница без вложенности.",
      demo: (
        <div style={WIDE}>
          <DemoTopbar crumbs={["Дашборд"]} />
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Кнопки --text-2 без подложки, поиск с рамкой --border.",
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} />
        </div>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Кнопка и профиль: слой 9 % (--layer-2). Поиск: рамка --text-3. Ссылка-крошка: слой 9 %.",
      forced: true,
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} force={{ search: "hover", bell: "hover", prof: "hover" }} />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 12 % (--layer-3) на нажатой кнопке.",
      forced: true,
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} force={{ theme: "active" }} />
        </div>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кнопки: кольцо 2 px --focus. Поиск: рамка --focus + ореол 3 px --selected, значок --link.",
      forced: true,
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} force={{ search: "focus", bell: "focus" }} />
        </div>
      ),
    },
    {
      id: "expanded",
      kind: "selected",
      title: "Профиль · меню открыто",
      note: "aria-expanded=true: подложка hover остаётся, шеврон повёрнут на 180°.",
      demo: (
        <div style={WIDE}>
          <DemoTopbar force={{ prof: "hover" }} menu unread={3} />
        </div>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Нет: элементы топбара доступны всегда; недоступные действия убирают из меню профиля или показывают в нём серыми.",
      notApplicable: true,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading (поиск)",
      note: "Поиск в процессе: вместо значка лупы спиннер 14 px (0,8 с на оборот), поле остаётся активным. [TODO] предложение.",
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} searchLoading searchValue="MSKU48" />
        </div>
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Нет собственного вида: ошибку поиска показывает выпадающий список результатов («Не удалось выполнить поиск»), не топбар. Ошибка загрузки уведомлений — внутри их панели.",
      notApplicable: true,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Нет непрочитанных: красной капсулы нет, колокол обычный (слева). Поиск без ввода показывает подсказку и «Ctrl K».",
      demo: (
        <div style={WIDE}>
          <DemoTopbar />
        </div>
      ),
    },
  ],
  rules: {
    use: [
      "Крошки слева вместо заголовка страницы; последний пункт — страница.",
      "Один поиск на весь продукт, открывается по Ctrl K откуда угодно.",
      "Справа только персональное: тема, уведомления, профиль; действия страницы живут в самой странице.",
      "Счётчик уведомлений — число до 9, дальше «9+»; пропадает, когда всё прочитано.",
      "Высота 56 px совпадает с брендом сайдбара: линия под ними единая.",
    ],
    avoid: [
      "Заголовок страницы в топбаре рядом с крошками: дублирование.",
      "Кнопки действий («Создать груз») в топбаре: они принадлежат странице.",
      "Больше трёх иконок справа: остальное в меню профиля.",
      "Цветной фон топбара или navy: панель нейтральная.",
      "Перекрывать топбар панелями и диалогами: он остаётся под overlay затемнением, а не над ним.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "header + nav",
      text: 'Топбар — header (banner); крошки внутри nav aria-label «Навигация», текущая страница aria-current="page". Для поиска — aria-label «Глобальный поиск» и aria-keyshortcuts="Control+K".',
    },
    {
      kind: "aria",
      title: "Кнопки-иконки",
      text: 'У каждой есть aria-label («Сменить тему», «Уведомления, 3 новых», «Профиль»). Профиль: aria-haspopup="menu" и aria-expanded.',
    },
    {
      kind: "key",
      title: "Ctrl + K",
      text: "Фокус в поле поиска из любого места (в макете без Cmd у Mac: [TODO] добавить Meta+K).",
    },
    {
      kind: "key",
      title: "Enter / Esc в меню",
      text: "Профиль открывается Enter/Space/↓; Esc закрывает меню и возвращает фокус на кнопку профиля. [TODO] макет не описывает клавиатуру меню, это предложение.",
    },
    {
      kind: "focus",
      title: "Порядок фокуса",
      text: "Крошки → поиск → тема → уведомления → профиль. Skip-ссылка «К содержимому» перед топбаром [TODO] предложение.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Значки --text-2 на --surface 8,2:1; подсказка поиска --text-ph 3,4:1 (placeholder, допустимо для подсказки); метка Ctrl K --text-3 4,9:1; белый на красной капсуле счётчика 4,9:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Меню профиля и подсказки появляются без масштаба и сдвига; спиннер поиска вращается в три раза медленнее; hover без перехода.",
    },
  ],
  tokens: [
    { name: "--h-bar", value: "56 px", usage: "Высота топбара и бренда сайдбара", kind: "size" },
    {
      name: "grid-template-columns",
      value: "minmax(0,1fr) minmax(0,420px) minmax(max-content,1fr)",
      usage: "Раскладка",
      kind: "size",
    },
    {
      name: "--surface / --divider",
      value: "#fff / #e0e4e9",
      usage: "Фон и нижняя линия",
      kind: "color",
    },
    {
      name: "--text-2 / --text",
      value: "#44505d / #15202b",
      usage: "Значки и ссылки · текущая страница",
      kind: "color",
    },
    {
      name: "--layer-2 / --layer-3",
      value: "9 % / 12 % ink",
      usage: "Hover/active кнопок и профиля",
      kind: "color",
    },
    {
      name: "--field / --border",
      value: "#fff / #c6cdd6",
      usage: "Фон и рамка поиска",
      kind: "color",
    },
    {
      name: "--focus / --selected",
      value: "#00968f / teal 15 %",
      usage: "Рамка и ореол поиска в фокусе",
      kind: "color",
    },
    {
      name: "--danger / --on-danger",
      value: "#d03538 / #fff",
      usage: "Счётчик уведомлений",
      kind: "color",
    },
    { name: "--h-sm / --h-md", value: "28 / 32 px", usage: "Поле поиска · кнопки", kind: "size" },
    {
      name: "--r-item / --r-pill",
      value: "8 / 999 px",
      usage: "Поиск и кнопки · профиль",
      kind: "radius",
    },
    {
      name: "--shadow-pop · --r-popover",
      value: "см. Цвета · 12 px",
      usage: "Меню профиля",
      kind: "shadow",
    },
    {
      name: "--dur-f",
      value: "125 мс",
      usage: "Подложки, рамка поиска, появление меню",
      kind: "time",
    },
    {
      name: "--dur · --ease",
      value: "200 мс",
      usage: "Поворот шеврона профиля (предложение)",
      kind: "ease",
    },
  ],
  choreography: [
    {
      id: "search",
      title: "Поиск: Ctrl K и ввод",
      trigger: "Ctrl K или клик в поле",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: рамка поиска темнеет до --text-3.",
          prop: "border-color",
          easing: "ease",
        },
        { at: 700, dur: 0, what: "Фокус (Ctrl K или клик): курсор в поле.", prop: "focus" },
        {
          at: 700,
          dur: 125,
          what: "Рамка уходит к --focus, появляется ореол 3 px --selected, значок лупы красится в --link.",
          prop: "border-color, box-shadow, color",
          easing: "ease",
        },
        {
          at: 1100,
          dur: 0,
          what: "Ввод: список результатов открывается под полем. [TODO] в макете у топбара только поле; результаты — общий компонент Select/Popover.",
          prop: "—",
        },
        {
          at: 2400,
          dur: 125,
          what: "Esc или уход: рамка и ореол возвращаются.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
      ],
      focus: "В поле поиска. Esc возвращает фокус туда, где он был до Ctrl K.",
      reducedMotion: "Рамка и ореол меняются без перехода.",
      neighbours:
        "Поле не меняет размер и не сдвигает крошки или кнопки; сетка с центральной колонкой до 420 px фиксирована.",
      demo: <SearchDemo />,
    },
    {
      id: "theme",
      title: "Смена темы",
      trigger: "клик по кнопке «Сменить тему»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение и нажатие: слои 9 % и 12 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 0,
          what: "Значок меняется мгновенно: луна ↔ солнце. В макете innerHTML заменяется целиком.",
          prop: "icon",
        },
        {
          at: 600,
          dur: 0,
          what: "Токены переключаются через data-theme на документе: все цвета меняются разом. [TODO] перехода между темами в макете нет; плавная смена фона 200 мс — предложение.",
          prop: "color, background",
        },
      ],
      focus: "Остаётся на кнопке.",
      reducedMotion: "Не затрагивается: переходов между темами нет.",
      neighbours:
        "Весь экран перекрашивается одновременно; размеры и положение не меняются. Выбор хранится в localStorage (ключ темы).",
      demo: <ThemeDemo />,
    },
    {
      id: "profile",
      title: "Меню профиля",
      trigger: "клик, Enter или Space по аватару",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: подложка капсулы (слой 9 %).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "Меню появляется под кнопкой: opacity 0→1, scale .96→1, сдвиг −4 px→0.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 600,
          dur: 200,
          what: "Шеврон поворачивается на 180°, подложка остаётся пока меню открыто.",
          prop: "rotate",
          easing: "--ease",
        },
        {
          at: 2600,
          dur: 0,
          what: "Esc, выбор пункта или клик вне меню закрывает его мгновенно.",
          prop: "—",
        },
      ],
      focus: "В меню — на первый пункт; Esc возвращает на аватар.",
      reducedMotion: "Меню без масштаба и сдвига, шеврон без поворота-перехода.",
      neighbours:
        "Меню лежит поверх страницы; соседние кнопки топбара не сдвигаются. [TODO] время и движение берутся у общего popover (125 мс); отдельно в макете не заданы.",
      demo: <ProfileDemo />,
    },
  ],
  examples: [
    {
      id: "page",
      title: "Топбар страницы груза",
      demo: (
        <div style={WIDE}>
          <DemoTopbar unread={3} reserve />
        </div>
      ),
      code: `<Topbar
  crumbs={[{ label: "Грузы", href: "/cargo" }, { label: "Морской импорт", href: "/cargo/sea" }, { label: "MSKU4821907" }]}
  search={<TopbarSearch placeholder="Поиск по грузам, клиентам, документам" />}
  actions={
    <>
      <TopbarAction label="Уведомления" icon={<BellIcon />} badge={3} />
      <TopbarProfile avatar={<Avatar name="Иван Петров" />} name="Иван Петров" items={[{ label: "Выйти" }]} />
    </>
  }
/>`,
    },
  ],
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { BP_LABEL, ShellMini, type Bp, type Pat, type ShellState } from "./demo";

const W = { width: "100%", maxWidth: 640 } as const;

function rich(text: string): string {
  const nodes = text.split("`").map((p, i) => (i % 2 ? <code key={p}>{p}</code> : p));
  return (<>{nodes}</>) as unknown as string;
}

function RailDemo() {
  return (
    <Playback<{ r: boolean }>
      initial={{ r: false }}
      script={[
        { at: 600, set: { r: true } },
        { at: 2400, set: { r: false } },
      ]}
      tail={900}
      hint="Сайдбар и бренд меняют ширину за 300 мс, а контент просто получает ту же ширину: колонки перестраиваются каждый кадр."
      render={(s) => (
        <div style={W}>
          <ShellMini rail={s.r} pattern="cargo" />
        </div>
      )}
    />
  );
}

function BpDemo() {
  return (
    <Playback<{ p: Pat; bp: Bp }>
      initial={{ p: "inbox", bp: "w" }}
      script={[
        { at: 900, set: { bp: "1280" } },
        { at: 1800, set: { bp: "900" } },
        { at: 2800, set: { p: "dash", bp: "w" } },
        { at: 3700, set: { bp: "1180" } },
        { at: 4600, set: { bp: "760" } },
      ]}
      tail={1000}
      hint="Inbox: три панели → две → одна. Дашборд: сетка 12 колонок → всё в одну колонку. 760: сайдбар исчезает."
      render={(s) => (
        <div style={W}>
          <div className="ds-shell__note" aria-live="polite">
            окно {BP_LABEL[s.bp]} px · {s.p === "inbox" ? "список — деталь" : "дашборд"}
          </div>
          <ShellMini pattern={s.p} bp={s.bp} height={280} />
        </div>
      )}
    />
  );
}

function LoadDemo() {
  return (
    <Playback<{ st: ShellState }>
      initial={{ st: "loading" }}
      script={[{ at: 1600, set: { st: "ok" } }]}
      tail={1200}
      render={(s) => (
        <div style={W}>
          <ShellMini state={s.st} pattern="cargo" height={260} />
        </div>
      )}
    />
  );
}

const SCHEMES: { id: Pat; title: string; description: string; when: string }[] = [
  {
    id: "cargo",
    title: "Cargo-экран: KPI + таблица + карточки",
    description:
      "Ряд из четырёх KPI, под ним split: таблица с вкладками (1fr) и стопка карточек справа шириной 340 px. Правая колонка тянется по высоте таблицы, последняя карточка («История») заполняет остаток.",
    when: "главный экран работы: список объектов и выбранный объект рядом. Таблица прокручивается внутри, страница — нет.",
  },
  {
    id: "inbox",
    title: "List-detail «inbox»",
    description:
      "Три панели 340 | 1fr | 300 на высоту окна минус шапка и поля (100vh − 56 − 32, не менее 600 px). У каждой панели свой скролл; у детали сверху заголовок с действиями, Stepper и Tabs.",
    when: "разбор очереди: расхождения, обращения, заявки. Нужно листать список и решать, не теряя контекст.",
  },
  {
    id: "settings",
    title: "Настройки",
    description:
      "Слева навигация по разделам 220 px (липкая, top 72), справа колонка карточек шириной до 1080 px: заголовок раздела, формы в 2 колонки, строки-переключатели, «опасная зона». Панель сохранения липнет к низу окна.",
    when: "формы и конфигурация: много независимых блоков, мало данных.",
  },
  {
    id: "dash",
    title: "Дашборд",
    description:
      "Сетка 12 колонок, зазор 16. Ряд KPI 3+3+3+3, график 8 + статусы 4, топ клиентов 5 + прибытия 4 + активность 3: ряд всегда даёт ровно 12, карточки в ряду одной высоты (align-items: stretch).",
    when: "обзор показателей: каждый блок ведёт на подробный экран.",
  },
];

export default defineDoc({
  id: "app-shell",
  title: "AppShell и паттерны страниц",
  group: "navigation",
  cssPrefix: "ds-shell",
  order: 90,
  wideDemos: { variants: true, states: true },
  keywords: [
    "оболочка",
    "app shell",
    "appshell",
    "shell",
    "layout",
    "page layout",
    "макет страницы",
    "шаблон страницы",
    "сетка",
    "grid",
    "12 колонок",
    "каркас",
    "раскладка",
    "cargo",
    "inbox",
    "list-detail",
    "settings",
    "dashboard",
    "дашборд",
    "настройки",
    "брейкпоинты",
    "мёртвое место",
  ],
  summary:
    "Оболочка приложения (бренд, топбар, сайдбар, контент) и четыре паттерна страниц: cargo-экран, list-detail, настройки, дашборд. Раскладка без мёртвого места.",
  purpose:
    "AppShell задаёт каркас всех экранов: слева сайдбар с брендом, сверху топбар, в остатке область страницы с полями 16 px и зазором 16. Паттерны страниц — проверенные способы заполнить область так, чтобы не оставалось пустых углов: колонки дают в сумме 12 или заполняют высоту, нижняя карточка растёт до края соседней, панели прокручиваются сами. Здесь схемы, а не реализация: блоки подписаны, пропорции взяты из макета.",
  related: ["sidebar", "topbar", "breadcrumb", "tabs", "scroll-area", "stepper"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-shell__brand", side: "l" },
          { n: 2, anchor: ".ds-shell__top", side: "t" },
          { n: 3, anchor: ".ds-shell__side", side: "l" },
          { n: 4, anchor: ".ds-shell__content", side: "r" },
        ]}
      >
        <ShellMini />
      </Marks>
    ),
    parts: [
      {
        name: "Бренд",
        description:
          "Ячейка слева сверху: логотип и название (в rail — знак). Высота 56 px, ширина как у сайдбара, линии справа и снизу. Липкая, z-index 30.",
      },
      {
        name: "Топбар",
        description:
          "Ячейка сверху справа: крошки, поиск, действия. Липкая, 56 px. Вместе с брендом образует одну горизонтальную линию.",
      },
      {
        name: "Сайдбар",
        description: rich(
          "Ячейка слева под брендом: липкая, высота `100vh − 56`, собственная прокрутка. Ширина 248 или 56 (rail); колонка оболочки `auto` следует за ней.",
        ),
      },
      {
        name: "Контент",
        description: rich(
          "Область страницы: `minmax(0, 1fr)`, поля 16. Внутри `.page`: grid с зазором 16, `align-content: start`. Паттерн страницы выбирает раскладку внутри.",
        ),
      },
    ],
  },
  variants: SCHEMES.map((s) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    when: s.when,
    demo: (
      <div style={W}>
        <ShellMini pattern={s.id} height={s.id === "inbox" ? 300 : 280} />
      </div>
    ),
  })),
  extra: [
    {
      id: "dead-space",
      title: "Как не оставить мёртвого места",
      content: (
        <ul>
          <li>
            <b>Ряд в 12 колонок:</b> сумма span равна 12 (3+3+3+3, 8+4, 5+4+3). Ряд из 9 или 10
            колонок оставляет дыру справа. Блоков, которых не хватает до 12, растягивайте, а не
            оставляйте пустыми.
          </li>
          <li>
            <b>Карточки одного ряда одной высоты:</b> <code>align-items: stretch</code>, высоту
            диктует самая высокая. Низкая карточка не «висит» над пустотой: контент в ней растёт или
            внизу появляется «Все →».
          </li>
          <li>
            <b>Стопка рядом с таблицей:</b> правая колонка — flex-колонка на всю высоту, последняя
            карточка с <code>flex: 1</code>: она заполняет остаток, а не обрывается посередине.
          </li>
          <li>
            <b>Панели во весь экран:</b> список–деталь занимает <code>100vh − 56 − 32</code>, у
            каждой панели <code>min-height: 0</code> и <code>overflow: auto</code>. Прокручивается
            панель, не страница: нет двойного скролла и пустой подложки под короткой панелью.
          </li>
          <li>
            <b>Короткое содержимое:</b> пусто — это состояние (EmptyState по центру), а не пустое
            место. Блок не растягивают ради вида.
          </li>
          <li>
            <b>Ширина настроек:</b> колонка до 1080 px слева от свободного поля. [TODO] на экранах
            шире 1600 справа остаётся пустота: решить, центрировать колонку или добавить правую
            панель подсказок.
          </li>
          <li>
            <b>Липкие панели</b> (сайдбар, навигация настроек, панель сохранения) не создают пустых
            зон: они в потоке и прилипают, а не вырезают колонку.
          </li>
        </ul>
      ),
    },
    {
      id: "breakpoints",
      title: "Брейкпоинты макета",
      content: (
        <div className="dx-scroll">
          <table className="dx-table">
            <thead>
              <tr>
                <th>Ширина окна</th>
                <th>Что меняется</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>≤ 1280 px</td>
                <td>
                  List-detail: третья панель («Свойства») скрывается, остаётся 340 | 1fr; карточки
                  подключений в настройках в 2 колонки.
                </td>
              </tr>
              <tr>
                <td>≤ 1180 px</td>
                <td>
                  Cargo: split в одну колонку, KPI-ряд 2×2. Дашборд: все блоки span 12 (по одному в
                  ряд). [TODO] четыре KPI по 12 колонок — длинные пустые плашки; предложение: 2×2 до
                  900 px.
                </td>
              </tr>
              <tr>
                <td>≤ 900 px</td>
                <td>
                  Настройки: навигация разделов над формой, а не слева. List-detail: панели друг под
                  другом, высота по содержимому. Формы и карточки подключений в 1 колонку.
                </td>
              </tr>
              <tr>
                <td>≤ 760 px</td>
                <td>
                  Сайдбар и бренд скрыты (сетка «топбар / контент»), центральная колонка топбара
                  (поиск) скрыта, KPI-матрица в 3 колонки. [TODO] мобильное меню и кнопка поиска в
                  макете не нарисованы.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Развёрнутый сайдбар",
      note: "Сайдбар 248 px, бренд с названием; контент занимает остаток.",
      demo: <ShellMini height={190} />,
    },
    {
      id: "rail",
      kind: "selected",
      title: "Rail",
      note: "Сайдбар и бренд 56 px; контент шире на 192 px, колонки паттерна перестраиваются.",
      demo: <ShellMini rail height={190} />,
    },
    {
      id: "mobile",
      kind: "other",
      title: "Мобильный (≤ 760)",
      note: "Нет сайдбара и бренда; топбар без поиска. [TODO] мобильное меню.",
      demo: <ShellMini bp="760" height={190} />,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Оболочка уже на месте, загрузчик с брендовым знаком — в области контента. На всю страницу — только при первом входе (затухание 260 мс).",
      demo: <ShellMini state="loading" height={190} />,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Нет данных: EmptyState по центру области с одним действием. Паттерн целиком не рисуется.",
      demo: <ShellMini state="empty" height={190} />,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Ошибка загрузки страницы: плашка в области контента с «Повторить»; навигация доступна. [TODO] предложение, в макете нет страницы ошибки.",
      demo: <ShellMini state="error" height={190} />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover / Active / Focus",
      note: "У оболочки нет: состояния принадлежат вложенным компонентам (Sidebar, Topbar, Tabs).",
      notApplicable: true,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Нет: недоступный раздел — это disabled-пункт сайдбара.",
      notApplicable: true,
    },
  ],
  rules: {
    use: [
      "Один каркас на все страницы: бренд · топбар · сайдбар · контент.",
      "Крошки в топбаре и страница без заголовка; ряд действий в самом содержимом.",
      "Сайдбар и топбар липкие, скроллится только область контента (или панели внутри неё).",
      "Паттерн выбирайте по задаче: список+объект → cargo; очередь → inbox; формы → settings; обзор → dashboard.",
      "Ряды сетки в сумме дают 12; высоты карточек в ряду равны.",
      "Каждый паттерн имеет состояния loading/empty/error: в области контента, не вместо оболочки.",
    ],
    avoid: [
      "Два уровня прокрутки на странице list-detail.",
      "Колонки по 3+4+4: дыра в одну колонку справа.",
      "Растягивать пустые карточки ради ровной сетки: пустое — это EmptyState.",
      "Свой каркас на отдельной странице («особый» топбар или сайдбар).",
      "Левая акцентная полоска на карточках и пунктах: акцент — подложка и кольцо.",
      "Заголовок страницы под крошками: когда крошки есть, заголовка нет.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Ориентиры",
      text: "header (топбар), nav aria-label «Разделы» (сайдбар), main (контент). У навигации в настройках — свой nav aria-label «Разделы настроек».",
    },
    {
      kind: "key",
      title: "Порядок фокуса",
      text: "Топбар (крошки → поиск → тема → уведомления → профиль) → сайдбар → контент. Перед топбаром — ссылка «К содержимому» [TODO] предложение; в макете её нет.",
    },
    {
      kind: "key",
      title: "Ctrl + \\ и Ctrl + K",
      text: "Сворачивание сайдбара и поиск: глобальные сочетания; в справке продукта их стоит перечислить.",
    },
    {
      kind: "focus",
      title: "Фокус при смене страницы",
      text: "[TODO] в макете не определён: предложение — после перехода фокус на заголовок страницы или на первую крошку, прокрутка вверх (как в макете), объявление названия через aria-live.",
    },
    {
      kind: "aria",
      title: "Панели list-detail",
      text: "Каждая панель — region с aria-label («Список», «Деталь», «Свойства»); выбранная строка списка — aria-current или aria-selected. При ≤ 900 px панели идут по порядку DOM.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Сворачивание сайдбара в rail и перестройка колонок — мгновенно; загрузочный знак вращается медленнее.",
    },
    {
      kind: "contrast",
      title: "Контраст границ панелей",
      text: "Линии --divider (1,3:1) разделяют зоны, но не несут смысла; смысл — в заголовках и отступах. У карточек рамка --border 1,7:1.",
    },
  ],
  tokens: [
    { name: "--h-bar", value: "56 px", usage: "Высота топбара и бренда", kind: "size" },
    { name: "--w-side / --w-rail", value: "248 / 56 px", usage: "Ширина сайдбара", kind: "size" },
    { name: ".content padding", value: "16 px", usage: "Поля области страницы", kind: "size" },
    { name: ".page / .kit gap", value: "16 px", usage: "Зазор между блоками", kind: "size" },
    {
      name: "колонки",
      value: "12 (зазор 16)",
      usage: "Сетка дашборда (c3, c4, c5, c8, c12)",
      kind: "size",
    },
    {
      name: "split",
      value: "minmax(0,1fr) 340px",
      usage: "Cargo: таблица | карточки",
      kind: "size",
    },
    {
      name: "list-detail",
      value: "340px · 1fr · 300px",
      usage: "Три панели; высота 100vh − 56 − 32, не менее 600",
      kind: "size",
    },
    {
      name: "settings",
      value: "220px · 1fr (≤ 1080 px)",
      usage: "Навигация | колонка карточек",
      kind: "size",
    },
    {
      name: "брейкпоинты",
      value: "1280 · 1180 · 900 · 760 px",
      usage: "См. таблицу выше",
      kind: "other",
    },
    {
      name: "--page / --surface",
      value: "#f4f5f7 / #fff",
      usage: "Фон страницы под карточками · фон панелей",
      kind: "color",
    },
    {
      name: "--dur-s · --glide",
      value: "300 мс · cubic-bezier(.4,0,.2,1)",
      usage: "Ширина сайдбара и бренда",
      kind: "ease",
    },
  ],
  choreography: [
    {
      id: "rail",
      title: "Сворачивание сайдбара: что делает страница",
      trigger: "кнопка у бренда, Ctrl+\\ или клик по значку группы в rail",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 300,
          what: rich("Колонка оболочки `auto`: бренд и сайдбар сужаются 248 → 56 px."),
          prop: "width",
          easing: "--glide",
        },
        {
          at: 0,
          dur: 300,
          what: rich(
            "Контент забирает освободившуюся ширину: колонка `minmax(0,1fr)` пересчитывается в каждом кадре, паттерн перестраивается (таблица шире, карточки те же 340).",
          ),
          prop: "layout",
          easing: "--glide",
        },
        {
          at: 0,
          dur: 200,
          what: "Внутри сайдбара: логотип гаснет, знак проявляется, пункты свёрнуты (подробно — на странице Sidebar).",
          prop: "opacity, grid-template-rows",
          easing: "--dur",
        },
        {
          at: 300,
          dur: 0,
          what: "Топбар не двигается: у него своя сетка, крошки получают больше места.",
          prop: "—",
        },
      ],
      focus: "Остаётся на кнопке сворачивания; страница ничего не фокусирует сама.",
      reducedMotion: "Ширина меняется мгновенно; контент перестраивается один раз.",
      neighbours: rich(
        "Всё, что в контенте шириной в `1fr`, растёт (таблицы, графики, панель деталей). Блоки с фиксированной шириной (340, 300, 220) остаются прежними. Графики и таблицы пересчитывают размер через ResizeObserver [TODO] проверить в ui-kit, что нет перерисовки на каждом кадре.",
      ),
      demo: <RailDemo />,
    },
    {
      id: "breakpoints",
      title: "Перестройка по брейкпоинтам",
      trigger: "окно сузилось ниже 1280 / 1180 / 900 / 760 px",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "≤ 1280: у list-detail пропадает третья панель; ряды настроек и подключений уходят в 2 колонки.",
          prop: "grid-template-columns",
        },
        {
          at: 0,
          dur: 0,
          what: "≤ 1180: split cargo и все блоки дашборда становятся span 12; KPI cargo 4 → 2 колонки.",
          prop: "grid-column",
        },
        {
          at: 0,
          dur: 0,
          what: "≤ 900: панели list-detail идут друг под другом, навигация настроек над формой.",
          prop: "grid-template-columns",
        },
        {
          at: 0,
          dur: 0,
          what: rich("≤ 760: сайдбар и бренд пропадают, у топбара остаётся `1fr auto`."),
          prop: "display",
        },
      ],
      focus: "Не затрагивается; скрытые панели из порядка Tab должны выпадать (display: none).",
      reducedMotion: "Не затрагивается: переходов нет, перестройка мгновенная.",
      neighbours:
        "Скрытые блоки не оставляют пустого места: соседние занимают свободную ширину. Порядок в DOM = порядок при колонке (список, деталь, свойства).",
      demo: <BpDemo />,
    },
    {
      id: "load",
      title: "Загрузка страницы",
      trigger: "переход на страницу, данные ещё грузятся",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Оболочка (бренд, топбар, сайдбар) остаётся на месте; в области контента загрузчик со знаком и подписью по центру.",
          prop: "content",
        },
        {
          at: 1600,
          dur: 0,
          what: "Данные пришли: паттерн страницы встаёт на место (раскладка уже известна, размеры не прыгают).",
          prop: "content",
        },
        {
          at: 1600,
          dur: 260,
          what: "Полноэкранный загрузчик (только первый вход): затухание 260 мс и удаление. [TODO] для обычных переходов в макете загрузчик на всю страницу не используется, а затухания области нет: предложение — Skeleton формы паттерна.",
          prop: "opacity",
          easing: "ease",
        },
      ],
      focus:
        "На время загрузки остаётся на элементе, вызвавшем переход; после — по правилам страницы (заголовок или первая крошка).",
      reducedMotion: "Знак вращается в три раза медленнее; затухание без перехода.",
      neighbours:
        "Сайдбар и топбар не перерисовываются; активный пункт и крошки меняются сразу при переходе, не при загрузке данных.",
      demo: <LoadDemo />,
    },
  ],
  examples: [
    {
      id: "cargo",
      title: "Cargo-экран",
      demo: (
        <div style={W}>
          <ShellMini pattern="cargo" height={260} />
        </div>
      ),
      code: `<AppShell brand={<Logo />} sidebar={<Sidebar … />} topbar={<Topbar … />} rail={rail}>
  <CargoPage />
</AppShell>`,
    },
    {
      id: "inbox",
      title: "List-detail",
      demo: (
        <div style={W}>
          <ShellMini pattern="inbox" height={260} />
        </div>
      ),
      code: `<AppShell sidebar={<Sidebar … />} topbar={<Topbar … />}>
  <div className="inbox">{list}{detail}{properties}</div>
</AppShell>`,
    },
    {
      id: "dash",
      title: "Дашборд",
      demo: (
        <div style={W}>
          <ShellMini pattern="dash" height={280} />
        </div>
      ),
      code: `<AppShell sidebar={<Sidebar … />} topbar={<Topbar … />}>
  <div className="grid12">…</div>
</AppShell>`,
    },
  ],
});

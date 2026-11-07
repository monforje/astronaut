/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  CellSamples,
  DemoDataTable,
  ROWS,
  type ColId,
  type Density,
  type Force,
  type SortState,
  type TabId,
  type TableState,
} from "./demo";

const R0 = ROWS[0].id;
const R1 = ROWS[1].id;
const R2 = ROWS[2].id;

const Wide = ({ children }: { children: React.ReactNode }) => (
  <div className="ds-dtable__demo">{children}</div>
);

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

function SortDemo() {
  return (
    <Playback<{ sort: SortState | null; f?: { col: ColId; mode: Force } }>
      initial={{ sort: null }}
      script={[
        { at: 400, set: { f: { col: "w", mode: "hover" } } },
        { at: 1000, set: { f: { col: "w", mode: "active" } } },
        { at: 1250, set: { f: { col: "w", mode: "hover" }, sort: { col: "w", dir: "asc" } } },
        { at: 2200, set: { f: { col: "w", mode: "active" } } },
        { at: 2450, set: { f: { col: "w", mode: "hover" }, sort: { col: "w", dir: "desc" } } },
        { at: 3400, set: { f: { col: "w", mode: "active" } } },
        { at: 3650, set: { f: { col: "w", mode: "hover" }, sort: null } },
        { at: 4400, set: { f: undefined } },
      ]}
      tail={700}
      hint="Цикл «возрастание → убывание → сброс». Строки в макете перерисовываются сразу."
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={5} sort={s.sort} forceSort={s.f} />
        </Wide>
      )}
    />
  );
}

function SelectDemo() {
  return (
    <Playback<{ picked: string[]; f?: { id: string; mode: Force } }>
      initial={{ picked: [] }}
      script={[
        { at: 400, set: { f: { id: R0, mode: "hover" } } },
        { at: 900, set: { picked: [R0], f: { id: R0, mode: "hover" } } },
        { at: 1500, set: { f: { id: R1, mode: "hover" } } },
        { at: 1900, set: { picked: [R0, R1], f: { id: R1, mode: "hover" } } },
        { at: 2700, set: { f: undefined } },
        { at: 3300, set: { picked: [] } },
      ]}
      tail={700}
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} picked={s.picked} forceRow={s.f} active={null} />
        </Wide>
      )}
    />
  );
}

function TabDemo() {
  return (
    <Playback<{ tab: TabId }>
      initial={{ tab: "all" }}
      script={[
        { at: 600, set: { tab: "err" } },
        { at: 1800, set: { tab: "wait" } },
        { at: 3000, set: { tab: "all" } },
      ]}
      tail={900}
      render={(s) => (
        <Wide>
          <DemoDataTable noToolbar size={4} tab={s.tab} />
        </Wide>
      )}
    />
  );
}

function PageDemo() {
  return (
    <Playback<{ page: number; f?: { page: number; mode: Force } }>
      initial={{ page: 0 }}
      script={[
        { at: 500, set: { f: { page: 1, mode: "hover" } } },
        { at: 1000, set: { page: 1, f: { page: 1, mode: "hover" } } },
        { at: 1900, set: { f: { page: 2, mode: "hover" } } },
        { at: 2300, set: { page: 2, f: { page: 2, mode: "hover" } } },
        { at: 3200, set: { f: undefined } },
      ]}
      tail={700}
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} page={s.page} forceFoot={s.f} active={null} />
        </Wide>
      )}
    />
  );
}

function LoadDemo() {
  return (
    <Playback<{ st: TableState }>
      initial={{ st: "loading" }}
      script={[{ at: 2000, set: { st: "data" } }]}
      tail={1200}
      hint="Строки заглушек стартуют со сдвигом 80 мс. Предложение: данные проявляются без прыжка высоты."
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={5} state={s.st} />
        </Wide>
      )}
    />
  );
}

function ErrorDemo() {
  return (
    <Playback<{ st: TableState; busy: boolean }>
      initial={{ st: "error", busy: false }}
      script={[
        { at: 700, set: { busy: true } },
        { at: 1000, set: { st: "loading", busy: false } },
        { at: 1800, set: { st: "data" } },
      ]}
      tail={1200}
      hint="«Повторить» ведёт в загрузку на 0,8 с, затем данные (в макете так же)."
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} state={s.st} retryLoading={s.busy} />
        </Wide>
      )}
    />
  );
}

function SearchDemo() {
  return (
    <Playback<{ q: string }>
      initial={{ q: "" }}
      script={[
        { at: 400, set: { q: "М" } },
        { at: 600, set: { q: "MS" } },
        { at: 800, set: { q: "MSK" } },
        { at: 1000, set: { q: "MSKU" } },
        { at: 2200, set: { q: "ZZZ" } },
        { at: 3400, set: { q: "" } },
      ]}
      tail={800}
      hint="Предложение: задержка поиска 200 мс. В макете фильтр срабатывает на каждый символ."
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs size={4} query={s.q} />
        </Wide>
      )}
    />
  );
}

function DensityDemo() {
  return (
    <Playback<{ d: Density }>
      initial={{ d: "normal" }}
      script={[
        { at: 600, set: { d: "compact" } },
        { at: 1800, set: { d: "comfort" } },
        { at: 3000, set: { d: "normal" } },
      ]}
      tail={700}
      hint="Предложение: высота строк меняется за 200 мс. В макете переключение мгновенное."
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} density={s.d} />
        </Wide>
      )}
    />
  );
}

function RowDemo() {
  return (
    <Playback<{ f?: { id: string; mode: Force } }>
      initial={{}}
      script={[
        { at: 400, set: { f: { id: R2, mode: "hover" } } },
        { at: 1500, set: { f: { id: R2, mode: "active" } } },
        { at: 1800, set: { f: { id: R2, mode: "hover" } } },
        { at: 2700, set: { f: { id: R2, mode: "focus" } } },
        { at: 3700, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} active={null} forceRow={s.f} />
        </Wide>
      )}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Default · строка",
    note: "Фон --surface, разделитель --divider. Кнопки строки скрыты.",
    demo: <DemoDataTable mini size={3} active={null} />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover · строка",
    note: "Слой ink 4 % поверх фона строки; проявляются «копировать» и «⋯».",
    forced: true,
    demo: <DemoDataTable mini size={3} active={null} forceRow={{ id: R1, mode: "hover" }} />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active · строка",
    note: "Слой 7 %. Если нажато на кнопку или флажок внутри строки, слой строки не меняется.",
    forced: true,
    demo: <DemoDataTable mini size={3} active={null} forceRow={{ id: R1, mode: "active" }} />,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus · строка",
    note: "Контур 2px --focus внутри строки (offset −2, чтобы не резался overflow).",
    forced: true,
    demo: <DemoDataTable mini size={3} active={null} forceRow={{ id: R1, mode: "focus" }} />,
  },
  {
    id: "selected",
    kind: "selected",
    title: "Selected · строка",
    note: "Фон --selected, флажок включён, aria-selected. Открытая в карточке строка выглядит так же.",
    demo: <DemoDataTable mini size={3} picked={[R1]} active={null} />,
  },
  {
    id: "sort",
    kind: "other",
    title: "Сортировка в шапке",
    note: "Hover: подложка 9 %, значок 100 %. Отсортированная: значок «вверх» или «вниз», aria-sort.",
    forced: true,
    demo: (
      <DemoDataTable
        mini
        size={2}
        active={null}
        sort={{ col: "st", dir: "asc" }}
        forceSort={{ col: "id", mode: "hover" }}
      />
    ),
  },
  {
    id: "loading",
    kind: "loading",
    title: "Loading",
    note: "Скелетон на месте строк, шапка остаётся, флажок «все» выключен. aria-busy на таблице.",
    demo: <DemoDataTable mini state="loading" />,
  },
  {
    id: "error",
    kind: "error",
    title: "Error",
    note: "В теле — ошибка, причина и «Повторить». Тулбар и вкладки живы.",
    demo: <DemoDataTable mini state="error" />,
  },
  {
    id: "empty",
    kind: "empty",
    title: "Empty",
    note: "Значок, «Грузов пока нет», два действия: главное и «Подключить 1С».",
    demo: <DemoDataTable mini state="empty" />,
  },
  {
    id: "noresults",
    kind: "empty",
    title: "Ничего не нашлось",
    note: "Фильтр или поиск ничего не дали: «Сбросить всё» вместо создания.",
    demo: <DemoDataTable mini query="ZZZ" />,
  },
  NA(
    "disabled",
    "disabled",
    "Disabled",
    "Таблицу целиком не отключают. Недоступные действия — disabled у кнопок и вкладки «Архив»; в loading, empty и error флажок «выбрать все» выключен.",
  ),
];

export default defineDoc({
  id: "data-table",
  title: "DataTable",
  group: "tables",
  cssPrefix: "ds-dtable",
  order: 10,
  keywords: [
    "таблица",
    "grid",
    "список",
    "сортировка",
    "пагинация",
    "фильтр",
    "выбор строк",
    "table",
    "datatable",
    "data grid",
    "datagrid",
    "таблица данных",
    "строки и колонки",
    "столбцы",
    "колонки",
    "шапка",
    "sticky header",
    "зебра",
    "плотность",
    "density",
    "pagination",
    "постраничная навигация",
    "поиск по таблице",
    "bulk actions",
    "массовые действия",
    "флажок",
    "реестр",
    "список грузов",
    "скелетон",
  ],
  wideDemos: { variants: true },
  summary:
    "Таблица для рабочего списка: вкладки-статусы, поиск и фильтры, сортировка, выбор строк, плотность, страницы и состояния загрузки, ошибки и пусто.",
  purpose:
    "DataTable — основной экран работы с грузами и документами. Граница — кольцо карточки поверх содержимого (видна по бокам в обеих темах); шапка закреплена; цифры и номера в Onest с tabular-nums, не моноширинные. Строка открывает карточку объекта, флажок — выбирает для массовых действий: это разные жесты.",
  related: ["card", "badge", "avatar", "skeleton", "button", "tabs", "checkbox", "chart"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-dtable", side: "r" },
          { n: 2, anchor: ".ds-dtable__tabs", side: "l" },
          { n: 3, anchor: ".ds-dtable__bar", side: "l" },
          { n: 4, anchor: ".ds-dtable__chips", side: "l" },
          { n: 5, anchor: ".ds-dtable__table thead", side: "l" },
          { n: 6, anchor: ".ds-dtable__table tbody tr", side: "l" },
          { n: 7, anchor: ".ds-dtable__selbar", side: "l" },
          { n: 8, anchor: ".ds-dtable__foot", side: "l" },
        ]}
      >
        <DemoDataTable
          narrow
          size={3}
          picked={[ROWS[8].id]}
          query="MSKU"
          sort={{ col: "id", dir: "asc" }}
        />
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "ds-card ds-card--flush: радиус 14, overflow clip, кольцо 1px --border поверх содержимого (видно по бокам в обеих темах).",
      },
      {
        name: "Вкладки-статусы",
        description:
          "Высота 44, счётчики в чипах; бегущая линия 2px под выбранной. Меняют набор строк, а не раздел страницы. Необязательны.",
        optional: true,
      },
      {
        name: "Тулбар",
        description:
          "Высота 52: поиск 260 слева, фильтры-кнопки, «Колонки»; справа одно главное действие (Primary sm).",
        optional: true,
      },
      {
        name: "Чипы фильтров",
        description:
          "Появляются под тулбаром при активном фильтре: «Поиск: MSKU» с ×, справа «Сбросить всё». Фон --surface-muted.",
        optional: true,
      },
      {
        name: "Шапка",
        description:
          "Высота 40, sticky, фон --surface-muted, 12/600, линия --border снизу. Сортировка — кнопка с подложкой на hover, цикл asc → desc → сброс.",
      },
      {
        name: "Строка",
        description:
          "Высота 36 / 48 / 56 по плотности. Первая колонка — флажок. Hover — слой 4 %, выбранная — --selected. «Копировать» и «⋯» появляются на hover.",
      },
      {
        name: "Панель выбора",
        description:
          "Над подвалом: «Выбрано: N», действия над строками (Выгрузить, Сверить, В архив — destructive) и сброс выбора справа.",
        optional: true,
      },
      {
        name: "Подвал",
        description:
          "«Выбрано: N из M», строк на странице, «с–по из M», кнопки страниц 28 × 28 с «…»; текущая — aria-current.",
      },
    ],
  },
  variants: [
    {
      id: "full",
      title: "Со вкладками и тулбаром",
      description:
        "Основной вид списка: вкладки, тулбар, шапка, строки, подвал. Строка открывает карточку объекта справа (в макете — разделённый экран).",
      when: "главный список раздела: грузы, документы, расхождения.",
      demo: (
        <Wide>
          <DemoDataTable size={4} />
        </Wide>
      ),
    },
    {
      id: "embedded",
      title: "Встроенная",
      description:
        "Без вкладок и тулбара: только шапка, строки и подвал. Для таблицы внутри карточки объекта.",
      when: "короткий список связанных записей: документы груза, события.",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={3} />
        </Wide>
      ),
    },
    {
      id: "lines-h",
      title: "Линии: горизонтальные",
      description: "Разделитель --divider между строками. Вариант по умолчанию.",
      when: "обычный список, колонки разной ширины.",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={3} lines="h" />
        </Wide>
      ),
    },
    {
      id: "lines-grid",
      title: "Линии: сетка",
      description: "Вертикальные разделители между колонками (--divider) и горизонтальные.",
      when: "сверка значений по колонкам, много чисел.",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={3} lines="grid" />
        </Wide>
      ),
    },
    {
      id: "lines-zebra",
      title: "Линии: зебра",
      description: "Чётные строки темнее на 55 % от --surface-muted, горизонтальных линий нет.",
      when: "длинные широкие строки, глаз теряет строку.",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={4} lines="zebra" />
        </Wide>
      ),
    },
    {
      id: "sticky",
      title: "Закреплённая шапка",
      description:
        "Область таблицы с фиксированной высотой: шапка остаётся при прокрутке, подвал и панель выбора — за пределами прокрутки.",
      when: "высота экрана ограничена, строк много (12–50 на странице).",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={12} height={260} />
        </Wide>
      ),
    },
  ],
  sizes: [
    {
      id: "compact",
      title: "Compact",
      value: "строка 36",
      note: "много данных, поиск глазами",
      demo: (
        <Wide>
          <DemoDataTable mini size={3} density="compact" />
        </Wide>
      ),
    },
    {
      id: "normal",
      title: "Normal",
      value: "строка 48",
      note: "по умолчанию",
      demo: (
        <Wide>
          <DemoDataTable mini size={3} density="normal" />
        </Wide>
      ),
    },
    {
      id: "comfort",
      title: "Comfort",
      value: "строка 56",
      note: "мало строк, крупные ячейки",
      demo: (
        <Wide>
          <DemoDataTable mini size={3} density="comfort" />
        </Wide>
      ),
    },
  ],
  extra: [
    {
      id: "body-states",
      title: "Тело таблицы: загрузка, ошибка, пусто",
      content: (
        <div style={{ display: "grid", gap: 16, width: "100%" }}>
          <Wide>
            <DemoDataTable noTabs noToolbar state="loading" />
          </Wide>
          <Wide>
            <DemoDataTable noTabs noToolbar state="error" />
          </Wide>
          <Wide>
            <DemoDataTable noTabs noToolbar state="empty" />
          </Wide>
          <Wide>
            <DemoDataTable noTabs query="ZZZ" />
          </Wide>
        </div>
      ),
    },
    {
      id: "cells",
      title: "Ячейки",
      content: <CellSamples />,
    },
  ],
  states,
  stateMatrix: {
    columns: ["Default", "Hover", "Active", "Focus", "Selected"],
    rows: [
      {
        label: "Строка",
        cells: ["--surface", "слой 4 %", "слой 7 %", "контур 2px внутри", "--selected"],
      },
      {
        label: "Шапка (сортировка)",
        cells: [
          "значок 55 %",
          "подложка 9 %, значок 100 %",
          "подложка 12 %",
          "контур 2px",
          "значок вверх / вниз",
        ],
      },
      {
        label: "Страница",
        cells: [
          "без фона",
          "слой 9 %",
          "слой 12 %",
          "контур 2px",
          "--selected + кольцо (aria-current)",
        ],
      },
      {
        label: "Вкладка",
        cells: [
          "--text-2",
          "подложка 9 % под подписью",
          "подложка 12 %",
          "контур 2px по подписи",
          "--text + линия 2px",
        ],
      },
    ],
  },
  choreography: [
    {
      id: "sort",
      title: "Сортировка",
      trigger: "клик по заголовку колонки (Enter / Space на кнопке в шапке)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: подложка 9 % под заголовком, значок сортировки с 55 % до 100 %.",
          prop: "background, opacity",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "Нажатие: подложка 12 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 850,
          dur: 0,
          what: "Отпускание: сортировка «по возрастанию»; значок «вверх», aria-sort=ascending; страница сбрасывается на первую; строки перерисованы целиком.",
          prop: "tbody, aria-sort",
        },
        {
          at: 1800,
          dur: 0,
          what: "Второй клик: «по убыванию». Третий — сброс к исходному порядку, значок снова нейтральный.",
          prop: "tbody, aria-sort",
        },
      ],
      focus:
        "Фокус остаётся на кнопке заголовка (в макете таблица перерисовывается вместе с шапкой: [TODO] вернуть фокус на ту же кнопку).",
      reducedMotion: "Переход подложки отключается; строки меняются так же мгновенно.",
      neighbours:
        "Ширины колонок фиксированы (table-layout: fixed), соседние колонки не сдвигаются; смена строк без анимации.",
      demo: <SortDemo />,
    },
    {
      id: "select",
      title: "Выбор строки и панель массовых действий",
      trigger: "клик по флажку строки (Space на фокусе флажка)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover строки: слой 4 %, проявляются «копировать» и «⋯».",
          prop: "background, opacity",
          easing: "ease",
        },
        {
          at: 500,
          dur: 125,
          what: "Флажок включён: фон строки идёт к --selected, галочка и teal-заливка флажка.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 500,
          dur: 200,
          what: "Над подвалом появляется панель «Выбрано: N»: в макете сразу, предложение — подъём на 6 px с проявлением.",
          prop: "opacity, translate",
          easing: "--ease",
        },
        {
          at: 1500,
          dur: 0,
          what: "Вторая строка: счётчик в панели «Выбрано: 2», «выбрать все» в шапке — неполное состояние.",
          prop: "text, indeterminate",
        },
        {
          at: 2900,
          dur: 0,
          what: "Снятие выбора крестом справа: фон возвращается, панель исчезает.",
          prop: "tbody, selbar",
        },
      ],
      focus:
        "Фокус остаётся на флажке; Tab после флажка идёт в «копировать» и «⋯», затем в следующую строку. Клик по флажку не открывает карточку.",
      reducedMotion: "Переход фона отключается; панель появляется без подъёма.",
      neighbours:
        "Панель появляется между таблицей и подвалом и сдвигает подвал вниз; область таблицы при заданной высоте не меняется.",
      demo: <SelectDemo />,
    },
    {
      id: "tab",
      title: "Смена вкладки-статуса",
      trigger: "клик по вкладке или ←/→ на вкладке (предложение)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Линия 2px под вкладками переезжает к новой вкладке: меняются ширина и сдвиг.",
          prop: "translate, width",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 125,
          what: "Подпись выбранной вкладки получает --text и вес 600; её счётчик становится teal-подложкой.",
          prop: "color, background",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Набор строк заменяется, страница сбрасывается на первую; в подвале «с–по из M» пересчитано.",
          prop: "tbody",
        },
      ],
      focus:
        "Фокус остаётся на вкладке. Roving tabindex: Tab входит в выбранную вкладку; ←/→ переключают и переносят фокус (предложение, в макете только клик).",
      reducedMotion: "Линия переходит мгновенно, остальное без анимации.",
      neighbours:
        "Высота таблицы может измениться вместе с числом строк на странице; при заданной высоте области — нет.",
      demo: <TabDemo />,
    },
    {
      id: "page",
      title: "Подгрузка: страницы",
      trigger: "клик по номеру страницы, «‹» или «›»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover страницы: слой 9 %.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 500,
          dur: 0,
          what: "Страница заменяется: новые строки, «с–по из M» пересчитано, у текущей кнопки aria-current=page и фон --selected.",
          prop: "tbody, aria-current",
        },
        {
          at: 500,
          dur: 0,
          what: "Для сетевой подгрузки: предложение — показать скелетон строк (см. «Скелетон → данные») и держать прокрутку вверху.",
          prop: "—",
        },
      ],
      focus:
        "Фокус остаётся на нажатой кнопке страницы; на краях «‹»/«›» становится disabled и фокус уходит на ближайшую.",
      reducedMotion: "Переходы слоя отключаются; смена страницы без анимации.",
      neighbours:
        "Подвал стоит на месте; число кнопок страниц может измениться («…»), размеры 28 × 28 постоянны.",
      demo: <PageDemo />,
    },
    {
      id: "skeleton",
      title: "Скелетон → данные",
      trigger: "первая загрузка или смена фильтра, пока ответа нет",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 1200,
          what: "Шесть строк-заглушек: блок 12 px в каждой ячейке (70 % / 40 % у числа / 55 %), градиент ходит слева направо, линейно, бесконечно.",
          prop: "background-position",
          easing: "linear",
        },
        {
          at: 0,
          dur: 480,
          what: "Старт анимации по строкам со сдвигом 80 мс: волна идёт сверху вниз.",
          prop: "animation-delay",
        },
        {
          at: 2000,
          dur: 0,
          what: "Данные приходят: заглушки заменяются строками, aria-busy снимается. Предложение: проявление 200 мс.",
          prop: "tbody",
        },
      ],
      focus:
        "Тулбар остаётся в Tab; поле поиска не теряет ввод. Фокус в строках появляется после загрузки.",
      reducedMotion: "Градиент не движется (в макете замедлен до 3 с; в словаре убран).",
      neighbours:
        "Шапка, тулбар и подвал на месте; высота шести строк-заглушек равна высоте строки по плотности.",
      demo: <LoadDemo />,
    },
    {
      id: "error",
      title: "Ошибка и «Повторить»",
      trigger: "запрос завершился ошибкой; нажатие «Повторить»",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "В теле: значок и «Не удалось загрузить грузы» (--err-text), причина, кнопка «Повторить».",
          prop: "tbody",
        },
        {
          at: 700,
          dur: 125,
          what: "Нажатие: кнопка занята (aria-busy, спиннер).",
          prop: "content",
          easing: "ease",
        },
        {
          at: 1000,
          dur: 800,
          what: "Скелетон на 0,8 с (в макете имитация), затем данные.",
          prop: "tbody",
        },
      ],
      focus:
        "Фокус остаётся на «Повторить»; после успеха переходит на заголовок таблицы или первую строку [TODO].",
      reducedMotion: "Спиннер замедляется до 3 с, остальное статично.",
      neighbours: "Тулбар и вкладки не блокируются; высота тела определяется текстом ошибки.",
      demo: <ErrorDemo />,
    },
    {
      id: "search",
      title: "Поиск, чипы и «ничего не нашлось»",
      trigger: "ввод в поле поиска",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Каждый символ фильтрует строки сразу и сбрасывает страницу; появляется «×» в поле.",
          prop: "tbody, x",
        },
        {
          at: 0,
          dur: 0,
          what: "Под тулбаром появляется строка чипов: «Поиск: MSKU» и «Сбросить всё».",
          prop: "chips",
        },
        {
          at: 1800,
          dur: 0,
          what: "Нет совпадений: в теле «Ничего не нашлось», «По запросу … ничего нет», «Сбросить всё».",
          prop: "tbody",
        },
        {
          at: 3000,
          dur: 0,
          what: "Очистка: чипы убираются, строки возвращаются.",
          prop: "tbody, chips",
        },
      ],
      focus:
        "Фокус остаётся в поле при вводе; «×» возвращает фокус в поле. Горячая клавиша «/» ставит фокус в поиск (в макете на экране грузов).",
      reducedMotion: "Анимации нет, поведение прежнее.",
      neighbours:
        "Строка чипов добавляет 41 px и сдвигает таблицу вниз; убирается без анимации (предложение — сворачивать 200 мс).",
      demo: <SearchDemo />,
    },
    {
      id: "density",
      title: "Смена плотности",
      trigger: "выбор плотности в настройках таблицы",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Высота строки меняется 48 → 36 → 56 px; ширины колонок неизменны.",
          prop: "height",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Размер шрифта и значков не меняется: плотность — только вертикаль.",
          prop: "—",
        },
      ],
      focus: "Фокус остаётся на выбранной строке или контроле.",
      reducedMotion: "Высота меняется мгновенно.",
      neighbours:
        "Подвал и тулбар остаются на месте; общая высота таблицы меняется, если область не зафиксирована.",
      demo: <DensityDemo />,
    },
    {
      id: "row",
      title: "Hover, нажатие и фокус строки",
      trigger: "наведение, нажатие, Tab на строку",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: фон строки темнее на 4 %, проявляются «копировать» и «⋯».",
          prop: "background, opacity",
          easing: "ease",
        },
        {
          at: 1100,
          dur: 125,
          what: "Нажатие на строку (не на кнопку внутри): слой 7 %; по отпусканию строка открывается в карточке и становится --selected.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 2300,
          dur: 0,
          what: "Фокус с клавиатуры: контур 2px внутри строки; Enter или Space открывают карточку.",
          prop: "outline",
        },
      ],
      focus:
        "Строка — tabindex 0; внутри ещё фокусируются флажок, «копировать» и «⋯». Enter на строке открывает, на кнопке — её действие.",
      reducedMotion: "Переход фона отключается.",
      neighbours:
        "Соседние строки не реагируют; ширины колонок не меняются при появлении кнопок (они занимают место и прозрачны).",
      demo: <RowDemo />,
    },
  ],
  rules: {
    use: [
      "Граница — кольцо карточки: видно по бокам в светлой и тёмной теме.",
      "Строка и флажок — разные жесты: клик по строке открывает объект, флажок выбирает.",
      "Числа вправо, tabular-nums; номера контейнеров Onest 600, не Fira Code.",
      "В колонке статуса фиксируйте ширину (170): бейдж не должен сдвигать соседей.",
      "Пустая и пустая-после-фильтра таблицы различаются: «создайте» против «сбросьте».",
      "Скелетон повторяет высоту строки выбранной плотности.",
      "Одно главное действие в тулбаре (Primary), массовые действия — в панели выбора.",
    ],
    avoid: [
      "Левая цветная полоска у строки как акцент выбора: выбор — фоном --selected и флажком.",
      "Моноширинный шрифт для ID, номеров и сумм.",
      "Сортировка и выбор в одной кнопке заголовка: флажок «все» — отдельная колонка.",
      "Больше одной строки действий над таблицей (вкладки, тулбар, чипы — каждый слой своё).",
      "Сжимать колонки статуса до «…»: статус читается целиком или не показывается.",
      "Прокрутка всей страницы вместо области таблицы, когда строк больше 25: теряется шапка.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=grid, columnheader",
      text: 'Таблица role="grid" (есть интерактивные ячейки), у заголовков scope="col" (columnheader), aria-rowcount; строка — aria-selected у выбранной. [TODO] определить, нужен ли полный grid-паттерн с навигацией стрелками по ячейкам: в макете Tab идёт по строкам и контролам.',
    },
    {
      kind: "aria",
      title: "aria-sort",
      text: "У сортируемых колонок aria-sort=none | ascending | descending на <th>; кнопка внутри называется по заголовку. Цикл asc → desc → сброс; сброс возвращает none.",
    },
    {
      kind: "aria",
      title: "aria-busy и aria-live",
      text: "Таблица в загрузке — aria-busy=true; результат («Найдено 6», «Выбрано: 2») объявляйте в aria-live=polite. [TODO] в макете live-области нет.",
    },
    {
      kind: "key",
      title: "Tab / Shift+Tab",
      text: "Порядок: тулбар, вкладка выбранная, шапка (сортировка), строки: флажок → «копировать» → «⋯» → следующая строка, затем панель выбора и подвал.",
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "На строке — открыть карточку; на флажке Space; на кнопке заголовка — сортировка; на странице — перейти.",
    },
    {
      kind: "key",
      title: "← / →",
      text: "На вкладках статуса переключают вкладку и переносят фокус (предложение).",
    },
    {
      kind: "focus",
      title: "Контур 2px --focus",
      text: "У строки — внутрь (outline-offset −2), чтобы overflow таблицы его не резал. У остальных — вокруг элемента.",
    },
    {
      kind: "contrast",
      title: "Шапка и подписи",
      text: "--text-2 на --surface-muted: светлая 7,1:1, тёмная 9,7:1. Флажок: рамка --text-3 на --surface 4,9:1 (≥ 3:1). Тон err у значка ошибки --err-text — как у бейджа.",
    },
    {
      kind: "contrast",
      title: "Слои hover и selected",
      text: "Текст на --selected (teal 15 %) —  --text, запас большой. Слой 4 % на строке контраст текста почти не меняет. Различие selected и hover только по фону 4 % не спасёт при дальтонизме: у выбранной строки стоит и флажок. [TODO] проверить различимость selected и hover на плохих мониторах.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы слоёв, бегущая линия вкладок, появление панели выбора и градиент скелетона отключаются.",
    },
  ],
  tokens: [
    {
      name: "--surface / --surface-muted",
      value: "#fff / #eceef2 (тёмная #151b23 / #1f2833)",
      usage: "Строка · шапка и чипы фильтров",
      kind: "color",
    },
    {
      name: "--divider / --border",
      value: "#e0e4e9 / #c6cdd6",
      usage: "Линия строк · линия под шапкой и кольцо",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / teal 60 %",
      usage: "Выбранная строка, панель выбора, текущая страница",
      kind: "color",
    },
    { name: "--ink 4 % / 7 %", value: "color-mix", usage: "Hover и active строки", kind: "color" },
    {
      name: "--layer-2 / --layer-3",
      value: "ink 9 % / 12 %",
      usage: "Hover и active сортировки, страниц, вкладок",
      kind: "color",
    },
    { name: "--focus", value: "#00968f (тёмная teal)", usage: "Контур 2px", kind: "color" },
    {
      name: "--teal / --danger / --tone",
      value: "#00d4d0 / #d03538 / ink 7 %",
      usage: "Сегменты документов: готово · проблема · пусто",
      kind: "color",
    },
    {
      name: "row",
      value: "36 / 48 / 56 px",
      usage: "Высота строки: compact · normal · comfort",
      kind: "size",
    },
    {
      name: "head / bar / tab",
      value: "40 / 52 / 44 px",
      usage: "Шапка · тулбар · вкладки",
      kind: "size",
    },
    {
      name: "chk / actions",
      value: "44 / 48 px",
      usage: "Колонка флажков · колонка «⋯»",
      kind: "size",
    },
    { name: "page button", value: "28 × 28 px", usage: "Страница", kind: "size" },
    {
      name: "--r-panel / --r-control",
      value: "14 / 4 px",
      usage: "Контейнер · кнопка сортировки, флажок",
      kind: "radius",
    },
    {
      name: "--fs-body / --fs-control",
      value: "13 / 12 px",
      usage: "Ячейки · шапка и подвал",
      kind: "font",
    },
    {
      name: "--dur-f",
      value: "125 мс",
      usage: "Слои hover/active, opacity кнопок строки",
      kind: "time",
    },
    {
      name: "--dur / --ease",
      value: "200 мс, cubic-bezier(.6,0,.05,.95)",
      usage: "Бегущая линия вкладок и панель выбора",
      kind: "ease",
    },
    {
      name: "sk",
      value: "1,2 с linear, сдвиг 80 мс на строку",
      usage: "Скелетон строк",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "list",
      title: "Список грузов",
      demo: (
        <Wide>
          <DemoDataTable size={4} />
        </Wide>
      ),
      code: `<DataTable<Cargo>
  label="Грузы" columns={columns} rows={rows} getRowId={(r) => r.id}
  tabs={statusTabs} density="normal" lines="h"
  searchable searchText={(r) => r.id} selectable
  onRowOpen={openCard}
  selectionActions={<Button size="sm" variant="outline">Выгрузить</Button>}
/>`,
    },
    {
      id: "embedded",
      title: "Встроенная таблица документов",
      demo: (
        <Wide>
          <DemoDataTable noTabs noToolbar size={3} density="compact" />
        </Wide>
      ),
      code: `<DataTable label="Документы" columns={docColumns} rows={docs} getRowId={(r) => r.id} density="compact" pagination={false} />`,
    },
  ],
});

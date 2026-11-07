/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Icon } from "@/engine/Icon";
import { Playback, type PlaybackStep } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  CLIENTS,
  ClientSelectExample,
  DemoSelect,
  DemoSelectOpen,
  DemoSelectTrigger,
  SelectPop,
  SelectScene,
  SelectTrigger,
  SORTS,
  SortSelectExample,
  STATUSES,
  type SelectState,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const MX = [{ v: "ok", label: "Сверено" }];

const CLOSED: SelectState = { open: false, q: "", act: 0, val: "", kb: false };

function typing(text: string, from: number): PlaybackStep<SelectState>[] {
  return [...text].map((_, i) => ({
    at: from + i * 140,
    set: { q: text.slice(0, i + 1), act: 0, kb: false },
  }));
}

function MouseDemo() {
  return (
    <Playback<SelectState>
      initial={CLOSED}
      script={[
        { at: 400, set: { force: "hover" } },
        { at: 1000, set: { force: undefined, open: true, act: 0 } },
        { at: 1700, set: { act: 2 } },
        { at: 2200, set: { act: 3 } },
        { at: 2800, set: { val: CLIENTS[3].v, open: false, force: "focus" } },
      ]}
      tail={900}
      hint="Список открывается за 125 мс с лёгким подъёмом, закрывается мгновенно; активный пункт идёт за курсором."
      render={(s) => <SelectScene state={s} />}
    />
  );
}

function KeysDemo() {
  return (
    <Playback<SelectState>
      initial={{ ...CLOSED, val: CLIENTS[1].v, force: "focus" }}
      script={[
        { at: 600, set: { open: true, force: undefined, act: 1 } },
        { at: 1400, set: { act: 2, kb: true } },
        { at: 2000, set: { act: 3, kb: true } },
        { at: 2600, set: { act: 2, kb: true } },
        { at: 3300, set: { val: CLIENTS[2].v, open: false, kb: false, force: "focus" } },
      ]}
      tail={900}
      hint="Enter или Space на кнопке открывает список, стрелки двигают активный пункт (кольцо видно после первой стрелки), Enter выбирает, фокус возвращается на кнопку."
      render={(s) => <SelectScene state={s} />}
    />
  );
}

function SearchDemo() {
  return (
    <Playback<SelectState>
      initial={{ ...CLOSED, val: CLIENTS[0].v }}
      script={[
        { at: 500, set: { open: true, act: 0 } },
        ...typing("ооо", 1300),
        { at: 2300, set: { act: 1, kb: true } },
        { at: 2900, set: { act: 2, kb: true } },
        { at: 3500, set: { val: CLIENTS[4].v, open: false, q: "", kb: false, force: "focus" } },
      ]}
      tail={900}
      hint="Список фильтруется с первой буквы, совпадение подсвечено, активным становится первый найденный. Стрелки идут только по найденным."
      render={(s) => <SelectScene state={s} search />}
    />
  );
}

function EmptyDemo() {
  return (
    <Playback<SelectState>
      initial={{ ...CLOSED, val: CLIENTS[0].v }}
      script={[
        { at: 400, set: { open: true } },
        ...typing("ззз", 1000),
        { at: 2000, set: { q: "зз", act: 0 } },
        { at: 2300, set: { q: "", act: 0 } },
      ]}
      tail={900}
      hint="Нет совпадений: вместо списка строка «Ничего не нашлось». Стирание текста возвращает все пункты."
      render={(s) => <SelectScene state={s} search />}
    />
  );
}

function CloseDemo() {
  return (
    <Playback<SelectState>
      initial={{ ...CLOSED, val: CLIENTS[0].v }}
      script={[
        { at: 400, set: { open: true } },
        { at: 1500, set: { open: false, force: "focus" } },
        { at: 2300, set: { open: true, force: undefined } },
        { at: 3200, set: { open: false } },
      ]}
      tail={900}
      hint="Esc закрывает и возвращает фокус на кнопку (кольцо видно). Клик вне списка закрывает без возврата фокуса."
      render={(s) => <SelectScene state={s} />}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Закрыт, значение выбрано",
    note: "Рамка --border, фон --field, значение 13 px слева, стрелка --text-3 справа.",
    demo: <DemoSelectTrigger label="Клиент" value={CLIENTS[0].v} />,
  },
  {
    id: "empty",
    kind: "empty",
    title: "Пусто (placeholder)",
    note: "Значения нет: подсказка «Выберите клиента» цветом --text-ph. Поле остаётся обычным, без ошибки.",
    demo: <DemoSelectTrigger label="Клиент" placeholder="Выберите клиента" />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Рамка темнеет до --text-3.",
    forced: true,
    demo: <DemoSelectTrigger label="Hover" options={MX} value="ok" force="hover" />,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Кольцо outline 2px --focus вплотную, только от клавиатуры (Tab).",
    forced: true,
    demo: <DemoSelectTrigger label="Focus" options={MX} value="ok" force="focus" />,
  },
  {
    id: "open",
    kind: "selected",
    title: "Открыт",
    note: "aria-expanded=true: рамка --focus и ореол 3px --selected, стрелка повёрнута на 180°. Список под кнопкой.",
    forced: true,
    wide: true,
    demo: <DemoSelectOpen />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "У поля отдельного вида нет: клик сразу открывает список. У контрола-кнопки в тулбаре — слой --layer-3.",
    notApplicable: true,
  },
  {
    id: "error",
    kind: "error",
    title: "Ошибка",
    note: "data-invalid: рамка --danger; под полем текст --err-text. В открытом виде ореол красный (danger 22 %).",
    demo: (
      <DemoSelectTrigger
        label="Ошибка"
        placeholder="Выберите клиента"
        invalid
        error="Выберите клиента"
      />
    ),
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Фон прозрачный, рамка --divider, текст --text-ph; не открывается и не получает фокус.",
    demo: <DemoSelectTrigger label="Недоступно" value={CLIENTS[0].v} disabled />,
  },
  {
    id: "no-results",
    kind: "empty",
    title: "Ничего не нашлось",
    note: "В списке с поиском нет совпадений: строка «Ничего не нашлось» вместо пунктов, поиск остаётся.",
    demo: <SelectPop isStatic options={CLIENTS} value="" search q="ззз" />,
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете: список берётся из готового массива. [TODO] для вариантов с сервера: строка Skeleton или Spinner внутри списка и aria-busy на listbox; поле остаётся доступным.",
  ),
];

export default defineDoc({
  id: "select",
  title: "Select",
  group: "fields",
  cssPrefix: "ds-select",
  order: 20,
  keywords: [
    "выпадающий список",
    "селект",
    "список выбора",
    "комбобокс",
    "select",
    "список",
    "combobox",
    "listbox",
    "поиск",
    "dropdown",
    "выбор",
    "autocomplete",
  ],
  summary:
    "Выбор одного значения из списка: кнопка-поле или компактный контрол и всплывающий список, при длинном списке с поиском.",
  purpose:
    "Select показывает текущее значение закрытой кнопкой и по клику раскрывает список под ней: заголовок, необязательный поиск, пункты со значками и пояснениями. Нужен, когда вариантов больше пяти или на экране нет места; для 2-5 вариантов лучше Radio или ToggleGroup, для команд Dropdown (меню).",
  related: ["input", "dropdown", "radio", "toggle-group", "popover"],
  anatomy: {
    demo: (
      <div className="ds-select__anat">
        <Marks
          block
          items={[
            { n: 1, side: "t" },
            { n: 2, anchor: ".ds-select__trigger", side: "l" },
            { n: 3, anchor: ".ds-select__title", side: "l" },
            { n: 4, anchor: ".ds-select__search", side: "l" },
            { n: 5, anchor: ".ds-select__list", side: "r" },
            { n: 6, anchor: ".ds-select__opt[aria-selected='true']", side: "l" },
          ]}
        >
          <div className="ds-select__field">
            <SelectTrigger options={STATUSES} value="ok" open />
            <div className="ds-select__pop ds-select__pop--static">
              <div className="ds-select__title">Статус</div>
              <div className="ds-select__search">
                <Icon name="search" />
                <input type="text" readOnly aria-label="Поиск в списке" placeholder="Поиск" />
              </div>
              <div className="ds-select__list" role="listbox" aria-label="Статус">
                <div className="ds-select__opt" role="option" aria-selected="true">
                  <span className="ds-select__main">
                    <Icon name="check" size="sm" className="ds-select__ico" />
                    <span className="ds-select__tx">
                      Сверено
                      <span className="ds-select__hint">Документы совпадают</span>
                    </span>
                  </span>
                  <Icon name="ok" />
                </div>
                <div className="ds-select__opt" role="option" aria-selected="false" data-active>
                  <span className="ds-select__main">
                    <Icon name="warn" size="sm" className="ds-select__ico" />
                    <span className="ds-select__tx">Расхождение</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Поле со списком",
        description:
          "Кнопка и всплывающий список вместе. Кнопка 32 px (контрол 28), список от её левого края на 4 px ниже; flip вверх, если внизу нет места.",
      },
      {
        name: "Кнопка (trigger)",
        description:
          "Значение или placeholder слева, стрелка 14 px справа; рамка 1px, радиус 8. aria-haspopup=listbox, aria-expanded. При открытии стрелка поворачивается на 180°.",
      },
      {
        name: "Заголовок списка",
        description: "11 px --text-3: имя поля («Клиент», «Статус»). Необязателен.",
        optional: true,
      },
      {
        name: "Поиск",
        description:
          "Строка с лупой над пунктами, нижняя линия --divider. Есть, когда пунктов больше семи-восьми. Подсвечивает совпадение <mark>.",
        optional: true,
      },
      {
        name: "Пункты",
        description:
          "Строки padding 5 8, радиус 8. Значок 14 слева, пояснение 11 px под названием, галочка справа у выбранного. Список прокручивается после 240 px.",
      },
      {
        name: "Состояния пункта",
        description:
          "Выбран: подложка --selected, 600, галочка; активный (курсор или стрелки): слой --layer-1; недоступный: --text-ph. В клавиатурном режиме активный получает кольцо 2px.",
      },
    ],
  },
  variants: [
    {
      id: "field",
      title: "Поле",
      description: "Кнопка на ширину формы со значением и стрелкой. Список без поиска.",
      when: "короткий список до 7 пунктов: сортировка, тип, клиент из шести.",
      demo: (
        <DemoSelect
          flow
          label="Клиент"
          title="Клиент"
          options={[{ v: "", label: "Все клиенты" }, ...CLIENTS]}
          defaultValue=""
        />
      ),
    },
    {
      id: "search",
      title: "С поиском",
      description:
        "Над пунктами строка поиска, фокус сразу в ней. Фильтр по вхождению без учёта регистра, совпадение подсвечено.",
      when: "длинный справочник: клиенты, порты, коды ТН ВЭД.",
      demo: (
        <DemoSelect
          flow
          search
          label="Клиент с поиском"
          title="Клиент"
          options={CLIENTS}
          defaultValue={CLIENTS[0].v}
        />
      ),
    },
    {
      id: "rich",
      title: "Значок и пояснение",
      description:
        "У пункта значок и строка пояснения; недоступный пункт виден, но не выбирается. Выбранное значение в кнопке тоже со значком.",
      when: "статусы, роли, тарифы: где одного названия мало.",
      demo: <DemoSelect flow label="Статус" title="Статус" options={STATUSES} defaultValue="ok" />,
    },
    {
      id: "control",
      title: "Контрол",
      description:
        "Компактная кнопка без рамки, 28 px: «Сортировка: Новые сверху». На hover и открытом слой --layer-2.",
      when: "тулбар, заголовок таблицы, график: когда рамка поля шумела бы.",
      demo: <DemoSelect control controlLabel="Сортировка" options={SORTS} defaultValue="n" flow />,
    },
  ],
  sizes: [
    {
      id: "field",
      title: "Поле",
      value: "32 px",
      note: "min-height, padding 0 8 0 12; список min-width 232",
      demo: <DemoSelectTrigger value={CLIENTS[0].v} />,
    },
    {
      id: "control",
      title: "Контрол",
      value: "28 px",
      note: "padding 0 8, подпись 12 px 600",
      demo: <DemoSelectTrigger control controlLabel="Сортировка" options={SORTS} value="w" />,
    },
  ],
  states,
  extra: [
    {
      id: "option-states",
      title: "Пункты списка",
      content: (
        <div style={{ width: "100%", maxWidth: 320 }}>
          <div className="ds-select__pop ds-select__pop--static">
            <div className="ds-select__list" role="listbox" aria-label="Состояния пунктов">
              <div
                className="ds-select__opt"
                role="option"
                aria-label="Обычный"
                aria-selected="false"
              >
                <span className="ds-select__main">
                  <span className="ds-select__tx">Обычный</span>
                </span>
              </div>
              <div
                className="ds-select__opt"
                role="option"
                aria-label="Активный"
                aria-selected="false"
                data-active
              >
                <span className="ds-select__main">
                  <span className="ds-select__tx">Наведён или выбран стрелками</span>
                </span>
              </div>
              <div
                className="ds-select__opt"
                role="option"
                aria-label="Выбран"
                aria-selected="true"
              >
                <span className="ds-select__main">
                  <span className="ds-select__tx">Выбран</span>
                </span>
              </div>
              <div
                className="ds-select__opt"
                role="option"
                aria-label="Недоступный пункт"
                aria-selected="false"
                aria-disabled="true"
              >
                <span className="ds-select__main">
                  <span className="ds-select__tx">
                    Недоступный пункт
                    <span className="ds-select__hint">Причина — в пояснении</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ],
  stateMatrix: {
    columns: ["Обычный", "Hover", "Focus", "Открыт", "Ошибка", "Disabled"],
    rows: [
      {
        label: "поле",
        cells: [
          <DemoSelectTrigger key="a" options={MX} value="ok" />,
          <DemoSelectTrigger key="b" options={MX} value="ok" force="hover" />,
          <DemoSelectTrigger key="c" options={MX} value="ok" force="focus" />,
          <DemoSelectTrigger key="d" options={MX} value="ok" force="open" open />,
          <DemoSelectTrigger key="e" placeholder="Выберите" invalid />,
          <DemoSelectTrigger key="f" options={MX} value="ok" disabled />,
        ],
      },
      {
        label: "контрол",
        cells: [
          <DemoSelectTrigger key="a" control options={SORTS} value="w" />,
          <DemoSelectTrigger key="b" control options={SORTS} value="w" force="hover" />,
          <DemoSelectTrigger key="c" control options={SORTS} value="w" force="focus" />,
          <DemoSelectTrigger key="d" control options={SORTS} value="w" open />,
          <span key="e" className="dx-sr">
            нет
          </span>,
          <DemoSelectTrigger key="f" control options={SORTS} value="w" disabled />,
        ],
      },
    ],
  },
  choreography: [
    {
      id: "open-pick",
      title: "Открытие, наведение, выбор мышью",
      trigger: "клик по кнопке Select, затем клик по пункту",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover на кнопке: рамка --border → --text-3.",
          prop: "border-color",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "Клик: рамка идёт к --focus, вокруг ореол 3px --selected.",
          prop: "border-color, box-shadow",
          easing: "ease",
        },
        {
          at: 600,
          dur: 200,
          what: "Стрелка поворачивается на 180°.",
          prop: "transform: rotate",
          easing: "var(--ease) = cubic-bezier(.6,0,.05,.95)",
        },
        {
          at: 600,
          dur: 125,
          what: "Список появляется под кнопкой: прозрачность 0 → 1, масштаб 0,96 → 1, сдвиг вверх на 4px → 0. Активный пункт — выбранный (или первый).",
          prop: "opacity, scale, translate",
          easing: "var(--ease)",
        },
        {
          at: 1200,
          dur: 125,
          what: "Наведение на пункт: слой --layer-1 (--layer-1p при нажатии); активный пункт переходит под курсор, кольцо клавиатурного режима гаснет.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 2000,
          dur: 0,
          what: "Клик по пункту: значение в кнопке меняется, список закрывается сразу, без анимации.",
          prop: "—",
        },
        {
          at: 2000,
          dur: 200,
          what: "Стрелка возвращается; рамка и ореол уходят. Фокус на кнопке.",
          prop: "transform, border-color, box-shadow",
          easing: "var(--ease) / ease",
        },
      ],
      focus:
        "При открытии фокус уходит в список: в поле поиска, если оно есть, иначе на сам listbox. При выборе фокус возвращается на кнопку.",
      reducedMotion:
        "Появление списка (масштаб, прозрачность, сдвиг) и поворот стрелки отключены: список возникает сразу.",
      neighbours:
        "Список лежит поверх страницы (position: fixed, z-index 900) и ничего не сдвигает. Если внизу не хватает места, он открывается вверх; кнопка и список ограничены экраном с отступом 8px. Любая прокрутка страницы и изменение размера окна закрывают список.",
      demo: <MouseDemo />,
    },
    {
      id: "keyboard",
      title: "Клавиатура: стрелки, Enter, Esc",
      trigger: "Tab до кнопки, затем Enter или Space",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Фокус на кнопке: кольцо 2px --focus (outline).",
          prop: "outline",
        },
        {
          at: 600,
          dur: 125,
          what: "Enter или Space открывают список; активен выбранный пункт; кольца у пункта пока нет.",
          prop: "opacity, scale, translate",
          easing: "var(--ease)",
        },
        {
          at: 1400,
          dur: 125,
          what: "↓: активный пункт на следующий; появляется кольцо 2px --focus внутри пункта (outline-offset −2px); список прокручивается к нему.",
          prop: "background, outline",
          easing: "ease",
        },
        {
          at: 2000,
          dur: 0,
          what: "↓ на последнем пункте замыкается на первый; ↑ на первом уходит на последний.",
          prop: "—",
        },
        {
          at: 3300,
          dur: 0,
          what: "Enter выбирает активный пункт и закрывает список; Esc закрывает без выбора. Фокус возвращается на кнопку.",
          prop: "focus",
        },
      ],
      focus:
        "В списке без поиска фокус на listbox, активный пункт задаётся aria-activedescendant. Мышь возвращает «мышиный режим»: кольцо у активного пункта исчезает. [TODO] в макете недоступный пункт можно активировать стрелкой (Enter на нём ничего не делает); предложение: пропускать его.",
      reducedMotion: "Список возникает без анимации, прокрутка к активному пункту — мгновенная.",
      neighbours:
        "Стрелки не прокручивают страницу (preventDefault). Tab в макете список не закрывает: [TODO] предложение — Tab закрывает список и уходит к следующему полю; Home и End — первый и последний пункт.",
      demo: <KeysDemo />,
    },
    {
      id: "search",
      title: "Поиск с фильтрацией",
      trigger: "ввод букв в поле поиска над списком",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Открытие: фокус сразу в поле поиска, лупа --text-3 → --link в фокусе.",
          prop: "color",
          easing: "ease",
        },
        {
          at: 800,
          dur: 0,
          what: "Каждая буква: список перерисовывается мгновенно, остаются пункты, где есть вхождение без учёта регистра.",
          prop: "список",
        },
        {
          at: 800,
          dur: 0,
          what: "Совпадение подсвечивается <mark> (--highlight: orange 45 % на --surface, радиус 2).",
          prop: "background",
        },
        {
          at: 800,
          dur: 0,
          what: "Активным становится первый найденный пункт (act = 0); ↑ ↓ идут только по найденным.",
          prop: "—",
        },
        {
          at: 2600,
          dur: 0,
          what: "Enter выбирает активный пункт, список закрывается, поиск очищается при следующем открытии.",
          prop: "—",
        },
      ],
      focus:
        "Фокус остаётся в поле поиска всё время: стрелки двигают aria-activedescendant, а не фокус. Выбранный ранее пункт остаётся помечен галочкой, даже если его скрыл фильтр.",
      reducedMotion: "Анимации у фильтрации нет; список и подсветка обновляются мгновенно.",
      neighbours:
        "Высота списка меняется по числу найденных (до 240 px), кнопка и страница не сдвигаются: список поверх. Если пунктов не осталось, показывается «Ничего не нашлось».",
      demo: <SearchDemo />,
    },
    {
      id: "empty",
      title: "Пустой результат",
      trigger: "в поиск введено то, чего нет в списке",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Пункты исчезают, на их месте строка «Ничего не нашлось» (12 px --text-3, padding 10 8). Поиск остаётся над ней.",
          prop: "список",
        },
        {
          at: 1300,
          dur: 0,
          what: "Стёрли часть текста: совпадения вернулись, пункты снова в списке.",
          prop: "список",
        },
      ],
      focus: "В поле поиска; Enter при пустом результате ничего не делает.",
      reducedMotion: "Без анимации.",
      neighbours:
        "Список сжимается до заголовка, поиска и одной строки; под ним ничего не двигается. [TODO] «Ничего не нашлось» стоит объявлять через role=status (сделано в демо).",
      demo: <EmptyDemo />,
    },
    {
      id: "close",
      title: "Закрытие без выбора: Esc и клик вне списка",
      trigger: "Esc или клик мимо списка",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Список снимается сразу, без анимации: обратного хода у появления нет.",
          prop: "—",
        },
        {
          at: 0,
          dur: 200,
          what: "Стрелка возвращается на 0°, рамка и ореол уходят.",
          prop: "transform, border-color, box-shadow",
          easing: "var(--ease) / ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Esc возвращает фокус на кнопку; клик мимо — нет (фокус там, куда кликнули).",
          prop: "focus",
        },
      ],
      focus:
        "Esc: фокус на кнопку (кольцо видно). Клик вне: фокус у того элемента, по которому кликнули; повторный клик по кнопке открытого Select закрывает его (а не переоткрывает).",
      reducedMotion: "Поворот стрелки отключён, остальное и так мгновенно.",
      neighbours:
        "Значение не меняется. Другой открытый Select или меню закрывается при открытии этого: одновременно открыт один список.",
      demo: <CloseDemo />,
    },
  ],
  rules: {
    use: [
      "Список от шести пунктов; от восьми добавляйте поиск.",
      "Заголовок списка повторяет подпись поля: «Клиент», «Статус».",
      "Пояснение под названием — когда пункты похожи («Сверено»: документы совпадают).",
      "Недоступный пункт оставляйте в списке с причиной, а не прячьте.",
      "Placeholder называет действие: «Выберите клиента».",
      "Контрол — в тулбарах и заголовках, поле — в формах.",
    ],
    avoid: [
      "Select для двух-пяти вариантов: Radio или ToggleGroup быстрее.",
      "Select для команд («Копировать», «Удалить»): это Dropdown (меню).",
      "Поиск в списке из трёх пунктов.",
      "Длинные названия без пояснения: кнопка обрежет текст многоточием.",
      "Несколько открытых списков сразу: открытие второго закрывает первый.",
      "Мультивыбор в одном Select: нужны Checkbox или меню с флажками.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Кнопка",
      text: 'aria-haspopup="listbox", aria-expanded, aria-controls на список; имя из видимой подписи (aria-labelledby). Значение — часть имени кнопки.',
    },
    {
      kind: "aria",
      title: "Список и пункты",
      text: 'role="listbox" и role="option" с aria-selected; недоступные — aria-disabled="true". Активный пункт задаётся aria-activedescendant на элементе в фокусе (поиск или listbox).',
    },
    {
      kind: "aria",
      title: "Поиск",
      text: 'Поле поиска — role="combobox" с aria-controls, aria-activedescendant и aria-autocomplete="list". Пустой результат объявляется role="status".',
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "На кнопке открывают список. В списке Enter выбирает активный пункт.",
    },
    {
      kind: "key",
      title: "↑ ↓",
      text: "Двигают активный пункт по кругу; после первой стрелки включается кольцо. В поиске двигают только по найденным.",
    },
    {
      kind: "key",
      title: "Esc",
      text: "Закрывает список и возвращает фокус на кнопку.",
    },
    {
      kind: "key",
      title: "Tab / Home / End",
      text: "[TODO] предложение: Tab закрывает список и идёт дальше; Home и End — первый и последний пункт. В макете не реализовано.",
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Кнопка: outline 2px --focus (3,65:1 на белом, 9,3:1 в тёмной). Открытая: рамка --focus и ореол. Активный пункт в клавиатурном режиме — кольцо 2px внутри пункта.",
    },
    {
      kind: "contrast",
      title: "Рамка и текст",
      text: "Рамка --border на белом 1,6:1: ниже 3:1 для границ компонентов; hover --text-3 4,9:1. Пункт --text-2 на белом 8,2:1, выбранный --text на --selected 14,8:1, пояснение --text-3 4,9:1. Placeholder --text-ph 3,2:1 в светлой. [TODO] усилить рамку и placeholder.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Отключаются появление списка (масштаб, прозрачность, сдвиг), поворот стрелки и переходы цвета.",
    },
  ],
  tokens: [
    {
      name: "--field / --border / --text-3",
      value: "#fff / #c6cdd6 / #66727f",
      usage: "Кнопка: фон, рамка, рамка на hover",
      kind: "color",
    },
    {
      name: "--focus / --selected",
      value: "#00968f / teal 15 %",
      usage: "Рамка и ореол 3px открытой кнопки; подложка выбранного пункта",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a",
      usage: "Ошибка: рамка, текст",
      kind: "color",
    },
    {
      name: "--surface / --border / --shadow-pop",
      value: "#fff / #c6cdd6 / 0 6px 20px",
      usage: "Список: фон, кольцо 1px, тень",
      kind: "color",
    },
    {
      name: "--r-popover / --r-item",
      value: "12 / 8 px",
      usage: "Радиус списка / пункта и кнопки",
      kind: "radius",
    },
    { name: "--h-md / --h-sm", value: "32 / 28 px", usage: "Высота поля / контрола", kind: "size" },
    {
      name: "список",
      value: "min-width 232, max 360, max-height 240",
      usage: "Размеры списка; padding 6, пункт 5 8",
      kind: "size",
    },
    {
      name: "--layer-1 / --layer-1p",
      value: "ink 4 % / 7 %",
      usage: "Активный пункт / нажатый",
      kind: "color",
    },
    {
      name: "--highlight",
      value: "orange 45 % на --surface",
      usage: "Подсветка совпадения <mark>",
      kind: "color",
    },
    {
      name: "--text-2 / --text / --text-ph",
      value: "#44505d / #15202b / #8792a0",
      usage: "Пункт / выбранный / недоступный и placeholder",
      kind: "color",
    },
    {
      name: "--dur-f",
      value: "125 мс",
      usage: "Появление списка (opacity, scale, translate), рамка, слои",
      kind: "time",
    },
    {
      name: "--dur / --ease",
      value: "200 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Поворот стрелки; кривая списка и стрелки",
      kind: "ease",
    },
  ],
  examples: [
    {
      id: "client",
      title: "Клиент с поиском",
      demo: <ClientSelectExample />,
      code: `const clients = [
  { value: "ООО «Дальснаб»", label: "ООО «Дальснаб»" },
  { value: "ИП Кравец", label: "ИП Кравец" },
  { value: "ООО «Порт-Трейд»", label: "ООО «Порт-Трейд»" },
];

<Select
  label="Клиент"
  title="Клиент"
  searchable
  value={client}
  onValueChange={setClient}
  options={clients}
  placeholder="Выберите клиента"
/>`,
    },
    {
      id: "sort",
      title: "Сортировка в заголовке таблицы",
      demo: <SortSelectExample />,
      code: `const sorts = [
  { value: "n", label: "Новые сверху" },
  { value: "o", label: "Старые сверху" },
  { value: "w", label: "По весу" },
];

<Select
  variant="control"
  controlLabel="Сортировка"
  value={sort}
  onValueChange={setSort}
  options={sorts}
/>`,
    },
  ],
});

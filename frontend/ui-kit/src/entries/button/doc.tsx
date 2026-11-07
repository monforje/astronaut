/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoButton, DemoButtonGroup, DemoLink, type ButtonVariant, type Force } from "./demo";

const VARIANTS: {
  id: ButtonVariant;
  label: string;
  title: string;
  description: string;
  when: string;
}[] = [
  {
    id: "primary",
    label: "Сохранить",
    title: "Primary",
    description: "Teal-заливка, текст navy. Главное действие экрана или окна.",
    when: "одна на экран: «Сохранить», «Принять», «Отправить».",
  },
  {
    id: "accent",
    label: "Подключить",
    title: "Accent",
    description: "Orange-заливка, текст navy. Сигнальное действие, которое нужно заметить.",
    when: "редко: подключение сервиса, предложение агента. Не рядом с primary.",
  },
  {
    id: "inverse",
    label: "Экспорт",
    title: "Inverse",
    description: "Цвет поверхности, тень и кольцо 1px. Выделяется на цветном или тёмном фоне.",
    when: "действие поверх картинки, баннера или цветной плашки.",
  },
  {
    id: "destructive",
    label: "Удалить",
    title: "Destructive",
    description: "Красная заливка. Необратимое действие.",
    when: "удаление, отзыв доступа; всегда после подтверждения в окне.",
  },
  {
    id: "secondary",
    label: "Применить",
    title: "Secondary",
    description:
      "Мятная подложка (selected) и кольцо. Второе по важности действие рядом с primary.",
    when: "парное действие в панели: «Применить» рядом с «Сбросить».",
  },
  {
    id: "outline",
    label: "Отмена",
    title: "Outline",
    description: "Без заливки, кольцо 1px. Нейтральное действие.",
    when: "«Отмена», «Назад», второстепенные действия в карточке.",
  },
  {
    id: "ghost",
    label: "Сбросить",
    title: "Ghost",
    description: "Без заливки и кольца, слой при наведении. Для тулбаров и плотных строк.",
    when: "иконки в шапке, действия в строке таблицы, «Ещё».",
  },
];

const COLUMNS = ["Обычная", "Hover", "Active", "Focus", "Disabled", "Loading"];

function row(v: ButtonVariant, label: string) {
  const forces: (Force | undefined)[] = [undefined, "hover", "active", "focus"];
  return [
    ...forces.map((f) => (
      <DemoButton key={f ?? "idle"} variant={v} size="sm" force={f}>
        {label}
      </DemoButton>
    )),
    <DemoButton key="dis" variant={v} size="sm" disabled>
      {label}
    </DemoButton>,
    <DemoButton key="load" variant={v} size="sm" loading>
      {label}
    </DemoButton>,
  ];
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Обычная",
    note: "Заливка или контур по виду, подпись 600. Курсор pointer.",
    demo: <DemoButton>Сохранить</DemoButton>,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover",
    note: "Слой поверх вида: заливка темнеет на 8 % (destructive — на 12 %), ghost и outline получают слой 9 %.",
    forced: true,
    demo: <DemoButton force="hover">Сохранить</DemoButton>,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Нажата: заливка темнее на 15 % (destructive — 20 %), ghost и outline — слой 12 %.",
    forced: true,
    demo: <DemoButton force="active">Сохранить</DemoButton>,
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Контур 2px цветом --focus, без отступа. Только с клавиатуры (:focus-visible).",
    forced: true,
    demo: <DemoButton force="focus">Сохранить</DemoButton>,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Свои цвета, не прозрачность: фон — слой 8,8 % на поверхности, текст --text-ph. Фокус не берёт.",
    demo: <DemoButton disabled>Сохранить</DemoButton>,
  },
  {
    id: "loading",
    kind: "loading",
    title: "Loading",
    note: "Цвета вида сохраняются, перед подписью спиннер. aria-busy, не disabled; курсор progress, hover и active не работают.",
    demo: <DemoButton loading>Сохранить</DemoButton>,
  },
  {
    id: "selected",
    kind: "selected",
    title: "Включена (aria-pressed)",
    note: "Кнопка-переключатель в тулбаре: подложка selected, текст --link-strong. Отдельный Toggle описан в своей странице.",
    demo: (
      <DemoButton variant="ghost" pressed>
        Включён
      </DemoButton>
    ),
  },
  {
    id: "error",
    kind: "error",
    title: "Error",
    note: "У кнопки нет собственного состояния ошибки. Ошибка действия показывается Toast или Alert, кнопка возвращается в обычную.",
    notApplicable: true,
  },
  {
    id: "empty",
    kind: "empty",
    title: "Empty",
    note: "Пустого состояния нет. Кнопка без подписи — только квадратная и обязательно с aria-label.",
    notApplicable: true,
  },
];

function HoverPressDemo() {
  return (
    <Playback<{ f?: Force }>
      initial={{}}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1200, set: { f: "active" } },
        { at: 1500, set: { f: "hover" } },
        { at: 2300, set: { f: undefined } },
      ]}
      tail={600}
      hint="Курсор входит, человек нажимает и отпускает, курсор уходит. Паузы в примере искусственные."
      render={(s) => (
        <>
          <DemoButton force={s.f}>Сохранить</DemoButton>
          <DemoButton variant="outline" force={s.f}>
            Отмена
          </DemoButton>
          <DemoButton variant="ghost" force={s.f}>
            Сбросить
          </DemoButton>
        </>
      )}
    />
  );
}

function FocusDemo() {
  return (
    <Playback<{ f?: Force }>
      initial={{}}
      script={[
        { at: 400, set: { f: "focus" } },
        { at: 1300, set: { f: "active" } },
        { at: 1550, set: { f: "focus" } },
        { at: 2400, set: { f: undefined } },
      ]}
      tail={500}
      hint="Tab ставит кольцо мгновенно, Enter нажимает кнопку. Попробуйте сами: Tab по любой кнопке на странице."
      render={(s) => (
        <>
          <DemoButton variant="outline" force={s.f}>
            Назад
          </DemoButton>
          <DemoButton force={s.f === "active" ? "active" : undefined}>Дальше</DemoButton>
        </>
      )}
    />
  );
}

function EndIconDemo() {
  return (
    <Playback<{ f?: Force }>
      initial={{}}
      script={[
        { at: 300, set: { f: "hover" } },
        { at: 1500, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <>
          <DemoButton variant="outline" iconEnd="chevr" force={s.f}>
            Дальше
          </DemoButton>
          <DemoButton variant="primary" iconEnd="arrowr" force={s.f}>
            Открыть груз
          </DemoButton>
        </>
      )}
    />
  );
}

function LoadingDemo() {
  return (
    <Playback<{ loading: boolean }>
      initial={{ loading: false }}
      script={[
        { at: 400, set: { loading: true } },
        { at: 2400, set: { loading: false } },
      ]}
      tail={800}
      hint="Клик запускает действие: потребитель включает aria-busy; ответ пришёл — выключает. Повторные клики между этими моментами игнорируются."
      render={(s) => (
        <>
          <DemoButton loading={s.loading}>Сохранить</DemoButton>
          <DemoButton variant="outline" loading={s.loading}>
            Отправить
          </DemoButton>
        </>
      )}
    />
  );
}

function DisclosureDemo() {
  return (
    <Playback<{ open: boolean }>
      initial={{ open: false }}
      script={[
        { at: 400, set: { open: true } },
        { at: 1800, set: { open: false } },
      ]}
      tail={600}
      render={(s) => (
        <DemoButton
          variant="ghost"
          square
          label="Раскрыть"
          icon="chevr"
          expanded={s.open}
          className="ds-btn--disc"
        />
      )}
    />
  );
}

function LinkDemo() {
  return (
    <Playback<{ f?: Force }>
      initial={{}}
      script={[
        { at: 300, set: { f: "hover" } },
        { at: 1600, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <>
          <DemoLink kind="next" size="sm" force={s.f}>
            Все цены
          </DemoLink>
          <DemoLink kind="ext" size="sm" force={s.f}>
            Открыть в 1С
          </DemoLink>
          <DemoLink kind="dashed" force={s.f}>
            dashed
          </DemoLink>
        </>
      )}
    />
  );
}

export default defineDoc({
  id: "button",
  title: "Button",
  group: "actions",
  cssPrefix: "ds-btn",
  order: 10,
  keywords: [
    "кнопка",
    "button",
    "action",
    "действие",
    "link",
    "ссылка",
    "primary",
    "главная кнопка",
    "cta",
    "outline",
    "ghost",
    "destructive",
    "опасное действие",
    "loading",
    "спиннер",
    "иконка-кнопка",
    "icon button",
    "группа кнопок",
    "button group",
    "submit",
  ],
  summary:
    "Действие на странице: сохранить, принять, удалить. Восемь видов (семь кнопок и link-текст), четыре размера, значки, группа.",
  purpose:
    "Кнопка запускает действие, а не ведёт на другую страницу: для перехода берут link. На экране одна главная кнопка (teal). Текст на teal и orange всегда navy — это правило бренда, а не вкус. Две кнопки в карточке или панели делят ширину 50/50 (главная слева), в окне стоят справа по ширине текста.",
  related: ["toggle", "toggle-group", "dropdown"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-btn", side: "l" },
          { n: 2, anchor: ".ds-btn .ds-icon", side: "t" },
          { n: 3, anchor: ".ds-btn__label", side: "b" },
          { n: 4, anchor: ".ds-btn__end", side: "t" },
          { n: 5, anchor: ".ds-btn__spin", side: "b" },
        ]}
      >
        <span style={{ display: "inline-flex", gap: 24, alignItems: "center" }}>
          <DemoButton variant="primary" icon="plus" iconEnd="chevr">
            Новый груз
          </DemoButton>
          <DemoButton variant="outline" loading>
            Загрузка
          </DemoButton>
        </span>
      </Marks>
    ),
    parts: [
      {
        name: "Контейнер",
        description:
          "Высота 24 / 28 / 32 / 36, радиус 8 (в группе 0 на стыках), заливка или кольцо 1px по виду.",
      },
      {
        name: "Значок слева",
        description:
          "16 px (14 в xs и sm), наследует цвет текста. При loading заменяется спиннером.",
        optional: true,
      },
      {
        name: "Подпись",
        description:
          "Onest 600, 13 px (12 у sm, 11 у xs). Не переносится, не обрезается: слишком длинную подпись сокращают словами.",
      },
      {
        name: "Значок справа",
        description: "Стрелка или шеврон; на hover сдвигается на 2 px вправо.",
        optional: true,
      },
      {
        name: "Индикатор загрузки",
        description: "Спиннер 14 px перед подписью, только пока aria-busy.",
        optional: true,
      },
    ],
  },
  variants: [
    ...VARIANTS.map((v) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      when: v.when,
      demo: <DemoButton variant={v.id}>{v.label}</DemoButton>,
    })),
    {
      id: "link",
      title: "Link",
      description:
        "Кликабельный текст в строке: подчёркнутый пунктиром, без высоты и рамки. Шесть видов: dashed, dotted, plain, next, ext, back.",
      when: "действие внутри текста или переход «дальше / наружу / назад». Для самостоятельного действия берите кнопку.",
      demo: <DemoLink>Сбросить фильтры</DemoLink>,
    },
  ],
  sizes: [
    {
      id: "sizes",
      title: "Высота",
      value: "24 · 28 · 32 · 36",
      note: "xs · sm · md (по умолчанию) · lg",
      demo: (
        <>
          <DemoButton size="xs">xs</DemoButton>
          <DemoButton size="sm">sm</DemoButton>
          <DemoButton>md</DemoButton>
          <DemoButton size="lg">lg</DemoButton>
        </>
      ),
    },
    {
      id: "icons",
      title: "Значки",
      value: "16 / 14 px",
      note: "слева, справа, только значок",
      demo: (
        <>
          <DemoButton icon="plus">Новый груз</DemoButton>
          <DemoButton variant="outline" iconEnd="chevr">
            Дальше
          </DemoButton>
          <DemoButton variant="outline" square label="Скачать" icon="dl" />
          <DemoButton variant="ghost" size="md" square label="Ещё" icon="more" />
          <DemoButton variant="ghost" size="xs" square label="Закрыть" icon="x" />
        </>
      ),
    },
    {
      id: "group",
      title: "ButtonGroup",
      value: "стык −1px",
      note: "рамки сливаются; у залитых — тонкая линия",
      demo: (
        <>
          <DemoButtonGroup>
            <DemoButton variant="outline">День</DemoButton>
            <DemoButton variant="outline">Неделя</DemoButton>
            <DemoButton variant="outline">Месяц</DemoButton>
          </DemoButtonGroup>
          <DemoButtonGroup>
            <DemoButton>Сохранить</DemoButton>
            <DemoButton square label="Ещё варианты" icon="chev" />
          </DemoButtonGroup>
        </>
      ),
    },
    {
      id: "block",
      title: "Кнопка-строка",
      value: "100 % ширины",
      note: "block + start: значок и подпись слева",
      demo: (
        <DemoButton variant="ghost" icon="plus" className="ds-btn--block ds-btn--start">
          Добавить документ
        </DemoButton>
      ),
    },
    {
      id: "links",
      title: "Link",
      value: "11 · 12 · 13 px",
      note: "xs 400 · sm 700 · md 400",
      demo: (
        <>
          <DemoLink size="xs">xs 11</DemoLink>
          <DemoLink size="sm">sm 12/700</DemoLink>
          <DemoLink>md 13</DemoLink>
        </>
      ),
    },
  ],
  extra: [
    {
      id: "links",
      title: "Link-варианты",
      content: (
        <div className="dx-grid dx-grid--variants">
          {(
            [
              [
                "dashed",
                "Действие в тексте",
                "Пунктирное подчёркивание. Обычное «сделать что-то здесь».",
                "Сбросить фильтры",
              ],
              ["dotted", "Сброс, очистка", "Точечное подчёркивание, тише dashed.", "Очистить"],
              [
                "plain",
                "Без подчёркивания",
                "Для случаев, когда ссылку видно по месту (список, меню).",
                "Подробнее",
              ],
              [
                "next",
                "Переход на другую панель",
                "Teal-текст, стрелка › сдвигается вправо на hover.",
                "Все цены",
              ],
              [
                "ext",
                "Внешняя ссылка",
                "Серый текст, стрелка ↗ появляется на hover.",
                "Открыть в 1С",
              ],
              ["back", "Возврат", "Нейтральный текст со стрелкой ←.", "Назад к списку"],
            ] as const
          ).map(([k, title, text, label]) => (
            <article className="dx-card" key={k}>
              <div className="dx-canvas">
                <DemoLink kind={k} size="sm">
                  {label}
                </DemoLink>
              </div>
              <div className="dx-card__body">
                <h3>
                  {title} <code className="dx-id">{k}</code>
                </h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      ),
    },
  ],
  states,
  stateMatrix: {
    columns: COLUMNS,
    rows: [
      ...VARIANTS.map((v) => ({ label: v.id, cells: row(v.id, v.label) })),
      {
        label: "link",
        cells: [
          <DemoLink key="a">Открыть</DemoLink>,
          <DemoLink key="b" force="hover">
            Открыть
          </DemoLink>,
          <DemoLink key="c" force="active">
            Открыть
          </DemoLink>,
          <DemoLink key="d" force="focus">
            Открыть
          </DemoLink>,
          <DemoLink key="e" disabled>
            Открыть
          </DemoLink>,
          <DemoLink key="f" loading>
            Открыть
          </DemoLink>,
        ],
      },
      {
        label: "ghost + aria-pressed",
        cells: [
          <DemoButton key="a" variant="ghost" pressed>
            Включён
          </DemoButton>,
          <DemoButton key="b" variant="ghost" pressed force="hover">
            Hover
          </DemoButton>,
          "",
          "",
          "",
          "",
        ],
      },
    ],
  },
  choreography: [
    {
      id: "hover-press",
      title: "Наведение, нажатие, уход",
      trigger: "указатель входит в кнопку, pointerdown, pointerup, указатель уходит",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Курсор входит: фон идёт к слою hover (заливка темнеет на 8 %).",
          prop: "background",
          easing: "ease (по умолчанию)",
        },
        {
          at: 800,
          dur: 125,
          what: "Нажатие: фон идёт к слою active (темнее на 15 %), размер и положение не меняются.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1000,
          dur: 0,
          what: "Отпускание над кнопкой: срабатывает click, фон возвращается к hover (125 мс).",
        },
        {
          at: 1900,
          dur: 125,
          what: "Курсор уходит: фон возвращается к исходному.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus:
        "Мышь не ставит видимое кольцо (:focus-visible), кнопка получает фокус молча; кольца в этом сценарии нет.",
      reducedMotion: "transition отключается: слои меняются мгновенно.",
      neighbours:
        "Не реагируют: кнопка не меняет размер и не сдвигает строку. Исключение — ButtonGroup: наведённая кнопка поднимается над соседней (z-index), чтобы её рамка была видна целиком.",
      demo: <HoverPressDemo />,
    },
    {
      id: "keyboard-focus",
      title: "Фокус с клавиатуры и нажатие Enter",
      trigger: "Tab (или Shift+Tab) попадает на кнопку, затем Enter или Space",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Tab: контур 2px --focus появляется мгновенно, без перехода.",
          prop: "outline",
        },
        {
          at: 900,
          dur: 125,
          what: "Enter / Space: фон active, как при нажатии мышью; click на keydown у Enter и на keyup у Space.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1150,
          dur: 125,
          what: "Клавиша отпущена: возврат к виду «в фокусе»; кольцо остаётся.",
          prop: "background",
          easing: "ease",
        },
        { at: 2000, dur: 0, what: "Tab дальше: кольцо исчезает мгновенно." },
      ],
      focus:
        "Это и есть сценарий фокуса: кольцо снаружи не сдвигает вёрстку (outline-offset 0, outline не занимает места).",
      reducedMotion: "Без изменений: кольцо и так не анимировано.",
      neighbours:
        "Не реагируют. Порядок Tab — порядок в DOM; в группе кнопок соседи остаются отдельными остановками.",
      demo: <FocusDemo />,
    },
    {
      id: "end-icon",
      title: "Сдвиг значка справа",
      trigger: "наведение на кнопку со значком справа (стрелка, шеврон)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Значок уезжает на 2 px вправо, подсказывая «дальше».",
          prop: "translate",
          easing: "--ease cubic-bezier(.6,0,.05,.95)",
        },
        {
          at: 1200,
          dur: 200,
          what: "Курсор ушёл: значок возвращается.",
          prop: "translate",
          easing: "--ease",
        },
      ],
      focus: "Фокус клавиатурой сдвиг не вызывает: движение только от hover.",
      reducedMotion:
        "Сдвиг на 2 px остаётся (translate без transition-fallback) — [TODO] решить, убирать ли его целиком при reduce.",
      neighbours: "Не реагируют: сдвиг идёт через translate и не влияет на раскладку.",
      demo: <EndIconDemo />,
    },
    {
      id: "loading",
      title: "Загрузка после клика",
      trigger: "клик по кнопке, которая запускает асинхронное действие",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Клик: потребитель включает aria-busy. Появляется спиннер 14 px перед подписью, hover и active отключаются, курсор progress.",
        },
        {
          at: 0,
          dur: 800,
          what: "Спиннер вращается без остановки, один оборот за 0,8 с.",
          prop: "transform: rotate",
          easing: "linear, бесконечно",
        },
        {
          at: 2000,
          dur: 0,
          what: "Ответ получен: aria-busy снят, спиннер исчезает мгновенно, кнопка возвращается к виду по умолчанию.",
        },
      ],
      focus:
        "Остаётся на кнопке: поэтому loading — это aria-busy, а не disabled (disabled-кнопка теряет фокус).",
      reducedMotion:
        "Спиннер не убирается, а замедляется до одного оборота за 3 с; переходы цвета отключаются.",
      neighbours:
        "Подпись остаётся на месте, кнопка становится шире на спиннер (14 px + gap 6). [TODO] решить, держать ли ширину неизменной: макет этого не делает.",
      demo: <LoadingDemo />,
    },
    {
      id: "disclosure",
      title: "Стрелка раскрытия",
      trigger: "переключение aria-expanded на кнопке-раскрывашке (ghost, квадратная)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 200,
          what: "Шеврон поворачивается на 90°: › превращается в ⌄.",
          prop: "rotate",
          easing: "--ease",
        },
        {
          at: 1400,
          dur: 200,
          what: "Закрытие: поворот обратно.",
          prop: "rotate",
          easing: "--ease",
        },
      ],
      focus: "Фокус остаётся на кнопке; раскрытое содержимое не забирает его без причины.",
      reducedMotion: "Поворот выполняется мгновенно.",
      neighbours:
        "Раскрытое содержимое появляется своим сценарием (см. Accordion): кнопка соседей не двигает.",
      demo: <DisclosureDemo />,
    },
    {
      id: "link-arrows",
      title: "Стрелки link-вариантов",
      trigger: "наведение на link next или ext",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 180,
          what: "next: стрелка › сдвигается на 3 px вправо, текст получает пунктирное подчёркивание, цвет темнеет до --link-strong.",
          prop: "transform",
          easing: "ease-out",
        },
        {
          at: 0,
          dur: 200,
          what: "ext: стрелка ↗ проявляется (150 мс) и встаёт на место из-под текста.",
          prop: "opacity, translate",
          easing: "--ease",
        },
      ],
      focus:
        "Hover-эффекты стрелок с клавиатуры не включаются: подсказка «куда ведёт» должна быть и в тексте.",
      reducedMotion:
        "Макет этот случай не описывает: сейчас стрелки анимируются и при reduce. [TODO] отключить сдвиг и оставить только появление.",
      neighbours: "Не реагируют: стрелка в строке занимает место заранее.",
      demo: <LinkDemo />,
    },
  ],
  rules: {
    use: [
      "Действие нужно выполнить сейчас: сохранить, принять, отправить, удалить.",
      "Главное действие экрана одно и закрашено teal (primary); остальные — outline или ghost.",
      "Две кнопки в карточке или панели: 50/50 по ширине, главная слева. В окне — справа по ширине текста.",
      "Только значок — квадратная кнопка с aria-label и подсказкой (Tooltip).",
      "Опасное действие — destructive, и только после подтверждения.",
      "Действие внутри предложения или переход «дальше / наружу» — link.",
    ],
    avoid: [
      "Несколько primary на одном экране: теряется, что главное.",
      "Переход на другой адрес: берите настоящую ссылку (<a>), а не кнопку.",
      "Приглушать неактивную прозрачностью: у disabled свои цвета.",
      "Писать подпись «Да» / «OK»: подпись называет действие («Принять», «Удалить»).",
      "Ставить accent рядом с primary: оба закрашены и спорят за внимание.",
      "Вставлять в кнопку другие интерактивные элементы.",
    ],
  },
  a11y: [
    {
      kind: "key",
      title: "Tab / Shift+Tab",
      text: "Переводит фокус на кнопку и дальше. Disabled-кнопка в порядок обхода не входит.",
    },
    { kind: "key", title: "Enter", text: "Нажимает кнопку (срабатывает на keydown)." },
    {
      kind: "key",
      title: "Space",
      text: "Нажимает кнопку (срабатывает на keyup, как у нативной <button>).",
    },
    {
      kind: "aria",
      title: "aria-label",
      text: "Обязателен у квадратной кнопки без подписи: «Скачать», «Закрыть», «Ещё».",
    },
    {
      kind: "aria",
      title: 'aria-busy="true"',
      text: "Состояние loading. Кнопка остаётся в порядке Tab и не теряет фокус; повторный click ловит потребитель и игнорирует.",
    },
    {
      kind: "aria",
      title: "aria-expanded",
      text: "У кнопки, раскрывающей область или меню; стрелка поворачивается по этому атрибуту.",
    },
    {
      kind: "aria",
      title: "aria-pressed",
      text: "У кнопки-переключателя в тулбаре; визуально — подложка selected.",
    },
    {
      kind: "focus",
      title: ":focus-visible",
      text: "Контур 2px --focus, offset 0. Мышь кольцо не показывает, клавиатура показывает всегда.",
    },
    {
      kind: "contrast",
      title: "Текст на заливке",
      text: "Navy на teal 7,4:1 и на orange 6,2:1. У destructive фон — --danger как есть: белый на #d03538 даёт 4,9:1, hover (--ink 9 %) 5,6:1, active (18 %) 6,5:1; в тёмной теме --on-danger на #ff6b6b 6,6:1, hover 7,1:1, active 7,8:1. У accent hover и active затемняют orange на 5 и 9 %: navy остаётся не ниже 4,5:1 (при 8 и 15 % было 4,1:1).",
    },
    {
      kind: "contrast",
      title: "Кольцо фокуса",
      text: "--focus на белом 3,7:1 и на --page 3,3:1; в тёмной теме teal на графите 9,3:1. Выше порога 3:1 для не-текстовых элементов.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Переходы цвета отключаются, спиннер замедляется до 3 с на оборот, не исчезая.",
    },
  ],
  tokens: [
    {
      name: "--primary",
      value: "teal #00d4d0",
      usage: "Заливка primary; hover — mix с чёрным 8 %, active — 15 %",
      kind: "color",
    },
    {
      name: "--on-primary",
      value: "navy #082f53",
      usage: "Текст на primary и accent",
      kind: "color",
    },
    { name: "--spark", value: "orange #ff9455", usage: "Заливка accent", kind: "color" },
    {
      name: "--danger",
      value: "#d03538 / #ff6b6b (тёмная)",
      usage: "Заливка destructive; hover затемняет --ink на 9 %, active на 18 %",
      kind: "color",
    },
    {
      name: "--on-danger",
      value: "#fff / #2a0b08 (тёмная)",
      usage: "Текст на destructive",
      kind: "color",
    },
    {
      name: "--selected",
      value: "teal 15 % на поверхности",
      usage: "Подложка secondary и включённой кнопки",
      kind: "color",
    },
    {
      name: "--border-selected",
      value: "teal 60 % на поверхности",
      usage: "Кольцо secondary",
      kind: "color",
    },
    {
      name: "--border",
      value: "#c6cdd6 / #4d5b6b",
      usage: "Кольцо outline и inverse",
      kind: "color",
    },
    {
      name: "--divider",
      value: "#e0e4e9 / #323e4b",
      usage: "Кольцо disabled у outline и secondary",
      kind: "color",
    },
    {
      name: "--layer-2 / --layer-3",
      value: "ink 9 % / 12 %",
      usage: "Hover и active у outline и ghost",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0 / #7f8c9b", usage: "Текст disabled", kind: "color" },
    {
      name: "--focus",
      value: "#00968f / teal (тёмная)",
      usage: "Контур фокуса 2px",
      kind: "color",
    },
    {
      name: "--h-xs … --h-lg",
      value: "24 · 28 · 32 · 36 px",
      usage: "Высота кнопки",
      kind: "size",
    },
    {
      name: "--r-item",
      value: "8 px",
      usage: "Радиус кнопки; --r-control 4 px у link и квадратной ghost",
      kind: "radius",
    },
    {
      name: "--fs-body / --fs-control / --fs-info",
      value: "13 · 12 · 11 px",
      usage: "Размер подписи md/lg · sm · xs; вес 600",
      kind: "font",
    },
    { name: "--dur-f", value: "125 мс", usage: "Переход фона, цвета и кольца", kind: "time" },
    {
      name: "--dur",
      value: "200 мс",
      usage: "Сдвиг значка справа и поворот стрелки раскрытия",
      kind: "time",
    },
    {
      name: "--ease",
      value: "cubic-bezier(.6, 0, .05, .95)",
      usage: "Движение значков",
      kind: "ease",
    },
    { name: "--shadow-panel", value: "0 1px 3px, ink 18 %", usage: "Тень inverse", kind: "shadow" },
  ],
  examples: [
    {
      id: "form",
      title: "Пара действий в окне",
      description: "Главное справа, по ширине текста; «Отмена» — outline.",
      demo: (
        <>
          <DemoButton variant="outline">Отмена</DemoButton>
          <DemoButton>Сохранить</DemoButton>
        </>
      ),
      code: `<Button variant="outline">Отмена</Button>
<Button variant="primary">Сохранить</Button>`,
    },
    {
      id: "icon",
      title: "Кнопка со значком и загрузкой",
      demo: (
        <>
          <DemoButton icon="plus">Новый груз</DemoButton>
          <DemoButton loading>Отправляем</DemoButton>
        </>
      ),
      code: `<Button icon={<Icon name="plus" />}>Новый груз</Button>
<Button loading>Отправляем</Button>   {/* aria-busy, не disabled */}`,
    },
    {
      id: "toolbar",
      title: "Тулбар из ghost",
      demo: (
        <>
          <DemoButton variant="ghost" square label="Скачать" icon="dl" />
          <DemoButton variant="ghost" square label="Копировать" icon="copy" />
          <DemoButton variant="ghost" square label="Удалить" icon="trash" />
        </>
      ),
      code: `<Button variant="ghost" square aria-label="Скачать"><Icon name="dl" /></Button>`,
    },
  ],
});

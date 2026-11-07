/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { DemoAvatar } from "../avatar/demo";
import { Icon } from "@/engine/Icon";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  ACTIONS,
  COLUMNS,
  ColumnsMenuExample,
  DemoMenu,
  MenuScene,
  MenuSurface,
  MenuTrigger,
  PROFILE,
  RowMenuExample,
  type MenuState,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const CLOSED: MenuState = { open: false, checks: {} };

function OpenDemo() {
  return (
    <Playback<MenuState>
      initial={CLOSED}
      script={[
        { at: 400, set: { force: "hover" } },
        { at: 1000, set: { force: undefined, open: true, hot: "open" } },
        { at: 1800, set: { hot: "copy" } },
        { at: 2400, set: { hot: "archive" } },
        { at: 3000, set: { hot: "open" } },
        {
          at: 3600,
          set: { open: false, hot: undefined, force: "focus", log: "Выбрано: Открыть карточку" },
        },
      ]}
      tail={900}
      hint="Первый доступный пункт получает фокус сразу; стрелки идут по кругу и пропускают недоступный «Исправить в 1С»."
      render={(s) => <MenuScene state={s} />}
    />
  );
}

function CheckDemo() {
  return (
    <Playback<MenuState>
      initial={{ open: false, checks: {} }}
      script={[
        { at: 400, set: { open: true, hot: "client" } },
        { at: 1200, set: { hot: "weight" } },
        { at: 1700, set: { checks: { weight: true } } },
        { at: 2400, set: { hot: "client" } },
        { at: 2900, set: { checks: { weight: true, client: false } } },
        { at: 3700, set: { open: false, hot: undefined, force: "focus" } },
      ]}
      tail={900}
      hint="Клик по пункту-флажку меняет галочку и оставляет меню открытым: можно отметить несколько колонок подряд."
      render={(s) => <MenuScene state={s} entries={COLUMNS} />}
    />
  );
}

function DangerDemo() {
  return (
    <Playback<MenuState>
      initial={{ open: true, hot: "open", checks: {} }}
      script={[
        { at: 500, set: { hot: "copy" } },
        { at: 1200, set: { hot: "archive" } },
        { at: 2400, set: { hot: "open" } },
      ]}
      tail={700}
      hint="Опасный пункт краснеет только при наведении или фокусе: в покое он выглядит как остальные."
      render={(s) => <MenuScene state={s} />}
    />
  );
}

function CloseDemo() {
  return (
    <Playback<MenuState>
      initial={CLOSED}
      script={[
        { at: 400, set: { open: true, hot: "open" } },
        { at: 1500, set: { open: false, hot: undefined, force: "focus" } },
        { at: 2300, set: { open: true, hot: "open", force: undefined } },
        { at: 3200, set: { open: false, hot: undefined } },
      ]}
      tail={900}
      hint="Esc закрывает и возвращает фокус на кнопку (кольцо видно); клик вне меню закрывает без возврата."
      render={(s) => <MenuScene state={s} />}
    />
  );
}

const states: StateSpec[] = [
  {
    id: "default",
    kind: "default",
    title: "Пункт в покое",
    note: "Прозрачный фон, текст --text, значок --text-2, подсказка клавиш --text-3 справа.",
    demo: <MenuSurface isStatic label="Пример" entries={[ACTIONS[0], ACTIONS[1]]} />,
  },
  {
    id: "hover",
    kind: "hover",
    title: "Hover и фокус стрелками",
    note: "Слой --layer-1, значок темнеет до --text. Фокус стрелками и hover выглядят одинаково.",
    forced: true,
    demo: <MenuSurface isStatic label="Hover" entries={[ACTIONS[0], ACTIONS[1]]} hot="copy" />,
  },
  {
    id: "active",
    kind: "active",
    title: "Active",
    note: "Слой --layer-1p на время нажатия.",
    forced: true,
    demo: (
      <MenuSurface isStatic label="Active" entries={[ACTIONS[0]]} hot="open" hotForce="active" />
    ),
  },
  {
    id: "focus",
    kind: "focus",
    title: "Focus",
    note: "Фокус показывается слоем --layer-1, как hover, без кольца (outline: 0): пункт, на котором стоит фокус, всегда виден.",
    forced: true,
    demo: <MenuSurface isStatic label="Focus" entries={[ACTIONS[1]]} hot="copy" />,
  },
  {
    id: "danger",
    kind: "hover",
    title: "Danger на hover",
    note: "Текст и значок --err-text (4,7:1 на подложке), подложка danger 10 % на --surface. В покое пункт обычный.",
    forced: true,
    demo: <MenuSurface isStatic label="Danger" entries={[ACTIONS[4]]} hot="archive" />,
  },
  {
    id: "disabled",
    kind: "disabled",
    title: "Disabled",
    note: "Текст и значок --text-ph, пояснение причины (11 px) под названием; hover не реагирует.",
    demo: <MenuSurface isStatic label="Disabled" entries={[ACTIONS[2]]} />,
  },
  {
    id: "checked",
    kind: "selected",
    title: "Пункт-флажок",
    note: "role=menuitemcheckbox, слева Checkbox 16 px; клик меняет галочку и меню остаётся открытым.",
    demo: (
      <MenuSurface
        isStatic
        label="Колонки"
        entries={[COLUMNS[1], COLUMNS[3]]}
        checks={{ client: true, weight: false }}
      />
    ),
  },
  {
    id: "open",
    kind: "other",
    title: "Кнопка при открытом меню",
    note: "aria-expanded=true: у кнопки ghost слой --layer-2, у «Действия ˅» стрелка повёрнута на 180°.",
    demo: (
      <>
        <MenuTrigger open />
        <MenuTrigger kind="icon" open />
      </>
    ),
  },
  NA(
    "loading",
    "loading",
    "Loading",
    "Нет в макете: пункты известны заранее. [TODO] для асинхронного меню (список подключений): Skeleton-строки вместо пунктов и aria-busy.",
  ),
  NA(
    "error",
    "error",
    "Error",
    "Нет: ошибку действия показывает Toast. Опасное действие (danger) — не ошибка, а предупреждение о цене клика.",
  ),
  NA(
    "empty",
    "empty",
    "Empty",
    "Нет: меню без пунктов не показывают. Если действий нет, скрывают кнопку или делают её disabled с подсказкой.",
  ),
];

export default defineDoc({
  id: "dropdown",
  title: "Dropdown menu",
  group: "actions",
  cssPrefix: "ds-menu",
  order: 60,
  keywords: [
    "меню",
    "выпадающее меню",
    "дропдаун",
    "menu",
    "dropdown",
    "dropdown menu",
    "контекстное меню",
    "popup menu",
    "действия",
    "ещё",
    "три точки",
    "пользователь",
    "флажки",
  ],
  summary:
    "Меню команд у кнопки: заголовок, группы, пункты со значком и подсказкой клавиш, пункты-флажки и опасное действие.",
  purpose:
    "Dropdown раскрывает список действий над объектом или экраном: «Открыть карточку», «Копировать номер», «В архив». Он про команды, а не про выбор значения: для выбора берите Select. Меню закрывается после действия; пункты-флажки (показать колонки) оставляют его открытым.",
  related: ["select", "button", "popover", "checkbox"],
  anatomy: {
    demo: (
      <div className="ds-menu__anat">
        <Marks
          block
          items={[
            { n: 1, side: "t" },
            { n: 2, anchor: ".ds-menu__head", side: "l" },
            { n: 3, anchor: ".ds-menu__label", side: "l" },
            { n: 4, anchor: ".ds-menu__item:not(.ds-menu__item--danger)", side: "l" },
            { n: 5, anchor: ".ds-menu__end", side: "r" },
            { n: 6, anchor: ".ds-menu__sep:not(.ds-menu__sep--head)", side: "b" },
          ]}
        >
          <div className="ds-menu ds-menu--static" role="menu" aria-label="Пример">
            <div className="ds-menu__head" role="presentation">
              <DemoAvatar kind="you" size="md" name="Ирина Петрова" />
              <span>
                <b>Ирина Петрова</b>
                <small>Оформление · Дальснаб</small>
              </span>
            </div>
            <hr className="ds-menu__sep ds-menu__sep--head" />
            <div className="ds-menu__label" role="presentation">
              Профиль
            </div>
            <button type="button" role="menuitem" className="ds-menu__item" data-force="hover">
              <Icon name="gear" className="ds-menu__ico" />
              <span className="ds-menu__tx">Настройки</span>
              <span className="ds-menu__end">Ctrl ,</span>
            </button>
            <hr className="ds-menu__sep" />
            <button type="button" role="menuitem" className="ds-menu__item ds-menu__item--danger">
              <Icon name="logout" className="ds-menu__ico" />
              <span className="ds-menu__tx">Выйти</span>
            </button>
          </div>
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Поверхность меню",
        description:
          "Фон --surface, кольцо 1px --border, тень --shadow-pop, радиус 12, padding 6, ширина от 240 до 360. Под кнопкой с отступом 4, по левому краю (по правому у «⋯» в конце строки).",
      },
      {
        name: "Заголовок",
        description:
          "Аватар 24 и две строки: имя 700 и пояснение 12 px --text-3; под ним линия на всю ширину. Для меню пользователя; необязателен.",
        optional: true,
      },
      {
        name: "Метка группы",
        description: "12 px 600 --text-3, padding 8 8 4. Называет группу флажков или действий.",
        optional: true,
      },
      {
        name: "Пункт",
        description:
          "Кнопка высотой от 28, padding 1 8, радиус 8; значок 16 слева (или Checkbox у флажка), название, под ним пояснение 11 px.",
      },
      {
        name: "Подсказка клавиш",
        description:
          "12 px --text-3 у правого края: «Ctrl ,». Только подсказка: клавиши меню не назначает.",
        optional: true,
      },
      {
        name: "Разделитель",
        description:
          "1px --divider, выходит за padding на 6 с каждой стороны. Отделяет опасное действие.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "actions",
      title: "Меню действий",
      description:
        "Кнопка «Действия ˅» (outline sm) или «⋯» (ghost-квадрат 28), под ней список команд; опасное действие отделено линией и краснеет на hover.",
      when: "действия над строкой таблицы и карточкой: открыть, копировать, в архив.",
      wide: true,
      demo: (
        <div className="ds-menu__pair">
          <DemoMenu flow />
          <DemoMenu flow kind="icon" end />
        </div>
      ),
    },
    {
      id: "profile",
      title: "С заголовком",
      description:
        "Сверху аватар и имя с пояснением, затем линия и пункты; недоступный пункт с причиной.",
      when: "меню пользователя в шапке: профиль, настройки, выйти.",
      demo: <DemoMenu flow entries={PROFILE} label="Пользователь" />,
    },
    {
      id: "checks",
      title: "Группа и флажки",
      description:
        "Метка группы и пункты-флажки; клик не закрывает меню. Внизу команда «Сбросить», которая закрывает.",
      when: "показать колонки, выбрать поля отчёта.",
      demo: <DemoMenu flow entries={COLUMNS} label="Колонки" />,
    },
  ],
  sizes: [
    {
      id: "item",
      title: "Пункт",
      value: "от 28 px",
      note: "min-height = --h-sm; пояснение увеличивает высоту",
      demo: <MenuSurface isStatic label="Размер" entries={[ACTIONS[0]]} />,
    },
    {
      id: "surface",
      title: "Меню",
      value: "240–360 px",
      note: "min-width 240, max-width min(360, ширина окна − 16)",
      demo: <MenuSurface isStatic label="Ширина" entries={[ACTIONS[1]]} />,
    },
  ],
  states,
  choreography: [
    {
      id: "open-nav",
      title: "Открытие и ходьба стрелками",
      trigger: "клик по кнопке меню (или Enter, Space на ней)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover на кнопке: слой кнопки (outline: фон --layer-2).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 600,
          dur: 125,
          what: "Меню появляется под кнопкой: прозрачность 0 → 1, масштаб 0,96 → 1, сдвиг вверх на 4px → 0.",
          prop: "opacity, scale, translate",
          easing: "var(--ease) = cubic-bezier(.6,0,.05,.95)",
        },
        {
          at: 600,
          dur: 200,
          what: "Стрелка «˅» на кнопке поворачивается на 180°.",
          prop: "transform: rotate",
          easing: "var(--ease)",
        },
        {
          at: 600,
          dur: 0,
          what: "Фокус сразу на первом доступном пункте (preventScroll): он подсвечен слоем --layer-1.",
          prop: "focus",
        },
        {
          at: 1400,
          dur: 125,
          what: "↓ / ↑: фокус на следующий / предыдущий доступный пункт по кругу; недоступные пропускаются. Подсветка переезжает за 125 мс.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 3000,
          dur: 0,
          what: "Enter или клик: действие выполняется, меню закрывается сразу (без анимации), фокус возвращается на кнопку.",
          prop: "focus",
        },
      ],
      focus:
        "Внутрь меню фокус переходит сам, при закрытии возвращается на кнопку. Пункты tabindex не имеют: ходят стрелками (роль menu). Кольца у пункта нет — вместо него слой --layer-1.",
      reducedMotion:
        "Появление (масштаб, прозрачность, сдвиг) и поворот стрелки отключены: меню возникает сразу.",
      neighbours:
        "Меню лежит поверх страницы (position: fixed, z-index 900) и ничего не сдвигает; если внизу нет места, открывается вверх, не выходит за экран на 8px. Прокрутка и смена размера окна закрывают меню. Одновременно открыто одно меню или список.",
      demo: <OpenDemo />,
    },
    {
      id: "check",
      title: "Пункт-флажок: меню остаётся открытым",
      trigger: "клик или Enter по пункту-флажку",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Переключается галочка Checkbox: заливка и рамка --primary (или обратно).",
          prop: "background, border-color",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "aria-checked у пункта меняется; меню не закрывается и фокус остаётся на пункте.",
          prop: "aria-checked",
        },
        {
          at: 0,
          dur: 0,
          what: "Действие применяется сразу (колонка скрыта или показана) — подтверждения нет.",
          prop: "—",
        },
      ],
      focus:
        "Остаётся на пункте, стрелки продолжают работать. Закрыть можно Esc или кликом вне меню.",
      reducedMotion: "Переход цвета галочки отключён.",
      neighbours:
        "Меню не меняет размера. За ним применяется изменение (колонка таблицы появляется или исчезает), но это не часть анимации меню.",
      demo: <CheckDemo />,
    },
    {
      id: "danger",
      title: "Опасное действие",
      trigger: "наведение или фокус на пункте danger",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Подложка danger 10 % на --surface, текст и значок переходят к --err-text.",
          prop: "background, color",
          easing: "ease",
        },
        {
          at: 1900,
          dur: 125,
          what: "Уход курсора: пункт возвращается к обычному виду.",
          prop: "background, color",
          easing: "ease",
        },
      ],
      focus:
        "Фокус стрелками красит пункт так же, как hover. Опасный пункт отделён линией и стоит последним. Подтверждение действия — в Dialog, а не в самом меню.",
      reducedMotion: "Переход цвета отключён.",
      neighbours: "Соседние пункты не меняются.",
      demo: <DangerDemo />,
    },
    {
      id: "close",
      title: "Закрытие без действия",
      trigger: "Esc или клик вне меню",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Меню снимается сразу, без анимации.",
          prop: "—",
        },
        {
          at: 0,
          dur: 200,
          what: "Стрелка кнопки возвращается на 0°.",
          prop: "transform: rotate",
          easing: "var(--ease)",
        },
        {
          at: 0,
          dur: 0,
          what: "Esc возвращает фокус на кнопку; клик вне — нет (фокус там, куда кликнули).",
          prop: "focus",
        },
      ],
      focus:
        "Esc: фокус на кнопку (кольцо видно). Клик по самой кнопке открытого меню закрывает его, а не открывает заново.",
      reducedMotion: "Поворот стрелки отключён.",
      neighbours:
        "Открытие другого меню закрывает это. Tab в макете меню не закрывает: [TODO] предложение — Tab закрывает меню и идёт к следующему элементу; Home и End — первый и последний пункт.",
      demo: <CloseDemo />,
    },
  ],
  rules: {
    use: [
      "Команды над объектом: до семи-восьми пунктов, самые частые сверху.",
      "Опасное действие отделяйте линией и ставьте в конец.",
      "Недоступный пункт оставляйте с причиной («Нужны права администратора»).",
      "Меню пользователя — с заголовком; меню колонок — с флажками.",
      "Подсказка клавиш — только если сочетание реально работает.",
    ],
    avoid: [
      "Выбор значения для поля формы: это Select.",
      "Меню с двумя пунктами: покажите две кнопки.",
      "Вложенные подменю: на маленьком экране они неудобны. [TODO] в системе подменю нет.",
      "Меню для навигации по разделам: это Tabs или боковая панель.",
      "Опасное действие без подтверждения: «В архив» и «Удалить» идут через Dialog.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Кнопка",
      text: 'aria-haspopup="menu", aria-expanded, aria-controls на меню. У «⋯» обязателен aria-label («Ещё»).',
    },
    {
      kind: "aria",
      title: "Меню и пункты",
      text: 'role="menu" с aria-label; пункты role="menuitem", флажки — "menuitemcheckbox" с aria-checked; разделитель role="separator"; метка группы role="presentation". Недоступный пункт — disabled.',
    },
    {
      kind: "key",
      title: "Enter / Space",
      text: "На кнопке открывают меню; на пункте выполняют действие (у флажка меняют значение).",
    },
    {
      kind: "key",
      title: "↑ ↓",
      text: "Идут по доступным пунктам по кругу, недоступные пропускают. Пункты не в порядке Tab.",
    },
    {
      kind: "key",
      title: "Esc",
      text: "Закрывает меню и возвращает фокус на кнопку.",
    },
    {
      kind: "key",
      title: "Tab / Home / End",
      text: "[TODO] предложение: Tab закрывает меню, Home и End — первый и последний пункт. В макете нет.",
    },
    {
      kind: "focus",
      title: "Фокус пункта",
      text: "Слой --layer-1 вместо кольца: 15,2:1 для текста на нём. Кнопка меню — обычное кольцо 2px --focus.",
    },
    {
      kind: "contrast",
      title: "Текст пунктов",
      text: "--text на --surface 16,5:1; пояснение --text-3 4,9:1 (светлая) и 7,6:1 (тёмная); disabled --text-ph вне нормы. Danger на подложке hover в светлой теме 3,7:1 — ниже 4,5:1. [TODO] заменить цвет текста на --err-text (5,5:1) или усилить подложку; в тёмной 5,5:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Отключаются появление меню, поворот стрелки и переходы подсветки.",
    },
  ],
  tokens: [
    {
      name: "--surface / --border / --shadow-pop",
      value: "#fff / #c6cdd6 / 0 6px 20px",
      usage: "Поверхность меню: фон, кольцо 1px, тень",
      kind: "color",
    },
    {
      name: "--r-popover / --r-item",
      value: "12 / 8 px",
      usage: "Радиус меню / пункта",
      kind: "radius",
    },
    {
      name: "размеры",
      value: "padding 6, ширина 240–360, пункт ≥ 28",
      usage: "Меню и пункт (--h-sm)",
      kind: "size",
    },
    {
      name: "--text / --text-2 / --text-3",
      value: "#15202b / #44505d / #66727f",
      usage: "Пункт / значок / пояснение и подсказка клавиш",
      kind: "color",
    },
    {
      name: "--layer-1 / --layer-1p",
      value: "ink 4 % / 7 %",
      usage: "Hover и фокус / нажатие",
      kind: "color",
    },
    {
      name: "--danger / --err-text",
      value: "#d03538 / #c92a2a (тёмная #ff6b6b / #ff8d8d)",
      usage: "Подложка 10 % (--danger), текст и значок (--err-text) у danger на hover",
      kind: "color",
    },
    {
      name: "--divider",
      value: "#e0e4e9",
      usage: "Разделитель и линия под заголовком",
      kind: "color",
    },
    { name: "--text-ph", value: "#8792a0", usage: "Недоступный пункт", kind: "color" },
    {
      name: "--dur-f / --ease",
      value: "125 мс / cubic-bezier(.6,0,.05,.95)",
      usage: "Появление меню: opacity, scale, translate; слои пунктов",
      kind: "time",
    },
    { name: "--dur", value: "200 мс", usage: "Поворот стрелки на кнопке", kind: "time" },
  ],
  examples: [
    {
      id: "row",
      title: "Действия над строкой груза",
      demo: <RowMenuExample />,
      code: `<Dropdown kind="icon" label="Действия" end>
  <DropdownItem icon={<Icon name="doc" />}>Открыть карточку</DropdownItem>
  <DropdownItem icon={<Icon name="copy" />} shortcut="Ctrl C">Копировать номер</DropdownItem>
  <DropdownItem icon={<Icon name="edit" />} disabled hint="Расхождений нет">Исправить в 1С</DropdownItem>
  <DropdownSeparator />
  <DropdownItem icon={<Icon name="trash" />} danger onSelect={archive}>В архив</DropdownItem>
</Dropdown>`,
    },
    {
      id: "columns",
      title: "Показать колонки",
      demo: <ColumnsMenuExample />,
      code: `<Dropdown label="Колонки" triggerLabel="Колонки">
  <DropdownLabel>Показать колонки</DropdownLabel>
  <DropdownItem checked={cols.client} onCheckedChange={(on) => setCol("client", on)}>Клиент</DropdownItem>
  <DropdownItem checked={cols.decl} onCheckedChange={(on) => setCol("decl", on)}>Декларация</DropdownItem>
  <DropdownItem checked={cols.weight} onCheckedChange={(on) => setCol("weight", on)}>Вес, кг</DropdownItem>
  <DropdownSeparator />
  <DropdownItem icon={<Icon name="refresh" />} onSelect={resetCols}>Сбросить</DropdownItem>
</Dropdown>`,
    },
  ],
});

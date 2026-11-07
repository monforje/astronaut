/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  HelpPopoverExample,
  LivePopover,
  PopTrigger,
  PopoverCard,
  StatusPopoverExample,
  type PopKind,
} from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const Frame = ({ children, short }: { children: React.ReactNode; short?: boolean }) => (
  <div className={`ds-popover-stage${short ? " ds-popover-stage--short" : ""}`}>{children}</div>
);

function OpenDemo() {
  return (
    <Playback<{ f?: "hover" | "active"; open: boolean }>
      initial={{ open: false }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 1000, set: { f: "active" } },
        { at: 1200, set: { f: undefined, open: true } },
        { at: 3200, set: { open: false } },
      ]}
      tail={900}
      render={(s) => (
        <Frame short>
          <LivePopover kind="status" open={s.open} force={s.f} />
        </Frame>
      )}
    />
  );
}

function EscDemo() {
  return (
    <Playback<{ open: boolean; f?: "focus" }>
      initial={{ open: true }}
      script={[
        { at: 1800, set: { open: false, f: "focus" } },
        { at: 3000, set: { f: undefined } },
      ]}
      tail={600}
      hint="Esc закрывает поповер и возвращает фокус на кнопку, которая его открыла."
      render={(s) => (
        <Frame short>
          <LivePopover kind="filter" open={s.open} force={s.f} />
        </Frame>
      )}
    />
  );
}

const live = (kind: PopKind, label: string) => ({ kind, label });

export default defineDoc({
  id: "popover",
  title: "Popover",
  group: "overlays",
  cssPrefix: "ds-popover",
  order: 20,
  keywords: [
    "поповер",
    "всплывающая панель",
    "всплывающее окно",
    "попап",
    "выпадающая панель",
    "фильтр",
    "справка",
    "popover",
    "popup",
    "flyout",
    "dropdown panel",
    "filter",
    "help",
  ],
  summary:
    "Плавающая панель у элемента по клику: шапка, содержимое, подвал. Для подробностей статуса, маленьких форм и справки. Закрывается Esc и кликом вне.",
  purpose:
    "Popover показывает то, что не умещается в Tooltip и не стоит окна Dialog: подробности расхождения, фильтр из трёх полей, пояснение термина. Он немодальный: страница остаётся живой, поповер привязан к якорю и исчезает при прокрутке. Решение, без которого нельзя продолжать, — Dialog; список действий — меню; список значений — Select.",
  related: ["tooltip", "dialog", "button", "badge"],
  anatomy: {
    demo: (
      <Marks
        items={[
          { n: 1, anchor: ".ds-popover", side: "r" },
          { n: 2, anchor: ".ds-popover__head", side: "l" },
          { n: 3, anchor: ".ds-popover__body", side: "l" },
          { n: 4, anchor: ".ds-popover__foot", side: "r" },
          { n: 5, anchor: ".ds-btn", side: "l" },
        ]}
      >
        <span style={{ display: "inline-flex", flexDirection: "column", gap: 8 }}>
          <span style={{ display: "inline-flex" }}>
            <PopTrigger kind="status" expanded />
          </span>
          <PopoverCard kind="status" />
        </span>
      </Marks>
    ),
    parts: [
      {
        name: "Панель",
        description:
          "Фон --surface, кольцо 1px --border, тень --shadow-pop, радиус --r-popover (12); ширина 280–340 px, не шире окна − 16.",
      },
      { name: "Шапка", description: "Жирный (700): что это. Отступы 12 14 8." },
      {
        name: "Содержимое",
        description:
          "Колонка с интервалом 10, цвет --text-2; ключевые числа --text. Форма, список, справка.",
      },
      {
        name: "Подвал",
        description:
          "Верхняя черта --divider, кнопки sm справа через 6 px: «нет» слева (ghost), «да» справа (primary).",
        optional: true,
      },
      {
        name: "Якорь",
        description:
          "Кнопка-триггер: aria-haspopup=dialog, aria-expanded; когда поповер открыт, кнопка подсвечена слоем.",
      },
    ],
  },
  variants: [
    {
      id: "status",
      title: "Подробности статуса",
      description: "Шапка, абзац с ключевым значением, сводка «было/стало», два действия.",
      when: "нужно раскрыть бейдж или значок: что за расхождение и что с ним делать.",
      demo: <PopoverCard kind="status" />,
    },
    {
      id: "filter",
      title: "Фильтр с формой",
      description: "Поля и флажки, подвал «Сбросить» и «Применить».",
      when: "короткая форма из 2–5 полей без перехода на другой экран.",
      demo: <PopoverCard kind="filter" />,
    },
    {
      id: "help",
      title: "Справка",
      description: "Шапка, один абзац и ссылка; без подвала.",
      when: "объяснить термин рядом с полем; для одной фразы хватит Tooltip.",
      demo: <PopoverCard kind="help" />,
    },
    {
      id: "live",
      title: "Живой",
      description: "Три якоря: клик открывает, повторный клик, Esc и клик вне закрывают.",
      when: "попробовать руками: клавиатура и мышь.",
      demo: (
        <Frame>
          {[live("status", ""), live("filter", ""), live("help", "")].map((x) => (
            <LivePopover key={x.kind} kind={x.kind} />
          ))}
        </Frame>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Закрыт",
      note: "Виден только якорь с aria-expanded=false.",
      demo: <PopTrigger kind="filter" />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover якоря",
      note: "Слой на кнопке-якоре; сам поповер от hover не меняется.",
      forced: true,
      demo: <PopTrigger kind="filter" force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active якоря",
      note: "Слой 9 % в момент нажатия.",
      forced: true,
      demo: <PopTrigger kind="filter" force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus якоря",
      note: "Кольцо 2 px на якоре; после закрытия Esc фокус возвращается сюда.",
      forced: true,
      demo: <PopTrigger kind="filter" force="focus" />,
    },
    {
      id: "open",
      kind: "selected",
      title: "Открыт",
      note: "Якорь с aria-expanded=true, ghost-якорь остаётся залитым слоем. Панель под якорем со смещением 4 px.",
      demo: (
        <div
          style={{
            width: "100%",
            minHeight: 190,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            paddingTop: 4,
            paddingLeft: 16,
          }}
        >
          <LivePopover kind="help" open />
        </div>
      ),
    },
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "Якорь отключают как обычную кнопку; открыть поповер нельзя. Причину говорит Tooltip на обёртке.",
    ),
    NA(
      "loading",
      "loading",
      "Loading",
      "В макете нет. Предложение [TODO]: содержимое грузится — внутри Skeleton, высота панели заранее задана.",
    ),
    NA("error", "error", "Error", "В макете нет. Ошибка внутри — Alert err в содержимом."),
    NA("empty", "empty", "Empty", "Пустой поповер не открывают: нет содержимого — нет якоря."),
  ],
  rules: {
    use: [
      'Якорь — кнопка с aria-haspopup="dialog" и aria-expanded.',
      "В подвале «нет» слева, «да» справа; действие «да» всегда primary.",
      "Одна панель на экран: открывая новую, закрывайте предыдущую.",
      "Сводки и ключевые значения — в содержимом, не в шапке.",
      "Узкая форма: 2–5 полей; больше — Sheet или Dialog.",
    ],
    avoid: [
      "Поповер в поповере.",
      "Решение, без которого нельзя работать: это Dialog.",
      "Список из команд: это меню, у него другая клавиатура (стрелки).",
      "Закрывать при уходе мыши: поповер открыт кликом и закрывается явно.",
      "Прятать поповер под полем ввода: ставьте сверху, если снизу нет места (в макете разворот автоматический).",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=dialog (немодальный)",
      text: 'Панель — role="dialog", aria-label или aria-labelledby на шапку; aria-modal не ставят, страница остаётся доступной. Якорь: aria-haspopup="dialog", aria-expanded, aria-controls (при открытом).',
    },
    {
      kind: "key",
      title: "Клавиши",
      text: "Enter и Space на якоре открывают и закрывают. Tab идёт по содержимому панели, потом дальше по странице; Esc закрывает и возвращает фокус на якорь.",
    },
    {
      kind: "focus",
      title: "Фокус при открытии и закрытии",
      text: "[TODO] в макете фокус остаётся на якоре, а содержимое поповера следует за ним в порядке Tab только если DOM поставлен сразу после якоря. Предложение: при открытии фокус на первый интерактивный элемент (или на панель с tabindex=-1, если их нет); при закрытии — на якорь. Ловушки фокуса нет: поповер не модальный.",
    },
    {
      kind: "aria",
      title: "Закрытие",
      text: "Esc, клик вне, повторный клик по якорю, прокрутка и изменение размера окна. Esc не закрывает поповер, пока открыт Dialog над ним: Esc принадлежит верхнему слою.",
    },
    {
      kind: "contrast",
      title: "Текст",
      text: "Шапка и числа --text на surface 16,5:1, абзац --text-2 8,2:1. Тёмная: 16,4:1 и 11,3:1. Кольцо границы дополняет тень.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление без масштаба и сдвига, мгновенно.",
    },
  ],
  tokens: [
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6 (тёмная #151b23 / #4d5b6b)",
      usage: "Фон и кольцо панели",
      kind: "color",
    },
    {
      name: "--shadow-pop",
      value: "0 6px 20px · 0 1px 3px",
      usage: "Тень (в тёмной 0 8px 24px)",
      kind: "shadow",
    },
    { name: "--r-popover", value: "12 px", usage: "Радиус панели", kind: "radius" },
    { name: "width", value: "280–340 px, ≤ 100vw − 16", usage: "Ширина", kind: "size" },
    {
      name: "padding",
      value: "12 14 8 · 0 14 12 · 10 14",
      usage: "Шапка · содержимое · подвал",
      kind: "size",
    },
    { name: "gap", value: "10 px (содержимое), 6 px (кнопки)", usage: "Интервалы", kind: "size" },
    {
      name: "z-index",
      value: "900",
      usage: "Выше Dialog и Sheet 800; ниже Tooltip 1000",
      kind: "other",
    },
    { name: "offset", value: "4 px от якоря, 8 px до края окна", usage: "Положение", kind: "size" },
    {
      name: "pop",
      value: "125 мс, --ease",
      usage: "opacity 0→1, scale .96→1, сдвиг −4 px→0",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "open",
      title: "Открытие",
      trigger: "клик по якорю (Enter / Space)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Якорь получает hover, затем active (слой поверх фона).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 800,
          dur: 0,
          what: "Панель вставляется в body, считается положение: снизу по левому краю якоря (4 px), при нехватке места — сверху; зажимается в окно с отступом 8 px. Якорь aria-expanded=true.",
          prop: "top, left",
        },
        {
          at: 800,
          dur: 125,
          what: "pop: opacity 0 → 1, scale .96 → 1, сдвиг вниз −4 px → 0.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 800,
          dur: 0,
          what: "Слушатели mousedown вне панели (capture) и прокрутки/ресайза.",
          prop: "—",
        },
      ],
      focus:
        "[TODO] в макете фокус остаётся на якоре. Предложение: фокус в панель (первый элемент), якорь aria-expanded.",
      reducedMotion: "Без масштаба и сдвига, мгновенно.",
      neighbours:
        "Перекрывает страницу (z-index 900), её не двигает. Открытие нового поповера закрывает прежний. Tooltip с якоря на время открытия не показывается.",
      demo: <OpenDemo />,
    },
    {
      id: "close",
      title: "Закрытие: Esc, клик вне, действие",
      trigger: "Esc / mousedown вне / кнопка в подвале / прокрутка",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Панель удаляется из DOM сразу, без анимации ухода; у якоря aria-expanded=false, слушатели сняты.",
          prop: "—",
        },
        {
          at: 0,
          dur: 0,
          what: "При Esc и «data-close» фокус возвращается на якорь; при клике вне — туда, куда кликнули; при прокрутке окна — никуда.",
          prop: "focus",
        },
      ],
      focus:
        "Esc и кнопки подвала возвращают фокус на якорь. Esc игнорируется, если сверху открыт Dialog.",
      reducedMotion: "Не отличается: ухода нет.",
      neighbours: "Освободившееся место ничем не заполняется: панель была поверх страницы.",
      demo: <EscDemo />,
    },
  ],
  examples: [
    {
      id: "status",
      title: "Расхождение по весу",
      demo: <StatusPopoverExample />,
      code: `<Popover
  trigger={<Button variant="outline" size="sm">Расхождение</Button>}
  label="Расхождение по весу"
>
  {({ close }) => (
    <>
      <PopoverHead>Расхождение по весу</PopoverHead>
      <PopoverBody>
        <span>Вес в декларации меньше веса по накладной на <b>180 кг</b>.</span>
        <dl className="ds-popover__diff">
          <dt>Накладная</dt>
          <dd>18 420 кг</dd>
          <dt>Декларация</dt>
          <dd>18 240 кг</dd>
        </dl>
      </PopoverBody>
      <PopoverFoot>
        <Button variant="ghost" size="sm" onClick={close}>Скрыть</Button>
        <Button size="sm" onClick={close}>Исправить в 1С</Button>
      </PopoverFoot>
    </>
  )}
</Popover>`,
    },
    {
      id: "help",
      title: "Справка у термина",
      demo: <HelpPopoverExample />,
      code: `<Popover
  trigger={<Button square variant="ghost" aria-label="Справка" icon={<Icon name="help" />} />}
  label="Что значит «Сверено»"
>
  {({ close }) => (
    <>
      <PopoverHead>Что значит «Сверено»</PopoverHead>
      <PopoverBody>
        <span>Вес, код ТН ВЭД и номера совпадают в накладной, декларации и инвойсе.</span>
        <button type="button" className="ds-popover__link" onClick={close}>Как работает сверка ›</button>
      </PopoverBody>
    </>
  )}
</Popover>`,
    },
  ],
});

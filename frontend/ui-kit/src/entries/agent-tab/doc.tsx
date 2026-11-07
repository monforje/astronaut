/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import {
  AgentTabLive,
  AgentTabScene,
  BubbleExample,
  DemoAgentTab,
  DemoBubble,
  TabExample,
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
    <Playback<{ f?: "hover" | "active" }>
      initial={{}}
      script={[
        { at: 500, set: { f: "hover" } },
        { at: 2000, set: { f: "active" } },
        { at: 2300, set: { f: "hover" } },
        { at: 3200, set: { f: undefined } },
      ]}
      tail={800}
      hint="Выезд 0,28 с: язычок сдвигается на 14 px, а подпись раскрывается по ширине."
      render={(s) => <AgentTabScene force={s.f} y={150} />}
    />
  );
}

function BubbleDemo() {
  return (
    <Playback<{ b: 0 | 1 | 2; badge: boolean }>
      initial={{ b: 0, badge: true }}
      script={[
        { at: 500, set: { b: 1 } },
        { at: 3500, set: { b: 2 } },
        { at: 3700, set: { b: 0 } },
      ]}
      tail={900}
      hint="В продукте пузырь висит 14 секунд; здесь для просмотра время сжато до 3 секунд, анимации настоящие."
      render={(s) => (
        <AgentTabScene
          badge={s.badge}
          y={230}
          bubble={s.b > 0}
          bubbleOut={s.b === 2}
          force={s.b === 1 ? "hover" : undefined}
        />
      )}
    />
  );
}

function DockDemo() {
  return (
    <Playback<{ open: boolean; size: "panel" | "wide" | "full"; out?: boolean; f?: "hover" }>
      initial={{ open: false, size: "panel" }}
      script={[
        { at: 400, set: { f: "hover" } },
        { at: 900, set: { open: true, f: undefined } },
        { at: 2600, set: { size: "wide" } },
        { at: 4100, set: { size: "full" } },
        { at: 5600, set: { size: "panel" } },
        { at: 7000, set: { out: true } },
        { at: 7200, set: { open: false, out: false, size: "panel" } },
      ]}
      tail={900}
      hint="Язычок и панель анимируются одним временем 0,3 с и одной кривой — поэтому кромка и язычок не расходятся."
      render={(s) => (
        <AgentTabScene open={s.open} size={s.size} panelOut={s.out} force={s.f} y={150} />
      )}
    />
  );
}

function DragDemo() {
  return (
    <Playback<{ y: number; drag: boolean }>
      initial={{ y: 200, drag: false }}
      script={[
        { at: 500, set: { drag: true } },
        { at: 600, set: { y: 160 } },
        { at: 800, set: { y: 110 } },
        { at: 1000, set: { y: 60 } },
        { at: 1300, set: { y: 60 } },
        { at: 1500, set: { drag: false } },
        { at: 2800, set: { y: 200 } },
      ]}
      tail={900}
      hint="Язычок следует за указателем без переходов, в покое снова выглядывает. «Вернуть на место» — 62 % высоты."
      render={(s) => <AgentTabScene y={s.y} drag={s.drag} force={s.drag ? "hover" : undefined} />}
    />
  );
}

function HideDemo() {
  return (
    <Playback<{ open: boolean; size: "panel" | "full" }>
      initial={{ open: true, size: "panel" }}
      script={[
        { at: 900, set: { size: "full" } },
        { at: 2800, set: { size: "panel" } },
      ]}
      tail={900}
      hint="В полноэкранном режиме язычок исчезает (opacity 0, клики не ловит) и возвращается, когда панель сужается."
      render={(s) => <AgentTabScene open size={s.size} y={150} />}
    />
  );
}

export default defineDoc({
  id: "agent-tab",
  title: "AgentTab",
  group: "overlays",
  cssPrefix: "ds-agent-tab",
  order: 50,
  keywords: [
    "агент",
    "язычок",
    "вкладка агента",
    "ассистент",
    "помощник",
    "ии",
    "предложение",
    "бейдж",
    "пузырь",
    "agent",
    "agent tab",
    "ai",
    "assistant",
    "copilot",
    "tab",
    "ctrl j",
    "badge",
    "bubble",
    "handle",
  ],
  summary:
    "Язычок агента у правого края экрана: в покое выглядывает, на hover выезжает с «Агент · Ctrl J», с красным бейджем и пузырём-предложением. Перетаскивается по вертикали и прилипает к панели агента.",
  purpose:
    "AgentTab — единственный вход в агента с любой страницы. Он не отнимает место (в покое видна половина), не закрывает содержимое и может сам сообщить, что у агента есть идея: красная точка с пульсом и пузырь над язычком «Показать / Позже». Когда панель открыта, язычок становится её кромкой и работает как «свернуть». Сама панель — AgentPanel, раздвижная оболочка — Sheet.",
  related: ["agent-panel", "sheet", "badge", "popover"],
  anatomy: {
    demo: (
      <div
        style={{
          display: "flex",
          width: "100%",
          minWidth: 0,
          gap: 24,
          alignItems: "flex-end",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Marks
          items={[
            { n: 1, anchor: ".ds-agent-tab", side: "t" },
            { n: 2, anchor: ".ds-agent-tab__logo", side: "b" },
            { n: 3, anchor: ".ds-agent-tab__more", side: "b" },
            { n: 4, anchor: ".ds-agent-tab__badge", side: "l" },
          ]}
        >
          <DemoAgentTab force="hover" badge />
        </Marks>
        <Marks items={[{ n: 5, anchor: ".ds-agent-tab__x", side: "b" }]}>
          <DemoAgentTab open />
        </Marks>
        <Marks items={[{ n: 6, anchor: ".ds-agent-tab__bubble", side: "r" }]}>
          <DemoBubble />
        </Marks>
      </div>
    ),
    parts: [
      {
        name: "Язычок",
        description:
          "Кнопка 48 px высотой, радиус 16 слева и 0 справа, фон --surface, кольцо 1px --border, тень --shadow-pop. Прижат к правому краю окна (position: fixed), на --tab-y сверху (по умолчанию 62 % высоты).",
      },
      {
        name: "Знак агента",
        description:
          "ai-logo-1.png 34 px в окошке 36 px; раз в 5 с «кивает» (сдвиг −3 px и покачивание ±7°).",
      },
      {
        name: "Подпись",
        description:
          "Появляется при hover и фокусе: «Агент» (700) и под ним «Ctrl J» (11 px, --text-3) или «есть идея» при бейдже; ширина до 150 px.",
      },
      {
        name: "Бейдж",
        description:
          "Красный счётчик 17 px в левом верхнем углу знака, с кольцом цвета поверхности и пульсом (Badge counter). Значит: у агента есть предложение.",
        optional: true,
      },
      {
        name: "Стрелка «свернуть»",
        description:
          "Когда панель открыта, знак, подпись и бейдж скрыты, вместо них шеврон вправо: нажатие сворачивает панель.",
        optional: true,
      },
      {
        name: "Пузырь",
        description:
          "Карточка 300 px над язычком: знак, «Агент», крест, текст предложения, кнопки «Показать» и «Позже» 50/50. Хвостик справа внизу указывает на язычок. Закрывается сам через 14 с.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "rest",
      title: "В покое",
      description:
        "Выглядывает наполовину: видна левая часть знака (14 px уходят за край окна). Знак кивает раз в 5 с.",
      when: "агент доступен, предложений нет.",
      demo: <DemoAgentTab rest />,
    },
    {
      id: "hover",
      title: "Hover: выезжает с подписью",
      description:
        "Язычок выезжает полностью (сдвиг 14 → 0), справа раскрывается подпись «Агент · Ctrl J». То же при клавиатурном фокусе и при перетаскивании.",
      when: "курсор над язычком или фокус на нём.",
      demo: <DemoAgentTab force="hover" />,
    },
    {
      id: "badge",
      title: "С предложением",
      description: "Красный бейдж «1» с пульсом на знаке, подпись «есть идея» вместо «Ctrl J».",
      when: "у агента есть, что показать: расхождения, ждущие документы.",
      demo: <DemoAgentTab force="hover" badge sub="есть идея" />,
    },
    {
      id: "open",
      title: "Панель открыта: «свернуть»",
      description:
        "Язычок сидит на левой кромке панели, без знака и подписи, со стрелкой вправо; верхняя, нижняя и левая грани обведены, правая слита с панелью.",
      when: "панель агента открыта в режимах panel и wide.",
      demo: <DemoAgentTab open />,
    },
    {
      id: "bubble",
      title: "Пузырь-предложение",
      description:
        "Над язычком появляется карточка с хвостиком: «Нашёл 8 грузов с расхождениями… Показать?». Кнопки «Показать» (primary) и «Позже» (outline).",
      when: "агент нашёл что-то важное и пользователь не в панели агента; не чаще раза за сессию.",
      demo: <DemoBubble />,
    },
    {
      id: "live",
      title: "Живой стенд",
      description:
        "Перетащите язычок по вертикали, наведите, нажмите (или Ctrl J в рамке), раскройте панель до full, покажите пузырь.",
      when: "посмотреть поведение руками.",
      demo: <AgentTabLive initialBubble />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default (покой)",
      note: "Выглядывает; знак кивает.",
      demo: <DemoAgentTab rest />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: 'Выезжает с подписью. Принудительно: data-force="hover".',
      forced: true,
      demo: <DemoAgentTab force="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Слой 4 % ink поверх фона, язычок выдвинут.",
      forced: true,
      demo: <DemoAgentTab force="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus со смещением 2 px; выезд и подпись как при hover.",
      forced: true,
      demo: <DemoAgentTab force="focus" />,
    },
    {
      id: "badge",
      kind: "other",
      title: "С предложением",
      note: "Бейдж и подпись «есть идея».",
      demo: <DemoAgentTab force="hover" badge sub="есть идея" />,
    },
    {
      id: "open",
      kind: "selected",
      title: "Панель открыта",
      note: "Язычок — «свернуть»: стрелка вправо, сидит на кромке панели.",
      demo: <DemoAgentTab open />,
    },
    {
      id: "drag",
      kind: "other",
      title: "Перетаскивание",
      note: "Язычок выдвинут, курсор «grabbing», следует за указателем без переходов.",
      forced: true,
      demo: <DemoAgentTab force="hover" />,
    },
    NA(
      "disabled",
      "disabled",
      "Disabled",
      "В макете нет. [TODO] агент недоступен (нет прав, нет связи): язычок можно скрыть (data-hide) или показать серым с подсказкой; решение не принято.",
    ),
    NA(
      "loading",
      "loading",
      "Loading",
      "В макете нет. [TODO] агент работает в фоне: возможен индикатор на знаке; решение не принято.",
    ),
    NA(
      "error",
      "error",
      "Error",
      "В макете нет. Ошибку агента показывают внутри панели и тостом, язычок не меняется.",
    ),
    NA(
      "empty",
      "empty",
      "Empty",
      "Нет. Предложений нет — нет бейджа и пузыря; это и есть «покой».",
    ),
  ],
  rules: {
    use: [
      "Один язычок на приложение у правого края; положение запоминается (по вертикали).",
      "Бейдж ставьте только когда у агента есть предложение; число — сколько их.",
      "Пузырь показывайте не чаще раза за сессию и не в момент работы с панелью агента.",
      "Подпись «Ctrl J» напоминает о клавиатуре; Ctrl J открывает и закрывает панель из любого места.",
      "Когда панель открыта, оставляйте язычок «свернуть», а не прячьте его.",
    ],
    avoid: [
      "Закрывать содержимое: в покое язычок выглядывает на 36 px и не перекрывает основное действие.",
      "Несколько язычков или язычок слева: край справа зарезервирован за агентом.",
      "Красный бейдж без предложения или как счётчик уведомлений: это значок «есть идея».",
      "Показывать пузырь повторно после «Позже» в ту же сессию.",
      "Переносить язычок на другую сторону при открытии панели.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "Кнопка и название",
      text: "<button> с aria-label «Открыть агента» / «Свернуть агента», aria-expanded отражает панель (в макете aria-expanded нет — добавлено, [TODO]). Знак и бейдж декоративны, число в бейдже читается, но для «непрочитанных» нужно слово («1 предложение»).",
    },
    {
      kind: "key",
      title: "Tab, Enter, Space, Ctrl J",
      text: "Язычок в порядке Tab (последним в странице [TODO] проверить порядок), Enter и Space открывают панель. Ctrl J — глобально: открыть/закрыть. Перетаскивание клавиатуры не имеет: положение запоминается по мыши и жесту [TODO] предложить стрелки Up/Down при зажатом Alt.",
    },
    {
      kind: "focus",
      title: "Фокус при открытии и закрытии",
      text: "Нажатие открывает панель агента; фокус уходит в поле «Спросите агента». Свёртывание через язычок или Esc возвращает фокус на язычок (при закрытии из панели — на язычок, а не на старый элемент страницы) [TODO].",
    },
    {
      kind: "aria",
      title: "Пузырь",
      text: 'role="dialog", aria-label «Предложение агента»; не забирает фокус (появляется сам), поэтому его текст дублируйте в aria-live=polite области, иначе скринридер пропустит. Кнопки «Показать»/«Позже» в Tab после язычка.',
    },
    {
      kind: "focus",
      title: "Язычок и aria-modal панели",
      text: "[TODO] открытая панель агента — Sheet с aria-modal=true, а язычок на её кромке остаётся кликабельным. Для скринридера «свернуть» за пределами модальной области недоступно: решить, переносить ли «свернуть» внутрь панели (кнопка уже есть — крест).",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "Подпись --text на surface 16,5:1; «Ctrl J» --text-3 4,9:1 (тёмная 7,6:1). Кольцо 1px --border 1,6:1 — границу держит тень. Бейдж: белый на --danger 4,9:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Кивок знака и пульс бейджа выключены; выезд и раскрытие подписи, прилипание к панели — без переходов; пузырь появляется без сдвига.",
    },
  ],
  tokens: [
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6 (тёмная #151b23 / #4d5b6b)",
      usage: "Фон и кольцо язычка и пузыря",
      kind: "color",
    },
    { name: "--danger / --on-danger", value: "#d03538 / #fff", usage: "Бейдж", kind: "color" },
    {
      name: "--shadow-pop",
      value: "0 6px 20px · 0 1px 3px",
      usage: "Тень язычка и пузыря",
      kind: "shadow",
    },
    { name: "height · padding", value: "48 px · 0 8 0 6", usage: "Язычок", kind: "size" },
    {
      name: "radius",
      value: "16 0 0 16 px (пузырь --r-popover 12)",
      usage: "Язычок слева скруглён, справа прижат",
      kind: "radius",
    },
    {
      name: "--ds-agent-tab-y",
      value: "62 % высоты, от 80 до высота − 130 px",
      usage: "Положение по вертикали; сохраняется (ast-agt-y)",
      kind: "size",
    },
    { name: "peek", value: "translate 14 px → 0", usage: "Выглядывание и выезд", kind: "size" },
    {
      name: "z-index",
      value: "810",
      usage: "Над Dialog и Sheet 800, под Popover 900",
      kind: "other",
    },
    {
      name: "slide",
      value: "280 мс, --ease",
      usage: "translate язычка и max-width подписи",
      kind: "time",
    },
    {
      name: "dock",
      value: "300 мс, --ease (right)",
      usage: "Прилипание к панели; через 400 мс — без перехода, следом за ResizeObserver",
      kind: "time",
    },
    {
      name: "nod",
      value: "5 с, ease-in-out, бесконечно",
      usage: "Кивок знака (пик на 86–97 %)",
      kind: "time",
    },
    {
      name: "ping",
      value: "2,4 с, ease-out, бесконечно",
      usage: "Пульс бейджа: scale 1→2,1, opacity .55→0",
      kind: "time",
    },
    {
      name: "bubble",
      value: "350 мс --ease / 200 мс ease; 14 000 мс",
      usage: "Появление, уход, автозакрытие пузыря",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "hover",
      title: "Выезд по наведению",
      trigger: "курсор над язычком / фокус с клавиатуры",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 280,
          what: "Язычок сдвигается влево: translate 14 px → 0, становится виден целиком.",
          prop: "translate",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 280,
          what: "Подпись раскрывается: max-width 0 → 150 px, отступы по 6 px.",
          prop: "max-width, margin",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Подпись проявляется: opacity 0 → 1.",
          prop: "opacity",
          easing: "linear",
        },
        {
          at: 1500,
          dur: 125,
          what: "Нажатие: фон темнеет на 4 % ink.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 2500,
          dur: 280,
          what: "Курсор ушёл: язычок и подпись уходят обратно теми же переходами.",
          prop: "translate, max-width",
          easing: "--ease",
        },
      ],
      focus: "Выезд по фокусу работает так же (focus-visible); кольцо 2 px со смещением 2 px.",
      reducedMotion: "Выезд и раскрытие подписи без перехода; кивок знака выключен.",
      neighbours:
        "Язычок перекрывает край страницы (z-index 810), содержимое не двигает. Соседей нет: он один на край окна.",
      demo: <HoverDemo />,
    },
    {
      id: "bubble",
      title: "Пузырь над язычком",
      trigger: "через 2,8 с после загрузки (раз за сессию) либо у агента появилось предложение",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Пузырь вставляется в body: width 300, right 18 px, top = верх язычка − высота пузыря − 14 px, хвостик справа внизу.",
          prop: "top",
        },
        {
          at: 0,
          dur: 350,
          what: "Появление: opacity 0 → 1, scale .96 → 1, сдвиг вверх 10 px → 0.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 3500,
          dur: 200,
          what: "Закрытие (×, «Позже», либо через 14 000 мс): opacity → 0, сдвиг вниз 6 px.",
          prop: "opacity, translate",
          easing: "ease",
        },
        {
          at: 3700,
          dur: 0,
          what: "Узел удаляется. «Показать» делает то же, затем открывает панель агента, запускает первую подсказку и убирает бейдж.",
          prop: "—",
        },
      ],
      focus:
        "Фокус не забирает. [TODO] кнопки пузыря доступны по Tab, но порядок в странице не определён; Esc пузырь не закрывает (в макете нет).",
      reducedMotion: "Появление без сдвига и масштаба; пузырь по-прежнему закрывается через 14 с.",
      neighbours:
        "Пузырь поверх страницы (z-index 810), её не двигает. Не показывается, пока открыта панель агента; открытие панели закрывает его сразу.",
      demo: <BubbleDemo />,
    },
    {
      id: "dock",
      title: "Прилипание к панели и смена ширины",
      trigger: "нажатие на язычок / Ctrl J; кнопка «развернуть» панели",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Язычок получает «открыт»: знак, подпись и бейдж скрываются, шеврон вправо показывается; клип обрезает тень и грань справа.",
          prop: "display, clip-path",
        },
        {
          at: 0,
          dur: 300,
          what: "Панель выезжает справа (translate 100 % → 0), одновременно right язычка растёт от 0 до ширины панели (430). Одно время и одна кривая: кромка и язычок не расходятся.",
          prop: "translate (панель), right (язычок)",
          easing: "--ease",
        },
        {
          at: 400,
          dur: 0,
          what: "Через 400 мс язычок помечается tracking: переход right снимается, дальше его ведёт ResizeObserver покадрово.",
          prop: "transition",
        },
        {
          at: 1700,
          dur: 300,
          what: "«Развернуть» → wide: ширина панели 430 → 760, язычок идёт за кромкой каждый кадр.",
          prop: "width, right",
          easing: "--ease",
        },
        {
          at: 3200,
          dur: 200,
          what: "full: язычок получает data-hide: opacity 1 → 0, pointer-events off; затемнение под панелью тоже гаснет.",
          prop: "opacity",
          easing: "linear",
        },
        {
          at: 4700,
          dur: 300,
          what: "Обратно в panel: панель сужается, язычок возвращается (opacity 0 → 1) на кромку.",
          prop: "width, right, opacity",
          easing: "--ease",
        },
        {
          at: 6100,
          dur: 200,
          what: "Закрытие: панель уходит вправо, язычок возвращается на край окна: right → 0, знак и подпись возвращаются.",
          prop: "translate, right",
          easing: "--ease",
        },
      ],
      focus:
        "Фокус остаётся на язычке при нажатии мышью; при открытии с клавиатуры уходит в панель. При закрытии — на язычок.",
      reducedMotion:
        "Выезд панели, right язычка и смена ширины — без переходов: язычок и кромка встают сразу.",
      neighbours:
        "Панель (Sheet, z-index 800) под язычком (810). Бейдж и пузырь при открытой панели убираются. Страница под панелью затемнена.",
      demo: <DockDemo />,
    },
    {
      id: "drag",
      title: "Перетаскивание по вертикали",
      trigger: "нажатие на язычок и движение больше 4 px",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "pointerdown: запоминается начало, указатель захвачен язычком.",
          prop: "—",
        },
        {
          at: 0,
          dur: 280,
          what: "Сдвиг больше 4 px: язычок получает «drag» — выезжает полностью (translate 0), подпись раскрыта.",
          prop: "translate",
          easing: "--ease",
        },
        {
          at: 100,
          dur: 0,
          what: "Положение --tab-y следует за указателем без переходов; зажато в границы от 80 px до высота − 130 px.",
          prop: "top",
        },
        {
          at: 1000,
          dur: 0,
          what: "pointerup: «drag» снимается, положение сохраняется (localStorage ast-agt-y). Следующий click после перетаскивания гасится, панель не открывается.",
          prop: "—",
        },
        {
          at: 2800,
          dur: 0,
          what: "«Вернуть на место»: положение сбрасывается на 62 % высоты. Resize окна пересчитывает границы.",
          prop: "top",
        },
      ],
      focus:
        "Фокус не меняется; перетаскивание только мышью и касанием. [TODO] клавиатурного способа нет.",
      reducedMotion: "Не зависит от анимации; выезд при drag — мгновенный.",
      neighbours:
        "Другие элементы окна не реагируют; язычок перекрывает страницу по вертикали по пути.",
      demo: <DragDemo />,
    },
    {
      id: "hide",
      title: "Скрытие в полноэкранном режиме",
      trigger: "панель агента переведена в full / вернулась в panel",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 300,
          what: "Панель расширяется до 100 %: язычку нечем быть «кромкой».",
          prop: "width",
          easing: "--ease",
        },
        {
          at: 0,
          dur: 200,
          what: "Язычок: opacity 1 → 0, pointer-events none (data-hide).",
          prop: "opacity",
          easing: "linear",
        },
        {
          at: 1900,
          dur: 300,
          what: "Панель возвращается в panel: язычок возвращается на кромку, opacity 0 → 1.",
          prop: "opacity, right",
          easing: "--ease",
        },
      ],
      focus:
        "Язычок невидим и не кликается, но остаётся в DOM и Tab ловит его [TODO] добавить aria-hidden / tabindex=-1, пока data-hide.",
      reducedMotion: "Скрытие мгновенное.",
      neighbours: "В full у панели есть своя кнопка «Свернуть в панель» в шапке; язычок не нужен.",
      demo: <HideDemo />,
    },
  ],
  examples: [
    {
      id: "tab",
      title: "Язычок с предложением",
      demo: <TabExample />,
      code: `const [open, setOpen] = useState(false);

<AgentTab badge={1} hint="есть идея" open={open} onOpenChange={setOpen} />`,
    },
    {
      id: "bubble",
      title: "Пузырь-предложение",
      demo: <BubbleExample />,
      code: `const [shown, setShown] = useState(true);

<AgentTab y={y} badge={shown} hint="есть идея" />
<AgentBubble
  open={shown}
  onOpenChange={setShown}
  duration={Infinity}
  anchorY={y}
  actions={
    <>
      <Button size="sm" onClick={() => setShown(false)}>Показать</Button>
      <Button size="sm" variant="outline" onClick={() => setShown(false)}>Позже</Button>
    </>
  }
>
  Нашёл <b>8 грузов</b> с расхождениями. Показать?
</AgentBubble>`,
    },
  ],
});

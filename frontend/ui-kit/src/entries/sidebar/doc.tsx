/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useMemo, useState } from "react";
import { Marks, type MarkSpec } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { DemoSidebar, GROUPS, type SideForce, type SideGroup } from "./demo";

const SMALL: SideGroup[] = [GROUPS[1]];

const FULL = ".ds-side:not([data-rail])";
const ANATOMY_MARKS: MarkSpec[] = [
  { n: 1, anchor: FULL, side: "tl" },
  { n: 2, anchor: `${FULL} .ds-side__brand`, side: "r" },
  { n: 3, anchor: `${FULL} .ds-side__gt`, side: "r" },
  { n: 4, anchor: `${FULL} .ds-side__item[aria-current]`, side: "r" },
  { n: 5, anchor: `${FULL} .ds-side__item:not([aria-current]) .ds-side__cnt`, side: "r" },
  { n: 6, anchor: ".ds-side[data-rail] .ds-side__edge", side: "r" },
  { n: 7, anchor: ".ds-side__tip", side: "r" },
  { n: 8, anchor: `${FULL} .ds-side__foot`, side: "r" },
];

function AnatomyDemo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setTick(1), 80);
    return () => window.clearTimeout(t);
  }, []);
  // oxlint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => ANATOMY_MARKS.map((m) => ({ ...m })), [tick]);
  return (
    <Marks block items={items}>
      <div style={{ display: "grid", gap: 16 }}>
        <DemoSidebar height={470} defaultActive="inbox" />
        <DemoSidebar defaultRail height={240} groups={SMALL} hideFoot tipFor="layouts" />
      </div>
    </Marks>
  );
}

function CollapseDemo() {
  return (
    <Playback<{ r: boolean; f?: Record<string, SideForce>; tip?: string }>
      initial={{ r: false }}
      script={[
        { at: 400, set: { f: { trigger: "hover" } } },
        { at: 900, set: { f: { trigger: "active" } } },
        { at: 1000, set: { r: true, f: undefined } },
        { at: 2300, set: { tip: "layouts" } },
        { at: 3300, set: { tip: undefined } },
        { at: 3600, set: { r: false } },
      ]}
      tail={900}
      hint="Свернуть → подсказка у значка группы → развернуть. Ctrl+\ делает то же с клавиатуры."
      render={(s) => <DemoSidebar rail={s.r} force={s.f} tipFor={s.tip} height={470} />}
    />
  );
}

function GroupDemo() {
  return (
    <Playback<{ c: string[]; f?: Record<string, SideForce> }>
      initial={{ c: [] }}
      script={[
        { at: 400, set: { f: { layouts: "hover" } } },
        { at: 900, set: { c: ["layouts"], f: { layouts: "hover" } } },
        { at: 2000, set: { c: [], f: { layouts: "hover" } } },
        { at: 2800, set: { f: undefined } },
      ]}
      tail={700}
      hint="Заголовок группы сворачивает её; шеврон виден при наведении и у свёрнутой."
      render={(s) => <DemoSidebar closed={s.c} force={s.f} height={470} />}
    />
  );
}

function ItemDemo() {
  return (
    <Playback<{ a: string; f?: Record<string, SideForce> }>
      initial={{ a: "dash" }}
      script={[
        { at: 400, set: { f: { inbox: "hover" } } },
        { at: 1000, set: { f: { inbox: "active" } } },
        { at: 1200, set: { a: "inbox", f: undefined } },
        { at: 2300, set: { f: { settings: "focus" } } },
        { at: 2900, set: { a: "settings", f: undefined } },
      ]}
      tail={800}
      render={(s) => <DemoSidebar groups={SMALL} active={s.a} force={s.f} height={220} hideFoot />}
    />
  );
}

export default defineDoc({
  id: "sidebar",
  title: "Sidebar",
  group: "navigation",
  cssPrefix: "ds-side",
  order: 70,
  wideDemos: { variants: true, states: true },
  keywords: [
    "сайдбар",
    "sidebar",
    "боковое меню",
    "левое меню",
    "меню",
    "навигация",
    "navigation",
    "rail",
    "боковая панель",
    "collapsible",
    "рельс",
    "свернуть панель",
    "drawer",
    "nav",
  ],
  summary:
    "Сворачиваемая боковая панель разделов: группы, пункты со счётчиками, активный пункт, узкий rail-режим 56 px с подсказками.",
  purpose:
    "Сайдбар — главная навигация продукта: «Грузы», «Расхождения», «Настройки». Группы с заголовками делят разделы по смыслу и сворачиваются. Панель можно сузить до рельса (rail) на 56 px, чтобы вернуть ширину таблицам: тогда каждая группа превращается в значок с подсказкой, а клик по нему разворачивает панель обратно. Цвет панели нейтральный графит; navy есть только в логотипе, акцент — выбранный пункт.",
  related: ["topbar", "app-shell", "breadcrumb", "scroll-area"],
  anatomy: {
    demo: <AnatomyDemo />,
    parts: [
      {
        name: "Контейнер",
        description:
          "aside > nav aria-label «Разделы». Ширина 248 px (--w-side), в rail 56 (--w-rail), переход 300 мс. Фон --surface, справа линия --divider. Липкий под топбаром, высота — остаток экрана.",
      },
      {
        name: "Бренд",
        description:
          "Ячейка высотой 56 px (= топбар): логотип с названием; в rail остаётся только знак. Справа кнопка «Свернуть панель» (видна при наведении на панель). В оболочке бренд лежит в своей ячейке слева от топбара.",
      },
      {
        name: "Заголовок группы",
        description:
          "Кнопка 28 px, 600, --text-2: подпись, шеврон (при наведении и у свёрнутой), в rail — значок группы. aria-expanded.",
      },
      {
        name: "Пункт",
        description:
          'Ссылка 32 px, радиус 8, значок 16 px --text-3, подпись 500, зазор 10. Активный: подложка --selected с кольцом --border-selected, 600, значок --link, aria-current="page".',
      },
      {
        name: "Счётчик / метка",
        description:
          "Число справа, 12 px, --text-3, tabular-nums. Для срочного — тон err (--err-text, 600) или точка 8 px; [TODO] предложение, в макете только нейтральный счётчик.",
        optional: true,
      },
      {
        name: "Кромка (edge)",
        description:
          "Невидимая полоса 8 px у правого края в rail: клик разворачивает, при наведении показывает линию 2 px --focus.",
        optional: true,
      },
      {
        name: "Подсказка rail",
        description:
          "Справа от значка группы: имя группы (и сочетание клавиш у кнопки). Только в rail.",
        optional: true,
      },
      {
        name: "Низ панели",
        description: "«Справка»: пункт без группы; в rail скрыт.",
        optional: true,
      },
    ],
  },
  variants: [
    {
      id: "expanded",
      title: "Развёрнутый",
      description: "248 px: значки и подписи пунктов, заголовки групп, счётчики. Основной режим.",
      when: "по умолчанию, на экранах шире 1280 px и при навигации по большому числу разделов.",
      demo: <DemoSidebar height={470} defaultActive="cargo" />,
    },
    {
      id: "rail",
      title: "Rail · 56 px",
      description:
        "Остались значки групп; подписи и пункты скрыты. Группа с активным пунктом подсвечена selected-подложкой, значок --link. Подсказка справа.",
      when: "таблицы и широкие экраны данных; выбор запоминается (localStorage, ключ ast-rail) и переживает перезагрузку.",
      demo: <DemoSidebar defaultRail height={470} tipFor="layouts" defaultActive="inbox" />,
    },
    {
      id: "closed",
      title: "С свёрнутой группой",
      description: "Шеврон повёрнут на −90° и виден всегда, пункты группы скрыты.",
      when: "редко нужные группы; состояние хранится на сессию. [TODO] макет не сохраняет свёрнутость между сессиями.",
      demo: <DemoSidebar defaultClosed={["layouts"]} height={470} />,
    },
  ],
  sizes: [
    {
      id: "full",
      title: "Развёрнутый",
      value: "248 px",
      note: "--w-side",
      demo: <DemoSidebar height={200} groups={SMALL} hideFoot />,
    },
    {
      id: "rail",
      title: "Rail",
      value: "56 px",
      note: "--w-rail; значок 16 px по центру",
      demo: <DemoSidebar defaultRail height={200} groups={SMALL} hideFoot />,
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Item · default",
      note: "Подпись --text-2, 500, значок --text-3, без подложки.",
      demo: <DemoSidebar groups={SMALL} height={240} hideFoot defaultActive="dash" />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Item · hover",
      note: "Слой 4 % (--layer-1), подпись --text. У заголовка группы тот же слой и виден шеврон.",
      forced: true,
      demo: (
        <DemoSidebar
          groups={SMALL}
          height={240}
          hideFoot
          defaultActive="dash"
          force={{ settings: "hover" }}
        />
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Item · active",
      note: "Слой 7 % (--layer-1p), пока пункт нажат.",
      forced: true,
      demo: (
        <DemoSidebar
          groups={SMALL}
          height={240}
          hideFoot
          defaultActive="dash"
          force={{ settings: "active" }}
        />
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Item · focus",
      note: "Кольцо 2 px --focus внутри пункта (offset −2): панель с overflow его не обрезает.",
      forced: true,
      demo: (
        <DemoSidebar
          groups={SMALL}
          height={240}
          hideFoot
          defaultActive="dash"
          force={{ settings: "focus" }}
        />
      ),
    },
    {
      id: "current",
      kind: "selected",
      title: "Current (активный)",
      note: 'aria-current="page": подложка --selected, кольцо --border-selected, 600, значок --link.',
      demo: <DemoSidebar groups={SMALL} height={240} hideFoot defaultActive="inbox" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Раздел недоступен по тарифу или правам: --text-ph, не фокусируется, подсказка с причиной [TODO] предложение; в макете нет.",
      demo: (
        <DemoSidebar
          hideFoot
          height={240}
          defaultActive="dash"
          groups={[
            {
              ...GROUPS[1],
              items: [
                GROUPS[1].items[0],
                { ...GROUPS[1].items[1], disabled: true },
                GROUPS[1].items[2],
              ],
            },
          ]}
        />
      ),
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Счётчик ещё считается: пульсирующая капсула 20×12 на месте числа. Сам пункт активен. [TODO] предложение.",
      demo: (
        <DemoSidebar
          hideFoot
          height={240}
          defaultActive="dash"
          groups={[
            {
              ...GROUPS[1],
              items: [
                GROUPS[1].items[0],
                { ...GROUPS[1].items[1], count: "loading" },
                GROUPS[1].items[2],
              ],
            },
          ]}
        />
      ),
    },
    {
      id: "error",
      kind: "error",
      title: "Error / внимание",
      note: "Счётчик в тоне err (--err-text, 600) или красная точка 8 px: раздел требует решения. Цвет пункта не меняется. [TODO] предложение.",
      demo: (
        <DemoSidebar
          hideFoot
          height={240}
          defaultActive="dash"
          groups={[
            {
              ...GROUPS[1],
              items: [
                GROUPS[1].items[0],
                { ...GROUPS[1].items[1], tone: "err" },
                { ...GROUPS[1].items[2], count: undefined, dot: true },
              ],
            },
          ]}
        />
      ),
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty",
      note: "Группа без доступных пунктов не показывается вовсе (ни заголовок, ни значок в rail). Целиком пустой сайдбар — признак ошибки прав, а не состояние компонента.",
      notApplicable: true,
    },
    {
      id: "rail-tip",
      kind: "other",
      title: "Rail · подсказка",
      note: "Подсказка справа от значка группы, без задержки; шрифт 12 px, 600.",
      demo: <DemoSidebar defaultRail height={200} groups={SMALL} hideFoot tipFor="layouts" />,
    },
  ],
  rules: {
    use: [
      "Группы по смыслу работы («Экран», «Документы»), 3–7 пунктов в группе.",
      "Подписи как в крошках и в заголовках страниц; значок один на пункт.",
      "Активный пункт один; у группы с активным пунктом в rail подсвечен значок.",
      "Счётчик — только если число помогает решить, куда идти; срочные выделяйте тоном err.",
      "В rail каждая группа получает подсказку; клик по значку разворачивает панель.",
    ],
    avoid: [
      "Левая акцентная полоска у активного пункта: акцент — подложка и кольцо.",
      "Цветные значки и цветные подписи пунктов: панель нейтральная, navy — только логотип.",
      "Вложенные подменю в сайдбаре: максимум два уровня (группа → пункт).",
      "Прятать пункты, которых нет у пользователя, в разных местах по-разному: либо disabled, либо нет.",
      "Автоматически сворачивать в rail на любом экране: размер выбирает человек.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: 'nav aria-label="Разделы"',
      text: 'Ориентир навигации. Текущий пункт — aria-current="page". Заголовки групп — кнопки с aria-expanded; у rail-кнопки и кромки aria-label «Развернуть панель».',
    },
    {
      kind: "aria",
      title: "inert у скрытого",
      text: "Пункты свёрнутой группы и все пункты в rail получают inert: невидимые ссылки не берут фокус. [TODO] в макете скрыто только высотой, пункты остаются в порядке Tab; исправлено в словаре.",
    },
    {
      kind: "aria",
      title: "Подсказка rail",
      text: 'role="tooltip", у кнопки у группы есть aria-label — скринридер читает имя и без подсказки. Подсказка не единственный носитель названия.',
    },
    {
      kind: "key",
      title: "Tab, Enter",
      text: "Идут по кнопке бренда, заголовкам и пунктам. Enter на заголовке сворачивает группу (в rail — разворачивает панель).",
    },
    {
      kind: "key",
      title: "Ctrl + \\",
      text: "Сворачивает и разворачивает панель из любого места страницы (есть в макете).",
    },
    {
      kind: "key",
      title: "↑ / ↓ по пунктам",
      text: "[TODO] предложение: стрелки внутри группы. В макете только Tab.",
    },
    {
      kind: "focus",
      title: "Куда идёт фокус",
      text: "При сворачивании в rail остаётся на кнопке-триггере (меняется только её aria-label). При клике по значку группы в rail панель разворачивается, фокус остаётся на этой группе. Пункты свёрнутых групп из Tab выходят.",
    },
    {
      kind: "contrast",
      title: "Контраст",
      text: "--text-2 на --surface 8,2:1; --text-3 значков 4,9:1; активный --text на подложке selected ≈ 13:1, значок --link на selected ≈ 4,6:1. Счётчик err: --err-text 5,5:1.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Ширина панели, прозрачность подписей, поворот шевронов и высота групп меняются мгновенно.",
    },
  ],
  tokens: [
    {
      name: "--w-side / --w-rail",
      value: "248 / 56 px",
      usage: "Ширина развёрнутой и rail",
      kind: "size",
    },
    { name: "--h-bar", value: "56 px", usage: "Высота бренда (= топбар)", kind: "size" },
    {
      name: "--h-md / --h-sm",
      value: "32 / 28 px",
      usage: "Пункт · заголовок группы",
      kind: "size",
    },
    {
      name: "--surface / --divider",
      value: "#fff / #e0e4e9",
      usage: "Фон панели · линия справа и под брендом",
      kind: "color",
    },
    {
      name: "--text-2 / --text-3",
      value: "#44505d / #66727f",
      usage: "Подпись · значок и счётчик",
      kind: "color",
    },
    {
      name: "--layer-1 / --layer-1p",
      value: "4 % / 7 % ink",
      usage: "Hover и active пункта и группы",
      kind: "color",
    },
    {
      name: "--selected / --border-selected",
      value: "teal 15 % / 60 %",
      usage: "Активный пункт, группа в rail",
      kind: "color",
    },
    { name: "--link", value: "#007f7a / teal", usage: "Значок активного пункта", kind: "color" },
    {
      name: "--err-text / --danger",
      value: "#c92a2a / #d03538",
      usage: "Тон счётчика и точка внимания",
      kind: "color",
    },
    {
      name: "--r-item / --r-control",
      value: "8 / 4 px",
      usage: "Пункт · заголовок группы",
      kind: "radius",
    },
    {
      name: "--dur-s · --glide",
      value: "300 мс · cubic-bezier(.4,0,.2,1)",
      usage: "Ширина панели, значок группы, отступ между группами",
      kind: "ease",
    },
    {
      name: "--dur · --ease",
      value: "200 мс · cubic-bezier(.6,0,.05,.95)",
      usage: "Высота групп, поворот шеврона, логотип/знак, низ панели",
      kind: "ease",
    },
    { name: "--dur-f", value: "125 мс", usage: "Подложка hover, подпись группы", kind: "time" },
  ],
  choreography: [
    {
      id: "collapse",
      title: "Сворачивание в rail и обратно",
      trigger: "кнопка «Свернуть панель», Ctrl+\\ или клик по группе / кромке в rail",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение на панель: кнопка-триггер проявляется (opacity 0→1 за 200 мс); hover и нажатие на ней — слои 8,8 % и 11,2 %.",
          prop: "opacity, background",
          easing: "--dur",
        },
        {
          at: 600,
          dur: 300,
          what: "Ширина панели и бренда 248 → 56 px.",
          prop: "width",
          easing: "--glide",
        },
        {
          at: 600,
          dur: 200,
          what: "Логотип с названием гаснет, знак проявляется (в rail при наведении на панель знак прячется, а триггер виден).",
          prop: "opacity",
          easing: "--dur",
        },
        {
          at: 600,
          dur: 125,
          what: "Подписи и шевроны групп гаснут.",
          prop: "opacity",
          easing: "--dur-f",
        },
        {
          at: 600,
          dur: 300,
          what: "Значки групп проявляются (на месте подписи, слева 12 px).",
          prop: "opacity",
          easing: "--glide",
        },
        {
          at: 600,
          dur: 200,
          what: "Списки пунктов сворачиваются: grid-template-rows 1fr→0fr.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        {
          at: 600,
          dur: 300,
          what: "Отступ между группами 14 → 2 px.",
          prop: "padding-top",
          easing: "--glide",
        },
        {
          at: 600,
          dur: 200,
          what: "Низ («Справка») гаснет, затем скрывается visibility.",
          prop: "opacity, visibility",
          easing: "--dur",
        },
        {
          at: 600,
          dur: 0,
          what: "aria-label триггера «Свернуть панель» → «Развернуть панель», значок кнопки меняется; пункты получают inert.",
          prop: "aria-label, inert",
        },
        {
          at: 1700,
          dur: 125,
          what: "Наведение на значок группы: справа подсказка с названием группы (появление 125 мс: opacity 0→1, scale .96→1).",
          prop: "opacity, scale",
          easing: "--ease",
        },
        { at: 2700, dur: 0, what: "Уход указателя убирает подсказку мгновенно.", prop: "—" },
        {
          at: 3000,
          dur: 300,
          what: "Разворачивание идёт теми же шагами в обратную сторону за те же 300 мс; пункты снова доступны.",
          prop: "width, opacity, grid-template-rows",
          easing: "--glide",
        },
      ],
      focus:
        "На кнопке-триггере (меняется только aria-label). При клике по значку группы или кромке в rail панель разворачивается, фокус остаётся на нажатом элементе.",
      reducedMotion:
        "Панель переключается между 248 и 56 px мгновенно; прозрачности и высоты меняются без переходов.",
      neighbours:
        "Контент справа не сдвигается отдельно: колонка оболочки auto просто становится уже, и страница перестраивается каждый кадр. Таблицы получают ширину сразу; крошки и поиск в топбаре остаются на месте. Выбор запоминается (ключ ast-rail).",
      demo: <CollapseDemo />,
    },
    {
      id: "group",
      title: "Сворачивание группы",
      trigger: "клик или Enter по заголовку группы",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: слой 4 % на заголовке, шеврон проявляется.",
          prop: "background, opacity",
          easing: "--dur-f",
        },
        {
          at: 500,
          dur: 200,
          what: "Список пунктов сворачивается: grid-template-rows 1fr→0fr.",
          prop: "grid-template-rows",
          easing: "--ease",
        },
        {
          at: 500,
          dur: 200,
          what: "Шеврон поворачивается на −90° и остаётся видимым.",
          prop: "transform",
          easing: "--ease",
        },
        {
          at: 500,
          dur: 0,
          what: "aria-expanded=false, inert у списка.",
          prop: "aria-expanded, inert",
        },
        {
          at: 1600,
          dur: 200,
          what: "Повторный клик: список раскрывается, шеврон поворачивается обратно и гаснет, если курсор ушёл.",
          prop: "grid-template-rows, transform",
          easing: "--ease",
        },
      ],
      focus: "Остаётся на заголовке группы.",
      reducedMotion: "Высота и шеврон меняются мгновенно.",
      neighbours:
        "Группы ниже сдвигаются вверх вслед за высотой; отступ 14 px между группами сохраняется.",
      demo: <GroupDemo />,
    },
    {
      id: "item",
      title: "Выбор пункта",
      trigger: "клик по пункту (переход на раздел)",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: слой 4 %, подпись --text.",
          prop: "background, color",
          easing: "--dur-f",
        },
        { at: 600, dur: 125, what: "Нажатие: слой 7 %.", prop: "background", easing: "--dur-f" },
        {
          at: 800,
          dur: 0,
          what: "aria-current переходит на новый пункт: подложка selected, кольцо и 600 у нового; у прежнего всё снимается. В макете смена мгновенна: transition есть только у подложки hover.",
          prop: "aria-current",
        },
        {
          at: 800,
          dur: 0,
          what: "Страница сменяется, крошки в топбаре пересчитываются, прокрутка страницы сбрасывается вверх.",
          prop: "—",
        },
      ],
      focus:
        "Остаётся на нажатом пункте до перехода; после навигации — по правилам страницы (заголовок или начало контента). [TODO] проверить, куда идёт фокус после смены страницы в ui-kit.",
      reducedMotion: "Hover без перехода.",
      neighbours:
        "Другие пункты и группы не реагируют; панель не прокручивается автоматически, кроме случая, когда активный пункт вне видимой части: тогда его прокручивают в область (scrollIntoView block: nearest) [TODO].",
      demo: <ItemDemo />,
    },
  ],
  examples: [
    {
      id: "app",
      title: "Панель оболочки",
      demo: <DemoSidebar height={470} defaultActive="cargo" />,
      code: `<Sidebar
  rail={rail}
  onRailChange={setRail}
  active="inbox"
  brand={<Logo />}
  brandMark={<LogoMark />}
  groups={[
    {
      id: "layouts",
      title: "Макеты",
      icon: <GridIcon />,
      items: [
        { id: "dash", label: "Дашборд", icon: <ChartIcon />, href: "/dash" },
        { id: "inbox", label: "Расхождения", icon: <WarnIcon />, href: "/inbox", count: 8 },
      ],
    },
  ]}
  footerItems={[{ id: "help", label: "Справка", icon: <HelpIcon /> }]}
/>`,
    },
    {
      id: "rail",
      title: "Rail с подсказкой",
      demo: <DemoSidebar defaultRail height={470} tipFor="screen" />,
      code: `<Sidebar defaultRail storageKey="astronaut:sidebar" groups={groups} />`,
    },
  ],
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Marks } from "@/engine/Callout";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import { Chips, DemoScrollArea, Rows, WideTable } from "./demo";

const W = { width: "100%", maxWidth: 340 } as const;

function FadeDemo() {
  return (
    <Playback<{ p: "top" | "mid" | "end" }>
      initial={{ p: "top" }}
      script={[
        { at: 700, set: { p: "mid" } },
        { at: 1700, set: { p: "end" } },
        { at: 2700, set: { p: "top" } },
      ]}
      tail={800}
      hint="Сверху затухания нет, в середине есть с обеих сторон, внизу пропадает нижнее."
      render={(s) => (
        <div style={W}>
          <DemoScrollArea start={s.p} height={170} />
        </div>
      )}
    />
  );
}

function HoverDemo() {
  return (
    <Playback<{ f?: "hover" | "focus" }>
      initial={{}}
      script={[
        { at: 500, set: { f: "hover" } },
        { at: 1700, set: { f: "focus" } },
        { at: 2800, set: { f: undefined } },
      ]}
      tail={600}
      render={(s) => (
        <div style={W}>
          <DemoScrollArea start="mid" height={170} force={s.f} />
        </div>
      )}
    />
  );
}

function HorizontalDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 0 }}
      script={[{ at: 400, set: { n: 1 } }]}
      tail={600}
      hint="Тяните ряд чипов пальцем или колесом при зажатом Shift: левый край начнёт затухать."
      render={() => (
        <div style={W}>
          <DemoScrollArea dir="h" />
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "scroll-area",
  title: "ScrollArea",
  group: "navigation",
  cssPrefix: "ds-scroll",
  order: 50,
  keywords: [
    "прокрутка",
    "скролл",
    "скроллбар",
    "полоса прокрутки",
    "scroll",
    "scroll area",
    "scrollbar",
    "overflow",
    "затухание",
    "fade",
    "полоса",
    "viewport",
  ],
  summary:
    "Кастомная прокрутка: тонкая полоса, затухание краёв там, где есть что прокручивать, три направления.",
  purpose:
    "Область с ограниченной высотой или шириной, содержимое которой прокручивается внутри себя: список грузов в панели, ряд чипов-фильтров, широкая таблица. Тонкая полоса не крадёт ширину, а мягкий край подсказывает, что за ним есть ещё. Полоса остаётся родной (scrollbar-width: thin): клавиатура, колесо и жесты работают как у браузера.",
  related: ["tabs", "separator", "app-shell", "sidebar"],
  anatomy: {
    demo: (
      <Marks
        block
        items={[
          { n: 1, anchor: ".ds-scroll", side: "tl" },
          { n: 2, anchor: ".ds-scroll__vp", side: "t" },
          { n: 3, anchor: ".ds-scroll__rows", side: "l" },
          { n: 4, anchor: ".ds-scroll__vp", side: "r" },
          { n: 5, anchor: ".ds-scroll__vp", side: "b" },
        ]}
      >
        <DemoScrollArea start="mid" height={170} />
      </Marks>
    ),
    parts: [
      {
        name: "Рамка",
        description:
          "Контейнер с радиусом 8 и кольцом 1px --divider, фон --surface. Держит радиус для всего, что внутри.",
      },
      {
        name: "Окно (viewport)",
        description:
          "Элемент с overflow и max-height (или max-width). tabindex=0 и role=region с aria-label, чтобы прокручиваться стрелками.",
      },
      {
        name: "Содержимое",
        description: "Ряды, чипы или таблица. Отступы задаёт содержимое, а не окно.",
      },
      {
        name: "Полоса",
        description:
          "Тонкая (thin), ползунок --border, при наведении --text-ph; дорожка прозрачная. У горизонтальной одиночной полосы нет совсем.",
      },
      {
        name: "Затухание края",
        description:
          "Маска-градиент 24 px сверху и снизу (28 px слева и справа). Появляется только со стороны, куда ещё можно прокрутить.",
      },
    ],
  },
  variants: [
    {
      id: "vertical",
      title: "Вертикальная",
      description: "max-height по месту, полоса справа, затухание сверху и снизу.",
      when: "списки в панелях: расхождения, документы, участники.",
      demo: (
        <div style={W}>
          <DemoScrollArea height={170} />
        </div>
      ),
    },
    {
      id: "horizontal",
      title: "Горизонтальная",
      description:
        "Ряд чипов: полоса скрыта (scrollbar-width: none), затухание слева и справа 28 px.",
      when: "фильтры-чипы, вкладки в узкой панели. Пользователь тянет жестом или колесом с Shift.",
      demo: (
        <div style={W}>
          <DemoScrollArea dir="h">
            <Chips />
          </DemoScrollArea>
        </div>
      ),
    },
    {
      id: "both",
      title: "В обе стороны",
      description:
        "Широкая таблица: обе полосы видны (потемнее при наведении), затухания нет: заголовок таблицы должен оставаться читаемым.",
      when: "таблицы шире экрана. Шапку таблицы закрепляют (sticky top).",
      demo: (
        <div style={W}>
          <DemoScrollArea dir="b" height={150}>
            <WideTable />
          </DemoScrollArea>
        </div>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Top (начало)",
      note: "Полоса светлая (--border), затухание только снизу.",
      demo: (
        <div style={W}>
          <DemoScrollArea height={130} />
        </div>
      ),
    },
    {
      id: "mid",
      kind: "other",
      title: "Middle",
      note: "Содержимое со всех сторон: затухание сверху и снизу.",
      demo: (
        <div style={W}>
          <DemoScrollArea height={130} start="mid" />
        </div>
      ),
    },
    {
      id: "end",
      kind: "other",
      title: "End (конец)",
      note: "Нижнее затухание снято: последний ряд виден целиком.",
      demo: (
        <div style={W}>
          <DemoScrollArea height={130} start="end" />
        </div>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Ползунок темнее (--text-ph). [TODO] макет красит только сам ползунок при наведении на него; здесь — при наведении на область, потому что браузеры не дают стилизовать ползунок.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoScrollArea height={130} start="mid" force="hover" />
        </div>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Кольцо 2 px --focus внутри рамки (offset −2): область прокручивается стрелками, PageUp/PageDown, Home/End.",
      forced: true,
      demo: (
        <div style={W}>
          <DemoScrollArea height={130} start="mid" force="focus" />
        </div>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нет собственного нажатого вида: перетаскивание ползунка рисует браузер.",
      notApplicable: true,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Нет: недоступное содержимое делают неактивным само, прокрутка остаётся.",
      notApplicable: true,
    },
    {
      id: "loading",
      kind: "loading",
      title: "Loading",
      note: "Внутри показывают Skeleton или Spinner; прокрутка не блокируется. Дозагрузку («ещё 20») добавляют в конец ряда. [TODO] предложение.",
      notApplicable: true,
    },
    {
      id: "error",
      kind: "error",
      title: "Error",
      note: "Нет: ошибка загрузки — плашка внутри содержимого.",
      notApplicable: true,
    },
    {
      id: "empty",
      kind: "empty",
      title: "Empty / короткое содержимое",
      note: "Нечего прокручивать: полосы и затухания нет. Пустое состояние рисует содержимое.",
      demo: (
        <div style={W}>
          <DemoScrollArea height={170}>
            <Rows count={2} />
          </DemoScrollArea>
        </div>
      ),
    },
  ],
  rules: {
    use: [
      "Ограничивайте высоту окна по месту (панель, карточка); внешняя страница остаётся страницей.",
      "Горизонтально прокручивайте только ряд чипов и широкие таблицы.",
      "overscroll-behavior: contain: достигнув края, прокрутка не передаётся странице.",
      "Давайте окну aria-label и tabindex=0, если внутри нет фокусируемых элементов.",
      "У таблицы шапку закрепляйте (sticky), у списка — нет.",
    ],
    avoid: [
      "Вложенные прокручиваемые области: палец и колесо застревают.",
      "Скрывать полосу у вертикального списка: пользователь не поймёт, что есть ещё.",
      "Рисовать свою полосу на div: теряются клавиатура, жесты и доступность.",
      "Затухание у шапки таблицы или заголовка: маска съест текст.",
      "Высота окна в 100vh без вычета шапки: двойная прокрутка.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=region + aria-label",
      text: "Окно прокрутки получает название («Список грузов»): скринридер сообщает, что это область.",
    },
    {
      kind: "key",
      title: "Стрелки, PageUp/PageDown, Home/End",
      text: "Родные: окно прокручивается, если оно в фокусе (tabindex=0). Своих горячих клавиш нет.",
    },
    {
      kind: "key",
      title: "Shift + колесо",
      text: "Горизонтальная прокрутка колесом; ряд чипов также прокручивается Tab: фокус на чипе подтягивает его в область.",
    },
    {
      kind: "focus",
      title: "Кольцо",
      text: "2 px --focus внутри рамки (outline-offset −2): рамка с радиусом не обрезает кольцо.",
    },
    {
      kind: "contrast",
      title: "Полоса",
      text: "Ползунок --border на --surface 1,7:1: для не несущей смысла полосы допустимо, при hover --text-ph темнее. Затухание не должно перекрывать текст, который нужно прочесть: отступы 24/28 px.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление и исчезновение затухания (125 мс) отключается: край меняется сразу. Плавную прокрутку scroll-behavior не включаем вовсе.",
    },
  ],
  tokens: [
    {
      name: "--border / --text-ph",
      value: "#c6cdd6 / #8792a0",
      usage: "Ползунок · при hover",
      kind: "color",
    },
    { name: "--divider", value: "#e0e4e9", usage: "Кольцо рамки", kind: "color" },
    { name: "--r-item", value: "8 px", usage: "Радиус рамки", kind: "radius" },
    { name: "scrollbar-width", value: "thin", usage: "Тонкая полоса", kind: "size" },
    {
      name: "--ds-scroll-ft / fb",
      value: "0 → 24 px",
      usage: "Высота затухания сверху и снизу",
      kind: "size",
    },
    {
      name: "--ds-scroll-fl / fr",
      value: "0 → 28 px",
      usage: "Ширина затухания слева и справа",
      kind: "size",
    },
    {
      name: "--dur-f",
      value: "125 мс",
      usage: "Появление затухания (предложение, @property)",
      kind: "time",
    },
    {
      name: "max-height",
      value: "по месту, 150–220 px",
      usage: "Окно (--h в макете: 200 / 150)",
      kind: "size",
    },
  ],
  choreography: [
    {
      id: "fade",
      title: "Затухание краёв при прокрутке",
      trigger: "пользователь прокручивает содержимое",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Окно в начале: верхнее затухание 0, нижнее 24 px — виден «хвост».",
          prop: "--ds-scroll-fb",
        },
        {
          at: 700,
          dur: 125,
          what: "Прокрутка > 2 px: верхнее затухание вырастает до 24 px. В макете значение меняется скачком; плавность через @property — [TODO] предложение.",
          prop: "--ds-scroll-ft",
          easing: "ease",
        },
        {
          at: 1700,
          dur: 125,
          what: "До конца < 2 px: нижнее затухание уходит в 0, последний ряд виден целиком.",
          prop: "--ds-scroll-fb",
          easing: "ease",
        },
        {
          at: 2700,
          dur: 125,
          what: "Возврат вверх: верхнее затухание снимается, нижнее возвращается.",
          prop: "--ds-scroll-ft, --ds-scroll-fb",
          easing: "ease",
        },
      ],
      focus: "Не меняется. Если фокус на самом окне, кольцо остаётся на месте.",
      reducedMotion: "Края меняются мгновенно, без 125 мс.",
      neighbours:
        "Затухание рисует маска на самом окне: рамка, соседние блоки и тени не затрагиваются.",
      demo: <FadeDemo />,
    },
    {
      id: "hover",
      title: "Наведение и фокус",
      trigger: "указатель над областью, затем Tab на окно",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Указатель над областью: ползунок темнеет до --text-ph. [TODO] в макете — только при наведении на сам ползунок.",
          prop: "scrollbar-color",
        },
        {
          at: 1200,
          dur: 0,
          what: "Tab: на окне кольцо фокуса 2 px (внутри рамки); стрелки прокручивают.",
          prop: "outline",
        },
        {
          at: 2300,
          dur: 0,
          what: "Уход фокуса и указателя: возврат к спокойному виду.",
          prop: "—",
        },
      ],
      focus:
        "Окно получает фокус как один элемент; внутри него Tab идёт по фокусируемым элементам содержимого.",
      reducedMotion: "Анимации нет.",
      neighbours: "Соседние блоки не реагируют.",
      demo: <HoverDemo />,
    },
    {
      id: "horizontal",
      title: "Горизонтальный ряд",
      trigger: "жест, колесо с Shift, Tab по чипам",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Ряд в начале: левое затухание 0, правое 28 px.",
          prop: "--ds-scroll-fr",
        },
        {
          at: 0,
          dur: 125,
          what: "После сдвига > 2 px левое затухание растёт до 28 px; у конца правое снимается.",
          prop: "--ds-scroll-fl, --ds-scroll-fr",
          easing: "ease",
        },
        {
          at: 0,
          dur: 0,
          what: "Полоса скрыта всегда: прокрутку подсказывает только затухание.",
          prop: "scrollbar-width",
        },
      ],
      focus: "Tab на скрытый чип подтягивает его в видимую часть, затухание пересчитывается.",
      reducedMotion: "Края меняются мгновенно.",
      neighbours: "Чипы не меняют размер; ряд не переносится, ширина по содержимому (max-content).",
      demo: <HorizontalDemo />,
    },
  ],
  examples: [
    {
      id: "list",
      title: "Список в панели",
      demo: (
        <div style={W}>
          <DemoScrollArea height={170} />
        </div>
      ),
      code: `<ScrollArea direction="vertical" maxHeight={200} aria-label="Список грузов">…</ScrollArea>`,
    },
    {
      id: "chips",
      title: "Ряд фильтров",
      demo: (
        <div style={W}>
          <DemoScrollArea dir="h" />
        </div>
      ),
      code: `<ScrollArea direction="horizontal"><ChipRow>…</ChipRow></ScrollArea>`,
    },
  ],
});

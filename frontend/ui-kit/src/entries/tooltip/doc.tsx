/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- обёртка отключённой кнопки фокусируется, чтобы показать причину недоступности */
import { Marks } from "@/engine/Callout";
import { Icon } from "@/engine/Icon";
import { Playback } from "@/engine/Playback";
import { defineDoc, type StateSpec } from "@/engine/types";
import { DemoTip, TipButton, TooltipCard, WhyTip } from "./demo";

const NA = (id: string, kind: StateSpec["kind"], title: string, note: string): StateSpec => ({
  id,
  kind,
  title,
  note,
  notApplicable: true,
});

const Stage = ({ children, cross }: { children: React.ReactNode; cross?: boolean }) => (
  <div className={`ds-tooltip-stage${cross ? " ds-tooltip-stage--cross" : ""}`}>{children}</div>
);

function ShowDemo() {
  return (
    <Playback<{ f?: "hover"; gone?: boolean }>
      initial={{}}
      script={[
        { at: 500, set: { f: "hover" } },
        { at: 2600, set: { f: undefined } },
      ]}
      tail={800}
      hint="В макете подсказка появляется сразу при наведении и уходит сразу при уходе курсора."
      render={(s) => (
        <Stage>
          <DemoTip text="Создать груз" kbd="Ctrl N" side="bottom" force={s.f}>
            {(d) => (
              <TipButton describedBy={d} variant="primary" force={s.f}>
                <Icon name="plus" size="sm" />
                Новый груз
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      )}
    />
  );
}

function PressDemo() {
  return (
    <Playback<{ st: "idle" | "hover" | "active" }>
      initial={{ st: "idle" }}
      script={[
        { at: 400, set: { st: "hover" } },
        { at: 1700, set: { st: "active" } },
        { at: 2400, set: { st: "idle" } },
      ]}
      tail={600}
      hint="Нажатие гасит подсказку: она не должна закрывать то, что открывается кнопкой."
      render={(s) => (
        <Stage>
          <DemoTip
            text="Скачать выписку"
            side="bottom"
            force={s.st === "hover" ? "hover" : undefined}
          >
            {(d) => (
              <TipButton
                describedBy={d}
                variant="ghost"
                size="md"
                square
                label="Скачать"
                force={s.st === "active" ? "active" : s.st === "hover" ? "hover" : undefined}
              >
                <Icon name="dl" />
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      )}
    />
  );
}

export default defineDoc({
  id: "tooltip",
  title: "Tooltip",
  group: "overlays",
  cssPrefix: "ds-tooltip",
  order: 10,
  keywords: [
    "подсказка",
    "всплывающая подсказка",
    "тултип",
    "тулстип",
    "хинт",
    "при наведении",
    "tooltip",
    "hint",
    "title",
    "hover",
    "tip",
  ],
  summary:
    "Короткая подсказка к элементу при наведении и фокусе: название кнопки-значка, сочетание клавиш, причина недоступности. Карточка на surface, четыре стороны.",
  purpose:
    "Tooltip называет элемент, у которого нет подписи, и повторяет подпись с горячей клавишей. Он не содержит ссылок, кнопок и форм и не несёт единственную копию важной информации: на тач-экране наведения нет. Больше текста, действия или форма — Popover.",
  related: ["popover", "button", "toast"],
  anatomy: {
    demo: (
      <Stage>
        <Marks
          items={[
            { n: 1, anchor: ".ds-tooltip", side: "t" },
            { n: 2, anchor: ".ds-tooltip__text", side: "l" },
            { n: 3, anchor: ".ds-tooltip__kbd", side: "r" },
            { n: 4, anchor: ".ds-btn", side: "b" },
          ]}
        >
          <span
            className="ds-tooltip__anat"
            style={{ display: "inline-flex", flexDirection: "column", gap: 10 }}
          >
            <TooltipCard kbd="Ctrl N">Создать груз</TooltipCard>
            <TipButton describedBy="">
              <Icon name="plus" size="sm" />
              Новый груз
            </TipButton>
          </span>
        </Marks>
      </Stage>
    ),
    parts: [
      {
        name: "Карточка",
        description:
          "Фон --surface, кольцо 1px --border, тень --shadow-pop, радиус --r-card (10), отступы 6 × 10, 12 px, вес 600.",
      },
      {
        name: "Текст",
        description:
          "Одна фраза: название действия или причина. Не шире 36 символов, дальше переносится по словам.",
      },
      {
        name: "Сочетание клавиш",
        description: "11 px, вес 400, --text-3, справа через 8 px: «Ctrl N», «R».",
        optional: true,
      },
      {
        name: "Якорь",
        description: "Элемент, к которому относится подсказка; связь через aria-describedby.",
      },
    ],
  },
  variants: [
    {
      id: "sides",
      title: "Стороны",
      wide: true,
      description:
        "top · right · bottom · left. Отступ от якоря 6 px (4 px снизу); у края окна разворачивается в противоположную сторону и ужимается на 8 px от краёв.",
      when: "по умолчанию снизу; сверху — у нижнего края окна; справа — у свёрнутого бокового меню.",
      demo: (
        <Stage cross>
          {(["top", "right", "bottom", "left"] as const).map((s) => (
            <DemoTip key={s} text="Подсказка" side={s} force="hover">
              {(d) => (
                <TipButton describedBy={d}>
                  {{ top: "Сверху", right: "Справа", bottom: "Снизу", left: "Слева" }[s]}
                </TipButton>
              )}
            </DemoTip>
          ))}
        </Stage>
      ),
    },
    {
      id: "kbd",
      title: "С сочетанием клавиш",
      description: "Текст и справа серым сочетание клавиш.",
      when: "кнопка с горячей клавишей: «Создать груз · Ctrl N», «Обновить · R».",
      demo: (
        <Stage>
          <DemoTip text="Обновить" kbd="R" side="bottom" force="hover">
            {(d) => (
              <TipButton describedBy={d} variant="ghost" size="md" square label="Обновить">
                <Icon name="refresh" />
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "icon",
      title: "У значка без подписи",
      description: "Кнопка-значок обязана иметь подсказку и aria-label с тем же текстом.",
      when: "любая квадратная кнопка без слова: «Скачать выписку», «Закрыть».",
      demo: (
        <Stage>
          <DemoTip text="Скачать выписку" side="bottom" force="hover">
            {(d) => (
              <TipButton describedBy={d} variant="ghost" size="md" square label="Скачать">
                <Icon name="dl" />
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "wrap",
      title: "Длинный текст",
      description: "Свыше 36 символов переносится по словам, ширина не больше 36ch.",
      when: "пояснение причины в одну-две строки; больше — Popover.",
      demo: (
        <Stage>
          <TooltipCard wrap>
            Длинное пояснение переносится по словам и не шире 36 символов в строке
          </TooltipCard>
        </Stage>
      ),
    },
    {
      id: "why",
      title: "Почему недоступно",
      description:
        "На отключённой кнопке подсказку вешают на обёртку с tabindex=0: сама disabled-кнопка не получает ни фокус, ни hover. [TODO] в макете нет, предложено словарём.",
      when: "действие недоступно по причине, которую можно назвать: «Нет прав на загрузку».",
      demo: (
        <Stage>
          <WhyTip text="Нет прав на загрузку">Загрузить</WhyTip>
        </Stage>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Default",
      note: "Подсказки не видно, в DOM она есть (role=tooltip), aria-describedby связывает её с якорем.",
      demo: (
        <Stage>
          <DemoTip text="Создать груз" kbd="Ctrl N">
            {(d) => <TipButton describedBy={d}>Новый груз</TipButton>}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover",
      note: "Показана: прозрачность 0 → 1, масштаб .96 → 1, сдвиг 4 px к якорю, 125 мс.",
      forced: true,
      demo: (
        <Stage>
          <DemoTip text="Создать груз" kbd="Ctrl N" side="bottom" force="hover">
            {(d) => (
              <TipButton describedBy={d} force="hover">
                Новый груз
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "С клавиатуры (focus-visible) показывается так же, как при наведении. [TODO] в макете подсказка только по мыши (mouseover), предложение — добавить фокус.",
      forced: true,
      demo: (
        <Stage>
          <DemoTip text="Создать груз" kbd="Ctrl N" side="bottom" force="focus">
            {(d) => (
              <TipButton describedBy={d} force="focus">
                Новый груз
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "active",
      kind: "active",
      title: "Active",
      note: "Нажатие на якорь гасит подсказку; так же при открытом меню (aria-expanded=true).",
      forced: true,
      demo: (
        <Stage>
          <DemoTip text="Скачать выписку" side="bottom">
            {(d) => (
              <TipButton
                describedBy={d}
                variant="ghost"
                size="md"
                square
                label="Скачать"
                force="active"
              >
                <Icon name="dl" />
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled якорь",
      note: "У отключённой кнопки подсказка — на обёртке: объясняет причину. Карточка та же.",
      demo: (
        <Stage>
          <WhyTip text="Нет прав на загрузку">Загрузить</WhyTip>
        </Stage>
      ),
    },
    NA(
      "loading",
      "loading",
      "Loading",
      "Нет. Подсказка статична; если текст ещё не получен, её не показывают.",
    ),
    NA(
      "error",
      "error",
      "Error",
      "Нет. Ошибка объясняется в Alert или рядом с полем, не подсказкой.",
    ),
    NA("empty", "empty", "Empty", "Нет. Пустой текст — нет подсказки."),
  ],
  rules: {
    use: [
      "Каждой кнопке-значку — подсказка и тот же текст в aria-label.",
      "Текст — название или короткая причина, глагол в инфинитиве: «Скачать выписку».",
      "Горячую клавишу пишите отдельным словом справа: «Ctrl N».",
      "Подсказка не перекрывает якорь и не закрывается, если курсор ушёл на неё: она вне потока и pointer-events: none.",
      "На тач-экране подсказки нет: важное выносите в подпись.",
    ],
    avoid: [
      "Ссылки, кнопки, форма в подсказке: нужен Popover.",
      "Дублирование видимой подписи («Сохранить» на «Сохранить»).",
      "Единственная копия важной информации: на мобильных и у клавиатуры её может не быть.",
      "Больше двух строк.",
      "Подсказка на неинтерактивном тексте: не по tab, не прочитать.",
    ],
  },
  a11y: [
    {
      kind: "aria",
      title: "role=tooltip и aria-describedby",
      text: 'Карточка — role="tooltip", якорь ссылается на неё aria-describedby. Для кнопки-значка имя задаёт aria-label (тот же текст), а подсказка остаётся описанием.',
    },
    {
      kind: "key",
      title: "Фокус и Esc",
      text: "Показывается при focus-visible, как при hover; Esc скрывает, не убирая фокус (WCAG 1.4.13: закрывается без смещения указателя и фокуса). Подсказка не получает фокус и не мешает навести курсор на себя (в макете pointer-events: none — [TODO] 1.4.13 требует, чтобы её можно было навести без исчезновения; решить: оставить none или разрешить hover).",
    },
    {
      kind: "focus",
      title: "Фокус",
      text: "Якорь остаётся в фокусе, подсказка фокус не получает. На отключённом элементе — обёртка с tabindex=0.",
    },
    {
      kind: "contrast",
      title: "Текст",
      text: "Светлая: --text на surface 16,5:1; сочетание клавиш --text-3 4,9:1. Тёмная: 16,4:1 и 7,6:1. Кольцо --border 1,6:1 / 2,5:1 контраста не набирает, границу держит тень; текст внутри от кольца не зависит.",
    },
    {
      kind: "motion",
      title: "prefers-reduced-motion",
      text: "Появление мгновенное: без сдвига и масштаба.",
    },
  ],
  tokens: [
    {
      name: "--surface / --border",
      value: "#fff / #c6cdd6 (тёмная #151b23 / #4d5b6b)",
      usage: "Фон и кольцо карточки",
      kind: "color",
    },
    {
      name: "--text / --text-3",
      value: "#15202b / #66727f",
      usage: "Текст · сочетание клавиш",
      kind: "color",
    },
    { name: "--shadow-pop", value: "0 6px 20px · 0 1px 3px", usage: "Тень", kind: "shadow" },
    { name: "--r-card", value: "10 px", usage: "Радиус", kind: "radius" },
    {
      name: "padding · max-width",
      value: "6 × 10 px · min(36ch, 100vw − 16)",
      usage: "Размеры карточки",
      kind: "size",
    },
    {
      name: "--fs-control / --fs-info",
      value: "12 px (600) / 11 px (400)",
      usage: "Текст · сочетание клавиш",
      kind: "font",
    },
    {
      name: "offset",
      value: "6 px (4 px снизу), поля от окна 8 px",
      usage: "Расстояние от якоря и до края окна",
      kind: "size",
    },
    {
      name: "z-index",
      value: "1000",
      usage: "Над Popover 900, Dialog 800; под Loader 1100 и Toast 1200",
      kind: "other",
    },
    {
      name: "pop",
      value: "125 мс, --ease",
      usage: "opacity 0→1, scale .96→1, сдвиг 4 px",
      kind: "time",
    },
  ],
  choreography: [
    {
      id: "show",
      title: "Показать и скрыть",
      trigger: "курсор входит на якорь / клавиатурный фокус / уходит",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Карточка создаётся в body, рассчитывается положение у якоря: сторона по умолчанию bottom, при нехватке места разворот; 8 px до краёв окна.",
          prop: "top, left",
        },
        {
          at: 0,
          dur: 125,
          what: "pop: opacity 0 → 1, scale .96 → 1, сдвиг по оси стороны 4 px → 0.",
          prop: "opacity, scale, translate",
          easing: "--ease",
        },
        {
          at: 2100,
          dur: 0,
          what: "Курсор ушёл, нажатие, прокрутка или открытое меню: карточка удаляется сразу, без анимации ухода.",
          prop: "—",
        },
      ],
      focus:
        "Фокус не затрагивается. [TODO] по фокусу и Esc в макете реакции нет; предложено: focus-visible показывает, Esc скрывает.",
      reducedMotion: "Без сдвига и масштаба: карточка появляется и исчезает мгновенно.",
      neighbours:
        "Перекрывает страницу (z-index 1000), но не двигает её и не ловит клики (pointer-events: none). Одновременно одна подсказка: новая убирает прежнюю.",
      demo: <ShowDemo />,
    },
    {
      id: "press",
      title: "Нажатие гасит подсказку",
      trigger: "mousedown на якоре или прокрутка",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Наведение: подсказка проявляется.",
          prop: "opacity, scale",
          easing: "--ease",
        },
        {
          at: 1300,
          dur: 0,
          what: "mousedown на якоре: подсказка удаляется сразу, кнопка получает слой active.",
          prop: "—",
        },
        {
          at: 1300,
          dur: 125,
          what: "У кнопки включается слой 9 %.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus: "Фокус переходит на якорь, как обычно при клике.",
      reducedMotion: "Те же шаги без перехода.",
      neighbours:
        "Если нажатие открывает меню или Popover, тот открывается в том же месте; подсказка якоря с aria-expanded=true не показывается вовсе.",
      demo: <PressDemo />,
    },
  ],
  examples: [
    {
      id: "icon",
      title: "Кнопка-значок",
      demo: (
        <Stage>
          <DemoTip text="Скачать выписку" side="bottom" force="hover">
            {(d) => (
              <TipButton describedBy={d} variant="ghost" size="md" square label="Скачать выписку">
                <Icon name="dl" />
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
      code: `<Tooltip content="Скачать выписку">
  <Button variant="ghost" square aria-label="Скачать выписку" icon={<DownloadIcon />} />
</Tooltip>`,
    },
    {
      id: "kbd",
      title: "С горячей клавишей",
      demo: (
        <Stage>
          <DemoTip text="Создать груз" kbd="Ctrl N" side="bottom" force="hover">
            {(d) => (
              <TipButton describedBy={d} variant="primary">
                <Icon name="plus" size="sm" />
                Новый груз
              </TipButton>
            )}
          </DemoTip>
        </Stage>
      ),
      code: '<Tooltip content="Создать груз" kbd="Ctrl N"><Button>Новый груз</Button></Tooltip>',
    },
  ],
});

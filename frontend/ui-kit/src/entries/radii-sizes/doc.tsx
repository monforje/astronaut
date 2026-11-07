/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon, type IconName } from "@/engine/Icon";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import "./radii-sizes.css";

const RADII: [string, string, string][] = [
  ["--r-control", "4", "Кнопка-иконка xs/sm у ghost, link, бейдж-тег, флажок"],
  ["--r-item", "8", "Кнопка, пункт меню и сайдбара, поле"],
  ["--r-card", "10", "Карточка, подсказка"],
  ["--r-popover", "12", "Поповер и меню"],
  ["--r-panel", "14", "Окно и панель"],
  ["--r-pill", "999", "Бейдж, Toggle, счётчик"],
];

function RailDemo() {
  return (
    <Playback<{ rail: boolean }>
      initial={{ rail: false }}
      script={[
        { at: 400, set: { rail: true } },
        { at: 1900, set: { rail: false } },
      ]}
      tail={800}
      hint="Сворачивание боковой панели: ширина 248 → 56 px за 300 мс, подписи гаснут за 125 мс."
      render={(s) => (
        <div className="ds-radii-rail" data-rail={s.rail || undefined}>
          {[
            ["layout", "Грузы"],
            ["doc", "Документы"],
            ["users", "Контрагенты"],
          ].map(([i, l]) => (
            <div className="ds-radii-rail__item" key={l}>
              <Icon name={i as IconName} />
              <span className="ds-radii-rail__label">{l}</span>
            </div>
          ))}
        </div>
      )}
    />
  );
}

export default defineDoc({
  id: "radii-sizes",
  title: "Радиусы и размеры",
  group: "base",
  cssPrefix: "ds-radii",
  order: 30,
  foundation: true,
  keywords: [
    "скругления",
    "радиус",
    "radius",
    "border-radius",
    "высота",
    "height",
    "отступ",
    "spacing",
    "размер",
    "size",
    "rail",
    "рейл",
    "боковая панель",
    "sidebar",
    "шапка",
    "pill",
    "пилюля",
    "масштаб",
  ],
  summary: "Шесть радиусов по масштабу элемента и четыре высоты контролов: 24, 28, 32, 36 px.",
  purpose:
    "Чем крупнее поверхность, тем больше её радиус: контрол 4, пункт 8, карточка 10, поповер 12, окно 14. Кнопка не пилюля: радиус 8. Пилюля (999) — только для меток и переключателей. Высота контрола берётся из шкалы, а не из внутренних отступов.",
  related: ["colors", "button"],
  anatomy: {
    parts: [
      {
        name: "Радиус",
        description:
          "Один из шести токенов. Вложенный элемент берёт радиус на ступень меньше внешнего.",
      },
      {
        name: "Высота контрола",
        description: "--h-xs 24 · --h-sm 28 · --h-md 32 (по умолчанию) · --h-lg 36.",
      },
      {
        name: "Высота шапки и ширина панели",
        description: "--h-bar 56 px; --w-side 248 px, --w-rail 56 px в свёрнутом виде.",
      },
    ],
  },
  variants: RADII.map(([token, px, usage]) => ({
    id: token.slice(4),
    title: `${px === "999" ? "pill" : px + " px"} · ${token}`,
    description: usage,
    demo: (
      <div className="ds-radii-box" style={{ borderRadius: `var(${token})` }}>
        {px === "999" ? "pill" : px}
      </div>
    ),
  })),
  sizes: [
    {
      id: "heights",
      title: "Высота контрола",
      value: "24 · 28 · 32 · 36",
      note: "xs · sm · md · lg",
      demo: (
        <>
          {[
            ["--h-xs", "24"],
            ["--h-sm", "28"],
            ["--h-md", "32"],
            ["--h-lg", "36"],
          ].map(([t, v]) => (
            <div key={t} className="ds-radii-bar" style={{ height: `var(${t})` }}>
              {v}
            </div>
          ))}
        </>
      ),
    },
    {
      id: "layout",
      title: "Раскладка",
      value: "56 · 248 · 56",
      note: "слева рейл (свёрнутая панель) и высота шапки 56, справа боковая панель 248; строка таблицы 44",
      demo: (
        <>
          <div className="ds-radii-bar" style={{ width: 56, height: 56 }}>
            56
          </div>
          <div className="ds-radii-bar" style={{ width: 248, maxWidth: "100%", height: 56 }}>
            248
          </div>
        </>
      ),
    },
  ],
  states: [],
  choreography: [
    {
      id: "rail",
      title: "Сворачивание панели в рейл",
      trigger: "кнопка свёртки в шапке боковой панели",
      origin: "mockup",
      steps: [
        { at: 0, dur: 125, what: "Подписи пунктов гаснут.", prop: "opacity", easing: "ease" },
        {
          at: 0,
          dur: 300,
          what: "Ширина панели и блока логотипа сходит с 248 к 56 px.",
          prop: "width",
          easing: "--glide cubic-bezier(.4,0,.2,1)",
        },
        {
          at: 0,
          dur: 300,
          what: "Заголовки групп сменяются значками, отступ между группами сжимается.",
          prop: "opacity, padding-top",
          easing: "--glide",
        },
      ],
      focus:
        "Фокус остаётся на кнопке свёртки; пункты остаются в порядке Tab, подпись — в подсказке при наведении.",
      reducedMotion: "Ширина и прозрачность меняются мгновенно (transition: none).",
      neighbours:
        "Область содержимого меняет ширину вместе с панелью (grid auto + 1fr): контент перекладывается, а не перекрывается.",
      demo: <RailDemo />,
    },
    {
      id: "radius-static",
      title: "Радиусы не анимируются",
      trigger: "любое состояние",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Радиус не меняется ни в hover, ни в active, ни в фокусе. Исключение — ButtonGroup: на стыках радиус 0, снаружи 8.",
        },
      ],
      focus: "Контур фокуса повторяет радиус элемента.",
      reducedMotion: "Не применяется.",
      neighbours: "Не затрагиваются.",
    },
  ],
  rules: {
    use: [
      "Радиус вложенного элемента — на ступень меньше внешнего.",
      "Высоту контрола брать из --h-*, чтобы в строке кнопки, поля и селекты были одной высоты.",
      "Пилюля — для меток, счётчиков и Toggle.",
      "Кнопка — радиус 8, не пилюля.",
    ],
    avoid: [
      "Радиусы вне шкалы (6, 16, 20 px).",
      "Пилюлю на кнопках и карточках.",
      "Задавать высоту контрола padding-ом.",
      "Анимировать радиус.",
    ],
  },
  a11y: [
    {
      kind: "note",
      title: "Цель нажатия",
      text: "Кнопки 24–28 px меньше рекомендуемых 44 px для касания. В плотных таблицах это осознанный размер; для тач-режима предусмотрите lg. [TODO] решить правила для планшета.",
    },
    {
      kind: "focus",
      title: "Контур фокуса",
      text: "Контур 2px повторяет радиус элемента и не занимает места.",
    },
    {
      kind: "motion",
      title: "Рейл",
      text: "При prefers-reduced-motion ширина панели меняется без перехода.",
    },
  ],
  tokens: [
    ...RADII.map(([name, px, usage]) => ({
      name,
      value: px === "999" ? "999 px" : `${px} px`,
      usage,
      kind: "radius" as const,
    })),
    {
      name: "--h-xs / --h-sm / --h-md / --h-lg",
      value: "24 / 28 / 32 / 36 px",
      usage: "Высота контролов",
      kind: "size",
    },
    { name: "--h-bar", value: "56 px", usage: "Шапка", kind: "size" },
    {
      name: "--w-side / --w-rail",
      value: "248 / 56 px",
      usage: "Боковая панель развёрнутая и свёрнутая",
      kind: "size",
    },
    {
      name: "--dur-s / --glide",
      value: "300 мс / cubic-bezier(.4,0,.2,1)",
      usage: "Сворачивание панели",
      kind: "time",
    },
  ],
  examples: [
    {
      id: "nest",
      title: "Вложенные радиусы",
      demo: (
        <div
          style={{
            padding: 8,
            borderRadius: "var(--r-card)",
            background: "var(--surface-muted)",
            boxShadow: "inset 0 0 0 1px var(--divider)",
          }}
        >
          <div className="ds-radii-box" style={{ width: 120, borderRadius: "var(--r-item)" }}>
            8 в 10
          </div>
        </div>
      ),
      lang: "css",
      code: `.card { border-radius: var(--r-card); padding: 8px; }
.card > .item { border-radius: var(--r-item); }`,
    },
  ],
});

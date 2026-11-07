/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { CSSProperties } from "react";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import "./state-layers.css";

type Force = "hover" | "active" | "focus" | undefined;

function Cell({ pct, label, name }: { pct: number; label: string; name: string }) {
  return (
    <div className="ds-layers-cell" style={{ "--ds-layers-pct": `${pct}%` } as CSSProperties}>
      <span>{label}</span>
      <small>{name}</small>
    </div>
  );
}

const Row = ({ f, current, disabled }: { f?: Force; current?: boolean; disabled?: boolean }) => (
  <button
    type="button"
    className="ds-layers-row"
    data-force={f}
    aria-current={current || undefined}
    disabled={disabled}
  >
    Грузы
  </button>
);

function LayersDemo() {
  return (
    <Playback<{ f: Force; g: Force }>
      initial={{ f: undefined, g: undefined }}
      script={[
        { at: 300, set: { f: "hover", g: "hover" } },
        { at: 1100, set: { f: "active", g: "active" } },
        { at: 1400, set: { f: "hover", g: "hover" } },
        { at: 2200, set: { f: undefined, g: undefined } },
      ]}
      tail={500}
      hint="Слева строка внутри контейнера: 4 % → 7 %. Справа кнопка вне контейнера: 9 % → 12 %."
      render={(s) => (
        <>
          <Row f={s.f} />
          <button type="button" className="ds-layers-btn" data-force={s.g}>
            Сбросить
          </button>
        </>
      )}
    />
  );
}

export default defineDoc({
  id: "state-layers",
  title: "Слои состояний",
  group: "base",
  cssPrefix: "ds-layers",
  order: 40,
  foundation: true,
  keywords: [
    "hover",
    "наведение",
    "active",
    "нажатие",
    "pressed",
    "focus",
    "фокус",
    "слой",
    "layer",
    "ink",
    "состояния",
    "states",
    "state layer",
    "оверлей",
    "прозрачность",
    "прозрачный слой",
  ],
  summary:
    "Hover и active — это полупрозрачный слой ink поверх фона, а не отдельные цвета. Четыре ступени: 4, 7, 9 и 12 %.",
  purpose:
    "Слой одинаково работает на белой, графитовой и цветной поверхности и в обеих темах: --ink тёмный в светлой теме и белый в тёмной. Поэтому у компонента нет «своего hover-цвета» для каждой темы. Заливочные кнопки темнеют миксом с чёрным, потому что у них свой цвет, не поверхность.",
  related: ["colors", "button"],
  anatomy: {
    parts: [
      { name: "База (--ink)", description: "#0e1620 в светлой теме и #fff в тёмной." },
      {
        name: "Слой",
        description:
          "color-mix(in srgb, transparent, var(--ink) N %): прозрачный цвет с N процентами ink. Кладётся поверх любого фона.",
      },
      {
        name: "Ступень",
        description:
          "1 уровень (4 → 7 %): строка, пункт, поле. 2 уровень (9 → 12 %): кнопка вне контейнера. Вторая шкала (6 → 9 %): иконки поверх панелей.",
      },
    ],
  },
  variants: [
    {
      id: "scale",
      title: "Шкала поверх поверхности",
      description: "Те же проценты на --surface: фон строки, пункта и кнопки.",
      demo: (
        <div className="ds-layers-strip">
          <Cell pct={0} label="0 · покой" name="—" />
          <Cell pct={4} label="hover строки" name="--layer-1 · 4 %" />
          <Cell pct={7} label="active строки" name="--layer-1p · 7 %" />
          <Cell pct={9} label="hover кнопки" name="--layer-2 · 9 %" />
          <Cell pct={12} label="active кнопки" name="--layer-3 · 12 %" />
        </div>
      ),
    },
    {
      id: "fills",
      title: "Заливка: микс с чёрным",
      description:
        "У кнопок с собственным цветом hover и active — микс этого цвета с чёрным в oklch: primary и accent 8 → 15 %, destructive 12 → 20 %.",
      demo: (
        <div className="ds-layers-strip">
          <div
            className="ds-layers-cell"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            <span>primary</span>
          </div>
          <div
            className="ds-layers-cell"
            style={{
              background: "color-mix(in oklch, var(--primary), #000 8%)",
              color: "var(--on-primary)",
            }}
          >
            <span>hover · 8 %</span>
          </div>
          <div
            className="ds-layers-cell"
            style={{
              background: "color-mix(in oklch, var(--primary), #000 15%)",
              color: "var(--on-primary)",
            }}
          >
            <span>active · 15 %</span>
          </div>
        </div>
      ),
    },
    {
      id: "selected",
      title: "Выбранный элемент",
      description:
        "Выбор — не слой, а подложка --selected (teal 15 %) и кольцо; hover по выбранному добавляет ink 8,8 %.",
      demo: (
        <>
          <Row current />
          <Row current f="hover" />
        </>
      ),
    },
  ],
  states: [
    {
      id: "default",
      kind: "default",
      title: "Покой",
      note: "Фона нет, текст --text-2.",
      demo: <Row />,
    },
    {
      id: "hover",
      kind: "hover",
      title: "Hover · 4 %",
      note: "Слой --layer-1, текст --text.",
      forced: true,
      demo: <Row f="hover" />,
    },
    {
      id: "active",
      kind: "active",
      title: "Active · 7 %",
      note: "Слой --layer-1p при нажатии.",
      forced: true,
      demo: <Row f="active" />,
    },
    {
      id: "focus",
      kind: "focus",
      title: "Focus",
      note: "Контур 2px --focus. Слоя нет: фокус и hover независимы.",
      forced: true,
      demo: <Row f="focus" />,
    },
    {
      id: "selected",
      kind: "selected",
      title: "Выбрано",
      note: "Подложка --selected, кольцо --border-selected.",
      demo: <Row current />,
    },
    {
      id: "selected-hover",
      kind: "hover",
      title: "Выбрано + hover",
      note: "К --selected добавляется ink 8,8 %.",
      forced: true,
      demo: <Row current f="hover" />,
    },
    {
      id: "disabled",
      kind: "disabled",
      title: "Disabled",
      note: "Слоя нет, текст --text-ph. Hover не работает.",
      demo: <Row disabled />,
    },
    {
      id: "btn-hover",
      kind: "hover",
      title: "Кнопка · hover 9 %",
      note: "Вне контейнера слой гуще: --layer-2.",
      forced: true,
      demo: (
        <button type="button" className="ds-layers-btn" data-force="hover">
          Сбросить
        </button>
      ),
    },
    {
      id: "btn-active",
      kind: "active",
      title: "Кнопка · active 12 %",
      note: "--layer-3.",
      forced: true,
      demo: (
        <button type="button" className="ds-layers-btn" data-force="active">
          Сбросить
        </button>
      ),
    },
  ],
  choreography: [
    {
      id: "layers",
      title: "Слой при наведении и нажатии",
      trigger: "указатель на строке или кнопке, затем нажатие",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 125,
          what: "Hover: фон идёт от прозрачного к слою (4 % у строки, 9 % у кнопки).",
          prop: "background",
          easing: "ease (по умолчанию)",
        },
        {
          at: 800,
          dur: 125,
          what: "Нажатие: слой гуще (7 % и 12 %).",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1100,
          dur: 125,
          what: "Отпускание: возврат к hover.",
          prop: "background",
          easing: "ease",
        },
        {
          at: 1900,
          dur: 125,
          what: "Уход: фон возвращается к прозрачному.",
          prop: "background",
          easing: "ease",
        },
      ],
      focus: "Слой фокус не заменяет: контур 2px рисуется поверх независимо.",
      reducedMotion: "Переход отключается, слой включается мгновенно.",
      neighbours: "Не реагируют: слой не меняет размеры.",
      demo: <LayersDemo />,
    },
  ],
  rules: {
    use: [
      "Для hover и active на нейтральных поверхностях брать --layer-*, а не новый цвет.",
      "Строка, пункт, поле: 4 → 7 %. Кнопка вне контейнера: 9 → 12 %.",
      "Заливочным кнопкам — микс собственного цвета с чёрным.",
      "Выбор — подложка --selected плюс кольцо, не слой.",
    ],
    avoid: [
      "Новый hover-цвет в HEX: слой уже даёт нужный результат в обеих темах.",
      "Слой на заливке: эффект там слабый и грязный.",
      "Менять проценты по вкусу: ступени общие для всего продукта.",
      "Показывать hover на disabled.",
    ],
  },
  a11y: [
    {
      kind: "note",
      title: "Состояние не только цветом",
      text: "Слой 4 % едва заметен. Выбранное состояние подкреплено кольцом, активный пункт — aria-current, фокус — контуром 2px.",
    },
    {
      kind: "focus",
      title: "Focus-visible",
      text: "Фокус не использует слой: контур не пропадает на любых поверхностях.",
    },
    { kind: "motion", title: "prefers-reduced-motion", text: "Переходы слоя отключаются." },
  ],
  tokens: [
    { name: "--layer-1", value: "ink 4 %", usage: "Hover строки, пункта, группы", kind: "color" },
    { name: "--layer-1p", value: "ink 7 %", usage: "Active строки, пункта, группы", kind: "color" },
    {
      name: "--layer-n / --layer-np",
      value: "ink 6 % / 9 %",
      usage: "Hover и active иконок поверх панелей (закрытие агента)",
      kind: "color",
    },
    { name: "--layer-2", value: "ink 9 %", usage: "Hover кнопок ghost и outline", kind: "color" },
    { name: "--layer-3", value: "ink 12 %", usage: "Active кнопок ghost и outline", kind: "color" },
    {
      name: "--tone",
      value: "ink 7 %",
      usage: "Заливка disabled у флажка, радио, переключателя; счётчик во вкладке",
      kind: "color",
    },
    { name: "--ink", value: "#0e1620 / #ffffff", usage: "База всех слоёв", kind: "color" },
    {
      name: "hover выбранного",
      value: "--selected + ink 8,8 %",
      usage: "Выбранная строка при наведении",
      kind: "other",
    },
    { name: "--dur-f", value: "125 мс", usage: "Переход слоя", kind: "time" },
  ],
  examples: [
    {
      id: "css",
      title: "Строка списка",
      demo: <Row f="hover" />,
      code: `.item:hover  { background: var(--layer-1); }
.item:active { background: var(--layer-1p); }
.item[aria-current] { background: var(--selected); }`,
    },
  ],
});

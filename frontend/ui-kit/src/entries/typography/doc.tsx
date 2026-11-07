/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { CSSProperties, ReactNode } from "react";
import { Playback } from "@/engine/Playback";
import { defineDoc } from "@/engine/types";
import "./typography.css";

function Sample({
  style,
  children,
  spec,
}: {
  style: CSSProperties;
  children: ReactNode;
  spec: string;
}) {
  return (
    <div className="ds-type-sample">
      <span style={style}>{children}</span>
      <small>{spec}</small>
    </div>
  );
}

function NumbersDemo() {
  return (
    <Playback<{ n: number }>
      initial={{ n: 18420 }}
      script={[
        { at: 300, set: { n: 11111 } },
        { at: 900, set: { n: 18420 } },
        { at: 1500, set: { n: 7081 } },
        { at: 2100, set: { n: 11011 } },
      ]}
      tail={600}
      hint="Слева Onest с tabular-nums, справа без: у цифр одной ширины значение не «дышит» при обновлении."
      render={(s) => (
        <>
          <span className="ds-type-swap">{s.n.toLocaleString("ru-RU")} кг</span>
          <span className="ds-type-swap ds-type-swap--prop">{s.n.toLocaleString("ru-RU")} кг</span>
        </>
      )}
    />
  );
}

export default defineDoc({
  id: "typography",
  title: "Типографика",
  group: "base",
  cssPrefix: "ds-type",
  order: 20,
  foundation: true,
  keywords: [
    "шрифт",
    "font",
    "typography",
    "типографика",
    "onest",
    "fira code",
    "моноширинный",
    "mono",
    "размеры текста",
    "font size",
    "заголовок",
    "heading",
    "числа",
    "tabular-nums",
    "цифры",
    "межстрочный",
    "line height",
    "начертание",
    "weight",
  ],
  summary:
    "Один шрифт интерфейса, Onest, и Fira Code только для кода и логов. Шесть размеров от 11 до 22 px.",
  purpose:
    "Иерархию задают размер и вес, а не гарнитура: заголовки 700–800, подписи 600, текст 400. Числа и идентификаторы (MSKU4821907, 18 420 кг) набираются тем же Onest, но с tabular-nums, чтобы колонки выравнивались. Fira Code не используют для обычных данных, только для кода и логов.",
  related: ["colors", "radii-sizes"],
  anatomy: {
    parts: [
      {
        name: "Гарнитура",
        description:
          "Onest (переменный, 100–900) — весь интерфейс. Fira Code (300–700) — код и логи. Файлы из idea/skelet/brand/design/fonts, подключаются симлинком.",
      },
      {
        name: "Размер",
        description:
          "Токены --fs-info 11 · --fs-control 12 · --fs-body 13 · --fs-qty 15 · --fs-heading 18 · --fs-title 22.",
      },
      {
        name: "Вес",
        description:
          "400 текст, 500 пункты меню, 600 подписи и кнопки, 700 заголовки окон и панелей, 800–900 заголовок страницы и логотип.",
      },
      {
        name: "Цифры",
        description: "font-variant-numeric: tabular-nums для чисел, ID, сумм, сроков.",
      },
    ],
  },
  variants: [
    {
      id: "title",
      title: "Заголовок",
      description:
        "Onest 800. Токен --fs-title 22 px; в образце макета «Шрифты» показан 26 px. [TODO] свести к одному значению.",
      demo: (
        <Sample
          style={{ fontSize: 26, fontWeight: 800 }}
          spec="Onest 800 · 26 (макет) / --fs-title 22"
        >
          Заголовок
        </Sample>
      ),
    },
    {
      id: "heading",
      title: "Заголовок окна и панели",
      description: "Onest 700, --fs-heading 18 px.",
      demo: (
        <Sample style={{ fontSize: 18, fontWeight: 700 }} spec="Onest 700 · 18">
          Заголовок окна и панели
        </Sample>
      ),
    },
    {
      id: "body",
      title: "Текст интерфейса",
      description: "Onest 400, --fs-body 13 px, межстрочный 1,4. Основной размер продукта.",
      demo: (
        <Sample style={{ fontSize: 13, fontWeight: 400 }} spec="Onest 400 · 13 / 1,4">
          Текст интерфейса
        </Sample>
      ),
    },
    {
      id: "control",
      title: "Шапка таблицы, подпись",
      description: "Onest 600, --fs-control 12 px, цвет --text-2.",
      demo: (
        <Sample
          style={{ fontSize: 12, fontWeight: 600, color: "var(--text-2)" }}
          spec="Onest 600 · 12"
        >
          Шапка таблицы, подпись
        </Sample>
      ),
    },
    {
      id: "info",
      title: "Мелкая подпись",
      description:
        "Onest 400–600, --fs-info 11 px: счётчики во вкладках, описание под полем, подпись метки.",
      demo: (
        <Sample
          style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)" }}
          spec="Onest 600 · 11"
        >
          Мелкая подпись
        </Sample>
      ),
    },
    {
      id: "qty",
      title: "Крупное число",
      description: "--fs-qty 15 px: значение показателя в карточке. Цифры tabular.",
      demo: (
        <Sample
          style={{ fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
          spec="Onest 700 · 15 · tabular-nums"
        >
          18 420 кг
        </Sample>
      ),
    },
    {
      id: "numbers",
      title: "Числа и ID",
      description: "Тот же Onest, tabular-nums: колонки сумм и ID выравниваются по разрядам.",
      demo: (
        <Sample style={{ fontVariantNumeric: "tabular-nums" }} spec="Onest · tabular-nums">
          MSKU4821907 · 18 420 кг
        </Sample>
      ),
    },
    {
      id: "code",
      title: "Код и логи",
      description: "Fira Code, 12 px. Только код, запросы, логи — не обычные данные.",
      demo: (
        <Sample style={{ fontFamily: "var(--mono)", fontSize: 12 }} spec="Fira Code · 12">
          GET /api/v1/cargo
        </Sample>
      ),
    },
  ],
  states: [],
  choreography: [
    {
      id: "font-load",
      title: "Загрузка шрифтов",
      trigger: "первая отрисовка страницы",
      origin: "mockup",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Текст сразу виден системным шрифтом (system-ui): страница не ждёт файл.",
          prop: "font-display: swap",
        },
        {
          at: 100,
          dur: 0,
          what: "Onest загрузился: гарнитура подменяется. Размеры строк почти совпадают, но возможен небольшой сдвиг строки.",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Не применяется.",
      neighbours:
        "Строки могут пересчитать переносы при подмене шрифта. [TODO] проверить preload основного начертания, чтобы сдвиг не был заметен.",
    },
    {
      id: "numbers",
      title: "Обновление чисел",
      trigger: "значение показателя изменилось (сумма, вес, счётчик)",
      origin: "proposal",
      steps: [
        {
          at: 0,
          dur: 0,
          what: "Новое число заменяет старое на месте. Цифры одинаковой ширины (tabular-nums): ширина блока и положение соседей не меняются.",
        },
      ],
      focus: "Не затрагивается.",
      reducedMotion: "Не применяется: анимации счёта нет.",
      neighbours: "Соседние колонки не прыгают благодаря tabular-nums и min-width значения.",
      demo: <NumbersDemo />,
    },
  ],
  rules: {
    use: [
      "Иерархия размером и весом, не новой гарнитурой.",
      "Числа, ID и суммы с tabular-nums.",
      "Fira Code только для кода, запросов и логов.",
      "Заголовка страницы нет, пока есть хлебные крошки.",
      "Подписи 11–12 px — цветом --text-2 или --text-3, не мельче.",
    ],
    avoid: [
      "Добавлять третью гарнитуру.",
      "Fira Code для номеров грузов и сумм.",
      "Размеры вне шкалы (14, 16, 20 px) без роли в токенах.",
      "Капс для длинных слов: капс — только у тегов (Badge tag).",
      "Вес ниже 400 в интерфейсе.",
    ],
  },
  a11y: [
    {
      kind: "contrast",
      title: "Мелкий текст",
      text: "11–12 px в --text-3 на белом 4,9:1: проходит порог 4,5:1, запаса мало. Не светлее --text-3.",
    },
    {
      kind: "note",
      title: "Масштаб",
      text: "Размеры заданы в px и не зависят от настройки размера шрифта браузера. [TODO] решить, переводить ли шкалу в rem.",
    },
    {
      kind: "note",
      title: "Язык",
      text: '<html lang="ru"> обязателен: от него зависят переносы и озвучка.',
    },
    {
      kind: "motion",
      title: "font-display: swap",
      text: "Текст виден сразу, ожидание шрифта не блокирует чтение.",
    },
  ],
  tokens: [
    {
      name: "--font",
      value: "Onest, system-ui, sans-serif",
      usage: "Весь интерфейс (из --font-sans бренда)",
      kind: "font",
    },
    {
      name: "--mono",
      value: "Fira Code, ui-monospace, monospace",
      usage: "Код и логи (из --font-mono бренда)",
      kind: "font",
    },
    { name: "--fs-info", value: "11 px", usage: "Мелкая подпись, xs-кнопка, tag", kind: "font" },
    {
      name: "--fs-control",
      value: "12 px",
      usage: "Подписи, шапка таблицы, sm-кнопка",
      kind: "font",
    },
    { name: "--fs-body", value: "13 px", usage: "Основной текст и кнопки", kind: "font" },
    { name: "--fs-qty", value: "15 px", usage: "Значение показателя", kind: "font" },
    { name: "--fs-heading", value: "18 px", usage: "Заголовок окна и панели", kind: "font" },
    { name: "--fs-title", value: "22 px", usage: "Заголовок", kind: "font" },
    { name: "line-height", value: "1,4", usage: "Базовый межстрочный body", kind: "other" },
  ],
  examples: [
    {
      id: "cargo",
      title: "Строка груза",
      demo: (
        <div className="ds-type-row">
          <b style={{ fontVariantNumeric: "tabular-nums" }}>MSKU4821907</b>
          <span style={{ color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
            18 420 кг
          </span>
          <span style={{ color: "var(--text-3)", fontSize: 11 }}>Накладная · вчера, 09:15</span>
        </div>
      ),
      code: `.cargo-id { font-variant-numeric: tabular-nums; }
.cargo-meta { font-size: var(--fs-info); color: var(--text-3); }`,
    },
  ],
});

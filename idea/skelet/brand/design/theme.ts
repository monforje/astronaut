/*
 * Тема бренда Astronaut для демо-сайта — без UI-кита, просто данные: шкалы цветов, шрифты, скругления,
 * тени и умолчания компонентов. Свой UI-кит демо-сайта будет брать значения отсюда. Используется
 * frontend/demo-site через симлинк (src/shared/ui/theme/theme.ts) — правка здесь сразу видна в демке.
 *
 * Шкалы по 10 оттенков, фирменный цвет на индексе 6 (`theme.primaryShade`) — его берут для заливки.
 * Палитра 03.11.2026 стала светлее (design/README.md, «Цвета»): шкалы сдвинуты вслед за базовым
 * цветом в OKLCH — светлота с затуханием к белому и чёрному, тон по базовому.
 */

/** Шкала из 10 оттенков: [0] самый светлый … [9] самый тёмный. */
export type ColorScale = readonly [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
];

/** Electric Teal #00D4D0 — основной. */
const brand: ColorScale = [
  "#edfcfb",
  "#d3f6f4",
  "#b0f1ee",
  "#8bece8",
  "#66e5e1",
  "#3fded9",
  "#00d4d0",
  "#1baeab",
  "#098b89",
  "#0d6967",
];

/** Warm Orange #FF9455 — акцент: CTA и точечные выделения. */
const accent: ColorScale = [
  "#fff6f2",
  "#ffe7da",
  "#ffd8c3",
  "#ffc8aa",
  "#ffb790",
  "#ffa675",
  "#ff9455",
  "#da7537",
  "#ae5c28",
  "#864419",
];

/** Off-white #FBF5EB (индекс 1) — тёплые фоны и подложки. */
const sand: ColorScale = [
  "#fffaf2",
  "#fbf5eb",
  "#e8dbc5",
  "#d7c19f",
  "#c9ac7f",
  "#c19f6b",
  "#bd985f",
  "#a7844e",
  "#957542",
  "#826434",
];

/** Deep Navy #082F53 — тёмная схема: [0] текст … [7] фон страницы … [9] самый тёмный. */
const dark: ColorScale = [
  "#cfd7e0",
  "#b5c0cc",
  "#90a0b2",
  "#6a7f98",
  "#46617e",
  "#2e4e6d",
  "#1e3e61",
  "#082f53",
  "#002445",
  "#011a35",
];

/** Семейства — из `@font-face` в tokens.css рядом. */
const SANS = "Onest, system-ui, sans-serif";

export const theme = {
  primaryColor: "brand",
  primaryShade: 6,
  black: "#082F53",
  white: "#FFFFFF",
  colors: { brand, accent, sand, dark },
  fontFamily: SANS,
  fontFamilyMonospace: '"Fira Code", ui-monospace, monospace',
  headings: { fontFamily: SANS, fontWeight: 800 },
  /** Скругления и тени — роли из roles.css (одни на лендинг и демо). */
  radius: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "var(--radius-chip)",
    lg: "var(--radius-card)",
    xl: "var(--radius-panel)",
    pill: "var(--radius-pill)",
  },
  defaultRadius: "md",
  shadows: {
    xs: "var(--elevation-card)",
    sm: "var(--elevation-card)",
    md: "var(--elevation-lift)",
    lg: "var(--elevation-lift)",
    xl: "var(--elevation-lift)",
  },
  /** Умолчания компонентов: кнопки — пилюли, как на лендинге; карточки — белые, скруглённые, с мягкой navy-тенью. */
  components: {
    button: { radius: "pill", fontWeight: 600 },
    iconButton: { radius: "pill" },
    paper: { radius: "lg" },
    card: { radius: "lg", shadow: "sm", border: false },
    modal: { radius: "xl" },
  },
} as const;

export type Theme = typeof theme;

import { createTheme, type MantineColorsTuple } from "@mantine/core";

/*
 * Тема Mantine бренда Astronaut. Фирменный цвет каждой шкалы стоит на индексе 6 — его Mantine берёт
 * для заливки, поэтому кнопки точно в цвет бренда. Используется frontend/demo-site через симлинк
 * (src/shared/ui/theme/theme.ts) — правка здесь сразу видна в демке.
 */

/** Electric Teal #00C4C0 — основной. */
const brand: MantineColorsTuple = [
  "#ecfaf9",
  "#d0f2f0",
  "#acebe8",
  "#86e3df",
  "#61dad6",
  "#3bd0cb",
  "#00c4c0",
  "#15a19e",
  "#00807e",
  "#05615f",
];

/** Warm Orange #F88030 — акцент: CTA и точечные выделения. */
const accent: MantineColorsTuple = [
  "#fff4ef",
  "#ffe2d3",
  "#ffd0b7",
  "#ffbd98",
  "#fda97a",
  "#ff9352",
  "#f88030",
  "#d3640d",
  "#a84f08",
  "#813a02",
];

/** Off-white #F4ECE0 (индекс 1) — тёплые фоны и подложки. */
const sand: MantineColorsTuple = [
  "#fdf5ea",
  "#f4ece0",
  "#e4d2b8",
  "#d5b991",
  "#c8a470",
  "#c1975a",
  "#bd904e",
  "#a77d3e",
  "#956e35",
  "#825e28",
];

/** Deep Navy #041A31 — тёмная схема: [0] текст … [7] фон страницы … [9] самый тёмный. */
const dark: MantineColorsTuple = [
  "#cbd2da",
  "#afb8c3",
  "#8794a3",
  "#607083",
  "#3c4f64",
  "#253a50",
  "#152a41",
  "#041a31",
  "#001329",
  "#000c1f",
];

/** Семейства — из `@font-face` в tokens.css рядом. */
const SANS = "Onest, system-ui, sans-serif";

export const theme = createTheme({
  primaryColor: "brand",
  primaryShade: 6,
  /** Teal и orange светлые: на залитых кнопках текст автоматически становится тёмным. */
  autoContrast: true,
  black: "#041A31",
  white: "#FDFDFD",
  colors: { brand, accent, sand, dark },
  fontFamily: SANS,
  fontFamilyMonospace: '"JetBrains Mono", ui-monospace, monospace',
  headings: { fontFamily: SANS, fontWeight: "800" },
});

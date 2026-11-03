/** Только для `.astro`: oxfmt их не форматирует. Остальное — oxfmt (oxfmt.config.ts). */
export default {
  plugins: ["prettier-plugin-astro"],
  printWidth: 100,
  overrides: [{ files: "*.astro", options: { parser: "astro" } }],
};

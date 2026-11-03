import { defineConfig } from "oxfmt";

/* Двойные кавычки (умолчание oxfmt) — так написан весь код. `.astro` форматирует prettier (prettier.config.mjs). */
export default defineConfig({
  ignorePatterns: [
    "dist",
    ".astro",
    "coverage",
    "e2e-results",
    "e2e-report",
    "bun.lock",
    "deploy/local",
    "**/*.astro",
  ],
});

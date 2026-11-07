import { defineConfig } from "oxfmt";

/* Двойные кавычки (умолчание oxfmt) — так написан весь код проекта. */
export default defineConfig({
  ignorePatterns: [
    "dist",
    "coverage",
    "bun.lock",
    "deploy/local",
    "public",
    "src/styles/fonts",
    "src/entries/*/README.md",
    "src/generated",
    "src/docgen/design-rules.md",
  ],
});

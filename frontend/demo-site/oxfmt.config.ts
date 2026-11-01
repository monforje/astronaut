import { defineConfig } from "oxfmt";

/* Двойные кавычки (умолчание oxfmt) — так написан весь код проекта. */
export default defineConfig({
  ignorePatterns: [
    "dist",
    "coverage",
    "e2e-results",
    "e2e-report",
    "bun.lock",
    "src/shared/api/generated",
    "deploy/local",
  ],
});

import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

/** Конфиг Astro (алиасы, плагины, `.astro`-компоненты) — через getViteConfig; здесь только то, что нужно тестам. */
export default getViteConfig({
  test: {
    // node, а не happy-dom: в «браузерном» окружении плагин Astro подменяет .astro заглушкой. DOM для
    // проверок даёт renderAstro (happy-dom DOMParser).
    environment: "node",
    exclude: [...configDefaults.exclude, "testing/**"],
    globals: true,
    coverage: {
      provider: "istanbul",
      include: ["src/**/*.{ts,astro}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/index.ts",
        "src/**/test-utils/**",
        "src/app/pages/**",
        "src/env.d.ts",
      ],
      reporter: ["text"],
      reportsDirectory: "./coverage",
    },
  },
});

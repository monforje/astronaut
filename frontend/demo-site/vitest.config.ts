import { configDefaults, defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

/** Плагины и алиасы — из vite.config.ts; здесь только то, что нужно тестам. */
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "happy-dom",
      exclude: [...configDefaults.exclude, "testing/**"],
      globals: true,
      coverage: {
        provider: "istanbul",
        include: ["src/**/*.{ts,tsx}"],
        exclude: [
          "src/**/*.d.ts",
          "src/**/index.ts",
          "src/**/test-utils/**",
          "src/shared/api/generated/**",
          "src/main.tsx",
          "src/vite-env.d.ts",
        ],
        reporter: ["text"],
        reportsDirectory: "./coverage",
      },
    },
  }),
);

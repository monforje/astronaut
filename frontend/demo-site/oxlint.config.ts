import { defineConfig, type OxlintOverride } from "oxlint";

/**
 * Границы слоёв Feature-Sliced Design (правила словами — docs/codestyle/fsd.md).
 *
 * Зависимости только вниз: app → pages → widgets → features → entities →
 * shared. Это быстрая проверка по алиасу `@/…` прямо в oxlint; полная — steiger
 * (`bun run lint:fsd`).
 *
 * В слайс заходят только через его `index.ts` (`@/entities/<сущность>`, а не
 * `@/entities/<сущность>/api/<запрос>`). Тесты (`*.test.ts(x)`) исключены из
 * запрета на заход вглубь: им нужны внутренности слайса.
 */
const LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"] as const;

const DEEP_IMPORT = {
  group: ["@/pages/*/**", "@/widgets/*/**", "@/features/*/**", "@/entities/*/**"],
  message: "Импорт в обход публичной точки слайса: берите из index.ts слайса.",
};

function layerRule(layer: (typeof LAYERS)[number], opts: { tests?: boolean } = {}): OxlintOverride {
  const upper = LAYERS.slice(0, LAYERS.indexOf(layer));
  const patterns = opts.tests ? [] : [DEEP_IMPORT];
  if (upper.length > 0) {
    patterns.push({
      group: upper.flatMap((l) => [`@/${l}`, `@/${l}/**`]),
      message: `Слой ${layer} не импортирует слои выше себя (порядок: ${LAYERS.join(" → ")}).`,
    });
  }
  return {
    files: opts.tests
      ? [`src/${layer}/**/*.test.ts`, `src/${layer}/**/*.test.tsx`]
      : [`src/${layer}/**`],
    rules: { "no-restricted-imports": ["error", { patterns }] },
  };
}

export default defineConfig({
  plugins: ["react", "import", "jsx-a11y", "typescript", "unicorn", "oxc"],
  categories: {
    correctness: "error",
    suspicious: "warn",
    perf: "warn",
    pedantic: "off",
    style: "off",
  },
  env: { browser: true, es2022: true },
  rules: {
    "no-console": "warn",
    "import/no-cycle": "error",
    // Новый JSX-транформ (`jsx: react-jsx`): `React` в области видимости не нужен.
    "react/react-in-jsx-scope": "off",
    // `import "@/app/index.css"` в main.tsx — штатный побочный импорт стилей.
    "import/no-unassigned-import": "off",
    // Загрузка данных в эффекте (`await` → setState) — штатный паттерн шаблона,
    // правило принимает его за синхронный setState.
    "react/set-state-in-effect": "off",
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "coverage",
    "e2e-results",
    "e2e-report",
    "src/shared/api/generated",
    "*.config.ts",
  ],
  overrides: [
    ...LAYERS.map((layer) => layerRule(layer)),
    // Последними: тестам можно лезть внутрь слайса, но не в слои выше себя.
    ...LAYERS.map((layer) => layerRule(layer, { tests: true })),
  ],
});

import { defineConfig } from "oxlint";

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
    // role="group" на span/div (группы кнопок и аватаров) — штатный приём; fieldset здесь не подходит.
    "jsx-a11y/prefer-tag-over-role": "off",
    "no-console": "warn",
    "import/no-cycle": "error",
    // Новый JSX-транформ (`jsx: react-jsx`): `React` в области видимости не нужен.
    "react/react-in-jsx-scope": "off",
    // `import "./styles/index.css"` в main.tsx и css рядом с doc.tsx — штатные побочные импорты.
    "import/no-unassigned-import": "off",
  },
  ignorePatterns: [
    "node_modules",
    "dist",
    "dist-lib",
    "dist-pack",
    "coverage",
    "*.config.ts",
    "tests/consumer/node_modules",
  ],
});

import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "node:path";

/**
 * Бренд — источник правды: лого, иконки, палитра и шрифты подключены симлинками на idea/skelet/brand
 * (список — docs/codestyle/README.md, «Бренд»). Поэтому:
 *  - `preserveSymlinks` — импорты из симлинка (`fonts/` в brand.css) ищутся от места ссылки в проекте;
 *  - `fs.allow` — dev-сервер отдаёт файлы бренда, лежащие вне каталога лендинга.
 * В Docker idea/skelet/brand монтируется в /idea/skelet/brand (compose.yml): относительные ссылки попадают туда же.
 */
const BRAND_DIR = path.resolve(import.meta.dirname, "../../idea/skelet/brand");

/**
 * Маршруты Astro обязаны лежать в `<srcDir>/pages`, а `src/pages` занят слоем FSD. Поэтому srcDir —
 * `src/app`: маршруты (тонкие файлы, собирающие страницы из `@/pages/*`) живут в слое app,
 * как таблица маршрутов в demo-site.
 */
export default defineConfig({
  srcDir: "./src/app",
  site: process.env.PUBLIC_SITE_URL || "https://astronaut.example",
  output: "static",
  integrations: [sitemap()],
  server: { host: "0.0.0.0", port: 80 },
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      preserveSymlinks: true,
      alias: { "@": path.resolve(import.meta.dirname, "./src") },
    },
    server: {
      allowedHosts: true,
      fs: { allow: [".", BRAND_DIR] },
      watch: { usePolling: true, interval: 300 },
    },
  },
});

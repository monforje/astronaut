import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import path from "path";

/**
 * Бренд — источник правды: лого, иконки, палитра, шрифты и тема подключены симлинками на
 * idea/skelet/brand (список — docs/codestyle/README.md, «Бренд»). Поэтому:
 *  - `preserveSymlinks` — импорты из симлинка (`fonts/` в brand.css) ищутся
 *    от места ссылки в проекте;
 *  - `fs.allow` — dev-сервер отдаёт файлы бренда, лежащие вне каталога фронта.
 * В Docker idea/skelet/brand монтируется в /idea/skelet/brand (compose.yml): относительные ссылки попадают туда же.
 */
const BRAND_DIR = path.resolve(import.meta.dirname, "../../idea/skelet/brand");

/**
 * Картинки бренда (лого, иконки) лежат в public/ — за ними Vite не следит. Плагин смотрит в idea/skelet/brand
 * и перезагружает страницу, когда меняется не-код. CSS и TS бренда (tokens.css, theme.ts) обновляются
 * горячей заменой через граф модулей, их не трогаем.
 */
function brandReload(): Plugin {
  return {
    name: "brand-reload",
    apply: "serve",
    configureServer(server) {
      server.watcher.add(BRAND_DIR);
      server.watcher.on("change", (file) => {
        if (file.startsWith(BRAND_DIR + path.sep) && !/\.(css|tsx?)$/.test(file)) {
          server.ws.send({ type: "full-reload" });
        }
      });
    },
  };
}

export default defineConfig({
  // worker-only: отдаёт mockServiceWorker.js в dev и кладёт его в сборку; моки запускает mocks/browser.ts.
  plugins: [react(), msw({ mode: "worker-only" }), brandReload()],
  resolve: {
    preserveSymlinks: true,
    // Один React: пакет кита лежит симлинком на ../ui-kit, где свой node_modules.
    dedupe: ["react", "react-dom"],
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  // Кит (node_modules/@astronaut/ui-kit → ../ui-kit/dist-lib) отдаём модулями, а не предсобранным кэшем:
  // после `task ui-kit` изменения видны без сброса .vite.
  optimizeDeps: { exclude: ["@astronaut/ui-kit"] },
  server: {
    port: 80,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { allow: [".", BRAND_DIR] },
    watch: {
      usePolling: true,
      interval: 300,
    },
    proxy: {
      "/api/v1": {
        // Бэкенд BACKEND: compose передаёт API_PROXY_TARGET=http://<BACKEND>-http:8080; без Docker адрес задают вручную.
        target: process.env.API_PROXY_TARGET ?? "http://astronaut-http:8080",
        changeOrigin: true,
      },
    },
  },
});

import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { msw } from "msw/vite";
import path from "path";

/**
 * Бренд — источник правды: лого, иконки, палитра, шрифты и тема Mantine подключены симлинками на
 * idea/brand (список — docs/codestyle/README.md, «Бренд»). Поэтому:
 *  - `preserveSymlinks` — импорты из симлинка (`@mantine/core` в theme.ts, `fonts/` в brand.css) ищутся
 *    от места ссылки в проекте;
 *  - `fs.allow` — dev-сервер отдаёт файлы бренда, лежащие вне каталога фронта.
 * В Docker idea/brand монтируется в /idea/brand (compose.yml): относительные ссылки попадают туда же.
 */
const BRAND_DIR = path.resolve(import.meta.dirname, "../../idea/brand");

/**
 * Картинки бренда (лого, иконки) лежат в public/ — за ними Vite не следит. Плагин смотрит в idea/brand
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
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
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

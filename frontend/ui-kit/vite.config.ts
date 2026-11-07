import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

/**
 * Бренд — источник правды: шрифты, палитра и лого подключены симлинками на idea/skelet/brand
 * (src/styles/{brand.css,fonts}, public/). Поэтому:
 *  - `preserveSymlinks` — `fonts/` в brand.css ищется от места ссылки в проекте;
 *  - `fs.allow` — dev-сервер отдаёт файлы бренда, лежащие вне каталога проекта.
 * В Docker idea/skelet/brand монтируется в /idea/skelet/brand (compose.yml): относительные ссылки попадают туда же.
 */
const BRAND_DIR = path.resolve(import.meta.dirname, "../../idea/skelet/brand");

/** Картинки бренда лежат в public/ — за ними Vite не следит: перезагружаем страницу при правке не-кода. */
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

const SRC_DIR = path.resolve(import.meta.dirname, "src");

/** Текстовые материалы для агентов: /llms.txt, /llms-full.txt и /entries/<id>.md (README компонента) — в dev и в dist/. */
function agentDocs(): Plugin {
  const read = (file: string) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : undefined);
  const resolveUrl = (url: string): { body?: string; type: string } | undefined => {
    if (url === "/llms.txt" || url === "/llms-full.txt") {
      return {
        body: read(path.join(SRC_DIR, "generated", url.slice(1))),
        type: "text/plain; charset=utf-8",
      };
    }
    const m = /^\/entries\/([a-z0-9-]+)\.md$/.exec(url);
    if (m) {
      return {
        body: read(path.join(SRC_DIR, "entries", m[1], "README.md")),
        type: "text/markdown; charset=utf-8",
      };
    }
    return undefined;
  };
  return {
    name: "agent-docs",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const hit = resolveUrl((req.url ?? "").split("?")[0]);
        if (!hit) return next();
        if (hit.body === undefined) {
          res.statusCode = 404;
          res.end("not found");
          return;
        }
        res.setHeader("Content-Type", hit.type);
        res.end(hit.body);
      });
    },
    generateBundle() {
      const emit = (fileName: string, source: string | undefined) => {
        if (source !== undefined) this.emitFile({ type: "asset", fileName, source });
      };
      emit("llms.txt", read(path.join(SRC_DIR, "generated", "llms.txt")));
      emit("llms-full.txt", read(path.join(SRC_DIR, "generated", "llms-full.txt")));
      for (const id of fs.readdirSync(path.join(SRC_DIR, "entries"))) {
        emit(`entries/${id}.md`, read(path.join(SRC_DIR, "entries", id, "README.md")));
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), brandReload(), agentDocs()],
  resolve: {
    preserveSymlinks: true,
    alias: { "@": path.resolve(import.meta.dirname, "./src") },
  },
  server: {
    port: 80,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: { allow: [".", BRAND_DIR] },
    watch: { usePolling: true, interval: 300 },
  },
  test: {
    environment: "happy-dom",
    include: ["src/**/*.test.{ts,tsx}", "mcp/**/*.test.ts"],
    setupFiles: ["./src/ui/test-setup.ts"],
  },
});

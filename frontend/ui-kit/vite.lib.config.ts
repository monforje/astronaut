/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const SRC_DIR = path.resolve(import.meta.dirname, "src");
const ASSET_IMPORT = /\.(png|svg)$/;

function externalAssets(): Plugin {
  const emitted = new Set<string>();
  return {
    name: "lib-external-assets",
    enforce: "pre",
    resolveId(source, importer) {
      if (!importer || !ASSET_IMPORT.test(source) || !source.startsWith(".")) return null;
      const file = path.resolve(path.dirname(importer), source);
      const name = path.basename(file);
      if (!emitted.has(name)) {
        emitted.add(name);
        this.emitFile({ type: "asset", fileName: `assets/${name}`, source: fs.readFileSync(file) });
      }
      const outDir = path.dirname(path.relative(SRC_DIR, importer));
      const rel = path.posix.relative(outDir.split(path.sep).join("/"), `assets/${name}`);
      return { id: rel.startsWith(".") ? rel : `./${rel}`, external: true };
    },
    transform(code, id) {
      if (!id.endsWith("brand.css")) return null;
      return code.replace(/\.ttf"\)/g, '.ttf?no-inline")');
    },
  };
}

export default defineConfig(({ mode }) => {
  const tokensOnly = mode === "tokens";
  return {
    base: "./",
    plugins: [externalAssets(), react()],
    resolve: {
      preserveSymlinks: true,
      alias: { "@": SRC_DIR },
    },
    publicDir: false,
    build: {
      outDir: "dist-lib",
      emptyOutDir: !tokensOnly,
      sourcemap: false,
      cssCodeSplit: false,
      target: "es2022",
      lib: {
        entry: path.resolve(import.meta.dirname, tokensOnly ? "src/tokens.ts" : "src/index.ts"),
        formats: ["es"],
        cssFileName: tokensOnly ? "tokens" : "styles",
      },
      rollupOptions: {
        external: ["react", "react-dom", "react/jsx-runtime", /^react-dom\//],
        output: {
          preserveModules: !tokensOnly,
          preserveModulesRoot: "src",
          entryFileNames: tokensOnly ? "_tokens.js" : "[name].js",
          assetFileNames: (info) => {
            const name = info.names[0] ?? "asset";
            if (name.endsWith(".css")) return name;
            const stem = path.parse(name).name.replace(/\[wght\]/g, "-VF");
            return `assets/${stem}-[hash][extname]`;
          },
        },
      },
    },
  };
});

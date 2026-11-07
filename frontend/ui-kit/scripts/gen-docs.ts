/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createServer } from "vite";

const server = await createServer({
  appType: "custom",
  logLevel: "error",
  server: { middlewareMode: true, watch: null },
});

try {
  const { writeAll } = (await server.ssrLoadModule("/src/docgen/files.ts")) as {
    writeAll: () => string[];
  };
  const changed = writeAll();
  console.log(
    changed.length ? `Обновлено файлов: ${changed.length}\n${changed.join("\n")}` : "Без изменений",
  );
} finally {
  await server.close();
}

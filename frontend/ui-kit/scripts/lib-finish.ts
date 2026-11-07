/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const dist = join(import.meta.dirname, "..", "dist-lib");

rmSync(join(dist, "_tokens.js"), { force: true });

for (const file of ["index.js", "index.d.ts", "styles.css", "tokens.css"]) {
  if (!existsSync(join(dist, file))) throw new Error(`dist-lib: нет ${file}`);
}
console.log("dist-lib готов");

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { Kit } from "../../mcp/kit";
import { listComponents } from "../../mcp/tools";
import { importsLine } from "../docgen/exports";
import * as ui from "./index";
import * as internal from "./internal";

const entryModules = import.meta.glob<Record<string, unknown>>("../entries/*/index.ts", {
  eager: true,
});

const kit = new Kit();
const implemented = kit.entries().filter((e) => e.status === "implemented");
const publicNames = new Set(Object.keys(ui));

describe("пакет: публичный API", () => {
  it("в src/ui экспортирована каждая запись, у которой есть index.ts", () => {
    const folders = Object.keys(entryModules).map((p) => p.split("/")[2]);
    expect(implemented.map((e) => e.id).toSorted()).toEqual(folders.toSorted());
    for (const entry of implemented) {
      for (const name of entry.components) {
        expect(publicNames.has(name), `${entry.id}: ${name} не экспортирован из src/ui`).toBe(true);
      }
    }
  });

  it("публичный API — только index.ts записей и внутренний слой, без engine и demo", () => {
    const allowed = new Set([
      ...Object.values(entryModules).flatMap((m) => Object.keys(m)),
      ...Object.keys(internal),
    ]);
    const extra = [...publicNames].filter((n) => !allowed.has(n));
    expect(extra).toEqual([]);
    for (const name of ["Icon", "toast", "useModal", "useLayer", "usePresence", "useFloating"]) {
      expect(publicNames.has(name), name).toBe(true);
    }
  });

  it("src/index.ts — пакетная точка входа: токены, стили и весь src/ui", () => {
    const source = readFileSync(join(import.meta.dirname, "..", "index.ts"), "utf8");
    expect(source).toContain('export * from "./ui";');
    expect(source).toContain('import "./styles/tokens.css";');
    expect(source).not.toMatch(/engine|entries\//);
  });

  it("README реализованных записей содержит импорт для кита и для потребителя пакета", () => {
    for (const entry of implemented) {
      const path = join(kit.entriesDir, entry.id, "README.md");
      expect(existsSync(path), entry.id).toBe(true);
      expect(readFileSync(path, "utf8"), entry.id).toContain(importsLine(entry.components));
    }
  });

  it("list_components показывает оба импорта для каждой реализованной записи", () => {
    const text = listComponents(kit, {});
    for (const entry of implemented) {
      const names = entry.components.join(", ");
      expect(text, entry.id).toContain(`import { ${names} } from "@/ui"`);
      expect(text, entry.id).toContain(`import { ${names} } from "@astronaut/ui-kit"`);
    }
  });
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { exportedComponents, importFrom, KIT_ALIAS, KIT_PACKAGE } from "../src/docgen/exports";

export const KIT_ROOT = join(import.meta.dirname, "..");

export const GEN_START = "<!-- gen:start -->";
export const GEN_END = "<!-- gen:end -->";
export const MANUAL_START = "<!-- manual:start -->";
export const MANUAL_END = "<!-- manual:end -->";
export const LICENSE_LINE = "© 2026 Komarov Zhiznev Group. Все права защищены. См. LICENSE";

export class KitError extends Error {}

export type Status = "implemented" | "foundation" | "spec" | "planned";

export const STATUS_LABEL: Record<Status, string> = {
  implemented: "реализован",
  foundation: "основа (токены, не компонент)",
  spec: "только спецификация, в @/ui нет",
  planned: "запланирован, спецификации нет",
};

export interface Entry {
  id: string;
  title: string;
  group: string;
  groupTitle: string;
  summary: string;
  keywords: string[];
  status: Status;
  components: string[];
}

export interface ReadmeParts {
  generated: string;
  manual: string;
}

export const fold = (s: string) => s.toLowerCase().replaceAll("ё", "е");

export const words = (s: string): string[] => fold(s).match(/[\p{L}\p{N}]+/gu) ?? [];

export function wordMatch(word: string, token: string): number {
  if (word.startsWith(token)) return 3;
  for (const cut of [1, 2]) {
    const stem = token.slice(0, token.length - cut);
    if (stem.length >= 3 && word.startsWith(stem)) return 3 - cut;
  }
  return 0;
}

export function queryTokens(query: string): string[] {
  return words(query).filter((w) => w.length >= 2);
}

export function textBlocks(text: string): string[] {
  const out: string[] = [];
  let current: string[] = [];
  let fenced = false;
  const flush = () => {
    if (current.length) out.push(current.join("\n"));
    current = [];
  };
  for (const line of text.split("\n")) {
    if (line.trimStart().startsWith("```")) fenced = !fenced;
    if (!fenced && line.trim() === "") flush();
    else current.push(line);
  }
  flush();
  return out;
}

export function splitSections(markdown: string): Map<string, string> {
  const sections = new Map<string, string>();
  let title: string | null = null;
  let body: string[] = [];
  let fenced = false;
  const close = () => {
    if (title !== null) sections.set(title, body.join("\n").trim());
  };
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) fenced = !fenced;
    if (!fenced && line.startsWith("## ")) {
      close();
      title = line.slice(3).trim();
      body = [];
    } else body.push(line);
  }
  close();
  return sections;
}

export function splitReadme(readme: string): ReadmeParts {
  const between = (start: string, end: string) => {
    const a = readme.indexOf(start);
    const b = readme.indexOf(end);
    return a === -1 || b === -1 || b < a ? "" : readme.slice(a + start.length, b).trim();
  };
  return {
    generated: between(GEN_START, GEN_END),
    manual: between(MANUAL_START, MANUAL_END),
  };
}

const quoted = (source: string): string[] =>
  [...source.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1] ?? m[2]);

export class Kit {
  readonly entriesDir: string;
  readonly generatedDir: string;

  constructor(readonly root: string = KIT_ROOT) {
    this.entriesDir = join(root, "src", "entries");
    this.generatedDir = join(root, "src", "generated");
  }

  read(path: string): string | null {
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  }

  readGenerated(name: "llms.txt" | "llms-full.txt"): string {
    const text = this.read(join(this.generatedDir, name));
    if (text === null) {
      throw new KitError(`Нет src/generated/${name}: выполните \`task bun -- run docs\`.`);
    }
    return text;
  }

  readRules(): string {
    const text = this.read(join(this.root, "src", "docgen", "design-rules.md"));
    if (text === null) throw new KitError("Нет src/docgen/design-rules.md.");
    return text;
  }

  readTokensCss(): string {
    const text = this.read(join(this.root, "src", "styles", "tokens.css"));
    if (text === null) throw new KitError("Нет src/styles/tokens.css.");
    return text;
  }

  groups(): [string, string][] {
    const source = this.read(join(this.root, "src", "engine", "types.ts")) ?? "";
    return [...source.matchAll(/\{\s*id:\s*"([a-z-]+)",\s*title:\s*"([^"]+)"\s*\}/g)].map((m) => [
      m[1],
      m[2],
    ]);
  }

  readme(id: string): string | null {
    return this.read(join(this.entriesDir, id, "README.md"));
  }

  sourceFiles(id: string): string[] {
    const dir = join(this.entriesDir, id);
    if (!existsSync(dir)) return [];
    return readdirSync(dir).toSorted();
  }

  entries(): Entry[] {
    const groups = this.groups();
    const groupTitle = new Map(groups);
    const llms = this.read(join(this.generatedDir, "llms.txt")) ?? "";
    const order = [...llms.matchAll(/^- \[[^\]]*\]\(\/entries\/([a-z0-9-]+)\.md\)/gm)].map(
      (m) => m[1],
    );
    const result: Entry[] = [];
    const known = new Set<string>();

    if (existsSync(this.entriesDir)) {
      for (const dirent of readdirSync(this.entriesDir, { withFileTypes: true })) {
        if (!dirent.isDirectory()) continue;
        const id = dirent.name;
        const readme = this.readme(id);
        if (readme === null) continue;
        const { generated } = splitReadme(readme);
        const title = /^# (.+)$/m.exec(generated)?.[1] ?? id;
        const group = /\*\*Группа:\*\*[^`\n]*\(`([a-z-]+)`\)/.exec(generated)?.[1] ?? "";
        const lines = generated.split("\n");
        const afterTitle = lines.slice(lines.findIndex((l) => l.startsWith("# ")) + 1);
        const summary = afterTitle.find((l) => l.trim() !== "")?.trim() ?? "";
        const docSource = this.read(join(this.entriesDir, id, "doc.tsx")) ?? "";
        const keywordsBlock = /keywords:\s*\[([\s\S]*?)\]/.exec(docSource)?.[1] ?? "";
        const indexSource = this.read(join(this.entriesDir, id, "index.ts"));
        const foundation = generated.includes("**Страница основы:** да");
        known.add(id);
        result.push({
          id,
          title,
          group,
          groupTitle: groupTitle.get(group) ?? group,
          summary,
          keywords: quoted(keywordsBlock),
          status: indexSource !== null ? "implemented" : foundation ? "foundation" : "spec",
          components: indexSource !== null ? exportedComponents(indexSource) : [],
        });
      }
    }

    const planned = this.read(join(this.entriesDir, "_planned.ts")) ?? "";
    const plannedPattern =
      /id:\s*"([a-z0-9-]+)",\s*title:\s*"([^"]+)",\s*group:\s*"([a-z-]+)",\s*summary:\s*"((?:[^"\\]|\\.)*)"/g;
    for (const m of planned.matchAll(plannedPattern)) {
      if (known.has(m[1])) continue;
      result.push({
        id: m[1],
        title: m[2],
        group: m[3],
        groupTitle: groupTitle.get(m[3]) ?? m[3],
        summary: m[4],
        keywords: [],
        status: "planned",
        components: [],
      });
    }

    const groupIndex = (g: string) => {
      const i = groups.findIndex(([id]) => id === g);
      return i === -1 ? groups.length : i;
    };
    const orderIndex = (id: string) => {
      const i = order.indexOf(id);
      return i === -1 ? order.length : i;
    };
    return result.toSorted(
      (a, b) =>
        groupIndex(a.group) - groupIndex(b.group) ||
        orderIndex(a.id) - orderIndex(b.id) ||
        a.id.localeCompare(b.id),
    );
  }

  find(id: string): Entry | undefined {
    return this.entries().find((e) => e.id === id);
  }
}

export const importLine = (entry: Entry): string | null =>
  entry.status === "implemented" && entry.components.length
    ? importFrom(entry.components, KIT_ALIAS)
    : null;

export const packageImportLine = (entry: Entry): string | null =>
  entry.status === "implemented" && entry.components.length
    ? importFrom(entry.components, KIT_PACKAGE)
    : null;

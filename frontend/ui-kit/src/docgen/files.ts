/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { entries, groupsWithEntries } from "@/engine/registry";
import { exportedComponents } from "./exports";
import { composeReadme, LICENSE_LINE } from "./render";

const root = join(import.meta.dirname, "..");

export const entriesDir = join(root, "entries");
export const generatedDir = join(root, "generated");
export const rulesPath = join(import.meta.dirname, "design-rules.md");

export const readmePath = (id: string) => join(entriesDir, id, "README.md");

const readIfExists = (path: string) => (existsSync(path) ? readFileSync(path, "utf8") : null);

export const expectedReadme = (id: string): string => {
  const doc = entries.find((e) => e.id === id)?.doc;
  if (!doc) throw new Error(`нет doc.tsx для ${id}`);
  const index = readIfExists(join(entriesDir, id, "index.ts"));
  return composeReadme(doc, readIfExists(readmePath(id)), index ? exportedComponents(index) : []);
};

const documented = () => entries.filter((e) => e.doc);

const DESCRIPTION =
  "Словарь дизайн-системы Astronaut: у каждого компонента есть спецификация с вариантами, состояниями, анатомией, правилами, доступностью, токенами и хореографией (как компонент двигается).";

export function llmsTxt(): string {
  const groups = groupsWithEntries(documented()).map((g) =>
    [
      `## ${g.title}`,
      "",
      ...g.items.map((e) => `- [${e.title}](/entries/${e.id}.md): ${e.summary}`),
    ].join("\n"),
  );
  return [
    "# Astronaut UI-кит",
    "",
    `> ${DESCRIPTION}`,
    "",
    "Каждая ссылка ведёт на README компонента в Markdown. Общие правила дизайн-системы и все README одним файлом: /llms-full.txt.",
    "",
    ...groups.flatMap((g) => [g, ""]),
    "## Всё одним файлом",
    "",
    "- [llms-full.txt](/llms-full.txt): общие правила дизайн-системы и README всех компонентов подряд",
    "",
  ].join("\n");
}

const withoutLicense = (readme: string) => readme.replace(LICENSE_LINE, "").trim();

export function llmsFullTxt(): string {
  const rules = readFileSync(rulesPath, "utf8").replace(LICENSE_LINE, "").trim();
  const readmes = groupsWithEntries(documented())
    .flatMap((g) => g.items)
    .map((e) => withoutLicense(readFileSync(readmePath(e.id), "utf8")));
  return [
    "# Astronaut UI-кит: полная версия",
    "",
    `> ${DESCRIPTION}`,
    "",
    rules,
    "",
    ...readmes.flatMap((r) => ["---", "", r, ""]),
    LICENSE_LINE,
    "",
  ].join("\n");
}

export function writeAll(): string[] {
  const changed: string[] = [];
  const put = (path: string, content: string) => {
    if (readIfExists(path) === content) return;
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, content);
    changed.push(path);
  };
  for (const e of documented()) put(readmePath(e.id), expectedReadme(e.id));
  put(join(generatedDir, "llms.txt"), llmsTxt());
  put(join(generatedDir, "llms-full.txt"), llmsFullTxt());
  return changed;
}

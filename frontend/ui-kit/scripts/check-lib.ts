/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { Kit } from "../mcp/kit";

const root = join(import.meta.dirname, "..");
const dist = join(root, "dist-lib");
const problems: string[] = [];

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const FORBIDDEN_PATH =
  /(^|\/)(engine|app|docgen|generated)\/|demo|doc\.|force|\.test\.|README|\.md$|\.map$/;
const FORBIDDEN_CODE =
  /from\s+"@\/|\/engine\/|\/demo"|\.force\.css|react-router|@modelcontextprotocol/;

const files = walk(dist).map((f) => relative(dist, f));
for (const f of files) {
  if (FORBIDDEN_PATH.test(f)) problems.push(`в пакет попало лишнее: ${f}`);
  if (/\.(js|d\.ts)$/.test(f) && FORBIDDEN_CODE.test(readFileSync(join(dist, f), "utf8"))) {
    problems.push(`утечка словаря или @/-алиас в ${f}`);
  }
}

const styles = readFileSync(join(dist, "styles.css"), "utf8");
if (/data:(font|image)/.test(styles)) problems.push("styles.css: ресурсы встроены data-URI");
if (!/url\(\.\/assets\/Onest[^)]*\.ttf\)/.test(styles))
  problems.push("styles.css: нет шрифта Onest");
for (const asset of ["ai-logo-1.png", "loader.svg", "logo-mark.svg"]) {
  if (!existsSync(join(dist, "assets", asset))) problems.push(`нет assets/${asset}`);
}

const built = (await import(join(dist, "index.js"))) as Record<string, unknown>;
const expected = new Kit()
  .entries()
  .filter((e) => e.status === "implemented")
  .flatMap((e) => e.components.map((name) => [e.id, name] as const));
for (const [id, name] of expected) {
  if (!(name in built)) problems.push(`${id}: ${name} не экспортирован из dist-lib/index.js`);
}
for (const name of [
  "Icon",
  "toast",
  "Toaster",
  "useModal",
  "useLayer",
  "usePresence",
  "useFloating",
]) {
  if (!(name in built)) problems.push(`нет публичного экспорта ${name}`);
}

const packDir = join(root, "dist-pack");
const packed = existsSync(packDir)
  ? readdirSync(packDir).find((f) => f.endsWith(".tgz"))
  : undefined;
const tarball = process.argv[2] ?? (packed ? join(packDir, packed) : undefined);
if (tarball) {
  const listing = spawnSync("tar", ["-tzf", tarball], { encoding: "utf8" });
  if (listing.status !== 0) throw new Error(`tar: ${listing.stderr}`);
  const entries = listing.stdout
    .split("\n")
    .filter(Boolean)
    .map((p) => p.replace(/^package\//, ""));
  if (!entries.includes("LICENSE")) problems.push("tarball: нет LICENSE");
  if (entries.some((e) => e.startsWith("src/"))) problems.push("tarball: исходники src/");
  if (!entries.includes("package.json")) problems.push("tarball: нет package.json");
  for (const e of entries) {
    if (e === "LICENSE" || e === "package.json" || e === "README.md") continue;
    if (!e.startsWith("dist-lib/")) problems.push(`tarball: лишний файл ${e}`);
    if (FORBIDDEN_PATH.test(e)) problems.push(`tarball: лишнее ${e}`);
  }
  const bytes = statSync(tarball).size;
  console.log(`tarball: ${entries.length} файлов, ${(bytes / 1024).toFixed(0)} КБ`);
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(
  `dist-lib: ${files.length} файлов, экспортов ${Object.keys(built).length}, компонентов кита ${expected.length}`,
);

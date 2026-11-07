/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const pack = join(root, "dist-pack");
const work = join(pack, "consumer");

const tarball = readdirSync(pack).find((f) => f.endsWith(".tgz"));
if (!tarball) throw new Error("нет tarball в dist-pack: сначала task pack");

rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
cpSync(join(root, "tests", "consumer"), work, {
  recursive: true,
  filter: (src) => !src.includes("node_modules"),
});

const manifest = JSON.parse(readFileSync(join(work, "package.json"), "utf8"));
manifest.dependencies["@astronaut/ui-kit"] = `file:../${tarball}`;
writeFileSync(join(work, "package.json"), JSON.stringify(manifest, null, 2));

const run = (...cmd: string[]) => {
  console.log(`\n> ${cmd.join(" ")}`);
  const result = spawnSync(cmd[0], cmd.slice(1), { cwd: work, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`не удалось: ${cmd.join(" ")}`);
};

run("bun", "install");
run("bun", "x", "tsc", "--noEmit");
run("bun", "x", "vite", "build");
run("bun", "x", "vitest", "run");

const assets = existsSync(join(work, "dist", "assets"))
  ? readdirSync(join(work, "dist", "assets"))
  : [];
const has = (re: RegExp) => assets.some((f) => re.test(f));
const missing = [
  [/^Onest.*\.ttf$/, "шрифт Onest"],
  [/^FiraCode.*\.ttf$/, "шрифт Fira Code"],
  [/^ai-logo-1.*\.png$/, "знак агента"],
  [/^loader.*\.svg$/, "анимация loader"],
  [/\.css$/, "стили"],
]
  .filter(([re]) => !has(re as RegExp))
  .map(([, name]) => name);
if (missing.length) throw new Error(`в сборке потребителя нет: ${missing.join(", ")}`);
console.log(`\nсмоук потребителя: ок, ресурсов в сборке ${assets.length}`);

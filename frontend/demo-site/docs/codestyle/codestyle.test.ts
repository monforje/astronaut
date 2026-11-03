/**
 * Проверки код-стайла, которых нет в oxlint и steiger: имена, расположение файлов, границы
 * ответственности сегментов и полнота словаря ошибок контракта. Правила словами — codestyle.md и
 * fsd.md рядом. Запуск: `task bun -- run lint:style` (входит в `task lint` и `task codestyle`).
 */
import { existsSync, lstatSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { ApiError, ErrorCode } from "@/shared/api";
import { errorMessage } from "@/shared/lib";

const ROOT = join(import.meta.dirname, "..", "..");
const SRC = join(ROOT, "src");
const GENERATED = join(SRC, "shared", "api", "generated");
const SLICED = ["pages", "widgets", "features", "entities"];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    // Битую ссылку на бренд обход пропускает — о ней скажет тест «ссылки на бренд целы».
    if (path === GENERATED || !existsSync(path)) return [];
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** Симлинки под `dir` (не заходя внутрь ссылок на каталоги). */
function links(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (lstatSync(path).isSymbolicLink()) return [path];
    return statSync(path).isDirectory() ? links(path) : [];
  });
}

const files = walk(SRC);
const rel = (path: string) => relative(ROOT, path);
const isTest = (path: string) => /\.test\.tsx?$/.test(path);
const code = files.filter((f) => /\.tsx?$/.test(f) && !isTest(f) && !f.endsWith(".d.ts"));
const read = (path: string) => readFileSync(path, "utf8");

/** `ErrorState` → `error-state`, `useTitle` → `use-title`, `httpClient` → `http-client`. */
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Имя модуля по файлу: без `.test`, `.module.css` и расширения. */
const stem = (path: string) => basename(path).replace(/(\.test)?\.tsx?$|\.module\.css$/, "");

/**
 * Файлы модулей — всё, что должно жить в папке модуля. Вне правила: баррели `index.ts`, точка входа
 * `main.tsx`, декларации `*.d.ts`, README и глобальные стили `app/styles`.
 */
const moduleFiles = files.filter(
  (f) =>
    /\.(tsx?|module\.css)$/.test(f) &&
    basename(f) !== "index.ts" &&
    !f.endsWith(".d.ts") &&
    f !== join(SRC, "main.tsx") &&
    !rel(f).startsWith("src/app/styles/"),
);

/** Все каталоги под `dir`, кроме сгенерированного клиента. */
function subdirs(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (path === GENERATED || !statSync(path).isDirectory()) return [];
    return [path].concat(subdirs(path));
  });
}

/** Файлы `paths`, в которых найден `pattern`, кроме разрешённых каталогов `allowed`. */
function offenders(paths: string[], pattern: RegExp, allowed: string[] = []) {
  return paths
    .filter((f) => !allowed.some((dir) => rel(f).startsWith(dir)))
    .filter((f) => pattern.test(read(f)))
    .map(rel);
}

describe("структура", () => {
  it("у каждого слоя и сегмента shared есть README.md", () => {
    const dirs = [
      "app",
      ...SLICED,
      "shared",
      "shared/api",
      "shared/config",
      "shared/lib",
      "shared/ui",
    ];
    const missing = dirs.filter((d) => !files.includes(join(SRC, d, "README.md")));
    expect(missing).toEqual([]);
  });

  it("слайсы называются в kebab-case", () => {
    const bad = SLICED.flatMap((layer) =>
      readdirSync(join(SRC, layer)).filter(
        (name) =>
          statSync(join(SRC, layer, name)).isDirectory() &&
          !/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(name),
      ),
    );
    expect(bad).toEqual([]);
  });

  it("ссылки на бренд целы: файл в idea/skelet/brand не переименован и не удалён", () => {
    const broken = [SRC, join(ROOT, "public")].flatMap(links).filter((l) => !existsSync(l));
    expect(broken.map(rel)).toEqual([]);
  });

  it("папки — в kebab-case", () => {
    const bad = subdirs(SRC).filter((d) => !KEBAB.test(basename(d)));
    expect(bad.map(rel)).toEqual([]);
  });

  it("модуль — папка: файл назван по своей папке (ErrorState.tsx → error-state/)", () => {
    const bad = moduleFiles.filter((f) => kebab(stem(f)) !== basename(dirname(f)));
    expect(bad.map(rel)).toEqual([]);
  });

  it("у папки модуля есть index.ts — наружу только через него", () => {
    const modules = new Set(moduleFiles.map((f) => dirname(f)));
    const bad = [...modules].filter((d) => !files.includes(join(d, "index.ts")));
    expect(bad.map(rel)).toEqual([]);
  });

  it("тест лежит рядом с тем, что проверяет", () => {
    const orphans = files.filter(isTest).filter((test) => {
      const base = stem(test);
      const dir = dirname(test);
      return ![".ts", ".tsx"].some((ext) => files.includes(join(dir, base + ext)));
    });
    expect(orphans.map(rel)).toEqual([]);
  });
});

describe("имена", () => {
  it("компоненты в ui/ — PascalCase.tsx", () => {
    const bad = code
      .filter((f) => f.endsWith(".tsx") && rel(f).split("/").includes("ui"))
      .filter((f) => !/^[A-Z][A-Za-z0-9]*\.tsx$/.test(basename(f)));
    expect(bad.map(rel)).toEqual([]);
  });

  it("CSS Module назван по компоненту рядом", () => {
    const bad = files
      .filter((f) => f.endsWith(".module.css"))
      .filter((f) => !files.includes(f.replace(/\.module\.css$/, ".tsx")));
    expect(bad.map(rel)).toEqual([]);
  });

  it("файл хука use*.ts экспортирует хук с тем же именем", () => {
    const bad = code
      .filter((f) => /^use[A-Z]\w*\.tsx?$/.test(basename(f)))
      .filter((f) => {
        const name = basename(f).replace(/\.tsx?$/, "");
        return !new RegExp(`export function ${name}\\b`).test(read(f));
      });
    expect(bad.map(rel)).toEqual([]);
  });

  it("без export default", () => {
    expect(offenders(code, /^export default /m)).toEqual([]);
  });
});

describe("границы сегментов", () => {
  it("import.meta.env читается только в shared/config", () => {
    expect(
      offenders(code, /import\.meta\.env/, ["src/shared/config/", "src/vite-env.d.ts"]),
    ).toEqual([]);
  });

  it("fetch вызывается только в shared/api", () => {
    expect(offenders(code, /(^|[^.\w])fetch\(/m, ["src/shared/api/"])).toEqual([]);
  });

  it("localStorage — только через shared/lib", () => {
    expect(offenders(code, /\blocalStorage\b/, ["src/shared/lib/"])).toEqual([]);
  });

  it("страницы и виджеты не зовут сгенерированные хуки напрямую — только через entities и features", () => {
    const direct = /import\s*\{([^}]*)\}\s*from\s*"@\/shared\/api"/g;
    const bad = code
      .filter((f) => ["src/pages/", "src/widgets/"].some((dir) => rel(f).startsWith(dir)))
      .filter((f) =>
        [...read(f).matchAll(direct)].some(([, names]) =>
          names!.split(",").some((n) => /^use[A-Z]/.test(n.trim())),
        ),
      );
    expect(bad.map(rel)).toEqual([]);
  });

  it("инлайн-стиль — только для вычисляемых значений, постоянное оформление — CSS Modules", () => {
    const literal = /^\s*\w+:\s*(-?\d+(\.\d+)?|"[^"]*"|'[^']*')\s*$/;
    const bad = code.filter((f) =>
      [...read(f).matchAll(/style=\{\{([^}]*)\}\}/g)].some(([, body]) =>
        body!
          .split(",")
          .filter((p) => p.trim())
          .every((p) => literal.test(p)),
      ),
    );
    expect(bad.map(rel)).toEqual([]);
  });
});

describe("контракт", () => {
  it("у каждого кода ошибки контракта есть текст для пользователя", () => {
    const fallback = "__нет текста__";
    const missing = Object.values(ErrorCode).filter(
      (c) => errorMessage(new ApiError(400, c, fallback)) === fallback,
    );
    expect(missing).toEqual([]);
  });
});

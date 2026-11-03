/**
 * Проверки код-стайла, которых нет в oxlint и steiger: имена, расположение файлов, границы
 * ответственности сегментов. Правила словами — codestyle.md и fsd.md рядом. Запуск:
 * `task bun -- run lint:style` (входит в `task lint` и `task codestyle`).
 */
import { existsSync, lstatSync, readdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { basename, dirname, join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(import.meta.dirname, "..", "..");
const SRC = join(ROOT, "src");
const SLICED = ["pages", "widgets", "features", "entities"];
/** Маршруты Astro: имена файлов диктует URL (srcDir = src/app), а не правило «файл = папка». */
const ROUTES = "src/app/pages/";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    // Битую ссылку на бренд обход пропускает — о ней скажет тест «ссылки на бренд целы».
    if (!existsSync(path)) return [];
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
const isTest = (path: string) => path.endsWith(".test.ts");
const isRoute = (path: string) => rel(path).startsWith(ROUTES);
const code = files.filter((f) => /\.(ts|astro)$/.test(f) && !isTest(f) && !f.endsWith(".d.ts"));
const read = (path: string) => readFileSync(path, "utf8");

/** `SiteHeader` → `site-header`, `pageTitle` → `page-title`. */
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Имя модуля по файлу: без `.test` и расширения. */
const stem = (path: string) => basename(path).replace(/(\.test)?\.(ts|astro)$/, "");

/**
 * Файлы модулей — всё, что должно жить в папке модуля. Вне правила: баррели `index.ts`, декларации
 * `*.d.ts`, README, глобальные стили `app/styles` и маршруты Astro `app/pages`.
 */
const moduleFiles = files.filter(
  (f) =>
    /\.(ts|astro)$/.test(f) &&
    basename(f) !== "index.ts" &&
    !f.endsWith(".d.ts") &&
    !isRoute(f) &&
    !rel(f).startsWith("src/app/styles/"),
);

/** Все каталоги под `dir`. */
function subdirs(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (!existsSync(path) || !statSync(path).isDirectory()) return [];
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
    const dirs = ["app", ...SLICED, "shared", "shared/config", "shared/lib", "shared/ui"];
    const missing = dirs.filter((d) => !files.includes(join(SRC, d, "README.md")));
    expect(missing).toEqual([]);
  });

  it("слайсы называются в kebab-case", () => {
    const bad = SLICED.flatMap((layer) =>
      readdirSync(join(SRC, layer)).filter(
        (name) => statSync(join(SRC, layer, name)).isDirectory() && !KEBAB.test(name),
      ),
    );
    expect(bad).toEqual([]);
  });

  it("ссылки на бренд целы: файл в idea/skelet/brand не переименован и не удалён", () => {
    const broken = [SRC, join(ROOT, "public")].flatMap(links).filter((l) => !existsSync(l));
    expect(broken.map(rel)).toEqual([]);
  });

  it("public/ — ссылка на idea/skelet/brand/public, внутри только ссылки на файлы бренда", () => {
    const publicDir = join(ROOT, "public");
    expect(lstatSync(publicDir).isSymbolicLink()).toBe(true);
    const shared = realpathSync(publicDir);
    const brand = dirname(shared);
    const copies = walk(publicDir).filter((f) => {
      const real = realpathSync(f);
      return !real.startsWith(brand + sep) || real.startsWith(shared + sep);
    });
    expect(copies.map(rel)).toEqual([]);
  });

  it("картинка /brand/… из кода есть в public/", () => {
    // `/brand/icons/${icon}.svg` проверяется до `${`: должна быть папка /brand/icons/.
    const missing = code.flatMap((f) =>
      [...read(f).matchAll(/["'`(](\/brand\/[\w./-]*)(\$\{)?/g)]
        .map(([, url, dynamic]) => (dynamic ? url.slice(0, url.lastIndexOf("/") + 1) : url))
        .filter((url) => !existsSync(join(ROOT, "public", url)))
        .map((url) => `${rel(f)}: ${url}`),
    );
    expect(missing).toEqual([]);
  });

  it("папки — в kebab-case", () => {
    const bad = subdirs(SRC).filter((d) => !KEBAB.test(basename(d)));
    expect(bad.map(rel)).toEqual([]);
  });

  it("модуль — папка: файл назван по своей папке (SiteHeader.astro → site-header/)", () => {
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
      return ![".ts", ".astro"].some((ext) => files.includes(join(dir, base + ext)));
    });
    expect(orphans.map(rel)).toEqual([]);
  });

  it("маршрут Astro — тонкий: страница и Layout, без своей разметки сверх них", () => {
    const bad = files
      .filter((f) => isRoute(f) && f.endsWith(".astro"))
      .filter(
        (f) => !/from "@\/pages\/[a-z-]+"/.test(read(f)) || /<(section|div|h1|p)\b/.test(read(f)),
      );
    expect(bad.map(rel)).toEqual([]);
  });
});

describe("имена", () => {
  it("компоненты в ui/ — PascalCase.astro", () => {
    const bad = code
      .filter((f) => rel(f).split("/").includes("ui") && basename(f) !== "index.ts")
      .filter((f) => !/^[A-Z][A-Za-z0-9]*\.astro$/.test(basename(f)));
    expect(bad.map(rel)).toEqual([]);
  });

  it("без export default в ts (в .astro его нет по природе формата)", () => {
    expect(
      offenders(
        code.filter((f) => f.endsWith(".ts")),
        /^export default /m,
      ),
    ).toEqual([]);
  });
});

describe("границы сегментов", () => {
  it("import.meta.env читается только в shared/config", () => {
    expect(offenders(code, /import\.meta\.env/, ["src/shared/config/", "src/env.d.ts"])).toEqual(
      [],
    );
  });

  it("fetch и localStorage — только в shared/lib (и shared/api, когда он появится)", () => {
    expect(
      offenders(code, /(^|[^.\w])fetch\(|\blocalStorage\b/m, [
        "src/shared/lib/",
        "src/shared/api/",
      ]),
    ).toEqual([]);
  });

  it("цвета — только роли темы: без HEX и произвольных цветов Tailwind в разметке", () => {
    const hex = /#[0-9a-fA-F]{3,8}\b(?![^<]*<\/title>)|\b(?:bg|text|border|fill|stroke)-\[#/;
    // Layout: <meta name="theme-color"> принимает только литерал, бренд-navy.
    expect(
      offenders(
        code.filter((f) => f.endsWith(".astro")),
        hex,
        ["src/app/layout/"],
      ),
    ).toEqual([]);
  });

  it("клиентский JS (client:*) — только в features, остров обосновывается там", () => {
    expect(
      offenders(
        code.filter((f) => f.endsWith(".astro")),
        /\bclient:(load|idle|visible|media|only)\b/,
        ["src/features/"],
      ),
    ).toEqual([]);
  });

  it("инлайн-стиль — только для вычисляемых значений, постоянное оформление — Tailwind", () => {
    const literal = /^\s*[\w-]+:\s*(-?\d+(\.\d+)?|"[^"]*"|'[^']*')\s*$/;
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

describe("сборка CSS", () => {
  /** Каталоги, которые Tailwind не сканирует (или там нет наших текстов). */
  const SKIP = new Set([
    "node_modules",
    "dist",
    ".astro",
    ".git",
    "coverage",
    "e2e-results",
    "deploy",
  ]);
  const TEXT = /\.(astro|ts|mjs|js|md|css|html|json|ya?ml|txt)$/;

  function texts(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      if (SKIP.has(name)) return [];
      const path = join(dir, name);
      if (!existsSync(path)) return [];
      if (statSync(path).isDirectory()) return texts(path);
      return TEXT.test(name) ? [path] : [];
    });
  }

  it("нигде нет класса с calc(), где % смешан с min()/max()/clamp(): Lightning CSS на нём падает", () => {
    // Tailwind сканирует все текстовые файлы проекта, документацию тоже: такой класс даже в примере
    // раздувает dev-сервер и сборку до 10+ ГБ (CLAUDE.md, «calc gotcha»).
    const risky = /\[[^\]\s]*calc\((?=[^\]\s]*%)(?=[^\]\s]*\b(?:min|max|clamp)\()[^\]\s]*\]/;
    expect(
      texts(ROOT)
        .filter((f) => risky.test(read(f)))
        .map(rel),
    ).toEqual([]);
  });
});

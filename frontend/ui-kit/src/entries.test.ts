/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import { PLANNED } from "@/entries/_planned";
import { GROUPS, type DocSpec } from "@/engine/types";
import { generatedDir, llmsFullTxt, llmsTxt, readmePath } from "@/docgen/files";
import {
  countMarkers,
  GEN_END,
  GEN_START,
  generatedPart,
  LICENSE_LINE,
  MANUAL_END,
  MANUAL_START,
  REGEN_COMMAND,
  renderGenerated,
} from "@/docgen/render";

const docModules = import.meta.glob<{ default: DocSpec }>("./entries/*/doc.tsx", { eager: true });

const srcDir = import.meta.dirname;

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) return [];
    return stat.isDirectory() ? listFiles(full) : [full];
  });
}

const sourceFiles: [string, string][] = listFiles(srcDir).map((full) => [
  `./${relative(srcDir, full)}`,
  readFileSync(full, "utf8"),
]);

const cssModules = Object.fromEntries(
  sourceFiles.filter(([path]) => /^\.\/entries\/[^/]+\/[^/]+\.css$/.test(path)),
);

const docs = Object.entries(docModules).map(([path, m]) => ({
  folder: path.split("/")[2],
  doc: m.default,
}));
const groupIds: string[] = GROUPS.map((g) => g.id);

function textLength(node: ReactNode): number {
  return renderToStaticMarkup(createElement(Fragment, null, node)).replace(/<[^>]*>/g, "").length;
}

describe("словарь: страницы компонентов", () => {
  it("первый срез на месте", () => {
    const ids = docs.map((d) => d.doc.id);
    for (const id of [
      "colors",
      "typography",
      "radii-sizes",
      "state-layers",
      "button",
      "badge",
      "avatar",
    ]) {
      expect(ids).toContain(id);
    }
  });

  it("id совпадает с папкой, kebab-case, уникален; группа и префикс заданы", () => {
    const seen = new Set<string>();
    const prefixes = new Set<string>();
    for (const { folder, doc } of docs) {
      expect(doc.id, `папка ${folder}`).toBe(folder);
      expect(doc.id).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/);
      expect(seen.has(doc.id), `повтор id ${doc.id}`).toBe(false);
      seen.add(doc.id);
      expect(groupIds, doc.id).toContain(doc.group);
      expect(doc.cssPrefix, doc.id).toMatch(/^ds-[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(prefixes.has(doc.cssPrefix), `повтор префикса ${doc.cssPrefix}`).toBe(false);
      prefixes.add(doc.cssPrefix);
    }
  });

  it("схема заполнена: все секции непустые", () => {
    for (const { doc } of docs) {
      const at = `страница ${doc.id}`;
      expect(doc.summary.length, at).toBeGreaterThan(10);
      expect(doc.variants.length, `${at}: варианты`).toBeGreaterThan(0);
      expect(doc.rules.use.length, `${at}: правила «используйте»`).toBeGreaterThan(0);
      expect(doc.rules.avoid.length, `${at}: правила «не используйте»`).toBeGreaterThan(0);
      expect(doc.a11y.length, `${at}: доступность`).toBeGreaterThan(0);
      expect(doc.tokens.length, `${at}: токены`).toBeGreaterThan(0);
      expect(doc.choreography.length, `${at}: хореография`).toBeGreaterThan(0);
      expect(doc.examples.length, `${at}: примеры`).toBeGreaterThan(0);
      if (!doc.foundation) {
        expect(doc.anatomy.parts.length, `${at}: анатомия`).toBeGreaterThan(0);
        expect(doc.states.length, `${at}: состояния`).toBeGreaterThan(0);
      }
    }
  });

  it("хореография: шаги с неотрицательным временем, у каждой есть фокус, reduced motion и соседи", () => {
    for (const { doc } of docs) {
      const ids = new Set<string>();
      for (const c of doc.choreography) {
        expect(ids.has(c.id), `${doc.id}: повтор сценария ${c.id}`).toBe(false);
        ids.add(c.id);
        expect(c.steps.length, `${doc.id}/${c.id}`).toBeGreaterThan(0);
        for (const s of c.steps) {
          expect(s.at, `${doc.id}/${c.id}`).toBeGreaterThanOrEqual(0);
          expect(s.dur, `${doc.id}/${c.id}`).toBeGreaterThanOrEqual(0);
        }
        for (const f of [c.focus, c.reducedMotion, c.neighbours, c.trigger]) {
          expect(textLength(f), `${doc.id}/${c.id}`).toBeGreaterThan(5);
        }
        for (const s of c.steps) {
          expect(textLength(s.what), `${doc.id}/${c.id}: шаг без описания`).toBeGreaterThan(0);
        }
      }
    }
  });

  it("id состояний и вариантов уникальны внутри страницы", () => {
    for (const { doc } of docs) {
      for (const list of [doc.variants, doc.states]) {
        const ids = list.map((x) => x.id);
        expect(new Set(ids).size, `${doc.id}: ${ids.join(",")}`).toBe(ids.length);
      }
    }
  });
});

function classesOf(css: string): string[] {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Set<string>();
  for (const m of noComments.matchAll(/([^{}]+)\{/g)) {
    const head = m[1].trim();
    if (head.startsWith("@")) continue;
    for (const c of head.matchAll(/(?<![\w.])\.([a-zA-Z_][\w-]*)/g)) out.add(c[1]);
  }
  return [...out];
}

describe("словарь: css компонентов", () => {
  const entries = Object.entries(cssModules).map(([path, css]) => ({
    folder: path.split("/")[2],
    css,
    path,
  }));

  const referencePrefixes = [...docs.map((d) => d.doc.cssPrefix), "ds-icon", "ds-agent-mark"];

  it("классы и анимации начинаются с префикса страницы", () => {
    const bad: string[] = [];
    for (const { folder, css, path } of entries) {
      const doc = docs.find((d) => d.folder === folder)?.doc;
      expect(doc, `${path}: нет doc.tsx в папке`).toBeDefined();
      const prefix = doc!.cssPrefix;
      for (const c of classesOf(css)) {
        if (!c.startsWith(prefix) && !referencePrefixes.some((p) => c.startsWith(p)))
          bad.push(`${path}: .${c} (нужен префикс ${prefix} или класс другого компонента)`);
      }
      for (const k of css.matchAll(/@keyframes\s+([\w-]+)/g)) {
        if (!k[1].startsWith(prefix))
          bad.push(`${path}: @keyframes ${k[1]} (нужен префикс ${prefix})`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("словарь: анатомия и поиск", () => {
  function marksOf(doc: DocSpec): number[] | undefined {
    if (!doc.anatomy.demo) return undefined;
    try {
      const html = renderToStaticMarkup(doc.anatomy.demo as never);
      return [...html.matchAll(/class="dx-callout__n[^"]*"[^>]*aria-label="Часть (\d+)"/g)].map(
        (m) => Number(m[1]),
      );
    } catch {
      return undefined;
    }
  }

  it("метки анатомии: не больше частей, номера внутри списка", () => {
    for (const { doc } of docs) {
      const marks = marksOf(doc);
      if (!marks) continue;
      const at = `страница ${doc.id}`;
      expect(marks.length, `${at}: меток больше, чем частей`).toBeLessThanOrEqual(
        doc.anatomy.parts.length,
      );
      for (const n of marks) {
        expect(n, `${at}: метка ${n} вне списка частей`).toBeGreaterThanOrEqual(1);
        expect(n, `${at}: метка ${n} вне списка частей`).toBeLessThanOrEqual(
          doc.anatomy.parts.length,
        );
      }
    }
  });

  it("предупреждения: неполная разметка анатомии и нет keywords (не ошибки)", () => {
    const partial: string[] = [];
    const noKeywords: string[] = [];
    const dup: string[] = [];
    for (const { doc } of docs) {
      const marks = marksOf(doc);
      const parts = doc.anatomy.parts.length;
      if (marks && new Set(marks).size !== marks.length) dup.push(`${doc.id} (${marks.join(",")})`);
      if (marks && parts >= 3 && marks.length === 1) partial.push(doc.id);
      else if (marks && parts > 0 && marks.length < parts)
        partial.push(`${doc.id} (${marks.length}/${parts})`);
      if (!doc.keywords?.length) noKeywords.push(doc.id);
    }
    if (partial.length) console.warn(`Анатомия размечена не у всех частей: ${partial.join(", ")}`);
    if (dup.length) console.warn(`Повтор номера метки анатомии: ${dup.join(", ")}`);
    if (noKeywords.length)
      console.warn(`Нет keywords (русские синонимы для поиска): ${noKeywords.join(", ")}`);
    expect(true).toBe(true);
  });
});

const LICENSE_TEXT =
  "© 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE";
const DIRECTIVE = /oxlint|eslint|@ts-|\/\/\/\s*<reference|oxfmt|prettier-ignore|@vitest|biome/;

const checked = sourceFiles.filter(
  ([path]) => /\.(ts|tsx|css)$/.test(path) && !path.endsWith(".d.ts"),
);

function tsComments(path: string, text: string): string[] {
  const kind = path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const file = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, kind);
  const found = new Map<number, string>();
  const collect = (ranges: ts.CommentRange[] | undefined) => {
    for (const r of ranges ?? []) found.set(r.pos, text.slice(r.pos, r.end));
  };
  const walk = (node: ts.Node) => {
    const kids = node.getChildren(file);
    if (kids.length === 0) {
      collect(ts.getLeadingCommentRanges(text, node.getFullStart()));
      collect(ts.getTrailingCommentRanges(text, node.getEnd()));
    } else kids.forEach(walk);
  };
  walk(file);
  return [...found.values()];
}

function cssComments(text: string): string[] {
  const found: string[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'") {
      i++;
      while (i < text.length && text[i] !== c) i += text[i] === "\\" ? 2 : 1;
      i++;
    } else if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2) + 2;
      found.push(text.slice(i, end));
      i = end;
    } else i++;
  }
  return found;
}

describe("словарь: лицензия и комментарии в исходниках", () => {
  it("первая строка каждого .ts/.tsx/.css — заголовок с лицензией", () => {
    const bad = checked
      .filter(([, text]) => {
        const first = text.split("\n", 1)[0];
        return !(first.startsWith("/*") && first.includes(LICENSE_TEXT));
      })
      .map(([path]) => path);
    expect(bad, `нет заголовка «${LICENSE_TEXT}» первой строкой`).toEqual([]);
  });

  it("комментариев нет, кроме заголовка и директив (oxlint, @ts-expect-error, /// <reference)", () => {
    const bad: string[] = [];
    for (const [path, text] of checked) {
      const comments = path.endsWith(".css") ? cssComments(text) : tsComments(path, text);
      for (const c of comments) {
        if (c.includes(LICENSE_TEXT) || DIRECTIVE.test(c)) continue;
        bad.push(`${path}: ${c.replace(/\s+/g, " ").slice(0, 60)}`);
      }
    }
    expect(bad, "смысл комментария переносите в имена или в CLAUDE.md").toEqual([]);
  });
});

describe("словарь: README компонентов и llms", () => {
  const hint = `устарело: запустите «${REGEN_COMMAND}»`;
  const readme = (id: string) => {
    const path = readmePath(id);
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  };

  it("у каждой записи есть README.md", () => {
    const missing = docs.filter(({ doc }) => readme(doc.id) === null).map(({ doc }) => doc.id);
    expect(missing, `нет README.md: запустите «${REGEN_COMMAND}»`).toEqual([]);
  });

  it("ровно одна пара маркеров gen и manual, в конце строка лицензии", () => {
    for (const { doc } of docs) {
      const text = readme(doc.id) ?? "";
      for (const [start, end] of [
        [GEN_START, GEN_END],
        [MANUAL_START, MANUAL_END],
      ]) {
        expect(countMarkers(text, start), `${doc.id}: ${start}`).toBe(1);
        expect(countMarkers(text, end), `${doc.id}: ${end}`).toBe(1);
        expect(text.indexOf(start), `${doc.id}: порядок маркеров`).toBeLessThan(text.indexOf(end));
      }
      expect(text.indexOf(GEN_END), `${doc.id}: gen раньше manual`).toBeLessThan(
        text.indexOf(MANUAL_START),
      );
      expect(text.trimEnd().endsWith(LICENSE_LINE), `${doc.id}: строка лицензии`).toBe(true);
    }
  });

  it("генерируемая часть README совпадает с генератором", () => {
    const stale = docs
      .filter(({ doc }) => {
        const text = readme(doc.id);
        return text === null || generatedPart(text) !== renderGenerated(doc).trim();
      })
      .map(({ doc }) => doc.id);
    expect(stale, hint).toEqual([]);
  });

  it("llms.txt и llms-full.txt актуальны", () => {
    const read = (name: string) => {
      const path = join(generatedDir, name);
      return existsSync(path) ? readFileSync(path, "utf8") : null;
    };
    expect(read("llms.txt") === llmsTxt(), `llms.txt: ${hint}`).toBe(true);
    expect(read("llms-full.txt") === llmsFullTxt(), `llms-full.txt: ${hint}`).toBe(true);
  });
});

const implementations = import.meta.glob<Record<string, unknown>>("./entries/*/index.ts", {
  eager: true,
});

describe("кит: реализованные компоненты и публичная точка входа", () => {
  const implemented = Object.entries(implementations).map(([path, module]) => ({
    folder: path.split("/")[2],
    components: Object.entries(module).filter(
      ([name, value]) => /^[A-Z]/.test(name) && typeof value === "function",
    ),
  }));

  it("есть хотя бы одна реализация", () => {
    expect(implemented.length).toBeGreaterThan(0);
  });

  it("у каждой записи с index.ts есть doc.tsx и экспортируется хотя бы один компонент", () => {
    for (const { folder, components } of implemented) {
      expect(
        docs.some((d) => d.folder === folder),
        `${folder}: нет doc.tsx`,
      ).toBe(true);
      expect(components.length, `${folder}: index.ts не экспортирует компонент`).toBeGreaterThan(0);
    }
  });

  it("все компоненты записей реэкспортируются из src/ui/index.ts", async () => {
    const ui: Record<string, unknown> = await import("@/ui");
    for (const { folder, components } of implemented) {
      for (const [name, component] of components) {
        expect(ui[name], `${folder}: ${name} нет в src/ui/index.ts`).toBe(component);
      }
    }
  });

  it("публичные компоненты не принимают force, это забота демо словаря", () => {
    const offenders = sourceFiles
      .filter(([path]) => /^\.\/entries\/[^/]+\/[A-Z][A-Za-z]*\.tsx$/.test(path))
      .filter(([, text]) => /\bforce\b|data-force/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("в реализованных записях data-force только в *.force.css, публичный css его не содержит", () => {
    const folders = new Set(implemented.map((i) => i.folder));
    const offenders = sourceFiles
      .filter(([path]) => /^\.\/entries\/[^/]+\/[a-z0-9.-]+\.css$/.test(path))
      .filter(([path]) => folders.has(path.split("/")[2]))
      .filter(([path, text]) => !path.endsWith(".force.css") && text.includes("data-force"))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});

describe("кит: внутренний слой", () => {
  const entryFiles = sourceFiles.filter(([path]) => /^\.\/entries\/.+\.(ts|tsx)$/.test(path));
  const entryCode = entryFiles.filter(
    ([path]) => !path.endsWith(".test.ts") && !path.endsWith(".test.tsx"),
  );

  it("в записях нет файлов Glyph*.tsx: иконки только через Icon", () => {
    const offenders = sourceFiles
      .map(([path]) => path)
      .filter((path) => path.startsWith("./entries/") && /\/Glyph[^/]*\.tsx$/.test(path));
    expect(offenders).toEqual([]);
  });

  it("в записях нет самодельных svg-иконок с классом ds-icon", () => {
    const offenders = entryCode
      .filter(([path]) => !/\/(doc|demo)\.tsx$/.test(path))
      .filter(([, text]) => /className=["'{`][^>]*ds-icon/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("записи берут примитивы из ../../ui/internal, а не из @/ui", () => {
    const offenders = entryCode
      .filter(([, text]) => /from "@\/ui(?!\/assets\/)[^"]*"/.test(text))
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("в записях нет копий общих примитивов", () => {
    const copy =
      /\b(?:function|const)\s+(?:mergeRefs|assignRef|setRef|useControlled|usePrefersReducedMotion|cx|useLayer|trapTab|getFocusable|placeFloating|useFloating|useDismiss|useMergedRefs)\b/;
    const offenders = entryCode.filter(([, text]) => copy.test(text)).map(([path]) => path);
    expect(offenders).toEqual([]);
  });

  it("внутренний слой не зависит от записей и словаря", () => {
    const offenders = sourceFiles
      .filter(([path]) => path.startsWith("./ui/internal/"))
      .filter(([, text]) =>
        /from "(\.\.\/entries|\.\.\/\.\.\/entries|@\/entries|@\/engine|\.\.\/\.\.\/engine)/.test(
          text,
        ),
      )
      .map(([path]) => path);
    expect(offenders).toEqual([]);
  });
});

describe("словарь: список «скоро»", () => {
  it("id уникальны, группы существуют", () => {
    const ids = PLANNED.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const p of PLANNED) expect(groupIds).toContain(p.group);
  });
});

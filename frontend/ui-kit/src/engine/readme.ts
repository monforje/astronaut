/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useState } from "react";
import { parseMarkdown, type MdBlock } from "./markdown";

const readmes = import.meta.glob<string>("../entries/*/README.md", {
  query: "?raw",
  import: "default",
});

const implementations = import.meta.glob<Record<string, unknown>>("../entries/*/index.ts");

export const hasComponent = (id: string) => `../entries/${id}/index.ts` in implementations;

export async function loadReadme(id: string): Promise<string | undefined> {
  const load = readmes[`../entries/${id}/README.md`];
  return load ? load() : undefined;
}

export async function loadExportNames(id: string): Promise<string[]> {
  const load = implementations[`../entries/${id}/index.ts`];
  if (!load) return [];
  const mod = await load();
  return Object.keys(mod)
    .filter((name) => /^[A-Z]/.test(name))
    .toSorted();
}

export interface ReadmeParts {
  generated: string;
  manual: string;
}

const between = (text: string, start: string, end: string) => {
  const from = text.indexOf(start);
  const to = text.indexOf(end);
  return from >= 0 && to > from ? text.slice(from + start.length, to).trim() : "";
};

export function splitReadme(text: string): ReadmeParts {
  return {
    generated: between(text, "<!-- gen:start -->", "<!-- gen:end -->"),
    manual: between(text, "<!-- manual:start -->", "<!-- manual:end -->"),
  };
}

export type ManualBlocks = { usage: MdBlock[]; a11y: MdBlock[]; importLine?: string };

const IMPORT_FROM_UI = /^import\s[\s\S]*\sfrom\s+["']@\/ui["'];?\s*$/;
const A11Y_LABEL = /^\**(?:Поведение и )?доступность\**\s*:?\**\s*$/i;
const A11Y_LEAD = /^\**(?:Поведение и )?доступность\**\s*:/i;

export function isStub(manual: string) {
  const text = manual.trim();
  return text === "" || (text.startsWith("[TODO]") && text.length < 200);
}

export function splitManual(manual: string): ManualBlocks {
  const blocks = isStub(manual) ? [] : parseMarkdown(manual);
  const importIndex = blocks.findIndex(
    (b) => b.type === "code" && IMPORT_FROM_UI.test(b.code.trim()),
  );
  const importBlock = importIndex >= 0 ? blocks[importIndex] : undefined;
  const rest = blocks.filter((_, i) => i !== importIndex);
  const a11yIndex = rest.findIndex(
    (b) =>
      (b.type === "paragraph" && A11Y_LEAD.test(b.text)) ||
      (b.type === "heading" && /доступност/i.test(b.text)),
  );
  const usage = a11yIndex >= 0 ? rest.slice(0, a11yIndex) : rest;
  const tail = a11yIndex >= 0 ? rest.slice(a11yIndex) : [];
  const head = tail[0];
  const a11y =
    head && (head.type === "heading" || (head.type === "paragraph" && A11Y_LABEL.test(head.text)))
      ? tail.slice(1)
      : tail;
  return {
    usage,
    a11y,
    importLine: importBlock?.type === "code" ? importBlock.code.trim() : undefined,
  };
}

export type ReadmeState =
  | { status: "loading" }
  | { status: "missing" }
  | ({ status: "ready" } & ReadmeParts);

export function useReadme(id: string): ReadmeState {
  const [state, setState] = useState<{ id: string; value: ReadmeState }>({
    id,
    value: { status: "loading" },
  });
  useEffect(() => {
    let alive = true;
    loadReadme(id).then(
      (text) => {
        if (!alive) return;
        setState({
          id,
          value:
            text === undefined ? { status: "missing" } : { status: "ready", ...splitReadme(text) },
        });
      },
      () => alive && setState({ id, value: { status: "missing" } }),
    );
    return () => {
      alive = false;
    };
  }, [id]);
  return state.id === id ? state.value : { status: "loading" };
}

export function useExportNames(id: string, enabled: boolean): string[] | undefined {
  const [state, setState] = useState<{ id: string; names: string[] }>();
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    loadExportNames(id).then((names) => alive && setState({ id, names }));
    return () => {
      alive = false;
    };
  }, [id, enabled]);
  return state?.id === id ? state.names : undefined;
}

export const hasComponentTab = (doc: { id: string; foundation?: boolean }) =>
  !doc.foundation || hasComponent(doc.id);

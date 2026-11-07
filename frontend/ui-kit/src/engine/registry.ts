/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { PLANNED } from "@/entries/_planned";
import { GROUPS, type DocSpec, type GroupId, type PlannedSpec } from "./types";

const modules = import.meta.glob<{ default: DocSpec }>("../entries/*/doc.tsx", { eager: true });

export interface Entry {
  id: string;
  title: string;
  group: GroupId;
  summary: string;
  order: number;
  keywords: string[];
  doc?: DocSpec;
}

const groupIndex = (g: GroupId) => GROUPS.findIndex((x) => x.id === g);

export const docs: DocSpec[] = Object.values(modules).map((m) => m.default);

function fromDoc(d: DocSpec): Entry {
  return {
    id: d.id,
    title: d.title,
    group: d.group,
    summary: d.summary,
    order: d.order ?? 100,
    keywords: d.keywords ?? [],
    doc: d,
  };
}

function fromPlanned(p: PlannedSpec): Entry {
  return {
    id: p.id,
    title: p.title,
    group: p.group,
    summary: p.summary ?? "",
    order: 1000,
    keywords: p.keywords ?? [],
  };
}

export const entries: Entry[] = [
  ...docs.map(fromDoc),
  ...PLANNED.filter((p) => !docs.some((d) => d.id === p.id)).map(fromPlanned),
].toSorted(
  (a, b) =>
    groupIndex(a.group) - groupIndex(b.group) ||
    a.order - b.order ||
    a.title.localeCompare(b.title, "ru"),
);

export const entryById = (id: string | undefined) => entries.find((e) => e.id === id);

export const normalize = (s: string) =>
  s.toLowerCase().replaceAll("ё", "е").replace(/\s+/g, " ").trim();

const wordsOf = (s: string) =>
  normalize(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const MIN_STEM = 3;
const MAX_ENDING = 2;
const SUMMARY_MIN_QUERY = 4;

function match(tokens: string[]): Entry[] {
  const scored: { e: Entry; score: number }[] = [];
  for (const e of entries) {
    const title = normalize(e.title);
    const id = normalize(e.id);
    const titleWords = wordsOf(e.title);
    const keywordWords = wordsOf([e.id, ...e.keywords].join(" "));
    const summaryWords = wordsOf(e.summary);
    let score = 0;
    let ok = true;
    for (const t of tokens) {
      if (titleWords.some((w) => w.startsWith(t))) score += 8;
      else if (t.length >= 3 && (title.includes(t) || id.includes(t))) score += 6;
      else if (keywordWords.some((w) => w.startsWith(t))) score += 5;
      else if (t.length > SUMMARY_MIN_QUERY && summaryWords.some((w) => w.startsWith(t)))
        score += 1;
      else {
        ok = false;
        break;
      }
    }
    if (ok) scored.push({ e, score });
  }
  return scored.toSorted((a, b) => b.score - a.score).map((x) => x.e);
}

export function searchEntries(query: string): Entry[] {
  const tokens = normalize(query).split(" ").filter(Boolean);
  if (tokens.length === 0) return entries;
  const exact = match(tokens);
  if (exact.length > 0) return exact;
  for (let cut = 1; cut <= MAX_ENDING; cut++) {
    const stems = tokens.map((t) => (t.length - cut >= MIN_STEM ? t.slice(0, -cut) : t));
    const found = match(stems);
    if (found.length > 0) return found;
  }
  return exact;
}

export const groupsWithEntries = (list: Entry[]) =>
  GROUPS.map((g) => ({
    id: g.id,
    title: g.title,
    items: list.filter((e) => e.group === g.id),
  })).filter((g) => g.items.length > 0);

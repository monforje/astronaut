/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export type Tab = "spec" | "component";

export const TABS: { id: Tab; label: string; hint: string }[] = [
  { id: "spec", label: "Хореография", hint: "Спецификация" },
  { id: "component", label: "Компонент", hint: "Код и примеры" },
];

export interface EntryLocation {
  tab: Tab;
  section?: string;
}

export function parseEntryRest(rest: string | undefined): EntryLocation {
  const parts = (rest ?? "").split("/").filter(Boolean);
  if (parts[0] === "component") return { tab: "component", section: parts[1] };
  return { tab: "spec", section: parts[0] };
}

export function entryPath(id: string, tab: Tab, section?: string): string {
  const base = tab === "component" ? `/${id}/component` : `/${id}`;
  return section ? `${base}/${section}` : base;
}

const KEY = "ds-entry-tab";

export function readLastTab(): Tab {
  try {
    return localStorage.getItem(KEY) === "component" ? "component" : "spec";
  } catch {
    return "spec";
  }
}

export function writeLastTab(tab: Tab) {
  try {
    localStorage.setItem(KEY, tab);
  } catch {}
}

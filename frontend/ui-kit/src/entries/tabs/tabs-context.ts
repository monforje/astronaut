/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createContext, use } from "react";

export interface TabsContextValue {
  uid: string;
  value: string | undefined;
  select: (value: string) => void;
  adopt: (value: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(part: string): TabsContextValue {
  const context = use(TabsContext);
  if (!context) throw new Error(`${part} нужно размещать внутри Tabs`);
  return context;
}

export function tabId(uid: string, value: string): string {
  return `${uid}-t-${value}`;
}

export function panelId(uid: string, value: string): string {
  return `${uid}-p-${value}`;
}

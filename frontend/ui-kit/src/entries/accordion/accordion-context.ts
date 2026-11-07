/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createContext, use } from "react";

export interface AccordionContextValue {
  uid: string;
  open: string[];
  toggle: (value: string) => void;
  headingLevel: 2 | 3 | 4 | 5 | 6;
}

export const AccordionContext = createContext<AccordionContextValue | null>(null);

export function useAccordion(): AccordionContextValue {
  const context = use(AccordionContext);
  if (!context) throw new Error("AccordionItem нужно размещать внутри Accordion");
  return context;
}

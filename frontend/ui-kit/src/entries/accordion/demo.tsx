/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { Accordion, AccordionItem } from "./index";
import "./accordion.force.css";

export type AccForce = "hover" | "active" | "focus";
export interface AccItem {
  id: string;
  t: string;
  icon?: IconName;
  ad?: string;
  body: ReactNode;
  off?: boolean;
}

const NONE: string[] = [];

export const ACC_ITEMS: AccItem[] = [
  {
    id: "how",
    t: "Как работает сверка",
    icon: "link",
    ad: "3 шага",
    body: "Документы загружаются из ЭДО и ПО таможни, затем сравниваются вес, код ТН ВЭД, число мест и получатель. Расхождения попадают в список «Расхождения».",
  },
  {
    id: "fix",
    t: "Что делать при расхождении",
    icon: "warn",
    body: "Откройте груз, посмотрите сравнение документов и примите значение прямо в ячейке или запросите исправленный документ у брокера.",
  },
  { id: "acl", t: "Права доступа", icon: "user", ad: "недоступно", off: true, body: "" },
  {
    id: "int",
    t: "Интеграции",
    icon: "gear",
    ad: "6",
    body: "1С, CRM, ПО таможни, ЭДО, портал порта и MDM-справочник.",
  },
];

export const DOCS_ITEMS: AccItem[] = [
  {
    id: "nak",
    t: "Накладная",
    icon: "doc",
    ad: "ЭДО",
    body: "Получена вчера в 09:15. Вес 18 420 кг, 24 места.",
  },
  {
    id: "dec",
    t: "Декларация",
    icon: "doc",
    ad: "ПО таможни",
    body: "Загружена вчера в 17:20. Вес 18 240 кг: расходится на 180 кг.",
  },
  { id: "inv", t: "Инвойс", icon: "doc", ad: "почта", body: "Получен 12 ноя. Мест 22 вместо 24." },
];

export function DemoAccordion({
  items = ACC_ITEMS,
  multiple,
  cards,
  open,
  defaultOpen = NONE,
  force,
  panelState,
}: {
  items?: AccItem[];
  multiple?: boolean;
  cards?: boolean;
  open?: string[];
  defaultOpen?: string[];
  force?: Record<string, AccForce | undefined>;
  panelState?: Record<string, "loading" | "error" | "empty">;
}) {
  return (
    <Accordion
      type={multiple ? "multiple" : "single"}
      variant={cards ? "cards" : "plain"}
      value={open}
      defaultValue={defaultOpen}
    >
      {items.map((x) => (
        <AccordionItem
          key={x.id}
          value={x.id}
          title={x.t}
          icon={x.icon ? <Icon name={x.icon} /> : undefined}
          hint={x.ad}
          disabled={x.off}
          status={panelState?.[x.id]}
          data-force={force?.[x.id]}
        >
          {x.body}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

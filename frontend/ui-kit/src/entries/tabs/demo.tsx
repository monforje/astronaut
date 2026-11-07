/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Tab, TabList, TabPanel, Tabs } from "./index";
import "./tabs.force.css";

export type TabForce = "hover" | "active" | "focus";
export interface DemoTab {
  id: string;
  label: string;
  count?: number | "loading";
  disabled?: boolean;
  error?: boolean;
}

export const CARGO_TABS: DemoTab[] = [
  { id: "all", label: "Все", count: 128 },
  { id: "err", label: "С расхождениями", count: 8 },
  { id: "wait", label: "Ждут документов", count: 14 },
  { id: "draft", label: "Черновики", count: 3 },
  { id: "arch", label: "Архив", disabled: true },
];

export function DemoTabs({
  tabs = CARGO_TABS,
  value,
  defaultValue,
  onValueChange,
  force,
  size,
  panels,
  label = "Фильтр грузов",
  scroll,
}: {
  tabs?: DemoTab[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  force?: Record<string, TabForce | undefined>;
  size?: "sm";
  panels?: Record<string, ReactNode>;
  label?: string;
  scroll?: boolean;
}) {
  return (
    <Tabs
      value={value}
      defaultValue={defaultValue ?? tabs.find((t) => !t.disabled)?.id}
      onValueChange={onValueChange}
      size={size}
    >
      <TabList aria-label={label} scroll={scroll}>
        {tabs.map((t) => (
          <Tab
            key={t.id}
            value={t.id}
            count={t.count}
            error={t.error}
            disabled={t.disabled}
            data-force={force?.[t.id]}
          >
            {t.label}
          </Tab>
        ))}
      </TabList>
      {panels
        ? Object.entries(panels).map(([id, content]) => (
            <TabPanel key={id} value={id}>
              {content}
            </TabPanel>
          ))
        : null}
    </Tabs>
  );
}

export const PANELS: Record<string, ReactNode> = {
  all: "128 грузов в работе: список целиком.",
  err: "8 грузов, где документы расходятся.",
  wait: "14 грузов ждут накладную или декларацию.",
  draft: "3 черновика, ещё не отправленных в работу.",
};

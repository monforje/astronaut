/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { panelId, tabId, useTabs } from "./tabs-context";

export interface TabPanelProps extends Omit<ComponentPropsWithRef<"div">, "value"> {
  value: string;
}

export function TabPanel({ value, className, children, ...rest }: TabPanelProps) {
  const context = useTabs("TabPanel");
  const selected = context.value === value;
  return (
    <div
      tabIndex={0}
      {...rest}
      role="tabpanel"
      id={panelId(context.uid, value)}
      aria-labelledby={tabId(context.uid, value)}
      hidden={!selected}
      className={cx("ds-tabs__panel", className)}
    >
      {selected ? children : null}
    </div>
  );
}

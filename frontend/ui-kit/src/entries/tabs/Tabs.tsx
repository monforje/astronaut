/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useMemo, useRef, type ComponentPropsWithRef } from "react";
import { cx, useControlled, useStableId } from "../../ui/internal";
import { TabsContext } from "./tabs-context";
import "./tabs.css";

export type TabsSize = "md" | "sm";

export interface TabsProps extends Omit<ComponentPropsWithRef<"div">, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  size?: TabsSize;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  size = "md",
  className,
  children,
  ...rest
}: TabsProps) {
  const uid = useStableId();
  const adopting = useRef(false);
  const [current, setCurrent] = useControlled<string | undefined>(value, defaultValue, (next) => {
    if (next !== undefined && !adopting.current) onValueChange?.(next);
  });
  const context = useMemo(
    () => ({
      uid,
      value: current,
      select: (next: string) => {
        if (next !== current) setCurrent(next);
      },
      adopt: (first: string) => {
        adopting.current = true;
        setCurrent(first);
        adopting.current = false;
      },
    }),
    [uid, current, setCurrent],
  );
  return (
    <TabsContext value={context}>
      <div {...rest} className={cx("ds-tabs", size === "sm" && "ds-tabs--sm", className)}>
        {children}
      </div>
    </TabsContext>
  );
}

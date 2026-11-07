/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { panelId, tabId, useTabs } from "./tabs-context";

export interface TabProps extends Omit<ComponentPropsWithRef<"button">, "value"> {
  value: string;
  count?: number | "loading";
  error?: boolean;
}

export function Tab({ value, count, error, className, onClick, children, ...rest }: TabProps) {
  const context = useTabs("Tab");
  const selected = context.value === value;
  return (
    <button
      type="button"
      aria-controls={panelId(context.uid, value)}
      {...rest}
      role="tab"
      id={tabId(context.uid, value)}
      data-tab={value}
      className={cx("ds-tabs__tab", className)}
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      data-error={error || undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
    >
      <span className="ds-tabs__in">
        <span className="ds-tabs__lbl" data-label={typeof children === "string" ? children : ""}>
          {children}
        </span>
        {count === "loading" ? (
          <span className="ds-tabs__cn ds-tabs__cn--load" role="img" aria-label="загрузка" />
        ) : count !== undefined ? (
          <span className="ds-tabs__cn" data-zero={count === 0 || undefined}>
            {count}
          </span>
        ) : null}
        {error ? <span className="ds-tabs__err" role="img" aria-label="есть ошибка" /> : null}
      </span>
    </button>
  );
}

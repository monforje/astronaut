/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx, Icon } from "../../ui/internal";

export type TopbarSearchRootProps = ComponentPropsWithRef<"label"> & {
  [attribute: `data-${string}`]: string | undefined;
};

export interface TopbarSearchProps extends ComponentPropsWithRef<"input"> {
  loading?: boolean;
  shortcut?: string | false;
  rootProps?: TopbarSearchRootProps;
}

export function TopbarSearch({
  loading,
  shortcut = "Ctrl K",
  rootProps,
  placeholder = "Поиск",
  className,
  ...rest
}: TopbarSearchProps) {
  return (
    <label
      {...rootProps}
      className={cx("ds-top__search", rootProps?.className)}
      data-loading={loading || undefined}
    >
      {loading ? (
        <span className="ds-top__spin" aria-hidden="true" />
      ) : (
        <span className="ds-top__lead" aria-hidden="true">
          <Icon name="search" size="sm" />
        </span>
      )}
      <input
        aria-label="Глобальный поиск"
        aria-keyshortcuts={shortcut ? "Control+K Meta+K" : undefined}
        aria-busy={loading || undefined}
        {...rest}
        placeholder={placeholder}
        className={className}
      />
      {shortcut ? (
        <kbd className="ds-top__kbd" aria-hidden="true">
          {shortcut}
        </kbd>
      ) : null}
    </label>
  );
}

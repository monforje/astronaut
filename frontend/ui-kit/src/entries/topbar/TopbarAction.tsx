/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../../ui/internal";

export interface TopbarActionProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  label: string;
  icon: ReactNode;
  badge?: number;
}

export function TopbarAction({
  label,
  icon,
  badge,
  type = "button",
  className,
  ...rest
}: TopbarActionProps) {
  return (
    <button
      aria-label={badge ? `${label}, ${badge} новых` : label}
      {...rest}
      type={type}
      className={cx("ds-top__ib", className)}
    >
      <span className="ds-top__ico" aria-hidden="true">
        {icon}
      </span>
      {badge ? (
        <span className="ds-top__badge" aria-hidden="true">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}

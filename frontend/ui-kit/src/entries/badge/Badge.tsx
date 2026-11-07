/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./badge.css";

export type BadgeTone = "ok" | "warn" | "err" | "info" | "idle";
export type BadgeForm = "dot" | "plain" | "tag" | "counter";
export type BadgeSize = "sm" | "md";

export interface BadgeProps extends ComponentPropsWithRef<"span"> {
  tone?: BadgeTone;
  form?: BadgeForm;
  size?: BadgeSize;
  solid?: boolean;
  pulse?: boolean;
  icon?: ReactNode;
}

export function Badge({
  tone = "idle",
  form = "dot",
  size = "md",
  solid,
  pulse,
  icon,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      {...rest}
      className={cx(
        "ds-badge",
        form === "counter" ? "ds-badge--counter" : `ds-badge--${tone}`,
        size === "sm" && "ds-badge--sm",
        form === "tag" && "ds-badge--tag",
        solid && "ds-badge--solid",
        pulse && "ds-badge--pulse",
        className,
      )}
    >
      {form === "dot" ? <span className="ds-badge__dot" aria-hidden="true" /> : null}
      {icon ? (
        <span className="ds-badge__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ds-badge__label">{children}</span>
    </span>
  );
}

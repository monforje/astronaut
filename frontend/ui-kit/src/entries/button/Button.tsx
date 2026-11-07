/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./button.css";

export type ButtonVariant =
  | "primary"
  | "accent"
  | "inverse"
  | "destructive"
  | "secondary"
  | "outline"
  | "ghost";

export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  square?: boolean;
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconEnd?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  square,
  block,
  loading,
  icon,
  iconEnd,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const hasLabel = children != null && children !== false;
  return (
    <button
      {...rest}
      type={type}
      className={cx(
        "ds-btn",
        `ds-btn--${variant}`,
        `ds-btn--${size}`,
        square && "ds-btn--sq",
        block && "ds-btn--block",
        className,
      )}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading ? (
        <span className="ds-btn__spin" aria-hidden="true" />
      ) : icon ? (
        <span className="ds-btn__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {hasLabel ? <span className="ds-btn__label">{children}</span> : null}
      {iconEnd ? (
        <span className="ds-btn__end" aria-hidden="true">
          {iconEnd}
        </span>
      ) : null}
    </button>
  );
}

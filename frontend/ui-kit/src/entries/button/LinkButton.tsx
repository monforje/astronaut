/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./button.css";

export type LinkButtonKind = "dashed" | "dotted" | "plain" | "next" | "ext" | "back";
export type LinkButtonSize = "xs" | "sm" | "md";

export interface LinkButtonProps extends ComponentPropsWithRef<"button"> {
  kind?: LinkButtonKind;
  size?: LinkButtonSize;
  loading?: boolean;
}

export function LinkButton({
  kind = "dashed",
  size = "md",
  loading,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx("ds-btn-link", `ds-btn-link--${kind}`, `ds-btn-link--${size}`, className)}
      aria-busy={loading || undefined}
      onClick={(event) => {
        if (loading) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {loading ? <span className="ds-btn__spin ds-btn-link__spin" aria-hidden="true" /> : null}
      {kind === "next" ? (
        <>
          <span className="ds-btn-link__tx">{children}</span>{" "}
          <span className="ds-btn-link__ar" aria-hidden="true">
            ›
          </span>
        </>
      ) : kind === "ext" ? (
        <>
          <span className="ds-btn-link__tx">{children}</span>
          <span className="ds-btn-link__ar" aria-hidden="true">
            ↗
          </span>
        </>
      ) : kind === "back" ? (
        <>
          <span aria-hidden="true">←</span> {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}

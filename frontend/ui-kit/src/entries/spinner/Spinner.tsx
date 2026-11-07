/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./spinner.css";

export type SpinnerSize = "txt" | "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerTone = "default" | "accent" | "warn" | "err";

export interface SpinnerProps extends ComponentPropsWithRef<"span"> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
  label?: string;
}

export function Spinner({
  size = "sm",
  tone = "default",
  label,
  className,
  ...rest
}: SpinnerProps) {
  return (
    <span
      {...rest}
      className={cx(
        "ds-spinner",
        size !== "sm" && `ds-spinner--${size}`,
        tone !== "default" && `ds-spinner--${tone}`,
        className,
      )}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

export interface SpinnerInlineProps extends ComponentPropsWithRef<"span"> {
  size?: SpinnerSize;
  tone?: SpinnerTone;
}

export function SpinnerInline({ size, tone, className, children, ...rest }: SpinnerInlineProps) {
  return (
    <span {...rest} className={cx("ds-spinner-inline", className)}>
      <Spinner size={size} tone={tone} />
      {children}
    </span>
  );
}

export function SpinnerDots({ className, children, ...rest }: ComponentPropsWithRef<"span">) {
  return (
    <span {...rest} className={cx("ds-spinner-inline", className)}>
      {children}
      <span className="ds-spinner-dots" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}

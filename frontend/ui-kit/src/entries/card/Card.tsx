/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, KeyboardEvent, ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./card.css";

export type CardVariant = "outline" | "elevated" | "filled" | "ghost" | "solid";
export type CardTone = "ok" | "warn" | "err";
export type CardElement = "div" | "article" | "section";

export interface CardProps extends ComponentPropsWithRef<"div"> {
  as?: CardElement;
  variant?: CardVariant;
  size?: "md" | "sm";
  flush?: boolean;
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  kpi?: boolean;
  tone?: CardTone;
}

export function Card({
  as = "div",
  variant = "outline",
  size = "md",
  flush,
  interactive,
  selected,
  disabled,
  kpi,
  tone,
  className,
  role,
  tabIndex,
  onKeyDown,
  children,
  ...rest
}: CardProps) {
  const Tag = as as "div";
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (
      interactive &&
      !disabled &&
      event.target === event.currentTarget &&
      !event.defaultPrevented &&
      event.key === "Enter"
    ) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };
  return (
    <Tag
      {...rest}
      className={cx(
        "ds-card",
        variant !== "outline" && `ds-card--${variant}`,
        size === "sm" && "ds-card--sm",
        flush && "ds-card--flush",
        interactive && "ds-card--link",
        selected && "ds-card--selected",
        kpi && "ds-card--kpi",
        tone && `ds-card--tone-${tone}`,
        className,
      )}
      role={role ?? (interactive ? "link" : undefined)}
      tabIndex={tabIndex ?? (interactive && !disabled ? 0 : undefined)}
      aria-disabled={disabled || undefined}
      aria-current={selected ? "true" : undefined}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Tag>
  );
}

export interface CardHeaderProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  icon?: ReactNode;
  muted?: boolean;
  action?: ReactNode;
}

export function CardHeader({ icon, muted, action, className, children, ...rest }: CardHeaderProps) {
  return (
    <div {...rest} className={cx("ds-card__head", className)}>
      {icon ? (
        <span className="ds-card__ico" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className={cx("ds-card__title", muted && "ds-card__title--muted")}>{children}</span>
      {action}
    </div>
  );
}

export interface CardFooterProps extends ComponentPropsWithRef<"div"> {
  two?: boolean;
}

export function CardFooter({ two, className, ...rest }: CardFooterProps) {
  return <div {...rest} className={cx("ds-card__foot", two && "ds-card__foot--two", className)} />;
}

export interface CardBarProps extends ComponentPropsWithRef<"div"> {
  sub?: ReactNode;
}

export function CardBar({ sub, className, children, ...rest }: CardBarProps) {
  return (
    <div {...rest} className={cx("ds-card__h", className)}>
      {children}
      {sub ? <span className="ds-card__h-sub">{sub}</span> : null}
    </div>
  );
}

export function CardBody({ className, ...rest }: ComponentPropsWithRef<"div">) {
  return <div {...rest} className={cx("ds-card__b", className)} />;
}

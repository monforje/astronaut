/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import { Button } from "../button";
import "./menu.css";

export interface DropdownTriggerButtonProps extends ComponentPropsWithRef<"button"> {
  kind?: "button" | "icon";
  triggerLabel?: string;
}

export function DropdownTrigger({
  kind = "button",
  triggerLabel = "Действия",
  className,
  ...rest
}: DropdownTriggerButtonProps) {
  if (kind === "icon") {
    return (
      <Button
        aria-label={triggerLabel === "Действия" ? "Ещё" : triggerLabel}
        {...rest}
        variant="ghost"
        size="md"
        square
        className={cx("ds-menu__trigger-icon", className)}
        icon={<Icon name="more" />}
      />
    );
  }
  return (
    <Button
      {...rest}
      variant="outline"
      size="sm"
      className={cx("ds-menu__trigger", className)}
      iconEnd={<Icon name="chev" size="sm" className="ds-menu__caret" />}
    >
      {triggerLabel}
    </Button>
  );
}

export interface DropdownMenuProps extends ComponentPropsWithRef<"div"> {
  label: string;
}

export function DropdownMenu({ label, className, children, ...rest }: DropdownMenuProps) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- keydown на role=menu: стрелки и Esc обрабатывает само меню
    <div
      {...rest}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      className={cx("ds-menu", className)}
    >
      {children}
    </div>
  );
}

export function DropdownSeparator({ className, ...rest }: ComponentPropsWithRef<"hr">) {
  return <hr {...rest} className={cx("ds-menu__sep", className)} />;
}

export function DropdownLabel({ className, children, ...rest }: ComponentPropsWithRef<"div">) {
  return (
    <div {...rest} className={cx("ds-menu__label", className)} role="presentation">
      {children}
    </div>
  );
}

export interface DropdownHeaderProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  avatar?: ReactNode;
}

export function DropdownHeader({
  title,
  subtitle,
  avatar,
  className,
  ...rest
}: DropdownHeaderProps) {
  return (
    <div {...rest} role="presentation" className={className}>
      <div className="ds-menu__head">
        {avatar}
        <span>
          <b>{title}</b>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
      </div>
      <hr className="ds-menu__sep ds-menu__sep--head" />
    </div>
  );
}

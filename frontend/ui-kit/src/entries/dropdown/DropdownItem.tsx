/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { createContext, use, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx } from "../../ui/internal";
import "../checkbox/checkbox.css";
import "./menu.css";

export interface DropdownContext {
  closeMenu: () => void;
}

export const MenuContext = createContext<DropdownContext | null>(null);

export interface DropdownItemProps extends Omit<
  ComponentPropsWithRef<"button">,
  "onSelect" | "role"
> {
  icon?: ReactNode;
  hint?: ReactNode;
  shortcut?: ReactNode;
  danger?: boolean;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onSelect?: () => void;
}

export function DropdownItem({
  icon,
  hint,
  shortcut,
  danger,
  checked,
  defaultChecked,
  onCheckedChange,
  onSelect,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: DropdownItemProps) {
  const menu = use(MenuContext);
  const checkable = checked !== undefined || defaultChecked !== undefined;
  const [own, setOwn] = useState(defaultChecked ?? false);
  const on = checked ?? own;
  return (
    <button
      {...rest}
      type={type}
      role={checkable ? "menuitemcheckbox" : "menuitem"}
      aria-checked={checkable ? on : undefined}
      tabIndex={-1}
      className={cx("ds-menu__item", danger && "ds-menu__item--danger", className)}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        onSelect?.();
        if (checkable) {
          setOwn(!on);
          onCheckedChange?.(!on);
        } else {
          menu?.closeMenu();
        }
      }}
    >
      {checkable ? (
        <input
          type="checkbox"
          className="ds-check"
          tabIndex={-1}
          aria-hidden="true"
          checked={on}
          readOnly
        />
      ) : icon ? (
        <span className="ds-menu__ico" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ds-menu__tx">
        {children}
        {hint ? <small>{hint}</small> : null}
      </span>
      {shortcut ? <span className="ds-menu__end">{shortcut}</span> : null}
    </button>
  );
}

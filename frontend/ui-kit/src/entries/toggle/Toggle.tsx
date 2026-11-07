/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, useControlled } from "../../ui/internal";
import "./toggle.css";

export type ToggleVariant = "pill" | "chip" | "ghost";
export type ToggleSize = "sm" | "md";

export interface ToggleProps extends Omit<ComponentPropsWithRef<"button">, "value"> {
  variant?: ToggleVariant;
  size?: ToggleSize;
  square?: boolean;
  icon?: ReactNode;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

export function Toggle({
  variant = "pill",
  size = "sm",
  square,
  icon,
  pressed,
  defaultPressed = false,
  onPressedChange,
  type = "button",
  className,
  onClick,
  children,
  ...rest
}: ToggleProps) {
  const [on, setOn] = useControlled(pressed, defaultPressed, onPressedChange);
  const hasLabel = children != null && children !== false;
  return (
    <button
      {...rest}
      type={type}
      className={cx(
        "ds-toggle",
        variant !== "pill" && `ds-toggle--${variant}`,
        size === "md" && "ds-toggle--md",
        square && "ds-toggle--sq",
        className,
      )}
      aria-pressed={on}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        setOn(!on);
      }}
    >
      {icon ? (
        <span className="ds-toggle__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {hasLabel ? <span className="ds-toggle__label">{children}</span> : null}
    </button>
  );
}

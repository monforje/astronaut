/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, useControlled } from "../../ui/internal";
import "./switch.css";

export type SwitchSize = "md" | "sm";

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "role"
> {
  size?: SwitchSize;
  label?: ReactNode;
  onCheckedChange?: (checked: boolean) => void;
}

export function Switch({
  size = "md",
  label,
  checked,
  defaultChecked = false,
  onCheckedChange,
  onChange,
  className,
  ...rest
}: SwitchProps) {
  const [on, setOn] = useControlled(checked, defaultChecked, onCheckedChange);
  const control = (
    <input
      {...rest}
      type="checkbox"
      role="switch"
      className={cx("ds-switch", size === "sm" && "ds-switch--sm", !label && className)}
      checked={on}
      aria-checked={on}
      onChange={(event) => {
        onChange?.(event);
        setOn(event.target.checked);
      }}
    />
  );
  if (!label) return control;
  return (
    <label className={cx("ds-switch__label", className)}>
      {control}
      {label}
    </label>
  );
}

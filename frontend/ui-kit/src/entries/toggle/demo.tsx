/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { Icon, type IconName } from "@/engine/Icon";
import { Toggle, type ToggleProps } from "./index";
import "./toggle.force.css";

export type { ToggleVariant } from "./index";
export type ToggleForce = "hover" | "active" | "focus";

export interface DemoToggleProps extends Omit<ToggleProps, "icon" | "ref"> {
  icon?: IconName;
  force?: ToggleForce;
  label?: string;
}

export function DemoToggle({ icon, force, label, ...rest }: DemoToggleProps) {
  return (
    <Toggle
      {...rest}
      data-force={force}
      aria-label={label}
      icon={icon ? <Icon name={icon} size="sm" /> : undefined}
    />
  );
}

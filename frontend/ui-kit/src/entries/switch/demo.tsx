/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { SettingRow, Switch, type SwitchProps } from "./index";
import "./switch.force.css";

export type SwitchForce = "hover" | "focus";

export interface DemoSwitchProps extends Omit<SwitchProps, "label" | "ref"> {
  force?: SwitchForce;
  label?: string;
}

export function DemoSwitch({ force, label, ...rest }: DemoSwitchProps) {
  return <Switch {...rest} data-force={force} aria-label={label} />;
}

export function DemoSwitchRow({
  title,
  hint,
  checked,
  defaultChecked,
  disabled,
  force,
}: {
  title: string;
  hint?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  force?: SwitchForce;
}) {
  return (
    <SettingRow title={title} hint={hint}>
      <DemoSwitch
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        force={force}
      />
    </SettingRow>
  );
}

export function DemoSwitchList({ children }: { children: ReactNode }) {
  return <div className="ds-switch__list">{children}</div>;
}

export function DemoSwitchLabel({
  size,
  defaultChecked,
  disabled,
  children,
}: {
  size?: "sm";
  defaultChecked?: boolean;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Switch size={size} defaultChecked={defaultChecked} disabled={disabled} label={children} />
  );
}

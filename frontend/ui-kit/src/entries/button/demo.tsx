/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { Button, ButtonGroup, LinkButton, type ButtonProps, type LinkButtonProps } from "./index";
import "./button.force.css";

export type { ButtonSize, ButtonVariant, LinkButtonKind as LinkKind } from "./index";
export type Force = "hover" | "active" | "focus";

export interface DemoButtonProps extends Omit<ButtonProps, "icon" | "iconEnd" | "ref"> {
  force?: Force;
  icon?: IconName;
  iconEnd?: IconName;
  label?: string;
  pressed?: boolean;
  expanded?: boolean;
}

export function DemoButton({
  force,
  icon,
  iconEnd,
  label,
  pressed,
  expanded,
  ...rest
}: DemoButtonProps) {
  return (
    <Button
      {...rest}
      data-force={force}
      aria-label={label}
      aria-pressed={pressed}
      aria-expanded={expanded}
      icon={icon ? <Icon name={icon} /> : undefined}
      iconEnd={iconEnd ? <Icon name={iconEnd} /> : undefined}
    />
  );
}

export interface DemoLinkProps extends Omit<LinkButtonProps, "ref"> {
  force?: Force;
}

export function DemoLink({ force, ...rest }: DemoLinkProps) {
  return <LinkButton {...rest} data-force={force} />;
}

export function DemoButtonGroup({ children }: { children: ReactNode }) {
  return <ButtonGroup>{children}</ButtonGroup>;
}

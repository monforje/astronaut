/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/engine/Icon";
import { DemoButton } from "../button/demo";
import { Alert, type AlertTone } from "./index";
import "./alert.force.css";

export type { AlertTone } from "./index";
export type Force = "hover" | "active" | "focus";

export const TONE_ICON: Record<AlertTone, IconName> = {
  accent: "info",
  info: "info",
  ok: "check",
  warn: "warn",
  err: "alert",
  neutral: "info",
  plain: "info",
};

export interface AlertAction {
  text: string;
  variant?: "ghost" | "primary" | "destructive" | "outline";
  force?: Force;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

const NO_ACTIONS: AlertAction[] = [];
const NOOP = () => undefined;

export function DemoAlert({
  tone = "accent",
  layout = "inline",
  title,
  hint,
  actions = NO_ACTIONS,
  onClose,
  closeForce,
  closed,
  icon,
  role,
}: {
  tone?: AlertTone;
  layout?: "inline" | "stacked";
  title: ReactNode;
  hint?: ReactNode;
  actions?: AlertAction[];
  onClose?: () => void;
  closeForce?: Force;
  closed?: boolean;
  icon?: IconName;
  role?: "alert" | "status";
}) {
  return (
    <Alert
      tone={tone}
      layout={layout}
      title={title}
      hint={hint}
      icon={<Icon name={icon ?? TONE_ICON[tone]} size="sm" />}
      role={role}
      closed={closed}
      onClose={onClose ?? (closeForce ? NOOP : undefined)}
      actions={
        actions.length
          ? actions.map((a) => (
              <DemoButton
                key={a.text}
                variant={a.variant ?? "ghost"}
                size="sm"
                force={a.force}
                disabled={a.disabled}
                loading={a.loading}
                onClick={a.onClick}
              >
                {a.text}
              </DemoButton>
            ))
          : undefined
      }
      closeButtonProps={closeForce ? ({ "data-force": closeForce } as object) : undefined}
    />
  );
}

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- обёртка отключённой кнопки фокусируется, чтобы показать причину недоступности */
import type { ReactElement, ReactNode } from "react";
import { Button } from "../button/Button";
import { Tooltip, TooltipCard as Card, type TooltipSide } from "./index";
import "./tooltip.force.css";

export type TipSide = TooltipSide;

export function TooltipCard({
  children,
  kbd,
  wrap,
}: {
  children: ReactNode;
  kbd?: string;
  wrap?: boolean;
}) {
  return (
    <Card content={children} kbd={kbd} wrap={wrap} role="tooltip" className="ds-tooltip--static" />
  );
}

export function DemoTip({
  text,
  kbd,
  side = "top",
  force,
  wrap,
  children,
}: {
  text: ReactNode;
  kbd?: string;
  side?: TipSide;
  force?: "hover" | "focus";
  wrap?: boolean;
  children: (describedBy: string) => ReactNode;
}) {
  return (
    <Tooltip
      content={text}
      kbd={kbd}
      side={side}
      wrap={wrap}
      open={force ? true : undefined}
      flip={!force}
    >
      {children("") as ReactElement<Record<string, unknown>>}
    </Tooltip>
  );
}

export function WhyTip({ text, children }: { text: string; children: ReactNode }) {
  return (
    <Tooltip content={text} side="bottom" open flip={false}>
      <span className="ds-tooltip-anchor__why" tabIndex={0}>
        <TipButton describedBy="" disabled>
          {children}
        </TipButton>
      </span>
    </Tooltip>
  );
}

export function TipButton({
  describedBy,
  children,
  variant = "outline",
  size = "sm",
  square,
  label,
  force,
  disabled,
  "aria-describedby": ariaDescribedBy,
}: {
  describedBy: string;
  children: ReactNode;
  variant?: "outline" | "primary" | "ghost";
  size?: "sm" | "md";
  square?: boolean;
  label?: string;
  force?: "hover" | "active" | "focus";
  disabled?: boolean;
  "aria-describedby"?: string;
}) {
  return (
    <Button
      variant={variant}
      size={size}
      square={square}
      aria-describedby={describedBy || ariaDescribedBy}
      className="ds-tooltip-btn"
      aria-label={label}
      data-force={force}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}

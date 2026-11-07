/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { cx } from "../../ui/internal";
import { Spinner } from "../spinner/Spinner";
import { clampPercent } from "./Progress";
import "./progress.css";

export type ProgressButtonStatus = "running" | "done" | "err";

export interface ProgressButtonProps extends ComponentPropsWithRef<"button"> {
  value?: number;
  status?: ProgressButtonStatus;
}

export function ProgressButton({
  value = 0,
  status,
  type = "button",
  className,
  style,
  onClick,
  children,
  ...rest
}: ProgressButtonProps) {
  const running = status === "running";
  const percent = clampPercent(value);
  return (
    <button
      {...rest}
      type={type}
      className={cx("ds-progress-btn", className)}
      style={{ ...style, "--ds-progress-v": `${percent}%` } as CSSProperties}
      data-status={status}
      aria-busy={running || undefined}
      onClick={(event) => {
        if (running) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {running ? <Spinner size="xs" /> : null}
      {children}
    </button>
  );
}

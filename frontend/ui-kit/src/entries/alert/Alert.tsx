/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx, Icon, type IconName } from "../../ui/internal";
import { Button } from "../button";
import "./alert.css";

export type AlertTone = "accent" | "info" | "ok" | "warn" | "err" | "neutral" | "plain";
export type AlertLayout = "inline" | "stacked";

const TONE_ICON = {
  accent: "info",
  info: "info",
  ok: "check",
  warn: "warn",
  err: "alert",
  neutral: "info",
  plain: "info",
} as const satisfies Record<AlertTone, IconName>;

function ToneIcon({ tone }: { tone: AlertTone }) {
  return <Icon name={TONE_ICON[tone]} size="sm" className="ds-alert__icon" />;
}

export interface AlertProps extends Omit<ComponentPropsWithRef<"div">, "title" | "role"> {
  tone?: AlertTone;
  layout?: AlertLayout;
  title: ReactNode;
  hint?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  closed?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  closeButtonProps?: ComponentPropsWithRef<"button">;
  role?: "alert" | "status";
}

export function Alert({
  tone = "accent",
  layout = "inline",
  title,
  hint,
  actions,
  icon,
  closed,
  onClose,
  closeLabel = "Закрыть",
  closeButtonProps,
  role,
  className,
  ...rest
}: AlertProps) {
  const inline = layout === "inline";
  const actionRow = actions ? <div className="ds-alert__actions">{actions}</div> : null;
  return (
    <div
      {...rest}
      className={cx("ds-alert", className)}
      data-closed={closed || undefined}
      inert={closed || undefined}
    >
      <div className="ds-alert__clip">
        <div
          className={cx(
            "ds-alert__panel",
            `ds-alert__panel--${tone}`,
            inline && "ds-alert__panel--inline",
          )}
          role={role ?? (tone === "err" || tone === "warn" ? "alert" : "status")}
        >
          {icon ? (
            <span className="ds-alert__icon ds-alert__icon--custom" aria-hidden="true">
              {icon}
            </span>
          ) : (
            <ToneIcon tone={tone} />
          )}
          <div className="ds-alert__body">
            <span>
              <b>{title}</b>
              {inline && hint ? <> {hint}</> : null}
            </span>
            {!inline && hint ? <span className="ds-alert__hint">{hint}</span> : null}
            {inline ? null : actionRow}
          </div>
          {inline ? actionRow : null}
          {onClose ? (
            <Button
              variant="ghost"
              size="xs"
              square
              aria-label={closeLabel}
              {...closeButtonProps}
              className={cx("ds-alert__close", closeButtonProps?.className)}
              icon={<Icon name="x" size="xs" />}
              onClick={(event) => {
                closeButtonProps?.onClick?.(event);
                onClose();
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

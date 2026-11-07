/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions -- карточка тоста стоит в порядке Tab, Esc закрывает её */
import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx, Icon, type IconName } from "../../ui/internal";
import { Button } from "../button/Button";
import { Spinner } from "../spinner/Spinner";
import type { ToastEntry, ToastOptions, ToastTone } from "./store";
import "./toast.css";

const TONE_ICON = {
  ok: "check",
  info: "info",
  warn: "warn",
  err: "alert",
} as const satisfies Record<ToastTone, IconName>;

function ToneIcon({ tone }: { tone: ToastTone }) {
  return <Icon name={TONE_ICON[tone]} />;
}

export interface ToastContentProps {
  options: ToastOptions;
  onAction?: () => void;
  onClose?: () => void;
  closeLabel?: string;
}

export function ToastContent({
  options,
  onAction,
  onClose,
  closeLabel = "Закрыть",
}: ToastContentProps) {
  const { tone = "ok", title, description, action, loading, icon } = options;
  return (
    <div className="ds-toast__content">
      <span className={cx("ds-toast__icon", tone !== "ok" && `ds-toast__icon--${tone}`)}>
        {loading ? <Spinner size="md" /> : (icon ?? <ToneIcon tone={tone} />)}
      </span>
      <span className="ds-toast__text">
        <b>{title}</b>
        {description ? <span>{description}</span> : null}
      </span>
      <span className="ds-toast__end">
        {action ? (
          <Button
            variant="outline"
            size="sm"
            {...action.buttonProps}
            onClick={(event) => {
              action.buttonProps?.onClick?.(event);
              onAction?.();
            }}
          >
            {action.label}
          </Button>
        ) : null}
        <Button variant="ghost" size="xs" square aria-label={closeLabel} onClick={onClose}>
          <Icon name="x" size="sm" />
        </Button>
      </span>
    </div>
  );
}

export interface ToastCardProps extends Omit<ComponentPropsWithRef<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: ToastOptions["action"];
  loading?: boolean;
  icon?: ReactNode;
}

export function ToastCard({
  title,
  description,
  tone,
  action,
  loading,
  icon,
  className,
  ...rest
}: ToastCardProps) {
  return (
    <div
      tabIndex={0}
      aria-live="polite"
      {...rest}
      className={cx("ds-toast ds-toast--static", className)}
      role="status"
    >
      <ToastContent options={{ title, description, tone, action, loading, icon }} />
    </div>
  );
}

export interface ToastItemViewProps {
  entry: ToastEntry;
  onAction?: (id: number) => void;
  onClose?: (id: number) => void;
}

export function ToastItemView({ entry, onAction, onClose }: ToastItemViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => ref.current?.setAttribute("data-mounted", ""));
    return () => cancelAnimationFrame(frame);
  }, []);
  const { cardProps } = entry;
  return (
    <div
      tabIndex={0}
      {...cardProps}
      ref={ref}
      className={cx("ds-toast", cardProps?.className)}
      data-id={entry.id}
      role="status"
      data-closing={entry.closing || undefined}
      onKeyDown={(event) => {
        cardProps?.onKeyDown?.(event);
        if (event.key === "Escape") onClose?.(entry.id);
      }}
    >
      <ToastContent
        options={entry}
        onAction={() => {
          entry.action?.onClick?.();
          onAction?.(entry.id);
        }}
        onClose={() => onClose?.(entry.id)}
      />
    </div>
  );
}

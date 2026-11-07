/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Icon, cx } from "../../ui/internal";
import { Tooltip } from "../tooltip";
import "./voyage.css";

export type VoyageStatus = "transit" | "wait" | "arrived" | "delay";

const STATUS_TEXT: Record<VoyageStatus, string> = {
  transit: "в пути",
  wait: "ожидает отплытия",
  arrived: "прибыл",
  delay: "задержка",
};

const pad2 = (n: number) => String(n).padStart(2, "0");

function shortDate(value: Date | string | undefined): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  return `${pad2(value.getDate())}.${pad2(value.getMonth() + 1)}`;
}

export interface VoyageProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  from: string;
  to: string;
  progress: number;
  vessel?: string;
  status?: VoyageStatus;
  statusText?: string;
  departure?: Date | string;
  arrival?: Date | string;
  compact?: boolean;
  loading?: boolean;
  empty?: boolean;
  error?: boolean;
  emptyText?: ReactNode;
  errorText?: ReactNode;
  tipOpen?: boolean;
  animate?: boolean;
  children?: ReactNode;
}

export function Voyage({
  from,
  to,
  progress,
  vessel = "Судно",
  status = "transit",
  statusText,
  departure,
  arrival,
  compact,
  loading,
  empty,
  error,
  emptyText = "Судно появится, когда груз получит рейс",
  errorText = "Данные о положении судна недоступны",
  tipOpen,
  animate = true,
  className,
  style,
  children,
  ...rest
}: VoyageProps) {
  const [mounted, setMounted] = useState(!animate);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (empty)
    return (
      <div {...rest} className={cx("ds-voyage__note", className)} style={style}>
        <b>Рейс не назначен</b>
        <span>{emptyText}</span>
      </div>
    );
  if (error)
    return (
      <div
        {...rest}
        className={cx("ds-voyage__note", className)}
        style={style}
        data-tone="err"
        role="alert"
      >
        <b>Нет данных о рейсе</b>
        <span>{errorText}</span>
      </div>
    );

  const value = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const pct = Math.round(value * 100);
  const text = statusText ?? STATUS_TEXT[status];

  return (
    <div
      {...rest}
      className={cx("ds-voyage", className)}
      style={{ ...style, "--ds-voyage-p": mounted ? value : 0 } as CSSProperties}
      data-tone={status === "delay" ? "warn" : undefined}
      aria-busy={loading || undefined}
    >
      {loading ? (
        <div className="ds-voyage__skel" />
      ) : (
        <div
          className="ds-voyage__track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${vessel}, ${text}: ${from} → ${to}, ${pct} %`}
          aria-label="Прогресс рейса"
        >
          <span className="ds-voyage__line" data-dashed={status === "wait" || undefined} />
          <span className="ds-voyage__done" />
          <span
            className="ds-voyage__dot ds-voyage__dot--start"
            data-on={status !== "wait" || undefined}
          />
          <span
            className="ds-voyage__dot ds-voyage__dot--end"
            data-on={status === "arrived" || undefined}
          />
          <Tooltip
            className="ds-voyage__shipbox"
            content={`${vessel} · ${pct} %`}
            side="top"
            open={tipOpen}
          >
            <button
              type="button"
              className="ds-voyage__ship"
              data-wait={status === "wait" || undefined}
              aria-label={`${vessel}: ${pct} %`}
            >
              <Icon name="ship" />
            </button>
          </Tooltip>
        </div>
      )}
      {compact ? null : (
        <div className="ds-voyage__labels">
          <span>
            <b>{from}</b>
            {departure === undefined ? null : `отплытие ${shortDate(departure)}`}
          </span>
          <span>
            <b>{pct}%</b>
            {text}
          </span>
          <span>
            <b>{to}</b>
            {arrival === undefined ? null : `прибытие ${shortDate(arrival)}`}
          </span>
        </div>
      )}
      {children ? <div className="ds-voyage__badges">{children}</div> : null}
    </div>
  );
}

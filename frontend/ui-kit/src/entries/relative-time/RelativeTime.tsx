/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { Tooltip } from "../tooltip";
import { formatExact, formatRelative, isValidDate, toDate } from "./relative";
import { useTicker } from "./ticker";
import "./relative-time.css";

export interface RelativeTimeProps extends Omit<
  ComponentPropsWithRef<"time">,
  "dateTime" | "children"
> {
  date?: Date | string | number | null;
  now?: Date;
  plain?: boolean;
  muted?: boolean;
  loading?: boolean;
  open?: boolean;
  emptyText?: string;
  invalidText?: string;
}

export function RelativeTime({
  date,
  now: nowProp,
  plain,
  muted,
  loading,
  open: openProp,
  emptyText = "—",
  invalidText = "Дата неизвестна",
  className,
  ...rest
}: RelativeTimeProps) {
  const parsed = toDate(date);
  const live = useTicker(1000, nowProp === undefined && !!parsed && !loading);

  if (loading) return <span className="ds-reltime__skel" aria-busy="true" />;
  if (!parsed) return <span className="ds-reltime__empty">{emptyText}</span>;
  if (!isValidDate(parsed))
    return (
      <span className="ds-reltime ds-reltime--err" title={invalidText}>
        {invalidText}
      </span>
    );

  const now = nowProp ?? new Date(live);
  const text = formatRelative(parsed, now);
  const exact = formatExact(parsed);
  const time = (
    <time
      {...rest}
      className={cx("ds-reltime", plain && "ds-reltime--plain", className)}
      dateTime={parsed.toISOString()}
      tabIndex={plain ? undefined : (rest.tabIndex ?? 0)}
      data-muted={muted || undefined}
      aria-label={`${text}, ${exact}`}
    >
      {text}
    </time>
  );
  if (plain) return time;
  return (
    <Tooltip content={exact} side="top" open={openProp}>
      {time}
    </Tooltip>
  );
}

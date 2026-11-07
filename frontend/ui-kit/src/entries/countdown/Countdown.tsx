/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { cx, Icon, usePrefersReducedMotion } from "../../ui/internal";
import { Badge } from "../badge";
import { pad2 } from "../calendar/dates";
import { toDate } from "../relative-time/relative";
import { useTicker } from "../relative-time/ticker";
import { compactLeft, secondsLeft, splitSeconds, toneOf, type CountdownTone } from "./countdown";
import "./countdown.css";

export interface CountdownProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  to: Date | string | number;
  now?: Date;
  label?: string;
  hideDays?: boolean;
  showSeconds?: boolean;
  warnBelow?: number;
  tone?: CountdownTone;
  loading?: boolean;
  paused?: boolean;
  onExpire?: () => void;
}

export function Countdown({
  to,
  now: nowProp,
  label = "Обратный отсчёт",
  hideDays,
  showSeconds,
  warnBelow,
  tone,
  loading,
  paused,
  onExpire,
  className,
  ...rest
}: CountdownProps) {
  const reduced = usePrefersReducedMotion();
  const seconds = showSeconds ?? !reduced;
  const target = toDate(to) ?? new Date(Number.NaN);
  const live = useTicker(seconds ? 1000 : 60000, nowProp === undefined && !loading);
  const [frozen, setFrozen] = useState<number | null>(null);
  if (paused && frozen === null) setFrozen(live);
  if (!paused && frozen !== null) setFrozen(null);
  const nowMs = nowProp?.getTime() ?? (paused ? (frozen ?? live) : live);
  const left = Number.isNaN(target.getTime()) ? 0 : secondsLeft(target, nowMs);
  const expired = useRef(false);
  useEffect(() => {
    if (left > 0) expired.current = false;
    else if (!expired.current && !loading && !paused) {
      expired.current = true;
      onExpire?.();
    }
  }, [left, loading, paused, onExpire]);

  const parts = splitSeconds(left);
  const resolved = tone ?? toneOf(left, warnBelow);
  const cells: [string, string][] = [
    [String(parts.d), "дн"],
    [pad2(parts.h), "ч"],
    [pad2(parts.m), "мин"],
    ...(seconds ? [[pad2(parts.s), "сек"] as [string, string]] : []),
  ];
  const shown = hideDays && parts.d === 0 ? cells.slice(1) : cells;
  return (
    <span
      {...rest}
      className={cx("ds-countdown", className)}
      role="timer"
      aria-label={label}
      aria-busy={loading || undefined}
      data-tone={resolved === "ok" ? undefined : resolved}
      data-paused={paused || undefined}
    >
      {shown.map(([value, unit]) => (
        <span className="ds-countdown__cell" key={unit}>
          {loading ? (
            <span className="ds-countdown__skel" />
          ) : (
            <b className="ds-countdown__num">{value}</b>
          )}
          <small className="ds-countdown__unit">{unit}</small>
        </span>
      ))}
    </span>
  );
}

export interface CountdownBadgeProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  to: Date | string | number;
  now?: Date;
  prefix?: string;
  expiredText?: string;
  warnBelow?: number;
}

export function CountdownBadge({
  to,
  now: nowProp,
  prefix = "до",
  expiredText = "срок вышел",
  warnBelow,
  ...rest
}: CountdownBadgeProps) {
  const target = toDate(to) ?? new Date(Number.NaN);
  const live = useTicker(60000, nowProp === undefined);
  const left = Number.isNaN(target.getTime()) ? 0 : secondsLeft(target, nowProp?.getTime() ?? live);
  return (
    <Badge {...rest} tone={toneOf(left, warnBelow)} form="plain" icon={<Icon name="clock" />}>
      {left <= 0 ? expiredText : `${prefix} ${compactLeft(left)}`}
    </Badge>
  );
}

export interface CountdownTextProps extends Omit<ComponentPropsWithRef<"span">, "title"> {
  title: ReactNode;
  tone?: "err";
}

export function CountdownText({ title, tone, className, children, ...rest }: CountdownTextProps) {
  return (
    <span {...rest} className={cx("ds-countdown__text", className)} data-tone={tone}>
      <Icon name="clock" size="sm" />
      <span className="ds-countdown__body">
        <b>{title}</b> {children}
      </span>
    </span>
  );
}

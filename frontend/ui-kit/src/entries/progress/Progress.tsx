/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, CSSProperties } from "react";
import { cx } from "../../ui/internal";
import "./progress.css";

export type ProgressTone = "primary" | "info" | "warn" | "err" | "idle";
export type ProgressSize = "sm" | "md" | "lg";

export function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export interface ProgressProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label: string;
  value?: number;
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
  indeterminate?: boolean;
  striped?: boolean;
  bare?: boolean;
}

export function Progress({
  label,
  value = 0,
  valueText,
  tone = "primary",
  size = "md",
  indeterminate,
  striped,
  bare,
  className,
  style,
  ...rest
}: ProgressProps) {
  const percent = clampPercent(value);
  const text = indeterminate ? "неопределённо" : (valueText ?? `${Math.round(percent)}%`);
  return (
    <div
      {...rest}
      className={cx(
        "ds-progress",
        tone !== "primary" && `ds-progress--${tone}`,
        size !== "md" && `ds-progress--${size}`,
        indeterminate && "ds-progress--ind",
        striped && !indeterminate && "ds-progress--str",
        className,
      )}
      style={{ ...style, "--ds-progress-v": `${percent}%` } as CSSProperties}
    >
      {bare ? null : (
        <div className="ds-progress__head">
          <span className="ds-progress__label">{label}</span>
          <b className="ds-progress__value">{text}</b>
        </div>
      )}
      <div
        className="ds-progress__track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={indeterminate ? undefined : Math.round(percent)}
        aria-valuetext={indeterminate ? "выполняется" : text}
      >
        <div className="ds-progress__fill" />
      </div>
    </div>
  );
}

export interface ProgressCircleProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  value: number;
  label: string;
  tone?: "primary" | "info" | "warn";
}

const CIRCLE_RADIUS = 24;
const CIRCLE_LENGTH = 2 * Math.PI * CIRCLE_RADIUS;

export function ProgressCircle({
  value,
  label,
  tone = "primary",
  className,
  ...rest
}: ProgressCircleProps) {
  const percent = clampPercent(value);
  return (
    <span
      {...rest}
      className={cx(
        "ds-progress-circ",
        tone !== "primary" && `ds-progress-circ--${tone}`,
        className,
      )}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <circle className="ds-progress-circ__bg" cx="28" cy="28" r={CIRCLE_RADIUS} />
        <circle
          className="ds-progress-circ__fg"
          cx="28"
          cy="28"
          r={CIRCLE_RADIUS}
          strokeDasharray={CIRCLE_LENGTH}
          strokeDashoffset={CIRCLE_LENGTH * (1 - percent / 100)}
        />
      </svg>
      <b>{Math.round(percent)}%</b>
    </span>
  );
}

export interface ProgressSegmentsProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  total: number;
  value: number;
  error?: number;
  label: string;
}

export function ProgressSegments({
  total,
  value,
  error,
  label,
  className,
  ...rest
}: ProgressSegmentsProps) {
  return (
    <span
      {...rest}
      className={cx("ds-progress-seg", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={error === undefined ? `${value} из ${total}` : "ошибка"}
    >
      {Array.from({ length: total }, (_, index) => (
        <i
          key={index}
          data-on={index < value || undefined}
          data-err={index === error || undefined}
        />
      ))}
    </span>
  );
}

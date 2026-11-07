/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./skeleton.css";

export type SkeletonShape = "rect" | "round" | "item";
export type SkeletonAnimation = "wave" | "pulse" | "none";

export interface SkeletonProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  width?: string | number;
  height?: number;
  shape?: SkeletonShape;
}

export function Skeleton({
  width = "100%",
  height = 12,
  shape = "rect",
  className,
  style,
  ...rest
}: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      {...rest}
      className={cx("ds-skel", `ds-skel--${shape}`, className)}
      style={{ ...style, width, height }}
    />
  );
}

export interface SkeletonGroupProps extends ComponentPropsWithRef<"div"> {
  animation?: SkeletonAnimation;
  loading?: boolean;
  label?: string;
}

export function SkeletonGroup({
  animation = "wave",
  loading = true,
  label = "Загрузка…",
  className,
  children,
  ...rest
}: SkeletonGroupProps) {
  return (
    <div
      {...rest}
      className={cx("ds-skel-group", className)}
      data-anim={animation}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="ds-skel-sr">{label}</span> : null}
      {children}
    </div>
  );
}

export interface SkeletonRowProps extends ComponentPropsWithRef<"div"> {
  narrow?: boolean;
}

export function SkeletonRow({ narrow, className, ...rest }: SkeletonRowProps) {
  return (
    <div {...rest} className={cx("ds-skel-row", className)}>
      <Skeleton width={32} height={32} shape="round" />
      <span className="ds-skel-col">
        <Skeleton width={narrow ? "55%" : "70%"} height={12} />
        <Skeleton width="38%" height={10} />
      </span>
      <Skeleton width={54} height={18} shape="item" />
    </div>
  );
}

const CHART_BARS = [40, 62, 48, 80, 66, 92, 74, 58, 84, 70, 96, 60];

export interface SkeletonChartProps extends ComponentPropsWithRef<"div"> {
  bars?: number[];
}

export function SkeletonChart({ bars = CHART_BARS, className, ...rest }: SkeletonChartProps) {
  return (
    <div {...rest} className={cx("ds-skel-chart", className)}>
      {bars.map((h, i) => (
        <Skeleton key={`${i}-${h}`} width="100%" height={h * 1.6} shape="item" />
      ))}
    </div>
  );
}

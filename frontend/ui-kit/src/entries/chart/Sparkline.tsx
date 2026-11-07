/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";
import { cx, Icon } from "../../ui/internal";
import { CHART_COLOR, type ChartColor } from "./shared";
import "./chart.css";

export interface SparklineProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  data: number[];
  color?: ChartColor;
  animate?: boolean;
  label?: string;
}

const W = 200;
const H = 34;

export function Sparkline({
  data,
  color = "teal",
  animate,
  label = "Динамика за период",
  className,
  style,
  ...rest
}: SparklineProps) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) => [
    i * (W / (data.length - 1)),
    H - 4 - ((v - min) / (max - min || 1)) * (H - 10),
  ]);
  const path = "M" + points.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" L");
  const last = points[points.length - 1];
  return (
    <svg
      {...rest}
      className={cx("ds-chart__spark", className)}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      data-appear={animate || undefined}
      style={{ ...style, "--ds-chart-c": CHART_COLOR[color] } as CSSProperties}
    >
      <path className="ds-chart__spark-area" d={`${path} L${W},${H} L0,${H}Z`} />
      <path className="ds-chart__spark-line" d={path} pathLength={1} />
      <circle className="ds-chart__spark-dot" cx={last[0]} cy={last[1]} r="0" />
    </svg>
  );
}

export type DeltaTone = "good" | "bad" | "flat";

export interface DeltaProps extends ComponentPropsWithRef<"span"> {
  tone: DeltaTone;
  dir?: "up" | "down";
  children: ReactNode;
}

export function Delta({ tone, dir, className, children, ...rest }: DeltaProps) {
  return (
    <span {...rest} className={cx("ds-chart__delta", `ds-chart__delta--${tone}`, className)}>
      {dir ? <Icon name={dir === "up" ? "trendup" : "trenddn"} size="xs" /> : null}
      {children}
    </span>
  );
}

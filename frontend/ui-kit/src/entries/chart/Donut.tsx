/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ComponentPropsWithRef, type CSSProperties } from "react";
import { cx } from "../../ui/internal";
import { CHART_COLOR, type ChartColor } from "./shared";
import "./chart.css";

export interface DonutPart {
  name: string;
  value: number;
  color: ChartColor;
}

export interface DonutProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  parts: DonutPart[];
  total?: number;
  centerLabel?: string;
  label?: string;
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number | null) => void;
  animate?: boolean;
  empty?: boolean;
}

const R = 62;
const C = 2 * Math.PI * R;

export function Donut({
  parts,
  total,
  centerLabel = "всего",
  label = "Структура",
  activeIndex,
  onActiveIndexChange,
  animate,
  empty,
  className,
  ...rest
}: DonutProps) {
  const [hover, setHover] = useState<number | null>(null);
  const sum = parts.reduce((a, p) => a + p.value, 0);
  const shownTotal = total ?? sum;
  const current = activeIndex !== undefined ? activeIndex : hover;
  const active = current !== null && parts[current] ? parts[current] : null;
  const lengths = parts.map((p) => (sum > 0 ? (C * p.value) / sum : 0));
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, l) => a + l, 0));
  const percent = (value: number) => (sum > 0 ? Math.round((value / sum) * 100) : 0);
  const hl = (next: number | null) => {
    setHover(next);
    onActiveIndexChange?.(next);
  };

  return (
    <div
      {...rest}
      className={cx("ds-chart__donut-wrap", className)}
      data-appear={animate || undefined}
    >
      <div className="ds-chart__donut" data-hv={current !== null || undefined}>
        <svg
          width="160"
          height="160"
          viewBox="0 0 160 160"
          role="img"
          aria-label={`${label}: ${parts.map((p) => `${p.name} ${percent(p.value)}%`).join(", ")}`}
        >
          <circle cx="80" cy="80" r={R} fill="none" className="ds-chart__track" strokeWidth="16" />
          {empty
            ? null
            : parts.map((p, i) => (
                <circle
                  key={p.name}
                  className="ds-chart__seg"
                  data-hl={current === i || undefined}
                  cx="80"
                  cy="80"
                  r={R}
                  fill="none"
                  strokeWidth={current === i ? 20 : 16}
                  strokeDashoffset={-offsets[i]}
                  transform="rotate(-90 80 80)"
                  style={
                    {
                      stroke: CHART_COLOR[p.color],
                      "--ds-chart-len": lengths[i] - 2,
                      "--ds-chart-gap": C - lengths[i] + 2,
                      "--ds-chart-circ": C,
                      "--ds-chart-i": i,
                    } as CSSProperties
                  }
                  onMouseEnter={() => hl(i)}
                  onMouseLeave={() => hl(null)}
                />
              ))}
        </svg>
        <div className="ds-chart__mid">
          <b>{empty ? "0" : active ? active.value : shownTotal}</b>
          <span>{empty || !active ? centerLabel : active.name}</span>
        </div>
      </div>
      <div className="ds-chart__donut-legend">
        {parts.map((p, i) => (
          <button
            type="button"
            key={p.name}
            data-hl={current === i || undefined}
            onMouseEnter={() => hl(i)}
            onMouseLeave={() => hl(null)}
            onFocus={() => hl(i)}
            onBlur={() => hl(null)}
          >
            <i style={{ background: CHART_COLOR[p.color] }} />
            {p.name}
            <b>{empty ? "—" : `${percent(p.value)}%`}</b>
          </button>
        ))}
      </div>
    </div>
  );
}

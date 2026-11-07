/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useState, type ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import "./chart.css";

export interface HBarRow {
  label: string;
  value: number;
}

export interface HBarProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  rows: HBarRow[];
  grown?: boolean;
  animate?: boolean;
  max?: number;
  formatValue?: (value: number) => string;
}

export function HBar({
  rows,
  grown,
  animate,
  max,
  formatValue = String,
  className,
  ...rest
}: HBarProps) {
  const [ready, setReady] = useState(!animate);
  useEffect(() => {
    if (!animate) return;
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, [animate]);
  const show = grown ?? ready;
  const top = max ?? Math.max(1, ...rows.map((r) => r.value));
  return (
    <div {...rest} role="list" className={cx("ds-chart__hbars", className)}>
      {rows.map((row) => (
        <div className="ds-chart__hbar" role="listitem" key={row.label}>
          <span className="ds-chart__hbar-name">{row.label}</span>
          <b>{formatValue(row.value)}</b>
          <div className="ds-chart__bar" aria-hidden="true">
            <i style={{ width: show ? `${Math.min(100, (row.value / top) * 100)}%` : "0%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

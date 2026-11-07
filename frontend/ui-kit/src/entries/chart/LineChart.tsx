/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cx, useControlled, useIds, useMergedRefs } from "../../ui/internal";
import { CHART_COLOR, useWidth, type ChartColor } from "./shared";
import "./chart.css";

export interface ChartSeries {
  name: string;
  color?: ChartColor;
  data: number[];
}

export interface LineChartProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  labels: string[];
  series: ChartSeries[];
  label?: string;
  hint?: string;
  hiddenSeries?: string[];
  defaultHiddenSeries?: string[];
  onHiddenSeriesChange?: (hidden: string[]) => void;
  activeIndex?: number;
  onActiveIndexChange?: (index: number | null) => void;
  animate?: boolean;
  empty?: boolean;
  emptyText?: string;
  formatValue?: (value: number) => string;
}

const NO_SERIES: string[] = [];
const H = 240;
const PL = 34;
const PB = 32;
const PT = 10;
const PR = 8;
const FALLBACKS: ChartColor[] = ["teal", "orange", "info", "danger", "muted"];

export function LineChart({
  labels,
  series,
  label = "График",
  hint = "Стрелки влево и вправо переключают точку.",
  hiddenSeries: hiddenProp,
  defaultHiddenSeries = NO_SERIES,
  onHiddenSeriesChange,
  activeIndex,
  onActiveIndexChange,
  animate,
  empty,
  emptyText = "Данных за период нет",
  formatValue = String,
  className,
  ref,
  ...rest
}: LineChartProps) {
  const [widthRef, W] = useWidth<HTMLDivElement>();
  const [hiddenNow, setHidden] = useControlled(
    hiddenProp,
    defaultHiddenSeries,
    onHiddenSeriesChange,
  );
  const [hover, setHover] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const { hint: hintId } = useIds(["hint"]);
  const setRoot = useMergedRefs(widthRef, ref);

  const colored = series.map((s, i) => ({
    ...s,
    tone: s.color ?? FALLBACKS[i % FALLBACKS.length],
  }));
  const visible = colored.filter((s) => !hiddenNow.includes(s.name));
  const n = labels.length;
  const max = Math.max(1, ...visible.flatMap((s) => s.data));
  const nice = Math.max(10, Math.ceil(max / 10) * 10);
  const stepX = n > 1 ? (W - PL - PR) / (n - 1) : 0;
  const X = (i: number) => PL + i * stepX;
  const Y = (v: number) => PT + (H - PT - PB) * (1 - v / nice);
  const idx = activeIndex ?? hover ?? focused;
  const labelStep = Math.ceil(n / 6);
  const line = (d: number[]) =>
    "M" + d.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" L");

  const report = (next: number | null) => onActiveIndexChange?.(next);
  const moveHover = (clientX: number, rect: DOMRect) => {
    if (n < 1 || stepX === 0) return;
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(n - 1, Math.round((px - PL) / stepX)));
    setHover(i);
    report(i);
  };
  const setFocus = (next: number | null) => {
    setFocused(next);
    report(next);
  };
  const onKey = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      const right = event.key === "ArrowRight";
      const cur = focused ?? (right ? -1 : n);
      setFocus(Math.max(0, Math.min(n - 1, cur + (right ? 1 : -1))));
    } else if (event.key === "Home") {
      event.preventDefault();
      setFocus(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setFocus(n - 1);
    } else if (event.key === "Escape") setFocus(null);
  };
  const toggle = (name: string) => {
    const next = hiddenNow.includes(name)
      ? hiddenNow.filter((x) => x !== name)
      : hiddenNow.length < series.length - 1
        ? [...hiddenNow, name]
        : hiddenNow;
    if (next === hiddenNow) return;
    setHidden(next);
  };
  const half = Math.min(70, W / 2);
  const tipLeft = idx === null ? 0 : Math.max(half, Math.min(W - half, X(idx)));
  const names = series.map((s) => s.name).join(", ");

  return (
    <div
      {...rest}
      ref={setRoot}
      className={cx("ds-chart__line", className)}
      data-appear={animate || undefined}
    >
      <svg
        className="ds-chart__svg"
        viewBox={`0 0 ${W} ${H}`}
        role="group"
        aria-label={`${label}: ${names}`}
      >
        {[0, 1, 2, 3, 4].map((k) => {
          const v = (nice / 4) * k;
          return (
            <g key={k}>
              <line className="ds-chart__grid" x1={PL} x2={W - PR} y1={Y(v)} y2={Y(v)} />
              <text className="ds-chart__axis" x={PL - 8} y={Y(v) + 4} textAnchor="end">
                {Math.round(v)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) =>
          i % labelStep === 0 ? (
            <text
              className="ds-chart__axis"
              key={`${i}-${l}`}
              x={X(i)}
              y={H - 6}
              textAnchor="middle"
            >
              {l}
            </text>
          ) : null,
        )}
        {empty
          ? null
          : colored.map((s, k) =>
              hiddenNow.includes(s.name) ? null : (
                <g key={s.name} style={{ "--ds-chart-c": CHART_COLOR[s.tone] } as CSSProperties}>
                  {k === 0 ? (
                    <path
                      className="ds-chart__area"
                      d={`${line(s.data)} L${X(n - 1)},${Y(0)} L${X(0)},${Y(0)}Z`}
                    />
                  ) : null}
                  <path className="ds-chart__path" d={line(s.data)} pathLength={1} />
                </g>
              ),
            )}
        {idx !== null && !empty && idx < n ? (
          <g aria-hidden="true">
            <line className="ds-chart__cross" x1={X(idx)} x2={X(idx)} y1={PT} y2={H - PB} />
            {visible.map((s) => (
              <circle
                key={s.name}
                className="ds-chart__dot"
                cx={X(idx)}
                cy={Y(s.data[idx])}
                r="4.5"
                style={{ "--ds-chart-c": CHART_COLOR[s.tone] } as CSSProperties}
              />
            ))}
          </g>
        ) : null}
        <g
          tabIndex={empty ? -1 : 0}
          role="application"
          aria-label={`${label}: значения по точкам`}
          aria-roledescription="график"
          aria-describedby={hintId}
          className="ds-chart__hit"
          onMouseMove={(e) =>
            moveHover(
              e.clientX,
              (e.currentTarget.ownerSVGElement ?? e.currentTarget).getBoundingClientRect(),
            )
          }
          onMouseLeave={() => {
            setHover(null);
            report(null);
          }}
          onKeyDown={onKey}
          onFocus={() => setFocus(focused ?? 0)}
          onBlur={() => setFocus(null)}
        >
          <rect x={PL} y={PT} width={W - PL - PR} height={H - PT - PB} fill="transparent" />
        </g>
      </svg>
      <span id={hintId} className="ds-chart__sr">
        {hint}
      </span>
      {empty ? (
        <div className="ds-chart__note">
          <span>{emptyText}</span>
        </div>
      ) : null}
      <div
        className="ds-chart__tip"
        role="status"
        data-on={idx !== null && !empty ? "" : undefined}
        style={{ left: tipLeft, top: 6 }}
      >
        {idx !== null && idx < n ? (
          <>
            <b>{labels[idx]}</b>
            {visible.map((s) => (
              <div key={s.name}>
                <i style={{ background: CHART_COLOR[s.tone] }} />
                {s.name}
                <span>{formatValue(s.data[idx])}</span>
              </div>
            ))}
          </>
        ) : null}
      </div>
      <div className="ds-chart__legend" role="group" aria-label="Серии">
        {colored.map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={!hiddenNow.includes(s.name)}
            onClick={() => toggle(s.name)}
          >
            <i style={{ background: CHART_COLOR[s.tone] }} />
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

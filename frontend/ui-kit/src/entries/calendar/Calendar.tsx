/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState, type ComponentPropsWithRef, type KeyboardEvent } from "react";
import { Icon, cx, useControlled, useIds } from "../../ui/internal";
import {
  MONTHS,
  WEEKDAYS,
  dayKey,
  formatFull,
  isDisabled,
  isSameDay,
  isSameMonth,
  isStrictlyInside,
  monthGrid,
  moveFocus,
  nextRange,
  orderRange,
  startOfMonth,
  type DateRangeValue,
} from "./dates";
import "./calendar.css";

export type CalendarDayData = Record<`data-${string}`, string | undefined>;

interface CalendarCommonProps extends Omit<
  ComponentPropsWithRef<"div">,
  "onChange" | "defaultValue" | "children"
> {
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  today?: Date;
  min?: Date | null;
  max?: Date | null;
  events?: Date[];
  loading?: boolean;
  label?: string;
  focusedDate?: Date | null;
  onFocusedDateChange?: (date: Date) => void;
  previewDate?: Date | null;
  onPreviewDateChange?: (date: Date | null) => void;
  dayData?: (date: Date) => CalendarDayData | undefined;
}

export interface CalendarSingleProps extends CalendarCommonProps {
  mode?: "single";
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
}

export interface CalendarRangeProps extends CalendarCommonProps {
  mode: "range";
  value?: DateRangeValue;
  defaultValue?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
}

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

const NO_EVENTS: Date[] = [];
const EMPTY: DateRangeValue = [null, null];

const toRange = (v: Date | null | DateRangeValue | undefined): DateRangeValue =>
  Array.isArray(v) ? v : [v ?? null, null];

export function Calendar(props: CalendarProps) {
  const {
    mode = "single",
    value,
    defaultValue,
    onChange,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    today: todayProp,
    min,
    max,
    events = NO_EVENTS,
    loading,
    label = "Календарь",
    focusedDate,
    onFocusedDateChange,
    previewDate,
    onPreviewDateChange,
    dayData,
    className,
    ...rest
  } = props;
  const { title: titleId, label: labelId } = useIds(["title", "label"]);
  const gridRef = useRef<HTMLDivElement>(null);
  const [fallbackToday] = useState(() => new Date());
  const today = todayProp ?? fallbackToday;

  const [sel, setSel] = useControlled<DateRangeValue>(
    value === undefined ? undefined : toRange(value),
    toRange(defaultValue ?? EMPTY),
    (next) => {
      if (mode === "range") (onChange as CalendarRangeProps["onChange"])?.(next);
      else if (next[0]) (onChange as CalendarSingleProps["onChange"])?.(next[0]);
    },
  );
  const [a, b] = sel;

  const [month, setMonth] = useControlled<Date>(
    monthProp === undefined ? undefined : startOfMonth(monthProp),
    startOfMonth(defaultMonth ?? a ?? today),
    onMonthChange,
  );
  const [focusState, setFocusState] = useState<Date | null>(null);
  const focused = focusedDate === undefined ? focusState : focusedDate;
  const [hoverState, setHoverState] = useState<Date | null>(null);
  const hover = previewDate === undefined ? hoverState : previewDate;
  const [keyboardMoves, setKeyboardMoves] = useState(0);
  const [seen, setSeen] = useState({
    time: month.getTime(),
    dir: undefined as "next" | "prev" | undefined,
  });
  let dir = seen.dir;
  if (seen.time !== month.getTime()) {
    dir = month.getTime() > seen.time ? "next" : "prev";
    setSeen({ time: month.getTime(), dir });
  }

  useEffect(() => {
    if (keyboardMoves) gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [keyboardMoves]);

  const goMonth = (target: Date) => {
    const next = startOfMonth(target);
    if (next.getTime() !== month.getTime()) setMonth(next);
  };
  const focusOn = (date: Date) => {
    setFocusState(date);
    onFocusedDateChange?.(date);
  };
  const setHover = (date: Date | null) => {
    setHoverState(date);
    onPreviewDateChange?.(date);
  };
  const pick = (date: Date) => {
    if (isDisabled(date, min, max)) return;
    if (!isSameMonth(date, month)) goMonth(date);
    focusOn(date);
    setSel(mode === "range" ? nextRange(sel, date) : [date, null]);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const from = focused ?? a ?? today;
    const next = moveFocus(from, event.key, event.shiftKey, min, max);
    if (!next) return;
    event.preventDefault();
    focusOn(next);
    goMonth(next);
    setKeyboardMoves((n) => n + 1);
  };

  const y = month.getFullYear();
  const m = month.getMonth();
  const end = mode === "range" ? (b ?? (a && hover ? hover : null)) : null;
  const [lo, hi] = a && end ? orderRange(a, end) : [null, null];
  const counts = new Map<string, number>();
  for (const e of events) counts.set(dayKey(e), (counts.get(dayKey(e)) ?? 0) + 1);
  const tabDate = isSameMonth(focused, month)
    ? focused
    : isSameMonth(a, month)
      ? a
      : isSameMonth(today, month)
        ? today
        : month;

  return (
    <div
      {...rest}
      className={cx("ds-cal", loading && "ds-cal--loading", className)}
      aria-busy={loading || undefined}
    >
      <span id={labelId} hidden>
        {label},
      </span>
      <div className="ds-cal__head">
        <button
          type="button"
          className="ds-cal__nav"
          aria-label="Предыдущий месяц"
          onClick={() => goMonth(new Date(y, m - 1, 1))}
        >
          <Icon name="chevl" size="sm" />
        </button>
        <b className="ds-cal__title" id={titleId} aria-live="polite">
          {MONTHS[m]} {y}
        </b>
        <button
          type="button"
          className="ds-cal__nav"
          aria-label="Следующий месяц"
          onClick={() => goMonth(new Date(y, m + 1, 1))}
        >
          <Icon name="chevr" size="sm" />
        </button>
      </div>
      <div className="ds-cal__body" data-dir={dir} key={`${y}-${m}`}>
        <div
          ref={gridRef}
          className="ds-cal__grid"
          role="grid"
          tabIndex={-1}
          aria-labelledby={`${labelId} ${titleId}`}
          aria-multiselectable={mode === "range" || undefined}
          onKeyDown={onKeyDown}
          onMouseLeave={() => setHover(null)}
        >
          <div className="ds-cal__row" role="row">
            {WEEKDAYS.map((w) => (
              <span className="ds-cal__wd" role="columnheader" key={w}>
                {w}
              </span>
            ))}
          </div>
          {monthGrid(month).map((week) => (
            <div className="ds-cal__row" role="row" key={dayKey(week[0])}>
              {week.map((d) => {
                const out = d.getMonth() !== m;
                const disabled = isDisabled(d, min, max);
                const isToday = isSameDay(d, today);
                let kind: string | undefined;
                let inside = false;
                if (mode === "single") kind = isSameDay(d, a) ? "single" : undefined;
                else if (lo && hi && !isSameDay(lo, hi)) {
                  if (isSameDay(d, lo)) kind = "start";
                  else if (isSameDay(d, hi)) kind = "end";
                  else inside = isStrictlyInside(d, lo, hi);
                } else if (a && isSameDay(d, a)) kind = "single";
                const n = counts.get(dayKey(d)) ?? 0;
                const aria = [
                  formatFull(d),
                  isToday ? "сегодня" : "",
                  n ? `событий: ${n}` : "",
                  disabled ? "недоступно" : "",
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <span
                    className="ds-cal__cell"
                    role="gridcell"
                    aria-selected={!!kind || inside}
                    key={dayKey(d)}
                  >
                    <button
                      type="button"
                      className="ds-cal__d"
                      tabIndex={isSameDay(d, tabDate) ? 0 : -1}
                      aria-label={aria}
                      aria-disabled={disabled || undefined}
                      aria-current={isToday ? "date" : undefined}
                      data-d={d.getTime()}
                      data-out={out || undefined}
                      data-today={isToday || undefined}
                      data-sel={kind}
                      data-in={inside || undefined}
                      {...dayData?.(d)}
                      onClick={() => pick(d)}
                      onMouseEnter={() => setHover(d)}
                    >
                      {d.getDate()}
                      {n ? (
                        <span className="ds-cal__ev" aria-hidden="true">
                          {Array.from({ length: Math.min(n, 3) }, (_u, i) => (
                            <i key={i} />
                          ))}
                        </span>
                      ) : null}
                    </button>
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState } from "react";
import {
  MONTHS_GENITIVE,
  addDays,
  dayKey,
  formatNumeric,
  formatShort,
  isSameDay,
  pad2,
  MONTHS,
  WEEKDAYS,
} from "./dates";
import { Calendar } from "./index";
import "./calendar.force.css";

export const TODAY = new Date(2026, 10, 12);
export const MONTHS_G = MONTHS_GENITIVE;
export { MONTHS, WEEKDAYS, dayKey, pad2 };
export const addD = addDays;
export const sameD = isSameDay;
export const fL = formatShort;
export const fD = formatNumeric;

export const EVENTS = [
  addD(TODAY, 1),
  addD(TODAY, 3),
  addD(TODAY, 3),
  addD(TODAY, 8),
  addD(TODAY, 12),
];

export type DayForce = "hover" | "active" | "focus";
const NO_EVENTS: Date[] = [];
const NO_FORCE: Record<string, DayForce> = {};

export interface CalendarViewProps {
  view: Date;
  mode?: "single" | "range";
  a?: Date | null;
  b?: Date | null;
  hover?: Date | null;
  events?: Date[];
  min?: Date | null;
  max?: Date | null;
  focusDate?: Date | null;
  force?: Record<string, DayForce>;
  dir?: "next" | "prev";
  loading?: boolean;
  label?: string;
}

export function CalendarView({
  view,
  mode = "single",
  a,
  b,
  hover,
  events = NO_EVENTS,
  min,
  max,
  focusDate,
  force = NO_FORCE,
  loading,
  label,
}: CalendarViewProps) {
  const common = {
    month: view,
    today: TODAY,
    events,
    min,
    max,
    loading,
    label,
    focusedDate: focusDate ?? null,
    previewDate: hover ?? null,
    dayData: (d: Date) => ({ "data-force": force[dayKey(d)] }),
  } as const;
  return mode === "range" ? (
    <Calendar {...common} mode="range" value={[a ?? null, b ?? null]} />
  ) : (
    <Calendar {...common} value={a ?? null} />
  );
}

export function DemoCalendar({
  mode = "single",
  initial,
  range,
  events = EVENTS,
  min,
  max,
  force,
  onChange,
}: {
  mode?: "single" | "range";
  initial?: Date;
  range?: [Date, Date];
  events?: Date[];
  min?: Date | null;
  max?: Date | null;
  force?: Record<string, DayForce>;
  onChange?: (a: Date | null, b: Date | null) => void;
}) {
  const start = range?.[0] ?? initial ?? TODAY;
  const dayData = force ? (d: Date) => ({ "data-force": force[dayKey(d)] }) : undefined;
  const common = { defaultMonth: start, today: TODAY, events, min, max, dayData } as const;
  return mode === "range" ? (
    <Calendar
      {...common}
      mode="range"
      defaultValue={[range?.[0] ?? null, range?.[1] ?? null]}
      onChange={([x, y]) => onChange?.(x, y)}
    />
  ) : (
    <Calendar {...common} defaultValue={initial ?? null} onChange={(d) => onChange?.(d, null)} />
  );
}

export function CalendarNote({ title, text }: { title: string; text: string }) {
  return (
    <div className="ds-cal__note">
      <b>{title}</b>
      <span>{text}</span>
    </div>
  );
}

export type DayKind =
  | "default"
  | "today"
  | "selected"
  | "today-selected"
  | "start"
  | "range"
  | "end"
  | "out"
  | "disabled"
  | "event";

export function DemoDay({
  kind = "default",
  force,
  n = 14,
  events = 0,
}: {
  kind?: DayKind;
  force?: DayForce;
  n?: number;
  events?: number;
}) {
  const sel =
    kind === "selected" || kind === "today-selected"
      ? "single"
      : kind === "start" || kind === "end"
        ? kind
        : undefined;
  const ev = kind === "event" ? Math.max(events, 2) : events;
  const cells: { d: number; own: boolean; inr: boolean }[] =
    kind === "range"
      ? [n - 1, n, n + 1].map((d) => ({ d, own: d === n, inr: true }))
      : kind === "start"
        ? [
            { d: n, own: true, inr: false },
            { d: n + 1, own: false, inr: true },
          ]
        : kind === "end"
          ? [
              { d: n - 1, own: false, inr: true },
              { d: n, own: true, inr: false },
            ]
          : [{ d: n, own: true, inr: false }];
  const cols = cells.length;
  return (
    <div className="ds-cal" style={{ width: cols === 1 ? 88 : 44 * cols, padding: 0 }}>
      <div role="grid" aria-label="Пример дня">
        <div
          role="row"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
          }}
        >
          {cells.map(({ d, own, inr }) => (
            <span role="gridcell" key={d} aria-selected={(own && !!sel) || inr}>
              <button
                type="button"
                className="ds-cal__d"
                aria-label={`${d} ноября`}
                aria-disabled={kind === "disabled" || undefined}
                data-out={kind === "out" || undefined}
                data-today={kind === "today" || kind === "today-selected" || undefined}
                data-sel={own ? sel : undefined}
                data-in={inr || undefined}
                data-force={kind === "range" && !own ? undefined : own ? force : undefined}
              >
                {d}
                {ev ? (
                  <span className="ds-cal__ev" aria-hidden="true">
                    {Array.from({ length: Math.min(ev, 3) }, (_, j) => (
                      <i key={j} />
                    ))}
                  </span>
                ) : null}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DemoCalendarOut({ mode = "single" }: { mode?: "single" | "range" }) {
  const init: [Date, Date] = [addD(TODAY, 2), addD(TODAY, 6)];
  const [txt, setTxt] = useState(
    mode === "single"
      ? `Выбрано: ${fL(TODAY)} ${TODAY.getFullYear()}`
      : `${fL(init[0])} – ${fL(init[1])} · 5 дн.`,
  );
  return (
    <div className="ds-cal-wrap">
      <DemoCalendar
        mode={mode}
        initial={mode === "single" ? TODAY : undefined}
        range={mode === "range" ? init : undefined}
        onChange={(a, b) => {
          if (mode === "single") setTxt(`Выбрано: ${fL(a!)} ${a!.getFullYear()}`);
          else
            setTxt(
              b
                ? `${fL(a!)} – ${fL(b)} · ${Math.round((b.getTime() - a!.getTime()) / 864e5) + 1} дн.`
                : "Выберите конец периода",
            );
        }}
      />
      <div className="ds-cal-out" aria-live="polite">
        {txt}
      </div>
    </div>
  );
}

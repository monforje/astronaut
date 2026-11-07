/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { type ComponentPropsWithRef, type CSSProperties, type ReactNode } from "react";
import { cx, useControlled } from "../../ui/internal";
import { Badge } from "../badge";
import type { CalendarDayData } from "../calendar/Calendar";
import {
  WEEKDAYS,
  addDays,
  formatShort,
  isSameDay,
  pad2,
  startOfDay,
  startOfWeek,
} from "../calendar/dates";
import { useTicker } from "../relative-time/ticker";
import "./week-agenda.css";

export type AgendaTone = "teal" | "info" | "orange" | "gray";

const TONE_COLOR: Record<AgendaTone, string> = {
  teal: "var(--teal)",
  info: "var(--info)",
  orange: "var(--orange)",
  gray: "var(--text-3)",
};

export interface AgendaEvent {
  id: string;
  start: Date;
  end: Date;
  title: string;
  who?: string;
  tone?: AgendaTone;
}

const clock = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
const minutesOf = (d: Date) => d.getHours() * 60 + d.getMinutes();
const lengthOf = (e: AgendaEvent) => Math.round((e.end.getTime() - e.start.getTime()) / 60000);

export interface WeekAgendaDayProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  date: Date;
  count?: number;
  today?: boolean;
  selected?: boolean;
  loading?: boolean;
}

export function WeekAgendaDay({
  date,
  count = 0,
  today,
  selected,
  loading,
  type = "button",
  className,
  ...rest
}: WeekAgendaDayProps) {
  const weekday = WEEKDAYS[(date.getDay() + 6) % 7];
  return (
    <button
      {...rest}
      type={type}
      className={cx("ds-agenda__day", className)}
      aria-pressed={selected ?? false}
      aria-label={`${weekday}, ${formatShort(date)}${count ? `, событий: ${count}` : ", событий нет"}${today ? ", сегодня" : ""}`}
      data-today={today || undefined}
      data-loading={loading || undefined}
    >
      <small>{weekday}</small>
      <b>{date.getDate()}</b>
      <span className="ds-agenda__dots" aria-hidden="true">
        {!loading && count ? Array.from({ length: count }, (_, j) => <u key={j} />) : " "}
      </span>
    </button>
  );
}

export interface WeekAgendaEventProps extends Omit<ComponentPropsWithRef<"button">, "children"> {
  event: AgendaEvent;
}

export function WeekAgendaEvent({
  event,
  type = "button",
  className,
  style,
  ...rest
}: WeekAgendaEventProps) {
  return (
    <button
      {...rest}
      type={type}
      className={cx("ds-agenda__ev", className)}
      style={{ ...style, "--ec": TONE_COLOR[event.tone ?? "teal"] } as CSSProperties}
    >
      <span className="ds-agenda__time">
        {clock(event.start)}
        <small>{clock(event.end)}</small>
      </span>
      <span className="ds-agenda__tx">
        <b>
          <i className="ds-agenda__dot" aria-hidden="true" />
          {event.title}
        </b>
        {event.who ? <small>{event.who}</small> : null}
      </span>
      <Badge tone="idle" form="plain" size="sm">
        {lengthOf(event)} мин
      </Badge>
    </button>
  );
}

export interface WeekAgendaProps extends Omit<
  ComponentPropsWithRef<"section">,
  "onChange" | "defaultValue" | "children"
> {
  events: AgendaEvent[];
  week?: Date;
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  now?: Date;
  label?: string;
  loading?: boolean;
  error?: boolean;
  errorText?: ReactNode;
  onEventClick?: (event: AgendaEvent) => void;
  dayData?: (date: Date) => CalendarDayData | undefined;
  eventData?: (event: AgendaEvent) => CalendarDayData | undefined;
}

export function WeekAgenda({
  events,
  week,
  value: valueProp,
  defaultValue,
  onChange,
  now: nowProp,
  label = "Повестка недели",
  loading,
  error,
  errorText = "Повторим через минуту",
  onEventClick,
  dayData,
  eventData,
  className,
  ...rest
}: WeekAgendaProps) {
  const live = useTicker(60000, nowProp === undefined);
  const now = nowProp ?? new Date(live);
  const monday = startOfWeek(week ?? now);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const initial = days.find((d) => isSameDay(d, now)) ?? monday;
  const [selected, setSelected] = useControlled<Date>(valueProp, defaultValue ?? initial, onChange);
  const byDay = days.map((d) =>
    events
      .filter((e) => isSameDay(e.start, d))
      .toSorted((a, b) => a.start.getTime() - b.start.getTime()),
  );
  const index = days.findIndex((d) => isSameDay(d, selected));
  const list = index < 0 ? [] : byDay[index];
  const isToday = isSameDay(selected, now);
  const nowMinutes = minutesOf(now);

  const rows: ReactNode[] = [];
  const marker = (
    <div className="ds-agenda__now" key="now">
      Сейчас {clock(now)}
    </div>
  );
  let placed = false;
  for (const event of list) {
    if (isToday && !placed && minutesOf(event.start) > nowMinutes) {
      rows.push(marker);
      placed = true;
    }
    rows.push(
      <WeekAgendaEvent
        key={event.id}
        event={event}
        {...eventData?.(event)}
        onClick={() => onEventClick?.(event)}
      />,
    );
  }
  if (isToday && !placed && list.length) rows.push(marker);

  return (
    <section
      {...rest}
      className={cx("ds-agenda", className)}
      aria-label={label}
      aria-busy={loading || undefined}
    >
      <div className="ds-agenda__week" role="group" aria-label="Дни недели">
        {days.map((d, i) => (
          <WeekAgendaDay
            key={d.getTime()}
            date={d}
            count={loading || error ? 0 : byDay[i].length}
            today={isSameDay(d, now)}
            selected={i === index}
            loading={loading}
            {...dayData?.(d)}
            onClick={() => setSelected(startOfDay(d))}
          />
        ))}
      </div>
      <div
        className="ds-agenda__list"
        key={`${selected.getTime()}-${loading}-${error}`}
        aria-live="polite"
      >
        {loading ? (
          <>
            <div className="ds-agenda__skel" />
            <div className="ds-agenda__skel" />
          </>
        ) : error ? (
          <div className="ds-agenda__note" data-tone="err" role="alert">
            <b>Календарь недоступен</b>
            <span>{errorText}</span>
          </div>
        ) : list.length ? (
          rows
        ) : (
          <div className="ds-agenda__note">
            <b>Свободный день</b>
            <span>
              {WEEKDAYS[(selected.getDay() + 6) % 7]}, {formatShort(selected)} — событий нет
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

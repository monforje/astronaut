/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { TooltipCard } from "../tooltip";
import { RelativeTime } from "./RelativeTime";
import { formatExact, formatRelative, isValidDate } from "./relative";
import "./relative-time.force.css";

export const NOW = new Date(2026, 10, 12, 10, 15, 0);
export const ago = (ms: number, now: Date = NOW) => new Date(now.getTime() - ms);
export const relText = formatRelative;
export const fullText = formatExact;

export function DemoRelTime({
  date,
  now = NOW,
  tip,
  force,
  plain,
  muted,
  loading,
  invalid,
}: {
  date?: Date | null;
  now?: Date;
  tip?: boolean;
  force?: "hover" | "focus";
  plain?: boolean;
  muted?: boolean;
  loading?: boolean;
  invalid?: boolean;
}) {
  const value = invalid ? new Date(Number.NaN) : date === undefined ? ago(12 * 60e3, now) : date;
  const time = (
    <RelativeTime
      date={value}
      now={now}
      plain={plain}
      muted={muted}
      loading={loading}
      data-force={force}
    />
  );
  if (!tip || plain || loading || !value || !isValidDate(value)) return time;
  return (
    <span className="ds-reltime-stage">
      {time}
      <TooltipCard
        className="ds-reltime-stage__tip"
        data-side="top"
        role="tooltip"
        content={formatExact(value)}
      />
    </span>
  );
}

export const FEED: [string, number][] = [
  ["Агент нашёл расхождение", 20e3],
  ["Декларация загружена", 12 * 60e3],
  ["Накладная получена из ЭДО", 3 * 3600e3],
  ["Груз создан из заявки", 27 * 3600e3],
  ["Клиент сопоставлен", 5 * 864e5],
];

export function DemoRelRows({ now = NOW }: { now?: Date }) {
  return (
    <div className="ds-reltime-rows">
      {FEED.map(([t, ms]) => (
        <div className="ds-reltime-row" key={t}>
          <b>{t}</b>
          <DemoRelTime date={ago(ms, now)} now={now} />
        </div>
      ))}
    </div>
  );
}

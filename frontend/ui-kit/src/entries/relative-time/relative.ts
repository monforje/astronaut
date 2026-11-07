/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { formatShort, pad2 } from "../calendar/dates";

const MIN = 60;
const HOUR = 3600;
const DAY = 86400;

const clock = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

export function toDate(input: Date | string | number | null | undefined): Date | null | undefined {
  if (input == null) return null;
  return input instanceof Date ? input : new Date(input);
}

export const isValidDate = (d: Date) => !Number.isNaN(d.getTime());

const dayDiff = (d: Date, now: Date) =>
  Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
      (DAY * 1000),
  );

function dated(d: Date, now: Date) {
  return d.getFullYear() === now.getFullYear()
    ? formatShort(d)
    : `${formatShort(d)} ${d.getFullYear()}`;
}

export function formatRelative(d: Date, now: Date): string {
  const seconds = (now.getTime() - d.getTime()) / 1000;
  if (seconds < -45) {
    const ahead = -seconds;
    if (ahead < HOUR) return `через ${Math.round(ahead / MIN)} мин`;
    if (ahead < DAY && dayDiff(d, now) === 0) return `через ${Math.round(ahead / HOUR)} ч`;
    if (dayDiff(d, now) === 1) return `завтра, ${clock(d)}`;
    return dated(d, now);
  }
  if (seconds < 45) return "только что";
  if (seconds < HOUR) return `${Math.round(seconds / MIN)} мин назад`;
  if (seconds < DAY) return `${Math.round(seconds / HOUR)} ч назад`;
  if (seconds < 2 * DAY) return `вчера, ${clock(d)}`;
  return dated(d, now);
}

export const formatExact = (d: Date) => `${formatShort(d)} ${d.getFullYear()}, ${clock(d)}`;

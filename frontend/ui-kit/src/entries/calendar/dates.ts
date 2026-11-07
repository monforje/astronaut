/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

export const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
] as const;

export const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;

export type DateRangeValue = [Date | null, Date | null];

const MS_DAY = 864e5;
const fullFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "full" });

export const pad2 = (n: number) => String(n).padStart(2, "0");

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

export const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

export const addDays = (d: Date, n: number) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = daysInMonth(target.getFullYear(), target.getMonth());
  return new Date(target.getFullYear(), target.getMonth(), Math.min(d.getDate(), last));
}

export const weekdayIndex = (d: Date) => (d.getDay() + 6) % 7;

export const startOfWeek = (d: Date) => addDays(startOfDay(d), -weekdayIndex(d));

export const isSameDay = (a?: Date | null, b?: Date | null) =>
  !!a &&
  !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isSameMonth = (a?: Date | null, b?: Date | null) =>
  !!a && !!b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

export const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export const diffDays = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / MS_DAY);

export const monthGrid = (month: Date): Date[][] => {
  const first = startOfMonth(month);
  const offset = weekdayIndex(first);
  return Array.from({ length: 6 }, (_w, w) =>
    Array.from(
      { length: 7 },
      (_d, i) => new Date(first.getFullYear(), first.getMonth(), 1 - offset + w * 7 + i),
    ),
  );
};

export function isDisabled(d: Date, min?: Date | null, max?: Date | null): boolean {
  const t = startOfDay(d).getTime();
  return (!!min && t < startOfDay(min).getTime()) || (!!max && t > startOfDay(max).getTime());
}

export function clampDate(d: Date, min?: Date | null, max?: Date | null): Date {
  if (min && isDisabled(d, min, null)) return startOfDay(min);
  if (max && isDisabled(d, null, max)) return startOfDay(max);
  return d;
}

export function orderRange(a: Date, b: Date): [Date, Date] {
  return a.getTime() <= b.getTime() ? [a, b] : [b, a];
}

export function isStrictlyInside(d: Date, a: Date, b: Date): boolean {
  const [lo, hi] = orderRange(a, b);
  const t = startOfDay(d).getTime();
  return t > startOfDay(lo).getTime() && t < startOfDay(hi).getTime();
}

export function nextRange(current: DateRangeValue, picked: Date): DateRangeValue {
  const [start, end] = current;
  if (!start || end) return [picked, null];
  return orderRange(start, picked);
}

export function moveFocus(
  current: Date,
  key: string,
  shift = false,
  min?: Date | null,
  max?: Date | null,
): Date | null {
  const wd = weekdayIndex(current);
  let next: Date | null = null;
  if (key === "ArrowLeft") next = addDays(current, -1);
  else if (key === "ArrowRight") next = addDays(current, 1);
  else if (key === "ArrowUp") next = addDays(current, -7);
  else if (key === "ArrowDown") next = addDays(current, 7);
  else if (key === "Home") next = addDays(current, -wd);
  else if (key === "End") next = addDays(current, 6 - wd);
  else if (key === "PageUp") next = addMonths(current, shift ? -12 : -1);
  else if (key === "PageDown") next = addMonths(current, shift ? 12 : 1);
  return next ? clampDate(next, min, max) : null;
}

export const formatShort = (d: Date) => `${d.getDate()} ${MONTHS_GENITIVE[d.getMonth()]}`;

export const formatNumeric = (d: Date) =>
  `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}.${d.getFullYear()}`;

export const formatFull = (d: Date) => fullFormat.format(d);

export const formatRangeLabel = (a: Date, b: Date) =>
  `${formatShort(a)} – ${formatShort(b)} ${b.getFullYear()}`;

export const countDays = (a: Date, b: Date) => Math.abs(diffDays(a, b)) + 1;

export function parseNumeric(text: string): Date | null {
  const m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(text.trim());
  if (!m) return null;
  const d = new Date(+m[3], +m[2] - 1, +m[1]);
  return d.getMonth() === +m[2] - 1 && d.getDate() === +m[1] ? d : null;
}

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export interface TimeValue {
  h: number;
  m: number;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export const formatTime = ({ h, m }: TimeValue) => `${pad2(h)}:${pad2(m)}`;

export function parseTime(text: string | null | undefined): TimeValue | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec((text ?? "").trim());
  if (!match) return null;
  const h = +match[1];
  const m = +match[2];
  return h < 24 && m < 60 ? { h, m } : null;
}

export const wrap = (n: number, size: number) => ((n % size) + size) % size;

export const clampInt = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.trunc(n) || 0));

export function stepTime(
  time: TimeValue,
  segment: "h" | "m",
  direction: 1 | -1,
  step: number,
): TimeValue {
  if (segment === "h") return { h: wrap(time.h + direction, 24), m: time.m };
  return { h: time.h, m: wrap(time.m + direction * step, 60) };
}

export const roundToStep = (minutes: number, step: number) =>
  wrap(Math.round(minutes / step) * step, 60);

export function nowTime(now: Date, step: number): TimeValue {
  const total = now.getHours() * 60 + now.getMinutes();
  const rounded = Math.round(total / step) * step;
  return { h: Math.floor(rounded / 60) % 24, m: rounded % 60 };
}

export const minuteOptions = (step: number) =>
  Array.from({ length: Math.ceil(60 / step) }, (_, i) => i * step);

export const hourOptions = () => Array.from({ length: 24 }, (_, i) => i);

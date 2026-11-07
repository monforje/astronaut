/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { pad2 } from "../calendar/dates";

export type CountdownTone = "ok" | "warn" | "err";

export interface CountdownParts {
  d: number;
  h: number;
  m: number;
  s: number;
}

export function splitSeconds(total: number): CountdownParts {
  let s = Math.max(0, Math.floor(total));
  const d = Math.floor(s / 86400);
  s -= d * 86400;
  const h = Math.floor(s / 3600);
  s -= h * 3600;
  const m = Math.floor(s / 60);
  s -= m * 60;
  return { d, h, m, s };
}

export const secondsLeft = (to: Date, now: number) => Math.floor((to.getTime() - now) / 1000);

export const toneOf = (left: number, warnBelow = 3600): CountdownTone =>
  left <= 0 ? "err" : left < warnBelow ? "warn" : "ok";

export function compactLeft(left: number): string {
  const { d, h, m } = splitSeconds(left);
  if (d > 0) return `${d} д ${h} ч`;
  if (h > 0) return `${h} ч ${pad2(m)} м`;
  return `${m} м`;
}

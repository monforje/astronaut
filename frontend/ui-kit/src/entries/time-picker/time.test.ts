/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import {
  clampInt,
  formatTime,
  minuteOptions,
  nowTime,
  parseTime,
  roundToStep,
  stepTime,
  wrap,
} from "./time";

describe("время: разбор и формат", () => {
  it("parseTime принимает ч:мм и отвергает выход за границы", () => {
    expect(parseTime("09:30")).toEqual({ h: 9, m: 30 });
    expect(parseTime("9:05")).toEqual({ h: 9, m: 5 });
    expect(parseTime("23:59")).toEqual({ h: 23, m: 59 });
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("12:60")).toBeNull();
    expect(parseTime("12:5")).toBeNull();
    expect(parseTime("")).toBeNull();
    expect(parseTime(null)).toBeNull();
  });

  it("formatTime дополняет нулями", () => {
    expect(formatTime({ h: 9, m: 5 })).toBe("09:05");
    expect(formatTime({ h: 0, m: 0 })).toBe("00:00");
  });
});

describe("время: шаги и округление", () => {
  it("wrap замыкает значения в кольцо", () => {
    expect(wrap(24, 24)).toBe(0);
    expect(wrap(-1, 24)).toBe(23);
    expect(wrap(-5, 60)).toBe(55);
  });

  it("часы меняются на 1, минуты на step, оба по кругу", () => {
    expect(stepTime({ h: 23, m: 30 }, "h", 1, 5)).toEqual({ h: 0, m: 30 });
    expect(stepTime({ h: 0, m: 30 }, "h", -1, 5)).toEqual({ h: 23, m: 30 });
    expect(stepTime({ h: 9, m: 55 }, "m", 1, 5)).toEqual({ h: 9, m: 0 });
    expect(stepTime({ h: 9, m: 0 }, "m", -1, 15)).toEqual({ h: 9, m: 45 });
  });

  it("clampInt ограничивает диапазон и превращает мусор в минимум", () => {
    expect(clampInt(99, 0, 23)).toBe(23);
    expect(clampInt(-4, 0, 23)).toBe(0);
    expect(clampInt(Number.NaN, 0, 59)).toBe(0);
    expect(clampInt(7.9, 0, 59)).toBe(7);
  });

  it("roundToStep округляет к ближайшему шагу и замыкает час", () => {
    expect(roundToStep(40, 5)).toBe(40);
    expect(roundToStep(42, 5)).toBe(40);
    expect(roundToStep(43, 5)).toBe(45);
    expect(roundToStep(58, 5)).toBe(0);
  });

  it("nowTime переносит округление минут на следующий час и сутки", () => {
    expect(nowTime(new Date(2026, 10, 12, 10, 42), 5)).toEqual({ h: 10, m: 40 });
    expect(nowTime(new Date(2026, 10, 12, 10, 58), 5)).toEqual({ h: 11, m: 0 });
    expect(nowTime(new Date(2026, 10, 12, 23, 58), 5)).toEqual({ h: 0, m: 0 });
  });

  it("список минут зависит от шага", () => {
    expect(minuteOptions(15)).toEqual([0, 15, 30, 45]);
    expect(minuteOptions(5)).toHaveLength(12);
  });
});

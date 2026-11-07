/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { compactLeft, secondsLeft, splitSeconds, toneOf } from "./countdown-time";

describe("отсчёт: разбор секунд", () => {
  it("раскладывает на дни, часы, минуты, секунды", () => {
    expect(splitSeconds((2 * 24 + 4) * 3600 + 15 * 60 + 30)).toEqual({ d: 2, h: 4, m: 15, s: 30 });
    expect(splitSeconds(59)).toEqual({ d: 0, h: 0, m: 0, s: 59 });
    expect(splitSeconds(86400)).toEqual({ d: 1, h: 0, m: 0, s: 0 });
  });

  it("отрицательное и дробное значение не ломают разбор", () => {
    expect(splitSeconds(-5)).toEqual({ d: 0, h: 0, m: 0, s: 0 });
    expect(splitSeconds(61.9)).toEqual({ d: 0, h: 0, m: 1, s: 1 });
  });

  it("secondsLeft считает целые секунды вниз", () => {
    expect(secondsLeft(new Date(10_999), 0)).toBe(10);
    expect(secondsLeft(new Date(0), 5000)).toBe(-5);
  });
});

describe("отсчёт: тон и краткая запись", () => {
  it("тон: больше часа ok, меньше часа warn, ноль и меньше err", () => {
    expect(toneOf(3600)).toBe("ok");
    expect(toneOf(3599)).toBe("warn");
    expect(toneOf(1)).toBe("warn");
    expect(toneOf(0)).toBe("err");
    expect(toneOf(-10)).toBe("err");
    expect(toneOf(7200, 10_800)).toBe("warn");
  });

  it("краткая запись: дни и часы, часы и минуты, минуты", () => {
    expect(compactLeft((2 * 24 + 4) * 3600 + 900)).toBe("2 д 4 ч");
    expect(compactLeft(3 * 3600 + 5 * 60)).toBe("3 ч 05 м");
    expect(compactLeft(42 * 60)).toBe("42 м");
  });
});

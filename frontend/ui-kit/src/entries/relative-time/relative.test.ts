/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { formatExact, formatRelative, isValidDate, toDate } from "./relative";

const NOW = new Date(2026, 10, 12, 10, 15, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe("относительное время", () => {
  it("меньше 45 секунд — «только что»", () => {
    expect(formatRelative(ago(0), NOW)).toBe("только что");
    expect(formatRelative(ago(20e3), NOW)).toBe("только что");
    expect(formatRelative(ago(44e3), NOW)).toBe("только что");
  });

  it("минуты и часы округляются", () => {
    expect(formatRelative(ago(45e3), NOW)).toBe("1 мин назад");
    expect(formatRelative(ago(12 * 60e3), NOW)).toBe("12 мин назад");
    expect(formatRelative(ago(3 * 3600e3), NOW)).toBe("3 ч назад");
    expect(formatRelative(ago(23 * 3600e3), NOW)).toBe("23 ч назад");
  });

  it("от суток до двух — «вчера» со временем", () => {
    expect(formatRelative(ago(27 * 3600e3), NOW)).toBe("вчера, 07:15");
  });

  it("старше двух суток — дата, с годом только если он другой", () => {
    expect(formatRelative(ago(5 * 864e5), NOW)).toBe("7 ноября");
    expect(formatRelative(new Date(2025, 11, 30, 9, 0), NOW)).toBe("30 декабря 2025");
  });

  it("будущее: через минуты, часы, завтра и дата", () => {
    const ahead = (ms: number) => new Date(NOW.getTime() + ms);
    expect(formatRelative(ahead(30e3), NOW)).toBe("только что");
    expect(formatRelative(ahead(10 * 60e3), NOW)).toBe("через 10 мин");
    expect(formatRelative(ahead(3 * 3600e3), NOW)).toBe("через 3 ч");
    expect(formatRelative(new Date(2026, 10, 13, 9, 0), NOW)).toBe("завтра, 09:00");
    expect(formatRelative(new Date(2026, 10, 20, 9, 0), NOW)).toBe("20 ноября");
  });

  it("полная дата с годом и временем", () => {
    expect(formatExact(new Date(2026, 10, 12, 9, 5))).toBe("12 ноября 2026, 09:05");
  });

  it("toDate принимает Date, строку, число, null; isValidDate ловит мусор", () => {
    expect(toDate(null)).toBeNull();
    expect(toDate(undefined)).toBeNull();
    expect(toDate(NOW)).toBe(NOW);
    expect(toDate(NOW.getTime())?.getTime()).toBe(NOW.getTime());
    expect(isValidDate(toDate("2026-11-12T10:00:00Z") as Date)).toBe(true);
    expect(isValidDate(toDate("не дата") as Date)).toBe(false);
  });
});

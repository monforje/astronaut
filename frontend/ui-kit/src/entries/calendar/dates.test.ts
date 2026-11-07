/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import {
  addDays,
  addMonths,
  clampDate,
  countDays,
  daysInMonth,
  diffDays,
  formatNumeric,
  formatRangeLabel,
  isDisabled,
  isSameDay,
  isStrictlyInside,
  monthGrid,
  moveFocus,
  nextRange,
  orderRange,
  parseNumeric,
  startOfWeek,
  weekdayIndex,
} from "./dates";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("даты: границы месяцев и недели", () => {
  it("неделя начинается с понедельника: воскресенье имеет индекс 6", () => {
    expect(weekdayIndex(d(2026, 11, 9))).toBe(0);
    expect(weekdayIndex(d(2026, 11, 15))).toBe(6);
  });

  it("startOfWeek возвращает понедельник той же недели", () => {
    expect(isSameDay(startOfWeek(d(2026, 11, 12)), d(2026, 11, 9))).toBe(true);
    expect(isSameDay(startOfWeek(d(2026, 11, 9)), d(2026, 11, 9))).toBe(true);
    expect(isSameDay(startOfWeek(d(2026, 11, 15)), d(2026, 11, 9))).toBe(true);
  });

  it("число дней в месяце учитывает високосный год", () => {
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2026, 10)).toBe(30);
  });

  it("addDays переходит через границу месяца и года", () => {
    expect(isSameDay(addDays(d(2026, 11, 30), 1), d(2026, 12, 1))).toBe(true);
    expect(isSameDay(addDays(d(2026, 12, 31), 1), d(2027, 1, 1))).toBe(true);
    expect(isSameDay(addDays(d(2026, 3, 1), -1), d(2026, 2, 28))).toBe(true);
  });

  it("addMonths обрезает день по длине месяца", () => {
    expect(isSameDay(addMonths(d(2026, 1, 31), 1), d(2026, 2, 28))).toBe(true);
    expect(isSameDay(addMonths(d(2026, 3, 31), -1), d(2026, 2, 28))).toBe(true);
    expect(isSameDay(addMonths(d(2026, 11, 12), 12), d(2027, 11, 12))).toBe(true);
  });

  it("сетка месяца: 6 недель по 7 дней, первая колонка — понедельник", () => {
    const grid = monthGrid(d(2026, 11, 1));
    expect(grid).toHaveLength(6);
    expect(grid.every((week) => week.length === 7)).toBe(true);
    expect(grid.every((week) => weekdayIndex(week[0]) === 0)).toBe(true);
    expect(isSameDay(grid[0][0], d(2026, 10, 26))).toBe(true);
    expect(isSameDay(grid[0][6], d(2026, 11, 1))).toBe(true);
    expect(isSameDay(grid[5][6], d(2026, 12, 6))).toBe(true);
  });

  it("сетка месяца, начинающегося с понедельника, не сдвигается на неделю", () => {
    const grid = monthGrid(d(2026, 6, 15));
    expect(isSameDay(grid[0][0], d(2026, 6, 1))).toBe(true);
  });
});

describe("даты: ограничения и диапазоны", () => {
  it("isDisabled сравнивает по дням и игнорирует время", () => {
    const min = new Date(2026, 10, 12, 18, 30);
    expect(isDisabled(d(2026, 11, 12), min, null)).toBe(false);
    expect(isDisabled(d(2026, 11, 11), min, null)).toBe(true);
    expect(isDisabled(d(2026, 11, 20), null, d(2026, 11, 19))).toBe(true);
    expect(isDisabled(d(2026, 11, 19), null, d(2026, 11, 19))).toBe(false);
  });

  it("clampDate подтягивает дату к границам", () => {
    const min = d(2026, 11, 10);
    const max = d(2026, 11, 20);
    expect(isSameDay(clampDate(d(2026, 11, 1), min, max), min)).toBe(true);
    expect(isSameDay(clampDate(d(2026, 12, 1), min, max), max)).toBe(true);
    expect(isSameDay(clampDate(d(2026, 11, 15), min, max), d(2026, 11, 15))).toBe(true);
  });

  it("orderRange ставит раньшую дату первой", () => {
    const [a, b] = orderRange(d(2026, 11, 20), d(2026, 11, 10));
    expect(isSameDay(a, d(2026, 11, 10))).toBe(true);
    expect(isSameDay(b, d(2026, 11, 20))).toBe(true);
  });

  it("nextRange: первый клик задаёт начало, второй — конец, третий начинает заново", () => {
    const first = nextRange([null, null], d(2026, 11, 16));
    expect(first[0] && isSameDay(first[0], d(2026, 11, 16))).toBe(true);
    expect(first[1]).toBeNull();
    const second = nextRange(first, d(2026, 11, 12));
    expect(second[0] && isSameDay(second[0], d(2026, 11, 12))).toBe(true);
    expect(second[1] && isSameDay(second[1], d(2026, 11, 16))).toBe(true);
    const third = nextRange(second, d(2026, 11, 20));
    expect(third[0] && isSameDay(third[0], d(2026, 11, 20))).toBe(true);
    expect(third[1]).toBeNull();
  });

  it("isStrictlyInside не включает концы и работает с обратным порядком", () => {
    expect(isStrictlyInside(d(2026, 11, 15), d(2026, 11, 12), d(2026, 11, 18))).toBe(true);
    expect(isStrictlyInside(d(2026, 11, 12), d(2026, 11, 12), d(2026, 11, 18))).toBe(false);
    expect(isStrictlyInside(d(2026, 11, 15), d(2026, 11, 18), d(2026, 11, 12))).toBe(true);
  });

  it("diffDays и countDays считают календарные дни через смену месяца", () => {
    expect(diffDays(d(2026, 11, 28), d(2026, 12, 3))).toBe(5);
    expect(countDays(d(2026, 11, 12), d(2026, 11, 18))).toBe(7);
    expect(countDays(d(2026, 11, 18), d(2026, 11, 12))).toBe(7);
  });
});

describe("даты: клавиши, формат и разбор", () => {
  const cur = d(2026, 11, 12);

  it("стрелки двигают на день и на неделю", () => {
    expect(isSameDay(moveFocus(cur, "ArrowLeft"), d(2026, 11, 11))).toBe(true);
    expect(isSameDay(moveFocus(cur, "ArrowRight"), d(2026, 11, 13))).toBe(true);
    expect(isSameDay(moveFocus(cur, "ArrowUp"), d(2026, 11, 5))).toBe(true);
    expect(isSameDay(moveFocus(cur, "ArrowDown"), d(2026, 11, 19))).toBe(true);
  });

  it("Home и End ведут к понедельнику и воскресенью недели", () => {
    expect(isSameDay(moveFocus(cur, "Home"), d(2026, 11, 9))).toBe(true);
    expect(isSameDay(moveFocus(cur, "End"), d(2026, 11, 15))).toBe(true);
  });

  it("PageUp и PageDown листают месяц, с Shift — год", () => {
    expect(isSameDay(moveFocus(cur, "PageDown"), d(2026, 12, 12))).toBe(true);
    expect(isSameDay(moveFocus(cur, "PageUp"), d(2026, 10, 12))).toBe(true);
    expect(isSameDay(moveFocus(cur, "PageDown", true), d(2027, 11, 12))).toBe(true);
    expect(isSameDay(moveFocus(d(2026, 1, 31), "PageDown"), d(2026, 2, 28))).toBe(true);
  });

  it("недоступный день не получает фокус: выход за границу прижимается", () => {
    const min = d(2026, 11, 12);
    expect(isSameDay(moveFocus(cur, "ArrowLeft", false, min), min)).toBe(true);
  });

  it("неизвестная клавиша ничего не двигает", () => {
    expect(moveFocus(cur, "a")).toBeNull();
  });

  it("форматирование: числовое и подпись периода", () => {
    expect(formatNumeric(d(2026, 11, 4))).toBe("04.11.2026");
    expect(formatRangeLabel(d(2026, 11, 4), d(2026, 11, 12))).toBe("4 ноября – 12 ноября 2026");
  });

  it("parseNumeric принимает дд.мм.гггг и отвергает несуществующие даты", () => {
    expect(parseNumeric("14.11.2026") && formatNumeric(parseNumeric("14.11.2026")!)).toBe(
      "14.11.2026",
    );
    expect(parseNumeric(" 4.1.2026 ")).not.toBeNull();
    expect(parseNumeric("31.02.2026")).toBeNull();
    expect(parseNumeric("2026-11-14")).toBeNull();
    expect(parseNumeric("")).toBeNull();
  });
});

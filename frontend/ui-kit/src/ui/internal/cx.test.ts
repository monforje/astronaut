/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { cx } from "./cx";

describe("cx", () => {
  it("склеивает строки через пробел и отбрасывает пустое", () => {
    expect(cx("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("без аргументов даёт пустую строку", () => {
    expect(cx()).toBe("");
  });
});

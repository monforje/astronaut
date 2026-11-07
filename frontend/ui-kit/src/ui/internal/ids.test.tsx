/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useIds, useStableId } from "./ids";

describe("useIds", () => {
  it("даёт по id на каждый суффикс от одного основания", () => {
    const { result } = renderHook(() => useIds(["label", "error"]));
    const { label, error } = result.current;
    expect(label.endsWith("-label")).toBe(true);
    expect(error.endsWith("-error")).toBe(true);
    expect(label.slice(0, -6)).toBe(error.slice(0, -6));
  });

  it("id не меняются между рендерами", () => {
    const { result, rerender } = renderHook(() => useIds(["a"]));
    const first = result.current.a;
    rerender();
    expect(result.current.a).toBe(first);
  });
});

describe("useStableId", () => {
  it("берёт заданный id", () => {
    const { result } = renderHook(() => useStableId("mine"));
    expect(result.current).toBe("mine");
  });

  it("без заданного генерирует свой", () => {
    const { result } = renderHook(() => useStableId());
    expect(result.current.length).toBeGreaterThan(0);
  });
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useControlled } from "./useControlled";

describe("useControlled", () => {
  it("без value хранит состояние сам и сообщает об изменении", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControlled<number>(undefined, 1, onChange));
    expect(result.current[0]).toBe(1);
    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("с value показывает его и не меняет сам, но сообщает", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ value }) => useControlled<number>(value, 1, onChange),
      { initialProps: { value: 3 } },
    );
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(3);
    expect(onChange).toHaveBeenCalledWith(9);
    rerender({ value: 9 });
    expect(result.current[0]).toBe(9);
  });

  it("onChange необязателен", () => {
    const { result } = renderHook(() => useControlled<string>(undefined, "a"));
    expect(() => act(() => result.current[1]("b"))).not.toThrow();
    expect(result.current[0]).toBe("b");
  });
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLayer } from "./layers";

describe("useLayer", () => {
  it("верхний слой — последний открытый", () => {
    const { result } = renderHook(() => ({ a: useLayer(true), b: useLayer(true) }));
    expect(result.current.a()).toBe(false);
    expect(result.current.b()).toBe(true);
  });

  it("закрытый слой не участвует в стеке", () => {
    const { result } = renderHook(() => ({ c: useLayer(true), d: useLayer(false) }));
    expect(result.current.c()).toBe(true);
    expect(result.current.d()).toBe(false);
  });

  it("после закрытия верхнего наверх возвращается предыдущий", () => {
    const { result, rerender } = renderHook(
      ({ upper }) => ({ lower: useLayer(true), upper: useLayer(upper) }),
      { initialProps: { upper: true } },
    );
    expect(result.current.lower()).toBe(false);
    rerender({ upper: false });
    expect(result.current.lower()).toBe(true);
  });
});

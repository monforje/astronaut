/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { usePresence } from "./presence";

afterEach(() => {
  vi.useRealTimers();
});

describe("usePresence", () => {
  it("открытый — смонтирован и не закрывается", () => {
    const { result } = renderHook(() => usePresence(true));
    expect(result.current).toEqual({ mounted: true, closing: false });
  });

  it("при закрытии держит разметку exitMs, потом снимает", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 200), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    expect(result.current).toEqual({ mounted: true, closing: true });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(result.current.mounted).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toEqual({ mounted: false, closing: false });
  });

  it("повторное открытие до конца выхода отменяет снятие", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ open }) => usePresence(open, 200), {
      initialProps: { open: true },
    });
    rerender({ open: false });
    act(() => {
      vi.advanceTimersByTime(100);
    });
    rerender({ open: true });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toEqual({ mounted: true, closing: false });
  });
});

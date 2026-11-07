/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RelativeTime } from "./index";
import { tickerSubscribers } from "./ticker";

const NOW = new Date(2026, 10, 12, 10, 15, 0);
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe("RelativeTime: рендер", () => {
  it("текст, dateTime и полная подпись для скринридера", () => {
    render(<RelativeTime date={ago(12 * 60e3)} now={NOW} />);
    const el = screen.getByText("12 мин назад");
    expect(el.tagName).toBe("TIME");
    expect(el.getAttribute("datetime")).toBe(ago(12 * 60e3).toISOString());
    expect(el.getAttribute("aria-label")).toBe("12 мин назад, 12 ноября 2026, 10:03");
    expect(el.getAttribute("tabindex")).toBe("0");
  });

  it("принимает строку и число", () => {
    const { rerender } = render(<RelativeTime date={ago(3 * 3600e3).toISOString()} now={NOW} />);
    expect(screen.getByText("3 ч назад")).toBeTruthy();
    rerender(<RelativeTime date={ago(20e3).getTime()} now={NOW} />);
    expect(screen.getByText("только что")).toBeTruthy();
  });

  it("plain без подчёркивания и без фокуса, muted ставит data-muted", () => {
    render(<RelativeTime date={ago(12 * 60e3)} now={NOW} plain muted />);
    const el = screen.getByText("12 мин назад");
    expect(el.classList.contains("ds-reltime--plain")).toBe(true);
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("data-muted")).toBe(true);
  });

  it("пустая дата — прочерк, неверная — «Дата неизвестна», loading — заглушка", () => {
    const { container, rerender } = render(<RelativeTime date={null} now={NOW} />);
    expect(screen.getByText("—")).toBeTruthy();
    rerender(<RelativeTime date="мусор" now={NOW} />);
    expect(screen.getByText("Дата неизвестна").className).toContain("ds-reltime--err");
    rerender(<RelativeTime loading now={NOW} />);
    expect(container.querySelector(".ds-reltime__skel")?.getAttribute("aria-busy")).toBe("true");
  });

  it("ref, className, атрибуты; data-force по умолчанию нет", () => {
    const ref = createRef<HTMLTimeElement>();
    render(<RelativeTime ref={ref} date={ago(60e3)} now={NOW} className="own" id="t1" />);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.id).toBe("t1");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("RelativeTime: подсказка", () => {
  it("наведение и фокус показывают полную дату, уход убирает", () => {
    render(<RelativeTime date={ago(12 * 60e3)} now={NOW} />);
    const el = screen.getByText("12 мин назад");
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseEnter(el);
    expect(screen.getByRole("tooltip").textContent).toBe("12 ноября 2026, 10:03");
    expect(el.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
    fireEvent.mouseLeave(el);
    expect(screen.queryByRole("tooltip")).toBeNull();
    act(() => el.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    act(() => el.blur());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("Escape прячет подсказку до следующего наведения", () => {
    render(<RelativeTime date={ago(12 * 60e3)} now={NOW} />);
    const el = screen.getByText("12 мин назад");
    act(() => el.focus());
    fireEvent.keyDown(el, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseEnter(el);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("plain не показывает подсказку, open показывает всегда", () => {
    const { rerender } = render(<RelativeTime date={ago(12 * 60e3)} now={NOW} plain />);
    fireEvent.mouseEnter(screen.getByText("12 мин назад"));
    expect(screen.queryByRole("tooltip")).toBeNull();
    rerender(<RelativeTime date={ago(12 * 60e3)} now={NOW} open />);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });
});

describe("RelativeTime: тик", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  it("без now подпись обновляется сама", () => {
    render(<RelativeTime date={ago(30e3)} />);
    expect(screen.getByText("только что")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(20e3);
    });
    expect(screen.getByText("1 мин назад")).toBeTruthy();
  });

  it("с now подписки на таймер нет", () => {
    render(<RelativeTime date={ago(30e3)} now={NOW} />);
    expect(tickerSubscribers()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("много подписей делят один таймер, после размонтирования он останавливается", () => {
    const { unmount } = render(
      <>
        <RelativeTime date={ago(30e3)} />
        <RelativeTime date={ago(60e3)} />
        <RelativeTime date={ago(90e3)} />
      </>,
    );
    expect(tickerSubscribers()).toBe(3);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(tickerSubscribers()).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("скрытая вкладка останавливает таймер, возврат обновляет текст сразу", () => {
    render(<RelativeTime date={ago(30e3)} />);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(vi.getTimerCount()).toBe(0);
    act(() => {
      vi.advanceTimersByTime(5 * 60e3);
    });
    expect(screen.getByText("только что")).toBeTruthy();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    act(() => {
      vi.setSystemTime(new Date(NOW.getTime() + 5 * 60e3));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByText("6 мин назад")).toBeTruthy();
    expect(vi.getTimerCount()).toBe(1);
  });
});

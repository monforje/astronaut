/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Countdown, CountdownBadge, CountdownText } from "./index";

const NOW = new Date(2026, 10, 12, 10, 15, 0);
const after = (s: number) => new Date(NOW.getTime() + s * 1000);
const ARRIVAL = (2 * 24 + 4) * 3600 + 15 * 60 + 30;

function numbers(): string[] {
  return Array.from(document.querySelectorAll(".ds-countdown__num")).map(
    (n) => n.textContent ?? "",
  );
}
function units(): string[] {
  return Array.from(document.querySelectorAll(".ds-countdown__unit")).map(
    (n) => n.textContent ?? "",
  );
}

describe("Countdown: рендер", () => {
  it("четыре блока: дни, часы, минуты, секунды, role=timer с подписью", () => {
    render(<Countdown to={after(ARRIVAL)} now={NOW} label="До прибытия MSC Aurora" />);
    const timer = screen.getByRole("timer", { name: "До прибытия MSC Aurora" });
    expect(timer.classList.contains("ds-countdown")).toBe(true);
    expect(numbers()).toEqual(["2", "04", "15", "30"]);
    expect(units()).toEqual(["дн", "ч", "мин", "сек"]);
    expect(timer.hasAttribute("data-tone")).toBe(false);
  });

  it("hideDays прячет дни только когда их ноль", () => {
    const { rerender } = render(<Countdown to={after(ARRIVAL)} now={NOW} hideDays />);
    expect(units()).toEqual(["дн", "ч", "мин", "сек"]);
    rerender(<Countdown to={after(3 * 3600 + 61)} now={NOW} hideDays />);
    expect(units()).toEqual(["ч", "мин", "сек"]);
  });

  it("showSeconds=false убирает секунды", () => {
    render(<Countdown to={after(ARRIVAL)} now={NOW} showSeconds={false} />);
    expect(units()).toEqual(["дн", "ч", "мин"]);
  });

  it("тон по остатку: меньше часа warn, вышло err, свой tone главнее", () => {
    const { rerender } = render(<Countdown to={after(1800)} now={NOW} />);
    expect(screen.getByRole("timer").getAttribute("data-tone")).toBe("warn");
    rerender(<Countdown to={after(0)} now={NOW} />);
    expect(screen.getByRole("timer").getAttribute("data-tone")).toBe("err");
    expect(numbers()).toEqual(["0", "00", "00", "00"]);
    rerender(<Countdown to={after(ARRIVAL)} now={NOW} tone="err" />);
    expect(screen.getByRole("timer").getAttribute("data-tone")).toBe("err");
    rerender(<Countdown to={after(7200)} now={NOW} warnBelow={10_800} />);
    expect(screen.getByRole("timer").getAttribute("data-tone")).toBe("warn");
  });

  it("loading и paused ставят атрибуты, loading заменяет числа заглушками", () => {
    const { container, rerender } = render(<Countdown to={after(ARRIVAL)} now={NOW} loading />);
    expect(screen.getByRole("timer").getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".ds-countdown__skel")).toHaveLength(4);
    rerender(<Countdown to={after(ARRIVAL)} now={NOW} paused />);
    expect(screen.getByRole("timer").hasAttribute("data-paused")).toBe(true);
  });

  it("принимает строку и число, мусорная дата даёт нули", () => {
    const { rerender } = render(<Countdown to={after(3600).toISOString()} now={NOW} />);
    expect(numbers()).toEqual(["0", "01", "00", "00"]);
    rerender(<Countdown to={after(3600).getTime()} now={NOW} />);
    expect(numbers()).toEqual(["0", "01", "00", "00"]);
    rerender(<Countdown to="мусор" now={NOW} />);
    expect(numbers()).toEqual(["0", "00", "00", "00"]);
  });

  it("ref, className, атрибуты; data-force по умолчанию нет", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Countdown ref={ref} to={after(60)} now={NOW} className="own" id="c1" />);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.id).toBe("c1");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("Countdown: ход времени", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
  });

  it("секунды тикают раз в секунду", () => {
    render(<Countdown to={after(65)} />);
    expect(numbers()).toEqual(["0", "00", "01", "05"]);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(numbers()).toEqual(["0", "00", "01", "02"]);
  });

  it("onExpire вызывается один раз при нуле", () => {
    const onExpire = vi.fn();
    render(<Countdown to={after(2)} onExpire={onExpire} />);
    expect(onExpire).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("paused замораживает значение", () => {
    const { rerender } = render(<Countdown to={after(65)} />);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(numbers()).toEqual(["0", "00", "01", "03"]);
    rerender(<Countdown to={after(65)} paused />);
    act(() => {
      vi.advanceTimersByTime(10_000);
    });
    expect(numbers()).toEqual(["0", "00", "01", "03"]);
    rerender(<Countdown to={after(65)} />);
    expect(numbers()).toEqual(["0", "00", "00", "53"]);
  });

  it("скрытая вкладка останавливает таймер", () => {
    render(<Countdown to={after(600)} />);
    expect(vi.getTimerCount()).toBe(1);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    act(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("при reduced-motion секунд нет, обновление раз в минуту", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    render(<Countdown to={after(3 * 60 + 30)} />);
    expect(units()).toEqual(["дн", "ч", "мин"]);
    expect(numbers()).toEqual(["0", "00", "03"]);
    act(() => {
      vi.advanceTimersByTime(30_000);
    });
    expect(numbers()).toEqual(["0", "00", "03"]);
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(numbers()).toEqual(["0", "00", "02"]);
  });

  it("showSeconds перекрывает reduced-motion", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    }));
    render(<Countdown to={after(90)} showSeconds />);
    expect(units()).toContain("сек");
  });
});

describe("CountdownBadge и CountdownText", () => {
  it("бейдж: краткая запись и тон по остатку", () => {
    const { container, rerender } = render(
      <CountdownBadge to={after(ARRIVAL)} now={NOW} prefix="до прибытия" />,
    );
    expect(screen.getByText("до прибытия 2 д 4 ч")).toBeTruthy();
    expect(container.querySelector(".ds-badge--ok")).not.toBeNull();
    rerender(<CountdownBadge to={after(1800)} now={NOW} />);
    expect(screen.getByText("до 30 м")).toBeTruthy();
    expect(container.querySelector(".ds-badge--warn")).not.toBeNull();
    rerender(<CountdownBadge to={after(-5)} now={NOW} />);
    expect(screen.getByText("срок вышел")).toBeTruthy();
    expect(container.querySelector(".ds-badge--err")).not.toBeNull();
  });

  it("текстовый вид: заголовок, пояснение, тон err", () => {
    const { container } = render(
      <CountdownText title="Срок вышел" tone="err">
        вчера в 18:00
      </CountdownText>,
    );
    expect(screen.getByText("Срок вышел").tagName).toBe("B");
    expect(container.firstElementChild?.getAttribute("data-tone")).toBe("err");
    expect(container.textContent).toContain("вчера в 18:00");
  });
});

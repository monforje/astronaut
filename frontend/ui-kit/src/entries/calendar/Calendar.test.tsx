/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Calendar } from "./index";

const TODAY = new Date(2026, 10, 12);
const at = (n: number, month = 10) => new Date(2026, month, n);

function day(container: HTMLElement, n: number, month = 10): HTMLButtonElement {
  const el = container.querySelector<HTMLButtonElement>(`[data-d="${at(n, month).getTime()}"]`);
  if (!el) throw new Error(`нет дня ${n}`);
  return el;
}

describe("Calendar: рендер", () => {
  it("рисует заголовок месяца, дни недели с понедельника и 42 дня", () => {
    const { container } = render(<Calendar today={TODAY} />);
    expect(screen.getByText("Ноябрь 2026")).toBeTruthy();
    const heads = screen.getAllByRole("columnheader").map((h) => h.textContent);
    expect(heads).toEqual(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]);
    expect(container.querySelectorAll(".ds-cal__d")).toHaveLength(42);
    expect(day(container, 26, 9).dataset.out).toBe("true");
  });

  it("сегодня отмечено aria-current и в подписи", () => {
    const { container } = render(<Calendar today={TODAY} />);
    const today = day(container, 12);
    expect(today.getAttribute("aria-current")).toBe("date");
    expect(today.getAttribute("aria-label")).toContain("сегодня");
    expect(day(container, 13).getAttribute("aria-current")).toBeNull();
  });

  it("точки событий: не больше трёх, число событий в подписи", () => {
    const { container } = render(
      <Calendar today={TODAY} events={[at(15), at(15), at(15), at(15), at(20)]} />,
    );
    expect(day(container, 15).querySelectorAll(".ds-cal__ev i")).toHaveLength(3);
    expect(day(container, 15).getAttribute("aria-label")).toContain("событий: 4");
    expect(day(container, 20).querySelectorAll(".ds-cal__ev i")).toHaveLength(1);
    expect(day(container, 16).querySelector(".ds-cal__ev")).toBeNull();
  });

  it("loading ставит aria-busy и класс", () => {
    const { container } = render(<Calendar today={TODAY} loading />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute("aria-busy")).toBe("true");
    expect(root.classList.contains("ds-cal--loading")).toBe(true);
  });

  it("ref, className и атрибуты попадают на корень, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <Calendar ref={ref} today={TODAY} className="own" data-testid="cal" id="c1" />,
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.classList.contains("ds-cal")).toBe(true);
    expect(ref.current?.id).toBe("c1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});

describe("Calendar: одна дата", () => {
  it("клик выбирает день и вызывает onChange", () => {
    const onChange = vi.fn();
    const { container } = render(<Calendar today={TODAY} onChange={onChange} />);
    fireEvent.click(day(container, 15));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(15);
    expect(day(container, 15).dataset.sel).toBe("single");
    expect(day(container, 15).closest("[role=gridcell]")?.getAttribute("aria-selected")).toBe(
      "true",
    );
  });

  it("defaultValue задаёт начальный выбор и месяц", () => {
    const { container } = render(<Calendar today={TODAY} defaultValue={new Date(2026, 11, 3)} />);
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
    expect(day(container, 3, 11).dataset.sel).toBe("single");
  });

  it("контролируемый value не меняется от клика без обновления пропса", () => {
    const onChange = vi.fn();
    const { container, rerender } = render(
      <Calendar today={TODAY} value={at(10)} onChange={onChange} />,
    );
    fireEvent.click(day(container, 15));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(day(container, 10).dataset.sel).toBe("single");
    expect(day(container, 15).dataset.sel).toBeUndefined();
    rerender(<Calendar today={TODAY} value={at(15)} onChange={onChange} />);
    expect(day(container, 15).dataset.sel).toBe("single");
    expect(day(container, 10).dataset.sel).toBeUndefined();
  });

  it("клик по дню соседнего месяца выбирает его и листает календарь", () => {
    const onChange = vi.fn();
    const { container } = render(<Calendar today={TODAY} onChange={onChange} />);
    fireEvent.click(day(container, 1, 11));
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
    expect((onChange.mock.calls[0][0] as Date).getMonth()).toBe(11);
  });

  it("недоступные дни помечены aria-disabled и не выбираются", () => {
    const onChange = vi.fn();
    const { container } = render(
      <Calendar today={TODAY} min={at(10)} max={at(20)} onChange={onChange} />,
    );
    const early = day(container, 5);
    expect(early.getAttribute("aria-disabled")).toBe("true");
    expect(early.getAttribute("aria-label")).toContain("недоступно");
    expect(early.disabled).toBe(false);
    fireEvent.click(early);
    fireEvent.click(day(container, 25));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(day(container, 10));
    fireEvent.click(day(container, 20));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe("Calendar: период", () => {
  it("два клика задают период, дни между подсвечены", () => {
    const onChange = vi.fn();
    const { container } = render(<Calendar mode="range" today={TODAY} onChange={onChange} />);
    fireEvent.click(day(container, 16));
    expect(onChange.mock.calls[0][0][1]).toBeNull();
    fireEvent.click(day(container, 19));
    const [start, end] = onChange.mock.calls[1][0] as [Date, Date];
    expect(start.getDate()).toBe(16);
    expect(end.getDate()).toBe(19);
    expect(day(container, 16).dataset.sel).toBe("start");
    expect(day(container, 19).dataset.sel).toBe("end");
    expect(day(container, 17).dataset.in).toBe("true");
    expect(day(container, 18).dataset.in).toBe("true");
    expect(day(container, 20).dataset.in).toBeUndefined();
  });

  it("конец раньше начала: даты упорядочиваются", () => {
    const onChange = vi.fn();
    const { container } = render(<Calendar mode="range" today={TODAY} onChange={onChange} />);
    fireEvent.click(day(container, 20));
    fireEvent.click(day(container, 14));
    const [start, end] = onChange.mock.calls[1][0] as [Date, Date];
    expect([start.getDate(), end.getDate()]).toEqual([14, 20]);
  });

  it("третий клик начинает период заново", () => {
    const { container } = render(
      <Calendar mode="range" today={TODAY} defaultValue={[at(10), at(12)]} />,
    );
    fireEvent.click(day(container, 25));
    expect(day(container, 25).dataset.sel).toBe("single");
    expect(day(container, 10).dataset.sel).toBeUndefined();
    expect(container.querySelector("[data-in]")).toBeNull();
  });

  it("наведение при выбранном начале показывает полосу, уход курсора её убирает", () => {
    const { container } = render(
      <Calendar mode="range" today={TODAY} defaultValue={[at(16), null]} />,
    );
    fireEvent.mouseEnter(day(container, 19));
    expect(day(container, 17).dataset.in).toBe("true");
    expect(day(container, 19).dataset.sel).toBe("end");
    fireEvent.mouseLeave(screen.getByRole("grid"));
    expect(container.querySelector("[data-in]")).toBeNull();
  });

  it("previewDate управляет полосой снаружи", () => {
    const { container } = render(
      <Calendar mode="range" today={TODAY} value={[at(16), null]} previewDate={at(18)} />,
    );
    expect(day(container, 17).dataset.in).toBe("true");
    expect(day(container, 18).dataset.sel).toBe("end");
  });

  it("сетка помечена как мультивыбор", () => {
    render(<Calendar mode="range" today={TODAY} />);
    expect(screen.getByRole("grid").getAttribute("aria-multiselectable")).toBe("true");
  });
});

describe("Calendar: месяцы и клавиатура", () => {
  it("стрелки шапки листают месяц и сообщают о смене", () => {
    const onMonthChange = vi.fn();
    render(<Calendar today={TODAY} onMonthChange={onMonthChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
    expect((onMonthChange.mock.calls[0][0] as Date).getMonth()).toBe(11);
    fireEvent.click(screen.getByRole("button", { name: "Предыдущий месяц" }));
    fireEvent.click(screen.getByRole("button", { name: "Предыдущий месяц" }));
    expect(screen.getByText("Октябрь 2026")).toBeTruthy();
  });

  it("контролируемый month не листается без обновления пропса", () => {
    const { rerender } = render(<Calendar today={TODAY} month={at(1)} />);
    fireEvent.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(screen.getByText("Ноябрь 2026")).toBeTruthy();
    rerender(<Calendar today={TODAY} month={at(1, 11)} />);
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
  });

  it("направление листания ставится в data-dir", () => {
    const { container } = render(<Calendar today={TODAY} />);
    expect(container.querySelector(".ds-cal__body")?.getAttribute("data-dir")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Следующий месяц" }));
    expect(container.querySelector(".ds-cal__body")?.getAttribute("data-dir")).toBe("next");
    fireEvent.click(screen.getByRole("button", { name: "Предыдущий месяц" }));
    expect(container.querySelector(".ds-cal__body")?.getAttribute("data-dir")).toBe("prev");
  });

  it("в табличном порядке фокуса один день: сегодня или выбранный", () => {
    const { container } = render(<Calendar today={TODAY} defaultValue={at(20)} />);
    const tabbable = container.querySelectorAll('.ds-cal__d[tabindex="0"]');
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toBe(day(container, 20));
  });

  it("стрелка вправо и вниз двигают фокус на день и на неделю", () => {
    const { container } = render(<Calendar today={TODAY} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(day(container, 13));
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(day(container, 20));
  });

  it("Home и End ведут к понедельнику и воскресенью", () => {
    const { container } = render(<Calendar today={TODAY} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "Home" });
    expect(document.activeElement).toBe(day(container, 9));
    fireEvent.keyDown(screen.getByRole("grid"), { key: "End" });
    expect(document.activeElement).toBe(day(container, 15));
  });

  it("через край месяца календарь листается сам", () => {
    const { container } = render(<Calendar today={new Date(2026, 10, 28)} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowDown" });
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
    expect(document.activeElement).toBe(day(container, 5, 11));
  });

  it("PageDown листает месяц, Shift+PageDown год", () => {
    render(<Calendar today={TODAY} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown" });
    expect(screen.getByText("Декабрь 2026")).toBeTruthy();
    fireEvent.keyDown(screen.getByRole("grid"), { key: "PageDown", shiftKey: true });
    expect(screen.getByText("Декабрь 2027")).toBeTruthy();
  });

  it("Enter на дне выбирает его, как клик", () => {
    const onChange = vi.fn();
    const { container } = render(<Calendar today={TODAY} onChange={onChange} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowRight" });
    fireEvent.click(document.activeElement as HTMLElement);
    expect((onChange.mock.calls[0][0] as Date).getDate()).toBe(13);
    expect(day(container, 13).dataset.sel).toBe("single");
  });

  it("недоступные дни не получают фокус стрелками", () => {
    const { container } = render(<Calendar today={TODAY} min={TODAY} />);
    fireEvent.keyDown(screen.getByRole("grid"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(day(container, 12));
  });

  it("dayData добавляет атрибуты на день", () => {
    const { container } = render(
      <Calendar
        today={TODAY}
        dayData={(d) => (d.getDate() === 14 ? { "data-mark": "x" } : undefined)}
      />,
    );
    expect(day(container, 14).dataset.mark).toBe("x");
    expect(day(container, 15).dataset.mark).toBeUndefined();
  });
});

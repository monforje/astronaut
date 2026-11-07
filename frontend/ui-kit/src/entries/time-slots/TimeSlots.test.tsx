/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TimeSlot, TimeSlots } from "./index";

const SLOTS = ["09:00", "09:30", "10:00", "10:30"];

describe("TimeSlots: рендер", () => {
  it("рисует группу с подписью и слоты по числу", () => {
    render(<TimeSlots slots={SLOTS} label="Время приёмки" />);
    const group = screen.getByRole("group", { name: "Время приёмки" });
    expect(group.querySelectorAll(".ds-slots__slot")).toHaveLength(4);
    expect(screen.getByText("Время не выбрано")).toBeTruthy();
  });

  it("по умолчанию 4 колонки, cols=3 ставит data-cols", () => {
    const { container, rerender } = render(<TimeSlots slots={SLOTS} />);
    expect(container.querySelector(".ds-slots__grid")?.hasAttribute("data-cols")).toBe(false);
    rerender(<TimeSlots slots={SLOTS} cols={3} />);
    expect(container.querySelector(".ds-slots__grid")?.getAttribute("data-cols")).toBe("3");
  });

  it("занятые слоты отключены и подписаны причиной", () => {
    render(<TimeSlots slots={SLOTS} taken={["09:30"]} />);
    const busy = screen.getByRole("button", { name: "09:30, занято" }) as HTMLButtonElement;
    expect(busy.disabled).toBe(true);
    expect((screen.getByRole("button", { name: "09:00" }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("className, ref и атрибуты идут на корень, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<TimeSlots ref={ref} slots={SLOTS} className="own" id="s1" />);
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.id).toBe("s1");
    expect(container.querySelector("[data-force]")).toBeNull();
  });
});

describe("TimeSlots: выбор", () => {
  it("клик выбирает слот: aria-pressed, подпись и onChange", () => {
    const onChange = vi.fn();
    render(<TimeSlots slots={SLOTS} onChange={onChange} />);
    const slot = screen.getByRole("button", { name: "10:00" });
    expect(slot.getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(slot);
    expect(slot.getAttribute("aria-pressed")).toBe("true");
    expect(onChange).toHaveBeenCalledWith("10:00");
    expect(screen.getByText("Выбрано:").textContent).toContain("10:00");
  });

  it("выбор переносится на другой слот", () => {
    render(<TimeSlots slots={SLOTS} defaultValue="09:00" />);
    fireEvent.click(screen.getByRole("button", { name: "10:30" }));
    expect(screen.getByRole("button", { name: "09:00" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(screen.getByRole("button", { name: "10:30" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("занятый слот не выбирается", () => {
    const onChange = vi.fn();
    render(<TimeSlots slots={SLOTS} taken={["09:30"]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "09:30, занято" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("value управляет выбором: без нового пропса слот не переключается", () => {
    const onChange = vi.fn();
    const { rerender } = render(<TimeSlots slots={SLOTS} value="09:00" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "10:00" }));
    expect(onChange).toHaveBeenCalledWith("10:00");
    expect(screen.getByRole("button", { name: "09:00" }).getAttribute("aria-pressed")).toBe("true");
    rerender(<TimeSlots slots={SLOTS} value="10:00" onChange={onChange} />);
    expect(screen.getByRole("button", { name: "10:00" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("slotData добавляет атрибуты слоту", () => {
    render(
      <TimeSlots
        slots={SLOTS}
        slotData={(t) => (t === "10:00" ? { "data-mark": "1" } : undefined)}
      />,
    );
    expect(screen.getByRole("button", { name: "10:00" }).getAttribute("data-mark")).toBe("1");
    expect(screen.getByRole("button", { name: "09:00" }).hasAttribute("data-mark")).toBe(false);
  });
});

describe("TimeSlots: состояния", () => {
  it("loading: aria-busy и заглушки вместо слотов", () => {
    const { container } = render(<TimeSlots slots={SLOTS} loading />);
    expect(screen.getByRole("group").getAttribute("aria-busy")).toBe("true");
    expect(container.querySelectorAll(".ds-slots__skel")).toHaveLength(8);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("пустой список и «всё занято» дают заметку без слотов", () => {
    const { rerender } = render(<TimeSlots slots={[]} />);
    expect(screen.getByText("Свободных слотов нет")).toBeTruthy();
    rerender(<TimeSlots slots={SLOTS} taken={SLOTS} emptyText="Выберите другую дату" />);
    expect(screen.getByText("Выберите другую дату")).toBeTruthy();
  });

  it("error: alert и «Повторить»", () => {
    const onRetry = vi.fn();
    render(<TimeSlots slots={SLOTS} error onRetry={onRetry} errorText="Терминал не ответил" />);
    expect(screen.getByRole("alert").textContent).toContain("Терминал не ответил");
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("при ошибке выбор не объявляется", () => {
    render(<TimeSlots slots={SLOTS} error defaultValue="09:00" />);
    expect(screen.getByText("Время не выбрано")).toBeTruthy();
  });
});

describe("TimeSlot", () => {
  it("кнопка слота: type=button, aria-pressed и проброс атрибутов", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<TimeSlot ref={ref} time="11:00" selected data-x="1" />);
    const slot = screen.getByRole("button", { name: "11:00" });
    expect(ref.current).toBe(slot);
    expect(slot.getAttribute("type")).toBe("button");
    expect(slot.getAttribute("aria-pressed")).toBe("true");
    expect(slot.getAttribute("data-x")).toBe("1");
  });
});

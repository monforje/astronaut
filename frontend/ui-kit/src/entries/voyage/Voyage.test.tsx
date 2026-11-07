/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Voyage } from "./index";

const base = { from: "Нинбо", to: "Владивосток", vessel: "MSC Aurora", animate: false } as const;

describe("Voyage: рендер", () => {
  it("прогресс, подписи портов и дат", () => {
    render(<Voyage {...base} progress={0.64} departure="04.11" arrival="16.11" />);
    const bar = screen.getByRole("progressbar", { name: "Прогресс рейса" });
    expect(bar.getAttribute("aria-valuenow")).toBe("64");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe(
      "MSC Aurora, в пути: Нинбо → Владивосток, 64 %",
    );
    expect(screen.getByText("Нинбо")).toBeTruthy();
    expect(screen.getByText("отплытие 04.11")).toBeTruthy();
    expect(screen.getByText("прибытие 16.11")).toBeTruthy();
    expect(screen.getByText("64%")).toBeTruthy();
    expect(screen.getByText("в пути")).toBeTruthy();
  });

  it("даты как Date форматируются дд.мм, без дат подписи нет", () => {
    const { rerender } = render(
      <Voyage
        {...base}
        progress={0.5}
        departure={new Date(2026, 10, 4)}
        arrival={new Date(2026, 10, 16)}
      />,
    );
    expect(screen.getByText("отплытие 04.11")).toBeTruthy();
    expect(screen.getByText("прибытие 16.11")).toBeTruthy();
    rerender(<Voyage {...base} progress={0.5} />);
    expect(screen.queryByText(/отплытие/)).toBeNull();
  });

  it("прогресс ограничивается 0..100 и мусор даёт 0", () => {
    const { container, rerender } = render(<Voyage {...base} progress={1.7} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    expect(
      (container.firstElementChild as HTMLElement).style.getPropertyValue("--ds-voyage-p"),
    ).toBe("1");
    rerender(<Voyage {...base} progress={Number.NaN} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });

  it("статусы: ожидание — пунктир и точка без заливки, задержка — тон warn, прибытие — конечная точка", () => {
    const { container, rerender } = render(<Voyage {...base} progress={0} status="wait" />);
    expect(container.querySelector(".ds-voyage__line")?.hasAttribute("data-dashed")).toBe(true);
    expect(container.querySelector(".ds-voyage__dot--start")?.hasAttribute("data-on")).toBe(false);
    expect(screen.getByText("ожидает отплытия")).toBeTruthy();
    rerender(<Voyage {...base} progress={0.4} status="delay" statusText="задержка 1 д." />);
    expect(container.firstElementChild?.getAttribute("data-tone")).toBe("warn");
    expect(screen.getByText("задержка 1 д.")).toBeTruthy();
    rerender(<Voyage {...base} progress={1} status="arrived" />);
    expect(container.querySelector(".ds-voyage__dot--end")?.hasAttribute("data-on")).toBe(true);
    expect(screen.getByText("прибыл")).toBeTruthy();
  });

  it("compact прячет подписи, children попадают в блок бейджей", () => {
    const { container } = render(
      <Voyage {...base} progress={0.5} compact>
        <span>бейдж</span>
      </Voyage>,
    );
    expect(container.querySelector(".ds-voyage__labels")).toBeNull();
    expect(container.querySelector(".ds-voyage__badges")?.textContent).toBe("бейдж");
  });

  it("ref, className, атрибуты; data-force по умолчанию нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Voyage {...base} ref={ref} progress={0.5} className="own" id="v1" />);
    expect(ref.current?.classList.contains("own")).toBe(true);
    expect(ref.current?.id).toBe("v1");
    expect(ref.current?.querySelector("[data-force]")).toBeNull();
  });

  it("при animate первая отрисовка с нуля, затем значение", async () => {
    const { container } = render(<Voyage {...base} animate progress={0.5} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--ds-voyage-p")).toBe("0");
    await waitFor(() => expect(root.style.getPropertyValue("--ds-voyage-p")).toBe("0.5"));
  });
});

describe("Voyage: подсказка судна", () => {
  it("наведение и фокус показывают название и процент, Escape прячет", () => {
    render(<Voyage {...base} progress={0.64} />);
    const ship = screen.getByRole("button", { name: "MSC Aurora: 64 %" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseEnter(ship);
    expect(screen.getByRole("tooltip").textContent).toBe("MSC Aurora · 64 %");
    fireEvent.keyDown(ship, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    fireEvent.mouseLeave(ship);
    act(() => ship.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    act(() => ship.blur());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("tipOpen держит подсказку открытой", () => {
    render(<Voyage {...base} progress={0.5} tipOpen />);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });
});

describe("Voyage: состояния", () => {
  it("loading: aria-busy и заглушка вместо трека", () => {
    const { container } = render(<Voyage {...base} progress={0.5} loading />);
    expect(container.firstElementChild?.getAttribute("aria-busy")).toBe("true");
    expect(container.querySelector(".ds-voyage__skel")).not.toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
  });

  it("empty и error — заметки, error с role=alert", () => {
    const { rerender } = render(<Voyage {...base} progress={0} empty />);
    expect(screen.getByText("Рейс не назначен")).toBeTruthy();
    rerender(<Voyage {...base} progress={0} error errorText="Нет сигнала AIS" />);
    expect(screen.getByRole("alert").textContent).toContain("Нет сигнала AIS");
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});

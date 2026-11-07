/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Delta, Donut, HBar, LineChart, Sparkline, type ChartSeries } from "./index";

const LABELS = ["Н1", "Н2", "Н3", "Н4"];
const SERIES: ChartSeries[] = [
  { name: "Все грузы", color: "teal", data: [22, 25, 24, 29] },
  { name: "С расхождениями", color: "orange", data: [4, 6, 3, 7] },
];

describe("LineChart", () => {
  it("рисует по пути на серию, сетку из пяти линий и легенду", () => {
    const { container } = render(<LineChart labels={LABELS} series={SERIES} />);
    expect(container.querySelectorAll(".ds-chart__path").length).toBe(2);
    expect(container.querySelectorAll(".ds-chart__grid").length).toBe(5);
    expect(screen.getAllByRole("button").length).toBe(2);
  });

  it("группа называется по label и сериям", () => {
    render(<LineChart labels={LABELS} series={SERIES} label="График по неделям" />);
    expect(
      screen.getByRole("group", { name: "График по неделям: Все грузы, С расхождениями" }),
    ).toBeTruthy();
  });

  it("стрелки ведут по точкам, Home и End в края, Escape сбрасывает", () => {
    const onActive = vi.fn();
    const { container } = render(
      <LineChart labels={LABELS} series={SERIES} onActiveIndexChange={onActive} />,
    );
    const area = screen.getByRole("application");
    fireEvent.focus(area);
    expect(container.querySelector(".ds-chart__tip b")?.textContent).toBe("Н1");
    fireEvent.keyDown(area, { key: "ArrowRight" });
    expect(container.querySelector(".ds-chart__tip b")?.textContent).toBe("Н2");
    fireEvent.keyDown(area, { key: "End" });
    expect(container.querySelector(".ds-chart__tip b")?.textContent).toBe("Н4");
    fireEvent.keyDown(area, { key: "ArrowRight" });
    expect(container.querySelector(".ds-chart__tip b")?.textContent).toBe("Н4");
    fireEvent.keyDown(area, { key: "Home" });
    expect(container.querySelector(".ds-chart__tip b")?.textContent).toBe("Н1");
    fireEvent.keyDown(area, { key: "Escape" });
    expect(container.querySelector(".ds-chart__tip")?.hasAttribute("data-on")).toBe(false);
    expect(onActive).toHaveBeenLastCalledWith(null);
  });

  it("подсказка показывает значения всех видимых серий", () => {
    const { container } = render(<LineChart labels={LABELS} series={SERIES} activeIndex={2} />);
    const tip = container.querySelector(".ds-chart__tip") as HTMLElement;
    expect(tip.hasAttribute("data-on")).toBe(true);
    expect(tip.textContent).toContain("Н3");
    expect(tip.textContent).toContain("24");
    expect(tip.textContent).toContain("3");
    expect(container.querySelectorAll(".ds-chart__dot").length).toBe(2);
  });

  it("легенда прячет серию, aria-pressed следует, последнюю серию спрятать нельзя", () => {
    const { container } = render(<LineChart labels={LABELS} series={SERIES} />);
    const first = screen.getByRole("button", { name: "Все грузы" });
    const second = screen.getByRole("button", { name: "С расхождениями" });
    fireEvent.click(second);
    expect(second.getAttribute("aria-pressed")).toBe("false");
    expect(container.querySelectorAll(".ds-chart__path").length).toBe(1);
    fireEvent.click(first);
    expect(first.getAttribute("aria-pressed")).toBe("true");
    expect(container.querySelectorAll(".ds-chart__path").length).toBe(1);
  });

  it("управляемый hidden: onHiddenSeriesChange вызывается, состояние не меняется само", () => {
    const onHidden = vi.fn();
    const { container } = render(
      <LineChart
        labels={LABELS}
        series={SERIES}
        hiddenSeries={[]}
        onHiddenSeriesChange={onHidden}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "С расхождениями" }));
    expect(onHidden).toHaveBeenCalledWith(["С расхождениями"]);
    expect(container.querySelectorAll(".ds-chart__path").length).toBe(2);
  });

  it("пусто: нет линий, подпись и область не берёт фокус", () => {
    const { container } = render(<LineChart labels={LABELS} series={SERIES} empty />);
    expect(container.querySelectorAll(".ds-chart__path").length).toBe(0);
    expect(screen.getByText("Данных за период нет")).toBeTruthy();
    expect(screen.getByRole("application").getAttribute("tabindex")).toBe("-1");
  });

  it("animate ставит data-appear; className, ref и атрибуты пробрасываются", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <LineChart
        ref={ref}
        labels={LABELS}
        series={SERIES}
        animate
        className="custom"
        data-testid="chart"
      />,
    );
    const chart = screen.getByTestId("chart");
    expect(ref.current).toBe(chart);
    expect(chart.hasAttribute("data-appear")).toBe(true);
    expect(chart.classList.contains("custom")).toBe(true);
    expect(chart.hasAttribute("data-force")).toBe(false);
  });
});

describe("Donut", () => {
  const parts = [
    { name: "Сверено", value: 60, color: "teal" as const },
    { name: "Ждут", value: 30, color: "orange" as const },
    { name: "Черновики", value: 10, color: "muted" as const },
  ];

  it("подпись перечисляет доли, в центре сумма", () => {
    render(<Donut parts={parts} label="Статусы" centerLabel="в работе" />);
    expect(
      screen.getByRole("img", { name: "Статусы: Сверено 60%, Ждут 30%, Черновики 10%" }),
    ).toBeTruthy();
    expect(screen.getByText("100")).toBeTruthy();
    expect(screen.getByText("в работе")).toBeTruthy();
  });

  it("total переопределяет число в центре", () => {
    render(<Donut parts={parts} total={128} />);
    expect(screen.getByText("128")).toBeTruthy();
  });

  it("наведение и фокус на легенде подсвечивают сегмент и меняют центр", () => {
    const onActive = vi.fn();
    const { container } = render(<Donut parts={parts} onActiveIndexChange={onActive} />);
    const legend = screen.getByRole("button", { name: /Ждут/ });
    fireEvent.focus(legend);
    expect(container.querySelector(".ds-chart__donut")?.hasAttribute("data-hv")).toBe(true);
    expect(container.querySelectorAll(".ds-chart__seg[data-hl]").length).toBe(1);
    expect(container.querySelector(".ds-chart__mid b")?.textContent).toBe("30");
    expect(onActive).toHaveBeenLastCalledWith(1);
    fireEvent.blur(legend);
    expect(container.querySelector(".ds-chart__donut")?.hasAttribute("data-hv")).toBe(false);
  });

  it("activeIndex управляет подсветкой, null её снимает", () => {
    const { container, rerender } = render(<Donut parts={parts} activeIndex={0} />);
    expect(container.querySelector(".ds-chart__mid span")?.textContent).toBe("Сверено");
    rerender(<Donut parts={parts} activeIndex={null} />);
    expect(container.querySelectorAll(".ds-chart__seg[data-hl]").length).toBe(0);
  });

  it("пусто: нет сегментов, прочерки в легенде", () => {
    const { container } = render(<Donut parts={parts} empty />);
    expect(container.querySelectorAll(".ds-chart__seg").length).toBe(0);
    expect(screen.getAllByText("—").length).toBe(3);
  });
});

describe("HBar", () => {
  const rows = [
    { label: "ООО «Дальснаб»", value: 300 },
    { label: "ИП Кравец", value: 150 },
  ];

  it("список строк с подписью и значением, ширина полосы от максимума", () => {
    const { container } = render(<HBar rows={rows} />);
    expect(screen.getAllByRole("listitem").length).toBe(2);
    const widths = [...container.querySelectorAll<HTMLElement>(".ds-chart__bar i")].map(
      (i) => i.style.width,
    );
    expect(widths).toEqual(["100%", "50%"]);
    expect(screen.getByText("150")).toBeTruthy();
  });

  it("grown=false оставляет полосы нулевыми", () => {
    const { container } = render(<HBar rows={rows} grown={false} />);
    expect((container.querySelector(".ds-chart__bar i") as HTMLElement).style.width).toBe("0%");
  });

  it("formatValue и max", () => {
    render(<HBar rows={rows} max={600} formatValue={(v) => `${v} шт`} />);
    expect(screen.getByText("300 шт")).toBeTruthy();
  });
});

describe("Sparkline и Delta", () => {
  it("спарклайн: изображение с подписью и цветом серии", () => {
    render(<Sparkline data={[1, 3, 2, 5]} color="danger" label="Динамика: срок" />);
    const spark = screen.getByRole("img", { name: "Динамика: срок" });
    expect(spark.style.getPropertyValue("--ds-chart-c")).toBe("var(--danger)");
  });

  it("спарклайн с одной точкой не рисуется", () => {
    const { container } = render(<Sparkline data={[1]} />);
    expect(container.firstChild).toBeNull();
  });

  it("дельта: тон, направление и текст", () => {
    const { container } = render(
      <Delta tone="bad" dir="up">
        +5 за неделю
      </Delta>,
    );
    const delta = container.firstElementChild as HTMLElement;
    expect(delta.classList.contains("ds-chart__delta--bad")).toBe(true);
    expect(delta.textContent).toBe("+5 за неделю");
    expect(delta.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("дельта без направления не рисует стрелку", () => {
    const { container } = render(<Delta tone="flat">0%</Delta>);
    expect(container.querySelector("svg")).toBeNull();
  });
});

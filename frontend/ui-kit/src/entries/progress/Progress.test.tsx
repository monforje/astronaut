/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Progress, ProgressButton, ProgressCircle, ProgressSegments } from "./index";

describe("Progress", () => {
  it("рисует подпись, значение и progressbar с aria-значениями", () => {
    render(<Progress label="Сверено документов" value={91} />);
    const bar = screen.getByRole("progressbar", { name: "Сверено документов" });
    expect(bar.getAttribute("aria-valuenow")).toBe("91");
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuetext")).toBe("91%");
    expect(screen.getByText("91%")).toBeTruthy();
  });

  it("по умолчанию primary md: один базовый класс", () => {
    const { container } = render(<Progress label="Загрузка" value={10} />);
    expect((container.firstChild as HTMLElement).className).toBe("ds-progress");
  });

  it("тон, размер и режимы выражены классами", () => {
    const { container, rerender } = render(
      <Progress label="Квота" value={98} tone="err" size="lg" striped />,
    );
    const root = container.firstChild as HTMLElement;
    for (const name of ["ds-progress--err", "ds-progress--lg", "ds-progress--str"]) {
      expect(root.classList.contains(name), name).toBe(true);
    }
    rerender(<Progress label="Квота" indeterminate />);
    expect((container.firstChild as HTMLElement).classList.contains("ds-progress--ind")).toBe(true);
  });

  it("valueText заменяет проценты в тексте и aria-valuetext", () => {
    render(<Progress label="Позиции с ценой" value={73} valueText="58 из 79" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("58 из 79");
    expect(screen.getByText("58 из 79")).toBeTruthy();
  });

  it("неопределённый режим без aria-valuenow", () => {
    render(<Progress label="Синхронизация" indeterminate />);
    const bar = screen.getByRole("progressbar");
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.getAttribute("aria-valuetext")).toBe("выполняется");
    expect(screen.getByText("неопределённо")).toBeTruthy();
  });

  it("значение зажимается в 0-100", () => {
    const { rerender } = render(<Progress label="x" value={140} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
    rerender(<Progress label="x" value={-5} />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });

  it("bare прячет шапку, имя остаётся в aria-label", () => {
    const { container } = render(<Progress bare label="Файл" value={20} />);
    expect(container.querySelector(".ds-progress__head")).toBeNull();
    expect(screen.getByRole("progressbar", { name: "Файл" })).toBeTruthy();
  });

  it("ref, className и атрибуты пробрасываются, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} className="custom" data-testid="p" label="x" value={1} />);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("p");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("ProgressCircle и ProgressSegments", () => {
  it("круг: роль, значение, процент в центре", () => {
    render(<ProgressCircle value={72} label="Сверка" tone="info" />);
    const bar = screen.getByRole("progressbar", { name: "Сверка" });
    expect(bar.getAttribute("aria-valuenow")).toBe("72");
    expect(bar.classList.contains("ds-progress-circ--info")).toBe(true);
    expect(bar.textContent).toBe("72%");
    expect(bar.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("сегменты: заполнены первые value, ошибка отмечена", () => {
    const { container } = render(<ProgressSegments total={5} value={3} error={3} label="Шаги" />);
    const segments = [...container.querySelectorAll("i")];
    expect(segments).toHaveLength(5);
    expect(segments.filter((i) => i.hasAttribute("data-on"))).toHaveLength(3);
    expect(segments[3].hasAttribute("data-err")).toBe(true);
    const bar = screen.getByRole("progressbar", { name: "Шаги" });
    expect(bar.getAttribute("aria-valuemax")).toBe("5");
    expect(bar.getAttribute("aria-valuetext")).toBe("ошибка");
  });

  it("сегменты без ошибки: текст «из»", () => {
    render(<ProgressSegments total={4} value={2} label="Шаги" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("2 из 4");
  });
});

describe("ProgressButton", () => {
  it("в покое обычная кнопка type=button, клик проходит", () => {
    const onClick = vi.fn();
    render(<ProgressButton onClick={onClick}>Сверить</ProgressButton>);
    const button = screen.getByRole("button", { name: "Сверить" });
    expect(button.getAttribute("type")).toBe("button");
    expect(button.hasAttribute("aria-busy")).toBe(false);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("running: aria-busy, спиннер, клик гасится, не disabled", () => {
    const onClick = vi.fn();
    render(
      <ProgressButton status="running" value={34} onClick={onClick}>
        Сверяем · 34%
      </ProgressButton>,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".ds-spinner")).not.toBeNull();
    expect(button.style.getPropertyValue("--ds-progress-v")).toBe("34%");
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("статус пишется в data-status", () => {
    render(<ProgressButton status="err">Повторить</ProgressButton>);
    expect(screen.getByRole("button").getAttribute("data-status")).toBe("err");
  });
});

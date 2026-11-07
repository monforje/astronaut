/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Stepper, type StepperStep } from "./index";

const STEPS: StepperStep[] = [
  { title: "Новый" },
  { title: "В работе", hint: "11 ноя" },
  { title: "Сверка" },
  { title: "Решено" },
];

const statuses = () => screen.getAllByRole("listitem").map((li) => li.getAttribute("data-status"));

describe("Stepper", () => {
  it("рендерит упорядоченный список с подписью по умолчанию и шагами", () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByRole("list", { name: "Шаги процесса" }).tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("по умолчанию inline, вид выражен классом", () => {
    render(
      <>
        <Stepper steps={STEPS} aria-label="а" />
        <Stepper steps={STEPS} aria-label="б" variant="below" />
        <Stepper steps={STEPS} aria-label="в" variant="vertical" />
      </>,
    );
    expect(screen.getByLabelText("а").classList.contains("ds-stp--inline")).toBe(true);
    expect(screen.getByLabelText("б").classList.contains("ds-stp--below")).toBe(true);
    expect(screen.getByLabelText("в").classList.contains("ds-stp--vertical")).toBe(true);
  });

  it("статусы выражены data-status: пройден, текущий, впереди", () => {
    render(<Stepper steps={STEPS} current={2} />);
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.getAttribute("data-status"))).toEqual([
      "done",
      "done",
      "cur",
      "todo",
    ]);
  });

  it("текущий шаг помечен aria-current=step, остальные нет", () => {
    const { container } = render(<Stepper steps={STEPS} current={1} />);
    const marked = container.querySelectorAll("[aria-current]");
    expect(marked).toHaveLength(1);
    expect(marked[0].getAttribute("aria-current")).toBe("step");
    expect(marked[0].textContent).toContain("В работе");
  });

  it("статус шага читается скринридером, номер и значок скрыты", () => {
    const { container } = render(<Stepper steps={STEPS} current={1} />);
    const sr = [...container.querySelectorAll(".ds-stp__sr")].map((n) => n.textContent);
    expect(sr).toEqual([", пройден", ", текущий", ", впереди", ", впереди"]);
    expect(container.querySelector(".ds-stp__n")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("пройденный шаг показывает галочку, остальные номер, ошибка восклицательный знак", () => {
    const { container } = render(<Stepper steps={STEPS} current={2} error={2} />);
    const marks = [...container.querySelectorAll(".ds-stp__n")];
    expect(marks[0].querySelector("svg")).toBeTruthy();
    expect(marks[2].textContent).toBe("!");
    expect(marks[3].textContent).toBe("4");
    expect(screen.getAllByRole("listitem")[2].getAttribute("data-status")).toBe("err");
  });

  it("шаг с ошибкой тоже помечен aria-current", () => {
    const { container } = render(<Stepper steps={STEPS} current={1} error={1} />);
    expect(container.querySelector("[aria-current]")?.textContent).toContain("ошибка");
  });

  it("current меньше нуля оставляет все шаги впереди, больше длины — все пройдены", () => {
    const { rerender } = render(<Stepper steps={STEPS} current={-1} />);
    expect(new Set(statuses())).toEqual(new Set(["todo"]));
    rerender(<Stepper steps={STEPS} current={4} />);
    expect(new Set(statuses())).toEqual(new Set(["done"]));
  });

  it("подсказка шага рисуется", () => {
    render(<Stepper steps={STEPS} />);
    expect(screen.getByText("11 ноя")).toBeTruthy();
  });

  it("вертикальный вид показывает detail только у текущего шага", () => {
    render(
      <Stepper
        variant="vertical"
        current={1}
        steps={[
          { title: "А", detail: "подробности А" },
          { title: "Б", detail: "подробности Б" },
          { title: "В", detail: "подробности В" },
        ]}
      />,
    );
    expect(screen.queryByText("подробности А")).toBeNull();
    expect(screen.getByText("подробности Б")).toBeTruthy();
    expect(screen.queryByText("подробности В")).toBeNull();
  });

  it("без clickable шаги не кнопки", () => {
    render(<Stepper steps={STEPS} current={1} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("clickable: клик по пройденному и будущему шагам вызывает onStepClick, по текущему нет", () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} current={1} clickable onStepClick={onStepClick} />);
    fireEvent.click(screen.getByRole("button", { name: /Новый/ }));
    fireEvent.click(screen.getByRole("button", { name: /Сверка/ }));
    fireEvent.click(screen.getByRole("button", { name: /В работе/ }));
    expect(onStepClick.mock.calls).toEqual([[0], [2]]);
  });

  it("lockAhead блокирует будущие шаги, пройденные остаются доступны", () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={STEPS} current={2} clickable lockAhead onStepClick={onStepClick} />);
    const future = screen.getByRole("button", { name: /Решено/ }) as HTMLButtonElement;
    expect(future.disabled).toBe(true);
    fireEvent.click(future);
    fireEvent.click(screen.getByRole("button", { name: /Новый/ }));
    expect(onStepClick.mock.calls).toEqual([[0]]);
    expect((screen.getByRole("button", { name: /Сверка/ }) as HTMLButtonElement).disabled).toBe(
      false,
    );
  });

  it("атрибуты шага ставятся на его li, className ref и подпись пробрасываются", () => {
    const ref = createRef<HTMLOListElement>();
    render(
      <Stepper
        ref={ref}
        className="custom"
        aria-label="Ход груза"
        steps={[{ title: "Заявка", "data-x": "1", className: "item" }, { title: "Выдача" }]}
      />,
    );
    const list = screen.getByRole("list", { name: "Ход груза" });
    expect(ref.current).toBe(list);
    expect(list.classList.contains("custom")).toBe(true);
    const first = screen.getAllByRole("listitem")[0];
    expect(first.getAttribute("data-x")).toBe("1");
    expect(first.classList.contains("item")).toBe(true);
    expect(first.hasAttribute("data-force")).toBe(false);
  });
});

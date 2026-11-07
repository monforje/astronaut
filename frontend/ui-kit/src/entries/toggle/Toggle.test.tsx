/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Toggle } from "./index";

describe("Toggle", () => {
  it("рисует подпись, по умолчанию pill sm, выключен и type=button", () => {
    render(<Toggle>Закрепить</Toggle>);
    const button = screen.getByRole("button", { name: "Закрепить" });
    expect(button.className).toBe("ds-toggle");
    expect(button.getAttribute("type")).toBe("button");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.querySelector(".ds-toggle__label")?.textContent).toBe("Закрепить");
  });

  it("вид, размер и квадратная форма выражены классами", () => {
    render(
      <Toggle variant="chip" size="md" square aria-label="Жирный">
        Б
      </Toggle>,
    );
    const button = screen.getByRole("button");
    for (const name of ["ds-toggle--chip", "ds-toggle--md", "ds-toggle--sq"]) {
      expect(button.classList.contains(name), name).toBe(true);
    }
  });

  it("ghost добавляет свой класс, pill не добавляет", () => {
    const { rerender } = render(<Toggle variant="ghost">Ок</Toggle>);
    expect(screen.getByRole("button").classList.contains("ds-toggle--ghost")).toBe(true);
    rerender(<Toggle variant="pill">Ок</Toggle>);
    expect(screen.getByRole("button").className).toBe("ds-toggle");
  });

  it("неуправляемый режим: клик переключает aria-pressed", () => {
    render(<Toggle>Мои</Toggle>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(button);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("defaultPressed задаёт начальное положение", () => {
    render(<Toggle defaultPressed>Мои</Toggle>);
    expect(screen.getByRole("button").getAttribute("aria-pressed")).toBe("true");
  });

  it("управляемый режим: положение берётся из pressed, клик только сообщает", () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle pressed={false} onPressedChange={onPressedChange}>
        Мои
      </Toggle>,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("onPressedChange получает новое значение при каждом клике", () => {
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Мои</Toggle>);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(onPressedChange.mock.calls).toEqual([[true], [false]]);
  });

  it("onClick вызывается, preventDefault отменяет переключение", () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(<Toggle onClick={onClick}>Мои</Toggle>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-pressed")).toBe("false");
  });

  it("disabled блокирует клик", () => {
    const onPressedChange = vi.fn();
    render(
      <Toggle disabled onPressedChange={onPressedChange}>
        Мои
      </Toggle>,
    );
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(onPressedChange).not.toHaveBeenCalled();
  });

  it("значок скрыт от скринридера, имя квадратной берётся из aria-label", () => {
    render(<Toggle square icon={<svg data-testid="ico" />} aria-label="Курсив" />);
    const button = screen.getByRole("button", { name: "Курсив" });
    expect(screen.getByTestId("ico").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(button.querySelector(".ds-toggle__label")).toBeNull();
  });

  it("className, data-атрибуты и ref пробрасываются на кнопку", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Toggle ref={ref} className="custom" data-testid="t">
        Мои
      </Toggle>,
    );
    const button = screen.getByTestId("t");
    expect(button.classList.contains("custom")).toBe(true);
    expect(button.classList.contains("ds-toggle")).toBe(true);
    expect(ref.current).toBe(button);
  });

  it("сам по себе не ставит data-force", () => {
    render(<Toggle>Мои</Toggle>);
    expect(screen.getByRole("button").hasAttribute("data-force")).toBe(false);
  });
});

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Tooltip, TooltipCard } from "./index";

function setup(props: Partial<React.ComponentProps<typeof Tooltip>> = {}) {
  render(
    <Tooltip content="Скачать выписку" {...props}>
      <Button aria-label="Скачать">Скачать</Button>
    </Tooltip>,
  );
  return screen.getByRole("button");
}

describe("Tooltip", () => {
  it("по умолчанию скрыт: в DOM карточки нет", () => {
    setup();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("наведение показывает карточку в body, уход убирает её сразу", () => {
    const button = setup({ kbd: "Ctrl N" });
    fireEvent.mouseEnter(button.parentElement!);
    const tip = screen.getByRole("tooltip");
    expect(tip.parentElement).toBe(document.body);
    expect(tip.textContent).toBe("Скачать выпискуCtrl N");
    expect(tip.querySelector(".ds-tooltip__kbd")?.textContent).toBe("Ctrl N");
    fireEvent.mouseLeave(button.parentElement!);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("якорь ссылается на карточку через aria-describedby", () => {
    const button = setup();
    fireEvent.mouseEnter(button.parentElement!);
    expect(button.getAttribute("aria-describedby")).toBe(screen.getByRole("tooltip").id);
  });

  it("клавиатурный фокус показывает, потеря фокуса скрывает", () => {
    const button = setup();
    act(() => button.focus());
    expect(screen.getByRole("tooltip")).toBeTruthy();
    act(() => button.blur());
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("Esc скрывает подсказку, фокус остаётся на якоре", () => {
    const button = setup();
    act(() => button.focus());
    fireEvent.keyDown(button, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();
    expect(document.activeElement).toBe(button);
  });

  it("нажатие на якорь гасит подсказку", () => {
    const button = setup();
    fireEvent.mouseEnter(button.parentElement!);
    fireEvent.mouseDown(button);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("при открытом меню (aria-expanded) не показывается", () => {
    render(
      <Tooltip content="Меню">
        <Button aria-expanded="true">Меню</Button>
      </Tooltip>,
    );
    fireEvent.mouseEnter(screen.getByRole("button").parentElement!);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("прокрутка скрывает подсказку", () => {
    const button = setup();
    fireEvent.mouseEnter(button.parentElement!);
    fireEvent.scroll(document);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("open управляет показом, onOpenChange сообщает о запросе", () => {
    const onOpenChange = vi.fn();
    const button = setup({ open: true, onOpenChange });
    expect(screen.getByRole("tooltip")).toBeTruthy();
    fireEvent.mouseLeave(button.parentElement!);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("tooltip")).toBeTruthy();
  });

  it("сторона и перенос текста попадают на карточку", () => {
    setup({ open: true, side: "right", wrap: true });
    const tip = screen.getByRole("tooltip");
    expect(tip.getAttribute("data-side")).toBe("right");
    expect(tip.classList.contains("ds-tooltip--wrap")).toBe(true);
  });

  it("ref и className относятся к обёртке якоря, data-force нет", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Tooltip ref={ref} className="custom" content="Текст">
        <Button>Ок</Button>
      </Tooltip>,
    );
    expect(ref.current?.classList.contains("ds-tooltip-anchor")).toBe(true);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("TooltipCard", () => {
  it("рисует карточку на месте с текстом и сочетанием клавиш", () => {
    const { container } = render(<TooltipCard content="Создать груз" kbd="Ctrl N" />);
    expect(container.querySelector(".ds-tooltip__text")?.textContent).toBe("Создать груз");
    expect(container.querySelector(".ds-tooltip__kbd")?.textContent).toBe("Ctrl N");
  });
});

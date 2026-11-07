/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Popover, PopoverBody, PopoverFoot, PopoverHead } from "./index";

function Example(props: Partial<React.ComponentProps<typeof Popover>> = {}) {
  return (
    <Popover trigger={<Button>Фильтр</Button>} label="Фильтр грузов" {...props}>
      {({ close }) => (
        <>
          <PopoverHead>Фильтр</PopoverHead>
          <PopoverBody>
            <input aria-label="С" />
          </PopoverBody>
          <PopoverFoot>
            <Button onClick={close}>Применить</Button>
          </PopoverFoot>
        </>
      )}
    </Popover>
  );
}

describe("Popover", () => {
  it("закрыт по умолчанию: якорь с aria-haspopup и aria-expanded=false", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("клик открывает панель в body с подписью, связь через aria-controls", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: "Фильтр грузов" });
    expect(panel.parentElement).toBe(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("при открытии фокус уходит в первый элемент панели", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Фильтр" }));
    expect(document.activeElement).toBe(screen.getByLabelText("С"));
  });

  it("focusOnOpen=false оставляет фокус на якоре", () => {
    render(<Example focusOnOpen={false} />);
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    act(() => trigger.focus());
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(trigger);
  });

  it("Esc закрывает и возвращает фокус на якорь", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("клик вне панели закрывает, клик внутри нет", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Фильтр" }));
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("close из содержимого закрывает и возвращает фокус", () => {
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("прокрутка страницы закрывает, прокрутка внутри панели нет", () => {
    render(<Example />);
    fireEvent.click(screen.getByRole("button", { name: "Фильтр" }));
    fireEvent.scroll(screen.getByLabelText("С"));
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.scroll(document);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("управляемый режим: open задаёт показ, onOpenChange получает запросы", () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Example
          open={open}
          onOpenChange={(next) => {
            onOpenChange(next);
            setOpen(next);
          }}
        />
      );
    }
    render(<Controlled />);
    fireEvent.click(screen.getByRole("button", { name: "Фильтр" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole("dialog")).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("open без onOpenChange остаётся как задан", () => {
    render(<Example open />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("defaultOpen открывает сразу", () => {
    render(<Example defaultOpen />);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });

  it("сторона и ref, className, атрибуты — на панели, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Example open side="top" ref={ref} className="custom" data-testid="p" />);
    const panel = screen.getByRole("dialog");
    expect(ref.current).toBe(panel);
    expect(panel.classList.contains("custom")).toBe(true);
    expect(panel.getAttribute("data-testid")).toBe("p");
    expect(panel.hasAttribute("data-force")).toBe(false);
  });

  it("onClick якоря вызывается и может отменить открытие", () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Popover trigger={<Button onClick={onClick}>Ещё</Button>} label="Меню">
        Содержимое
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ещё" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

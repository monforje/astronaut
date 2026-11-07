/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AgentBubble, AgentTab } from "./index";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("AgentTab", () => {
  it("закрытый язычок: кнопка с подписью, aria-expanded=false, подсказка по умолчанию Ctrl J", () => {
    render(<AgentTab />);
    const tab = screen.getByRole("button", { name: "Открыть агента" });
    expect(tab.getAttribute("aria-expanded")).toBe("false");
    expect(tab.getAttribute("type")).toBe("button");
    expect(tab.querySelector(".ds-agent-tab__more small")?.textContent).toBe("Ctrl J");
    expect(tab.querySelector(".ds-agent-tab__logo img")?.getAttribute("alt")).toBe("");
    expect(tab.hasAttribute("data-open")).toBe(false);
  });

  it("клик просит открыть, у открытого — свернуть", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<AgentTab onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    rerender(<AgentTab open onOpenChange={onOpenChange} />);
    const tab = screen.getByRole("button", { name: "Свернуть агента" });
    expect(tab.getAttribute("aria-expanded")).toBe("true");
    expect(tab.hasAttribute("data-open")).toBe(true);
    fireEvent.click(tab);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("бейдж: счётчик, слово в подписи, у открытого бейджа в подписи нет", () => {
    const { rerender } = render(<AgentTab badge={3} hint="есть идея" />);
    const tab = screen.getByRole("button");
    expect(tab.querySelector(".ds-agent-tab__badge .ds-badge--counter")?.textContent).toBe("3");
    expect(tab.getAttribute("aria-label")).toBe("Открыть агента, есть предложение");
    rerender(<AgentTab badge open />);
    expect(screen.getByRole("button").getAttribute("aria-label")).toBe("Свернуть агента");
  });

  it("hidden прячет язычок из показа через data-hide", () => {
    render(<AgentTab hidden />);
    expect(screen.getByRole("button").hasAttribute("data-hide")).toBe(true);
  });

  it("положение по вертикали идёт в переменную, onYChange получает новое значение при перетаскивании", () => {
    const onYChange = vi.fn();
    render(<AgentTab defaultY={200} onYChange={onYChange} />);
    const tab = screen.getByRole("button");
    expect(tab.style.getPropertyValue("--ds-agent-tab-y")).toBe("200px");
    fireEvent.pointerDown(tab, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(tab, { clientY: 140, pointerId: 1 });
    expect(onYChange).toHaveBeenCalled();
    expect(tab.hasAttribute("data-drag")).toBe(true);
    expect(tab.style.getPropertyValue("--ds-agent-tab-y")).toBe("240px");
    fireEvent.pointerUp(tab, { pointerId: 1 });
    expect(tab.hasAttribute("data-drag")).toBe(false);
  });

  it("после перетаскивания клик не открывает панель", () => {
    const onOpenChange = vi.fn();
    render(<AgentTab defaultY={200} onOpenChange={onOpenChange} />);
    const tab = screen.getByRole("button");
    fireEvent.pointerDown(tab, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(tab, { clientY: 160, pointerId: 1 });
    fireEvent.pointerUp(tab, { pointerId: 1 });
    fireEvent.click(tab);
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.click(tab);
    expect(onOpenChange).toHaveBeenCalledTimes(1);
  });

  it("мелкое движение (до 4 px) не считается перетаскиванием", () => {
    render(<AgentTab defaultY={200} />);
    const tab = screen.getByRole("button");
    fireEvent.pointerDown(tab, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(tab, { clientY: 102, pointerId: 1 });
    expect(tab.hasAttribute("data-drag")).toBe(false);
  });

  it("draggable=false и открытая панель отключают перетаскивание", () => {
    const { rerender } = render(<AgentTab defaultY={200} draggable={false} />);
    const tab = screen.getByRole("button");
    fireEvent.pointerDown(tab, { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(tab, { clientY: 200, pointerId: 1 });
    expect(tab.style.getPropertyValue("--ds-agent-tab-y")).toBe("200px");
    rerender(<AgentTab defaultY={200} open />);
    fireEvent.pointerDown(screen.getByRole("button"), { clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(screen.getByRole("button"), { clientY: 200, pointerId: 1 });
    expect(screen.getByRole("button").style.getPropertyValue("--ds-agent-tab-y")).toBe("200px");
  });

  it("у открытого язычка через 400 мс включается слежение за панелью", () => {
    render(<AgentTab open />);
    const tab = screen.getByRole("button");
    expect(tab.hasAttribute("data-tracking")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(tab.hasAttribute("data-tracking")).toBe(true);
  });

  it("прилипает к панели: right берётся из ширины attachTo", () => {
    const host = document.createElement("div");
    Object.defineProperty(host, "offsetWidth", { value: 430, configurable: true });
    const attachTo = { current: host };
    render(<AgentTab open attachTo={attachTo} />);
    expect(screen.getByRole("button").style.right).toBe("430px");
  });

  it("ref, className, атрибуты; data-force нет", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<AgentTab ref={ref} className="custom" data-testid="t" />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current?.classList.contains("ds-agent-tab")).toBe(true);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("t");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("AgentBubble", () => {
  it("закрытый не рисуется, открытый — диалог с подписью, текстом и действиями", () => {
    const { rerender } = render(<AgentBubble open={false}>Текст</AgentBubble>);
    expect(screen.queryByRole("dialog")).toBeNull();
    rerender(
      <AgentBubble open actions={<button type="button">Показать</button>}>
        Нашёл 8 грузов
      </AgentBubble>,
    );
    const bubble = screen.getByRole("dialog", { name: "Предложение агента" });
    expect(bubble.textContent).toContain("Нашёл 8 грузов");
    expect(bubble.querySelector(".ds-agent-tab__bub-actions button")).not.toBeNull();
  });

  it("крест просит закрыть", () => {
    const onOpenChange = vi.fn();
    render(
      <AgentBubble open onOpenChange={onOpenChange}>
        Текст
      </AgentBubble>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("закрывается сам через 14 секунд, duration меняет срок, Infinity отключает", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <AgentBubble open onOpenChange={onOpenChange}>
        Текст
      </AgentBubble>,
    );
    act(() => {
      vi.advanceTimersByTime(13900);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    rerender(
      <AgentBubble open duration={Infinity} onOpenChange={onOpenChange}>
        Текст
      </AgentBubble>,
    );
    act(() => {
      vi.advanceTimersByTime(60000);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("при закрытии 200 мс уходит с data-out, затем убирается", () => {
    const { rerender } = render(<AgentBubble open>Текст</AgentBubble>);
    rerender(<AgentBubble open={false}>Текст</AgentBubble>);
    expect(screen.getByRole("dialog").hasAttribute("data-out")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("anchorY задаёт верх над язычком, не меньше 8 px", () => {
    render(
      <AgentBubble open anchorY={10}>
        Текст
      </AgentBubble>,
    );
    expect(screen.getByRole("dialog").style.top).toBe("8px");
  });

  it("ref, className, атрибуты", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AgentBubble open ref={ref} className="custom" data-testid="b">
        Текст
      </AgentBubble>,
    );
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("b");
  });
});

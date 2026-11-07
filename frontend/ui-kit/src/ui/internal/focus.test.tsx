/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getFocusable, pickInitialFocus, trapTab } from "./focus";

function Panel({ extra }: { extra?: boolean }) {
  return (
    <div
      role="toolbar"
      data-testid="root"
      tabIndex={-1}
      onKeyDown={(event) => trapTab(event, event.currentTarget)}
    >
      <button type="button">Первая</button>
      <button type="button" disabled>
        Выключена
      </button>
      <div inert>
        <button type="button">Недоступна</button>
      </div>
      {/* oxlint-disable-next-line jsx-a11y/no-aria-hidden-on-focusable -- проверяем, что скрытое от чтения не получает фокус через getFocusable */}
      <a href="#x" aria-hidden="true">
        Скрыта
      </a>
      <input aria-label="Поле" />
      {extra ? <button type="button">Последняя</button> : null}
    </div>
  );
}

describe("getFocusable", () => {
  it("берёт доступные элементы и пропускает disabled, inert и aria-hidden", () => {
    render(<Panel />);
    const names = getFocusable(screen.getByTestId("root")).map(
      (el) => el.textContent || el.getAttribute("aria-label"),
    );
    expect(names).toEqual(["Первая", "Поле"]);
  });
});

describe("trapTab", () => {
  it("Tab с последнего элемента уходит на первый", () => {
    render(<Panel />);
    const input = screen.getByLabelText("Поле");
    input.focus();
    fireEvent.keyDown(input, { key: "Tab" });
    expect(document.activeElement).toBe(screen.getByText("Первая"));
  });

  it("Shift+Tab с первого элемента уходит на последний", () => {
    render(<Panel />);
    const first = screen.getByText("Первая");
    first.focus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(screen.getByLabelText("Поле"));
  });

  it("Tab в середине не перехватывается", () => {
    render(<Panel extra />);
    const input = screen.getByLabelText("Поле");
    input.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapTab(event, screen.getByTestId("root"));
    expect(event.defaultPrevented).toBe(false);
  });

  it("если фокус снаружи, Tab возвращает его внутрь", () => {
    render(
      <>
        <button type="button">Снаружи</button>
        <Panel />
      </>,
    );
    screen.getByText("Снаружи").focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapTab(event, screen.getByTestId("root"));
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(screen.getByText("Первая"));
  });

  it("в пустом корне фокус остаётся на нём", () => {
    render(<div data-testid="empty" tabIndex={-1} />);
    const root = screen.getByTestId("empty");
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapTab(event, root);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(root);
  });

  it("другие клавиши не трогает", () => {
    render(<Panel />);
    const event = new KeyboardEvent("keydown", { key: "a", cancelable: true });
    trapTab(event, screen.getByTestId("root"));
    expect(event.defaultPrevented).toBe(false);
  });
});

describe("pickInitialFocus", () => {
  it("[data-autofocus] важнее всего", () => {
    render(
      <div data-testid="panel">
        <button type="button">Кнопка</button>
        <input aria-label="Нужное" data-autofocus />
      </div>,
    );
    expect(pickInitialFocus(screen.getByTestId("panel")).getAttribute("aria-label")).toBe("Нужное");
  });

  it("первое поле в [data-ds-modal-main]", () => {
    render(
      <div data-testid="panel">
        <button type="button" className="ds-btn--primary">
          Готово
        </button>
        <div data-ds-modal-main>
          <input aria-label="Поле" />
        </div>
      </div>,
    );
    expect(pickInitialFocus(screen.getByTestId("panel")).getAttribute("aria-label")).toBe("Поле");
  });

  it("без полей — главная кнопка, а при fallback=panel — сама панель", () => {
    render(
      <div data-testid="panel">
        <button type="button">Другая</button>
        <button type="button" className="ds-btn--primary">
          Готово
        </button>
      </div>,
    );
    const panel = screen.getByTestId("panel");
    expect(pickInitialFocus(panel).textContent).toBe("Готово");
    expect(pickInitialFocus(panel, "panel")).toBe(panel);
  });
});

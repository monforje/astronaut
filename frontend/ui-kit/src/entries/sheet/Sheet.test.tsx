/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Dialog } from "../dialog";
import { Popover } from "../popover";
import { Sheet, SheetPanel } from "./index";

afterEach(() => {
  vi.useRealTimers();
});

function Example({
  onSizeChange,
  withField = true,
}: {
  onSizeChange?: (size: string) => void;
  withField?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Открыть
      </button>
      <main data-testid="page">страница</main>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        onSizeChange={onSizeChange}
        title="Груз MSKU4821907"
        description="Нинбо → Владивосток"
        footer={
          <>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button>Сохранить</Button>
          </>
        }
      >
        {withField ? <textarea aria-label="Комментарий" /> : <p>Только текст</p>}
      </Sheet>
    </>
  );
}

function openSheet() {
  const opener = screen.getByRole("button", { name: "Открыть" });
  act(() => opener.focus());
  fireEvent.click(opener);
  return opener;
}

describe("SheetPanel", () => {
  it("aside с ролью dialog, заголовком, описанием, крестиком и кнопкой размера", () => {
    const { container } = render(
      <SheetPanel title="Груз" description="Описание" footer={<Button>Ок</Button>}>
        тело
      </SheetPanel>,
    );
    const panel = screen.getByRole("dialog", { name: "Груз" });
    expect(panel.tagName).toBe("ASIDE");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.getAttribute("data-size")).toBe("panel");
    expect(container.querySelector(".ds-sheet__desc")?.textContent).toBe("Описание");
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Расширить" })).toBeTruthy();
    expect(container.querySelector(".ds-sheet__footer")).not.toBeNull();
  });

  it("подпись кнопки размера следует за режимом", () => {
    const { rerender } = render(<SheetPanel title="Х" size="wide" />);
    expect(screen.getByRole("button", { name: "На весь экран" })).toBeTruthy();
    rerender(<SheetPanel title="Х" size="full" />);
    expect(screen.getByRole("button", { name: "Свернуть в панель" })).toBeTruthy();
  });

  it("resizable=false прячет кнопку размера, без описания и подвала их нет", () => {
    const { container } = render(<SheetPanel title="Х" resizable={false} />);
    expect(screen.queryByRole("button", { name: "Расширить" })).toBeNull();
    expect(container.querySelector(".ds-sheet__desc")).toBeNull();
    expect(container.querySelector(".ds-sheet__footer")).toBeNull();
  });

  it("крест и размер вызывают обработчики", () => {
    const onClose = vi.fn();
    const onResize = vi.fn();
    render(<SheetPanel title="Х" onClose={onClose} onResize={onResize} />);
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    fireEvent.click(screen.getByRole("button", { name: "Расширить" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenCalledTimes(1);
  });

  it("ref, className, атрибуты; data-force нет", () => {
    const ref = createRef<HTMLElement>();
    render(<SheetPanel ref={ref} title="Х" className="custom" data-testid="s" />);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("s");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("Sheet", () => {
  it("закрытая не рисуется, открытая вставляется в body с затемнением", () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
    openSheet();
    const panel = screen.getByRole("dialog");
    const root = panel.closest(".ds-sheet-root");
    expect(root?.parentElement).toBe(document.body);
    expect(root?.querySelector(".ds-sheet-scrim")).not.toBeNull();
    expect(screen.getByTestId("page").closest("[inert]")).not.toBeNull();
  });

  it("фокус уходит в первое поле, без поля — на саму панель", () => {
    const { unmount } = render(<Example />);
    openSheet();
    expect(document.activeElement).toBe(screen.getByLabelText("Комментарий"));
    unmount();
    render(<Example withField={false} />);
    openSheet();
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
  });

  it("Esc закрывает и возвращает фокус на кнопку-источник", () => {
    vi.useFakeTimers();
    render(<Example />);
    const opener = openSheet();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(opener);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("крест закрывает, затемнение закрывает", () => {
    vi.useFakeTimers();
    render(<Example />);
    openSheet();
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    openSheet();
    fireEvent.click(document.querySelector(".ds-sheet-scrim")!);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("во время ухода у корня data-out", () => {
    vi.useFakeTimers();
    render(<Example />);
    openSheet();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("dialog").closest(".ds-sheet-root")?.hasAttribute("data-out")).toBe(
      true,
    );
  });

  it("кнопка размера идёт по кругу panel → wide → full → panel", () => {
    const onSizeChange = vi.fn();
    render(<Example onSizeChange={onSizeChange} />);
    openSheet();
    const panel = screen.getByRole("dialog");
    const seen: (string | null)[] = [panel.getAttribute("data-size")];
    for (let i = 0; i < 3; i++) {
      const label = ["Расширить", "На весь экран", "Свернуть в панель"][i];
      fireEvent.click(screen.getByRole("button", { name: label }));
      seen.push(panel.getAttribute("data-size"));
    }
    expect(seen).toEqual(["panel", "wide", "full", "panel"]);
    expect(onSizeChange).toHaveBeenLastCalledWith("panel");
  });

  it("управляемый size не меняется сам", () => {
    const onSizeChange = vi.fn();
    render(<Sheet open size="wide" onSizeChange={onSizeChange} title="Х" />);
    fireEvent.click(screen.getByRole("button", { name: "На весь экран" }));
    expect(onSizeChange).toHaveBeenCalledWith("full");
    expect(screen.getByRole("dialog").getAttribute("data-size")).toBe("wide");
  });

  it("Tab ходит по кругу внутри панели", () => {
    render(<Example />);
    openSheet();
    const first = screen.getByRole("button", { name: "Расширить" });
    const last = screen.getByRole("button", { name: "Сохранить" });
    act(() => last.focus());
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it("busy: Esc и затемнение не закрывают", () => {
    const onOpenChange = vi.fn();
    render(<Sheet open busy onOpenChange={onOpenChange} title="Х" />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(document.querySelector(".ds-sheet-scrim")!);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("Dialog поверх панели забирает Esc, панель остаётся", () => {
    const onSheet = vi.fn();
    const onDialog = vi.fn();
    render(
      <>
        <Sheet open onOpenChange={onSheet} title="Панель" />
        <Dialog open onOpenChange={onDialog} title="Окно" />
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDialog).toHaveBeenCalledTimes(1);
    expect(onSheet).not.toHaveBeenCalled();
  });

  it("container держит панель внутри узла и не блокирует прокрутку body", () => {
    const host = document.createElement("div");
    document.body.append(host);
    render(<Sheet open container={host} title="В рамке" />);
    expect(host.querySelector(".ds-sheet")).not.toBeNull();
    expect(document.body.style.overflow).toBe("");
    host.remove();
  });
});

describe("Sheet: вложенные слои", () => {
  it("Popover внутри панели: Esc закрывает сначала поповер, потом панель; фокус возвращается на кнопку", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange} title="Груз">
        <Popover label="Фильтр" trigger={<button type="button">Фильтр</button>}>
          <input aria-label="Поле" />
        </Popover>
      </Sheet>,
    );
    const trigger = screen.getByRole("button", { name: "Фильтр" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Фильтр" })).toBeTruthy();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Фильтр" })).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("клик по поповеру внутри панели не закрывает панель", () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange} title="Груз">
        <Popover label="Фильтр" defaultOpen trigger={<button type="button">Фильтр</button>}>
          <button type="button">Применить</button>
        </Popover>
      </Sheet>,
    );
    fireEvent.mouseDown(screen.getByRole("button", { name: "Применить" }));
    fireEvent.click(screen.getByRole("button", { name: "Применить" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});

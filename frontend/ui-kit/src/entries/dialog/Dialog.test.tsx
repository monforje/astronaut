/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Popover } from "../popover";
import { getFocusable, trapTab } from "../../ui/internal";
import { Dialog, DialogPanel } from "./index";

afterEach(() => {
  vi.useRealTimers();
});

function Example({
  onOpenChange,
  busy,
  role,
}: {
  onOpenChange?: (open: boolean) => void;
  busy?: boolean;
  role?: "dialog" | "alertdialog";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Открыть
      </button>
      <main data-testid="page">страница</main>
      <Dialog
        open={open}
        busy={busy}
        role={role}
        onOpenChange={(next) => {
          onOpenChange?.(next);
          setOpen(next);
        }}
        title="Сверить документы?"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Нет
            </Button>
            <Button>Да, сверить</Button>
          </>
        }
      >
        <p>Сравним вес и номера.</p>
      </Dialog>
    </>
  );
}

function openDialog() {
  const opener = screen.getByRole("button", { name: "Открыть" });
  act(() => opener.focus());
  fireEvent.click(opener);
  return opener;
}

describe("DialogPanel", () => {
  it("рисует заголовок, тело, подвал; без крестика; aria-labelledby на заголовок", () => {
    const { container } = render(
      <DialogPanel title="Принять расхождение?" size="sm" footer={<Button>Принять</Button>}>
        Текст
      </DialogPanel>,
    );
    const dialog = screen.getByRole("dialog", { name: "Принять расхождение?" });
    expect(dialog.classList.contains("ds-dialog--sm")).toBe(true);
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("tabindex")).toBe("-1");
    expect(container.querySelector(".ds-dialog__header button")).toBeNull();
    expect(container.querySelector(".ds-dialog__footer button")).not.toBeNull();
  });

  it("по умолчанию md, flush, error и роль alertdialog", () => {
    const { container, rerender } = render(<DialogPanel title="Х">тело</DialogPanel>);
    expect(container.querySelector(".ds-dialog--md")).not.toBeNull();
    expect(container.querySelector(".ds-dialog__footer")).toBeNull();
    expect(container.querySelector(".ds-dialog__error")).toBeNull();
    rerender(
      <DialogPanel title="Х" flush error="Ошибка" role="alertdialog">
        тело
      </DialogPanel>,
    );
    expect(container.querySelector(".ds-dialog__inner--flush")).not.toBeNull();
    expect(container.querySelector(".ds-dialog__error")?.textContent).toBe("Ошибка");
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("ref, className и атрибуты на окне, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <DialogPanel ref={ref} title="Х" className="custom" data-testid="d">
        тело
      </DialogPanel>,
    );
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("d");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("Dialog", () => {
  it("закрытый не рисуется", () => {
    render(<Example />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("открывается в body поверх страницы, страница под ним inert", () => {
    render(<Example />);
    openDialog();
    const dialog = screen.getByRole("dialog", { name: "Сверить документы?" });
    expect(dialog.closest(".ds-dialog-overlay")?.parentElement).toBe(document.body);
    expect(screen.getByTestId("page").closest("[inert]")).not.toBeNull();
    expect(dialog.closest("[inert]")).toBeNull();
  });

  it("фокус уходит на главную кнопку", () => {
    render(<Example />);
    openDialog();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Да, сверить" }));
  });

  it("в форме фокус уходит на первое поле", () => {
    render(
      <Dialog open title="Новый груз" footer={<Button>Создать</Button>}>
        <input aria-label="Номер" />
      </Dialog>,
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Номер"));
  });

  it("Tab и Shift+Tab ходят по кругу внутри окна", () => {
    render(<Example />);
    openDialog();
    const no = screen.getByRole("button", { name: "Нет" });
    const yes = screen.getByRole("button", { name: "Да, сверить" });
    act(() => yes.focus());
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(no);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(yes);
  });

  it("Esc просит закрыть окно и возвращает фокус на кнопку-источник", () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    const opener = openDialog();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(document.activeElement).toBe(opener);
  });

  it("«нет» закрывает окно, после ухода страница снова доступна", () => {
    vi.useFakeTimers();
    render(<Example />);
    openDialog();
    fireEvent.click(screen.getByRole("button", { name: "Нет" }));
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByTestId("page").closest("[inert]")).toBeNull();
  });

  it("во время ухода у затемнения data-out", () => {
    vi.useFakeTimers();
    render(<Example />);
    openDialog();
    fireEvent.keyDown(document, { key: "Escape" });
    const overlay = screen.getByRole("dialog").closest(".ds-dialog-overlay");
    expect(overlay?.hasAttribute("data-out")).toBe(true);
  });

  it("busy: Esc игнорируется, окно помечено aria-busy", () => {
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} busy />);
    openDialog();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog").getAttribute("aria-busy")).toBe("true");
  });

  it("alertdialog для опасного действия", () => {
    render(<Example role="alertdialog" />);
    openDialog();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it("блокирует прокрутку body, пока открыто, и возвращает после", () => {
    vi.useFakeTimers();
    render(<Example />);
    openDialog();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });

  it("container: окно рисуется внутри заданного узла и не трогает прокрутку body", () => {
    const host = document.createElement("div");
    document.body.append(host);
    render(
      <Dialog open title="В рамке" container={host}>
        тело
      </Dialog>,
    );
    expect(host.querySelector(".ds-dialog")).not.toBeNull();
    expect(document.body.style.overflow).toBe("");
    host.remove();
  });

  it("верхний слой получает Esc первым: вложенное окно закрывается, нижнее остаётся", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Dialog open title="Нижнее" onOpenChange={outer}>
          <input aria-label="a" />
        </Dialog>
        <Dialog open title="Верхнее" onOpenChange={inner}>
          <input aria-label="b" />
        </Dialog>
      </>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});

describe("focus-trap", () => {
  it("getFocusable пропускает отключённые и inert", () => {
    const root = document.createElement("div");
    root.innerHTML =
      "<button>a</button><button disabled>b</button><div inert><button>c</button></div><input />";
    document.body.append(root);
    expect(getFocusable(root).map((el) => el.tagName)).toEqual(["BUTTON", "INPUT"]);
    root.remove();
  });

  it("без фокусируемых элементов Tab остаётся на окне", () => {
    const root = document.createElement("div");
    root.tabIndex = -1;
    document.body.append(root);
    const event = new KeyboardEvent("keydown", { key: "Tab", cancelable: true });
    trapTab(event, root);
    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(root);
    root.remove();
  });
});

describe("Dialog: вложенные слои", () => {
  it("Popover внутри диалога: Esc закрывает только поповер, фокус на его кнопке", () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Фильтры">
        <Popover label="Период" trigger={<button type="button">Период</button>}>
          <button type="button">Неделя</button>
        </Popover>
      </Dialog>,
    );
    const trigger = screen.getByRole("button", { name: "Период" });
    fireEvent.click(trigger);
    expect(screen.getByRole("dialog", { name: "Период" })).toBeTruthy();
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Период" })).toBeNull();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

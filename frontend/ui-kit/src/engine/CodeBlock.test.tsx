/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CodeBlock, COPIED_MS } from "./CodeBlock";

const CODE = `import { Button } from "@/ui";\n\n<Button variant="primary">Сохранить</Button>`;

function mockClipboard(writeText: (text: string) => Promise<void> | undefined) {
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
});

describe("CodeBlock", () => {
  it("подсветка не ломает текст кода", () => {
    const { container } = render(<CodeBlock>{CODE}</CodeBlock>);
    expect(container.querySelector("code")?.textContent).toBe(CODE);
    expect(container.querySelectorAll(".dx-tok--keyword").length).toBeGreaterThan(0);
  });

  it("заголовок: язык по умолчанию и своё название", () => {
    const { rerender } = render(<CodeBlock>{CODE}</CodeBlock>);
    expect(screen.getByText("TSX")).toBeTruthy();
    rerender(
      <CodeBlock lang="css" title="button.css">
        {".a { color: red; }"}
      </CodeBlock>,
    );
    expect(screen.getByText("button.css")).toBeTruthy();
  });

  it("номера строк включаются атрибутом, перенос тоже", () => {
    const { container } = render(
      <CodeBlock lineNumbers wrap>
        {CODE}
      </CodeBlock>,
    );
    const figure = container.querySelector("figure");
    expect(figure?.hasAttribute("data-numbers")).toBe(true);
    expect(figure?.hasAttribute("data-wrap")).toBe(true);
    expect(container.querySelectorAll(".dx-codeblock__line").length).toBe(3);
  });

  it("прокручиваемая область доступна с клавиатуры и подписана", () => {
    const { container } = render(<CodeBlock title="demo.tsx">{CODE}</CodeBlock>);
    const pre = container.querySelector("pre")!;
    expect(pre.tabIndex).toBe(0);
    expect(pre.getAttribute("role")).toBe("region");
    const title = document.getElementById(pre.getAttribute("aria-labelledby")!);
    expect(title?.textContent).toBe("demo.tsx");
  });

  it("копирует исходный код и подтверждает на 1,5 с", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<CodeBlock>{CODE}</CodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Копировать" }));
    });
    expect(writeText).toHaveBeenCalledWith(CODE);
    expect(screen.getByRole("button", { name: "Скопировано" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("Скопировано");
    act(() => {
      vi.advanceTimersByTime(COPIED_MS - 1);
    });
    expect(screen.getByRole("button", { name: "Скопировано" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByRole("button", { name: "Копировать" })).toBeTruthy();
    expect(screen.getByRole("status").textContent).toBe("");
  });

  it("без clipboard API использует запасной путь через execCommand", async () => {
    const exec = vi.fn(() => true);
    Object.defineProperty(document, "execCommand", { value: exec, configurable: true });
    render(<CodeBlock>{CODE}</CodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Копировать" }));
    });
    expect(exec).toHaveBeenCalledWith("copy");
    expect(screen.getByRole("status").textContent).toBe("Скопировано");
    expect(document.querySelector(".dx-codeblock__buffer")).toBeNull();
  });

  it("если копирование недоступно, сообщает об ошибке и выделяет код", async () => {
    mockClipboard(() => Promise.reject(new Error("denied")));
    Object.defineProperty(document, "execCommand", { value: () => false, configurable: true });
    render(<CodeBlock>{CODE}</CodeBlock>);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Копировать" }));
    });
    expect(screen.getByRole("status").textContent).toMatch(/Не удалось скопировать/);
    expect(screen.getByRole("button", { name: "Ошибка" })).toBeTruthy();
    expect(window.getSelection()?.toString()).toContain("Button");
  });

  it("повторный клик продлевает подтверждение", async () => {
    mockClipboard(vi.fn().mockResolvedValue(undefined));
    render(<CodeBlock>{CODE}</CodeBlock>);
    const click = async () =>
      act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /Копировать|Скопировано/ }));
      });
    await click();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    await click();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("button", { name: "Скопировано" })).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(screen.getByRole("button", { name: "Копировать" })).toBeTruthy();
  });
});

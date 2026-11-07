/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Spinner, SpinnerDots, SpinnerInline } from "./index";

describe("Spinner", () => {
  it("по умолчанию размер sm и обычный тон: один базовый класс", () => {
    const { container } = render(<Spinner />);
    expect((container.firstChild as HTMLElement).className).toBe("ds-spinner");
  });

  it("размер и тон выражены классами", () => {
    const { container } = render(<Spinner size="xl" tone="err" />);
    const el = container.firstChild as HTMLElement;
    expect(el.classList.contains("ds-spinner--xl")).toBe(true);
    expect(el.classList.contains("ds-spinner--err")).toBe(true);
  });

  it("без подписи декоративный: aria-hidden и без роли", () => {
    const { container } = render(<Spinner />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.hasAttribute("role")).toBe(false);
  });

  it("с подписью это status с именем", () => {
    render(<Spinner label="Проверяем подключение" />);
    const el = screen.getByRole("status", { name: "Проверяем подключение" });
    expect(el.hasAttribute("aria-hidden")).toBe(false);
  });

  it("className, атрибуты и ref пробрасываются", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} className="custom" data-testid="s" />);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("s");
  });

  it("не ставит data-force", () => {
    const { container } = render(<Spinner />);
    expect((container.firstChild as HTMLElement).hasAttribute("data-force")).toBe(false);
  });
});

describe("SpinnerInline и SpinnerDots", () => {
  it("строка: спиннер и подпись рядом", () => {
    const { container } = render(<SpinnerInline>Проверяем</SpinnerInline>);
    expect(container.querySelector(".ds-spinner-inline > .ds-spinner")).not.toBeNull();
    expect(container.textContent).toBe("Проверяем");
  });

  it("точки скрыты от скринридера, текст остаётся", () => {
    const { container } = render(<SpinnerDots>Печатает</SpinnerDots>);
    expect(container.querySelector(".ds-spinner-dots")?.getAttribute("aria-hidden")).toBe("true");
    expect(container.textContent).toBe("Печатает");
  });
});

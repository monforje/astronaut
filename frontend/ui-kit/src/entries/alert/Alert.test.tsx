/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../button";
import { Alert } from "./index";

describe("Alert", () => {
  it("по умолчанию accent inline со status, заголовок и подсказка в одной строке", () => {
    const { container } = render(<Alert title="Нет накладной." hint="Сверка недоступна." />);
    const panel = screen.getByRole("status");
    expect(panel.classList.contains("ds-alert__panel--accent")).toBe(true);
    expect(panel.classList.contains("ds-alert__panel--inline")).toBe(true);
    expect(container.querySelector(".ds-alert__hint")).toBeNull();
    expect(panel.textContent).toBe("Нет накладной. Сверка недоступна.");
  });

  it("err и warn озвучиваются как alert, остальные как status", () => {
    const { rerender } = render(<Alert tone="err" title="Ошибка" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(<Alert tone="warn" title="Внимание" />);
    expect(screen.getByRole("alert")).toBeTruthy();
    rerender(<Alert tone="ok" title="Готово" />);
    expect(screen.getByRole("status")).toBeTruthy();
    rerender(<Alert tone="ok" role="alert" title="Готово" />);
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("stacked выносит подсказку и действия под заголовок", () => {
    const { container } = render(
      <Alert
        layout="stacked"
        title="Не отправили"
        hint="Повторите позже"
        actions={<Button size="sm">Повторить</Button>}
      />,
    );
    expect(container.querySelector(".ds-alert__panel--inline")).toBeNull();
    expect(container.querySelector(".ds-alert__body > .ds-alert__hint")?.textContent).toBe(
      "Повторите позже",
    );
    expect(container.querySelector(".ds-alert__body > .ds-alert__actions button")).not.toBeNull();
  });

  it("inline ставит действия в ряд справа от тела", () => {
    const { container } = render(<Alert title="Х" actions={<Button size="sm">Ок</Button>} />);
    expect(container.querySelector(".ds-alert__panel > .ds-alert__actions")).not.toBeNull();
  });

  it("значок тона декоративный, свой значок заменяет его", () => {
    const { container, rerender } = render(<Alert title="Х" />);
    expect(container.querySelector("svg.ds-alert__icon")?.getAttribute("aria-hidden")).toBe("true");
    rerender(<Alert title="Х" icon={<svg data-testid="own" />} />);
    expect(screen.getByTestId("own").parentElement?.getAttribute("aria-hidden")).toBe("true");
    expect(container.querySelector("svg.ds-alert__icon")).toBeNull();
  });

  it("крестик появляется только с onClose, подписан и вызывает его", () => {
    const onClose = vi.fn();
    const { rerender } = render(<Alert title="Х" />);
    expect(screen.queryByRole("button")).toBeNull();
    rerender(<Alert title="Х" onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Закрыть" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closed сворачивает и делает недоступным: data-closed и inert", () => {
    const { container } = render(<Alert title="Х" closed />);
    const root = container.firstChild as HTMLElement;
    expect(root.hasAttribute("data-closed")).toBe(true);
    expect(root.hasAttribute("inert")).toBe(true);
  });

  it("ref, className и атрибуты на корне, data-force нет", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} className="custom" data-testid="a" title="Х" />);
    expect(ref.current?.classList.contains("ds-alert")).toBe(true);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("a");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

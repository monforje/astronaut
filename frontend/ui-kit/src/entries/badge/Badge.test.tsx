/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./index";

describe("Badge", () => {
  it("по умолчанию idle с точкой, текст в label", () => {
    render(<Badge data-testid="b">Черновик</Badge>);
    const badge = screen.getByTestId("b");
    expect(badge.className).toBe("ds-badge ds-badge--idle");
    expect(badge.querySelector(".ds-badge__label")?.textContent).toBe("Черновик");
    expect(badge.querySelector(".ds-badge__dot")?.getAttribute("aria-hidden")).toBe("true");
  });

  it("тон выражен классом", () => {
    render(
      <Badge tone="err" data-testid="b">
        Расхождение
      </Badge>,
    );
    expect(screen.getByTestId("b").classList.contains("ds-badge--err")).toBe(true);
  });

  it("форма tag, размер sm, solid и pulse добавляют классы", () => {
    render(
      <Badge form="tag" size="sm" solid pulse tone="info" data-testid="b">
        Морской
      </Badge>,
    );
    const badge = screen.getByTestId("b");
    for (const name of ["ds-badge--tag", "ds-badge--sm", "ds-badge--solid", "ds-badge--pulse"]) {
      expect(badge.classList.contains(name), name).toBe(true);
    }
    expect(badge.querySelector(".ds-badge__dot")).toBeNull();
  });

  it("форма plain без точки", () => {
    render(
      <Badge form="plain" data-testid="b">
        8
      </Badge>,
    );
    expect(screen.getByTestId("b").querySelector(".ds-badge__dot")).toBeNull();
  });

  it("счётчик заменяет тон классом counter", () => {
    render(
      <Badge form="counter" tone="ok" data-testid="b">
        8
      </Badge>,
    );
    const badge = screen.getByTestId("b");
    expect(badge.classList.contains("ds-badge--counter")).toBe(true);
    expect(badge.classList.contains("ds-badge--ok")).toBe(false);
    expect(badge.querySelector(".ds-badge__dot")).toBeNull();
  });

  it("значок рисуется и скрыт от скринридера", () => {
    render(<Badge icon={<svg data-testid="i" />}>Сверено</Badge>);
    expect(screen.getByTestId("i").parentElement?.getAttribute("aria-hidden")).toBe("true");
  });

  it("className, aria-атрибуты и ref пробрасываются", () => {
    const ref = createRef<HTMLSpanElement>();
    render(
      <Badge ref={ref} className="custom" aria-label="Статус: сверено" title="Статус">
        Сверено
      </Badge>,
    );
    const badge = screen.getByLabelText("Статус: сверено");
    expect(ref.current).toBe(badge);
    expect(badge.classList.contains("custom")).toBe(true);
    expect(badge.getAttribute("title")).toBe("Статус");
  });
});

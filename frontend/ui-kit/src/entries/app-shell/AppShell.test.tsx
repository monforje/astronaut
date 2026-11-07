/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./index";

describe("AppShell", () => {
  it("рендерит области: бренд, топбар, сайдбар и контент", () => {
    const { container } = render(
      <AppShell
        brand={<b>Logo</b>}
        topbar={<header>Топбар</header>}
        sidebar={<aside>Сайдбар</aside>}
      >
        Страница
      </AppShell>,
    );
    expect(container.querySelector(".ds-shell__brand")?.textContent).toBe("Logo");
    expect(container.querySelector(".ds-shell__top")?.textContent).toBe("Топбар");
    expect(container.querySelector(".ds-shell__side")?.textContent).toBe("Сайдбар");
    expect(screen.getByRole("main").textContent).toBe("Страница");
  });

  it("контент в main с классом области", () => {
    render(<AppShell>Страница</AppShell>);
    expect(screen.getByRole("main").className).toBe("ds-shell__content");
  });

  it("пустые области не рисуются", () => {
    const { container } = render(<AppShell>Страница</AppShell>);
    expect(container.querySelector(".ds-shell__brand")).toBeNull();
    expect(container.querySelector(".ds-shell__top")).toBeNull();
    expect(container.querySelector(".ds-shell__side")).toBeNull();
  });

  it("brand включает раскладку с отдельной ячейкой бренда", () => {
    const { container, rerender } = render(<AppShell sidebar="с">Страница</AppShell>);
    expect(container.querySelector(".ds-shell")?.hasAttribute("data-brand")).toBe(false);
    rerender(
      <AppShell brand="б" sidebar="с">
        Страница
      </AppShell>,
    );
    expect(container.querySelector(".ds-shell")?.hasAttribute("data-brand")).toBe(true);
  });

  it("rail, narrow и responsive выражены атрибутами", () => {
    const { container, rerender } = render(<AppShell>Страница</AppShell>);
    const root = () => container.querySelector(".ds-shell") as HTMLElement;
    expect(root().hasAttribute("data-rail")).toBe(false);
    expect(root().hasAttribute("data-narrow")).toBe(false);
    expect(root().hasAttribute("data-responsive")).toBe(true);
    rerender(
      <AppShell rail narrow responsive={false}>
        Страница
      </AppShell>,
    );
    expect(root().hasAttribute("data-rail")).toBe(true);
    expect(root().hasAttribute("data-narrow")).toBe(true);
    expect(root().hasAttribute("data-responsive")).toBe(false);
  });

  it("contentProps ставятся на main и объединяют className", () => {
    render(
      <AppShell contentProps={{ id: "content", className: "page", "data-state": "loading" }}>
        Страница
      </AppShell>,
    );
    const main = screen.getByRole("main");
    expect(main.id).toBe("content");
    expect(main.classList.contains("ds-shell__content")).toBe(true);
    expect(main.classList.contains("page")).toBe(true);
    expect(main.getAttribute("data-state")).toBe("loading");
  });

  it("className, style, ref и атрибуты пробрасываются на корень, data-force по умолчанию нет", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <AppShell ref={ref} className="custom" style={{ height: 300 }} data-x="1">
        Страница
      </AppShell>,
    );
    const root = container.querySelector(".ds-shell") as HTMLElement;
    expect(ref.current).toBe(root);
    expect(root.classList.contains("custom")).toBe(true);
    expect(root.style.height).toBe("300px");
    expect(root.getAttribute("data-x")).toBe("1");
    expect(root.hasAttribute("data-force")).toBe(false);
  });
});

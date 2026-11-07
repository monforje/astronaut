/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { BusyOverlay, LOADER_SRC, Loader, PageLoader } from "./index";

describe("Loader", () => {
  it("status с подписью и фирменной анимацией, картинка декоративная", () => {
    const { container } = render(<Loader label="Загружаем грузы" hint="Пара секунд" />);
    const root = screen.getByRole("status");
    expect(root.getAttribute("aria-live")).toBe("polite");
    expect(root.textContent).toBe("Загружаем грузыПара секунд");
    const img = container.querySelector("img");
    expect(img?.getAttribute("src")).toBe(LOADER_SRC);
    expect(LOADER_SRC).toContain("loader");
    expect(img?.getAttribute("alt")).toBe("");
  });

  it("размер и fill выражены классами, без hint нет подписи-подсказки", () => {
    const { container } = render(<Loader size="page" fill />);
    const root = container.firstChild as HTMLElement;
    expect(root.classList.contains("ds-loader--page")).toBe(true);
    expect(root.classList.contains("ds-loader--fill")).toBe(true);
    expect(container.querySelector(".ds-loader__sub")).toBeNull();
  });

  it("ref, className и атрибуты пробрасываются", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Loader ref={ref} className="custom" data-testid="l" />);
    expect(ref.current?.classList.contains("custom")).toBe(true);
    expect(ref.current?.getAttribute("data-testid")).toBe("l");
    expect(ref.current?.hasAttribute("data-force")).toBe(false);
  });
});

describe("BusyOverlay", () => {
  it("status со спиннером и подписью", () => {
    const { container } = render(<BusyOverlay label="Обновляем…" />);
    expect(screen.getByRole("status").textContent).toBe("Обновляем…");
    expect(container.querySelector(".ds-spinner--xl")).not.toBeNull();
  });
});

describe("PageLoader", () => {
  it("открытый показывает загрузчик и доступен", () => {
    const { container } = render(<PageLoader open />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("data-state")).toBe("in");
    expect(root.hasAttribute("inert")).toBe(false);
    expect(root.hasAttribute("aria-hidden")).toBe(false);
  });

  it("закрытый с начала: off, спрятан от скринридера и фокуса", () => {
    const { container } = render(<PageLoader open={false} />);
    const root = container.firstChild as HTMLElement;
    expect(root.getAttribute("data-state")).toBe("off");
    expect(root.getAttribute("aria-hidden")).toBe("true");
    expect(root.hasAttribute("inert")).toBe(true);
  });

  it("после закрытия уходит в out, повторное открытие возвращает in", () => {
    const { container, rerender } = render(<PageLoader open />);
    const root = container.firstChild as HTMLElement;
    rerender(<PageLoader open={false} />);
    expect(root.getAttribute("data-state")).toBe("out");
    rerender(<PageLoader open />);
    expect(root.getAttribute("data-state")).toBe("in");
  });

  it("fixed добавляет класс", () => {
    const { container } = render(<PageLoader open fixed />);
    expect((container.firstChild as HTMLElement).classList.contains("ds-loader-page--fixed")).toBe(
      true,
    );
  });
});

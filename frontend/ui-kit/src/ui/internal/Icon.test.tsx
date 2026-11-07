/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Icon } from "./Icon";
import { ICONS } from "./icon-paths";

const svg = (container: HTMLElement) => container.querySelector("svg") as SVGSVGElement;

describe("Icon", () => {
  it("рисует svg 24×24 с классом ds-icon и путями выбранного имени", () => {
    const { container } = render(<Icon name="plus" />);
    expect(svg(container).getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg(container).getAttribute("class")).toBe("ds-icon");
    expect(svg(container).querySelector("path")?.getAttribute("d")).toBe("M12 5v14M5 12h14");
  });

  it("по умолчанию декоративная: aria-hidden и без роли", () => {
    const { container } = render(<Icon name="x" />);
    expect(svg(container).getAttribute("aria-hidden")).toBe("true");
    expect(svg(container).hasAttribute("role")).toBe(false);
    expect(svg(container).getAttribute("focusable")).toBe("false");
  });

  it("с aria-label становится картинкой: role=img и без aria-hidden", () => {
    const { container } = render(<Icon name="alert" aria-label="Ошибка" />);
    expect(svg(container).getAttribute("role")).toBe("img");
    expect(svg(container).getAttribute("aria-label")).toBe("Ошибка");
    expect(svg(container).hasAttribute("aria-hidden")).toBe(false);
  });

  it("size добавляет модификатор, className дописывается", () => {
    const { container } = render(<Icon name="chev" size="xl" className="custom" />);
    expect(svg(container).getAttribute("class")).toBe("ds-icon ds-icon--xl custom");
  });

  it("пробрасывает ref и атрибуты", () => {
    const ref = createRef<SVGSVGElement>();
    const { container } = render(<Icon name="more" ref={ref} data-testid="i" />);
    expect(ref.current).toBe(svg(container));
    expect(svg(container).getAttribute("data-testid")).toBe("i");
  });

  it("у каждого имени из набора есть непустые пути", () => {
    for (const [name, paths] of Object.entries(ICONS)) {
      expect(paths.length, name).toBeGreaterThan(0);
    }
  });
});

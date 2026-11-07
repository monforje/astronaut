/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ScrollArea } from "./index";

describe("ScrollArea", () => {
  it("рендерит окно role=region с названием, доступное с клавиатуры", () => {
    render(<ScrollArea aria-label="Список грузов">строки</ScrollArea>);
    const region = screen.getByRole("region", { name: "Список грузов" });
    expect(region.tabIndex).toBe(0);
    expect(region.textContent).toBe("строки");
    expect(region.parentElement?.className).toBe("ds-scroll");
  });

  it("по умолчанию вертикальное окно, направление выражено классом", () => {
    render(
      <>
        <ScrollArea aria-label="в">1</ScrollArea>
        <ScrollArea aria-label="г" direction="horizontal">
          2
        </ScrollArea>
        <ScrollArea aria-label="о" direction="both">
          3
        </ScrollArea>
      </>,
    );
    expect(screen.getByLabelText("в").classList.contains("ds-scroll__vp--v")).toBe(true);
    expect(screen.getByLabelText("г").classList.contains("ds-scroll__vp--h")).toBe(true);
    expect(screen.getByLabelText("о").classList.contains("ds-scroll__vp--b")).toBe(true);
  });

  it("maxHeight ограничивает вертикальное окно и игнорируется у горизонтального", () => {
    render(
      <>
        <ScrollArea aria-label="в" maxHeight={200}>
          1
        </ScrollArea>
        <ScrollArea aria-label="г" direction="horizontal" maxHeight={200}>
          2
        </ScrollArea>
      </>,
    );
    expect(screen.getByLabelText("в").style.maxHeight).toBe("200px");
    expect(screen.getByLabelText("г").style.maxHeight).toBe("");
  });

  it("мягкие края: нижний включается, когда есть что прокручивать", () => {
    render(<ScrollArea aria-label="в">строки</ScrollArea>);
    const region = screen.getByLabelText("в");
    Object.defineProperties(region, {
      scrollHeight: { value: 600, configurable: true },
      clientHeight: { value: 200, configurable: true },
    });
    fireEvent.scroll(region);
    expect(region.style.getPropertyValue("--ds-scroll-fb")).toBe("24px");
    expect(region.style.getPropertyValue("--ds-scroll-ft")).toBe("0px");
    region.scrollTop = 100;
    fireEvent.scroll(region);
    expect(region.style.getPropertyValue("--ds-scroll-ft")).toBe("24px");
  });

  it("у горизонтального окна затухают левый и правый края", () => {
    render(
      <ScrollArea aria-label="г" direction="horizontal">
        чипы
      </ScrollArea>,
    );
    const region = screen.getByLabelText("г");
    Object.defineProperties(region, {
      scrollWidth: { value: 900, configurable: true },
      clientWidth: { value: 300, configurable: true },
    });
    fireEvent.scroll(region);
    expect(region.style.getPropertyValue("--ds-scroll-fr")).toBe("28px");
    expect(region.style.getPropertyValue("--ds-scroll-ft")).toBe("");
  });

  it("initialScroll=end прокручивает окно в конец при монтировании", () => {
    const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollHeight");
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      get: () => 500,
    });
    render(
      <ScrollArea aria-label="в" initialScroll="end">
        строки
      </ScrollArea>,
    );
    expect(screen.getByLabelText("в").scrollTop).toBe(500);
    if (original) Object.defineProperty(HTMLElement.prototype, "scrollHeight", original);
    else Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
  });

  it("onScroll, ref, className и атрибуты пробрасываются на окно", () => {
    const onScroll = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <ScrollArea
        ref={ref}
        aria-label="в"
        className="custom"
        rootClassName="root"
        onScroll={onScroll}
        data-x="1"
      >
        строки
      </ScrollArea>,
    );
    const region = screen.getByLabelText("в");
    expect(ref.current).toBe(region);
    expect(region.classList.contains("custom")).toBe(true);
    expect(region.parentElement?.classList.contains("root")).toBe(true);
    expect(region.getAttribute("data-x")).toBe("1");
    expect(region.hasAttribute("data-force")).toBe(false);
    fireEvent.scroll(region);
    expect(onScroll).toHaveBeenCalledTimes(1);
  });
});

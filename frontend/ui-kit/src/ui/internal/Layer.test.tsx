/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Layer, type LayerProps } from "./Layer";
import { Portal, PortalHost } from "./Portal";

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

const originalRect = HTMLElement.prototype.getBoundingClientRect;
const originalHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetHeight");
const originalWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetWidth");

function mockGeometry(anchor: Rect, size = { width: 200, height: 100 }) {
  HTMLElement.prototype.getBoundingClientRect = function () {
    const { left, top, width, height } = anchor;
    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
    } as DOMRect;
  };
  Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
    configurable: true,
    value: size.height,
  });
  Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
    configurable: true,
    value: size.width,
  });
}

beforeEach(() => {
  vi.stubGlobal("innerWidth", 1000);
  vi.stubGlobal("innerHeight", 800);
});

afterEach(() => {
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  if (originalHeight) Object.defineProperty(HTMLElement.prototype, "offsetHeight", originalHeight);
  if (originalWidth) Object.defineProperty(HTMLElement.prototype, "offsetWidth", originalWidth);
  vi.unstubAllGlobals();
});

type Extra = Partial<Omit<LayerProps, "open" | "anchorRef" | "onDismiss">> & {
  onDismiss?: LayerProps["onDismiss"];
  startOpen?: boolean;
};

function Harness({ onDismiss = () => {}, startOpen = true, ...rest }: Extra) {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(startOpen);
  return (
    <div>
      <button ref={anchor} type="button" onClick={() => setOpen((v) => !v)}>
        Якорь
      </button>
      <Layer
        {...rest}
        open={open}
        anchorRef={anchor}
        onDismiss={(reason) => {
          onDismiss(reason);
          setOpen(false);
        }}
        role="dialog"
        aria-label="Слой"
      >
        <button type="button">Внутри</button>
      </Layer>
      <p>Снаружи</p>
    </div>
  );
}

const layer = () => screen.getByRole("dialog");

describe("Portal", () => {
  it("рисует детей в body, а не в месте вызова", () => {
    const { container } = render(
      <div>
        <Portal>
          <span>вынесено</span>
        </Portal>
      </div>,
    );
    expect(container.textContent).toBe("");
    expect(screen.getByText("вынесено").parentElement).toBe(document.body);
  });

  it("host задаёт другой контейнер", () => {
    const host = document.createElement("section");
    document.body.append(host);
    render(
      <Portal host={host}>
        <span>в секции</span>
      </Portal>,
    );
    expect(screen.getByText("в секции").parentElement).toBe(host);
    host.remove();
  });
});

describe("PortalHost", () => {
  it("Portal и Layer внутри хоста рисуют в нём, а не в body", () => {
    mockGeometry({ left: 100, top: 100, width: 80, height: 32 });
    render(
      <PortalHost data-testid="host">
        <Harness />
        <Portal>
          <span>вынесено</span>
        </Portal>
      </PortalHost>,
    );
    const host = screen.getByTestId("host");
    expect(layer().parentElement).toBe(host);
    expect(screen.getByText("вынесено").parentElement).toBe(host);
  });
});

describe("PortalHost: contain", () => {
  function mockStage(stage: Rect, anchor: Rect) {
    mockGeometry(anchor);
    HTMLElement.prototype.getBoundingClientRect = function () {
      const { left, top, width, height } = this.hasAttribute("data-stage") ? stage : anchor;
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        x: left,
        y: top,
      } as DOMRect;
    };
  }

  it("слой лежит в сцене с position: absolute, координаты от сцены", () => {
    mockStage(
      { left: 50, top: 50, width: 400, height: 300 },
      { left: 100, top: 100, width: 80, height: 32 },
    );
    render(
      <PortalHost contain data-testid="stage">
        <Harness gap={4} />
      </PortalHost>,
    );
    const stage = screen.getByTestId("stage");
    expect(layer().parentElement).toBe(stage);
    expect(layer().style.position).toBe("absolute");
    expect(layer().style.left).toBe("50px");
    expect(layer().style.top).toBe("86px");
    expect(layer().hasAttribute("data-contained")).toBe(true);
  });

  it("не переворачивается и не прячется: сцена получает резерв высоты", () => {
    mockStage(
      { left: 0, top: -2000, width: 400, height: 300 },
      { left: 100, top: -1720, width: 80, height: 32 },
    );
    render(
      <PortalHost contain data-testid="stage">
        <Harness gap={4} />
      </PortalHost>,
    );
    expect(layer().getAttribute("data-side")).toBe("bottom");
    expect(layer().style.visibility).toBe("");
    expect(screen.getByTestId("stage").style.getPropertyValue("--stage-min")).toBe("424px");
  });

  it("minHeight задаёт минимальную высоту сцены", () => {
    render(<PortalHost contain minHeight={260} data-testid="stage" />);
    expect(screen.getByTestId("stage").style.getPropertyValue("--stage-min")).toBe("260px");
  });

  it("вложенный хост наследует сцену, слой не закрывается прокруткой страницы", () => {
    mockStage(
      { left: 0, top: 0, width: 400, height: 300 },
      { left: 100, top: 100, width: 80, height: 32 },
    );
    const onDismiss = vi.fn();
    render(
      <PortalHost contain data-testid="stage">
        <PortalHost data-testid="inner">
          <Harness scroll onDismiss={onDismiss} />
        </PortalHost>
      </PortalHost>,
    );
    expect(layer().parentElement).toBe(screen.getByTestId("inner"));
    expect(layer().style.position).toBe("absolute");
    act(() => {
      fireEvent.scroll(document);
    });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe("Layer: размещение", () => {
  it("закрытый слой ничего не рисует", () => {
    render(<Harness startOpen={false} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("открытый уходит в body с position: fixed", () => {
    mockGeometry({ left: 100, top: 100, width: 80, height: 32 });
    const { container } = render(<Harness />);
    expect(container.querySelector("[role=dialog]")).toBeNull();
    expect(layer().parentElement).toBe(document.body);
    expect(layer().style.position).toBe("fixed");
    expect(layer().style.zIndex).toBe("900");
  });

  it("встаёт под якорь с отступом gap по левому краю", () => {
    mockGeometry({ left: 100, top: 100, width: 80, height: 32 });
    render(<Harness gap={4} />);
    expect(layer().style.left).toBe("100px");
    expect(layer().style.top).toBe("136px");
    expect(layer().getAttribute("data-side")).toBe("bottom");
    expect(layer().style.visibility).toBe("");
  });

  it("переворачивается вверх, когда снизу не хватает места", () => {
    mockGeometry({ left: 100, top: 740, width: 80, height: 32 });
    render(<Harness gap={4} />);
    expect(layer().getAttribute("data-side")).toBe("top");
    expect(layer().style.top).toBe("636px");
  });

  it("flip=false оставляет сторону как задана", () => {
    mockGeometry({ left: 100, top: 740, width: 80, height: 32 });
    render(<Harness gap={4} flip={false} />);
    expect(layer().getAttribute("data-side")).toBe("bottom");
  });

  it("сдвигается внутрь окна у правого края", () => {
    mockGeometry({ left: 950, top: 100, width: 40, height: 32 });
    render(<Harness />);
    expect(layer().style.left).toBe("792px");
  });

  it("align=end прижимает правый край слоя к правому краю якоря", () => {
    mockGeometry({ left: 600, top: 10, width: 40, height: 30 });
    render(<Harness align="end" />);
    expect(layer().getAttribute("data-align")).toBe("end");
    expect(layer().style.left).toBe("440px");
  });

  it("якорь за пределами окна прячет слой", () => {
    mockGeometry({ left: 100, top: 2000, width: 80, height: 32 });
    render(<Harness />);
    expect(screen.getByRole("dialog", { hidden: true }).style.visibility).toBe("hidden");
  });

  it("пересчитывает позицию при resize и scroll", () => {
    let anchor: Rect = { left: 100, top: 100, width: 80, height: 32 };
    mockGeometry(anchor);
    render(<Harness />);
    expect(layer().style.top).toBe("136px");
    anchor = { left: 100, top: 300, width: 80, height: 32 };
    mockGeometry(anchor);
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(layer().style.top).toBe("336px");
    anchor = { left: 100, top: 400, width: 80, height: 32 };
    mockGeometry(anchor);
    act(() => {
      document.dispatchEvent(new Event("scroll"));
    });
    expect(layer().style.top).toBe("436px");
  });

  it("className, атрибуты и style идут на слой, ref пробрасывается", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const seen: (HTMLDivElement | null)[] = [];
    render(
      <Harness
        className="custom"
        data-testid="l"
        style={{ color: "red" }}
        ref={(node) => {
          seen.push(node);
        }}
      />,
    );
    expect(layer().className).toBe("custom");
    expect(layer().getAttribute("data-testid")).toBe("l");
    expect(layer().style.color).toBe("red");
    expect(seen).toContain(layer());
  });
});

describe("Layer: закрытие", () => {
  it("клик мимо закрывает с причиной outside", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const onDismiss = vi.fn();
    render(<Harness onDismiss={onDismiss} />);
    fireEvent.mouseDown(screen.getByText("Снаружи"));
    expect(onDismiss).toHaveBeenCalledWith("outside");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("клик внутри слоя и по якорю не закрывает", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const onDismiss = vi.fn();
    render(<Harness onDismiss={onDismiss} />);
    fireEvent.mouseDown(screen.getByText("Внутри"));
    fireEvent.mouseDown(screen.getByText("Якорь"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("Esc закрывает и возвращает фокус в returnFocusRef", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const onDismiss = vi.fn();
    function WithReturn() {
      const back = useRef<HTMLButtonElement>(null);
      const anchor = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(true);
      return (
        <>
          <button ref={back} type="button">
            Вернуть сюда
          </button>
          <div ref={anchor}>якорь</div>
          <Layer
            open={open}
            anchorRef={anchor}
            returnFocusRef={back}
            onDismiss={(reason) => {
              onDismiss(reason);
              setOpen(false);
            }}
            role="dialog"
          >
            <button type="button">Внутри</button>
          </Layer>
        </>
      );
    }
    render(<WithReturn />);
    screen.getByText("Внутри").focus();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).toHaveBeenCalledWith("escape");
    expect(document.activeElement).toBe(screen.getByText("Вернуть сюда"));
  });

  it("escape={false} отключает закрытие по Esc", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const onDismiss = vi.fn();
    render(<Harness onDismiss={onDismiss} escape={false} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("прокрутка страницы закрывает только при scroll, прокрутка внутри слоя — нет", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const onDismiss = vi.fn();
    const { unmount } = render(<Harness onDismiss={onDismiss} />);
    fireEvent.scroll(document);
    expect(onDismiss).not.toHaveBeenCalled();
    unmount();
    render(<Harness onDismiss={onDismiss} scroll />);
    fireEvent.scroll(layer());
    expect(onDismiss).not.toHaveBeenCalled();
    fireEvent.scroll(document);
    expect(onDismiss).toHaveBeenCalledWith("scroll");
  });

  it("реагирует на внешние события только верхний слой", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const lower = vi.fn();
    const upper = vi.fn();
    render(
      <>
        <Harness onDismiss={lower} />
        <Harness onDismiss={upper} />
      </>,
    );
    fireEvent.mouseDown(document.body);
    expect(upper).toHaveBeenCalledTimes(1);
    expect(lower).not.toHaveBeenCalled();
  });

  it("exclusive: открытие второго слоя закрывает первый", () => {
    mockGeometry({ left: 0, top: 0, width: 10, height: 10 });
    const first = vi.fn();
    function Pair() {
      const [second, setSecond] = useState(false);
      return (
        <>
          <Harness onDismiss={first} exclusive />
          <button type="button" onClick={() => setSecond(true)}>
            Открыть второй
          </button>
          {second ? <Harness exclusive /> : null}
        </>
      );
    }
    render(<Pair />);
    fireEvent.click(screen.getByText("Открыть второй"));
    expect(first).toHaveBeenCalled();
  });
});

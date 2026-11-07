/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { describe, expect, it } from "vitest";
import { placeFloating } from "./position";

const viewport = { width: 1000, height: 800 };
const size = { width: 200, height: 100 };

describe("placeFloating", () => {
  it("снизу по левому краю якоря с отступом", () => {
    const result = placeFloating({
      anchor: { left: 100, top: 100, width: 80, height: 32 },
      size,
      side: "bottom",
      align: "start",
      gap: 4,
      viewport,
    });
    expect(result).toEqual({ x: 100, y: 136, side: "bottom" });
  });

  it("разворачивается вверх, когда снизу не хватает места", () => {
    const result = placeFloating({
      anchor: { left: 100, top: 740, width: 80, height: 32 },
      size,
      side: "bottom",
      align: "start",
      gap: 4,
      viewport,
    });
    expect(result.side).toBe("top");
    expect(result.y).toBe(740 - 4 - 100);
  });

  it("не разворачивается, если с обратной стороны места ещё меньше", () => {
    const result = placeFloating({
      anchor: { left: 100, top: 40, width: 80, height: 32 },
      size: { width: 200, height: 900 },
      side: "bottom",
      align: "start",
      gap: 4,
      viewport,
    });
    expect(result.side).toBe("bottom");
  });

  it("прижимается к краю окна с отступом 8", () => {
    const result = placeFloating({
      anchor: { left: 950, top: 100, width: 40, height: 32 },
      size,
      side: "bottom",
      align: "start",
      gap: 4,
      viewport,
    });
    expect(result.x).toBe(1000 - 200 - 8);
  });

  it("центрирует по якорю и выравнивает по концу", () => {
    const anchor = { left: 300, top: 300, width: 100, height: 32 };
    const center = placeFloating({ anchor, size, side: "top", align: "center", gap: 6, viewport });
    expect(center.x).toBe(250);
    expect(center.y).toBe(300 - 6 - 100);
    const end = placeFloating({ anchor, size, side: "top", align: "end", gap: 6, viewport });
    expect(end.x).toBe(200);
  });

  it("боковые стороны центрируются по высоте, отступ зависит от стороны", () => {
    const anchor = { left: 300, top: 300, width: 100, height: 40 };
    const right = placeFloating({
      anchor,
      size: { width: 120, height: 30 },
      side: "right",
      align: "center",
      gap: { right: 6, bottom: 4 },
      viewport,
    });
    expect(right).toEqual({ x: 406, y: 305, side: "right" });
    const left = placeFloating({
      anchor: { ...anchor, left: 20 },
      size: { width: 120, height: 30 },
      side: "left",
      align: "center",
      gap: 6,
      viewport,
    });
    expect(left.side).toBe("right");
  });
});

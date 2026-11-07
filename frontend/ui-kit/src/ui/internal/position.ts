/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
export type Side = "top" | "right" | "bottom" | "left";
export type Align = "start" | "center" | "end";
export type Gap = number | Partial<Record<Side, number>>;

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Placement {
  x: number;
  y: number;
  side: Side;
}

export interface PlaceInput {
  anchor: Box;
  size: { width: number; height: number };
  side: Side;
  align: Align;
  gap: Gap;
  viewport: { width: number; height: number };
  margin?: number;
  flip?: boolean;
}

const OPPOSITE: Record<Side, Side> = { top: "bottom", bottom: "top", left: "right", right: "left" };

function gapOf(gap: Gap, side: Side): number {
  return typeof gap === "number" ? gap : (gap[side] ?? 6);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

export function placeFloating({
  anchor,
  size,
  side,
  align,
  gap,
  viewport,
  margin = 8,
  flip = true,
}: PlaceInput): Placement {
  const right = anchor.left + anchor.width;
  const bottom = anchor.top + anchor.height;
  const space: Record<Side, number> = {
    top: anchor.top - margin,
    bottom: viewport.height - bottom - margin,
    left: anchor.left - margin,
    right: viewport.width - right - margin,
  };
  const extent = (s: Side) => (s === "top" || s === "bottom" ? size.height : size.width);
  let resolved = side;
  if (
    flip &&
    space[side] < extent(side) + gapOf(gap, side) &&
    space[OPPOSITE[side]] > space[side]
  ) {
    resolved = OPPOSITE[side];
  }
  const offset = gapOf(gap, resolved);
  const horizontal = resolved === "top" || resolved === "bottom";
  const cross = (start: number, length: number, floating: number) =>
    align === "start"
      ? start
      : align === "end"
        ? start + length - floating
        : start + (length - floating) / 2;
  let x: number;
  let y: number;
  if (horizontal) {
    y = resolved === "top" ? anchor.top - offset - size.height : bottom + offset;
    x = clamp(
      cross(anchor.left, anchor.width, size.width),
      margin,
      viewport.width - size.width - margin,
    );
  } else {
    x = resolved === "left" ? anchor.left - offset - size.width : right + offset;
    y = clamp(
      cross(anchor.top, anchor.height, size.height),
      margin,
      viewport.height - size.height - margin,
    );
  }
  return { x: Math.round(x), y: Math.round(y), side: resolved };
}

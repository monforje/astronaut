/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from "react";
import type { PortalStage } from "./Portal";
import { placeFloating, type Align, type Gap, type Placement, type Side } from "./position";

export interface UseFloatingOptions {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  floatingRef: RefObject<HTMLElement | null>;
  side: Side;
  align: Align;
  gap: Gap;
  flip?: boolean;
  stage?: PortalStage;
}

const STAGE_MARGIN = 8;

export function useFloating({
  open,
  anchorRef,
  floatingRef,
  side,
  align,
  gap,
  flip = true,
  stage,
}: UseFloatingOptions) {
  const [placement, setPlacement] = useState<Placement | null>(null);
  const gapKey = JSON.stringify(gap);
  const stageElement = stage?.element ?? null;
  const reserve = stage?.reserve;

  const update = useCallback(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!anchor || !floating) return;
    const rect = anchor.getBoundingClientRect();
    if (stageElement) {
      const box = stageElement.getBoundingClientRect();
      const origin = floating.offsetParent ?? stageElement;
      const originBox = origin.getBoundingClientRect();
      const size = { width: floating.offsetWidth, height: floating.offsetHeight };
      const inStage = placeFloating({
        anchor: {
          left: rect.left - box.left,
          top: rect.top - box.top,
          width: rect.width,
          height: rect.height,
        },
        size,
        side,
        align,
        gap: JSON.parse(gapKey) as Gap,
        flip: false,
        margin: STAGE_MARGIN,
        viewport: { width: box.width, height: Number.MAX_SAFE_INTEGER },
      });
      const next: Placement = {
        side: inStage.side,
        x: Math.round(inStage.x + box.left - originBox.left + origin.scrollLeft),
        y: Math.round(inStage.y + box.top - originBox.top + origin.scrollTop),
      };
      floating.style.left = `${next.x}px`;
      floating.style.top = `${next.y}px`;
      floating.style.visibility = "";
      reserve?.(Math.ceil(inStage.y + size.height + STAGE_MARGIN));
      setPlacement((prev) =>
        prev && prev.x === next.x && prev.y === next.y && prev.side === next.side ? prev : next,
      );
      return;
    }
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > viewportWidth
    ) {
      setPlacement(null);
      return;
    }
    const next = placeFloating({
      anchor: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      size: { width: floating.offsetWidth, height: floating.offsetHeight },
      side,
      align,
      gap: JSON.parse(gapKey) as Gap,
      flip,
      viewport: { width: viewportWidth, height: window.innerHeight },
    });
    floating.style.left = `${next.x}px`;
    floating.style.top = `${next.y}px`;
    floating.style.visibility = "";
    setPlacement((prev) =>
      prev && prev.x === next.x && prev.y === next.y && prev.side === next.side ? prev : next,
    );
  }, [anchorRef, floatingRef, side, align, gapKey, flip, stageElement, reserve]);

  useLayoutEffect(() => {
    if (open) update();
  }, [open, update]);

  useEffect(() => {
    if (open) update();
  }, [open, update]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener("resize", update);
    document.addEventListener("scroll", update, true);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    if (floatingRef.current) observer?.observe(floatingRef.current);
    if (anchorRef.current) observer?.observe(anchorRef.current);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("scroll", update, true);
      observer?.disconnect();
    };
  }, [open, update, floatingRef, anchorRef]);

  const current = open ? placement : null;
  return {
    update,
    placement: current,
    style: {
      position: stageElement ? ("absolute" as const) : ("fixed" as const),
      left: current?.x ?? 0,
      top: current?.y ?? 0,
      visibility: current ? undefined : ("hidden" as const),
    },
  };
}

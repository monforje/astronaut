/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useCallback, useRef, type ComponentPropsWithRef, type RefObject } from "react";
import { Portal, usePortalStage } from "./Portal";
import { useMergedRefs } from "./refs";
import { useDismiss, type DismissReason } from "./useDismiss";
import { useFloating } from "./useFloating";
import type { Align, Gap, Side } from "./position";

export interface LayerProps extends ComponentPropsWithRef<"div"> {
  open: boolean;
  anchorRef: RefObject<HTMLElement | null>;
  onDismiss: (reason: DismissReason) => void;
  side?: Side;
  align?: Align;
  gap?: Gap;
  flip?: boolean;
  escape?: boolean;
  focusOutside?: boolean;
  scroll?: boolean;
  exclusive?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

export function Layer({
  open,
  anchorRef,
  onDismiss,
  side = "bottom",
  align = "start",
  gap = 4,
  flip = true,
  escape,
  focusOutside,
  scroll,
  exclusive,
  returnFocusRef,
  ref,
  style,
  ...rest
}: LayerProps) {
  const floatingRef = useRef<HTMLDivElement | null>(null);
  const stage = usePortalStage();
  const {
    placement,
    style: floatingStyle,
    update,
  } = useFloating({
    open,
    anchorRef,
    floatingRef,
    side,
    align,
    gap,
    flip,
    stage,
  });
  const placeOnMount = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) update();
    },
    [update],
  );
  const trackedRef = useMergedRefs(floatingRef, placeOnMount);
  const mergedRef = useMergedRefs(trackedRef, ref);
  useDismiss({
    open,
    inside: [anchorRef, floatingRef],
    onDismiss,
    escape,
    focusOutside,
    scroll: stage ? false : scroll,
    exclusive: stage ? false : exclusive,
    returnFocusRef,
  });
  if (!open) return null;
  return (
    <Portal>
      <div
        {...rest}
        ref={mergedRef}
        data-side={placement?.side ?? side}
        data-align={align}
        data-contained={stage ? "" : undefined}
        style={{ zIndex: 900, ...style, ...floatingStyle }}
      />
    </Portal>
  );
}

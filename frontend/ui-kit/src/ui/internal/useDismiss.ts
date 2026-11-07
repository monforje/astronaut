/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useEffectEvent, useId, type RefObject } from "react";
import { useLayer } from "./layers";

export type DismissReason = "outside" | "escape" | "scroll";

export interface UseDismissOptions {
  open: boolean;
  inside: RefObject<HTMLElement | null>[];
  onDismiss: (reason: DismissReason) => void;
  escape?: boolean;
  outside?: boolean;
  focusOutside?: boolean;
  scroll?: boolean;
  exclusive?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
}

const OPEN_EVENT = "ds-layer-open";

export function useDismiss({
  open,
  inside,
  onDismiss,
  escape = true,
  outside = true,
  focusOutside = false,
  scroll = false,
  exclusive = false,
  returnFocusRef,
}: UseDismissOptions): void {
  const id = useId();
  const isTop = useLayer(open);

  const contains = useEffectEvent((target: Node) =>
    inside.some((ref) => ref.current?.contains(target)),
  );
  const dismiss = useEffectEvent((reason: DismissReason) => {
    onDismiss(reason);
    if (reason === "escape" && returnFocusRef?.current?.isConnected)
      returnFocusRef.current.focus({ preventScroll: true });
  });
  const dismissSilently = useEffectEvent(() => onDismiss("outside"));

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (isTop() && !contains(event.target as Node)) dismiss("outside");
    };
    const onFocusIn = (event: FocusEvent) => {
      if (isTop() && !contains(event.target as Node)) dismiss("outside");
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isTop()) dismiss("escape");
    };
    const onScroll = (event: Event) => {
      if (isTop() && !contains(event.target as Node)) dismiss("scroll");
    };
    if (outside) document.addEventListener("mousedown", onPointer, true);
    if (focusOutside) document.addEventListener("focusin", onFocusIn);
    if (escape) document.addEventListener("keydown", onKey);
    if (scroll) document.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", onPointer, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("scroll", onScroll, true);
    };
  }, [open, outside, focusOutside, escape, scroll, isTop]);

  useEffect(() => {
    if (!open || !exclusive) return;
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) dismissSilently();
    };
    document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));
    document.addEventListener(OPEN_EVENT, onOther);
    return () => document.removeEventListener(OPEN_EVENT, onOther);
  }, [open, exclusive, id]);
}

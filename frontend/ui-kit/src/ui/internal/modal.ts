/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { pickInitialFocus, trapTab } from "./focus";
import { useLayer } from "./layers";

export interface ModalOptions {
  open: boolean;
  panelRef: RefObject<HTMLElement | null>;
  overlayRef: RefObject<HTMLElement | null>;
  host: HTMLElement;
  busy?: boolean;
  onClose?: () => void;
  lockScroll?: boolean;
  focusFallback?: "button" | "panel";
}

let scrollLocks = 0;
let savedOverflow = "";

export function useModal({
  open,
  panelRef,
  overlayRef,
  host,
  busy,
  onClose,
  lockScroll = true,
  focusFallback = "button",
}: ModalOptions): void {
  const isTop = useLayer(open);
  const returnTo = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  const latest = useRef({ busy, onClose });
  useLayoutEffect(() => {
    latest.current = { busy, onClose };
  });

  useLayoutEffect(() => {
    if (open && !wasOpen.current) {
      returnTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }
    if (!open && wasOpen.current) {
      const target = returnTo.current;
      if (target?.isConnected) target.focus();
      returnTo.current = null;
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (panel) pickInitialFocus(panel, focusFallback).focus({ preventScroll: true });
  }, [open, panelRef, focusFallback]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop()) return;
      if (event.key === "Escape") {
        if (!latest.current.busy) latest.current.onClose?.();
      } else if (event.key === "Tab" && panelRef.current) {
        trapTab(event, panelRef.current);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, isTop, panelRef]);

  useLayoutEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const changed: Element[] = [];
    for (const child of host.children) {
      if (child === overlay || child.hasAttribute("inert") || child.hasAttribute("data-ds-live"))
        continue;
      child.setAttribute("inert", "");
      changed.push(child);
    }
    return () => {
      for (const child of changed) child.removeAttribute("inert");
    };
  }, [open, host, overlayRef]);

  useEffect(() => {
    if (!open || !lockScroll || host !== document.body) return;
    if (scrollLocks === 0) {
      savedOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    scrollLocks += 1;
    return () => {
      scrollLocks -= 1;
      if (scrollLocks === 0) document.body.style.overflow = savedOverflow;
    };
  }, [open, lockScroll, host]);
}

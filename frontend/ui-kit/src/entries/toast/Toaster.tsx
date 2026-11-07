/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ToastStack, type ToastStackProps } from "./ToastStack";
import { defaultToastStore, type ToastPosition, type ToastStore } from "./store";

export const TOAST_DURATION_MS = 5000;

export interface ToasterProps extends Omit<
  ToastStackProps,
  "items" | "expanded" | "onAction" | "onClose" | "onEnter" | "onLeave"
> {
  store?: ToastStore;
  position?: ToastPosition;
  duration?: number;
  container?: HTMLElement | null;
}

export function Toaster({
  store = defaultToastStore,
  position = "br",
  duration = TOAST_DURATION_MS,
  container,
  ...rest
}: ToasterProps) {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const [expanded, setExpanded] = useState(false);
  const timers = useRef(new Map<number, number>());

  useEffect(() => {
    const map = timers.current;
    for (const entry of items) {
      const span = entry.duration ?? duration;
      const live =
        !entry.closing && !entry.loading && !expanded && Number.isFinite(span) && span > 0;
      const has = map.has(entry.id);
      if (live && !has) {
        map.set(
          entry.id,
          window.setTimeout(() => {
            map.delete(entry.id);
            store.dismiss(entry.id);
          }, span),
        );
      }
      if (!live && has) {
        window.clearTimeout(map.get(entry.id));
        map.delete(entry.id);
      }
    }
    for (const [id, timer] of map) {
      if (!items.some((entry) => entry.id === id)) {
        window.clearTimeout(timer);
        map.delete(id);
      }
    }
  }, [items, expanded, duration, store]);

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const host = container === undefined ? document.body : container;
  if (!host) return null;
  return createPortal(
    <ToastStack
      {...rest}
      items={items}
      position={position}
      expanded={expanded}
      onAction={store.dismiss}
      onClose={store.dismiss}
      onEnter={() => setExpanded(true)}
      onLeave={() => setExpanded(false)}
    />,
    host,
  );
}

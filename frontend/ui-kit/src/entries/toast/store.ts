/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";

export type ToastTone = "ok" | "info" | "warn" | "err";
export type ToastPosition = "br" | "bc" | "bl" | "tr" | "tc" | "tl";

export interface ToastAction {
  label: ReactNode;
  onClick?: () => void;
  buttonProps?: ComponentPropsWithRef<"button">;
}

export interface ToastOptions {
  title: ReactNode;
  description?: ReactNode;
  tone?: ToastTone;
  action?: ToastAction;
  loading?: boolean;
  icon?: ReactNode;
  duration?: number;
  cardProps?: Omit<ComponentPropsWithRef<"div">, "children">;
}

export interface ToastEntry extends ToastOptions {
  id: number;
  closing?: boolean;
}

export const TOAST_EXIT_MS = 300;

export interface ToastStore {
  show: (options: ToastOptions) => number;
  update: (id: number, patch: Partial<ToastOptions>) => void;
  dismiss: (id: number) => void;
  clear: () => void;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => ToastEntry[];
}

export function createToastStore(limit = 5): ToastStore {
  let items: ToastEntry[] = [];
  let seq = 1;
  const listeners = new Set<() => void>();
  const removals = new Map<number, number>();

  const commit = (next: ToastEntry[]) => {
    items = next;
    listeners.forEach((listener) => listener());
  };

  const dismiss = (id: number) => {
    const entry = items.find((item) => item.id === id);
    if (!entry || entry.closing) return;
    commit(items.map((item) => (item.id === id ? { ...item, closing: true } : item)));
    removals.set(
      id,
      window.setTimeout(() => {
        removals.delete(id);
        commit(items.filter((item) => item.id !== id));
      }, TOAST_EXIT_MS),
    );
  };

  return {
    show(options) {
      const id = seq++;
      commit([{ id, ...options }, ...items]);
      items
        .filter((item) => !item.closing)
        .slice(limit)
        .forEach((item) => dismiss(item.id));
      return id;
    },
    update(id, patch) {
      commit(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    },
    dismiss,
    clear() {
      items.forEach((item) => dismiss(item.id));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => items,
  };
}

export const defaultToastStore = createToastStore();

export interface ToastFunction {
  (options: ToastOptions): number;
  update: ToastStore["update"];
  dismiss: ToastStore["dismiss"];
  clear: ToastStore["clear"];
}

export function bindToast(store: ToastStore): ToastFunction {
  return Object.assign((options: ToastOptions) => store.show(options), {
    update: store.update,
    dismiss: store.dismiss,
    clear: store.clear,
  });
}

export const toast = bindToast(defaultToastStore);

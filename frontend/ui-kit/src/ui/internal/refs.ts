/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useMemo, type Ref } from "react";

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void | (() => void) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

export function mergeRefs<T>(...refs: (Ref<T> | undefined)[]) {
  return (node: T | null) => {
    const cleanups = refs.map((ref) => assignRef(ref, node));
    return () => {
      refs.forEach((ref, i) => {
        const cleanup = cleanups[i];
        if (typeof cleanup === "function") cleanup();
        else assignRef(ref, null);
      });
    };
  };
}

export function useMergedRefs<T>(first: Ref<T> | undefined, second: Ref<T> | undefined) {
  return useMemo(() => mergeRefs(first, second), [first, second]);
}

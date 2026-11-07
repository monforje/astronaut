/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useId } from "react";

export function useIds<const K extends string>(suffixes: readonly K[]): Record<K, string> {
  const base = useId();
  return Object.fromEntries(suffixes.map((suffix) => [suffix, `${base}-${suffix}`])) as Record<
    K,
    string
  >;
}

export function useStableId(explicit?: string): string {
  const generated = useId();
  return explicit ?? generated;
}

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState } from "react";

export type ChartColor = "teal" | "orange" | "danger" | "info" | "muted";

export const CHART_COLOR: Record<ChartColor, string> = {
  teal: "var(--teal)",
  orange: "var(--orange)",
  danger: "var(--danger)",
  info: "var(--info)",
  muted: "var(--text-3)",
};

export function useWidth<T extends HTMLElement>(min = 200, fallback = 640) {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const apply = () => {
      const w = Math.round(el.clientWidth);
      if (w > 0) setWidth(Math.max(min, w));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(el);
    return () => observer.disconnect();
  }, [min]);
  return [ref, width] as const;
}

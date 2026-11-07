/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type CSSProperties,
} from "react";
import { cx, useMergedRefs } from "../../ui/internal";
import "./scroll-area.css";

export type ScrollAreaDirection = "vertical" | "horizontal" | "both";
export type ScrollAreaStart = "top" | "middle" | "end";

export interface ScrollAreaProps extends ComponentPropsWithRef<"div"> {
  direction?: ScrollAreaDirection;
  maxHeight?: CSSProperties["maxHeight"];
  initialScroll?: ScrollAreaStart;
  rootClassName?: string;
}

const SUFFIX = { vertical: "v", horizontal: "h", both: "b" } as const;

export function ScrollArea({
  direction = "vertical",
  maxHeight,
  initialScroll = "top",
  rootClassName,
  className,
  style,
  children,
  onScroll,
  ref,
  ...rest
}: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(viewport, ref);

  const update = useCallback(() => {
    const v = viewport.current;
    if (!v) return;
    const set = (name: string, on: boolean, px: number) =>
      v.style.setProperty(name, on ? `${px}px` : "0px");
    if (direction !== "horizontal") {
      set("--ds-scroll-ft", v.scrollTop > 2, 24);
      set("--ds-scroll-fb", v.scrollTop + v.clientHeight < v.scrollHeight - 2, 24);
    }
    if (direction !== "vertical") {
      set("--ds-scroll-fl", v.scrollLeft > 2, 28);
      set("--ds-scroll-fr", v.scrollLeft + v.clientWidth < v.scrollWidth - 2, 28);
    }
  }, [direction]);

  useLayoutEffect(() => {
    const v = viewport.current;
    if (!v) return;
    if (initialScroll === "end") v.scrollTop = v.scrollHeight;
    else if (initialScroll === "middle") v.scrollTop = (v.scrollHeight - v.clientHeight) / 2;
    update();
  }, [initialScroll, update]);

  useEffect(() => {
    const v = viewport.current;
    if (!v || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(v);
    for (const child of v.children) observer.observe(child);
    return () => observer.disconnect();
  }, [update]);

  return (
    <div className={cx("ds-scroll", rootClassName)}>
      <div
        // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
        tabIndex={0}
        {...rest}
        ref={mergedRef}
        role="region"
        className={cx("ds-scroll__vp", `ds-scroll__vp--${SUFFIX[direction]}`, className)}
        style={direction === "horizontal" ? style : { maxHeight, ...style }}
        onScroll={(event) => {
          update();
          onScroll?.(event);
        }}
      >
        {children}
      </div>
    </div>
  );
}

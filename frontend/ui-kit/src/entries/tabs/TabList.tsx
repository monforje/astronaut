/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from "react";
import { cx, useMergedRefs } from "../../ui/internal";
import { useTabs } from "./tabs-context";

export interface TabListProps extends ComponentPropsWithRef<"div"> {
  scroll?: boolean;
}

function enabledTabs(list: HTMLElement): HTMLElement[] {
  return [...list.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)')];
}

export function TabList({ scroll, className, children, onKeyDown, ref, ...rest }: TabListProps) {
  const { value, select, adopt } = useTabs("TabList");
  const listRef = useRef<HTMLDivElement | null>(null);
  const [ink, setInk] = useState({ x: 0, w: 0, ready: false });
  const mergedRef = useMergedRefs(listRef, ref);

  // oxlint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (value === undefined) {
      const first = enabledTabs(list)[0]?.dataset.tab;
      if (first) adopt(first);
      return;
    }
    const target = list.querySelector<HTMLElement>('[aria-selected="true"] .ds-tabs__in');
    if (!target) return;
    const a = target.getBoundingClientRect();
    const b = list.getBoundingClientRect();
    const x = a.left - b.left + list.scrollLeft;
    setInk((p) => (p.x === x && p.w === a.width ? p : { x, w: a.width, ready: p.ready }));
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => setInk((p) => ({ ...p, ready: true })));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setInk((p) => ({ ...p })));
    observer.observe(list);
    let alive = true;
    void document.fonts?.ready.then(() => alive && setInk((p) => ({ ...p })));
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || !listRef.current) return;
    const tabs = enabledTabs(listRef.current);
    const index = tabs.findIndex((tab) => tab === document.activeElement);
    if (index < 0) return;
    let next = -1;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    if (next < 0) return;
    event.preventDefault();
    tabs[next].focus();
    const target = tabs[next].dataset.tab;
    if (target) select(target);
  };

  return (
    // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      {...rest}
      role="tablist"
      ref={mergedRef}
      className={cx("ds-tabs__list", className)}
      data-scroll={scroll || undefined}
      onKeyDown={handleKeyDown}
    >
      {children}
      <span
        className="ds-tabs__ink"
        aria-hidden="true"
        data-ready={ink.ready || undefined}
        style={{ translate: `${ink.x}px 0`, width: ink.w }}
      />
    </div>
  );
}

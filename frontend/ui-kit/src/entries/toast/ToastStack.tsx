/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
/* oxlint-disable jsx-a11y/no-noninteractive-element-interactions -- область уведомлений раскрывается по наведению и по фокусу внутри */
import { useLayoutEffect, useRef, type ComponentPropsWithRef } from "react";
import { cx, useMergedRefs } from "../../ui/internal";
import { ToastItemView } from "./ToastCard";
import type { ToastEntry, ToastPosition } from "./store";
import "./toast.css";

export interface ToastStackProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  items: ToastEntry[];
  position?: ToastPosition;
  expanded?: boolean;
  label?: string;
  onAction?: (id: number) => void;
  onClose?: (id: number) => void;
  onEnter?: () => void;
  onLeave?: () => void;
}

export function ToastStack({
  items,
  position = "br",
  expanded,
  label = "Уведомления",
  onAction,
  onClose,
  onEnter,
  onLeave,
  className,
  ref,
  ...rest
}: ToastStackProps) {
  const box = useRef<HTMLDivElement | null>(null);
  const mergedRef = useMergedRefs(box, ref);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const top = position.startsWith("t");
    let y = 0;
    let first = 0;
    const live = items.filter((entry) => !entry.closing);
    live.forEach((entry, index) => {
      const card = el.querySelector<HTMLElement>(`[data-id="${entry.id}"]`);
      if (!card) return;
      const height = card.offsetHeight;
      const offset = expanded ? y : index * 10;
      card.style.setProperty("--y", `${top ? offset : -offset}px`);
      card.style.setProperty("--s", String(expanded ? 1 : Math.max(0.85, 1 - index * 0.05)));
      card.style.zIndex = String(100 - index);
      card.toggleAttribute("data-front", index === 0);
      card.toggleAttribute("data-hidden", !expanded && index > 2);
      card.toggleAttribute("data-expanded", !!expanded);
      if (index === 0) first = height;
      y += height + 8;
    });
    el.style.height = `${live.length ? (expanded ? y - 8 : first) : 0}px`;
  });
  return (
    <div
      {...rest}
      ref={mergedRef}
      className={cx("ds-toaster", className)}
      data-pos={position}
      data-ds-live=""
      role="region"
      aria-label={label}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onLeave?.();
      }}
    >
      {items.map((entry) => (
        <ToastItemView key={entry.id} entry={entry} onAction={onAction} onClose={onClose} />
      ))}
    </div>
  );
}

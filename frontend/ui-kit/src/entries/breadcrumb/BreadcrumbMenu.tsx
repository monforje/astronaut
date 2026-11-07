/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Icon, Layer, type DismissReason } from "../../ui/internal";

export interface BreadcrumbMenuEntry {
  key: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  selected?: boolean;
  onPick: (event: MouseEvent<HTMLElement>) => void;
}

export interface BreadcrumbDropProps {
  open: boolean;
  entries: BreadcrumbMenuEntry[];
  focusFirst: boolean;
  checkable?: boolean;
  onDismiss: (reason: DismissReason) => void;
  renderTrigger: (ref: RefObject<HTMLButtonElement | null>) => ReactNode;
}

export function BreadcrumbDrop({
  open,
  entries,
  focusFirst,
  checkable,
  onDismiss,
  renderTrigger,
}: BreadcrumbDropProps) {
  const wrap = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open && focusFirst) menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [open, focusFirst]);

  const handleKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])];
    const index = items.findIndex((item) => item === document.activeElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    if (next < 0) return;
    event.preventDefault();
    items[next].focus();
  };

  return (
    <span className="ds-bc__wrap" ref={wrap}>
      {renderTrigger(trigger)}
      <Layer open={open} anchorRef={wrap} onDismiss={onDismiss} gap={6} returnFocusRef={trigger}>
        <ul className="ds-bc__menu" role="menu" ref={menu} onKeyDown={handleKeyDown}>
          {entries.map((entry) => {
            const lead = entry.icon ? (
              <span className="ds-bc__mi-ic" aria-hidden="true">
                {entry.icon}
              </span>
            ) : checkable && entry.selected ? (
              <Icon name="ok" size="sm" />
            ) : (
              <span className="ds-bc__mi-sp" />
            );
            return (
              <li key={entry.key} role="none">
                {entry.href ? (
                  <a role="menuitem" className="ds-bc__mi" href={entry.href} onClick={entry.onPick}>
                    {lead}
                    {entry.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    role="menuitem"
                    className="ds-bc__mi"
                    onClick={entry.onPick}
                  >
                    {lead}
                    {entry.label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </Layer>
    </span>
  );
}

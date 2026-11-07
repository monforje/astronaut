/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx, Icon, Layer, useControlled, useMergedRefs } from "../../ui/internal";

export interface TopbarMenuItem {
  label: string;
  icon?: ReactNode;
  href?: string;
  separatorBefore?: boolean;
  onSelect?: (event: MouseEvent<HTMLElement>) => void;
}

export interface TopbarProfileProps extends Omit<
  ComponentPropsWithRef<"button">,
  "children" | "onSelect"
> {
  avatar: ReactNode;
  menuAvatar?: ReactNode;
  name: string;
  subtitle?: string;
  items: TopbarMenuItem[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function TopbarProfile({
  avatar,
  menuAvatar,
  name,
  subtitle,
  items,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: TopbarProfileProps) {
  const [shown, setShown] = useControlled(open, defaultOpen, onOpenChange);
  const [byUser, setByUser] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const triggerRef = useMergedRefs(trigger, ref);

  const setOpen = (next: boolean) => {
    if (!next) setByUser(false);
    setShown(next);
  };

  useEffect(() => {
    if (shown && byUser) menu.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
  }, [shown, byUser]);

  const menuItems = () => [
    ...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []),
  ];

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (event.key === "ArrowDown" && !shown) {
      event.preventDefault();
      setByUser(true);
      setOpen(true);
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = menuItems();
    const index = list.findIndex((item) => item === document.activeElement);
    let next = -1;
    if (event.key === "ArrowDown") next = (index + 1) % list.length;
    else if (event.key === "ArrowUp") next = (index - 1 + list.length) % list.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = list.length - 1;
    if (next < 0) return;
    event.preventDefault();
    list[next].focus();
  };

  return (
    <span className="ds-top__profwrap" ref={wrap}>
      <button
        type="button"
        aria-label="Профиль"
        {...rest}
        ref={triggerRef}
        className={cx("ds-top__prof", className)}
        aria-haspopup="menu"
        aria-expanded={shown}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          setByUser(true);
          setOpen(!shown);
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        {avatar}
        <span className="ds-top__caret" aria-hidden="true">
          <Icon name="chev" size="sm" />
        </span>
      </button>
      <Layer
        open={shown}
        anchorRef={wrap}
        onDismiss={() => setOpen(false)}
        returnFocusRef={trigger}
        align="end"
        gap={8}
      >
        {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
        <div
          className="ds-top__menu"
          role="menu"
          tabIndex={-1}
          aria-label={name}
          ref={menu}
          onKeyDown={handleMenuKeyDown}
        >
          <div className="ds-top__mh">
            {menuAvatar ?? avatar}
            <span>
              <b>{name}</b>
              {subtitle ? <small>{subtitle}</small> : null}
            </span>
          </div>
          <hr className="ds-top__msep" />
          {items.map((item, i) => {
            const body = (
              <>
                {item.icon ? (
                  <span className="ds-top__mic" aria-hidden="true">
                    {item.icon}
                  </span>
                ) : null}
                {item.label}
              </>
            );
            const pick = (event: MouseEvent<HTMLElement>) => {
              item.onSelect?.(event);
              setOpen(false);
            };
            return (
              <span key={item.label} role="none" className="ds-top__mrow">
                {item.separatorBefore && i > 0 ? <hr className="ds-top__msep" /> : null}
                {item.href ? (
                  <a role="menuitem" className="ds-top__mi" href={item.href} onClick={pick}>
                    {body}
                  </a>
                ) : (
                  <button type="button" role="menuitem" className="ds-top__mi" onClick={pick}>
                    {body}
                  </button>
                )}
              </span>
            );
          })}
        </div>
      </Layer>
    </span>
  );
}

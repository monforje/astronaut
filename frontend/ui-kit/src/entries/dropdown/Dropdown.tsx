/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  Layer,
  cx,
  useControlled,
  useIds,
  useMergedRefs,
  type DismissReason,
} from "../../ui/internal";
import { MenuContext } from "./DropdownItem";
import { DropdownMenu, DropdownTrigger } from "./DropdownParts";
import "./menu.css";

export type DropdownKind = "button" | "icon";
export type DropdownOpenReason = "trigger" | "key" | "select" | "escape" | "tab" | "dismiss";

export interface DropdownProps extends Omit<ComponentPropsWithRef<"div">, "children" | "onSelect"> {
  label: string;
  kind?: DropdownKind;
  triggerLabel?: string;
  end?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, reason: DropdownOpenReason) => void;
  children: ReactNode;
}

export function Dropdown({
  label,
  kind = "button",
  triggerLabel = "Действия",
  end,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...rest
}: DropdownProps) {
  const { menu: menuId } = useIds(["menu"]);
  const [open, setOpenState] = useControlled(openProp, defaultOpen);
  const host = useRef<HTMLDivElement>(null);
  const hostRef = useMergedRefs(host, rest.ref);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const focusOnOpen = useRef<"first" | "last" | null>(null);

  const setOpen = (next: boolean, reason: DropdownOpenReason) => {
    setOpenState(next);
    if (next !== open) onOpenChange?.(next, reason);
  };
  const dismiss = (reason: DismissReason) => {
    focusOnOpen.current = null;
    setOpen(false, reason === "escape" ? "escape" : "dismiss");
  };

  const items = () => [
    ...(menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]:not(:disabled)') ??
      []),
  ];

  useEffect(() => {
    if (!open || !focusOnOpen.current) return;
    const list = items();
    const target = focusOnOpen.current === "last" ? list[list.length - 1] : list[0];
    target?.focus({ preventScroll: true });
    // oxlint-disable-next-line react/exhaustive-effect-dependencies
  }, [open]);

  const openMenu = (reason: DropdownOpenReason, focus: "first" | "last") => {
    focusOnOpen.current = focus;
    setOpen(true, reason);
  };
  const closeMenu = (reason: DropdownOpenReason, returnFocus: boolean) => {
    focusOnOpen.current = null;
    setOpen(false, reason);
    if (returnFocus) trigger.current?.focus();
  };

  const handleMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = items();
    const at = list.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      list[(at + 1) % list.length]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      list[(at - 1 + list.length) % list.length]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      list[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      list[list.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false, "tab");
    }
  };

  const triggerProps = {
    ref: trigger,
    "aria-haspopup": "menu" as const,
    "aria-expanded": open,
    "aria-controls": open ? menuId : undefined,
    onClick: () => {
      if (open) closeMenu("trigger", false);
      else openMenu("trigger", "first");
    },
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (open) return;
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openMenu("key", event.key === "ArrowUp" ? "last" : "first");
      }
    },
  };

  return (
    <div {...rest} ref={hostRef} className={cx("ds-menu__host", className)}>
      <DropdownTrigger {...triggerProps} kind={kind} triggerLabel={triggerLabel} />
      <Layer
        open={open}
        anchorRef={host}
        onDismiss={dismiss}
        returnFocusRef={trigger}
        align={end ? "end" : "start"}
        gap={4}
        scroll
        exclusive
      >
        <MenuContext value={{ closeMenu: () => closeMenu("select", true) }}>
          <DropdownMenu ref={menu} id={menuId} label={label} onKeyDown={handleMenuKey}>
            {children}
          </DropdownMenu>
        </MenuContext>
      </Layer>
    </div>
  );
}

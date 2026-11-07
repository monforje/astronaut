/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx, Icon, useControlled } from "../../ui/internal";
import { Tooltip } from "../tooltip";
import { SidebarLink } from "./SidebarLink";
import type { SidebarGroup, SidebarItem, SidebarToggleProps } from "./sidebar-types";
import "./sidebar.css";

export type { SidebarGroup, SidebarItem, SidebarToggleProps } from "./sidebar-types";

export interface SidebarProps extends Omit<ComponentPropsWithRef<"aside">, "children"> {
  groups: SidebarGroup[];
  footerItems?: SidebarItem[];
  brand?: ReactNode;
  brandMark?: ReactNode;
  navLabel?: string;
  rail?: boolean;
  defaultRail?: boolean;
  onRailChange?: (rail: boolean) => void;
  active?: string;
  defaultActive?: string;
  onActiveChange?: (id: string) => void;
  closedGroups?: string[];
  defaultClosedGroups?: string[];
  onClosedGroupsChange?: (closed: string[]) => void;
  storageKey?: string;
  toggleProps?: SidebarToggleProps;
}

interface Stored {
  rail?: boolean;
  closed?: string[];
}

const NONE: string[] = [];

function readStored(key: string | undefined): Stored {
  if (!key) return {};
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Stored) : {};
  } catch {
    return {};
  }
}

export function Sidebar({
  groups,
  footerItems,
  brand,
  brandMark,
  navLabel = "Разделы",
  rail,
  defaultRail = false,
  onRailChange,
  active,
  defaultActive,
  onActiveChange,
  closedGroups,
  defaultClosedGroups = NONE,
  onClosedGroupsChange,
  storageKey,
  toggleProps,
  className,
  onKeyDown,
  ref,
  ...rest
}: SidebarProps) {
  const [stored] = useState(() => readStored(storageKey));
  const [isRail, setIsRail] = useControlled(rail, stored.rail ?? defaultRail, onRailChange);
  const [current, setCurrent] = useControlled(active, defaultActive);
  const [closed, setClosed] = useControlled(
    closedGroups,
    stored.closed ?? defaultClosedGroups,
    onClosedGroupsChange,
  );
  const [tipKey, setTipKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ rail: isRail, closed }));
    } catch {
      return;
    }
  }, [storageKey, isRail, closed]);

  const setRail = (next: boolean) => {
    setTipKey(null);
    setIsRail(next);
  };
  const activate = (id: string) => {
    setCurrent(id);
    onActiveChange?.(id);
  };
  const tipProps = (key: string) => ({
    side: "right" as const,
    open: isRail && tipKey === key,
    onOpenChange: (open: boolean) =>
      setTipKey((previous) => (open ? key : previous === key ? null : previous)),
  });

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (!event.defaultPrevented && event.ctrlKey && event.key === "\\") {
      event.preventDefault();
      setRail(!isRail);
    }
  };

  const toggleLabel = isRail ? "Развернуть панель" : "Свернуть панель";

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <aside
      {...rest}
      ref={ref}
      className={cx("ds-side", className)}
      data-rail={isRail || undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="ds-side__brand">
        {brand ? <div className="ds-side__logo">{brand}</div> : null}
        {brandMark ? <div className="ds-side__mark">{brandMark}</div> : null}
        <Tooltip
          {...tipProps("toggle")}
          content="Развернуть"
          kbd={"Ctrl+\\"}
          className="ds-side__trigger-tip"
        >
          <button
            type="button"
            {...toggleProps}
            className={cx("ds-side__trigger", toggleProps?.className)}
            aria-label={toggleLabel}
            onClick={() => setRail(!isRail)}
          >
            <Icon name={isRail ? "po" : "pl"} />
          </button>
        </Tooltip>
      </div>
      <nav className="ds-side__nav" aria-label={navLabel}>
        <button
          type="button"
          className="ds-side__edge"
          aria-label="Развернуть панель"
          tabIndex={isRail ? 0 : -1}
          onClick={() => setRail(false)}
        />
        <div className="ds-side__scroll">
          {groups.map(({ id, title, icon, items, className: groupClass, ...groupRest }) => {
            const isClosed = closed.includes(id);
            const open = !isClosed && !isRail;
            return (
              <section
                {...groupRest}
                key={id}
                className={cx("ds-side__group", groupClass)}
                data-closed={isClosed || undefined}
              >
                <Tooltip {...tipProps(`group:${id}`)} content={title} className="ds-side__gt-tip">
                  <button
                    type="button"
                    className="ds-side__gt"
                    data-gid={id}
                    data-cur={items.some((item) => item.id === current) || undefined}
                    aria-expanded={open}
                    aria-label={title}
                    onClick={() => {
                      if (isRail) setRail(false);
                      else setClosed(isClosed ? closed.filter((x) => x !== id) : [...closed, id]);
                    }}
                  >
                    <span className="ds-side__glyph" aria-hidden="true">
                      {icon}
                    </span>
                    <span className="ds-side__gl">{title}</span>
                    <span className="ds-side__chev" aria-hidden="true">
                      <Icon name="chev" size="xs" />
                    </span>
                  </button>
                </Tooltip>
                <div className="ds-side__collapse">
                  <div className="ds-side__list" inert={!open}>
                    {items.map((item) => (
                      <SidebarLink
                        key={item.id}
                        item={item}
                        current={current === item.id}
                        onActivate={activate}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </div>
        {footerItems?.length ? (
          <div className="ds-side__foot">
            {footerItems.map((item) => (
              <SidebarLink
                key={item.id}
                item={item}
                current={current === item.id}
                onActivate={activate}
              />
            ))}
          </div>
        ) : null}
      </nav>
    </aside>
  );
}

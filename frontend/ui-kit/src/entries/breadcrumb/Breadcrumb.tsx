/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useState,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx, Icon, useControlled } from "../../ui/internal";
import { BreadcrumbDrop } from "./BreadcrumbMenu";
import "./breadcrumb.css";

export type BreadcrumbSize = "md" | "sm";
export type BreadcrumbMenuKey = "ellipsis" | number;

export interface BreadcrumbItem extends Omit<
  HTMLAttributes<HTMLElement>,
  "onClick" | "onSelect" | "children"
> {
  [attribute: `data-${string}`]: string | undefined;
  label: string;
  href?: string;
  icon?: ReactNode;
  menu?: string[];
  disabled?: boolean;
  loading?: boolean;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  onSelect?: (option: string) => void;
}

export interface BreadcrumbProps extends Omit<ComponentPropsWithRef<"nav">, "children"> {
  items: BreadcrumbItem[];
  max?: number;
  size?: BreadcrumbSize;
  openMenu?: BreadcrumbMenuKey | null;
  onOpenMenuChange?: (menu: BreadcrumbMenuKey | null) => void;
}

const ELLIPSIS = -1;

export function Breadcrumb({
  items,
  max = 4,
  size = "md",
  openMenu,
  onOpenMenuChange,
  className,
  ref,
  "aria-label": ariaLabel = "Хлебные крошки",
  ...rest
}: BreadcrumbProps) {
  const [open, setMenu] = useControlled<BreadcrumbMenuKey | null>(openMenu, null, onOpenMenuChange);
  const [byUser, setByUser] = useState(false);
  const [picked, setPicked] = useState<Record<number, string>>({});

  const setOpen = (next: BreadcrumbMenuKey | null) => {
    if (next === null) setByUser(false);
    setMenu(next);
  };
  const toggle = (key: BreadcrumbMenuKey) => {
    setByUser(true);
    setOpen(open === key ? null : key);
  };

  const collapse = items.length > max && max >= 2;
  const tail = max - 2;
  const hidden = collapse ? items.slice(1, items.length - tail) : [];
  const indexes = collapse
    ? [0, ELLIPSIS, ...items.map((_, i) => i).slice(items.length - tail)]
    : items.map((_, i) => i);

  const renderBody = (item: BreadcrumbItem, i: number) => {
    const {
      label: itemLabel,
      href,
      icon,
      menu,
      disabled,
      loading,
      onClick,
      onSelect,
      ...attrs
    } = item;
    const last = i === items.length - 1;
    const label = picked[i] ?? itemLabel;
    const inner = (
      <>
        {icon ? (
          <span className="ds-bc__ic" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {loading ? (
          <span className="ds-bc__sk" role="img" aria-label="загрузка" />
        ) : (
          <span className="ds-bc__t">{label}</span>
        )}
      </>
    );
    if (menu) {
      return (
        <BreadcrumbDrop
          open={open === i}
          focusFirst={byUser}
          checkable
          onDismiss={() => setOpen(null)}
          renderTrigger={(trigger) => (
            <button
              type="button"
              {...attrs}
              ref={trigger}
              className="ds-bc__bs"
              aria-haspopup="menu"
              aria-expanded={open === i}
              aria-current={last ? "page" : undefined}
              onClick={() => toggle(i)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && open !== i) {
                  event.preventDefault();
                  toggle(i);
                }
              }}
            >
              {inner}
              <Icon name="chev" size="xs" />
            </button>
          )}
          entries={menu.map((option) => ({
            key: option,
            label: option,
            selected: option === label,
            onPick: () => {
              setPicked((p) => ({ ...p, [i]: option }));
              onSelect?.(option);
              setOpen(null);
            },
          }))}
        />
      );
    }
    if (last) {
      return (
        <span {...attrs} className="ds-bc__bs ds-bc__bs--cur" aria-current="page">
          {inner}
        </span>
      );
    }
    if (disabled) {
      return (
        <span {...attrs} className="ds-bc__bs ds-bc__bs--off" aria-disabled="true">
          {inner}
        </span>
      );
    }
    return href ? (
      <a {...attrs} href={href} className="ds-bc__a" onClick={onClick}>
        {inner}
      </a>
    ) : (
      <button type="button" {...attrs} className="ds-bc__a" onClick={onClick}>
        {inner}
      </button>
    );
  };

  return (
    <nav {...rest} aria-label={ariaLabel} className={cx("ds-bc-nav", className)} ref={ref}>
      <ol className={cx("ds-bc", size === "sm" && "ds-bc--sm")}>
        {indexes.map((i, k) => {
          const last = i === items.length - 1;
          return (
            <li
              key={i === ELLIPSIS ? "ellipsis" : `${i}-${items[i].label}`}
              className="ds-bc__li"
              data-last={last || undefined}
            >
              {k ? (
                <span className="ds-bc__sep" aria-hidden="true">
                  <Icon name="chevr" size="xs" />
                </span>
              ) : null}
              {i === ELLIPSIS ? (
                <BreadcrumbDrop
                  open={open === "ellipsis"}
                  focusFirst={byUser}
                  onDismiss={() => setOpen(null)}
                  renderTrigger={(trigger) => (
                    <button
                      type="button"
                      ref={trigger}
                      className="ds-bc__bs"
                      aria-haspopup="menu"
                      aria-expanded={open === "ellipsis"}
                      aria-label="Скрытые разделы"
                      onClick={() => toggle("ellipsis")}
                      onKeyDown={(event) => {
                        if (event.key === "ArrowDown" && open !== "ellipsis") {
                          event.preventDefault();
                          toggle("ellipsis");
                        }
                      }}
                    >
                      <Icon name="more" size="sm" />
                    </button>
                  )}
                  entries={hidden.map((h, hi) => ({
                    key: `${hi}-${h.label}`,
                    label: h.label,
                    icon: h.icon,
                    href: h.href,
                    onPick: (event) => {
                      h.onClick?.(event);
                      setOpen(null);
                    },
                  }))}
                />
              ) : (
                renderBody(items[i], i)
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

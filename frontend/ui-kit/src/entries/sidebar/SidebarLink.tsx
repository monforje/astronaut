/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { MouseEvent } from "react";
import { cx } from "../../ui/internal";
import type { SidebarItem } from "./sidebar-types";

export function SidebarLink({
  item,
  current,
  onActivate,
}: {
  item: SidebarItem;
  current: boolean;
  onActivate: (id: string) => void;
}) {
  const { id, label, icon, href, count, tone, dot, disabled, onClick, className, ...rest } = item;
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (!href) event.preventDefault();
    onActivate(id);
  };
  return (
    <a
      {...rest}
      href={href ?? `#${id}`}
      className={cx("ds-side__item", className)}
      aria-current={current ? "page" : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : undefined}
      onClick={handleClick}
    >
      {icon ? (
        <span className="ds-side__ic" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="ds-side__il">{label}</span>
      {count === "loading" ? (
        <span className="ds-side__cnt ds-side__cnt--load" role="img" aria-label="загрузка" />
      ) : count !== undefined ? (
        <span className="ds-side__cnt" data-tone={tone}>
          {count}
        </span>
      ) : dot ? (
        <span className="ds-side__dot" role="img" aria-label="требует внимания" />
      ) : null}
    </a>
  );
}

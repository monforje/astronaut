/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import {
  useEffect,
  useRef,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cx, Icon, useMergedRefs } from "../../ui/internal";
import "./topbar.css";

export type TopbarSearchHotkey = "topbar" | "global" | false;

export interface TopbarCrumb {
  label: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface TopbarProps extends Omit<ComponentPropsWithRef<"header">, "children"> {
  crumbs?: TopbarCrumb[];
  crumbsLabel?: string;
  start?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  searchHotkey?: TopbarSearchHotkey;
}

const HOTKEY_SELECTOR = '[aria-keyshortcuts~="Control+K"]';

function isSearchHotkey(event: { ctrlKey: boolean; metaKey: boolean; key: string }): boolean {
  return (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
}

export function Topbar({
  crumbs,
  crumbsLabel = "Навигация",
  start,
  search,
  actions,
  searchHotkey = "topbar",
  className,
  onKeyDown,
  ref,
  ...rest
}: TopbarProps) {
  const header = useRef<HTMLElement | null>(null);
  const headerRef = useMergedRefs(header, ref);

  const focusSearch = (): boolean => {
    const input = header.current?.querySelector<HTMLInputElement>(HOTKEY_SELECTOR);
    input?.focus();
    return !!input;
  };

  useEffect(() => {
    if (searchHotkey !== "global") return;
    const handle = (event: globalThis.KeyboardEvent) => {
      if (!isSearchHotkey(event)) return;
      const input = header.current?.querySelector<HTMLInputElement>(HOTKEY_SELECTOR);
      if (!input) return;
      event.preventDefault();
      input.focus();
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [searchHotkey]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || searchHotkey !== "topbar") return;
    if (isSearchHotkey(event) && focusSearch()) event.preventDefault();
  };

  const left =
    start ??
    (crumbs?.length ? (
      <nav className="ds-top__crumbs" aria-label={crumbsLabel}>
        {crumbs.map((crumb, i) => {
          const last = i === crumbs.length - 1;
          return (
            <span className="ds-top__c" key={crumb.label} data-last={last || undefined}>
              {i > 0 ? (
                <i className="ds-top__sl" aria-hidden="true">
                  <Icon name="chevr" size="xs" />
                </i>
              ) : null}
              {last ? (
                <span aria-current="page">{crumb.label}</span>
              ) : crumb.href ? (
                <a href={crumb.href} onClick={crumb.onClick}>
                  {crumb.label}
                </a>
              ) : (
                <button type="button" className="ds-top__cb" onClick={crumb.onClick}>
                  {crumb.label}
                </button>
              )}
            </span>
          );
        })}
      </nav>
    ) : (
      <span />
    ));

  return (
    <div className="ds-top-host">
      {/* oxlint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <header
        {...rest}
        ref={headerRef}
        className={cx("ds-top", className)}
        onKeyDown={handleKeyDown}
      >
        {left}
        {search ? (
          <div className="ds-top__center" role="search">
            {search}
          </div>
        ) : null}
        {actions ? <div className="ds-top__end">{actions}</div> : <div className="ds-top__end" />}
      </header>
    </div>
  );
}

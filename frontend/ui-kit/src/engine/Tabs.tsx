/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useRef, type KeyboardEvent } from "react";
import { TABS, type Tab } from "./route";

export const tabId = (page: string, tab: Tab) => `tab-${page}-${tab}`;
export const panelId = (page: string, tab: Tab) => `panel-${page}-${tab}`;

export function Tabs({
  page,
  tabs,
  active,
  onSelect,
}: {
  page: string;
  tabs: Tab[];
  active: Tab;
  onSelect: (tab: Tab) => void;
}) {
  const refs = useRef(new Map<Tab, HTMLButtonElement>());
  const items = TABS.filter((t) => tabs.includes(t.id));

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((t) => t.id === active);
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % items.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const target = items[next].id;
    refs.current.get(target)?.focus();
    onSelect(target);
  };

  return (
    // oxlint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      className="dx-tabs"
      role="tablist"
      aria-label="Разделы страницы компонента"
      onKeyDown={onKeyDown}
    >
      {items.map((t) => (
        <button
          key={t.id}
          ref={(el) => {
            if (el) refs.current.set(t.id, el);
            else refs.current.delete(t.id);
          }}
          type="button"
          role="tab"
          className="dx-tab"
          id={tabId(page, t.id)}
          aria-selected={t.id === active}
          aria-controls={panelId(page, t.id)}
          tabIndex={t.id === active ? 0 : -1}
          onClick={() => onSelect(t.id)}
        >
          <b>{t.label}</b>
          <small>{t.hint}</small>
        </button>
      ))}
    </div>
  );
}

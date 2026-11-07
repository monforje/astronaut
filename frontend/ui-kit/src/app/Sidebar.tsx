/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Icon } from "@/engine/Icon";
import { hasComponentTab } from "@/engine/readme";
import { entryById, groupsWithEntries, searchEntries, type Entry } from "@/engine/registry";
import { entryPath, readLastTab } from "@/engine/route";

const SCROLL_PAD = 8;

function itemPath(e: Entry): string {
  const tab = e.doc && hasComponentTab(e.doc) ? readLastTab() : "spec";
  return entryPath(e.id, tab);
}

export function Sidebar({ onNavigate }: { onNavigate: () => void }) {
  const id = useLocation().pathname.split("/")[1];
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const found = useMemo(() => searchEntries(query), [query]);
  const groups = useMemo(() => groupsWithEntries(found), [found]);
  const searching = query.trim() !== "";
  const currentGroup = entryById(id)?.group;

  useLayoutEffect(() => {
    const box = list.current;
    const active = box?.querySelector<HTMLElement>("[aria-current=page]");
    if (!box || !active) return;
    const outer = box.getBoundingClientRect();
    const inner = active.getBoundingClientRect();
    if (inner.top < outer.top) box.scrollTop -= outer.top - inner.top + SCROLL_PAD;
    else if (inner.bottom > outer.bottom) box.scrollTop += inner.bottom - outer.bottom + SCROLL_PAD;
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
        input.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggle = (g: string) =>
    setClosed((s) => {
      const n = new Set(s);
      if (n.has(g)) n.delete(g);
      else n.add(g);
      return n;
    });

  return (
    <nav className="dx-sidebar" aria-label="Компоненты">
      <div className="dx-search">
        <Icon name="search" size="sm" />
        <input
          ref={input}
          type="search"
          value={query}
          placeholder="Найти компонент"
          aria-label="Поиск по компонентам"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape" && query !== "") {
              e.stopPropagation();
              setQuery("");
            } else if (e.key === "Escape") {
              input.current?.blur();
            }
            if (e.key === "Enter" && found[0]) {
              navigate(itemPath(found[0]));
              onNavigate();
            }
          }}
        />
        <kbd className="dx-kbd">Ctrl K</kbd>
      </div>
      <div className="dx-sidebar__list" ref={list}>
        {groups.length === 0 ? <p className="dx-sidebar__empty">Ничего не найдено</p> : null}
        {groups.map((g) => {
          const open = searching || !closed.has(g.id) || g.id === currentGroup;
          return (
            <div className="dx-group" key={g.id} data-closed={!open || undefined}>
              <button
                type="button"
                className="dx-group__title"
                aria-expanded={open}
                onClick={() => toggle(g.id)}
              >
                <span>{g.title}</span>
                <Icon name="chev" size="xs" />
              </button>
              <ul className="dx-group__list">
                {g.items.map((e) => (
                  <li key={e.id}>
                    <Link
                      to={itemPath(e)}
                      className="dx-item"
                      aria-current={e.id === id ? "page" : undefined}
                      data-soon={e.doc ? undefined : true}
                      onClick={onNavigate}
                    >
                      <span>{e.title}</span>
                      {e.doc ? null : <em className="dx-soon">скоро</em>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

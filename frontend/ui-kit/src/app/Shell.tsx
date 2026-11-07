/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useEffect, useRef, useState } from "react";
import { Link, Outlet } from "react-router";
import { Icon } from "@/engine/Icon";
import { entries } from "@/engine/registry";
import { useTheme } from "@/engine/theme";
import { Sidebar } from "./Sidebar";

export function Shell() {
  const [theme, toggleTheme] = useTheme();
  const [menu, setMenu] = useState(false);
  const ready = entries.filter((e) => e.doc).length;
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <div className="dx-app" data-menu={menu || undefined}>
      <a className="dx-skip" href="#main">
        К содержимому
      </a>
      <header className="dx-topbar">
        <button
          ref={menuButton}
          type="button"
          className="dx-btn dx-btn--ghost dx-btn--sq dx-topbar__menu"
          aria-label="Меню компонентов"
          aria-expanded={menu}
          onClick={() => setMenu((m) => !m)}
        >
          <Icon name="list" />
        </button>
        <Link to="/" className="dx-logo" onClick={() => setMenu(false)}>
          <img src="/brand/logo-mark.svg" alt="" width={24} height={24} />
          <b>Astronaut</b>
          <span>Дизайн-система</span>
        </Link>
        <span className="dx-topbar__grow" />
        <span className="dx-topbar__stat dx-num">
          {ready === entries.length ? `${ready} страниц` : `${ready} из ${entries.length} страниц`}
        </span>
        <button
          type="button"
          className="dx-btn dx-btn--ghost dx-btn--sq"
          aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
          onClick={toggleTheme}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </button>
      </header>
      <aside className="dx-side">
        <Sidebar onNavigate={() => setMenu(false)} />
      </aside>
      <button
        type="button"
        className="dx-scrim"
        aria-label="Закрыть меню"
        onClick={() => setMenu(false)}
      />
      <main className="dx-content" id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}

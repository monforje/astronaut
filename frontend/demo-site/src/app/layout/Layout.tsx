import { Outlet, ScrollRestoration } from "react-router";
import styles from "./Layout.module.css";

/** Общая раскладка страниц. Шапку, подвал и навигацию добавляют виджетами (`widgets/`). */
export function Layout() {
  return (
    <div className={styles.shell}>
      <a href="#content" className="skip-link">
        К содержимому
      </a>
      <main id="content" className={styles.main} tabIndex={-1}>
        <Outlet />
      </main>
      <ScrollRestoration />
    </div>
  );
}

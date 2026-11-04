import { Outlet, ScrollRestoration } from "react-router";

/** Общая раскладка страниц. Шапку, подвал и навигацию добавляют виджетами (`widgets/`). */
export function Layout() {
  return (
    <>
      <main id="content">
        <Outlet />
      </main>
      <ScrollRestoration />
    </>
  );
}

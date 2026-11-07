import { Outlet } from "react-router";
import { AppFrame } from "@/widgets/app-shell";

/** Общая раскладка страниц: оболочка на ките (сайдбар, топбар с крошками), страница — в области контента. */
export function Layout() {
  return (
    <AppFrame>
      <Outlet />
    </AppFrame>
  );
}

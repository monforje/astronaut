import type { IconName } from "@astronaut/ui-kit";

export interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
}

export interface NavGroup {
  id: string;
  title: string;
  icon: IconName;
  items: NavItem[];
}

/**
 * Навигация сайдбара — по существующим маршрутам (`app/routes`). Экраны из DESIGN.md (груз, расхождения,
 * подключения) появятся здесь вместе со своими страницами.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    title: "Разделы",
    icon: "layout",
    items: [{ id: "home", label: "Главная", icon: "layout", href: "/" }],
  },
];

/** Пункт, чей адрес совпал с текущим: корень — только точно, остальные — и вложенные страницы. */
export function activeNavId(pathname: string): string {
  const items = NAV_GROUPS.flatMap((group) => group.items);
  const found = items.find((item) =>
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  return found?.id ?? "";
}

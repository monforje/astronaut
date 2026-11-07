/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, HTMLAttributes, MouseEvent, ReactNode } from "react";

export interface SidebarItem extends Omit<
  HTMLAttributes<HTMLAnchorElement>,
  "children" | "onClick"
> {
  [attribute: `data-${string}`]: string | undefined;
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  count?: number | "loading";
  tone?: "err";
  dot?: boolean;
  disabled?: boolean;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export interface SidebarGroup extends Omit<HTMLAttributes<HTMLElement>, "title" | "children"> {
  [attribute: `data-${string}`]: string | undefined;
  id: string;
  title: string;
  icon: ReactNode;
  items: SidebarItem[];
}

export type SidebarToggleProps = Omit<ComponentPropsWithRef<"button">, "children"> & {
  [attribute: `data-${string}`]: string | undefined;
};

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cx } from "../../ui/internal";
import "./app-shell.css";

export type AppShellContentProps = Omit<ComponentPropsWithRef<"main">, "children"> & {
  [attribute: `data-${string}`]: string | undefined;
};

export interface AppShellProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  brand?: ReactNode;
  sidebar?: ReactNode;
  topbar?: ReactNode;
  rail?: boolean;
  narrow?: boolean;
  responsive?: boolean;
  contentProps?: AppShellContentProps;
  children?: ReactNode;
}

export function AppShell({
  brand,
  sidebar,
  topbar,
  rail,
  narrow,
  responsive = true,
  contentProps,
  className,
  children,
  ...rest
}: AppShellProps) {
  return (
    <div
      {...rest}
      className={cx("ds-shell", className)}
      data-rail={rail || undefined}
      data-narrow={narrow || undefined}
      data-responsive={responsive || undefined}
      data-brand={brand ? "" : undefined}
    >
      {brand ? <div className="ds-shell__brand">{brand}</div> : null}
      {topbar ? <div className="ds-shell__top">{topbar}</div> : null}
      {sidebar ? <div className="ds-shell__side">{sidebar}</div> : null}
      <main {...contentProps} className={cx("ds-shell__content", contentProps?.className)}>
        {children}
      </main>
    </div>
  );
}

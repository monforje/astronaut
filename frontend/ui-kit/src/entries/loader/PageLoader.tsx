/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import { useState, type ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { Loader } from "./Loader";
import "./loader.css";

export interface PageLoaderProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  open: boolean;
  label?: string;
  hint?: string;
  fixed?: boolean;
}

export function PageLoader({
  open,
  label = "Загружаем рабочее пространство",
  hint,
  fixed,
  className,
  ...rest
}: PageLoaderProps) {
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);
  const state = open ? "in" : shown ? "out" : "off";
  return (
    <div
      {...rest}
      className={cx("ds-loader-page", fixed && "ds-loader-page--fixed", className)}
      data-state={state}
      inert={!open || undefined}
      aria-hidden={open ? undefined : true}
    >
      <Loader size="page" fill label={label} hint={hint} />
    </div>
  );
}

/** © 2026 Komarov Zhiznev Group. Все права защищены. Копирование и передача запрещены. См. LICENSE */
import type { ComponentPropsWithRef } from "react";
import { cx } from "../../ui/internal";
import { Spinner } from "../spinner/Spinner";
import "./loader.css";

export interface BusyOverlayProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  label?: string;
}

export function BusyOverlay({ label = "Обновляем…", className, ...rest }: BusyOverlayProps) {
  return (
    <div role="status" {...rest} className={cx("ds-loader-busy__ov", className)}>
      <Spinner size="xl" tone="accent" />
      {label}
    </div>
  );
}
